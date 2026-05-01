const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');

/**
 * POST /tasks
 * Admin creates a task and assigns it to a user in a project.
 */
const createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, assignedTo, projectId, dueDate } = req.body;

  try {
    // Verify the project exists and belongs to this admin
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project creator can add tasks' });
    }

    // Ensure assignedTo is a member of the project
    const isMember = project.members
      .map((m) => m.toString())
      .includes(assignedTo);

    if (!isMember) {
      return res.status(400).json({ message: 'Assigned user is not a project member' });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      projectId,
      dueDate,
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('projectId', 'name');

    res.status(201).json({ message: 'Task created', task });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * GET /tasks
 * Admin sees all tasks for their projects; Members see only their assigned tasks.
 */
const getTasks = async (req, res) => {
  try {
    let tasks;
    const { projectId } = req.query;

    if (req.user.role === 'ADMIN') {
      // Get all projects created by this admin
      const adminProjects = await Project.find({ createdBy: req.user._id }).select('_id');
      const projectIds = adminProjects.map((p) => p._id);

      const filter = { projectId: { $in: projectIds } };
      if (projectId) filter.projectId = projectId;

      tasks = await Task.find(filter)
        .populate('assignedTo', 'name email')
        .populate('projectId', 'name')
        .sort({ createdAt: -1 });
    } else {
      // Member: see only tasks assigned to them
      const filter = { assignedTo: req.user._id };
      if (projectId) filter.projectId = projectId;

      tasks = await Task.find(filter)
        .populate('assignedTo', 'name email')
        .populate('projectId', 'name')
        .sort({ createdAt: -1 });
    }

    res.status(200).json({ count: tasks.length, tasks });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * PUT /tasks/:id
 * Update task status. Admin can update any field; Members can only update status.
 */
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'MEMBER') {
      // Members can only update status of tasks assigned to them
      if (task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You can only update your own tasks' });
      }

      const { status } = req.body;
      if (status) {
        const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ message: 'Invalid status value' });
        }
        task.status = status;
      }
    } else {
      // Admin can update all fields
      const { title, description, status, assignedTo, dueDate } = req.body;
      if (title) task.title = title;
      if (description) task.description = description;
      if (status) task.status = status;
      if (assignedTo) task.assignedTo = assignedTo;
      if (dueDate) task.dueDate = dueDate;
    }

    const updated = await task.save();
    await updated.populate('assignedTo', 'name email');
    await updated.populate('projectId', 'name');

    res.status(200).json({ message: 'Task updated', task: updated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * DELETE /tasks/:id
 * Admin deletes a task (only from projects they created).
 */
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('projectId');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify the admin owns the project this task belongs to
    if (task.projectId.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask };

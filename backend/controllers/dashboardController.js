const Task = require('../models/Task');
const Project = require('../models/Project');

/**
 * GET /dashboard
 * Returns summary stats: total tasks, completed tasks, overdue tasks.
 * Admin sees stats for all their projects; Members see their personal stats.
 */
const getDashboard = async (req, res) => {
  try {
    const now = new Date();
    let taskFilter = {};

    if (req.user.role === 'ADMIN') {
      // Get all project IDs created by this admin
      const adminProjects = await Project.find({ createdBy: req.user._id }).select('_id name');
      const projectIds = adminProjects.map((p) => p._id);
      taskFilter = { projectId: { $in: projectIds } };

      const totalTasks = await Task.countDocuments(taskFilter);
      const completedTasks = await Task.countDocuments({ ...taskFilter, status: 'DONE' });
      const inProgressTasks = await Task.countDocuments({ ...taskFilter, status: 'IN_PROGRESS' });
      const todoTasks = await Task.countDocuments({ ...taskFilter, status: 'TODO' });

      // Overdue: dueDate is in the past and task is not DONE
      const overdueTasks = await Task.countDocuments({
        ...taskFilter,
        dueDate: { $lt: now },
        status: { $ne: 'DONE' },
      });

      // Recent tasks (last 5)
      const recentTasks = await Task.find(taskFilter)
        .populate('assignedTo', 'name email')
        .populate('projectId', 'name')
        .sort({ createdAt: -1 })
        .limit(5);

      return res.status(200).json({
        role: req.user.role,
        stats: {
          totalProjects: adminProjects.length,
          totalTasks,
          completedTasks,
          inProgressTasks,
          todoTasks,
          overdueTasks,
        },
        recentTasks,
        projects: adminProjects,
      });
    } else {
      // Member: personal task stats
      taskFilter = { assignedTo: req.user._id };

      const totalTasks = await Task.countDocuments(taskFilter);
      const completedTasks = await Task.countDocuments({ ...taskFilter, status: 'DONE' });
      const inProgressTasks = await Task.countDocuments({ ...taskFilter, status: 'IN_PROGRESS' });
      const todoTasks = await Task.countDocuments({ ...taskFilter, status: 'TODO' });

      const overdueTasks = await Task.countDocuments({
        ...taskFilter,
        dueDate: { $lt: now },
        status: { $ne: 'DONE' },
      });

      const recentTasks = await Task.find(taskFilter)
        .populate('projectId', 'name')
        .sort({ createdAt: -1 })
        .limit(5);

      return res.status(200).json({
        role: req.user.role,
        stats: {
          totalTasks,
          completedTasks,
          inProgressTasks,
          todoTasks,
          overdueTasks,
        },
        recentTasks,
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getDashboard };

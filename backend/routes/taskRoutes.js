const express = require('express');
const { body } = require('express-validator');
const { createTask, getTasks, updateTask, deleteTask } = require('../controllers/taskController');
const { protect, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('assignedTo').notEmpty().withMessage('Assigned user is required'),
  body('projectId').notEmpty().withMessage('Project ID is required'),
];

// All routes require authentication
router.use(protect);

router.post('/', authorizeRoles('ADMIN'), taskValidation, createTask);
router.get('/', getTasks);
router.put('/:id', updateTask);
router.delete('/:id', authorizeRoles('ADMIN'), deleteTask);

module.exports = router;

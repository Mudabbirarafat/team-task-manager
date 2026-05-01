const express = require('express');
const { body } = require('express-validator');
const {
  createProject,
  getProjects,
  getProjectById,
  addMember,
  getAllUsers,
} = require('../controllers/projectController');
const { protect, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

const projectValidation = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
];

// All routes require authentication
router.use(protect);

router.get('/users', authorizeRoles('ADMIN'), getAllUsers);
router.post('/', authorizeRoles('ADMIN'), projectValidation, createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/:id/members', authorizeRoles('ADMIN'), addMember);

module.exports = router;

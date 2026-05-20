const express = require('express');
const router = express.Router();
const { 
  createProject, 
  getProjects, 
  updateProject, 
  deleteProject 
} = require('../controllers/projectController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Why this file exists: To map project-related HTTP requests to projectController functions.
// We secure these routes:
// - All routes require a valid logged-in user (using 'protect')
// - Modifying routes (POST, PUT, DELETE) require the user to be an Admin (using 'adminOnly')

router.route('/')
  .get(protect, getProjects) // GET /api/projects - Both Admins and Members can read (filtered inside controller)
  .post(protect, adminOnly, createProject); // POST /api/projects - Only Admins can create

router.route('/:id')
  .put(protect, adminOnly, updateProject) // PUT /api/projects/:id - Only Admins can edit
  .delete(protect, adminOnly, deleteProject); // DELETE /api/projects/:id - Only Admins can delete

module.exports = router;

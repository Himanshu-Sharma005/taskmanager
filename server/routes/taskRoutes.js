const express = require('express');
const router = express.Router();
const { 
  createTask, 
  getTasks, 
  updateTask, 
  deleteTask 
} = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Why this file exists: To map task-related HTTP requests to taskController functions.
// We secure these routes:
// - All routes require a valid logged-in user (using 'protect')
// - Creating (POST) and deleting (DELETE) tasks require Admin role (using 'adminOnly')
// - Reading (GET) is allowed for both (filtered inside the controller)
// - Updating (PUT) is allowed for both because Members can update status, while Admins can update everything (enforced inside controller)

router.route('/')
  .get(protect, getTasks) // GET /api/tasks
  .post(protect, adminOnly, createTask); // POST /api/tasks

router.route('/:id')
  .put(protect, updateTask) // PUT /api/tasks/:id - Allowed for both, details handled inside controller!
  .delete(protect, adminOnly, deleteTask); // DELETE /api/tasks/:id - Only Admins

module.exports = router;

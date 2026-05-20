const express = require('express');
const router = express.Router();
const { signup, login, getProfile, getUsers } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Why this file exists: To map URL paths (like /signup, /login) to the logic inside our authController.js.
// This keeps our API routes clean and organized.

// Route for user signup: POST request to /api/auth/signup
router.post('/signup', signup);

// Route for user login: POST request to /api/auth/login
router.post('/login', login);

// Route to get the current user's profile: GET request to /api/auth/profile
// Note: We pass 'protect' first! It verifies the user's JWT before running 'getProfile'.
router.get('/profile', protect, getProfile);

// Route to fetch all team members for project/task assignment: GET request to /api/auth/users
router.get('/users', protect, getUsers);

module.exports = router;


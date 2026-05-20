const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to generate a JSON Web Token
// Why it exists: To bundle user details (ID) in an encrypted token that the client can store and send with future requests.
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_key_123_change_me', {
    expiresIn: '30d' // The token is valid for 30 days
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validation: Ensure all fields are filled
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    // 2. Check if user already exists in the database
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // 2b. Enforce single-admin rule: check if an admin already exists if role is 'admin'
    if (role === 'admin') {
      const adminExists = await User.findOne({ role: 'admin' });
      if (adminExists) {
        return res.status(400).json({ message: 'An administrator account already exists. Only one admin is allowed.' });
      }
    }

    // 3. Create the user
    // Note: The password will be hashed automatically by our pre-save hook in User.js!
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'member' // If no role is specified, default to 'member'
    });

    // 4. Send back success response with the JWT token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error during signup: ' + error.message });
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation: Ensure both fields are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    // 2. Find the user in the database
    const user = await User.findOne({ email });

    // 3. Verify user exists and compare passwords
    // We call our custom schema method 'comparePassword' defined in User.js
    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      // 401 Unauthorized is returned for incorrect credentials
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error during login: ' + error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private (Needs JWT protect middleware)
const getProfile = async (req, res) => {
  try {
    // Since this is a protected route, req.user is already loaded by our protect middleware.
    // We just return req.user back to the frontend.
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching profile: ' + error.message });
  }
};

// @desc    Get all registered team members
// @route   GET /api/auth/users
// @access  Private (Needs JWT protect middleware)
const getUsers = async (req, res) => {
  try {
    // We only fetch users with the 'member' role and select their _id, name, and email
    const users = await User.find({ role: 'member' }).select('name email');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching users: ' + error.message });
  }
};

module.exports = {
  signup,
  login,
  getProfile,
  getUsers
};


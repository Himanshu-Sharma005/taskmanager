const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Why this middleware exists: To verify if the client has sent a valid JWT (JSON Web Token) in their headers.
// If valid, we allow them to access the route. If not, we block them.
const protect = async (req, res, next) => {
  let token;

  // Standard API practice: JWT is sent in the 'Authorization' header as 'Bearer <TOKEN>'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 1. Extract the token from the header (split by space to remove 'Bearer' and get the token string)
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify the token using our secret key. This decodes the user ID encrypted inside the token.
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_123_change_me');

      // 3. Find the user in the database using the decoded ID.
      // We use .select('-password') so we don't leak the hashed password in our request object!
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // 4. Everything is good! Call next() to proceed to the controller function.
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token verification failed' });
    }
  }

  // If no token was found in the header
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// Why this middleware exists: To restrict access only to users with the 'admin' role.
// It runs AFTER the 'protect' middleware, meaning we already have 'req.user' loaded.
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // User is Admin! Proceed to controller.
  } else {
    // 403 Forbidden means we know who you are, but you do not have permission to do this.
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
};

module.exports = { protect, adminOnly };

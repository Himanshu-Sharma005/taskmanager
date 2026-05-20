const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Import our Route Files
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');

// Why this file exists: To serve as the entry point for our Node.js backend.
// It sets up the server, database connection, middleware, and API routing.

// 1. Load environment variables from a local .env file
dotenv.config();

// 2. Connect to MongoDB database using our helper function in config/db.js
connectDB();

// 3. Initialize the Express application
const app = express();

// 4. Register Global Middlewares
// CORS allows our React frontend (running on a different port like 5173) to securely communicate with our backend server (running on port 5000)
app.use(cors());

// Parses incoming JSON payloads in request bodies, allowing us to read 'req.body' inside our controllers
app.use(express.json());

// 5. Test Route: To easily check if the server is alive and running in a browser
app.get('/', (req, res) => {
  res.json({ message: 'Team Task Manager API is running successfully!' });
});

// 6. Mount our modular API Routes
// All auth endpoints will start with /api/auth (e.g. /api/auth/login)
app.use('/api/auth', authRoutes);

// All project endpoints will start with /api/projects (e.g. GET /api/projects)
app.use('/api/projects', projectRoutes);

// All task endpoints will start with /api/tasks (e.g. POST /api/tasks)
app.use('/api/tasks', taskRoutes);

// 7. Global Error Handler Middleware
// Catch-all block for any unhandled errors in our controller routes, preventing the server from crashing and sending a clean JSON response
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    message: 'An internal server error occurred!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 8. Start the Server and listen for incoming HTTP requests
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

const mongoose = require('mongoose');

// Why this function exists: To connect our Node.js server to the MongoDB database.
// Mongoose is a tool that allows us to interact with MongoDB databases easily using JavaScript code.
const connectDB = async () => {
  try {
    // We try to connect to the database. We check if process.env.MONGO_URI is set.
    // If not, we fall back to a local database named 'teamtaskmanager'.
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/teamtaskmanager';
    
    const conn = await mongoose.connect(mongoURI);
    
    console.log(`🟢 MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    // If connection fails, log the error and exit the server immediately
    console.error(`🔴 MongoDB Connection Error: ${error.message}`);
    process.exit(1); // '1' tells Node to stop the server with an error code
  }
};

module.exports = connectDB;

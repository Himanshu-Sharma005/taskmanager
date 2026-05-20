const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Why this Schema exists: To define the structure of a User document in MongoDB.
// Databases need to know what columns/fields a user has, what type of data they are, and rules (like uniqueness).
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true // Removes leading/trailing spaces
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true, // No two users can have the same email address
    lowercase: true, // Saves all emails as lowercase to prevent duplicate checks failing due to casing
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password']
  },
  role: {
    type: String,
    enum: ['admin', 'member'], // Restricts value to only these two roles
    default: 'member' // By default, new accounts are created as team members
  }
}, {
  timestamps: true // Automatically adds 'createdAt' and 'updatedAt' date fields to each document
});

// Password Hashing Middleware (pre-save hook)
// Why it exists: NEVER save raw passwords to a database. If the database leaks, all passwords would be exposed.
// This function runs automatically *right before* Mongoose saves a user document to the database.
UserSchema.pre('save', async function (next) {
  // 'this' refers to the user document we are about to save.
  // We only want to hash the password if it's being created or updated. If only the email/name is changed, skip hashing.
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // 1. Generate a 'salt' - a random string appended to the password to make the hash extremely secure.
    const salt = await bcrypt.genSalt(10);
    // 2. Hash the password + salt.
    this.password = await bcrypt.hash(this.password, salt);
    next(); // Move to the next Mongoose process (actually saving to DB)
  } catch (error) {
    next(error); // Pass the error if something fails
  }
});

// Custom Method to Verify Passwords (Login check)
// Why it exists: When logging in, the user sends a plain-text password. 
// We must hash it using the same algorithm and check if it matches the saved hashed password.
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);

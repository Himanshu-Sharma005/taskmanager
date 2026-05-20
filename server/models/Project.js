const mongoose = require('mongoose');

// Why this Schema exists: To model our projects. 
// A project belongs to a creator (Admin) and contains a team of members.
const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a project title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a project description']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId, // Connects directly to the _id of a User document
    ref: 'User', // Tells Mongoose that this ObjectId belongs to the 'User' collection
    required: true
  },
  teamMembers: [{
    type: mongoose.Schema.Types.ObjectId, // An array of User ObjectIds
    ref: 'User' // Connects each item in the array to the 'User' collection
  }],
  deadline: {
    type: Date,
    required: [true, 'Please provide a project deadline']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', ProjectSchema);

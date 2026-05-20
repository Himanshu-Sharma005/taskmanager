const mongoose = require('mongoose');

// Why this Schema exists: To model our individual tasks.
// Tasks exist inside a Project and are assigned to a specific User (Member).
const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a task title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a task description']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId, // The Member user assigned to this task
    ref: 'User',
    required: [true, 'Please assign the task to a team member']
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId, // The Project this task belongs to
    ref: 'Project',
    required: [true, 'A task must belong to a project']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId, // The Admin who created this task
    ref: 'User',
    required: true
  },
  dueDate: {
    type: Date,
    required: [true, 'Please provide a task due date']
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'], // Restricts input values
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Todo', 'In Progress', 'Completed'], // Enforces task life cycle
    default: 'Todo'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', TaskSchema);

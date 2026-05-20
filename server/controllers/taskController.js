const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, projectId, dueDate, priority } = req.body;

    // 1. Validation: Check required fields
    if (!title || !description || !assignedTo || !projectId || !dueDate) {
      return res.status(400).json({ message: 'Please provide title, description, assignedTo, projectId, and dueDate' });
    }

    // 2. Business Logic Validation: Ensure project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // 3. Business Logic Validation: Ensure assigned user exists
    const user = await User.findById(assignedTo);
    if (!user) {
      return res.status(404).json({ message: 'Assigned user not found' });
    }

    // 4. Create the task
    const task = await Task.create({
      title,
      description,
      assignedTo,
      projectId,
      dueDate,
      priority: priority || 'Medium',
      createdBy: req.user._id
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server Error creating task: ' + error.message });
  }
};

// @desc    Get all tasks (Admins see all, Members see only assigned)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    let tasks;

    // 1. Filter based on roles
    if (req.user.role === 'admin') {
      tasks = await Task.find()
        .populate('assignedTo', 'name email')
        .populate('projectId', 'title')
        .populate('createdBy', 'name email');
    } else {
      tasks = await Task.find({ assignedTo: req.user._id })
        .populate('assignedTo', 'name email')
        .populate('projectId', 'title')
        .populate('createdBy', 'name email');
    }

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching tasks: ' + error.message });
  }
};

// @desc    Update task details (Admin can update all, Member can only update task status)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, priority, status } = req.body;

    // 1. Find the task
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // 2. Apply updates based on user role
    if (req.user.role === 'admin') {
      // Admins are all-powerful: they can edit everything
      task.title = title || task.title;
      task.description = description || task.description;
      task.dueDate = dueDate || task.dueDate;
      task.priority = priority || task.priority;
      task.status = status || task.status;

      // If updating assignee, verify the new user exists
      if (assignedTo) {
        const user = await User.findById(assignedTo);
        if (!user) {
          return res.status(404).json({ message: 'New assigned user not found' });
        }
        task.assignedTo = assignedTo;
      }
    } else {
      // Members can ONLY update status! They are blocked from updating title, assignedTo, etc.
      // This enforces business security logic in our code.
      if (status) {
        task.status = status;
      } else {
        return res.status(403).json({ message: 'Members can only update task status' });
      }
    }

    // 3. Save the updated task
    const updatedTask = await task.save();

    // Populate references before sending back to frontend
    const populatedTask = await Task.findById(updatedTask._id)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title')
      .populate('createdBy', 'name email');

    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating task: ' + error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error deleting task: ' + error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask
};

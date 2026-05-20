const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private/Admin (Checked by 'protect' and 'adminOnly' middlewares)
const createProject = async (req, res) => {
  try {
    const { title, description, teamMembers, deadline } = req.body;

    // 1. Validation
    if (!title || !description || !deadline) {
      return res.status(400).json({ message: 'Please provide a title, description, and deadline' });
    }

    // 2. Create the project
    // req.user._id is populated by 'protect' middleware
    const project = await Project.create({
      title,
      description,
      teamMembers: teamMembers || [],
      deadline,
      createdBy: req.user._id
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server Error creating project: ' + error.message });
  }
};

// @desc    Get all projects (Admins see all, Members see only assigned)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    let projects;

    // 1. Check user role to filter projects
    if (req.user.role === 'admin') {
      // Admins can see all projects
      projects = await Project.find()
        .populate('createdBy', 'name email') // Replace ID with creator's name and email
        .populate('teamMembers', 'name email'); // Replace ID array with member details
    } else {
      // Members only see projects where they are in the 'teamMembers' array
      projects = await Project.find({ teamMembers: req.user._id })
        .populate('createdBy', 'name email')
        .populate('teamMembers', 'name email');
    }

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching projects: ' + error.message });
  }
};

// @desc    Update project details
// @route   PUT /api/projects/:id
// @access  Private/Admin
const updateProject = async (req, res) => {
  try {
    const { title, description, teamMembers, deadline } = req.body;

    // 1. Find the project
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // 2. Update the fields
    project.title = title || project.title;
    project.description = description || project.description;
    project.teamMembers = teamMembers || project.teamMembers;
    project.deadline = deadline || project.deadline;

    // 3. Save to database
    const updatedProject = await project.save();
    
    // Populate before sending back to frontend
    const populatedProject = await Project.findById(updatedProject._id)
      .populate('createdBy', 'name email')
      .populate('teamMembers', 'name email');

    res.json(populatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating project: ' + error.message });
  }
};

// @desc    Delete a project and all associated tasks
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res) => {
  try {
    // 1. Find the project
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // 2. Cascading Delete: Delete all tasks that belong to this project
    // This maintains database integrity! We don't want orphan tasks.
    await Task.deleteMany({ projectId: req.params.id });

    // 3. Delete the project itself
    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Project and all its tasks deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error deleting project: ' + error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  updateProject,
  deleteProject
};

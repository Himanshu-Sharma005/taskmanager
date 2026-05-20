import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

// Why this page exists: To display, create, update, and delete projects.
// It adapts based on the user's role (Admin vs Member).
const Projects = () => {
  const { user } = useContext(AuthContext);

  // Core Data States
  const [projects, setProjects] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]); // Loaded for Admin dropdowns
  
  // Loading & Alert States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal Control States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProjectId, setEditProjectId] = useState(null); // If set, we are EDITING rather than CREATING

  // Form Fields States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]); // Array of checked member IDs

  // 1. Fetch Projects & Members on load
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch projects (backend handles role filtering automatically!)
      const projectsRes = await API.get('/projects');
      setProjects(projectsRes.data);

      // If user is Admin, fetch registered team members for assignments
      if (user?.role === 'admin') {
        const membersRes = await API.get('/auth/users');
        setAvailableMembers(membersRes.data);
      }
    } catch (err) {
      console.error('Error fetching project details:', err);
      setError('Could not retrieve projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // 2. Open Modal for Creation
  const handleOpenCreateModal = () => {
    setEditProjectId(null);
    setTitle('');
    setDescription('');
    setDeadline('');
    setSelectedMembers([]);
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  // 3. Open Modal for Editing (Pre-populates values)
  const handleOpenEditModal = (project) => {
    setEditProjectId(project._id);
    setTitle(project.title);
    setDescription(project.description);
    
    // Format Date from "2026-05-20T00:00:00.000Z" to HTML Date Input format "YYYY-MM-DD"
    const formattedDate = project.deadline ? project.deadline.split('T')[0] : '';
    setDeadline(formattedDate);
    
    // Extract array of member IDs
    const memberIds = project.teamMembers.map((m) => m._id || m);
    setSelectedMembers(memberIds);
    
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  // 4. Handle member checkbox toggling
  const handleToggleMember = (memberId) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };

  // 5. Submit Form (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title || !description || !deadline) {
      setError('Please fill in all fields');
      return;
    }

    const projectPayload = {
      title,
      description,
      deadline,
      teamMembers: selectedMembers
    };

    try {
      if (editProjectId) {
        // Update existing project
        const { data } = await API.put(`/projects/${editProjectId}`, projectPayload);
        setProjects(projects.map((p) => (p._id === editProjectId ? data : p)));
        setSuccess('Project updated successfully!');
      } else {
        // Create new project
        const { data } = await API.post('/projects', projectPayload);
        // Force refresh to populate creator/team details cleanly
        fetchData();
        setSuccess('Project created successfully!');
      }

      // Close modal after a short delay to show success alert
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess('');
      }, 800);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Action failed. Please try again.');
    }
  };

  // 6. Delete Project Handler
  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you absolutely sure? This will delete the project AND all its tasks!')) {
      return;
    }

    try {
      setError('');
      await API.delete(`/projects/${id}`);
      setProjects(projects.filter((p) => p._id !== id));
      setSuccess('Project and its tasks deleted successfully');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete project.');
    }
  };

  if (loading && projects.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="flex flex-col items-center space-y-3">
          <svg className="animate-spin h-10 w-10 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-500 font-semibold animate-pulse text-xs">Loading projects...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 bg-gray-50 overflow-y-auto">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Projects Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {user?.role === 'admin' 
              ? 'Create, manage, and assign team projects.' 
              : 'View all projects you are currently assigned to.'}
          </p>
        </div>

        {/* Create Project Button (Admin Only!) */}
        {user?.role === 'admin' && (
          <button
            onClick={handleOpenCreateModal}
            className="self-start sm:self-center flex items-center space-x-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-100 hover:shadow-primary-200 transition duration-150 text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            <span>Create Project</span>
          </button>
        )}
      </div>

      {/* Global Alerts */}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl text-emerald-700 text-sm font-medium">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Projects Grid List */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
          </svg>
          <h3 className="text-lg font-bold text-gray-700">No Projects Available</h3>
          <p className="text-gray-400 mt-2 text-sm max-w-sm mx-auto">
            {user?.role === 'admin' 
              ? 'Click the "Create Project" button to create your first team workspace.' 
              : 'You have not been assigned to any projects yet. Please contact your administrator.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition duration-200 p-6 flex flex-col justify-between h-full">
              
              {/* Top Meta info */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-lg uppercase tracking-wider border border-primary-100">
                    Active Workspace
                  </span>
                  
                  {/* Deadline Badge */}
                  <span className="text-xs text-gray-400 font-semibold flex items-center space-x-1">
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span>{new Date(project.deadline).toLocaleDateString()}</span>
                  </span>
                </div>

                {/* Project Title & Description */}
                <h3 className="text-xl font-bold text-gray-800 tracking-tight leading-snug line-clamp-1">{project.title}</h3>
                <p className="text-gray-500 mt-2 text-sm leading-relaxed line-clamp-3">{project.description}</p>
              </div>

              {/* Middle and Footer: Team List & Action Buttons */}
              <div className="mt-6 border-t border-gray-50 pt-4">
                
                {/* Team Members List */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Team Members ({project.teamMembers.length})</p>
                  {project.teamMembers.length === 0 ? (
                    <span className="text-xs text-gray-400 italic">No assigned members</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {project.teamMembers.map((member) => (
                        <span
                          key={member._id || member}
                          className="text-[11px] bg-slate-50 text-slate-600 px-2 py-1 rounded-md font-semibold border border-slate-100"
                        >
                          {member.name || 'Team Member'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Creator Details & Actions */}
                <div className="flex items-center justify-between mt-6">
                  <div className="text-[11px] text-gray-400 font-semibold">
                    Created by: <span className="text-gray-600">{project.createdBy?.name || 'Admin'}</span>
                  </div>

                  {/* Edit/Delete Buttons (Admin Only!) */}
                  {user?.role === 'admin' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(project)}
                        className="p-2 border border-gray-200 hover:border-primary-300 hover:bg-primary-50 rounded-lg text-gray-500 hover:text-primary-600 transition duration-150"
                        title="Edit Project"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project._id)}
                        className="p-2 border border-gray-200 hover:border-red-300 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600 transition duration-150"
                        title="Delete Project"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  )}

                </div>

              </div>

            </div>
          ))}
        </div>
      )}

      {/* CREATE & EDIT MODAL (ADMIN ONLY!) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden transform transition duration-300 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="font-extrabold text-gray-800 text-lg tracking-tight">
                {editProjectId ? '✏️ Edit Project Details' : '📁 Create New Project'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition duration-150 p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              
              {/* Project Title Field */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Project Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Website Redesign"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-150 text-sm"
                  required
                />
              </div>

              {/* Project Description Field */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Project Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize the project goals, scopes, and outcomes..."
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-150 text-sm"
                  required
                ></textarea>
              </div>

              {/* Project Deadline Field */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Deadline Date</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-150 text-sm bg-white cursor-pointer"
                  required
                />
              </div>

              {/* Team Members Assignment checklist */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Assign Team Members ({selectedMembers.length})
                </label>
                {availableMembers.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2">No team members registered yet. Create standard user accounts first!</p>
                ) : (
                  <div className="border border-gray-200 rounded-xl max-h-40 overflow-y-auto p-3 space-y-2.5 bg-gray-50">
                    {availableMembers.map((member) => (
                      <label key={member._id} className="flex items-center space-x-3 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(member._id)}
                          onChange={() => handleToggleMember(member._id)}
                          className="w-4.5 h-4.5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-700 leading-none">{member.name}</span>
                          <span className="text-[10px] text-gray-400 mt-0.5">{member.email}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons panel */}
              <div className="border-t border-gray-100 pt-6 mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-500 font-bold rounded-xl transition duration-150 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-200 hover:shadow-primary-300 transition duration-150 text-xs"
                >
                  {editProjectId ? 'Save Changes' : 'Create Project'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default Projects;

import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const page = { flex: 1, padding: '32px', background: '#f8fafc', overflowY: 'auto' };
const card = { background: 'white', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '20px' };
const btn = (v = 'primary') => ({ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', border: v === 'primary' ? 'none' : '1px solid #e2e8f0', background: v === 'primary' ? '#4f46e5' : 'white', color: v === 'primary' ? 'white' : '#64748b', cursor: 'pointer', fontFamily: 'inherit' });
const inp = { width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: 'white' };
const lbl = { display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.04em' };

const priorityStyle = (p) => ({ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', background: p === 'High' ? '#fef2f2' : p === 'Medium' ? '#fffbeb' : '#eff6ff', color: p === 'High' ? '#dc2626' : p === 'Medium' ? '#d97706' : '#2563eb' });
const statusStyle = (s) => ({ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', background: s === 'Completed' ? '#f0fdf4' : s === 'In Progress' ? '#fffbeb' : '#f1f5f9', color: s === 'Completed' ? '#16a34a' : s === 'In Progress' ? '#d97706' : '#475569' });

const Tasks = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Todo');

  const fetchData = async () => {
    try {
      setLoading(true);
      const tRes = await API.get('/tasks');
      setTasks(tRes.data);
      if (user?.role === 'admin') {
        const [pRes, mRes] = await Promise.all([API.get('/projects'), API.get('/auth/users')]);
        setProjects(pRes.data);
        setMembers(mRes.data);
      }
    } catch { setError('Failed to load tasks.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [user]);

  const openCreate = () => { setEditId(null); setTitle(''); setDescription(''); setProjectId(projects[0]?._id || ''); setAssignedTo(members[0]?._id || ''); setDueDate(''); setPriority('Medium'); setStatus('Todo'); setError(''); setIsModalOpen(true); };
  const openEdit = (t) => { setEditId(t._id); setTitle(t.title); setDescription(t.description); setProjectId(t.projectId?._id || t.projectId); setAssignedTo(t.assignedTo?._id || t.assignedTo); setDueDate(t.dueDate?.split('T')[0] || ''); setPriority(t.priority); setStatus(t.status); setError(''); setIsModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!title || !description || !projectId || !assignedTo || !dueDate) { setError('Please fill all fields.'); return; }
    const payload = { title, description, projectId, assignedTo, dueDate, priority, status };
    try {
      if (editId) { const { data } = await API.put(`/tasks/${editId}`, payload); setTasks(tasks.map(t => t._id === editId ? data : t)); }
      else { await API.post('/tasks', payload); await fetchData(); }
      setSuccess(editId ? 'Task updated!' : 'Task created!');
      setTimeout(() => { setIsModalOpen(false); setSuccess(''); }, 800);
    } catch (err) { setError(err.response?.data?.message || 'Action failed.'); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const { data } = await API.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t._id === taskId ? data : t));
      setSuccess('Status updated!'); setTimeout(() => setSuccess(''), 1500);
    } catch { setError('Failed to update status.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try { await API.delete(`/tasks/${id}`); setTasks(tasks.filter(t => t._id !== id)); setSuccess('Task deleted.'); setTimeout(() => setSuccess(''), 2000); }
    catch (err) { setError(err.response?.data?.message || 'Delete failed.'); }
  };

  if (loading && tasks.length === 0) return <div style={{ ...page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#94a3b8', fontSize: '14px' }}>Loading tasks...</p></div>;

  return (
    <div style={page}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '700', color: '#0f172a' }}>Tasks</h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>{user?.role === 'admin' ? 'Create and assign tasks to team members.' : 'View and update your assigned tasks.'}</p>
        </div>
        {user?.role === 'admin' && <button style={btn('primary')} onClick={openCreate}>+ New Task</button>}
      </div>

      {success && <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#16a34a', fontSize: '14px' }}>{success}</div>}
      {error && !isModalOpen && <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '14px' }}>{error}</div>}

      {/* Task Grid */}
      {tasks.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ color: '#94a3b8', fontSize: '15px', margin: 0 }}>{user?.role === 'admin' ? 'No tasks yet. Click "New Task" to get started.' : 'No tasks assigned to you yet.'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {tasks.map(t => (
            <div key={t._id} style={{ ...card, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Top row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a', flex: 1 }}>{t.title}</h3>
                <span style={priorityStyle(t.priority)}>{t.priority}</span>
              </div>

              <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>{t.description}</p>

              {/* Meta */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                  Project: <span style={{ color: '#475569', fontWeight: '600' }}>{t.projectId?.title || '—'}</span>
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                  Assigned: <span style={{ color: '#475569', fontWeight: '600' }}>{t.assignedTo?.name || '—'}</span>
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                  Due: <span style={{ color: '#475569', fontWeight: '600' }}>{new Date(t.dueDate).toLocaleDateString()}</span>
                </p>
              </div>

              {/* Footer: status + actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                {user?.role === 'member' ? (
                  <select value={t.status} onChange={(e) => handleStatusChange(t._id, e.target.value)}
                    style={{ ...statusStyle(t.status), border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px' }}>
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                ) : (
                  <span style={statusStyle(t.status)}>{t.status}</span>
                )}

                {user?.role === 'admin' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openEdit(t)} style={btn('outline')}>Edit</button>
                    <button onClick={() => handleDelete(t._id)} style={{ ...btn('outline'), color: '#dc2626', borderColor: '#fecaca' }}>Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '520px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{editId ? 'Edit Task' : 'New Task'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '22px', color: '#94a3b8', cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {error && <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px' }}>{error}</div>}

              <div><label style={lbl}>Task Title</label><input style={inp} type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Design login screen" required /></div>
              <div><label style={lbl}>Description</label><textarea style={{ ...inp, resize: 'vertical' }} value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe the task..." required /></div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={lbl}>Project</label>
                  <select style={inp} value={projectId} onChange={e => setProjectId(e.target.value)} required>
                    <option value="" disabled>Select project</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Assign To</label>
                  <select style={inp} value={assignedTo} onChange={e => setAssignedTo(e.target.value)} required>
                    <option value="" disabled>Select member</option>
                    {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={lbl}>Due Date</label><input style={inp} type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required /></div>
                <div>
                  <label style={lbl}>Priority</label>
                  <select style={inp} value={priority} onChange={e => setPriority(e.target.value)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              {editId && (
                <div>
                  <label style={lbl}>Status</label>
                  <select style={inp} value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={btn('outline')}>Cancel</button>
                <button type="submit" style={btn('primary')}>{editId ? 'Save Changes' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;

import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const s = {
  page: { flex: 1, padding: '32px', background: '#f8fafc', overflowY: 'auto' },
  heading: { fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px' },
  sub: { fontSize: '14px', color: '#64748b', margin: 0 },
  card: { background: 'white', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '20px' },
  label: { fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' },
  statNum: { fontSize: '30px', fontWeight: '800', color: '#0f172a', margin: 0 },
  iconBox: (bg) => ({ width: '40px', height: '40px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }),
};

const StatCard = ({ label, value, color, bg, icon }) => (
  <div style={{ ...s.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
    <div>
      <p style={s.label}>{label}</p>
      <p style={{ ...s.statNum, color }}>{value}</p>
    </div>
    <div style={s.iconBox(bg)}>{icon}</div>
  </div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const [pRes, tRes] = await Promise.all([API.get('/projects'), API.get('/tasks')]);
        setProjects(pRes.data);
        setTasks(tRes.data);
      } catch { setError('Failed to load dashboard data.'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'Completed').length;
  const pending = tasks.filter(t => t.status !== 'Completed').length;
  const overdue = tasks.filter(t => t.status !== 'Completed' && new Date(t.dueDate) < new Date()).length;

  if (loading) return (
    <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#94a3b8', fontSize: '14px' }}>Loading dashboard...</p>
    </div>
  );

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={s.heading}>Hello, {user?.name} 👋</h1>
        <p style={s.sub}>
          {user?.role === 'admin' ? 'Here is an overview of all projects and team tasks.' : 'Here is an overview of your assigned projects and tasks.'}
        </p>
      </div>

      {error && <div style={{ marginBottom: '20px', padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '14px' }}>{error}</div>}

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <StatCard label="Total Projects" value={projects.length} color="#0f172a" bg="#f1f5f9"
          icon={<svg width="18" height="18" fill="none" stroke="#475569" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>}
        />
        <StatCard label="Total Tasks" value={total} color="#0f172a" bg="#eff6ff"
          icon={<svg width="18" height="18" fill="none" stroke="#3b82f6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>}
        />
        <StatCard label="Completed" value={completed} color="#16a34a" bg="#f0fdf4"
          icon={<svg width="18" height="18" fill="none" stroke="#16a34a" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />
        <StatCard label="Pending" value={pending} color="#d97706" bg="#fffbeb"
          icon={<svg width="18" height="18" fill="none" stroke="#d97706" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />
        <StatCard label="Overdue" value={overdue} color={overdue > 0 ? '#dc2626' : '#0f172a'} bg={overdue > 0 ? '#fef2f2' : '#f8fafc'}
          icon={<svg width="18" height="18" fill="none" stroke={overdue > 0 ? '#dc2626' : '#94a3b8'} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>}
        />
      </div>

      {/* Recent lists */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Projects list */}
        <div style={s.card}>
          <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>Recent Projects</h3>
          {projects.length === 0
            ? <p style={{ color: '#94a3b8', fontSize: '14px' }}>No projects yet.</p>
            : projects.slice(0, 4).map(p => (
              <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{p.title}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>Due: {new Date(p.deadline).toLocaleDateString()}</p>
                </div>
                <span style={{ fontSize: '12px', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', fontWeight: '600' }}>
                  {p.teamMembers?.length || 0} members
                </span>
              </div>
            ))
          }
        </div>

        {/* Tasks list */}
        <div style={s.card}>
          <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>Recent Tasks</h3>
          {tasks.length === 0
            ? <p style={{ color: '#94a3b8', fontSize: '14px' }}>No tasks yet.</p>
            : tasks.slice(0, 4).map(t => (
              <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{t.title}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>{t.projectId?.title || 'General'}</p>
                </div>
                <span style={{
                  fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px',
                  background: t.priority === 'High' ? '#fef2f2' : t.priority === 'Medium' ? '#fffbeb' : '#eff6ff',
                  color: t.priority === 'High' ? '#dc2626' : t.priority === 'Medium' ? '#d97706' : '#2563eb',
                }}>
                  {t.priority}
                </span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

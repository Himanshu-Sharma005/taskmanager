import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav style={{
      height: '60px', background: 'white', borderBottom: '1px solid #e2e8f0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', position: 'sticky', top: 0, zIndex: 40
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', background: '#4f46e5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'white', fontWeight: '800', fontSize: '14px' }}>T</span>
        </div>
        <span style={{ fontWeight: '700', fontSize: '16px', color: '#0f172a' }}>TeamTaskManager</span>
      </div>

      {/* User info & logout */}
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{user.name}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{user.email}</div>
          </div>

          <span style={{
            padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
            textTransform: 'uppercase', letterSpacing: '0.05em',
            background: user.role === 'admin' ? '#eef2ff' : '#f1f5f9',
            color: user.role === 'admin' ? '#4f46e5' : '#475569',
            border: user.role === 'admin' ? '1px solid #c7d2fe' : '1px solid #cbd5e1'
          }}>
            {user.role}
          </span>

          <button
            onClick={logout}
            style={{
              padding: '7px 14px', border: '1px solid #e2e8f0', borderRadius: '8px',
              background: 'white', color: '#64748b', fontSize: '13px', fontWeight: '600',
              cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Why this exists: To prevent unauthenticated users (or non-admins) from loading specific pages.
// We wrap any protected page with this component: <ProtectedRoute><Dashboard /></ProtectedRoute>
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useContext(AuthContext);

  // 1. If we are still checking if the user's token is valid, show a premium loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          {/* Beautiful modern SVG spinner */}
          <svg className="animate-spin h-12 w-12 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-500 font-medium animate-pulse text-sm">Verifying session...</p>
        </div>
      </div>
    );
  }

  // 2. If the user is NOT logged in, redirect them immediately to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. If the route is admin-only, but the logged-in user is a member, redirect them to the dashboard
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // 4. Everything is good! Render the protected page.
  return children;
};

export default ProtectedRoute;

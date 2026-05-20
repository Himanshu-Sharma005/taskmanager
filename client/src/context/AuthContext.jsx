import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

// Why this exists: Create the Context object. Think of this as the "Radio Station".
export const AuthContext = createContext();

// Why this exists: The Provider component. Think of this as the "Broadcast Tower".
// It wraps our entire app and supplies the data values to any child component that listens.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores logged-in user details (name, email, role, id)
  const [loading, setLoading] = useState(true); // Tracks if we are checking the token validity on startup

  // Check if a user is already logged in when the app loads (refreshes)
  useEffect(() => {
    const checkLoggedInUser = async () => {
      const token = localStorage.getItem('token');
      
      // If there is no token, we are done loading
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Fetch current user details from /api/auth/profile using our custom Axios client
        // The Axios client automatically appends the Bearer Token!
        const { data } = await API.get('/auth/profile');
        setUser(data);
      } catch (error) {
        console.error('Auto login check failed:', error.message);
        // If token is invalid or expired, clear localStorage
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        // Stop the loading spinner
        setLoading(false);
      }
    };

    checkLoggedInUser();
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const { data } = await API.post('/auth/login', { email, password });
      
      // Save token in localStorage so we stay logged in even if we close the tab
      localStorage.setItem('token', data.token);
      
      // Save user profile details in state
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      });

      return { success: true };
    } catch (error) {
      // Return custom error message from backend if available
      const errMsg = error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : 'Login failed! Please check your credentials.';
      return { success: false, error: errMsg };
    }
  };

  // Signup handler
  const signup = async (name, email, password, role) => {
    try {
      const { data } = await API.post('/auth/signup', { name, email, password, role });
      
      // Save token in localStorage
      localStorage.setItem('token', data.token);
      
      // Save user profile details in state
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      });

      return { success: true };
    } catch (error) {
      const errMsg = error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : 'Signup failed! Please try again.';
      return { success: false, error: errMsg };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token'); // Delete token from storage
    setUser(null); // Clear state
  };

  // Broadcast all these properties to the rest of the application
  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

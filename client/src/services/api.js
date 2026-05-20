import axios from 'axios';

// Why this file exists: To centralize all our network requests using Axios.
// We configure a single base URL so we don't have to write 'http://localhost:5000' every time.

const API = axios.create({
  // Dynamically uses VITE_API_URL when deployed to Vercel/Railway, or falls back to localhost:5000 in development
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically runs *right before* every request is sent to the server.
API.interceptors.request.use(
  (config) => {
    // 1. Retrieve the token from the browser's localStorage
    const token = localStorage.getItem('token');

    // 2. If a token exists, attach it to the HTTP Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;

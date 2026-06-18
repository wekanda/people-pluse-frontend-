import axios from 'axios';

const DEFAULT_BACKEND_URL = 'https://people-pluse-backend-1.onrender.com';
// When developing locally the backend is run on port 8001 here; prefer VITE_API_URL if set.
const API_BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8001' : DEFAULT_BACKEND_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

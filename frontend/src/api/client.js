import axios from 'axios';

const baseURL = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');

const api = axios.create({
  baseURL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Ignore storage access issues
  }
  return config;
});

export default api;

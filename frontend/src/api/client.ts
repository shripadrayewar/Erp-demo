import axios from 'axios';

// In Docker: VITE_API_URL is /api (nginx proxies to backend)
// In local dev: VITE_API_URL is http://localhost:3001/api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
});

export default api;

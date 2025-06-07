import axios from 'axios';
import { getToken, removeToken } from '@/services/token';

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1",
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = getToken();
      if (token) {
        removeToken();
      }
    }
    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5011';

const axiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('csea-token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('csea-token');
      localStorage.removeItem('csea-user');

      if (!window.location.pathname.startsWith('/auth')) {
        window.location.assign('/auth/login/participant');
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;

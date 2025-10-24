import axios from 'axios';

const posApi = axios.create({
  baseURL: import.meta.env.VITE_POS_API_URL,
});

// Interceptor para agregar el token automáticamente en CADA request
// posApi.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

export default posApi;
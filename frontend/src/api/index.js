import axios from 'axios';

// export const api = axios.create({
//   baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
//   headers: {
//     'Content-Type': 'application/json',
//   }
// });
// api.interceptors.request.use(
//   (config) => {
//     const token = sessionStorage.getItem('token');

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

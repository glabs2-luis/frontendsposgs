import axios from "axios";

const webApiNoAuth = axios.create({
  baseURL: import.meta.env.VITE2_EXIS_URL,
});

// Eliminar TODOS los headers de Authorization
delete webApiNoAuth.defaults.headers.common['Authorization'];
delete webApiNoAuth.defaults.headers['Authorization'];

// Interceptor para asegurar que NUNCA se envíe Authorization en este endpoint
webApiNoAuth.interceptors.request.use((config) => {
  // Eliminar cualquier Authorization que pueda haberse agregado
  if (config.headers) {
    delete config.headers.Authorization;
    delete config.headers.authorization;
  }
  return config;
});

export default webApiNoAuth;
import axios from "axios";

const BASE_URL = "http://localhost:8000/api"; // <-- ajustar en producción (o usar env var)

const api = axios.create({
  baseURL: BASE_URL,
});

// Adjunta el access token a cada request saliente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si una respuesta da 401 (token vencido), intenta refrescar UNA vez
// y reintenta la request original. Si el refresh también falla, desloguea.
let isRefreshing = false;
let pendingRequests = [];

function resolvePending(newToken) {
  pendingRequests.forEach((cb) => cb(newToken));
  pendingRequests = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve) => {
        pendingRequests.push((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;
    try {
      const { data } = await axios.post(`${BASE_URL}/auth/refresh/`, {
        refresh: refreshToken,
      });
      localStorage.setItem("access_token", data.access);
      resolvePending(data.access);
      originalRequest.headers.Authorization = `Bearer ${data.access}`;
      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// --- FUNCIONES DE USUARIOS (Usando la instancia 'api' para que viajen los permisos) ---

export const getUsuarios = () => api.get('/usuarios/');
export const crearUsuario = (usuarioData) => api.post('/usuarios/', usuarioData);
export const modificarCorreoUsuario = (id, email) => api.patch(`/usuarios/${id}/`, { email });
export const darDeBajaUsuario = (id) => api.delete(`/usuarios/${id}/`);
export const restablecerClave = (id, nuevaClave) => api.post(`/usuarios/${id}/restablecer-clave/`, { nueva_clave: nuevaClave });
export const getRoles = () => api.get('/roles/');
export default api;
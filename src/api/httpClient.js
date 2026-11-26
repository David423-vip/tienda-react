import axios from 'axios';
import { clearAuthSession, getAuthSession, saveAuthSession } from '../utils/authSession';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/** Cliente HTTP único de la aplicación: URL base, timeout y token centralizados. */
export const httpClient = axios.create({ baseURL, timeout: 10000 });

/** Cliente aparte para /auth: envía la cookie HttpOnly del refresh token (withCredentials). */
export const authClient = axios.create({ baseURL, timeout: 10000, withCredentials: true });

// 1) Antes de cada petición se agrega "Authorization: Bearer <token>" si hay sesión vigente.
httpClient.interceptors.request.use(config => {
  const session = getAuthSession();
  if (session) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
    config.sessionToken = session.accessToken;
  }
  return config;
});

// Renovación única compartida: si varias peticiones reciben 401 a la vez, se hace un solo refresh.
let refreshEnCurso = null;

export function renovarSesion() {
  if (!refreshEnCurso) {
    refreshEnCurso = authClient.post('/v1/auth/refresh')
      .then(response => saveAuthSession(response.data))
      .catch(error => {
        clearAuthSession();
        throw error;
      })
      .finally(() => { refreshEnCurso = null; });
  }
  return refreshEnCurso;
}

// 2) Si el backend responde 401 (token vencido o inválido) se intenta renovar UNA vez y se
//    repite la petición original. Si la renovación falla, se cierra la sesión.
httpClient.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config;
    const status = error.response?.status;
    if (status === 401 && original && !original._reintento && original.sessionToken) {
      original._reintento = true;
      try {
        const session = await renovarSesion();
        original.headers.Authorization = `Bearer ${session.accessToken}`;
        return httpClient(original);
      } catch {
        clearAuthSession();
      }
    }
    return Promise.reject(error);
  },
);

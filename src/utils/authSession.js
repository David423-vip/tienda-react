/**
 * Sesión del usuario en el navegador (patrón de la guía de la clase 5).
 * - El access token (15 min) se guarda en sessionStorage: sobrevive a recargas de la página
 *   pero se borra al cerrar la pestaña.
 * - El refresh token NO está aquí: viaja en una cookie HttpOnly que JavaScript no puede leer.
 */
const STORAGE_KEY = 'milsabores.auth';
export const AUTH_EVENT = 'milsabores-auth-changed';

export function getAuthSession() {
  try {
    const session = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
    if (typeof session?.accessToken === 'string'
      && Number.isFinite(session.expiresAt)
      && session.expiresAt > Date.now()
      && typeof session.usuario?.rol === 'string') {
      return session;
    }
  } catch {
    // Un dato mal formado o manipulado se trata como sesión cerrada.
  }
  return null;
}

export function saveAuthSession(response) {
  const session = {
    accessToken: response.accessToken,
    // Se resta un margen de 5 s para no usar un token justo en el límite del vencimiento
    expiresAt: Date.now() + response.expiresIn * 1000 - 5000,
    usuario: response.usuario,
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(AUTH_EVENT));
  return session;
}

export function clearAuthSession() {
  sessionStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

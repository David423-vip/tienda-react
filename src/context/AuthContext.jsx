import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { renovarSesion } from '../api/httpClient';
import { authService } from '../services/authService';
import { puede as puedeRol } from '../auth/permisos';
import {
  AUTH_EVENT, clearAuthSession, getAuthSession, saveAuthSession,
} from '../utils/authSession';

const AuthContext = createContext(null);

/** Marca no sensible: indica que existe una cookie de refresh para intentar restaurar la sesión. */
const MARCA_SESION = 'milsabores.sesionRecordada';
/** Se renueva el token 60 segundos antes de que venza. */
const MARGEN_RENOVACION = 60_000;

function marcar(activa) {
  try {
    if (activa) localStorage.setItem(MARCA_SESION, '1');
    else localStorage.removeItem(MARCA_SESION);
  } catch { /* almacenamiento no disponible */ }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(getAuthSession);
  // Si no hay token en esta pestaña pero sí hubo sesión, se intenta restaurar antes de decidir.
  const [restaurando, setRestaurando] = useState(
    () => !getAuthSession() && localStorage.getItem(MARCA_SESION) === '1',
  );

  // Escucha los cambios de sesión (login, refresh, logout, 401 del interceptor).
  useEffect(() => {
    const actualizar = () => setSession(getAuthSession());
    window.addEventListener(AUTH_EVENT, actualizar);
    // Cierre de sesión en otra pestaña: se elimina la marca compartida.
    const otraPestana = event => {
      if (event.key === MARCA_SESION && event.newValue === null) clearAuthSession();
    };
    window.addEventListener('storage', otraPestana);
    return () => {
      window.removeEventListener(AUTH_EVENT, actualizar);
      window.removeEventListener('storage', otraPestana);
    };
  }, []);

  // Restauración al recargar o abrir una pestaña nueva usando la cookie HttpOnly.
  useEffect(() => {
    if (!restaurando) return;
    renovarSesion()
      .catch(() => marcar(false))
      .finally(() => setRestaurando(false));
  }, [restaurando]);

  // Renovación proactiva antes del vencimiento del access token.
  useEffect(() => {
    if (!session) return undefined;
    const espera = Math.max(0, session.expiresAt - Date.now() - MARGEN_RENOVACION);
    const timer = window.setTimeout(() => {
      renovarSesion().catch(() => marcar(false));
    }, espera);
    return () => window.clearTimeout(timer);
  }, [session]);

  const login = useCallback(async (email, password) => {
    const respuesta = await authService.login(email, password);
    saveAuthSession(respuesta);
    marcar(true);
    return respuesta.usuario;
  }, []);

  const registro = useCallback(async datos => {
    const respuesta = await authService.registro(datos);
    saveAuthSession(respuesta);
    marcar(true);
    return respuesta.usuario;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout(); // revoca el refresh token en el servidor
    } catch { /* aunque falle la red, se cierra la sesión local */ }
    marcar(false);
    clearAuthSession();
  }, []);

  const value = useMemo(() => {
    const rol = session?.usuario?.rol ?? null;
    return {
      session,
      usuario: session?.usuario ?? null,
      rol,
      autenticado: Boolean(session),
      restaurando,
      login,
      registro,
      logout,
      puede: permiso => puedeRol(rol, permiso),
    };
  }, [session, restaurando, login, registro, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

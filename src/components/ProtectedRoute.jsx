import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Cargando from './Cargando';

/**
 * Protege una ruta:
 *  - sin sesión  → /login (recordando a dónde quería ir)
 *  - sin permiso → /no-autorizado
 * Mientras se restaura la sesión tras recargar la página se muestra un indicador,
 * para no expulsar al usuario antes de saber si su sesión sigue activa.
 */
export default function ProtectedRoute({ permiso, children }) {
  const { autenticado, restaurando, puede } = useAuth();
  const location = useLocation();

  if (restaurando) return <Cargando texto="Verificando tu sesión…" />;
  if (!autenticado) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  if (permiso && !puede(permiso)) {
    return <Navigate to="/no-autorizado" replace state={{ desde: location.pathname }} />;
  }
  return children ?? <Outlet />;
}

import { useAuth } from '../context/AuthContext';

/** Muestra su contenido solo si el usuario tiene el permiso. Ej: <Can permiso="productos.editar">…</Can> */
export default function Can({ permiso, children, fallback = null }) {
  const { puede } = useAuth();
  return puede(permiso) ? children : fallback;
}

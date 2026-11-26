/**
 * Matriz única de permisos del frontend. Cada permiso indica qué roles lo tienen.
 * La usan las rutas (ProtectedRoute), los menús y los botones (componente <Can>).
 * Es un reflejo de las reglas del backend: si alguien la altera en el navegador,
 * Spring Security igual responde 403.
 */
export const PERMISOS = {
  'tienda.comprar': ['CLIENTE', 'ADMIN'],
  'pedidos.propios': ['CLIENTE', 'ADMIN'],
  'panel.acceder': ['ADMIN', 'VENDEDOR'],
  'dashboard.ver': ['ADMIN'],
  'productos.ver': ['ADMIN', 'VENDEDOR'],
  'productos.editar': ['ADMIN'],
  'categorias.gestionar': ['ADMIN'],
  'stock.ver': ['ADMIN'],
  'boletas.ver': ['ADMIN', 'VENDEDOR'],
  'boletas.gestionar': ['ADMIN'],
  'usuarios.gestionar': ['ADMIN'],
};

export function puede(rol, permiso) {
  return Boolean(rol) && (PERMISOS[permiso] ?? []).includes(rol);
}

/** Pantalla de inicio según el rol al iniciar sesión. */
export function inicioPorRol(rol) {
  if (rol === 'ADMIN') return '/admin';
  if (rol === 'VENDEDOR') return '/admin/boletas';
  return '/';
}

export const clp = valor => `$${Number(valor ?? 0).toLocaleString('es-CL')}`;

export const fecha = valor => valor
  ? new Date(valor.length === 10 ? `${valor}T12:00:00` : valor)
    .toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
  : '-';

export const fechaHora = valor => valor
  ? new Date(valor).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })
  : '-';

/** Fecha local en formato yyyy-mm-dd sumando días a hoy (para inputs type=date). */
export function fechaISO(diasDesdeHoy = 0) {
  const d = new Date();
  d.setDate(d.getDate() + diasDesdeHoy);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export const ESTADOS = {
  EN_PREPARACION: { texto: 'En preparación', color: 'warning', icono: '🍰' },
  EN_CAMINO: { texto: 'En camino', color: 'info', icono: '🚚' },
  ENTREGADO: { texto: 'Entregado', color: 'success', icono: '✅' },
  CANCELADA: { texto: 'Cancelada', color: 'secondary', icono: '✖️' },
};

export const ROLES = {
  ADMIN: 'Administrador',
  VENDEDOR: 'Vendedor',
  CLIENTE: 'Cliente',
};

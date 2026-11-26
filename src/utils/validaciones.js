/** Validaciones del lado del cliente. El backend repite estas reglas (nunca se confía solo en el navegador). */

export const REGIONES = [
  'Región Metropolitana', 'Valparaíso', "O'Higgins", 'Maule', 'Ñuble', 'Biobío', 'La Araucanía', 'Los Ríos',
  'Los Lagos', 'Aysén', 'Magallanes', 'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo',
];

const SOLO_LETRAS = /^[A-Za-zÀ-ÿñÑ' ]+$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD = /^(?=.*[A-Za-z])(?=.*\d).{8,64}$/;

export function calcularEdad(fecha) {
  const hoy = new Date();
  const n = new Date(`${fecha}T00:00:00`);
  let edad = hoy.getFullYear() - n.getFullYear();
  const m = hoy.getMonth() - n.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < n.getDate())) edad--;
  return edad;
}

/** Valida igual que el sitio original y que el backend (doble validación). */
export function validarRegistro(f) {
  const e = {};
  if (f.nombre.trim().length < 2 || !SOLO_LETRAS.test(f.nombre.trim())) e.nombre = 'Ingresa tu nombre (solo letras).';
  if (f.apellido.trim().length < 2 || !SOLO_LETRAS.test(f.apellido.trim())) e.apellido = 'Ingresa tu apellido (solo letras).';
  if (!EMAIL.test(f.email.trim())) e.email = 'Ingresa un correo electrónico válido.';
  if (!PASSWORD.test(f.password)) e.password = 'Mínimo 8 caracteres, con letras y números.';
  if (f.password !== f.confirmar) e.confirmar = 'Las contraseñas no coinciden.';
  if (!f.fechaNacimiento) e.fechaNacimiento = 'Selecciona tu fecha de nacimiento.';
  else {
    const edad = calcularEdad(f.fechaNacimiento);
    if (edad < 13) e.fechaNacimiento = 'Debes tener al menos 13 años.';
    else if (edad > 110) e.fechaNacimiento = 'Ingresa una fecha de nacimiento válida.';
  }
  if (f.codigoPromo.trim() && f.codigoPromo.trim().toUpperCase() !== 'FELICES50') e.codigoPromo = 'El código promocional no es válido.';
  return e;
}

export function validarProducto(f) {
  const e = {};
  if (!f.codigo.trim()) e.codigo = 'El código es obligatorio.';
  if (!f.nombre.trim()) e.nombre = 'El nombre es obligatorio.';
  if (!(Number(f.precio) >= 100)) e.precio = 'El precio mínimo es $100.';
  if (f.stock === '' || Number(f.stock) < 0) e.stock = 'El stock no puede ser negativo.';
  if (f.stockCritico === '' || Number(f.stockCritico) < 0) e.stockCritico = 'El stock crítico no puede ser negativo.';
  if (!f.categoriaId) e.categoriaId = 'Selecciona una categoría.';
  if (f.opciones.trim() && !/^[^=;]+=\d+(\.\d+)?(;[^=;]+=\d+(\.\d+)?)*$/.test(f.opciones.trim())) {
    e.opciones = 'Formato: Nombre=factor;Nombre=factor (ej: Pequeña=1.0;Grande=1.5)';
  }
  return e;
}


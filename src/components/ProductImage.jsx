import { useState } from 'react';

/** Imagen del producto; si la URL externa no carga, muestra una ilustración local por categoría. */
const ILUSTRACIONES = {
  cuadradas: 'torta', circulares: 'torta', especiales: 'torta', 'sin-azucar': 'torta', vegana: 'torta',
  postres: 'postre', tradicional: 'tradicional', 'sin-gluten': 'tradicional',
};

export default function ProductImage({ producto, className = '', alto = 200 }) {
  const [fallo, setFallo] = useState(false);
  const local = `/img/${ILUSTRACIONES[producto?.categoria?.slug] ?? 'torta'}.svg`;
  const src = !fallo && producto?.imagenUrl ? producto.imagenUrl : local;
  return (
    <img
      src={src}
      alt={producto?.nombre ?? 'Producto'}
      className={`img-producto ${className}`}
      style={{ height: alto }}
      loading="lazy"
      onError={() => setFallo(true)}
    />
  );
}

import { useState } from 'react';
import { Badge, Button, Card, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { clp } from '../utils/formato';
import ProductImage from './ProductImage';

/** Tarjeta del catálogo: el precio cambia según el tamaño elegido (como en el sitio original). */
export default function ProductCard({ producto }) {
  const [indice, setIndice] = useState(0);
  const { agregar } = useCart();
  const { notificar } = useToast();
  const { rol } = useAuth();
  const variante = producto.variantes[indice];
  const agotado = producto.stock <= 0;
  const puedeComprar = rol !== 'VENDEDOR';

  const agregarAlCarrito = () => {
    agregar({
      productoId: producto.id,
      nombre: producto.nombre,
      imagenUrl: producto.imagenUrl,
      categoria: producto.categoria,
      variante: variante.nombre,
      precioUnitario: variante.precio,
      cantidad: 1,
      mensaje: null,
    });
    notificar(`"${producto.nombre}" (${variante.nombre}) fue agregado al carrito`);
  };

  return (
    <Card className="h-100 tarjeta-producto shadow-sm">
      <Link to={`/producto/${producto.id}`} className="position-relative">
        <ProductImage producto={producto} className="card-img-top" />
        {producto.stockBajo && !agotado && <Badge bg="warning" text="dark" className="etiqueta-stock">¡Últimas unidades!</Badge>}
        {agotado && <Badge bg="secondary" className="etiqueta-stock">Agotado</Badge>}
      </Link>
      <Card.Body className="d-flex flex-column">
        <small className="text-muted">{producto.categoria.nombre}</small>
        <Card.Title as="h3" className="h5 mt-1">
          <Link to={`/producto/${producto.id}`} className="link-titulo">{producto.nombre}</Link>
        </Card.Title>
        <p className="precio mb-2">{clp(variante.precio)} <small>CLP</small></p>
        {producto.variantes.length > 1 && (
          <Form.Select size="sm" className="mb-3" aria-label={`Tamaño de ${producto.nombre}`}
            value={indice} onChange={e => setIndice(Number(e.target.value))}>
            {producto.variantes.map((v, i) => <option key={v.nombre} value={i}>{v.nombre}</option>)}
          </Form.Select>
        )}
        {puedeComprar && (
          <Button className="mt-auto btn-chocolate" onClick={agregarAlCarrito} disabled={agotado}>
            {agotado ? 'Sin stock' : 'Agregar al carrito'}
          </Button>
        )}
      </Card.Body>
    </Card>
  );
}

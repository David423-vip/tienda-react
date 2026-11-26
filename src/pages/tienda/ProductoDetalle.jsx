import { useEffect, useState } from 'react';
import { Badge, Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { productoService } from '../../services/productoService';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { clp } from '../../utils/formato';
import ProductImage from '../../components/ProductImage';
import Cargando from '../../components/Cargando';
import ErrorAlert from '../../components/ErrorAlert';

export default function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agregar } = useCart();
  const { notificar } = useToast();
  const { rol } = useAuth();
  const [producto, setProducto] = useState(null);
  const [error, setError] = useState('');
  const [indice, setIndice] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    productoService.obtener(id).then(setProducto).catch(e => setError(getErrorMessage(e)));
  }, [id]);

  if (error) return <Container className="py-5"><ErrorAlert mensaje={error} /><Link to="/catalogo">Volver al catálogo</Link></Container>;
  if (!producto) return <Cargando />;

  const variante = producto.variantes[indice];
  const agotado = producto.stock <= 0;

  const agregarAlCarrito = event => {
    event.preventDefault();
    agregar({
      productoId: producto.id, nombre: producto.nombre, imagenUrl: producto.imagenUrl, categoria: producto.categoria,
      variante: variante.nombre, precioUnitario: variante.precio, cantidad: Number(cantidad),
      mensaje: producto.personalizable && mensaje.trim() ? mensaje.trim() : null,
    });
    notificar(`${cantidad} x "${producto.nombre}" agregado al carrito`);
    navigate('/carrito');
  };

  return (
    <Container className="py-5">
      <Link to="/catalogo" className="small">← Volver al catálogo</Link>
      <Row className="g-4 mt-1">
        <Col md={6}><ProductImage producto={producto} className="rounded shadow w-100" alto={380} /></Col>
        <Col md={6}>
          <Badge bg="light" text="dark" className="mb-2">{producto.categoria.nombre}</Badge>
          <h2 className="titulo-cursiva">{producto.nombre}</h2>
          <p className="text-muted small">Código {producto.codigo}</p>
          <p>{producto.descripcion}</p>
          <p className="precio fs-3">{clp(variante.precio)} <small>CLP</small></p>
          <p className={producto.stockBajo ? 'text-danger fw-bold' : 'text-success'}>
            {agotado ? 'Sin stock' : `${producto.stock} unidades disponibles`}
          </p>
          {rol !== 'VENDEDOR' && (
            <Form onSubmit={agregarAlCarrito}>
              <Form.Group className="mb-3" controlId="variante">
                <Form.Label>Tamaño / presentación</Form.Label>
                <Form.Select value={indice} onChange={e => setIndice(Number(e.target.value))}>
                  {producto.variantes.map((v, i) => <option key={v.nombre} value={i}>{v.nombre} — {clp(v.precio)}</option>)}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3" controlId="cantidad">
                <Form.Label>Cantidad</Form.Label>
                <Form.Control type="number" min={1} max={Math.max(1, Math.min(50, producto.stock))} value={cantidad}
                  onChange={e => setCantidad(e.target.value)} required />
              </Form.Group>
              {producto.personalizable && (
                <Form.Group className="mb-3" controlId="mensaje">
                  <Form.Label>Mensaje especial (opcional)</Form.Label>
                  <Form.Control maxLength={60} placeholder="Ej: ¡Feliz cumpleaños Sofía!" value={mensaje}
                    onChange={e => setMensaje(e.target.value)} />
                  <Form.Text>{mensaje.length}/60 caracteres. Requiere 2 días de preparación.</Form.Text>
                </Form.Group>
              )}
              <Button type="submit" size="lg" className="btn-chocolate" disabled={agotado}>Agregar al carrito</Button>
            </Form>
          )}
        </Col>
      </Row>
    </Container>
  );
}

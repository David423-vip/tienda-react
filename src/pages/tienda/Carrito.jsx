import { Alert, Button, Col, Container, Form, Row, Table } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { clp } from '../../utils/formato';
import ProductImage from '../../components/ProductImage';

export default function Carrito() {
  const { items, cambiarCantidad, quitar, vaciar, subtotal, unidades } = useCart();
  const { autenticado, usuario } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <Container className="py-5 text-center">
        <h2 className="seccion-titulo">Tu carrito</h2>
        <p className="lead">No hay productos en el carrito.</p>
        <Button as={Link} to="/catalogo" className="btn-chocolate">Ir al catálogo</Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="seccion-titulo">Tu carrito ({unidades} {unidades === 1 ? 'producto' : 'productos'})</h2>
      <Row className="g-4">
        <Col lg={8}>
          <Table responsive className="align-middle bg-white tabla-carrito">
            <thead><tr><th>Producto</th><th>Precio</th><th style={{ width: 110 }}>Cantidad</th><th>Subtotal</th><th /></tr></thead>
            <tbody>
              {items.map(item => (
                <tr key={item.clave}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <ProductImage producto={item} alto={56} className="miniatura" />
                      <div>
                        <strong>{item.nombre}</strong><br />
                        <small className="text-muted">{item.variante}</small>
                        {item.mensaje && <><br /><small className="text-chocolate">✍️ “{item.mensaje}”</small></>}
                      </div>
                    </div>
                  </td>
                  <td>{clp(item.precioUnitario)}</td>
                  <td>
                    <Form.Control type="number" min={1} max={50} size="sm" value={item.cantidad}
                      aria-label={`Cantidad de ${item.nombre}`} onChange={e => cambiarCantidad(item.clave, e.target.value)} />
                  </td>
                  <td>{clp(item.precioUnitario * item.cantidad)}</td>
                  <td><Button size="sm" variant="outline-danger" onClick={() => quitar(item.clave)}>Eliminar</Button></td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Button variant="link" className="text-danger" onClick={vaciar}>Vaciar carrito</Button>
        </Col>
        <Col lg={4}>
          <div className="resumen p-4">
            <h3 className="h5">Resumen</h3>
            <div className="d-flex justify-content-between"><span>Subtotal</span><strong>{clp(subtotal)}</strong></div>
            {autenticado && usuario.beneficios?.length > 0 && (
              <Alert variant="success" className="small mt-3 mb-0">
                <strong>Tus beneficios:</strong>
                <ul className="mb-0 ps-3">{usuario.beneficios.map(b => <li key={b}>{b}</li>)}</ul>
                Se aplican automáticamente al confirmar.
              </Alert>
            )}
            <p className="small text-muted mt-3">El total final (descuentos incluidos) lo calcula la tienda al confirmar la compra.</p>
            <Button className="w-100 btn-chocolate" size="lg" onClick={() => navigate('/checkout')}>
              {autenticado ? 'Continuar con la compra' : 'Inicia sesión para comprar'}
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

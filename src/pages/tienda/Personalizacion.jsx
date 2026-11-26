import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { productoService } from '../../services/productoService';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { clp } from '../../utils/formato';
import ProductImage from '../../components/ProductImage';

/** Formulario de personalización del sitio original, ahora conectado al carrito y al backend. */
export default function Personalizacion() {
  const [tortas, setTortas] = useState([]);
  const [productoId, setProductoId] = useState('');
  const [indice, setIndice] = useState(0);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const { agregar } = useCart();
  const { notificar } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    productoService.listar().then(lista => {
      const personalizables = lista.filter(p => p.personalizable && p.stock > 0);
      setTortas(personalizables);
      if (personalizables[0]) setProductoId(String(personalizables[0].id));
    }).catch(() => setTortas([]));
  }, []);

  const torta = useMemo(() => tortas.find(t => String(t.id) === productoId), [tortas, productoId]);

  const enviar = event => {
    event.preventDefault();
    if (mensaje.trim().length === 0) { setError('Escribe el mensaje que quieres en tu torta.'); return; }
    if (mensaje.length > 60) { setError('El mensaje no puede superar los 60 caracteres.'); return; }
    const v = torta.variantes[indice];
    agregar({
      productoId: torta.id, nombre: torta.nombre, imagenUrl: torta.imagenUrl, categoria: torta.categoria,
      variante: v.nombre, precioUnitario: v.precio, cantidad: 1, mensaje: mensaje.trim(),
    });
    notificar('Torta personalizada agregada al carrito. Elige la fecha de entrega al pagar.');
    navigate('/carrito');
  };

  return (
    <Container className="py-5">
      <h2 className="seccion-titulo">Personaliza tu torta</h2>
      <p className="lead">Elige la torta, el tamaño y el mensaje especial. Las tortas personalizadas requieren al menos 2 días de preparación.</p>
      <Row className="g-4">
        <Col md={5}>{torta && <ProductImage producto={torta} className="rounded shadow w-100" alto={320} />}</Col>
        <Col md={7}>
          <Form onSubmit={enviar} noValidate>
            <Form.Group className="mb-3" controlId="tipo-torta">
              <Form.Label>Torta</Form.Label>
              <Form.Select value={productoId} onChange={e => { setProductoId(e.target.value); setIndice(0); }}>
                {tortas.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </Form.Select>
            </Form.Group>
            {torta && (
              <Form.Group className="mb-3" controlId="tamano">
                <Form.Label>Tamaño</Form.Label>
                <Form.Select value={indice} onChange={e => setIndice(Number(e.target.value))}>
                  {torta.variantes.map((v, i) => <option key={v.nombre} value={i}>{v.nombre} — {clp(v.precio)}</option>)}
                </Form.Select>
              </Form.Group>
            )}
            <Form.Group className="mb-3" controlId="mensaje-especial">
              <Form.Label>Mensaje especial</Form.Label>
              <Form.Control value={mensaje} maxLength={60} isInvalid={Boolean(error)} placeholder="Ej: ¡Felices 50 años, abuelo!"
                onChange={e => { setMensaje(e.target.value); setError(''); }} />
              <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
              <Form.Text>{mensaje.length}/60 caracteres</Form.Text>
            </Form.Group>
            <Alert variant="light" className="border small">La fecha de entrega se elige al confirmar la compra.</Alert>
            <Button type="submit" className="btn-chocolate" disabled={!torta}>Agregar torta personalizada</Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

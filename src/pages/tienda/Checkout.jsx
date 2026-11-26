import { useEffect, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { boletaService } from '../../services/boletaService';
import { usuarioService } from '../../services/usuarioService';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { clp, fechaISO } from '../../utils/formato';
import { REGIONES } from '../../utils/validaciones';

export default function Checkout() {
  const { items, subtotal, vaciar } = useCart();
  const navigate = useNavigate();
  const personalizada = items.some(i => i.mensaje);
  const minimo = fechaISO(personalizada ? 2 : 1);
  const [form, setForm] = useState({ direccion: '', comuna: '', region: 'Región Metropolitana', fechaEntrega: minimo, notas: '' });
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);

  // Precarga la dirección guardada en el perfil del usuario.
  useEffect(() => {
    usuarioService.miPerfil().then(p => setForm(f => ({
      ...f, direccion: p.direccion ?? '', comuna: p.comuna ?? '', region: p.region ?? f.region,
    }))).catch(() => {});
  }, []);

  if (items.length === 0 && !enviando) return <Navigate to="/carrito" replace />;

  const set = campo => e => {
    setForm({ ...form, [campo]: e.target.value });
    if (errores[campo]) setErrores({ ...errores, [campo]: undefined });
  };

  const validar = () => {
    const e = {};
    if (form.direccion.trim().length < 5) e.direccion = 'Ingresa la dirección de entrega (mínimo 5 caracteres).';
    if (form.comuna.trim().length < 3) e.comuna = 'Ingresa la comuna.';
    if (!form.fechaEntrega || form.fechaEntrega < minimo) {
      e.fechaEntrega = personalizada ? 'Las tortas personalizadas requieren al menos 2 días de preparación.' : 'La entrega es desde mañana en adelante.';
    }
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const confirmar = async event => {
    event.preventDefault();
    if (!validar()) return;
    setEnviando(true);
    try {
      const boleta = await boletaService.comprar({
        items: items.map(i => ({ productoId: i.productoId, variante: i.variante, cantidad: i.cantidad, mensaje: i.mensaje })),
        direccion: form.direccion, comuna: form.comuna, region: form.region,
        fechaEntrega: form.fechaEntrega, notas: form.notas,
      });
      vaciar();
      navigate(`/compra/${boleta.id}`, { replace: true });
    } catch (error) {
      setEnviando(false);
      navigate('/compra-error', { state: { mensaje: getErrorMessage(error) } });
    }
  };

  return (
    <Container className="py-5">
      <h2 className="seccion-titulo">Datos de entrega</h2>
      <Row className="g-4">
        <Col lg={7}>
          <Form onSubmit={confirmar} noValidate className="bg-white p-4 rounded shadow-sm">
            <Form.Group className="mb-3" controlId="direccion">
              <Form.Label>Dirección</Form.Label>
              <Form.Control value={form.direccion} onChange={set('direccion')} isInvalid={!!errores.direccion} placeholder="Calle, número, depto." />
              <Form.Control.Feedback type="invalid">{errores.direccion}</Form.Control.Feedback>
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="comuna">
                  <Form.Label>Comuna</Form.Label>
                  <Form.Control value={form.comuna} onChange={set('comuna')} isInvalid={!!errores.comuna} />
                  <Form.Control.Feedback type="invalid">{errores.comuna}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="region">
                  <Form.Label>Región</Form.Label>
                  <Form.Select value={form.region} onChange={set('region')}>
                    {REGIONES.map(r => <option key={r}>{r}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3" controlId="fechaEntrega">
              <Form.Label>Fecha de entrega</Form.Label>
              <Form.Control type="date" min={minimo} max={fechaISO(60)} value={form.fechaEntrega}
                onChange={set('fechaEntrega')} isInvalid={!!errores.fechaEntrega} />
              <Form.Control.Feedback type="invalid">{errores.fechaEntrega}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="notas">
              <Form.Label>Notas para la entrega (opcional)</Form.Label>
              <Form.Control as="textarea" rows={2} maxLength={255} value={form.notas} onChange={set('notas')} />
            </Form.Group>
            <div className="d-flex gap-2">
              <Button as={Link} to="/carrito" variant="outline-secondary">Volver al carrito</Button>
              <Button type="submit" className="btn-chocolate" disabled={enviando}>
                {enviando ? 'Procesando pago…' : 'Confirmar y pagar'}
              </Button>
            </div>
          </Form>
        </Col>
        <Col lg={5}>
          <div className="resumen p-4">
            <h3 className="h5">Tu pedido</h3>
            {items.map(i => (
              <div key={i.clave} className="d-flex justify-content-between small border-bottom py-1">
                <span>{i.cantidad} x {i.nombre} <span className="text-muted">({i.variante})</span></span>
                <span>{clp(i.precioUnitario * i.cantidad)}</span>
              </div>
            ))}
            <div className="d-flex justify-content-between mt-2"><span>Subtotal</span><strong>{clp(subtotal)}</strong></div>
            <p className="small text-muted mt-2 mb-0">Los descuentos de tu cuenta se aplican al confirmar y se detallan en la boleta.</p>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

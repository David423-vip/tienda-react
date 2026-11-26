import { useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { calcularEdad, REGIONES, validarRegistro } from '../../utils/validaciones';

export default function Registro() {
  const { registro, autenticado } = useAuth();
  const { notificar } = useToast();
  const navigate = useNavigate();
  const [f, setF] = useState({
    nombre: '', apellido: '', email: '', password: '', confirmar: '', fechaNacimiento: '',
    telefono: '', direccion: '', comuna: '', region: 'Región Metropolitana', codigoPromo: '',
  });
  const [errores, setErrores] = useState({});
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (autenticado && !enviando) return <Navigate to="/" replace />;

  const set = campo => e => {
    setF({ ...f, [campo]: e.target.value });
    if (errores[campo]) setErrores({ ...errores, [campo]: undefined });
  };
  const edad = f.fechaNacimiento ? calcularEdad(f.fechaNacimiento) : null;
  const avisos = [
    edad >= 50 && '50% de descuento por ser mayor de 50 años',
    f.codigoPromo.trim().toUpperCase() === 'FELICES50' && '10% de descuento permanente con FELICES50',
    f.email.toLowerCase().trim().endsWith('@duocuc.cl') && 'Torta gratis en tu cumpleaños (correo Duoc UC)',
  ].filter(Boolean);

  const enviar = async event => {
    event.preventDefault();
    const e = validarRegistro(f);
    setErrores(e);
    if (Object.keys(e).length) return;
    setEnviando(true);
    setError('');
    try {
      const datos = { ...f };
      delete datos.confirmar;
      const usuario = await registro({ ...datos, email: datos.email.trim(), codigoPromo: datos.codigoPromo.trim() || null });
      notificar(`¡Bienvenido/a, ${usuario.nombre}! Tu cuenta fue creada.`);
      navigate('/perfil', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
      setEnviando(false);
    }
  };

  const campo = (id, etiqueta, props = {}) => (
    <Form.Group className="mb-3" controlId={id}>
      <Form.Label>{etiqueta}</Form.Label>
      <Form.Control value={f[id]} onChange={set(id)} isInvalid={!!errores[id]} {...props} />
      <Form.Control.Feedback type="invalid">{errores[id]}</Form.Control.Feedback>
    </Form.Group>
  );

  return (
    <Container className="py-5" style={{ maxWidth: 820 }}>
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h2 className="titulo-cursiva text-center">Crea tu cuenta</h2>
          <p className="text-center text-muted">Regístrate y accede a beneficios exclusivos.</p>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={enviar} noValidate>
            <Row>
              <Col md={6}>{campo('nombre', 'Nombre', { autoComplete: 'given-name' })}</Col>
              <Col md={6}>{campo('apellido', 'Apellido', { autoComplete: 'family-name' })}</Col>
              <Col md={6}>{campo('email', 'Correo electrónico', { type: 'email', autoComplete: 'email' })}</Col>
              <Col md={6}>{campo('fechaNacimiento', 'Fecha de nacimiento', { type: 'date' })}</Col>
              <Col md={6}>{campo('password', 'Contraseña', { type: 'password', autoComplete: 'new-password' })}</Col>
              <Col md={6}>{campo('confirmar', 'Confirmar contraseña', { type: 'password', autoComplete: 'new-password' })}</Col>
              <Col md={6}>{campo('telefono', 'Teléfono (opcional)', { autoComplete: 'tel' })}</Col>
              <Col md={6}>{campo('codigoPromo', 'Código promocional (opcional)', { placeholder: 'FELICES50' })}</Col>
              <Col md={12}>{campo('direccion', 'Dirección (opcional)', { autoComplete: 'street-address' })}</Col>
              <Col md={6}>{campo('comuna', 'Comuna (opcional)')}</Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="region">
                  <Form.Label>Región</Form.Label>
                  <Form.Select value={f.region} onChange={set('region')}>{REGIONES.map(r => <option key={r}>{r}</option>)}</Form.Select>
                </Form.Group>
              </Col>
            </Row>
            {avisos.length > 0 && (
              <Alert variant="success" className="small"><strong>Beneficios que obtendrás:</strong>
                <ul className="mb-0">{avisos.map(a => <li key={a}>{a}</li>)}</ul></Alert>
            )}
            <Button type="submit" className="w-100 btn-chocolate" size="lg" disabled={enviando}>{enviando ? 'Creando cuenta…' : 'Registrarme'}</Button>
          </Form>
          <p className="text-center mt-3 mb-0 small">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
        </Card.Body>
      </Card>
    </Container>
  );
}

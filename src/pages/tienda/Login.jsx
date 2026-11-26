import { useState } from 'react';
import { Alert, Button, Card, Container, Form } from 'react-bootstrap';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { inicioPorRol, puede } from '../../auth/permisos';
import { getErrorMessage } from '../../utils/getErrorMessage';

export default function Login() {
  const { login, autenticado, rol } = useAuth();
  const { notificar } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (autenticado) return <Navigate to={inicioPorRol(rol)} replace />;

  const ingresar = async event => {
    event.preventDefault();
    setEnviando(true);
    setError('');
    try {
      const usuario = await login(email.trim(), password);
      notificar(`¡Bienvenido de nuevo, ${usuario.nombre}!`);
      const destino = location.state?.from;
      // Vuelve a la página solicitada solo si su rol puede verla (ej: un vendedor no va al checkout).
      const destinoValido = destino && !(destino.startsWith('/admin') && !puede(usuario.rol, 'panel.acceder'))
        && !(destino.startsWith('/checkout') && !puede(usuario.rol, 'tienda.comprar'));
      navigate(destinoValido ? destino : inicioPorRol(usuario.rol), { replace: true });
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: 480 }}>
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h2 className="titulo-cursiva text-center">Iniciar sesión</h2>
          {location.state?.from && <Alert variant="info" className="small">Inicia sesión para continuar.</Alert>}
          {error && <Alert variant="danger" role="alert">{error}</Alert>}
          <Form onSubmit={ingresar}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control type="password" autoComplete="current-password" required value={password}
                onChange={e => setPassword(e.target.value)} />
            </Form.Group>
            <Button type="submit" className="w-100 btn-chocolate" disabled={enviando}>{enviando ? 'Ingresando…' : 'Ingresar'}</Button>
          </Form>
          <p className="text-center mt-3 mb-0 small">¿No tienes cuenta? <Link to="/registro">Regístrate y obtén beneficios</Link></p>
        </Card.Body>
      </Card>
    </Container>
  );
}

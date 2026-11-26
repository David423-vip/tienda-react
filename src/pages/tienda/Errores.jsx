import { Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { inicioPorRol } from '../../auth/permisos';

export function NoAutorizado() {
  const { rol } = useAuth();
  return (
    <Container className="py-5 text-center">
      <div className="display-1">🔒</div>
      <h2>Acceso no autorizado</h2>
      <p>Tu perfil no tiene permisos para ver esta sección.</p>
      <Button as={Link} to={inicioPorRol(rol)} className="btn-chocolate">Ir a mi inicio</Button>
    </Container>
  );
}

export function NoEncontrado() {
  return (
    <Container className="py-5 text-center">
      <div className="display-1">🧁</div>
      <h2>Página no encontrada</h2>
      <Button as={Link} to="/" className="btn-chocolate">Volver al inicio</Button>
    </Container>
  );
}

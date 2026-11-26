import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { usuarioService } from '../../services/usuarioService';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { ROLES } from '../../utils/formato';
import Cargando from '../../components/Cargando';
import { REGIONES } from '../../utils/validaciones';

export default function Perfil({ enPanel = false }) {
  const [perfil, setPerfil] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [claves, setClaves] = useState({ actual: '', nueva: '' });
  const [errorClave, setErrorClave] = useState('');
  const { notificar } = useToast();

  useEffect(() => {
    usuarioService.miPerfil().then(p => {
      setPerfil(p);
      setForm({ nombre: p.nombre, apellido: p.apellido, fechaNacimiento: p.fechaNacimiento ?? '', telefono: p.telefono ?? '',
        direccion: p.direccion ?? '', comuna: p.comuna ?? '', region: p.region ?? 'Región Metropolitana' });
    }).catch(e => setError(getErrorMessage(e)));
  }, []);

  if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;
  if (!form) return <Cargando />;

  const set = c => e => setForm({ ...form, [c]: e.target.value });

  const guardar = async e => {
    e.preventDefault();
    try {
      const p = await usuarioService.actualizarPerfil({ ...form, fechaNacimiento: form.fechaNacimiento || null });
      setPerfil(p);
      notificar('Perfil actualizado');
    } catch (err) {
      notificar(getErrorMessage(err), 'danger');
    }
  };

  const cambiarClave = async e => {
    e.preventDefault();
    try {
      setErrorClave('');
      await usuarioService.cambiarPassword(claves.actual, claves.nueva);
      setClaves({ actual: '', nueva: '' });
      notificar('Contraseña actualizada. Se cerraron tus otras sesiones.');
    } catch (err) {
      setErrorClave(getErrorMessage(err));
    }
  };

  return (
    <Container className={enPanel ? '' : 'py-5'}>
      <h2 className="seccion-titulo">Mi perfil</h2>
      <Row className="g-4">
        <Col lg={4}>
          <Card className="shadow-sm"><Card.Body>
            <h3 className="h5">{perfil.nombre} {perfil.apellido}</h3>
            <p className="mb-1 small">{perfil.email}</p>
            <Badge bg="dark">{ROLES[perfil.rol]}</Badge>
            {perfil.beneficios.length > 0 && (
              <Alert variant="success" className="small mt-3 mb-0"><strong>Tus beneficios</strong>
                <ul className="mb-0 ps-3">{perfil.beneficios.map(b => <li key={b}>{b}</li>)}</ul></Alert>
            )}
          </Card.Body></Card>
        </Col>
        <Col lg={8}>
          <Form onSubmit={guardar} className="bg-white p-4 rounded shadow-sm mb-4">
            <h3 className="h5">Datos personales</h3>
            <Row>
              <Col md={6}><Form.Group className="mb-3" controlId="p-nombre"><Form.Label>Nombre</Form.Label><Form.Control required value={form.nombre} onChange={set('nombre')} /></Form.Group></Col>
              <Col md={6}><Form.Group className="mb-3" controlId="p-apellido"><Form.Label>Apellido</Form.Label><Form.Control required value={form.apellido} onChange={set('apellido')} /></Form.Group></Col>
              <Col md={6}><Form.Group className="mb-3" controlId="p-nac"><Form.Label>Fecha de nacimiento</Form.Label><Form.Control type="date" value={form.fechaNacimiento} onChange={set('fechaNacimiento')} /></Form.Group></Col>
              <Col md={6}><Form.Group className="mb-3" controlId="p-tel"><Form.Label>Teléfono</Form.Label><Form.Control value={form.telefono} onChange={set('telefono')} /></Form.Group></Col>
              <Col md={12}><Form.Group className="mb-3" controlId="p-dir"><Form.Label>Dirección</Form.Label><Form.Control value={form.direccion} onChange={set('direccion')} /></Form.Group></Col>
              <Col md={6}><Form.Group className="mb-3" controlId="p-com"><Form.Label>Comuna</Form.Label><Form.Control value={form.comuna} onChange={set('comuna')} /></Form.Group></Col>
              <Col md={6}><Form.Group className="mb-3" controlId="p-reg"><Form.Label>Región</Form.Label><Form.Select value={form.region} onChange={set('region')}>{REGIONES.map(r => <option key={r}>{r}</option>)}</Form.Select></Form.Group></Col>
            </Row>
            <Button type="submit" className="btn-chocolate">Guardar cambios</Button>
          </Form>
          <Form onSubmit={cambiarClave} className="bg-white p-4 rounded shadow-sm">
            <h3 className="h5">Cambiar contraseña</h3>
            {errorClave && <Alert variant="danger" className="small">{errorClave}</Alert>}
            <Row>
              <Col md={6}><Form.Group className="mb-3" controlId="clave-actual"><Form.Label>Contraseña actual</Form.Label><Form.Control type="password" required autoComplete="current-password" value={claves.actual} onChange={e => setClaves({ ...claves, actual: e.target.value })} /></Form.Group></Col>
              <Col md={6}><Form.Group className="mb-3" controlId="clave-nueva"><Form.Label>Nueva contraseña</Form.Label><Form.Control type="password" required autoComplete="new-password" value={claves.nueva} onChange={e => setClaves({ ...claves, nueva: e.target.value })} /></Form.Group></Col>
            </Row>
            <Button type="submit" variant="outline-dark">Actualizar contraseña</Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

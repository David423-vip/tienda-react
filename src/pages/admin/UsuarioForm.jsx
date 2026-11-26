import { useEffect, useState } from 'react';
import { Alert, Button, Col, Form, Row } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { usuarioService } from '../../services/usuarioService';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { ROLES } from '../../utils/formato';
import Cargando from '../../components/Cargando';
import { REGIONES } from '../../utils/validaciones';

const VACIO = { nombre: '', apellido: '', email: '', password: '', fechaNacimiento: '', telefono: '', direccion: '', comuna: '', region: 'Región Metropolitana', rol: 'CLIENTE', codigoPromo: '', activo: true };

export default function UsuarioForm() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();
  const { notificar } = useToast();
  const [f, setF] = useState(editando ? null : VACIO);
  const [error, setError] = useState('');
  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (!editando) return;
    usuarioService.obtener(id).then(u => setF({
      nombre: u.nombre, apellido: u.apellido, email: u.email, password: '', fechaNacimiento: u.fechaNacimiento ?? '',
      telefono: u.telefono ?? '', direccion: u.direccion ?? '', comuna: u.comuna ?? '', region: u.region ?? 'Región Metropolitana',
      rol: u.rol, codigoPromo: u.codigoPromo ?? '', activo: u.activo,
    })).catch(e => setError(getErrorMessage(e)));
  }, [id, editando]);

  if (!f) return error ? <Alert variant="danger">{error}</Alert> : <Cargando />;
  const set = c => e => {
    setF({ ...f, [c]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
    if (errores[c]) setErrores({ ...errores, [c]: undefined });
  };

  const guardar = async e => {
    e.preventDefault();
    setError('');
    if (!editando && !f.password) { setErrores({ password: 'La contraseña es obligatoria al crear un usuario.' }); return; }
    try {
      const datos = { ...f, fechaNacimiento: f.fechaNacimiento || null, codigoPromo: f.codigoPromo || null };
      const u = editando ? await usuarioService.actualizar(id, datos) : await usuarioService.crear(datos);
      notificar(`Usuario ${u.email} guardado`);
      navigate('/admin/usuarios');
    } catch (err) {
      setError(getErrorMessage(err));
      setErrores(err.response?.data?.errores ?? {});
    }
  };

  const campo = (c, etiqueta, props = {}) => (
    <Form.Group className="mb-3" controlId={`usr-${c}`}>
      <Form.Label>{etiqueta}</Form.Label>
      <Form.Control value={f[c]} onChange={set(c)} isInvalid={!!errores[c]} {...props} />
      <Form.Control.Feedback type="invalid">{errores[c]}</Form.Control.Feedback>
    </Form.Group>
  );

  return (
    <>
      <Link to="/admin/usuarios" className="small">← Volver a usuarios</Link>
      <h1 className="h3 my-3">{editando ? `Editar usuario: ${f.email}` : 'Nuevo usuario'}</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={guardar} noValidate className="bg-white p-4 rounded shadow-sm">
        <Row>
          <Col md={6}>{campo('nombre', 'Nombre', { required: true })}</Col>
          <Col md={6}>{campo('apellido', 'Apellido', { required: true })}</Col>
          <Col md={6}>{campo('email', 'Correo', { type: 'email', required: true })}</Col>
          <Col md={6}>{campo('password', editando ? 'Nueva contraseña (vacío = sin cambios)' : 'Contraseña', { type: 'password', autoComplete: 'new-password' })}</Col>
          <Col md={4}>
            <Form.Group className="mb-3" controlId="usr-rol">
              <Form.Label>Rol</Form.Label>
              <Form.Select value={f.rol} onChange={set('rol')}>{Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>{campo('fechaNacimiento', 'Fecha de nacimiento', { type: 'date' })}</Col>
          <Col md={4}>{campo('codigoPromo', 'Código promocional', { placeholder: 'FELICES50' })}</Col>
          <Col md={4}>{campo('telefono', 'Teléfono')}</Col>
          <Col md={8}>{campo('direccion', 'Dirección')}</Col>
          <Col md={6}>{campo('comuna', 'Comuna')}</Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="usr-region">
              <Form.Label>Región</Form.Label>
              <Form.Select value={f.region} onChange={set('region')}>{REGIONES.map(r => <option key={r}>{r}</option>)}</Form.Select>
            </Form.Group>
          </Col>
          <Col md={12}><Form.Check type="switch" id="usr-activo" label="Cuenta activa" checked={f.activo} onChange={set('activo')} /></Col>
        </Row>
        {editando && <p className="small text-muted mt-3 mb-0">Si cambias el rol, la contraseña o desactivas la cuenta, se cierran las sesiones abiertas del usuario.</p>}
        <div className="mt-4 d-flex gap-2">
          <Button as={Link} to="/admin/usuarios" variant="outline-secondary">Cancelar</Button>
          <Button type="submit" className="btn-chocolate">Guardar</Button>
        </div>
      </Form>
    </>
  );
}

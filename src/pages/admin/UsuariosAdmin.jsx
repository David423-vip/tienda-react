import { useCallback, useEffect, useState } from 'react';
import { Badge, Button, Form, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { usuarioService } from '../../services/usuarioService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { fecha, ROLES } from '../../utils/formato';
import Cargando from '../../components/Cargando';
import ErrorAlert from '../../components/ErrorAlert';
import ConfirmModal from '../../components/ConfirmModal';

const COLOR_ROL = { ADMIN: 'danger', VENDEDOR: 'primary', CLIENTE: 'success' };

export default function UsuariosAdmin() {
  const [rol, setRol] = useState('');
  const [lista, setLista] = useState(null);
  const [error, setError] = useState('');
  const [eliminar, setEliminar] = useState(null);
  const { usuario } = useAuth();
  const { notificar } = useToast();

  const cargar = useCallback(() => {
    usuarioService.listar(rol).then(l => { setError(''); setLista(l); }).catch(e => setError(getErrorMessage(e)));
  }, [rol]);
  useEffect(cargar, [cargar]);

  const confirmarEliminar = async () => {
    try {
      await usuarioService.eliminar(eliminar.id);
      notificar(`Usuario ${eliminar.email} eliminado`);
      cargar();
    } catch (e) {
      notificar(getErrorMessage(e), 'danger');
    }
    setEliminar(null);
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h1 className="h3 mb-0">Usuarios</h1>
        <div className="d-flex gap-2">
          <Form.Select value={rol} onChange={e => setRol(e.target.value)} aria-label="Filtrar por rol">
            <option value="">Todos los roles</option>
            {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Form.Select>
          <Button as={Link} to="/admin/usuarios/nuevo" className="btn-chocolate text-nowrap">+ Nuevo usuario</Button>
        </div>
      </div>
      <ErrorAlert mensaje={error} onReintentar={cargar} />
      {!lista && !error && <Cargando />}
      {lista && (
        <Table hover responsive className="bg-white shadow-sm align-middle">
          <thead className="table-light"><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Beneficios</th><th>Registro</th><th>Estado</th><th className="text-end">Acciones</th></tr></thead>
          <tbody>
            {lista.map(u => (
              <tr key={u.id}>
                <td>{u.nombre} {u.apellido}</td>
                <td className="small">{u.email}</td>
                <td><Badge bg={COLOR_ROL[u.rol]}>{ROLES[u.rol]}</Badge></td>
                <td className="small">{u.beneficios.length ? u.beneficios.map(b => <div key={b}>• {b}</div>) : '-'}</td>
                <td className="small">{fecha(u.fechaRegistro)}</td>
                <td>{u.activo ? <Badge bg="success">Activo</Badge> : <Badge bg="secondary">Inactivo</Badge>}</td>
                <td className="text-end text-nowrap">
                  <Button as={Link} to={`/admin/usuarios/${u.id}/editar`} size="sm" variant="outline-primary" className="me-1">Editar</Button>
                  {u.id !== usuario.id && <Button size="sm" variant="outline-danger" onClick={() => setEliminar(u)}>Eliminar</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <ConfirmModal show={Boolean(eliminar)} titulo="Eliminar usuario" textoConfirmar="Eliminar"
        onCancelar={() => setEliminar(null)} onConfirmar={confirmarEliminar}>
        ¿Eliminar a <strong>{eliminar?.email}</strong>? Si tiene compras registradas no se podrá eliminar; desactívalo en su lugar.
      </ConfirmModal>
    </>
  );
}

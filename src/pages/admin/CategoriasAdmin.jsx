import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Form, Modal, Table } from 'react-bootstrap';
import { categoriaService } from '../../services/categoriaService';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/getErrorMessage';
import Cargando from '../../components/Cargando';
import ErrorAlert from '../../components/ErrorAlert';
import ConfirmModal from '../../components/ConfirmModal';

const slugify = texto => texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function CategoriasAdmin() {
  const [lista, setLista] = useState(null);
  const [error, setError] = useState('');
  const [editando, setEditando] = useState(null); // {id?, nombre, slug, descripcion}
  const [errorForm, setErrorForm] = useState('');
  const [eliminar, setEliminar] = useState(null);
  const { notificar } = useToast();

  const cargar = useCallback(() => {
    categoriaService.listar().then(setLista).catch(e => setError(getErrorMessage(e)));
  }, []);
  useEffect(cargar, [cargar]);

  const guardar = async e => {
    e.preventDefault();
    try {
      const datos = { nombre: editando.nombre, slug: editando.slug, descripcion: editando.descripcion };
      if (editando.id) await categoriaService.actualizar(editando.id, datos);
      else await categoriaService.crear(datos);
      notificar(`Categoría "${editando.nombre}" guardada`);
      setEditando(null);
      cargar();
    } catch (err) {
      setErrorForm(getErrorMessage(err));
    }
  };

  const confirmarEliminar = async () => {
    try {
      await categoriaService.eliminar(eliminar.id);
      notificar(`Categoría "${eliminar.nombre}" eliminada`);
      cargar();
    } catch (err) {
      notificar(getErrorMessage(err), 'danger');
    }
    setEliminar(null);
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Categorías</h1>
        <Button className="btn-chocolate" onClick={() => { setErrorForm(''); setEditando({ nombre: '', slug: '', descripcion: '' }); }}>+ Nueva categoría</Button>
      </div>
      <ErrorAlert mensaje={error} onReintentar={cargar} />
      {!lista && !error && <Cargando />}
      {lista && (
        <Table hover responsive className="bg-white shadow-sm align-middle">
          <thead className="table-light"><tr><th>Nombre</th><th>Identificador</th><th>Descripción</th><th className="text-end">Acciones</th></tr></thead>
          <tbody>
            {lista.map(c => (
              <tr key={c.id}>
                <td>{c.nombre}</td><td><code>{c.slug}</code></td><td className="small">{c.descripcion}</td>
                <td className="text-end text-nowrap">
                  <Button size="sm" variant="outline-primary" className="me-1" onClick={() => { setErrorForm(''); setEditando({ ...c, descripcion: c.descripcion ?? '' }); }}>Editar</Button>
                  <Button size="sm" variant="outline-danger" onClick={() => setEliminar(c)}>Eliminar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={Boolean(editando)} onHide={() => setEditando(null)} centered>
        <Form onSubmit={guardar}>
          <Modal.Header closeButton><Modal.Title>{editando?.id ? 'Editar categoría' : 'Nueva categoría'}</Modal.Title></Modal.Header>
          <Modal.Body>
            {errorForm && <Alert variant="danger">{errorForm}</Alert>}
            <Form.Group className="mb-3" controlId="cat-nombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control required maxLength={60} value={editando?.nombre ?? ''}
                onChange={e => setEditando({ ...editando, nombre: e.target.value, slug: editando.id ? editando.slug : slugify(e.target.value) })} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="cat-slug">
              <Form.Label>Identificador (slug)</Form.Label>
              <Form.Control required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={editando?.slug ?? ''} onChange={e => setEditando({ ...editando, slug: e.target.value })} />
              <Form.Text>Minúsculas, números y guiones. Se usa en los filtros del catálogo.</Form.Text>
            </Form.Group>
            <Form.Group controlId="cat-desc">
              <Form.Label>Descripción</Form.Label>
              <Form.Control as="textarea" rows={2} maxLength={255} value={editando?.descripcion ?? ''} onChange={e => setEditando({ ...editando, descripcion: e.target.value })} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setEditando(null)}>Cancelar</Button>
            <Button type="submit" className="btn-chocolate">Guardar</Button>
          </Modal.Footer>
        </Form>
      </Modal>
      <ConfirmModal show={Boolean(eliminar)} titulo="Eliminar categoría" textoConfirmar="Eliminar"
        onCancelar={() => setEliminar(null)} onConfirmar={confirmarEliminar}>
        ¿Eliminar <strong>{eliminar?.nombre}</strong>? Solo es posible si no tiene productos asociados.
      </ConfirmModal>
    </>
  );
}

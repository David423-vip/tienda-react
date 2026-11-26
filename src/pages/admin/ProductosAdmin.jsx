import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Form, InputGroup, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { productoService } from '../../services/productoService';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { clp } from '../../utils/formato';
import Can from '../../components/Can';
import Cargando from '../../components/Cargando';
import ErrorAlert from '../../components/ErrorAlert';
import ConfirmModal from '../../components/ConfirmModal';

/** Listado de productos. El VENDEDOR solo ve la lista y el detalle; las acciones de edición son del ADMIN. */
export default function ProductosAdmin() {
  const [productos, setProductos] = useState(null);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('');
  const [eliminar, setEliminar] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const { notificar } = useToast();

  const cargar = useCallback(() => {
    productoService.listar({ incluirInactivos: true })
      .then(l => { setError(''); setProductos(l); })
      .catch(e => setError(getErrorMessage(e)));
  }, []);
  useEffect(cargar, [cargar]);

  const visibles = useMemo(() => (productos ?? []).filter(p =>
    `${p.codigo} ${p.nombre} ${p.categoria.nombre}`.toLowerCase().includes(filtro.toLowerCase())), [productos, filtro]);

  const confirmarEliminar = async () => {
    setProcesando(true);
    try {
      await productoService.eliminar(eliminar.id);
      notificar(`Producto "${eliminar.nombre}" eliminado`);
      setEliminar(null);
      cargar();
    } catch (e) {
      notificar(getErrorMessage(e), 'danger');
      setEliminar(null);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h1 className="h3 mb-0">Productos</h1>
        <Can permiso="productos.editar">
          <Button as={Link} to="/admin/productos/nuevo" className="btn-chocolate">+ Nuevo producto</Button>
        </Can>
      </div>
      <InputGroup className="mb-3" style={{ maxWidth: 420 }}>
        <InputGroup.Text>🔎</InputGroup.Text>
        <Form.Control placeholder="Buscar por código, nombre o categoría" value={filtro} onChange={e => setFiltro(e.target.value)} aria-label="Buscar productos" />
      </InputGroup>
      <ErrorAlert mensaje={error} onReintentar={cargar} />
      {!productos && !error && <Cargando />}
      {productos && (
        <Table hover responsive className="bg-white shadow-sm align-middle">
          <thead className="table-light"><tr><th>Código</th><th>Nombre</th><th>Categoría</th><th className="text-end">Precio base</th><th className="text-end">Stock</th><th>Estado</th><th className="text-end">Acciones</th></tr></thead>
          <tbody>
            {visibles.map(p => (
              <tr key={p.id}>
                <td><code>{p.codigo}</code></td>
                <td>{p.nombre}</td>
                <td>{p.categoria.nombre}</td>
                <td className="text-end">{clp(p.precio)}</td>
                <td className={`text-end ${p.stockBajo ? 'text-danger fw-bold' : ''}`}>{p.stock}{p.stockBajo && ' ⚠️'}</td>
                <td>{p.activo ? <Badge bg="success">Activo</Badge> : <Badge bg="secondary">Inactivo</Badge>}</td>
                <td className="text-end text-nowrap">
                  <Button as={Link} to={`/admin/productos/${p.id}`} size="sm" variant="outline-dark" className="me-1">Ver</Button>
                  <Can permiso="productos.editar">
                    <Button as={Link} to={`/admin/productos/${p.id}/editar`} size="sm" variant="outline-primary" className="me-1">Editar</Button>
                    <Button size="sm" variant="outline-danger" onClick={() => setEliminar(p)}>Eliminar</Button>
                  </Can>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <ConfirmModal show={Boolean(eliminar)} titulo="Eliminar producto" textoConfirmar="Eliminar"
        onCancelar={() => setEliminar(null)} onConfirmar={confirmarEliminar} procesando={procesando}>
        ¿Eliminar <strong>{eliminar?.nombre}</strong>? Si tiene ventas registradas no se podrá eliminar; en ese caso desactívalo.
      </ConfirmModal>
    </>
  );
}

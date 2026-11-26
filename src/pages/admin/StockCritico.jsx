import { useEffect, useState } from 'react';
import { Alert, Button, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { productoService } from '../../services/productoService';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { clp } from '../../utils/formato';
import Cargando from '../../components/Cargando';
import ErrorAlert from '../../components/ErrorAlert';

export default function StockCritico() {
  const [lista, setLista] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { productoService.stockCritico().then(setLista).catch(e => setError(getErrorMessage(e))); }, []);

  return (
    <>
      <h1 className="h3 mb-3">⚠️ Productos con stock crítico</h1>
      <ErrorAlert mensaje={error} />
      {!lista && !error && <Cargando />}
      {lista?.length === 0 && <Alert variant="success">Todos los productos tienen stock suficiente.</Alert>}
      {lista?.length > 0 && (
        <Table hover responsive className="bg-white shadow-sm align-middle">
          <thead className="table-light"><tr><th>Código</th><th>Producto</th><th>Categoría</th><th className="text-end">Precio</th><th className="text-end">Stock</th><th className="text-end">Crítico</th><th /></tr></thead>
          <tbody>
            {lista.map(p => (
              <tr key={p.id} className={p.stock === 0 ? 'table-danger' : 'table-warning'}>
                <td><code>{p.codigo}</code></td><td>{p.nombre}</td><td>{p.categoria.nombre}</td><td className="text-end">{clp(p.precio)}</td>
                <td className="text-end fw-bold">{p.stock}</td><td className="text-end">{p.stockCritico}</td>
                <td className="text-end"><Button as={Link} to={`/admin/productos/${p.id}/editar`} size="sm" variant="outline-dark">Reponer</Button></td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}

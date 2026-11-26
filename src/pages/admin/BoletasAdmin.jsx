import { useCallback, useEffect, useState } from 'react';
import { Button, Form, Table } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { boletaService } from '../../services/boletaService';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { clp, ESTADOS, fecha, fechaHora } from '../../utils/formato';
import Cargando from '../../components/Cargando';
import ErrorAlert from '../../components/ErrorAlert';
import EstadoBadge from '../../components/EstadoBadge';

/** Lista de órdenes (ADMIN y VENDEDOR). */
export default function BoletasAdmin() {
  const [params, setParams] = useSearchParams();
  const estado = params.get('estado') ?? '';
  const [lista, setLista] = useState(null);
  const [error, setError] = useState('');

  const cargar = useCallback(() => {
    boletaService.listar(estado)
      .then(l => { setError(''); setLista(l); })
      .catch(e => setError(getErrorMessage(e)));
  }, [estado]);
  useEffect(cargar, [cargar]);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h1 className="h3 mb-0">Órdenes de compra</h1>
        <Form.Select style={{ maxWidth: 240 }} value={estado} aria-label="Filtrar por estado"
          onChange={e => setParams(e.target.value ? { estado: e.target.value } : {})}>
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v.texto}</option>)}
        </Form.Select>
      </div>
      <ErrorAlert mensaje={error} onReintentar={cargar} />
      {!lista && !error && <Cargando />}
      {lista && (
        <Table hover responsive className="bg-white shadow-sm align-middle">
          <thead className="table-light"><tr><th>N° boleta</th><th>Fecha</th><th>Cliente</th><th>Entrega</th><th className="text-end">Total</th><th>Estado</th><th /></tr></thead>
          <tbody>
            {lista.length === 0 && <tr><td colSpan={7} className="text-center py-4">No hay órdenes con este filtro.</td></tr>}
            {lista.map(b => (
              <tr key={b.id}>
                <td><strong>{b.numero}</strong></td>
                <td className="small">{fechaHora(b.fecha)}</td>
                <td>{b.cliente}<br /><small className="text-muted">{b.emailCliente}</small></td>
                <td className="small">{fecha(b.fechaEntrega)}</td>
                <td className="text-end">{clp(b.total)}</td>
                <td><EstadoBadge estado={b.estado} /></td>
                <td className="text-end"><Button as={Link} to={`/admin/boletas/${b.id}`} size="sm" variant="outline-dark">Ver detalle</Button></td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}

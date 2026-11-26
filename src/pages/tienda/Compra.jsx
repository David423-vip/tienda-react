import { useEffect, useState } from 'react';
import { Alert, Button, Container, Table } from 'react-bootstrap';
import { Link, useLocation, useParams } from 'react-router-dom';
import { boletaService } from '../../services/boletaService';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { clp, fecha, fechaHora } from '../../utils/formato';
import Cargando from '../../components/Cargando';
import ErrorAlert from '../../components/ErrorAlert';
import EstadoBadge from '../../components/EstadoBadge';

/** Boleta reutilizable (cliente y panel). */
export function DetalleBoleta({ boleta }) {
  return (
    <div className="boleta bg-white p-4 rounded shadow-sm">
      <div className="d-flex justify-content-between flex-wrap gap-2">
        <div>
          <h3 className="h4 mb-0">Boleta {boleta.numero}</h3>
          <small className="text-muted">{fechaHora(boleta.fecha)} · {boleta.cliente} ({boleta.emailCliente})</small>
        </div>
        <div><EstadoBadge estado={boleta.estado} /></div>
      </div>
      <p className="small mt-3 mb-2">
        <strong>Entrega:</strong> {boleta.direccionEntrega}, {boleta.comuna}, {boleta.region} · {fecha(boleta.fechaEntrega)}
        {boleta.notas && <><br /><strong>Notas:</strong> {boleta.notas}</>}
      </p>
      <Table size="sm" responsive className="mb-2">
        <thead><tr><th>Producto</th><th>Tamaño</th><th className="text-end">Cant.</th><th className="text-end">Precio</th><th className="text-end">Subtotal</th></tr></thead>
        <tbody>
          {boleta.detalles.map(d => (
            <tr key={d.id}>
              <td>{d.producto}{d.mensaje && <div className="small text-chocolate">✍️ “{d.mensaje}”</div>}</td>
              <td>{d.variante}</td>
              <td className="text-end">{d.cantidad}</td>
              <td className="text-end">{clp(d.precioUnitario)}</td>
              <td className="text-end">{clp(d.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="text-end">
        <div>Subtotal: {clp(boleta.subtotal)}</div>
        {boleta.descuento > 0 && <div className="text-success">Descuento: -{clp(boleta.descuento)}<br /><small>{boleta.detalleDescuento}</small></div>}
        <div className="fs-5 fw-bold">Total: {clp(boleta.total)}</div>
      </div>
    </div>
  );
}

export function CompraExitosa() {
  const { id } = useParams();
  const [boleta, setBoleta] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    boletaService.obtener(id).then(setBoleta).catch(e => setError(getErrorMessage(e)));
  }, [id]);

  if (error) return <Container className="py-5"><ErrorAlert mensaje={error} /></Container>;
  if (!boleta) return <Cargando />;
  return (
    <Container className="py-5" style={{ maxWidth: 860 }}>
      <Alert variant="success" className="text-center">
        <h2 className="h3">🎉 ¡Gracias por tu compra!</h2>
        Tu pedido <strong>{boleta.numero}</strong> fue confirmado y ya está en preparación.
      </Alert>
      <DetalleBoleta boleta={boleta} />
      <div className="d-flex gap-2 justify-content-center mt-4">
        <Button onClick={() => window.print()} variant="outline-dark">Imprimir boleta</Button>
        <Button as={Link} to="/mis-pedidos" className="btn-chocolate">Seguir mi pedido</Button>
      </div>
    </Container>
  );
}

export function CompraError() {
  const { state } = useLocation();
  return (
    <Container className="py-5 text-center" style={{ maxWidth: 720 }}>
      <Alert variant="danger">
        <h2 className="h3">No se pudo completar la compra</h2>
        <p className="mb-0">{state?.mensaje ?? 'Ocurrió un error al procesar el pago.'}</p>
      </Alert>
      <p>Tu carrito se mantiene intacto. Revisa el detalle e inténtalo nuevamente.</p>
      <div className="d-flex gap-2 justify-content-center">
        <Button as={Link} to="/carrito" className="btn-chocolate">Volver al carrito</Button>
        <Button as={Link} to="/catalogo" variant="outline-secondary">Ir al catálogo</Button>
      </div>
    </Container>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { Card, Col, Row, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { reporteService } from '../../services/reporteService';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { clp } from '../../utils/formato';
import Cargando from '../../components/Cargando';
import ErrorAlert from '../../components/ErrorAlert';

function Indicador({ titulo, valor, color = 'chocolate', to }) {
  const contenido = (
    <Card className={`indicador border-0 shadow-sm h-100 borde-${color}`}>
      <Card.Body><small className="text-muted">{titulo}</small><div className="fs-3 fw-bold">{valor}</div></Card.Body>
    </Card>
  );
  return to ? <Link to={to} className="text-decoration-none text-reset">{contenido}</Link> : contenido;
}

export default function Dashboard() {
  const [r, setR] = useState(null);
  const [error, setError] = useState('');
  const cargar = useCallback(() => {
    reporteService.resumen().then(d => { setError(''); setR(d); }).catch(e => setError(getErrorMessage(e)));
  }, []);
  useEffect(cargar, [cargar]);

  if (error) return <ErrorAlert mensaje={error} onReintentar={cargar} />;
  if (!r) return <Cargando />;

  return (
    <>
      <h1 className="h3 mb-4">Dashboard</h1>
      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}><Indicador titulo="Ventas (sin canceladas)" valor={clp(r.totalVendido)} /></Col>
        <Col sm={6} xl={3}><Indicador titulo="Órdenes totales" valor={r.boletas} to="/admin/boletas" /></Col>
        <Col sm={6} xl={3}><Indicador titulo="Productos" valor={r.productos} to="/admin/productos" /></Col>
        <Col sm={6} xl={3}><Indicador titulo="Clientes" valor={r.clientes} to="/admin/usuarios" /></Col>
      </Row>
      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}><Indicador titulo="🍰 En preparación" valor={r.enPreparacion} color="warning" to="/admin/boletas?estado=EN_PREPARACION" /></Col>
        <Col sm={6} xl={3}><Indicador titulo="🚚 En camino" valor={r.enCamino} color="info" to="/admin/boletas?estado=EN_CAMINO" /></Col>
        <Col sm={6} xl={3}><Indicador titulo="✅ Entregadas" valor={r.entregadas} color="success" to="/admin/boletas?estado=ENTREGADO" /></Col>
        <Col sm={6} xl={3}><Indicador titulo="✖️ Canceladas" valor={r.canceladas} color="secondary" to="/admin/boletas?estado=CANCELADA" /></Col>
      </Row>
      <Row className="g-3">
        <Col lg={6}>
          <Card className="shadow-sm border-0"><Card.Body>
            <h2 className="h5">Más vendidos</h2>
            <Table size="sm" className="mb-0">
              <thead><tr><th>Producto</th><th className="text-end">Unidades</th><th className="text-end">Monto</th></tr></thead>
              <tbody>{r.masVendidos.map(m => <tr key={m.producto}><td>{m.producto}</td><td className="text-end">{m.unidades}</td><td className="text-end">{clp(m.monto)}</td></tr>)}</tbody>
            </Table>
          </Card.Body></Card>
        </Col>
        <Col lg={6}>
          <Card className="shadow-sm border-0"><Card.Body>
            <h2 className="h5">⚠️ Stock crítico <Link to="/admin/stock-critico" className="small fw-normal">ver todo</Link></h2>
            <Table size="sm" className="mb-0">
              <thead><tr><th>Producto</th><th className="text-end">Stock</th><th className="text-end">Crítico</th></tr></thead>
              <tbody>{r.stockCritico.map(p => <tr key={p.id}><td><Link to={`/admin/productos/${p.id}/editar`}>{p.nombre}</Link></td><td className="text-end text-danger fw-bold">{p.stock}</td><td className="text-end">{p.stockCritico}</td></tr>)}</tbody>
            </Table>
          </Card.Body></Card>
        </Col>
      </Row>
    </>
  );
}

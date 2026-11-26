import { useEffect, useState } from 'react';
import { Badge, Button, Card, Col, Row, Table } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { productoService } from '../../services/productoService';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { clp } from '../../utils/formato';
import Can from '../../components/Can';
import Cargando from '../../components/Cargando';
import ErrorAlert from '../../components/ErrorAlert';
import ProductImage from '../../components/ProductImage';

/** Detalle de producto en modo lectura (ADMIN y VENDEDOR). */
export default function ProductoVer() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { productoService.obtener(id).then(setP).catch(e => setError(getErrorMessage(e))); }, [id]);

  if (error) return <ErrorAlert mensaje={error} />;
  if (!p) return <Cargando />;
  return (
    <>
      <Link to="/admin/productos" className="small">← Volver a productos</Link>
      <div className="d-flex justify-content-between align-items-center my-3">
        <h1 className="h3 mb-0">{p.nombre} <small className="text-muted fs-6">({p.codigo})</small></h1>
        <Can permiso="productos.editar"><Button as={Link} to={`/admin/productos/${p.id}/editar`} className="btn-chocolate">Editar</Button></Can>
      </div>
      <Row className="g-4">
        <Col md={4}><ProductImage producto={p} className="rounded shadow-sm w-100" alto={260} /></Col>
        <Col md={8}>
          <Card className="border-0 shadow-sm"><Card.Body>
            <p>{p.descripcion}</p>
            <Table size="sm" className="mb-3">
              <tbody>
                <tr><th>Categoría</th><td>{p.categoria.nombre}</td></tr>
                <tr><th>Precio base</th><td>{clp(p.precio)}</td></tr>
                <tr><th>Stock</th><td className={p.stockBajo ? 'text-danger fw-bold' : ''}>{p.stock} (crítico: {p.stockCritico})</td></tr>
                <tr><th>Personalizable</th><td>{p.personalizable ? 'Sí (admite mensaje)' : 'No'}</td></tr>
                <tr><th>Estado</th><td>{p.activo ? <Badge bg="success">Activo</Badge> : <Badge bg="secondary">Inactivo</Badge>}</td></tr>
              </tbody>
            </Table>
            <h2 className="h6">Tamaños y precios</h2>
            <Table size="sm" bordered>
              <thead><tr><th>Variante</th><th>Factor</th><th className="text-end">Precio</th></tr></thead>
              <tbody>{p.variantes.map(v => <tr key={v.nombre}><td>{v.nombre}</td><td>x{v.factor}</td><td className="text-end">{clp(v.precio)}</td></tr>)}</tbody>
            </Table>
          </Card.Body></Card>
        </Col>
      </Row>
    </>
  );
}

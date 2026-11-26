import { useEffect, useState } from 'react';
import { Col, Container, Form, Pagination, Row } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { productoService } from '../../services/productoService';
import { categoriaService } from '../../services/categoriaService';
import { getErrorMessage } from '../../utils/getErrorMessage';
import ProductCard from '../../components/ProductCard';
import Cargando from '../../components/Cargando';
import ErrorAlert from '../../components/ErrorAlert';

/** Catálogo con filtros: consume la API v2 (paginada). Los filtros quedan en la URL. */
export default function Catalogo() {
  const [params, setParams] = useSearchParams();
  const categoria = params.get('categoria') ?? '';
  const orden = params.get('orden') ?? 'nombre_asc';
  const pagina = Number(params.get('pagina') ?? 0);
  const [texto, setTexto] = useState(params.get('q') ?? '');
  const [categorias, setCategorias] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');
  const [recargar, setRecargar] = useState(0);

  const cambiar = (clave, valor) => {
    const nuevos = new URLSearchParams(params);
    if (valor === '' || valor == null) nuevos.delete(clave); else nuevos.set(clave, valor);
    if (clave !== 'pagina') nuevos.delete('pagina');
    setParams(nuevos);
  };

  useEffect(() => {
    categoriaService.listar().then(setCategorias).catch(() => setCategorias([]));
  }, []);

  // Búsqueda con espera de 300 ms para no llamar a la API en cada tecla.
  useEffect(() => {
    const t = setTimeout(() => {
      if ((params.get('q') ?? '') !== texto) cambiar('q', texto.trim());
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texto]);

  useEffect(() => {
    let vigente = true;
    productoService.catalogo({ categoria, q: params.get('q'), orden, pagina, tamano: 8 })
      .then(r => { if (vigente) { setError(''); setResultado(r); } })
      .catch(e => { if (vigente) setError(getErrorMessage(e)); });
    return () => { vigente = false; };
  }, [categoria, orden, pagina, params, recargar]);

  return (
    <Container className="py-5">
      <h2 className="seccion-titulo">Catálogo de productos</h2>
      <Row className="g-2 mb-4 filtros p-3">
        <Col md={5}>
          <Form.Label htmlFor="buscador" className="small fw-bold">Buscar</Form.Label>
          <Form.Control id="buscador" type="search" placeholder="Ej: chocolate, manjar…" value={texto}
            onChange={e => setTexto(e.target.value)} />
        </Col>
        <Col md={4}>
          <Form.Label htmlFor="categoria" className="small fw-bold">Categoría</Form.Label>
          <Form.Select id="categoria" value={categoria} onChange={e => cambiar('categoria', e.target.value)}>
            <option value="">Todas las categorías</option>
            {categorias.map(c => <option key={c.id} value={c.slug}>{c.nombre}</option>)}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Label htmlFor="orden" className="small fw-bold">Ordenar por</Form.Label>
          <Form.Select id="orden" value={orden} onChange={e => cambiar('orden', e.target.value)}>
            <option value="nombre_asc">Nombre (A-Z)</option>
            <option value="nombre_desc">Nombre (Z-A)</option>
            <option value="precio_asc">Menor precio</option>
            <option value="precio_desc">Mayor precio</option>
          </Form.Select>
        </Col>
      </Row>

      <ErrorAlert mensaje={error} onReintentar={() => setRecargar(n => n + 1)} />
      {!resultado && !error && <Cargando texto="Cargando productos…" />}
      {resultado && (
        <>
          <p className="text-muted small">{resultado.totalElementos} producto(s) encontrados</p>
          {resultado.contenido.length === 0 && <p className="text-center py-4">No hay productos que coincidan con tu búsqueda.</p>}
          <Row className="g-4">
            {resultado.contenido.map(p => <Col sm={6} lg={3} key={p.id}><ProductCard producto={p} /></Col>)}
          </Row>
          {resultado.totalPaginas > 1 && (
            <Pagination className="justify-content-center mt-4">
              <Pagination.Prev disabled={pagina === 0} onClick={() => cambiar('pagina', pagina - 1)} />
              {Array.from({ length: resultado.totalPaginas }, (_, i) => (
                <Pagination.Item key={i} active={i === pagina} onClick={() => cambiar('pagina', i)}>{i + 1}</Pagination.Item>
              ))}
              <Pagination.Next disabled={resultado.ultima} onClick={() => cambiar('pagina', pagina + 1)} />
            </Pagination>
          )}
        </>
      )}
    </Container>
  );
}

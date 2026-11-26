import { useEffect, useState } from 'react';
import { Alert, Button, Col, Form, Row } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { productoService } from '../../services/productoService';
import { categoriaService } from '../../services/categoriaService';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/getErrorMessage';
import Cargando from '../../components/Cargando';
import ProductImage from '../../components/ProductImage';
import { validarProducto } from '../../utils/validaciones';

const VACIO = { codigo: '', nombre: '', descripcion: '', precio: '', stock: '', stockCritico: 5, imagenUrl: '', opciones: '', personalizable: false, activo: true, categoriaId: '' };

export default function ProductoForm() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();
  const { notificar } = useToast();
  const [f, setF] = useState(editando ? null : VACIO);
  const [categorias, setCategorias] = useState([]);
  const [errores, setErrores] = useState({});
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    categoriaService.listar().then(setCategorias).catch(() => {});
    if (editando) {
      productoService.obtener(id).then(p => setF({
        codigo: p.codigo, nombre: p.nombre, descripcion: p.descripcion ?? '', precio: p.precio, stock: p.stock,
        stockCritico: p.stockCritico, imagenUrl: p.imagenUrl ?? '', opciones: p.opciones ?? '',
        personalizable: p.personalizable, activo: p.activo, categoriaId: p.categoria.id,
      })).catch(e => setError(getErrorMessage(e)));
    }
  }, [id, editando]);

  if (!f) return error ? <Alert variant="danger">{error}</Alert> : <Cargando />;

  const set = c => e => {
    setF({ ...f, [c]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
    if (errores[c]) setErrores({ ...errores, [c]: undefined });
  };

  const guardar = async event => {
    event.preventDefault();
    const e = validarProducto(f);
    setErrores(e);
    if (Object.keys(e).length) return;
    setGuardando(true);
    setError('');
    const datos = { ...f, precio: Number(f.precio), stock: Number(f.stock), stockCritico: Number(f.stockCritico), categoriaId: Number(f.categoriaId) };
    try {
      const p = editando ? await productoService.actualizar(id, datos) : await productoService.crear(datos);
      notificar(`Producto "${p.nombre}" ${editando ? 'actualizado' : 'creado'}`);
      navigate('/admin/productos');
    } catch (err) {
      setError(getErrorMessage(err));
      setErrores(err.response?.data?.errores ?? {});
    } finally {
      setGuardando(false);
    }
  };

  const campo = (c, etiqueta, props = {}) => (
    <Form.Group className="mb-3" controlId={`prod-${c}`}>
      <Form.Label>{etiqueta}</Form.Label>
      <Form.Control value={f[c]} onChange={set(c)} isInvalid={!!errores[c]} {...props} />
      <Form.Control.Feedback type="invalid">{errores[c]}</Form.Control.Feedback>
    </Form.Group>
  );

  return (
    <>
      <Link to="/admin/productos" className="small">← Volver a productos</Link>
      <h1 className="h3 my-3">{editando ? `Editar: ${f.nombre}` : 'Nuevo producto'}</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={guardar} noValidate className="bg-white p-4 rounded shadow-sm">
        <Row>
          <Col md={3}>{campo('codigo', 'Código', { placeholder: 'TC003' })}</Col>
          <Col md={5}>{campo('nombre', 'Nombre')}</Col>
          <Col md={4}>
            <Form.Group className="mb-3" controlId="prod-categoria">
              <Form.Label>Categoría</Form.Label>
              <Form.Select value={f.categoriaId} onChange={set('categoriaId')} isInvalid={!!errores.categoriaId}>
                <option value="">Selecciona…</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errores.categoriaId}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={12}>{campo('descripcion', 'Descripción', { as: 'textarea', rows: 2, maxLength: 500 })}</Col>
          <Col md={4}>{campo('precio', 'Precio base (CLP)', { type: 'number', min: 100 })}</Col>
          <Col md={4}>{campo('stock', 'Stock', { type: 'number', min: 0 })}</Col>
          <Col md={4}>{campo('stockCritico', 'Stock crítico', { type: 'number', min: 0 })}</Col>
          <Col md={8}>{campo('imagenUrl', 'URL de imagen', { placeholder: 'https://…' })}</Col>
          <Col md={4} className="d-flex align-items-end mb-3">
            <ProductImage producto={{ ...f, categoria: categorias.find(c => String(c.id) === String(f.categoriaId)) }} alto={80} className="rounded border" />
          </Col>
          <Col md={12}>{campo('opciones', 'Tamaños y multiplicador de precio', { placeholder: 'Pequeña (Para 10 personas)=1.0;Mediana (Para 20 personas)=1.5' })}</Col>
          <Col md={6}><Form.Check type="switch" id="prod-personalizable" label="Personalizable (admite mensaje)" checked={f.personalizable} onChange={set('personalizable')} /></Col>
          <Col md={6}><Form.Check type="switch" id="prod-activo" label="Activo (visible en la tienda)" checked={f.activo} onChange={set('activo')} /></Col>
        </Row>
        <div className="mt-4 d-flex gap-2">
          <Button as={Link} to="/admin/productos" variant="outline-secondary">Cancelar</Button>
          <Button type="submit" className="btn-chocolate" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar'}</Button>
        </div>
      </Form>
    </>
  );
}

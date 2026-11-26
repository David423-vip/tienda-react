import { useCallback, useEffect, useState } from 'react';
import { Accordion, Button, Container, Form, InputGroup, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { boletaService } from '../../services/boletaService';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { clp, fechaHora } from '../../utils/formato';
import Cargando from '../../components/Cargando';
import ErrorAlert from '../../components/ErrorAlert';
import EstadoBadge from '../../components/EstadoBadge';
import ConfirmModal from '../../components/ConfirmModal';
import { DetalleBoleta } from './Compra';

const AVANCE = { EN_PREPARACION: 33, EN_CAMINO: 66, ENTREGADO: 100, CANCELADA: 100 };

/** Seguimiento de pedidos: reemplaza la simulación del sitio original por datos reales del backend. */
export default function MisPedidos() {
  const [pedidos, setPedidos] = useState(null);
  const [error, setError] = useState('');
  const [numero, setNumero] = useState('');
  const [encontrado, setEncontrado] = useState(null);
  const [errorBusqueda, setErrorBusqueda] = useState('');
  const [cancelando, setCancelando] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const { notificar } = useToast();

  const cargar = useCallback(() => {
    boletaService.mias().then(l => { setError(''); setPedidos(l); }).catch(e => setError(getErrorMessage(e)));
  }, []);

  useEffect(cargar, [cargar]);

  const buscar = async event => {
    event.preventDefault();
    setEncontrado(null);
    if (numero.trim().length < 4) { setErrorBusqueda('Ingresa un número de seguimiento válido (ej: MS-000001).'); return; }
    try {
      setErrorBusqueda('');
      setEncontrado(await boletaService.seguimiento(numero.trim()));
    } catch (e) {
      setErrorBusqueda(getErrorMessage(e));
    }
  };

  const confirmarCancelacion = async () => {
    setProcesando(true);
    try {
      await boletaService.cancelar(cancelando.id);
      notificar(`Pedido ${cancelando.numero} cancelado`, 'warning');
      setCancelando(null);
      cargar();
    } catch (e) {
      notificar(getErrorMessage(e), 'danger');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <Container className="py-5">
      <h2 className="seccion-titulo">Mis pedidos</h2>

      <Form onSubmit={buscar} className="mb-4 filtros p-3" noValidate>
        <Form.Label htmlFor="num-seguimiento" className="fw-bold">Seguimiento por número</Form.Label>
        <InputGroup>
          <Form.Control id="num-seguimiento" placeholder="MS-000001" value={numero} isInvalid={!!errorBusqueda}
            onChange={e => setNumero(e.target.value)} />
          <Button type="submit" className="btn-chocolate">Consultar</Button>
          <Form.Control.Feedback type="invalid">{errorBusqueda}</Form.Control.Feedback>
        </InputGroup>
      </Form>
      {encontrado && <div className="mb-4"><DetalleBoleta boleta={encontrado} /></div>}

      <ErrorAlert mensaje={error} onReintentar={cargar} />
      {!pedidos && !error && <Cargando />}
      {pedidos?.length === 0 && (
        <p>Aún no tienes pedidos. <Link to="/catalogo">¡Revisa nuestro catálogo!</Link></p>
      )}
      {pedidos?.length > 0 && (
        <Accordion defaultActiveKey={String(pedidos[0].id)}>
          {pedidos.map(p => (
            <Accordion.Item eventKey={String(p.id)} key={p.id}>
              <Accordion.Header>
                <div className="d-flex flex-wrap gap-3 align-items-center w-100 me-3">
                  <strong>{p.numero}</strong>
                  <span className="text-muted small">{fechaHora(p.fecha)}</span>
                  <EstadoBadge estado={p.estado} />
                  <span className="ms-auto fw-bold">{clp(p.total)}</span>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <ProgressBar now={AVANCE[p.estado]} variant={p.estado === 'CANCELADA' ? 'secondary' : 'success'}
                  label={p.estado === 'CANCELADA' ? 'Cancelado' : undefined} className="mb-3" />
                <DetalleBoleta boleta={p} />
                {p.estado === 'EN_PREPARACION' && (
                  <Button variant="outline-danger" size="sm" className="mt-3" onClick={() => setCancelando(p)}>Cancelar pedido</Button>
                )}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}

      <ConfirmModal show={Boolean(cancelando)} titulo="Cancelar pedido" textoConfirmar="Sí, cancelar"
        onCancelar={() => setCancelando(null)} onConfirmar={confirmarCancelacion} procesando={procesando}>
        ¿Seguro que quieres cancelar el pedido <strong>{cancelando?.numero}</strong>? Esta acción no se puede deshacer.
      </ConfirmModal>
    </Container>
  );
}

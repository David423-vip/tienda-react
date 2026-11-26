import { useCallback, useEffect, useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { boletaService } from '../../services/boletaService';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { ESTADOS } from '../../utils/formato';
import Can from '../../components/Can';
import Cargando from '../../components/Cargando';
import ErrorAlert from '../../components/ErrorAlert';
import ConfirmModal from '../../components/ConfirmModal';
import { DetalleBoleta } from '../tienda/Compra';

/** Detalle de orden. Cambiar el estado o eliminar solo aparece para el ADMIN. */
export default function BoletaAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notificar } = useToast();
  const [boleta, setBoleta] = useState(null);
  const [error, setError] = useState('');
  const [destino, setDestino] = useState(null);
  const [eliminar, setEliminar] = useState(false);
  const [procesando, setProcesando] = useState(false);

  const cargar = useCallback(() => {
    boletaService.obtener(id).then(setBoleta).catch(e => setError(getErrorMessage(e)));
  }, [id]);
  useEffect(cargar, [cargar]);

  const cambiar = async () => {
    setProcesando(true);
    try {
      setBoleta(await boletaService.cambiarEstado(id, destino));
      notificar(`Estado actualizado a "${ESTADOS[destino].texto}"`);
    } catch (e) {
      notificar(getErrorMessage(e), 'danger');
    } finally {
      setProcesando(false);
      setDestino(null);
    }
  };

  const borrar = async () => {
    setProcesando(true);
    try {
      await boletaService.eliminar(id);
      notificar(`Boleta ${boleta.numero} eliminada`);
      navigate('/admin/boletas');
    } catch (e) {
      notificar(getErrorMessage(e), 'danger');
      setProcesando(false);
      setEliminar(false);
    }
  };

  if (error) return <ErrorAlert mensaje={error} />;
  if (!boleta) return <Cargando />;

  return (
    <>
      <Link to="/admin/boletas" className="small">← Volver a órdenes</Link>
      <div className="my-3"><DetalleBoleta boleta={boleta} /></div>
      <Can permiso="boletas.gestionar">
        <Card className="border-0 shadow-sm"><Card.Body>
          <h2 className="h6">Gestionar orden</h2>
          {boleta.estadosSiguientes.length === 0 && <p className="small text-muted mb-2">Esta orden ya está finalizada.</p>}
          <div className="d-flex gap-2 flex-wrap">
            {boleta.estadosSiguientes.map(e => (
              <Button key={e} variant={e === 'CANCELADA' ? 'outline-danger' : 'outline-success'} onClick={() => setDestino(e)}>
                {ESTADOS[e].icono} Marcar como {ESTADOS[e].texto.toLowerCase()}
              </Button>
            ))}
            {boleta.estado === 'CANCELADA' && <Button variant="danger" onClick={() => setEliminar(true)}>Eliminar boleta</Button>}
          </div>
        </Card.Body></Card>
      </Can>
      <ConfirmModal show={Boolean(destino)} titulo="Cambiar estado" variante={destino === 'CANCELADA' ? 'danger' : 'success'}
        onCancelar={() => setDestino(null)} onConfirmar={cambiar} procesando={procesando}>
        ¿Cambiar la orden {boleta.numero} a <strong>{destino && ESTADOS[destino].texto}</strong>?
        {destino === 'CANCELADA' && ' El stock de los productos se repondrá.'}
      </ConfirmModal>
      <ConfirmModal show={eliminar} titulo="Eliminar boleta" onCancelar={() => setEliminar(false)} onConfirmar={borrar} procesando={procesando}>
        ¿Eliminar definitivamente la boleta cancelada {boleta.numero}?
      </ConfirmModal>
    </>
  );
}

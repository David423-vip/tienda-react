import { Button, Modal } from 'react-bootstrap';

export default function ConfirmModal({ show, titulo, children, textoConfirmar = 'Confirmar', variante = 'danger', onConfirmar, onCancelar, procesando }) {
  return (
    <Modal show={show} onHide={onCancelar} centered>
      <Modal.Header closeButton><Modal.Title>{titulo}</Modal.Title></Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onCancelar} disabled={procesando}>Cancelar</Button>
        <Button variant={variante} onClick={onConfirmar} disabled={procesando}>
          {procesando ? 'Procesando…' : textoConfirmar}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

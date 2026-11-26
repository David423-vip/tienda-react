import { Alert, Button } from 'react-bootstrap';

export default function ErrorAlert({ mensaje, onReintentar }) {
  if (!mensaje) return null;
  return (
    <Alert variant="danger" className="d-flex justify-content-between align-items-center" role="alert">
      <span>{mensaje}</span>
      {onReintentar && <Button size="sm" variant="outline-danger" onClick={onReintentar}>Reintentar</Button>}
    </Alert>
  );
}

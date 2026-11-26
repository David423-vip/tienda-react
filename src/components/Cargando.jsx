import { Spinner } from 'react-bootstrap';

export default function Cargando({ texto = 'Cargando…' }) {
  return (
    <div className="text-center py-5 text-chocolate" role="status">
      <Spinner animation="border" size="sm" className="me-2" />
      {texto}
    </div>
  );
}

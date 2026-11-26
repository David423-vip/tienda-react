import { Badge } from 'react-bootstrap';
import { ESTADOS } from '../utils/formato';

export default function EstadoBadge({ estado }) {
  const e = ESTADOS[estado] ?? { texto: estado, color: 'light' };
  return <Badge bg={e.color} text={e.color === 'warning' || e.color === 'info' ? 'dark' : undefined}>{e.icono} {e.texto}</Badge>;
}

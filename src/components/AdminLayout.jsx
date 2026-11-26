import { Badge, Container, Nav } from 'react-bootstrap';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/formato';

/** Menú del panel: cada opción aparece solo si el rol tiene el permiso correspondiente. */
const MENU = [
  { to: '/admin', texto: 'Dashboard', icono: '📊', permiso: 'dashboard.ver', end: true },
  { to: '/admin/boletas', texto: 'Órdenes', icono: '🧾', permiso: 'boletas.ver' },
  { to: '/admin/productos', texto: 'Productos', icono: '🎂', permiso: 'productos.ver' },
  { to: '/admin/categorias', texto: 'Categorías', icono: '🏷️', permiso: 'categorias.gestionar' },
  { to: '/admin/stock-critico', texto: 'Stock crítico', icono: '⚠️', permiso: 'stock.ver' },
  { to: '/admin/usuarios', texto: 'Usuarios', icono: '👥', permiso: 'usuarios.gestionar' },
];

export default function AdminLayout() {
  const { usuario, puede, logout } = useAuth();
  const navigate = useNavigate();

  const salir = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="d-flex min-vh-100 panel">
      <aside className="panel-lateral d-flex flex-column p-3">
        <Link to={puede('dashboard.ver') ? '/admin' : '/admin/boletas'} className="enlace-logo">
          <span className="logo h4 d-block mb-0">Mil Sabores</span>
          <small className="text-rosa">Panel de gestión</small>
        </Link>
        <div className="my-3 small">
          👤 {usuario.nombre} {usuario.apellido}<br />
          <Badge bg="light" text="dark">{ROLES[usuario.rol]}</Badge>
        </div>
        <Nav className="flex-column gap-1">
          {MENU.filter(m => puede(m.permiso)).map(m => (
            <Nav.Link key={m.to} as={NavLink} to={m.to} end={m.end}>{m.icono} {m.texto}</Nav.Link>
          ))}
        </Nav>
        <Nav className="flex-column mt-auto pt-3 border-top border-secondary">
          {usuario.rol === 'ADMIN' && <Nav.Link as={Link} to="/">🏠 Ver tienda</Nav.Link>}
          <Nav.Link as={Link} to="/admin/perfil">⚙️ Mi perfil</Nav.Link>
          <Nav.Link onClick={salir}>🚪 Cerrar sesión</Nav.Link>
        </Nav>
      </aside>
      <main className="flex-grow-1 bg-crema">
        <Container fluid className="p-4">
          <Outlet />
        </Container>
      </main>
    </div>
  );
}

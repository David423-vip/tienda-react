import { Badge, Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ROLES } from '../utils/formato';
import Can from './Can';

const ENLACES = [
  ['/', 'Inicio'],
  ['/nosotros', 'Nosotros'],
  ['/catalogo', 'Catálogo'],
  ['/personalizacion', 'Personaliza tu torta'],
  ['/blog', 'Blog & Recetas'],
  ['/comunidad', 'Comunidad'],
  ['/ubicacion', 'Ubicación'],
];

export default function Layout() {
  const { usuario, autenticado, logout } = useAuth();
  const { unidades } = useCart();
  const { notificar } = useToast();
  const navigate = useNavigate();

  const cerrarSesion = async () => {
    await logout();
    notificar('Sesión cerrada');
    navigate('/');
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <header className="encabezado">
        <Container className="text-center pt-3">
          <Link to="/" className="enlace-logo"><h1 className="logo">Pastelería Mil Sabores</h1></Link>
          <p className="subtitulo-header mb-1">50 años endulzando momentos especiales</p>
        </Container>
        <Navbar expand="lg" variant="dark" className="pt-0">
          <Container>
            <Navbar.Toggle aria-controls="menu-principal" />
            <Navbar.Collapse id="menu-principal">
              <Nav className="mx-auto flex-wrap justify-content-center">
                {ENLACES.map(([to, texto]) => (
                  <Nav.Link key={to} as={NavLink} to={to} end={to === '/'}>{texto}</Nav.Link>
                ))}
              </Nav>
              <Nav className="align-items-lg-center gap-lg-1">
                <Can permiso="panel.acceder">
                  <Nav.Link as={NavLink} to="/admin" className="enlace-panel">⚙️ Panel</Nav.Link>
                </Can>
                {(!autenticado || usuario.rol !== 'VENDEDOR') && (
                  <Nav.Link as={NavLink} to="/carrito" aria-label={`Carrito, ${unidades} productos`}>
                    🛒 Carrito {unidades > 0 && <Badge bg="light" text="dark" pill>{unidades}</Badge>}
                  </Nav.Link>
                )}
                {autenticado ? (
                  <NavDropdown align="end" id="menu-usuario"
                    title={<span>👤 {usuario.nombre} <small className="rol-chip">{ROLES[usuario.rol]}</small></span>}>
                    <NavDropdown.Item as={Link} to="/perfil">Mi perfil</NavDropdown.Item>
                    <Can permiso="pedidos.propios">
                      <NavDropdown.Item as={Link} to="/mis-pedidos">Mis pedidos</NavDropdown.Item>
                    </Can>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={cerrarSesion}>Cerrar sesión</NavDropdown.Item>
                  </NavDropdown>
                ) : (
                  <>
                    <Nav.Link as={NavLink} to="/login">Iniciar sesión</Nav.Link>
                    <Nav.Link as={NavLink} to="/registro" className="btn-registro">Regístrate</Nav.Link>
                  </>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </header>

      <main className="flex-grow-1">
        <Outlet />
      </main>

      <footer className="pie mt-5">
        <Container className="py-4">
          <div className="row g-3">
            <div className="col-md-4">
              <h3 className="logo h4">Pastelería Mil Sabores</h3>
              <p className="mb-0">Desde 1976 endulzando a las familias chilenas.</p>
            </div>
            <div className="col-md-4">
              <strong>Visítanos</strong>
              <p className="mb-0">Av. Américo Vespucio 1501, Cerrillos, Santiago<br />Lunes a sábado, 09:00 a 20:00 hrs.</p>
            </div>
            <div className="col-md-4">
              <strong>Compromiso social</strong>
              <p className="mb-0">Parte de cada compra financia becas para estudiantes de Gastronomía de Duoc UC.</p>
            </div>
          </div>
          <p className="text-center small mt-3 mb-0">© {new Date().getFullYear()} Pastelería Mil Sabores · Proyecto DSY1104 · Grupo 5</p>
        </Container>
      </footer>
    </div>
  );
}

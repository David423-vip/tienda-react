import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import Inicio from './pages/tienda/Inicio';
import { Blog, Comunidad, Nosotros, Ubicacion } from './pages/tienda/Contenido';
import Catalogo from './pages/tienda/Catalogo';
import ProductoDetalle from './pages/tienda/ProductoDetalle';
import Personalizacion from './pages/tienda/Personalizacion';
import Carrito from './pages/tienda/Carrito';
import Checkout from './pages/tienda/Checkout';
import { CompraError, CompraExitosa } from './pages/tienda/Compra';
import MisPedidos from './pages/tienda/MisPedidos';
import Login from './pages/tienda/Login';
import Registro from './pages/tienda/Registro';
import Perfil from './pages/tienda/Perfil';
import { NoAutorizado, NoEncontrado } from './pages/tienda/Errores';
import Dashboard from './pages/admin/Dashboard';
import ProductosAdmin from './pages/admin/ProductosAdmin';
import ProductoVer from './pages/admin/ProductoVer';
import ProductoForm from './pages/admin/ProductoForm';
import CategoriasAdmin from './pages/admin/CategoriasAdmin';
import StockCritico from './pages/admin/StockCritico';
import BoletasAdmin from './pages/admin/BoletasAdmin';
import BoletaAdmin from './pages/admin/BoletaAdmin';
import UsuariosAdmin from './pages/admin/UsuariosAdmin';
import UsuarioForm from './pages/admin/UsuarioForm';

/** Inicio del panel: el ADMIN ve el dashboard; el VENDEDOR va directo a las órdenes. */
function InicioPanel() {
  const { puede } = useAuth();
  return puede('dashboard.ver') ? <Dashboard /> : <Navigate to="/admin/boletas" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Tienda pública */}
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="portada" element={<Navigate to="/" replace />} />
        <Route path="nosotros" element={<Nosotros />} />
        <Route path="catalogo" element={<Catalogo />} />
        <Route path="producto/:id" element={<ProductoDetalle />} />
        <Route path="personalizacion" element={<Personalizacion />} />
        <Route path="blog" element={<Blog />} />
        <Route path="comunidad" element={<Comunidad />} />
        <Route path="ubicacion" element={<Ubicacion />} />
        <Route path="carrito" element={<Carrito />} />
        <Route path="login" element={<Login />} />
        <Route path="registro" element={<Registro />} />
        <Route path="no-autorizado" element={<NoAutorizado />} />

        {/* Requiere sesión iniciada (cualquier rol) */}
        <Route element={<ProtectedRoute />}>
          <Route path="perfil" element={<Perfil />} />
        </Route>

        {/* Solo roles que pueden comprar: CLIENTE y ADMIN */}
        <Route element={<ProtectedRoute permiso="tienda.comprar" />}>
          <Route path="checkout" element={<Checkout />} />
          <Route path="compra/:id" element={<CompraExitosa />} />
          <Route path="compra-error" element={<CompraError />} />
          <Route path="mis-pedidos" element={<MisPedidos />} />
        </Route>
        <Route path="*" element={<NoEncontrado />} />
      </Route>

      {/* Panel de gestión: ADMIN y VENDEDOR, con permisos finos por página */}
      <Route path="admin" element={<ProtectedRoute permiso="panel.acceder"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<InicioPanel />} />
        <Route path="perfil" element={<Perfil enPanel />} />
        <Route element={<ProtectedRoute permiso="boletas.ver" />}>
          <Route path="boletas" element={<BoletasAdmin />} />
          <Route path="boletas/:id" element={<BoletaAdmin />} />
        </Route>
        <Route element={<ProtectedRoute permiso="productos.ver" />}>
          <Route path="productos" element={<ProductosAdmin />} />
          <Route path="productos/:id" element={<ProductoVer />} />
        </Route>
        <Route element={<ProtectedRoute permiso="productos.editar" />}>
          <Route path="productos/nuevo" element={<ProductoForm />} />
          <Route path="productos/:id/editar" element={<ProductoForm />} />
        </Route>
        <Route path="categorias" element={<ProtectedRoute permiso="categorias.gestionar"><CategoriasAdmin /></ProtectedRoute>} />
        <Route path="stock-critico" element={<ProtectedRoute permiso="stock.ver"><StockCritico /></ProtectedRoute>} />
        <Route element={<ProtectedRoute permiso="usuarios.gestionar" />}>
          <Route path="usuarios" element={<UsuariosAdmin />} />
          <Route path="usuarios/nuevo" element={<UsuarioForm />} />
          <Route path="usuarios/:id/editar" element={<UsuarioForm />} />
        </Route>
        <Route path="*" element={<NoEncontrado />} />
      </Route>
    </Routes>
  );
}

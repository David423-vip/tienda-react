# Pastelería Mil Sabores — Tienda React

Frontend de la tienda online **Pastelería Mil Sabores** · DSY1104 Desarrollo FullStack II · Evaluación Parcial 3 · Sección 007V · Grupo 5.

Aplicación React 19 + Vite + React Bootstrap integrada con la API Spring Boot (`milsabores-backend`) mediante Axios, con sesión persistente por JWT y restricciones de acceso por rol.

## Ejecución

Requiere Node 20.19+ (o 22.12+) y el backend encendido en `http://localhost:8080`.

```bash
cp .env.example .env.local    # VITE_API_URL=http://localhost:8080/api
npm install
npm run dev                   # http://localhost:5173
```

Build de producción (Nginx en EC2, mismo origen): `npm run build` (usa `.env.production` con `VITE_API_URL=/api`).

## Estructura

```
src/
├── api/httpClient.js        Axios: URL base, Bearer automático, renovación ante 401 (una sola vez y en cola)
├── services/                authService, productoService (v1 y v2), categoriaService, boletaService, usuarioService, reporteService
├── context/
│   ├── AuthContext.jsx      sesión, restauración al recargar, renovación 60 s antes de vencer, logout
│   ├── CartContext.jsx      carrito en localStorage, sincronizado entre pestañas
│   └── ToastContext.jsx     notificaciones
├── auth/permisos.js         matriz única de permisos por rol
├── components/              ProtectedRoute, Can, Layout, AdminLayout, ProductCard, ...
├── pages/tienda/            Inicio, Catálogo, Detalle, Personalización, Carrito, Checkout, Compra, Mis pedidos, Login, Registro, Perfil, ...
├── pages/admin/             Dashboard, Productos, Categorías, Stock crítico, Órdenes, Usuarios
└── utils/                   authSession (sessionStorage), getErrorMessage, formato, validaciones
```

## Sesión y seguridad en el frontend

- El **access token** (15 min) y los datos del usuario se guardan en `sessionStorage`: la sesión sobrevive a las recargas (F5) y se borra al cerrar la pestaña.
- El **refresh token** está en una cookie `HttpOnly` que JavaScript no puede leer (protección ante XSS). Al abrir una pestaña nueva, `AuthContext` restaura la sesión con `POST /auth/refresh`.
- El interceptor de Axios agrega `Authorization: Bearer` y, si la API responde 401, renueva el token y repite la petición; si no puede, cierra la sesión.
- `getAuthSession()` descarta datos mal formados o vencidos; cerrar sesión en una pestaña la cierra en las demás.

## Restricciones por rol

`auth/permisos.js` define qué rol tiene cada permiso. Se usa en tres niveles:

1. **Rutas**: `<ProtectedRoute permiso="productos.editar">` redirige a `/login` (sin sesión) o `/no-autorizado` (sin permiso).
2. **Menús**: el panel lateral solo muestra las opciones permitidas (el vendedor ve solo *Órdenes* y *Productos*).
3. **Acciones**: `<Can permiso="boletas.gestionar">` oculta botones (editar, eliminar, cambiar estado).

El backend valida lo mismo (401/403), así que modificar el navegador no da acceso.

| Rol | Ve |
|---|---|
| Visitante | Tienda, registro y login |
| Cliente | Tienda, carrito, compra, mis pedidos, perfil |
| Vendedor | Panel: órdenes y productos (solo lectura) |
| Administrador | Todo: dashboard, productos, categorías, stock crítico, órdenes, usuarios, tienda |

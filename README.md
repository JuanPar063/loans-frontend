# loans-frontend — SPA (React + MUI)

Aplicación web (React 19 + Material UI 7, Create React App) para clientes y administradores del
sistema de préstamos. **Habla únicamente con el API gateway** (`/api/v1/...`), no con los servicios
por separado.

- **Puerto:** 3004 · **Base API:** `REACT_APP_API_URL` (def. `http://localhost:3005`) + `/api/v1`

## Rol dentro del sistema
```
navegador ─► loans-frontend (:3004) ─► API gateway (:3005) ─► /api/v1/* ─► microservicios
```
Todas las peticiones pasan por una instancia Axios central (`src/services/api.client.tsx`) que:
- añade `Authorization: Bearer <token>` (token en `localStorage`),
- maneja 401/403 de forma centralizada,
- tipa los errores (`ApiError`).

## Flujo de uso (UI)
1. **/register** — saga de registro: `POST /auth/register` → `POST /profiles`; si falla el perfil,
   rollback con `DELETE /auth/users/:id` (con el token del propio usuario).
2. **/login** — guarda token + user.
3. **Cliente:** `/dashboard`, `/profile`, `/balance` (solicitar préstamo, ver balance, pagar).
4. **Admin:** `/admin/dashboard`, `/admin/metrics`, `/admin/pending-loans` (aprobar/rechazar),
   `/admin/register-payment` (pago manual), `/admin/client-analysis`.

El acceso por rol lo controla `ProtectedRoute` (decodifica el JWT con `jwt-decode`).

## Servicios (`src/services/`)
`auth.service`, `profile.service`, `loan.service`, `admin.service`, `admin-loan.service`,
`creditAnalysis.service` — todos usan el cliente compartido contra el gateway. Los pagos envían un
header `Idempotency-Key` (UUID) para no duplicar.

## Manejo de errores
- `<ErrorBoundary>` global (`src/components/common/ErrorBoundary.tsx`) evita pantallas en blanco.
- `SnackbarProvider` (notistack) disponible para notificaciones/toasts.

## Variables de entorno (ver `.env.example`)
- `REACT_APP_API_URL` — **URL del gateway** (ej. `http://localhost:3005`). En prod, tu dominio.
- `PORT=3004`, `REACT_APP_ENV`, `REACT_APP_DEBUG`.
> Las antiguas `REACT_APP_*_SERVICE_URL` (puertos 3000-3003) quedaron **obsoletas**.

## Cómo testear
Recomendado vía `../loans-software` (`docker compose up`) — sirve el build en `:3004` y el gateway en `:3005`.
Desarrollo local:
```bash
npm install
cp .env.example .env   # REACT_APP_API_URL=http://localhost:3005 (gateway corriendo)
npm start              # http://localhost:3004
npm run build          # build de producción (CRA)
```
> Si corres `npm start` en otro puerto, recuerda que el gateway solo permite por CORS los orígenes
> de su allowlist (`:3004`, `:3005`); añade el tuyo en `loans-software/nginx.conf` si hace falta.

## Notas para nuevos administradores del código
- CRA (`react-scripts`) — migrar a Vite/Next es una mejora pendiente.
- `useAuth` centraliza sesión/expiración; el token y el `user` viven en `localStorage`
  (mover a cookies HttpOnly es una mejora de seguridad pendiente).
- Build muestra warnings de lint pre-existentes (no rompen el build).

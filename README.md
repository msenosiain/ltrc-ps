# LTRC Player Suite

Sistema de gestión de plantel para **Los Tordos Rugby Club**.
Monorepo Nx con API NestJS unificada y frontend React.

## Servicios

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| `apps/api` | 3000 | API NestJS — auth, players, divisiones, equipos, ejercicios, partidos |
| `apps/ui-react` | 4201 | Frontend React (principal) |
| `apps/ui` | 4200 | Frontend Angular (legacy) |

## Prerequisitos

- Node.js 20+
- Docker Desktop

## Levantar en desarrollo

```bash
# 1. Iniciar MongoDB
cd docker
docker compose up -d

# 2. Instalar dependencias (solo la primera vez)
npm install

# 3. API (terminal 1)
npx nx serve api

# 4. UI React (terminal 2)
npx nx serve ui-react
```

## Variables de entorno

### `apps/api/.env`

```env
API_MONGODB_URL=mongodb://localhost:27017
API_MONGODB_DB=ltrc-ps
JWT_SECRET=<secreto>
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
ADMIN_EMAIL=admin@ltrc.com
ADMIN_PASSWORD=<password>
```

### `apps/ui-react/.env.local`

```env
VITE_PS_API_URL=http://localhost:3000/api
```

## Endpoints principales

Base URL: `http://localhost:3000/api`

| Ruta | Auth | Descripción |
|------|------|-------------|
| `POST /auth/login` | No | Login |
| `POST /auth/refresh` | No | Refresh token |
| `GET /players` | No | Lista jugadores |
| `GET /divisiones` | No | Lista divisiones |
| `GET /equipos` | No | Lista equipos |
| `GET /ejercicios/categorias` | JWT | Categorías de ejercicios |
| `GET /ejercicios` | JWT | Lista ejercicios |
| `GET /partidos` | JWT | Lista partidos |

## Scripts

```bash
npm run start:api        # API en :3000
npm run start:ui-react   # UI React en :4201
npm test                 # Tests unitarios (Jest)
npm run e2e              # Tests E2E (Cypress)
npm run lint             # Lint
npm run prettier:fix     # Formatear código
```

## Documentación

Ver [CLAUDE.md](./CLAUDE.md) para arquitectura detallada, convenciones de código y guía de desarrollo.

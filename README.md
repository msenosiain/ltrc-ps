# LTRC Campo

Sistema de gestión del club **Los Tordos RC** — jugadores, partidos, torneos, entrenamientos y viajes.

**Stack:** Angular 21 · NestJS 11 · MongoDB · Nx monorepo

---

## Estructura

```
apps/
  ui/          # Angular 21 — standalone components, es-AR locale
  api/         # NestJS 11 — REST API con JWT + Google OAuth
  ui-e2e/      # Cypress E2E
libs/
  shared/api/  # Interfaces y enums compartidos (@ltrc-campo/shared-api-model)
bruno/         # Colecciones Bruno para testing de la API
docker/        # Docker Compose (MongoDB local)
```

## Desarrollo local

**Requisitos:** Node 20+, Docker

```bash
# Levantar MongoDB
docker-compose -f docker/docker-compose.yml up -d

# Frontend (puerto 4200)
npm run start:ui

# Backend (puerto 3000)
npm run start:api
```

Copiá `.env.example` a `.env` y completá las variables.

## Comandos útiles

```bash
# Tests
npm test                    # Todos los unit tests
nx test ui                  # Solo UI
nx test api                 # Solo API
npm run e2e                 # Cypress headless
npm run e2e:headed          # Cypress con browser

# Calidad
npm run lint
npm run eslint:fix
npm run prettier:fix
```

## Deploy

El proyecto se despliega automáticamente en **Render** al hacer push a `main`.

| Servicio | URL |
|---|---|
| Frontend | https://campo.lostordos.com.ar |
| API | https://campo-be.lostordos.com.ar/api/v1 |

- **UI** — static site, build Angular con locale `es-AR`
- **API** — Node.js web service, MongoDB Atlas
- Variables sensibles (`MONGODB_URI`, JWT secrets, Google OAuth) se configuran en el dashboard de Render

## API

Prefijo global: `/api/v1`

Módulos: `Auth` · `Players` · `Matches` · `Tournaments` · `Squads` · `Users` · `Trainings` · `Trips` · `Branches`

Autenticación: JWT con refresh token rotation + Google OAuth (dominio `lostordos.com.ar`)

Las colecciones Bruno están en `bruno/` con entornos `local` y `render`.

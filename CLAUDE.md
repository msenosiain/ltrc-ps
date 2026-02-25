# LTRC Player Suite – Contexto del proyecto

## ¿Qué es este proyecto?

Sistema de gestión del plantel de jugadores para **Los Tordos Rugby Club (LTRC)**.
Permite listar, crear, editar y eliminar jugadores, incluyendo foto, datos personales,
posición en cancha y talles de equipamiento.

---

## Stack tecnológico

| Capa                    | Tecnología                    | Versión        | Estado                   |
| ----------------------- | ----------------------------- | -------------- | ------------------------ |
| Monorepo                | **Nx**                        | 22.1.3         | activo                   |
| Frontend principal      | **React** + **Vite**          | 19.x / 6.x     | activo (`apps/ui-react`) |
| Estilos                 | **Tailwind CSS 4**            | 4.x            | activo                   |
| Estado global           | **Redux Toolkit**             | 2.x            | activo                   |
| Fetching / caché        | **TanStack Query**            | 5.x            | activo                   |
| Formularios             | **React Hook Form** + **Zod** | 7.x / 3.x      | activo                   |
| Routing (React)         | **React Router**              | 7.x            | activo                   |
| Frontend legacy         | **Angular**                   | ~20.3.15       | legacy (`apps/ui`)       |
| UI Components (legacy)  | **Angular Material**          | ^20.2.14       | legacy                   |
| Backend                 | **NestJS**                    | 11.x           | activo                   |
| Base de datos           | **MongoDB** (Docker)          | latest         | activo                   |
| ODM                     | **Mongoose**                  | 8.9.5          | activo                   |
| Almacenamiento de fotos | **MongoDB GridFS**            | (vía Mongoose) | activo                   |
| Lenguaje                | **TypeScript**                | ~5.9.3         | activo                   |
| Tests unitarios         | **Jest**                      | ^30.2.0        | activo                   |
| Tests E2E (UI)          | **Cypress**                   | ^13.13.0       | activo                   |
| Linting                 | **ESLint** + plugins          | ^9.x           | activo                   |
| Formatter               | **Prettier**                  | ^2.6.2         | activo                   |
| CI                      | **GitHub Actions**            | ubuntu-latest  | activo                   |

---

## Arquitectura – Monorepo Nx

```
ltrc-ps/
├── apps/
│   ├── api/          # Backend NestJS  → puerto 3000
│   ├── api-e2e/      # Tests E2E del API (Jest HTTP)
│   ├── ui-react/     # Frontend React + Vite + Tailwind 4 → puerto 4201  ← PRINCIPAL
│   ├── ui/           # Frontend Angular → puerto 4200  [LEGACY]
│   └── ui-e2e/       # Tests E2E del UI Angular (Cypress)
├── libs/
│   └── shared/
│       └── api/      # Lib compartida: interfaces, enums, tipos
│           └── src/
│               ├── interfaces/   # Player, Address, ClothingSizes, PaginatedResponse
│               └── enums/        # PlayerPositionEnum, ClothingSizesEnum
└── docker/
    └── docker-compose.yml   # MongoDB en puerto 27017
```

El alias de la lib compartida es `@ltrc-ps/shared-api-model`.

### Estructura interna de `apps/ui-react/src/`

```
src/
├── animations/       # Variantes de animación (Framer Motion)
├── app/              # App.tsx, punto de entrada
├── assets/           # Imágenes estáticas
├── components/
│   ├── auth/         # ProtectedRoute
│   ├── layout/       # AppLayout, Header, Sidebar
│   └── ui/           # Componentes reutilizables
├── domain/           # Tipos y enums del dominio (player, positions)
├── hooks/            # Custom hooks
├── lib/              # Clientes HTTP (ps-client, content-client)
├── pages/
│   ├── categorias/   # EjerciciosCategoria, EjercicioDetalle
│   ├── partidos/     # PartidosList, PartidoDetalle
│   ├── players/      # PlayersPage, PlayerDetailPage, PlayerEditPage,
│   │                 #   PlayerForm, PlayerDialog, PlayerFilters
│   ├── Home.tsx
│   └── Login.tsx
├── queries/          # TanStack Query hooks (usePlayers, usePlayer, etc.)
├── routes/           # AppRoutes.tsx (React Router)
├── services/         # Servicios de llamadas HTTP
├── store/            # Redux Toolkit slices (authSlice, filterSlice, uiSlice)
└── utils/            # Funciones utilitarias
```

---

## Levantar el proyecto (modo desarrollo)

### Prerequisitos

- Node.js 20+
- Docker Desktop corriendo

### 1. Iniciar MongoDB

```bash
cd docker
docker compose up -d
```

### 2. Crear el .env del API (si no existe)

El archivo `.env` debe estar en `apps/api/` con:

```env
API_MONGODB_URL=mongodb://localhost:27017
API_MONGODB_DB=ltrc-ps
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Levantar API y UI React en paralelo

```bash
# Terminal 1 – API (NestJS en :3000)
npm run start:api

# Terminal 2 – UI React (Vite en :4201)
npm run start:ui-react
```

O con Nx directamente:

```bash
npx nx serve api
npx nx serve ui-react
```

### Levantar UI Angular (legacy)

```bash
npm run start:ui     # Angular en :4200
# o
npx nx serve ui
```

---

## Scripts disponibles (package.json)

| Script                   | Descripción                                        |
| ------------------------ | -------------------------------------------------- |
| `npm run start:api`      | Levanta el API NestJS en modo watch (:3000)        |
| `npm run start:ui-react` | Levanta la UI React en modo dev (:4201)            |
| `npm run start:ui`       | Levanta la UI Angular en modo dev (:4200) [legacy] |
| `npm test`               | Corre todos los tests unitarios                    |
| `npm run e2e`            | Corre los tests E2E de Cypress (headless)          |
| `npm run e2e:headed`     | Corre los tests E2E con browser visible            |
| `npm run lint`           | Lint general del workspace                         |
| `npm run prettier:check` | Verifica formato                                   |
| `npm run prettier:fix`   | Corrige formato                                    |

---

## Variables de entorno

### API (`apps/api/.env`)

```env
API_MONGODB_URL=mongodb://localhost:27017
API_MONGODB_DB=ltrc-ps
```

Validadas con Joi al arrancar; el API falla si faltan.

### UI React (`apps/ui-react/.env.local`)

```env
VITE_PS_API_URL=http://localhost:3000/api
VITE_CONTENT_API_URL=http://localhost:3001/api
```

Accedidas vía `import.meta.env.VITE_*`. Si no existe el archivo, se usan los valores hardcodeados en `src/lib/`.

### UI Angular legacy (`apps/ui/.env`)

```env
NX_API_BASE_URL=http://localhost:3000/api
```

---

## Módulos y rutas del API

Base: `http://localhost:3000/api`

| Método | Ruta                 | Descripción                                           |
| ------ | -------------------- | ----------------------------------------------------- |
| GET    | `/players`           | Lista paginada con filtros y sorting                  |
| POST   | `/players`           | Crear jugador (multipart/form-data con foto opcional) |
| GET    | `/players/:id`       | Detalle de un jugador                                 |
| PATCH  | `/players/:id`       | Editar jugador (multipart/form-data)                  |
| DELETE | `/players/:id`       | Eliminar jugador + foto                               |
| GET    | `/players/:id/photo` | Stream de la foto (GridFS)                            |

---

## Rutas del Frontend React (`apps/ui-react`)

| Ruta                         | Componente            | Descripción                                       |
| ---------------------------- | --------------------- | ------------------------------------------------- |
| `/`                          | —                     | Redirige a `/players`                             |
| `/login`                     | `LoginPage`           | Formulario de login (llama a ltrc-content :3001)  |
| `/home`                      | `Home`                | Reglas del club                                   |
| `/players`                   | `PlayersPage`         | Tabla paginada con búsqueda y filtro por posición |
| `/players/:id`               | `PlayerDetailPage`    | Detalle del jugador con tabs                      |
| `/players/:id/edit`          | `PlayerEditPage`      | Formulario de edición                             |
| `/ejercicios/:categoria`     | `EjerciciosCategoria` | Lista de ejercicios por categoría                 |
| `/ejercicios/:categoria/:id` | `EjercicioDetalle`    | Detalle de ejercicio                              |
| `/partidos`                  | `PartidosList`        | Lista de partidos                                 |
| `/partidos/:divisionId/:id`  | `PartidoDetalle`      | Detalle de partido                                |

Todas las rutas excepto `/login` están protegidas por `ProtectedRoute` (requieren `isAuthenticated` del Redux `authSlice`).

---

## Modelo de datos: Player

Campos principales:

- `idNumber`: DNI/cédula
- `firstName`, `lastName`, `nickName`
- `birthDate`, `email`
- `position`, `alternatePosition` (enum `PlayerPositionEnum` – 15 posiciones de rugby)
- `height` (cm), `weight` (kg)
- `address`: { street, number, floor, apartment, city, province, postalCode, country, phoneNumber }
- `clothingSizes`: { jersey, shorts, sweater, pants } (enum `ClothingSizesEnum`)
- `photoId`: referencia al archivo en GridFS
- `createdAt`, `updatedAt` (automáticos por Mongoose timestamps)

---

## Tema visual (React + Tailwind 4)

Variables CSS definidas en `apps/ui-react/src/index.css` con `@theme`:

- **Primario (rojo):** `--color-primary: #fb1e1e`
- **Secundario (azul marino):** `--color-navy: #132142`
- Clases disponibles: `bg-primary`, `bg-navy`, `text-primary`, `text-navy`, etc.

### Tema Angular legacy

- Archivo: `apps/ui/src/styles/ltrc-theme.scss`
- Selector del componente root: `ltrc-*`

---

## Estado de implementación

### Backend (API NestJS)

- [x] Modelo Player con schema Mongoose completo
- [x] CRUD completo en el API (NestJS)
- [x] Paginación y filtros en el API (`searchTerm`, `position`, sorting)
- [x] Upload/delete de fotos vía GridFS
- [x] Lib compartida `@ltrc-ps/shared-api-model` (interfaces y enums)
- [x] CI con GitHub Actions (lint + test + build)

### Frontend React (`apps/ui-react`) — PRINCIPAL

- [x] Setup Nx + Vite + React 19 + Tailwind 4
- [x] Autenticación con ProtectedRoute + Redux authSlice
- [x] AppLayout con Sidebar + Header
- [x] `PlayersPage`: tabla paginada, búsqueda, filtro por posición, sort server-side
- [x] `PlayerDetailPage`: tabs "Datos personales" e "Indumentaria"
- [x] `PlayerEditPage`: formulario completo con foto
- [x] `PlayerForm`: React Hook Form + Zod (fix de tipos en height/weight)
- [x] `PlayerDialog`: modal de creación con FormData + foto
- [x] `PlayerFilters`: búsqueda con debounce + filtro posición
- [x] TanStack Query para fetching y caché
- [x] Rutas de Ejercicios y Partidos (estructura base)

### Frontend Angular (`apps/ui`) — LEGACY

- [x] Lista de jugadores, detalle, edición
- [x] Tema Angular Material personalizado LTRC

### Pendiente

- [ ] Tests unitarios del frontend React (muy escasos)
- [ ] Tests E2E para la UI React
- [ ] Módulo de equipos, estadísticas
- [ ] No hay autenticación en el API (solo en el frontend)

---

## Convenciones de código

### React (`apps/ui-react`)

- **Componentes:** funcionales con hooks, sin class components
- **DI / Estado:** Redux Toolkit para global (`useAppSelector`/`useAppDispatch`), `useState`/`useReducer` para local
- **Fetching:** TanStack Query (`useQuery`, `useMutation`)
- **Formularios:** React Hook Form + zodResolver
- **Estilos:** Tailwind 4 con variables CSS en `@theme`
- **Naming:** camelCase para variables/hooks, PascalCase para componentes
- **Archivos:** `.tsx` para componentes, `.ts` para lógica pura

### General

- **Locale:** `es-AR` (español Argentina)
- **Commits:** mensajes en inglés, rama principal `main`
- **No usar NgModules** para código nuevo

---

## Reglas de trabajo con Claude

1. **Idioma de comunicación:** Español
2. **No asumir nada** — preguntar antes de cambios arquitectónicos
3. **No crear archivos innecesarios** — preferir editar existentes
4. **Antes de modificar un archivo, leerlo completo**
5. **No agregar autenticación extra, state management ni features no pedidas**
6. Siempre correr `npm run prettier:fix` antes de commitear
7. Los tests están en Jest (unitarios) y Cypress (E2E) — correr con `npm test` / `npm run e2e`
8. Para desarrollo React usar `npx nx serve ui-react` (:4201)
9. El frontend Angular en `apps/ui` es legacy — no agregar features nuevas allí

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**LTRC-PS** (Lost Tordos RC - Player System) is an Nx monorepo managing a sports club: players, matches, tournaments, and squads. Stack: Angular 21 frontend + NestJS 11 backend + MongoDB.

## Commands

```bash
# Development
npm run start:ui       # Angular dev server (port 4200)
npm run start:api      # NestJS dev server (port 3000)
docker-compose -f docker/docker-compose.yml up  # MongoDB

# Testing
npm test                          # All unit tests
nx test ui                        # UI unit tests only
nx test api                       # API unit tests only
nx test ui --testFile=path/to/file.spec.ts  # Single test file
npm run e2e                       # Cypress E2E (headless)
npm run e2e:headed                # Cypress E2E (browser)

# Code Quality
npm run lint                      # Lint all projects
npm run eslint:fix                # Auto-fix ESLint issues
npm run prettier:fix              # Auto-fix formatting
```

## Architecture

### Monorepo Structure

```
apps/
  ui/          # Angular 21 standalone components (es-AR locale)
  api/         # NestJS 11 with MongoDB/GridFS
  ui-e2e/      # Cypress tests
libs/
  shared/api/  # Shared TypeScript interfaces and enums (import via @ltrc-campo/shared-api-model)
bruno/         # Bruno API testing collections
docker/        # Docker Compose (MongoDB)
```

### Angular UI (`apps/ui/src/app/`)

- **Standalone components only** — no NgModules
- **New control flow syntax**: `@if`, `@for` (not `*ngIf`, `*ngFor`)
- **All components use external files**: `templateUrl` + `styleUrl` (never inline `template:` or `styles:`)
- **Routing**: Lazy-loaded feature routes. Auth guard + role guard protect `/dashboard`
- **Locale**: `es-AR` (Spanish Argentina), date format `dd/MM/yyyy`, date-fns adapter
- **State**: RxJS observables in services — no NgRx

Key directories:

- `auth/` — JWT + Google OAuth; `AuthService`, `authInterceptor`, `authGuard`, `hasRoleGuard`
- `players/` — lazy-loaded; `PlayersService` for CRUD + photo upload
- `common/` — shared components/pipes
- `app.config.ts` — DI root; `API_CONFIG_TOKEN` provides base API URL

### NestJS API (`apps/api/src/`)

- Global prefix: `/api/v1`
- Feature modules: `Auth`, `Players`, `Matches`, `Tournaments`, `Squads`, `Users`
- MongoDB via Mongoose; GridFS for player photo storage
- JWT auth with refresh token rotation; Google OAuth (domain: `lostordos.com.ar`)
- DTOs use `class-validator` with `ValidationPipe` (whitelist + transform)

### Shared Library

- Path alias: `@ltrc-campo/shared-api-model`
- Contains: player, match, squad, tournament interfaces + enums (positions, sizes, statuses)
- Import from here in both UI and API for type consistency

## Key Conventions

- **Angular components**: standalone, `templateUrl` + `styleUrl`, BEM-style CSS classes for custom components
- **API URL**: injected via `API_CONFIG_TOKEN`, default `http://localhost:3000/api/v1`
- **Roles**: `Role.USER`, `Role.ADMIN` (from `auth/roles.enum.ts`)
- **Nx targets**: use `nx run <project>:<target>` or the npm scripts defined in root `package.json`

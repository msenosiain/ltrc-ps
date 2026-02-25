# LTRC-PS Project Memory

## Project Overview
NX monorepo with:
- `apps/api` — NestJS 11 + MongoDB (Mongoose) backend
- `apps/ui` — Angular 21 frontend
- `libs/shared/api` — Shared types/interfaces/enums (alias: `@ltrc-ps/shared-api-model`)

## Backend Architecture
- Global prefix: `/api/v1`
- Auth: JWT + Google OAuth (guards: `JwtAuthGuard`, `RefreshJwtAuthGuard`)
- DB: MongoDB via Mongoose, GridFS for file storage (player photos)
- Validation: `class-validator` + `class-transformer` on all DTOs
- Pagination: Generic `PaginationDto<TFilter>` at `apps/api/src/app/shared/pagination.dto.ts`

## Players API Pattern (template to replicate)
```
apps/api/src/app/players/
├── players.module.ts
├── players.controller.ts
├── players.service.ts
├── schemas/
│   ├── player.entity.ts    (TypeScript interface + Mongoose Document)
│   └── player.schema.ts    (SchemaFactory.createForClass)
├── dto/
│   └── create-player.dto.ts
└── player-filter.dto.ts
```
- Controller prefix: `@Controller('players')`
- Routes: GET /, POST /, PATCH /:id, GET /:id, DELETE /:id, GET /:id/photo
- Service injects model via `@InjectModel(PlayerEntity.name)`
- Pagination: skip/limit + `$regex` search + dynamic sort

## Shared Library Pattern
- Interfaces in `libs/shared/api/src/interfaces/`
- Enums in `libs/shared/api/src/enums/`
- All exported from `libs/shared/api/src/index.ts`

## Matches/Events API — In Progress
See `memory/matches-api.md` for design decisions.

# shopping_list Development Guide

Backend NestJS de lista de compras colaborativa em tempo real, consumido por app Flutter.

## Stack

NestJS 11 + TypeORM (PostgreSQL) + JWT (Passport) + WebSocket nativo (`ws`) + Nodemailer + npm + Node 22. TypeScript strict. Jest + ts-jest.

## Common commands

```bash
docker compose up -d
npm install
npm run start:dev             # http://localhost:8080

npm run build
npm run lint
npm test
npm run test:e2e
npm run test:watch

cp .env.example .env
./scripts/migrate-env-to-nestjs.sh
```

Antes de PR: `npm run build` + `npm run lint` + `npm test`.

## Architecture — Clean Architecture

Fatias verticais com camadas **domain → application → infrastructure**.  
A regra de dependência: camadas internas **não** importam externas.  
O `*.module.ts` do Nest fica só em **infrastructure** (composition root / DI) — não é “arquitetura modular” de controllers/services flat.

```text
src/
  identity/
    domain/
      model/
      exception/
    application/
      dto/                 # commands / results
      port/in/             # use case contracts
      port/out/            # repository, hasher, mail, token…
      usecase/             # use case implementations
    infrastructure/
      adapter/in/web/      # AuthController, HTTP DTOs, filter
      adapter/out/
        persistence/       # TypeORM entities + adapters
        email/
        security/
      config/
      identity.module.ts   # wiring Nest only
  shoppinglist/
    domain/model/
    application/
      dto/
      port/in/
      port/out/
      usecase/
    infrastructure/
      adapter/in/websocket/
      adapter/out/persistence/
      shoppinglist.module.ts
  app.module.ts            # composition root da app
  main.ts
database/
  init.sql
```

### Camadas

| Camada | Responsabilidade | Pode depender de |
|--------|------------------|------------------|
| **domain** | Modelos e exceptions de negócio | nada de Nest/TypeORM |
| **application** | Use cases + ports (in/out) | domain |
| **infrastructure** | HTTP, WS, TypeORM, SMTP, JWT | application + domain |

**Regras**

- Controller / WS → só chama **port/in** (use case).
- Use case → só chama **port/out** + domain.
- TypeORM entities ficam em `infrastructure/.../persistence`, não no domain.
- Auth passwordless: sem senha em `users`; código por e-mail → JWT.

### Contratos Flutter

| Canal | Contrato |
|-------|----------|
| REST | `POST /auth/request-code` (202), `/auth/login` (200) |
| Auth body (login) | `{ accessToken, tokenType: "Bearer", expiresIn }` |
| Erros auth | `{ message }` com 400 / 410 / 503 |
| WS URL | `ws://host/ws/list?listId=...` (WebSocket nativo) |
| WS auth | header `Authorization: Bearer <accessToken>` no handshake |
| WS events | `ITEM_ADDED` in → `LIST_UPDATED` out; JSON em inglês |

### Persistência

- Tabelas: `users`, `email_verification_code`, `shopping_list_items`.
- Dev: `TYPEORM_SYNC=true` (default); `database/init.sql` para volume novo.
- SQL: snake_case; TypeScript ORM: camelCase + `@Column({ name: '...' })`.

### Auth

- JWT `sub` = `users.id`.
- `/auth/**` público (request-code / login).
- `/ws/list` exige Bearer JWT válido no handshake.
- Rotas HTTP futuras: `JwtAuthGuard` + `Authorization: Bearer …`.

## Conventions

- Código-fonte em **inglês**.
- JSON da API/WS em **inglês**.
- Secrets só via `.env` / `ConfigService`. O agente **nunca** lê/edita `.env` (só `.env.example`).
- Conventional Commits preferidos (`feat:`, `fix:`, `chore:`…).
- Testes: unitários nos use cases (mock de ports); e2e em `test/`.
- Mudanças cirúrgicas: só o necessário para o pedido.

## Skills

| Skill | Quando usar |
|-------|-------------|
| `nest-feature-builder` | Nova fatia Clean Arch |
| `typeorm-schema-updater` | Mudança de tabela/coluna |
| `auth-endpoint-builder` | Novo endpoint em `/auth` |
| `websocket-event-builder` | Novo evento no `/ws/list` |
| `tdd-jest-driver` | Ciclo Red-Green-Refactor |

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them.
- If a simpler approach exists, say so.
- If unclear, stop and ask.

## 2. Simplicity First

**Minimum code that solves the problem.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No speculative configurability.
- If you write 200 lines and it could be 50, rewrite it.

## 3. Surgical Changes

**Touch only what you must.**

- Don't "improve" adjacent code.
- Don't refactor unrelated things.
- Match existing style.
- Remove only unused code that YOUR changes created.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

- "Add validation" → tests for invalid inputs, then make them pass.
- "Fix the bug" → reproducing test, then make it pass.

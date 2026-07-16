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

## Architecture

Composition root: `src/app.module.ts`.

```text
src/
  auth/                 # registro 2 passos, login, JWT, SMTP
    auth.module.ts
    auth.controller.ts  # HTTP
    auth.service.ts     # regras
    dto/
    entities/
    exceptions/
    mail.service.ts
    jwt.strategy.ts
    jwt-auth.guard.ts
  shopping-list/
    shopping-list.module.ts
    shopping-list.service.ts
    shopping-list.ws.ts # WebSocket nativo
    entities/
  main.ts
  app.module.ts
database/
  init.sql              # schema para Postgres novo
```

### Camadas (por feature)

| Papel | Onde |
|-------|------|
| presenter | `*.controller.ts`, `*.ws.ts`, `dto/` |
| use-cases | `*.service.ts` |
| data-access | `entities/` + `Repository` TypeORM no service |
| providers | `mail.service.ts`, JWT via `@nestjs/jwt` |

**Regras**

- Controller / WS → só chama service (sem TypeORM, Nodemailer, bcrypt).
- Service → regras + repositórios / mail / jwt.
- Entity → mapeamento de tabela.

### Contratos Flutter

| Canal | Contrato |
|-------|----------|
| REST | `POST /auth/register/request-code` (202), `/auth/register/confirm` (201), `/auth/login` (200) |
| Auth body | `{ accessToken, tokenType: "Bearer", expiresIn }` |
| Erros auth | `{ message }` com 400 / 401 / 409 / 410 / 503 |
| WS URL | `ws://host/ws/list?listId=...` (WebSocket nativo) |
| WS events | `ITEM_ADDED` in → `LIST_UPDATED` out; JSON em inglês |

### Persistência

- Tabelas: `users`, `email_verification_code`, `shopping_list_items`.
- Dev: `TYPEORM_SYNC=true` (default); `database/init.sql` para volume novo.
- SQL: snake_case; TypeScript: camelCase + `@Column({ name: '...' })`.

### Auth

- JWT `sub` = `users.id`.
- `/auth/**` e `/ws/**` públicos por enquanto.
- Rotas futuras: `JwtAuthGuard` + `Authorization: Bearer …`.

## Conventions

- Código-fonte em **inglês**.
- JSON da API/WS em **inglês**.
- Secrets só via `.env` / `ConfigService`. O agente **nunca** lê/edita `.env` (só `.env.example`).
- Conventional Commits preferidos (`feat:`, `fix:`, `chore:`…).
- Testes: `*.spec.ts` ao lado do código; e2e em `test/`.
- Mudanças cirúrgicas: só o necessário para o pedido.

## Skills

| Skill | Quando usar |
|-------|-------------|
| `nest-feature-builder` | Nova feature/módulo Nest |
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

---
name: nest-feature-builder
description: Scaffolds a Clean Architecture vertical slice for shopping_list (domain, application ports/use cases, infrastructure adapters). Use when the user asks to add a feature, use case, endpoint, or domain slice.
---

# Nest Feature Builder (Clean Architecture)

Cria uma fatia vertical com camadas Clean Architecture.

## ⚠️ CRITICAL SAFETY RULES ⚠️

- **NEVER** ler/editar `.env` (exceto `.env.example`).
- **NEVER** commit/push a menos que o usuário peça.
- **NEVER** rodar `docker compose down -v` sem confirmação.
- **NEVER** quebrar contratos Flutter sem combinar.
- **ALWAYS** ler `AGENTS.md` primeiro.
- **ALWAYS** código em inglês.
- Domain/application **não** importam Nest controllers, TypeORM entities ou Nodemailer (use cases podem usar `@Injectable` só para DI).

## Step 0 — Contexto

Espelhar `identity/` (REST) ou `shoppinglist/` (WS).

## Step 1 — Gating (português)

1. Nome da fatia (ex.: `list-members`).
2. Borda: REST, WebSocket, ou ambos?
3. Tabela nova? → `typeorm-schema-updater`.
4. Autenticado? → `JwtAuthGuard` no adapter in.

## Step 2 — Scaffold

```text
src/<slice>/
  domain/model/
  domain/exception/
  application/
    dto/
    port/in/
    port/out/
    usecase/
  infrastructure/
    adapter/in/...
    adapter/out/...
    <slice>.module.ts
```

Registrar o module de infrastructure em `app.module.ts`.

## Step 3 — Camadas

1. **domain** — tipos e exceptions puras.
2. **port/in** — abstract use case; **port/out** — abstract repos/providers.
3. **usecase** — implementa port/in; depende só de port/out + domain.
4. **adapter in** — controller/WS thin → use case.
5. **adapter out** — TypeORM/SMTP/JWT implementam port/out.
6. **module** — `{ provide: Port, useClass: Adapter }`.

## Checklist

- [ ] Domain sem framework
- [ ] Use case sem HTTP/WS/TypeORM entity
- [ ] Adapters thin
- [ ] Ports bound no module
- [ ] ORM entity no `forRoot` entities
- [ ] Contratos Flutter ok
- [ ] `npm run build` passa

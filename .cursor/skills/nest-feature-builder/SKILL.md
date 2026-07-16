---
name: nest-feature-builder
description: Scaffolds a new NestJS feature module for shopping_list (module, controller or WS, service, DTOs, entities). Use when the user asks to add a feature, module, endpoint group, or domain slice. Follows presenter → service → data-access from AGENTS.md.
---

# Nest Feature Builder

Cria uma feature Nest neste repositório com passos, gates e checklist.

## ⚠️ CRITICAL SAFETY RULES ⚠️

- **NEVER** ler, editar ou imprimir `.env` / `.env.*` (exceto `.env.example`).
- **NEVER** commit/push a menos que o usuário peça.
- **NEVER** rodar `docker compose down -v` sem confirmação explícita.
- **NEVER** quebrar contratos Flutter de `AGENTS.md` / `README.md` sem avisar e pedir ok.
- **ALWAYS** ler `AGENTS.md` antes de estruturar pastas.
- **ALWAYS** código-fonte em inglês.

## Step 0 — Contexto

1. Abrir `AGENTS.md`.
2. Espelhar `src/auth` (REST) ou `src/shopping-list` (WS + TypeORM).
3. Se o pedido for ambíguo, perguntar antes de criar arquivos.

## Step 1 — Perguntas de gating (português)

1. Nome da feature (kebab, ex.: `list-members`).
2. Borda: REST, WebSocket, ou ambos?
3. Precisa de tabela nova? Se sim → usar também `typeorm-schema-updater`.
4. Rota autenticada? Se sim → `JwtAuthGuard`.

## Step 2 — Scaffold

```text
src/<feature>/
  <feature>.module.ts
  <feature>.service.ts
  <feature>.controller.ts       # se REST
  dto/
  entities/                     # se persistir
```

Registrar em `src/app.module.ts` `imports`.

Para eventos da lista, preferir estender `shopping-list.ws.ts` / service em vez de novo path WS, salvo pedido de URL nova.

## Step 3 — Camadas

### Presenter

- Thin: DTO → service → resposta.
- Sem `Repository`, bcrypt, Nodemailer.
- HTTP: `class-validator`; `@HttpCode` explícito.

### Service

- Métodos públicos com responsabilidade clara.
- Injeta TypeORM / outros services.
- Não monta status HTTP.

### Data-access

- Entity em `entities/`.
- `TypeOrmModule.forFeature` **e** array `entities` em `app.module.ts`.

## Step 4 — Checklist

- [ ] Módulo criado e importado em `AppModule`
- [ ] Presenter thin; service com regras
- [ ] DTOs validados (se REST)
- [ ] Entities registradas (se DB)
- [ ] Contratos Flutter ok
- [ ] Sem secrets no código
- [ ] `npm run build` passa (se executado)

## Notes

- Não introduzir Socket.IO: o cliente usa WebSocket nativo.
- Não criar monorepo/`libs/` sem pedido explícito.

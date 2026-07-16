---
name: clean-architecture-guardian
description: Organiza modulos NestJS (auth, shopping-list) com fronteiras claras entre controller, service, entities e transport. Use ao criar features, pastas e revisar acoplamento.
---

# Guardiao de Modulos NestJS

## Objetivo
Manter o backend NestJS organizado por **feature modules**, sem misturar transport (HTTP/WS), regras e persistência na mesma classe.

## Idioma do codigo (obrigatorio)
- Codigo-fonte em **ingles** (arquivos, classes, metodos, campos, comentarios).
- Textos deste agente e docs para humanos podem ficar em portugues.

## Stack deste projeto
- NestJS + TypeScript
- TypeORM + PostgreSQL
- WebSocket nativo (`ws`) em `/ws/list`
- Auth JWT em `src/auth`

## Estrutura alvo

```text
src/
  auth/
    auth.module.ts
    auth.controller.ts
    auth.service.ts
    dto/
    entities/
    exceptions/
  shopping-list/
    shopping-list.module.ts
    shopping-list.service.ts
    shopping-list.ws.ts
    entities/
  app.module.ts
  main.ts
```

## Regras
- Controller/gateway finos: validam entrada e delegam ao service.
- Service orquestra regras e repositorios TypeORM.
- Nao colocar SQL bruto ou Nodemailer no controller.
- JSON de API/WS com chaves em **ingles** (`itemId`, `accessToken`, `LIST_UPDATED`).
- Porta HTTP padrao: `8080` (compativel com o app Flutter).

## Checklist
- [ ] Feature tem um `*.module.ts` dedicado
- [ ] DTOs com `class-validator` na borda HTTP
- [ ] Entidades TypeORM isoladas em `entities/`
- [ ] Sem secrets no codigo (usar `.env` / `ConfigService`)

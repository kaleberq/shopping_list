---
name: rest-websocket-adapter
description: Cria controllers HTTP e servidores WebSocket NestJS alinhados aos contratos do Flutter. Use ao expor rotas REST, eventos WS e mapeamento de erros HTTP.
---

# Adaptador HTTP e WebSocket (NestJS)

## Objetivo
Manter adaptadores de entrada finos e contratos estaveis com o cliente Flutter.

## Idioma
Codigo e chaves JSON em **ingles**.

## REST (auth)

| Metodo | Path | Status |
|--------|------|--------|
| POST | `/auth/register/request-code` | 202 |
| POST | `/auth/register/confirm` | 201 |
| POST | `/auth/login` | 200 |

Erros: 400 / 401 / 409 / 410 / 503 com body `{ "message": "..." }`.

## WebSocket

- URL: `ws://host/ws/list?listId=...` (WebSocket **nativo**, nao Socket.IO)
- Implementacao: `ShoppingListWsServer` com `ws` anexado ao HTTP server
- Ao conectar: `LIST_UPDATED`
- Entrada: `ITEM_ADDED` → service → broadcast `LIST_UPDATED`
- Outros `type`: fan-out na mesma `listId`

## Regras
- Controllers so mapeiam DTO ↔ service.
- Usar `ValidationPipe` global + filters por dominio (ex.: `AuthExceptionFilter`).
- Nao exigir JWT em `/auth/**` nem `/ws/**` ate membership existir.
- Preservar nomes de eventos e campos ja usados pelo Flutter.

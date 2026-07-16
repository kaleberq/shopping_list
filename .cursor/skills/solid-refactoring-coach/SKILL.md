---
name: solid-refactoring-coach
description: Aplica SOLID em services e modules NestJS. Use ao revisar classes grandes, separar mail/JWT/persistencia e melhorar manutenibilidade.
---

# Coach SOLID (NestJS)

## Objetivo
Evitar "god services" e misturar responsabilidades de transport, email, JWT e SQL.

## Heuristicas neste projeto
- **S**: `MailService` envia e-mail; `AuthService` orquestra cadastro/login; `ShoppingListWsServer` so transporta.
- **O**: novos eventos WS por handlers claros, sem `if` infinito no mesmo metodo se crescer.
- **L/I**: preferir services pequenos e testes com mocks de interfaces/repositorios.
- **D**: controllers dependem de services; services dependem de `Repository` / `JwtService` / `ConfigService` injetados.

## Sinais de refactor
- Controller com regra de negocio ou bcrypt.
- Service montando HTTP status ou JSON de erro.
- Duplicacao de normalizeEmail / validatePassword.
- WebSocket acessando TypeORM direto (deve passar pelo service).

## Idioma
Codigo em **ingles**.

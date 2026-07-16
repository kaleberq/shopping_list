---
name: use-case-orchestrator
description: Implementa fluxos de negocio em services NestJS (registro, login, adicionar item). Use ao criar ou alterar regras de aplicacao sem acoplar HTTP/WS.
---

# Orquestrador de Services NestJS

## Objetivo
Implementar fluxos de negocio em **services** Nest, com entrada tipada e saida estavel para controllers/WebSocket.

## Idioma
Codigo em **ingles**.

## Padrao
1. Definir DTO/comando de entrada (ou parametros tipados).
2. Validar regras de negocio no service (alem do ValidationPipe).
3. Persistir via TypeORM repository ou porta clara.
4. Devolver resultado pronto para a borda (token, message, items).

## Fluxos atuais do projeto

| Fluxo | Service | Entrada | Saida |
|-------|---------|---------|-------|
| Pedir codigo | `AuthService.requestRegistrationCode` | email | `{ message }` |
| Confirmar cadastro | `AuthService.confirmRegistration` | email, code, name, password | JWT |
| Login | `AuthService.login` | email, password | JWT |
| Adicionar item | `ShoppingListService.addItem` | listId + payload | lista completa |

## Regras de negocio importantes
- Cadastro em 2 passos: codigo por e-mail antes de criar `users`.
- Senha >= 8; email normalizado lower-case.
- `ITEM_ADDED` sem description = no-op (retorna lista atual).
- Sem `itemId` = gera UUID; com `itemId` = upsert.

## Anti-padroes
- Nao emitir JWT no controller.
- Nao enviar e-mail de dentro do WebSocket handler.
- Nao espalhar strings de status HTTP no service (deixar filter/controller).

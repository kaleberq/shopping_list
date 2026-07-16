# Agentes de Backend (NestJS)

Skills alinhadas ao stack atual: **NestJS + TypeORM + PostgreSQL + WebSocket nativo**.

## Idioma do codigo

Todo codigo-fonte (TypeScript, testes, scripts) em **ingles**. Textos dos agentes podem ficar em portugues.

## Contexto

- Backend para app Flutter (lista de compras colaborativa).
- Modulos: `auth`, `shopping-list`.
- Auth REST + JWT; itens persistidos em `shopping_list_items`; sync via `/ws/list`.

## Skills

| Skill | Uso |
|-------|-----|
| `clean-architecture-guardian` | Estrutura de modulos Nest / fronteiras |
| `use-case-orchestrator` | Regras em services |
| `tdd-test-driver` | Jest Red-Green-Refactor |
| `rest-websocket-adapter` | Controllers HTTP + WS |
| `persistence-port-implementer` | TypeORM / SQL |
| `solid-refactoring-coach` | Refino SOLID |

## Fluxo recomendado

1. Modulo/pastas (`clean-architecture-guardian`)
2. Service/fluxo (`use-case-orchestrator`)
3. TDD (`tdd-test-driver`)
4. HTTP/WS (`rest-websocket-adapter`)
5. Persistencia (`persistence-port-implementer`)
6. SOLID (`solid-refactoring-coach`)

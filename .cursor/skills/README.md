# Agent skills (shopping_list)

Workflows com regras de segurança, passos, gates e checklist para NestJS + TypeORM + WebSocket nativo.

Fonte de verdade: [`AGENTS.md`](../../AGENTS.md) (`CLAUDE.md` aponta para o mesmo arquivo).

## Skills

| Skill | Uso |
|-------|-----|
| [`nest-feature-builder`](nest-feature-builder/SKILL.md) | Nova feature/módulo Nest |
| [`typeorm-schema-updater`](typeorm-schema-updater/SKILL.md) | Tabelas/colunas |
| [`auth-endpoint-builder`](auth-endpoint-builder/SKILL.md) | Endpoints `/auth` |
| [`websocket-event-builder`](websocket-event-builder/SKILL.md) | Eventos `/ws/list` |
| [`tdd-jest-driver`](tdd-jest-driver/SKILL.md) | Red-Green-Refactor |

## Fluxo sugerido

1. Ler `AGENTS.md`
2. Feature → `nest-feature-builder`
3. Schema → `typeorm-schema-updater`
4. Auth REST → `auth-endpoint-builder`
5. Realtime → `websocket-event-builder`
6. Com testes → `tdd-jest-driver`

## Idioma

Código em **inglês**. Skills/docs para humanos podem ficar em português.

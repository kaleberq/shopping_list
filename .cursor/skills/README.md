# Agent skills (shopping_list)

Workflows para **Clean Architecture** (domain / application / infrastructure) neste backend NestJS.

Fonte de verdade: [`AGENTS.md`](../../AGENTS.md).

## Skills

| Skill | Uso |
|-------|-----|
| [`nest-feature-builder`](nest-feature-builder/SKILL.md) | Nova fatia Clean Arch |
| [`typeorm-schema-updater`](typeorm-schema-updater/SKILL.md) | Tabelas/colunas |
| [`auth-endpoint-builder`](auth-endpoint-builder/SKILL.md) | Endpoints `/auth` |
| [`websocket-event-builder`](websocket-event-builder/SKILL.md) | Eventos `/ws/list` |
| [`tdd-jest-driver`](tdd-jest-driver/SKILL.md) | Red-Green-Refactor |

## Fluxo sugerido

1. Ler `AGENTS.md`
2. Fatia → `nest-feature-builder`
3. Schema → `typeorm-schema-updater`
4. Auth REST → `auth-endpoint-builder`
5. Realtime → `websocket-event-builder`
6. Testes → `tdd-jest-driver`

---
name: tdd-test-driver
description: Conduz TDD com Jest no NestJS (unitario em services, e2e com supertest). Use ao implementar features ou corrigir bugs com ciclos Red-Green-Refactor.
---

# Motor de TDD (NestJS + Jest)

## Objetivo
Desenvolver com ciclos curtos Red → Green → Refactor usando Jest e `@nestjs/testing`.

## Idioma
Testes e codigo em **ingles**.

## Ciclo
1. **Red**: escrever teste que falha (service unitario preferencialmente).
2. **Green**: menor mudanca para passar.
3. **Refactor**: limpar sem quebrar testes.

## Onde testar
- **Unit**: `AuthService`, `ShoppingListService` (mock de `Repository` / `JwtService` / `MailService`).
- **E2E**: `test/*.e2e-spec.ts` com supertest nas rotas `/auth/*`.
- WebSocket: teste de integracao opcional com cliente `ws`.

## Comandos
```bash
npm test
npm run test:e2e
npm run test:watch
```

## Regras
- Nao commitar testes que dependem de SMTP real.
- Usar DB de teste ou mocks; nao gravar secrets em fixtures.
- Nomes: `*.spec.ts` ao lado do codigo ou em `test/` para e2e.

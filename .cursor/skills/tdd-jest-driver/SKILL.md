---
name: tdd-jest-driver
description: Drives Red-Green-Refactor with Jest for NestJS shopping_list services and e2e. Use when implementing features with tests, fixing bugs, or when the user asks for TDD.
---

# TDD Jest Driver

Ciclo Red-Green-Refactor alinhado ao `AGENTS.md`.

## Rules

- Preferir unit em services com mocks de `Repository` / `JwtService` / `MailService`.
- E2E sem SMTP real.
- Nunca gravar secrets em fixtures.

## Cycle

1. **Red** — `*.spec.ts` que falha
2. **Green** — menor mudança
3. **Refactor** — limpar sem quebrar

## Commands

```bash
npm test -- --testPathPattern=auth.service
npm run test:watch
npm run test:e2e
```

## Pattern — service unit

```typescript
const users = { findOne: jest.fn(), existsBy: jest.fn(), save: jest.fn(), create: jest.fn() };
const moduleRef = await Test.createTestingModule({
  providers: [
    AuthService,
    { provide: getRepositoryToken(User), useValue: users },
  ],
}).compile();
```

## Checklist

- [ ] Red antes do fix
- [ ] Green depois
- [ ] Sem SMTP/DB real no unitário
- [ ] Nomes em inglês

# Revisão de Clean Architecture e SOLID

Revisão da arquitetura do backend NestJS (`identity` e `shoppinglist`).

**Status:** violações listadas abaixo foram **ajustadas no código**. O desenho permanece hexagonal (domain → application → infrastructure). `@Injectable()` nos use cases continua como pragmatismo Nest para DI (aceito em `AGENTS.md` / skills).

---

## O que está alinhado

### Clean Architecture / hexagonal

- Camadas internas não importam infraestrutura (TypeORM, HTTP, SMTP).
- Controllers e WebSocket dependem de **port/in** (use cases abstratos).
- Use cases dependem de **port/out**, não de TypeORM/Nodemailer/JWT concreto.
- ORM entities ficam em `infrastructure/.../persistence`.
- Wiring em `identity.module.ts` e `shoppinglist.module.ts`.

### Fluxo de dependência

```text
HTTP/WS adapter ──► port/in (abstract) ──► UseCaseImpl ──► port/out (abstract)
                                              ▲                    ▲
                                    IdentityModule / ShoppingListModule
```

### SOLID

| Princípio | Situação |
|-----------|----------|
| **S** | Use cases por ação; catálogo de planos via `ListPlansUseCase`; seed via `PlanDefaultsEnsurer` |
| **O** | Adapters trocáveis; erros de domínio tipados (filtro por `instanceof`) |
| **L** | `EmailNotFoundException` vs `UserNotFoundException`; repositório lança exceptions de domínio |
| **I** | `PlanRepository` (query) separado de `PlanDefaultsEnsurer` (seed) |
| **D** | Dependência de abstrações; binding no composition root |

---

## Ajustes aplicados (antes → depois)

### 1. Application e Nest (`@Injectable`)

**Mantido de propósito.** Use cases usam `@Injectable()` só para DI Nest. Remover exigiria factories manuais sem ganho prático neste projeto.

### 2. Filtro HTTP sem TypeORM

`AuthExceptionFilter` não importa mais `QueryFailedError`. Unique violation permanece mapeada só no `TypeOrmUserRepository` → `EmailAlreadyInUseException`.

### 3. `GET /auth/plans` via use case

`ListPlansUseCase` + `PlanRepository.findAll()` — catálogo vem do banco, não hardcoded no controller.

### 4. `EmailVerificationCode` no domain

Movido para `identity/domain/model/email-verification-code.ts`. Port/out e adapter usam o modelo de domínio.

### 5. Descrição vazia no add item

`EmptyItemDescriptionException` no domain de shoppinglist. Use case lança em vez de no-op silencioso. WS ignora o erro sem broadcast.

### 6. Validação com exceptions de domínio

`AuthInputValidator` lança `InvalidEmailException`, `NameRequiredException`, `PreferredCurrencyRequiredException`, `InvalidPreferredCurrencyException`. Filtro mapeia por `instanceof`, não por string.

### 7. JWT no WebSocket

`/ws/list` exige `Authorization: Bearer <accessToken>` no handshake (`verifyClient` + `JwtService`). `ShoppingListModule` importa `IdentityModule` (exporta `JwtModule`) para alinhar com `AGENTS.md`.

### SOLID adicionais

| Item | Ajuste |
|------|--------|
| `PasswordHasher` | Renomeado para `VerificationCodeHasher` / `BcryptVerificationCodeHasher` |
| `PlanRepository.ensureDefaults` | Extraído para port `PlanDefaultsEnsurer` |
| `UserNotFoundException` = "Email not found" | Separado: `EmailNotFoundException` (login/request-code) e `UserNotFoundException` (por id) |
| Repo com `Error` genérico | `TypeOrmUserRepository` lança `InvalidPlanCodeException` / `UserNotFoundException` |

---

## Dívida restante (não bloqueante)

| Item | Nota |
|------|------|
| Domínio ainda enxuto | `User` / `ShoppingListItem` são tipos; aggregate `ShoppingList` (ownership/membros) segue no roadmap |
| `AuthController` + currencies | `GET /auth/currencies` lê constante de domínio — aceitável; split de controller opcional |
| Cross-slice JWT | `shoppinglist` → `IdentityModule` só para `JwtModule`; shared kernel seria o próximo passo se crescer |
| `@Injectable` na application | Trade-off Nest documentado |

---

## Resumo

| Área | Nota |
|------|------|
| Estrutura / fatias | Boa |
| Regra de dependência | Boa (`@Injectable` aceito) |
| DIP / ports | Boa |
| Domínio | Melhor (exceptions + modelo de código); aggregate de lista ainda futuro |
| SOLID | Alinhado nos pontos da revisão |
| Docs vs WS JWT | Alinhado |

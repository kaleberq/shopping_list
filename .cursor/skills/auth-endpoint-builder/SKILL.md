---
name: auth-endpoint-builder
description: Adds or changes REST auth endpoints under /auth in shopping_list NestJS. Use when the user asks for login, register, JWT, password, verification code, or AuthController changes. Preserves Flutter HTTP contracts unless explicitly changed.
---

# Auth Endpoint Builder

Workflow para endpoints em `src/identity` (adapter HTTP + use cases).

## ⚠️ CRITICAL SAFETY RULES ⚠️

- **NEVER** ler/editar `.env` (só orientar `.env.example`).
- **NEVER** logar senha, código em claro, ou JWT completo.
- **NEVER** retornar `passwordHash` / `codeHash` na resposta.
- Preservar status codes e shapes atuais salvo breaking change combinada.

## Contratos atuais

| Method | Path | Status | In | Out |
|--------|------|--------|----|-----|
| POST | `/auth/register/request-code` | 202 | `{ email }` | `{ message }` |
| POST | `/auth/register/confirm` | 201 | `{ email, code, name, password }` | token |
| POST | `/auth/login` | 200 | `{ email, password }` | token |

Erros: 400 / 401 / 409 / 410 / 503 via `AuthExceptionFilter`.

## Workflow

1. Perguntar: novo endpoint ou alteração? Autenticado?
2. Command/result em `application/dto/`
3. Port in + use case impl em `application/`
4. Port out se precisar de DB/mail/token
5. HTTP DTO + rota thin em `infrastructure/adapter/in/web/`
6. Bind no `identity.module.ts`
7. Exceptions de domínio + filter
8. Checklist

## Checklist

- [ ] DTO HTTP validado
- [ ] Use case sem HTTP status
- [ ] Controller só chama port/in
- [ ] Filter cobre novas exceptions
- [ ] Senha/código fora da resposta
- [ ] Flutter informado se contrato mudou

## Notes

- Email: trim + lower-case.
- Password mínimo 8; código 6 dígitos.
- JWT `sub` = string de `users.id`.

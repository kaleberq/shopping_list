---
name: auth-endpoint-builder
description: Adds or changes REST auth endpoints under /auth in shopping_list NestJS. Use when the user asks for login, register, JWT, password, verification code, or AuthController changes. Preserves Flutter HTTP contracts unless explicitly changed.
---

# Auth Endpoint Builder

Workflow para endpoints em `src/identity` (adapter HTTP + use cases).

## ⚠️ CRITICAL SAFETY RULES ⚠️

- **NEVER** ler/editar `.env` (só orientar `.env.example`).
- **NEVER** logar código em claro ou JWT completo.
- **NEVER** retornar `codeHash` na resposta.
- Auth é **passwordless** (sem senha em `users`).
- Cadastro (`/auth/register`) exige `name`; login (`/auth/login`) só e-mail+código.
- Preservar status codes e shapes atuais salvo breaking change combinada.

## Contratos atuais

| Method | Path | Status | In | Out |
|--------|------|--------|----|-----|
| POST | `/auth/request-code` | 202 | `{ email, purpose? }` | `{ message }` |
| POST | `/auth/register` | 201 | `{ email, code, name }` | token |
| POST | `/auth/login` | 200 | `{ email, code }` | token |

Erros: 400 / 401 / 409 / 410 / 503 via `AuthExceptionFilter`.

## Notes

- Email: trim + lower-case.
- Código 6 dígitos; `name` obrigatório no register.
- `purpose: "register"` no request-code → **409** se e-mail já existe.
- `purpose: "login"` no request-code → **401** se e-mail não existe.
- `register` cria usuário; `login` exige usuário existente.
- JWT `sub` = string de `users.id`.

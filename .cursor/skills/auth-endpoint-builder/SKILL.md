---
name: auth-endpoint-builder
description: Adds or changes REST auth endpoints under /auth in shopping_list NestJS. Use when the user asks for login, register, JWT, password, verification code, or AuthController changes. Preserves Flutter HTTP contracts unless explicitly changed.
---

# Auth Endpoint Builder

Workflow para endpoints em `src/auth`.

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
2. DTO em `src/auth/dto/*.dto.ts`
3. Método em `AuthService`
4. Rota thin em `auth.controller.ts` + `@HttpCode`
5. Exceptions + filter se status novo
6. SMTP só via `MailService`
7. Checklist

## Checklist

- [ ] DTO validado
- [ ] Service sem HTTP status
- [ ] Controller com status correto
- [ ] Filter cobre novas exceptions
- [ ] Senha/código fora da resposta
- [ ] Flutter informado se contrato mudou

## Notes

- Email: trim + lower-case.
- Password mínimo 8; código 6 dígitos.
- JWT `sub` = string de `users.id`.

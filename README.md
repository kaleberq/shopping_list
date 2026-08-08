# Shopping List Backend

Backend de uma aplicação de **lista de compras colaborativa** em tempo real, consumida por um app Flutter.

## Stack

* **NestJS** (TypeScript)
* **PostgreSQL** (usuários e códigos de verificação)
* **TypeORM**
* **JWT** + bcrypt
* **WebSocket nativo** (`ws`) em `/ws/list`
* **Nodemailer** (SMTP / Gmail)

## Estrutura

**Clean Architecture** em fatias verticais (`identity`, `shoppinglist`):

```text
src/
  identity/
    domain/ application/ infrastructure/
  shoppinglist/
    domain/ application/ infrastructure/
  app.module.ts
  main.ts
database/
  init.sql
```

Convenções: [`AGENTS.md`](AGENTS.md) e [`.cursor/skills/`](.cursor/skills/).

## Funcionalidades atuais

* Cadastro em 2 passos (código por e-mail → confirm)
* Login e emissão de JWT (`sub` = `users.id`)
* WebSocket colaborativo por `listId` com itens em **`shopping_list_items`** (PostgreSQL)

Roadmap sugerido:

1. Modelo de lista (ownership / membros)
2. Proteger WebSocket com JWT + membership

## Executando

Pré-requisitos: Node.js 22+, Docker.

```bash
cp .env.example .env   # ou migre o .env antigo:
./scripts/migrate-env-to-nestjs.sh
docker compose up -d
npm install
npm run start:dev
```

API: `http://localhost:8080`

O `.env` antigo do Spring (`spring.mail.username`, etc.) ainda é lido como fallback no envio de e-mail; o script acima também copia essas chaves para `MAIL_*`.

### Banco local

Credenciais padrão: banco/usuário/senha `shopping_list`, porta `5432`.

Reset completo:

```bash
docker compose down -v
docker compose up -d
```

## Autenticação (REST)

Passwordless: cadastro e login usam o mesmo fluxo (código por e-mail → JWT). A app guarda o token.

| Método | Path | Status |
|--------|------|--------|
| POST | `/auth/request-code` | 202 |
| POST | `/auth/verify` | 200 |

**Pedir código** (novo ou existente)

```json
{ "email": "ana@example.com" }
```

**Verificar código** — se o e-mail for novo, cria o usuário (`name` opcional; senão usa a parte antes do `@`):

```json
{
  "email": "ana@example.com",
  "code": "482910",
  "name": "Ana"
}
```

Resposta:

```json
{
  "accessToken": "...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

| Situação | HTTP |
|----------|------|
| Código enviado | 202 |
| Código ok (conta nova ou login) | 200 |
| Código inválido | 400 |
| Código expirado | 410 |
| Falha SMTP | 503 |

## WebSocket

URL: `ws://localhost:8080/ws/list?listId=SUA_LISTA`

1. Ao conectar, o servidor envia `LIST_UPDATED` com `payload.items`.
2. Cliente envia `ITEM_ADDED` com `description` (obrigatório), `price` e `expiry` opcionais.
3. Sem `itemId` → novo item; com o mesmo `itemId` → atualiza.
4. Todos na mesma `listId` recebem `LIST_UPDATED`.

```json
{
  "type": "ITEM_ADDED",
  "payload": {
    "description": "Arroz",
    "price": 22.9,
    "expiry": "2026-12-31"
  }
}
```

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

Módulos Nest típicos (sem Clean Architecture):

```text
src/
  auth/              ← registro, login, JWT, SMTP, entidades TypeORM
  shopping-list/     ← itens no Postgres + WebSocket nativo
  main.ts
  app.module.ts
database/
  init.sql           ← schema inicial (Postgres novo via Docker)
```

Convenções do agente e skills: [`AGENTS.md`](AGENTS.md) e [`.cursor/skills/`](.cursor/skills/).

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

Contratos iguais aos do app Flutter:

| Método | Path | Status |
|--------|------|--------|
| POST | `/auth/register/request-code` | 202 |
| POST | `/auth/register/confirm` | 201 |
| POST | `/auth/login` | 200 |

**Pedir código**

```json
{ "email": "ana@example.com" }
```

**Confirmar**

```json
{
  "email": "ana@example.com",
  "code": "482910",
  "name": "Ana",
  "password": "senha1234"
}
```

**Login** — mesmos campos de e-mail/senha; resposta:

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
| Conta criada / login ok | 201 / 200 |
| Código inválido | 400 |
| Código expirado | 410 |
| E-mail já cadastrado | 409 |
| Falha SMTP | 503 |
| Credenciais inválidas | 401 |

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

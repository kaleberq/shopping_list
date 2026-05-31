# Shopping List Backend

Backend de uma aplicação de **lista de compras colaborativa**.
O objetivo desta API é permitir que duas ou mais pessoas compartilhem e atualizem uma lista de compras **em tempo real**.

## Visão Geral

Este projeto fornece a infraestrutura de servidor para um aplicativo mobile desenvolvido em Flutter.

O backend será responsável por gerenciar:

* listas de compras
* itens da lista
* usuários participantes
* sincronização em tempo real entre dispositivos

A aplicação permitirá que múltiplos usuários interajam com a mesma lista simultaneamente.

Principais funcionalidades previstas:

* Criar listas de compras
* Compartilhar listas com outras pessoas
* Adicionar, editar e remover itens
* Definir quantidade e preço de cada item
* Marcar itens como comprados
* Atualização em tempo real entre usuários conectados

## Tecnologias Utilizadas

O backend é desenvolvido utilizando as seguintes tecnologias:

* Java 17
* Spring Boot
* Gradle
* WebSocket (atualizações em tempo real)
* REST API
* **PostgreSQL** (persistência)
* Spring Data JPA + **Flyway** (migrações versionadas)
* Autenticação por e-mail/senha com **JWT** (fatia `identity`; OAuth opcional no futuro)

## Arquitetura

O backend usa **Arquitetura Limpa** (Clean Architecture / Ports & Adapters) em **fatias verticais** (`shoppinglist`, `identity`). **Não é MVVM** — MVVM é padrão de UI (ex.: Flutter); aqui a separação é **domain → application → infrastructure**.

Convenção de nomes:

| Tipo | Onde | Exemplo |
|------|------|---------|
| Interface (porta de entrada) | `application/port/in/` | `AddListItemUseCase` |
| Implementação do caso de uso | `application/usecase/` | `AddListItemUseCaseImpl` |
| Interface (porta de saída) | `application/port/out/` | `UserRepository` |
| Adaptador concreto | `infrastructure/adapter/` | `JpaUserRepository`, `SmtpVerificationCodeSender` |

A feature de lista de compras está na fatia vertical **`shoppinglist`**: o domínio e a aplicação não dependem de WebSocket, Spring Web nem de onde os dados são guardados (hoje em memória, amanhã em banco).

### O que foi feito na reorganização

- O código que estava em `websocket/` e `config/` foi **movido** para dentro de `shoppinglist/`, separando **regras de negócio** (caso de uso), **contratos** (portas), **modelo** (domínio) e **detalhes técnicos** (WebSocket, repositório em memória, Jackson).
- A lista de itens por `listId` passou a ficar no adaptador **`InMemoryShoppingListRepository`**, atrás da porta **`ShoppingListRepository`**. Assim, trocar memória por JPA/PostgreSQL exige mudar sobretudo a **infraestrutura**, não o caso de uso.
- O **handler WebSocket** virou apenas **adaptador de entrada**: lê JSON, monta `AddListItemCommand`, chama `AddListItemUseCase`, lê a lista atual e envia `LIST_UPDATED` para as sessões da mesma sala.

### Caminho base no código-fonte

Pacote raiz da feature:

`src/main/java/br/com/shoppinglist/shopping_list/shoppinglist/`

Árvore de pastas:

```text
shoppinglist/
  domain/model/                    ← entidades do negócio (puro Java)
  application/
    dto/                           ← dados que entram nos casos de uso (comandos)
    port/in/                       ← interfaces: o que a aplicação oferece (API interna)
    port/out/                      ← interfaces: o que a aplicação precisa do mundo externo
    usecase/                       ← implementação dos fluxos (orquestra domínio + portas)
  infrastructure/
    adapter/in/websocket/          ← WebSocket: protocolo, sessões, mensagens JSON
    adapter/out/persistence/       ← implementação da porta de persistência (hoje em memória)
    config/                        ← beans de infraestrutura (ex.: ObjectMapper)
```

O arranque do Spring Boot continua em `ShoppingListApplication` (`br.com.shoppinglist.shopping_list`), que **escaneia** todos os subpacotes, inclusive `shoppinglist`.

### Responsabilidade de cada camada

| Camada | Responsabilidade |
|--------|-------------------|
| **Domain** | Representar conceitos do negócio (ex.: um **item** de lista com id, descrição, preço, validade). **Sem** anotações Spring, **sem** JSON, **sem** WebSocket. É o núcleo estável do projeto. |
| **Application** | Orquestrar **casos de uso** (“adicionar item à lista”): valida entrada mínima, decide id novo vs atualização, chama a **porta de saída** para persistir e devolve o estado. **Não** conhece HTTP nem WebSocket. |
| **Infrastructure** | Detalhes concretos: **WebSocket** (quem conecta, qual URL, broadcast), **repositório em memória** (mapa em RAM), **configuração** do Jackson. Pode ser trocada sem mudar a regra central do caso de uso. |

### Responsabilidade de cada pasta (detalhe)

| Pasta | Para que serve |
|-------|----------------|
| **`domain/model/`** | Tipos que descrevem o negócio. Hoje: `ShoppingListItem`. Cresce com regras ou novos conceitos (ex.: `ShoppingList` como agregado) sem puxar framework. |
| **`application/dto/`** | Objetos de **entrada** dos use cases (comandos/queries). Hoje: `AddListItemCommand` (listId, itemId opcional, description, price, expiry). |
| **`application/port/in/`** | Contrato **entrada da aplicação**: o que outros módulos/adaptadores podem **chamar**. Hoje: `AddListItemUseCase`. |
| **`application/port/out/`** | Contrato **saída da aplicação**: o que a aplicação **precisa** do mundo externo. Hoje: `ShoppingListRepository` (listar e gravar itens por lista). |
| **`application/usecase/`** | Implementação dos portos **in**. Hoje: `AddListItemUseCaseImpl` usa `ShoppingListRepository` e `ShoppingListItem`. |
| **`infrastructure/adapter/in/websocket/`** | Tudo que é **protocolo WebSocket**: registrar rota `/ws/list`, handler de mensagens, DTO de envelope `SocketEventDTO`. Traduz JSON ↔ comando e dispara broadcasts. |
| **`infrastructure/adapter/out/persistence/`** | Implementações das portas **out**. Hoje: `InMemoryShoppingListRepository` (substituível por JPA depois). |
| **`infrastructure/config/`** | Beans que apoiam a infra (ex.: `JacksonConfig` com `ObjectMapper`). |

### Fluxo resumido (adicionar item)

1. Cliente envia WebSocket `ITEM_ADDED` → **adapter in** (`ShoppingListWebSocketHandler`).
2. Handler monta `AddListItemCommand` → chama **`AddListItemUseCase`**.
3. Use case cria/atualiza **`ShoppingListItem`** e chama **`ShoppingListRepository.saveItem`**.
4. **`InMemoryShoppingListRepository`** guarda e devolve a lista atualizada.
5. Handler monta `LIST_UPDATED` com `items` e envia a todas as sessões da mesma `listId`.

### Fatia `identity` (implementada)

Autenticação e usuários em fatia separada de `shoppinglist`, no mesmo estilo de Arquitetura Limpa:

```text
identity/
  domain/model/User
  domain/exception/
  application/
    port/in/                    ← RequestRegistrationCodeUseCase, ConfirmRegistrationUseCase, LoginUserUseCase
    port/out/                   ← UserRepository, EmailVerificationCodeRepository, PasswordHasher, TokenIssuer, VerificationCodeSender
    usecase/                    ← *UseCaseImpl, RegistrationInputValidator
    dto/
  infrastructure/
    adapter/in/web/             ← AuthController, AuthExceptionHandler
    adapter/out/persistence/    ← JPA (users, email_verification_code)
    adapter/out/email/          ← SmtpVerificationCodeSender
    config/                     ← Security (JWT), Mail, JwtProperties
```

**Cadastro em 2 passos:** o app guarda `name` e `password` localmente; o servidor só persiste um **código de verificação** em `email_verification_code` até o `confirm`. Só então cria a linha em `users` com `password_hash` (BCrypt). O domínio `User` não expõe senha.

Login por **e-mail e senha**; JWT com `tokenType: "Bearer"` e `sub` = `users.id`.

## Persistência (PostgreSQL)

O banco relacional **PostgreSQL** é a escolha para usuários, listas, itens e vínculos entre usuários e listas: transações ACID, `UNIQUE` em e-mail, FKs e boa integração com Spring Boot.

| Ambiente | Uso |
|----------|-----|
| **Produção** | PostgreSQL gerenciado (RDS, Neon, Supabase, etc.) |
| **Desenvolvimento** | PostgreSQL local via Docker (`docker-compose.yml` na raiz) |
| **Testes** | Testcontainers com PostgreSQL ou perfil de teste dedicado (futuro) |

### Modelo inicial: usuário

Tabela **`users`**:

| Coluna | Tipo | Observação |
|--------|------|------------|
| `id` | `BIGINT` PK | Auto-incremento pelo banco (`GENERATED BY DEFAULT AS IDENTITY`) |
| `email` | `VARCHAR` | Único |
| `name` | `VARCHAR` | Nome de exibição |
| `password_hash` | `VARCHAR` | BCrypt; usado no login por e-mail/senha |
| `created_at` | `TIMESTAMPTZ` | Preenchido na criação |
| `updated_at` | `TIMESTAMPTZ` | Atualizado a cada alteração |

No código Java, timestamps como **`Instant`** (UTC) no domínio; JPA/auditing na infraestrutura. O modelo de domínio `User` contém `id`, `email`, `name`, `createdAt`, `updatedAt` — **sem** `password_hash` (fica na entidade JPA / adaptador de persistência).

Tabela **`email_verification_code`** (código pendente de cadastro):

| Coluna | Tipo | Observação |
|--------|------|------------|
| `email` | `VARCHAR` PK | E-mail aguardando confirmação |
| `code_hash` | `VARCHAR` | Hash do código (não armazena o código em texto claro) |
| `expires_at` | `TIMESTAMPTZ` | Expiração (padrão 15 min) |
| `created_at` | `TIMESTAMPTZ` | Quando o código foi solicitado |

APIs protegidas e WebSocket usam **JWT emitido pelo backend** (`sub` = `users.id`).

### Flyway (migrações)

Scripts em `src/main/resources/db/migration/`:

| Versão | Arquivo | O que faz |
|--------|---------|-----------|
| V1 | `V1__create_users_table.sql` | Cria `users` |
| V2 | `V2__create_registration_verifications_table.sql` | Tabela de verificação (evoluída nas V3–V5) |
| V3 | `V3__simplify_registration_verifications.sql` | Remove `name`/`password_hash` da verificação |
| V4 | `V4__rename_to_email_verification_codes.sql` | Renomeia tabela |
| V5 | `V5__rename_email_verification_code_singular.sql` | Nome final: `email_verification_code` |

Tabela **`flyway_schema_history`**: criada e mantida pelo Flyway. Registra quais migrações já rodaram no banco (versão, script, data, sucesso). **Não edite manualmente** — o Flyway usa isso para não reaplicar scripts. Em dev, para resetar tudo: `docker compose down -v` e `docker compose up -d` (apaga o volume e reaplica V1–V5).

> **Futuro (OAuth):** quando houver login social, pode-se introduzir `user_identities` e mover ou complementar credenciais sem mudar o contrato do JWT. Não faz parte do escopo inicial.

### Stack no Gradle (persistência)

* `spring-boot-starter-data-jpa`
* `postgresql` (driver runtime)
* `spring-boot-starter-flyway` + `flyway-database-postgresql`
* `spring-boot-starter-security` + `spring-boot-starter-oauth2-resource-server` (JWT)
* `spring-boot-starter-mail` (SMTP — códigos de verificação)

Configuração do perfil **`dev`** (`application-dev.properties`):

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/shopping_list
spring.datasource.username=shopping_list
spring.datasource.password=shopping_list
spring.jpa.hibernate.ddl-auto=validate
spring.flyway.enabled=true
```

Credenciais de **SMTP** ficam no arquivo **`.env`** na raiz (ver seção abaixo). Variáveis sensíveis em produção (URL do banco, `JWT_SECRET`, senha de app) via ambiente, não versionadas no repositório.

## Estado Atual do Projeto

* Spring Boot com WebSocket em `/ws/list` e lista em **memória** (`InMemoryShoppingListRepository`).
* Fatia **`shoppinglist`**: domínio, caso de uso **adicionar item**, adaptadores WebSocket + RAM.
* Fatia **`identity`**: cadastro em 2 passos (código por e-mail), login, JWT; `users` e `email_verification_code` no PostgreSQL; SMTP via Gmail + `.env`.
* WebSocket ainda **sem** exigir token.

Roadmap técnico (ordem sugerida):

1. ~~Dependências JPA, PostgreSQL, Flyway no `build.gradle`~~
2. ~~`docker-compose` + perfil `dev` + migração Flyway (`users`)~~
3. ~~Fatia **`identity`**: registro, login, JWT (+ Security no Gradle)~~
4. ~~Verificação de e-mail no cadastro + envio SMTP real (`.env`)~~
5. Persistir listas no PostgreSQL (`ShoppingListRepository` via JPA)
6. Proteger WebSocket com JWT e membership em listas

## Funcionalidades Futuras

Algumas funcionalidades planejadas incluem:

* Login OAuth (Google/Apple), possivelmente com tabela `user_identities` e o mesmo JWT
* Compartilhamento de listas entre usuários
* Atualização em tempo real das listas
* Histórico de compras
* Controle de preços
* Sincronização entre múltiplos dispositivos

## Executando o Projeto

Pré-requisitos:

* Java 17
* Gradle
* Docker (para PostgreSQL em desenvolvimento)

### Banco local (PostgreSQL)

Na raiz do repositório:

```bash
docker compose up -d
```

Credenciais padrão do compose: banco `shopping_list`, usuário/senha `shopping_list`, porta `5432`.

### E-mail (SMTP real — uma vez)

1. Copie o exemplo na **raiz** do repositório:

```bash
cp .env.example .env
```

2. Edite `.env` com o Gmail do projeto e a **senha de app** (16 caracteres — não use a senha normal do Google). O arquivo `.env` está no `.gitignore` e não deve ser commitado.

Exemplo (`.env`):

```properties
spring.mail.username=seu@gmail.com
spring.mail.password=abcd efgh ijkl mnop
app.mail.from=seu@gmail.com
```

| Variável | Função |
|----------|--------|
| `spring.mail.username` | Login SMTP (e-mail **completo** `@gmail.com`) |
| `spring.mail.password` | Senha de app do Google (sem aspas no arquivo) |
| `app.mail.from` | Remetente exibido no e-mail (use o **mesmo** e-mail do `username`) |

Requer **verificação em 2 etapas** na conta Google. Guia senha de app: https://myaccount.google.com/apppasswords

3. Reinicie `./gradlew bootRun` após alterar o `.env`.

4. No Postman, o `"email"` do JSON é **para quem vai o código** (pode ser o mesmo Gmail ou outro e-mail que você abra).

### Aplicação

Com o Postgres rodando (`docker compose up -d`):

```bash
./gradlew bootRun
```

O perfil **`dev`** está ativo por padrão (`spring.profiles.active=dev`). Para subir sem banco (só WebSocket em memória), use outro perfil ou desative o `dev` em `application.properties`.

A aplicação sobe em:

```text
http://localhost:8080
```

### Inspecionar o banco (Database Client)

Extensão recomendada no Cursor: **Database Client** (`cweijan.vscode-database-client2`).

1. Barra lateral → ícone de banco → **New Connection** → PostgreSQL
2. Host `localhost`, porta `5432`, database/usuário/senha `shopping_list`
3. Expanda **Tables** → `users`, `email_verification_code`, `flyway_schema_history`

### Solução de problemas

| Sintoma | Causa provável | O que fazer |
|---------|----------------|-------------|
| `Connection to localhost:5432 refused` | Postgres parado | `docker compose up -d` (Docker Desktop aberto) |
| `Port 8080 was already in use` | Outro `bootRun` rodando | `lsof -i :8080 -t \| xargs kill` e subir de novo |
| `503` + mensagem sobre senha de app | SMTP incorreto no `.env` | Senha de **app**, e-mail completo em `username`, reiniciar app |
| Log Docker `not properly shut down; automatic recovery` | Container parou abrupto | Normal em dev; aguarde `ready to accept connections` |
| `401` no `request-code` | Erro antigo de SMTP mascarado | Atualize o código; falha de e-mail retorna **503** com JSON explicativo |

Reset completo do banco local (apaga dados):

```bash
docker compose down -v
docker compose up -d
```

## Objetivo

Este backend faz parte de um projeto pessoal com o objetivo de desenvolver uma aplicação de **lista de compras colaborativa em tempo real**, utilizando Flutter no aplicativo mobile e Spring Boot no servidor.

## Autenticação (REST)

Com Postgres rodando e `./gradlew bootRun`:

### Registrar (2 passos)

**1. Pedir código** — `POST http://localhost:8080/auth/register/request-code`

O app Flutter guarda `name` e `password` localmente; o servidor só precisa do e-mail para enviar o código.

```json
{
  "email": "ana@example.com"
}
```

Resposta `202`: `{ "message": "Verification code sent to your email" }`.

O código é enviado para o **e-mail que você colocou no JSON** (caixa de entrada real — Gmail, Outlook, etc.). Confira também a pasta **spam**.

Use **seu e-mail de verdade** no Postman, por exemplo:

```json
{
  "email": "seu.nome@gmail.com"
}
```

**2. Confirmar e criar conta** — `POST http://localhost:8080/auth/register/confirm`

Com o código correto, o app envia **todos** os dados; só então a conta é criada em `users`.

```json
{
  "email": "ana@example.com",
  "code": "482910",
  "name": "Ana",
  "password": "senha1234"
}
```

Resposta `201`:

```json
{
  "accessToken": "...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

O código expira em 15 minutos (`app.verification.code-expiration-minutes`). Pedir um novo código substitui o anterior para o mesmo e-mail.

Códigos HTTP comuns:

| Situação | HTTP |
|----------|------|
| Código enviado | `202` |
| Conta criada / login ok | `201` / `200` |
| Código inválido | `400` |
| Código expirado | `410` (Gone) |
| E-mail já cadastrado | `409` |
| Falha ao enviar e-mail (SMTP) | `503` |
| Login com credenciais erradas | `401` |

### Login

`POST http://localhost:8080/auth/login`

```json
{
  "email": "ana@example.com",
  "password": "senha1234"
}
```

Resposta `200`: mesmo formato do registro.

Rotas futuras protegidas: header `Authorization: Bearer <accessToken>`. `/auth/**` e `/ws/**` permanecem públicas por enquanto.

## WebSocket (lista em memória)

URL: `ws://localhost:8080/ws/list?listId=SUA_LISTA`

1. Ao **conectar**, o servidor envia `LIST_UPDATED` com `payload.items` (lista completa até agora, pode estar vazia).
2. Para **adicionar** uma linha nova, envie `ITEM_ADDED` com `description` (obrigatório), `price` e `expiry` opcionais (chaves sempre em inglês no JSON). **Não envie `itemId`** (ou deixe vazio): o servidor gera um id novo e **acumula**. Se enviar sempre o **mesmo** `itemId`, o servidor **atualiza** aquela linha.
3. Depois de cada adição, **todos** os conectados na mesma `listId` recebem de novo `LIST_UPDATED` com a lista inteira atualizada.

Exemplo de adição (contrato preferido em inglês):

```json
{
  "type": "ITEM_ADDED",
  "payload": {
    "description": "Arroz",
    "price": 22.90,
    "expiry": "2026-12-31"
  }
}
```

Exemplo de resposta (lista completa):

```json
{
  "type": "LIST_UPDATED",
  "listId": "SUA_LISTA",
  "payload": {
    "items": [
      {
        "itemId": "...",
        "description": "Arroz",
        "price": 22.9,
        "expiry": "2026-12-31"
      }
    ]
  }
}
```

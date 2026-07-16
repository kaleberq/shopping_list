---
name: persistence-port-implementer
description: Implementa entidades e repositorios TypeORM/PostgreSQL no NestJS. Use ao criar tabelas, entidades, migracoes SQL e acesso a dados sem vazar detalhes no controller.
---

# Persistencia TypeORM (NestJS)

## Objetivo
Persistir dados no PostgreSQL via TypeORM, com schema versionado em `database/init.sql` para ambientes Docker novos.

## Idioma
Codigo em **ingles**; nomes de colunas snake_case no banco.

## Tabelas atuais
- `users`
- `email_verification_code`
- `shopping_list_items` (`item_id`, `list_id`, `description`, `price`, `expiry`, timestamps)

## Padrao
1. Criar entity em `entities/`.
2. Registrar em `TypeOrmModule.forFeature` e em `entities` do `forRoot`.
3. Injetar `Repository<T>` no service.
4. Atualizar `database/init.sql` para Postgres novo (`IF NOT EXISTS`).
5. Em dev, `TYPEORM_SYNC=true` pode alinhar schema; em prod preferir SQL/migracoes.

## Regras
- Hash de senha/codigo fica na entidade/coluna (`password_hash`, `code_hash`), nunca em DTO de resposta.
- Nao retornar `passwordHash` em JSON de API.
- Indices para `email` e `list_id`.
- Credenciais so via env (`DATABASE_*`), nunca hardcoded.

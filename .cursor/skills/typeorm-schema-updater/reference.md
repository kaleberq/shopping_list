# TypeORM schema — patterns

## Alterar coluna existente

1. Atualizar a entity.
2. Em `init.sql`, manter o estado final da tabela (DB novo).
3. Em DB com dados, avisar risco do `TYPEORM_SYNC`. Mudança destrutiva exige confirmação e SQL manual:

```sql
ALTER TABLE shopping_list_items
  ADD COLUMN IF NOT EXISTS notes VARCHAR(512) NULL;
```

## Índices

```typescript
@Index('idx_shopping_list_items_list_id')
@Column({ name: 'list_id', type: 'varchar', length: 128 })
listId!: string;
```

```sql
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_list_id ON shopping_list_items (list_id);
```

## Unique

```typescript
@Column({ type: 'varchar', length: 255, unique: true })
email!: string;
```

```sql
CONSTRAINT uk_users_email UNIQUE (email)
```

## Tabelas atuais

- `users` — id, email, name, created_at, updated_at
- `email_verification_code` — email PK, code_hash, expires_at, created_at
- `shopping_list_items` — item_id PK, list_id, description, price, expiry, created_at, updated_at

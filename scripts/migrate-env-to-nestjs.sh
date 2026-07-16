#!/usr/bin/env bash
# Migra chaves Spring do .env para nomes NestJS, sem imprimir valores.
# Uso: ./scripts/migrate-env-to-nestjs.sh

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env"
EXAMPLE="$ROOT/.env.example"

if [[ ! -f "$ENV_FILE" ]]; then
  if [[ -f "$EXAMPLE" ]]; then
    cp "$EXAMPLE" "$ENV_FILE"
    echo "Created .env from .env.example (fill in MAIL_* secrets)."
    exit 0
  fi
  echo "Missing .env and .env.example" >&2
  exit 1
fi

backup="$ENV_FILE.bak.$(date +%Y%m%d%H%M%S)"
cp "$ENV_FILE" "$backup"

# Read helpers without echoing secrets
get_kv() {
  local key="$1"
  # shellcheck disable=SC2002
  grep -E "^${key}=" "$ENV_FILE" 2>/dev/null | tail -n1 | cut -d= -f2- || true
}

has_kv() {
  local key="$1"
  grep -Eq "^${key}=" "$ENV_FILE" 2>/dev/null
}

append_kv() {
  local key="$1"
  local value="$2"
  if [[ -n "$value" ]] && ! has_kv "$key"; then
    printf '%s=%s\n' "$key" "$value" >>"$ENV_FILE"
    echo "Added $key"
  else
    echo "Skipped $key (already set or empty source)"
  fi
}

# Map Spring → Nest when Nest keys are missing
append_kv "MAIL_USER" "$(get_kv 'spring.mail.username')"
append_kv "MAIL_PASSWORD" "$(get_kv 'spring.mail.password')"
append_kv "MAIL_FROM" "$(get_kv 'app.mail.from')"

# Sensible defaults if still missing
append_kv "PORT" "8080"
append_kv "DATABASE_HOST" "localhost"
append_kv "DATABASE_PORT" "5432"
append_kv "DATABASE_USER" "shopping_list"
append_kv "DATABASE_PASSWORD" "shopping_list"
append_kv "DATABASE_NAME" "shopping_list"
append_kv "TYPEORM_SYNC" "true"
append_kv "JWT_SECRET" "dev-only-change-in-production-use-at-least-32-chars"
append_kv "JWT_EXPIRATION_MINUTES" "60"
append_kv "VERIFICATION_CODE_EXPIRATION_MINUTES" "15"
append_kv "MAIL_HOST" "smtp.gmail.com"
append_kv "MAIL_PORT" "587"
append_kv "MAIL_VERIFICATION_SUBJECT" "Codigo de verificacao - Shopping List"

echo "Done. Backup: $backup"
echo "Review .env locally; do not commit it."

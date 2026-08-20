# Monetização: planos, AdMob e modos do app

Documento de produto/técnico para alinhar **AdMob**, **planos** (`free` / `paid`) e a experiência **deslogada (guest)** no backend NestJS + app Flutter.

---

## Modelo em três estados

| Estado | Ads | Conta | Escopo típico |
|--------|-----|-------|----------------|
| **Guest** (deslogado) | Sim | Não | Lista local / limitada, sem sync multi-device |
| **Free** (logado) | Sim | Sim | Sync básico, features “lite” |
| **Paid** | Não | Sim | Tudo + sem ads |

O backend já expõe `planCode` no perfil. O Flutter deriva:

- `isGuest` → sem JWT / sem sessão
- `plan.code` → `free` | `paid` (só quando logado)
- `adsEnabled` → `true` em guest e free; `false` em paid

AdMob roda **só no client**. O backend decide **plano e entitlements**; o app decide **se mostra ads**.

---

## Papel de `plans.code` vs `plans.name`

| Coluna | Uso |
|--------|-----|
| `code` | Identificador estável (`free`, `paid`): API, validação, regras, IAP |
| `name` | Rótulo de UI (`Free`, `Paid` / i18n / marketing) — pode mudar sem quebrar contrato |

---

## Gates de features (sugestão)

### Guest (com ads)

- Uma lista só no aparelho (ou `listId` anônimo frágil)
- Sem convidar membros / sem ownership real
- Limite baixo de itens (ex.: 20)
- Sem histórico, export, etc.
- CTA: “Criar conta para sincronizar”

### Free logado (com ads)

- Sync em tempo real (WebSocket `/ws/list`)
- 1–2 listas, ou N membros limitado
- Ads em momentos não críticos (abrir lista, após adicionar item — não no meio da digitação)
- Upsell: “Remover ads + listas ilimitadas”

### Paid (sem ads)

- Listas/membros ilimitados (ou limites altos)
- Zero banner / interstitial / rewarded
- Features premium (exemplos): compartilhar por link, arquivar listas, estatísticas, multi-moeda avançada, export CSV

---

## AdMob — onde colocar

| Formato | Guest / Free | Paid |
|---------|--------------|------|
| **Banner** | Tela da lista (discreto) | Não |
| **Interstitial** | Raro (sair da lista ou 1x a cada X min) | Não |
| **Rewarded** | Opcional: “Assistir → desbloquear 1 lista extra por 24h” | Não |

Paid: não carregar ads, ou carregar SDK com `adsEnabled = false`.

Não bloquear colaboração WebSocket por falha do AdMob.

---

## Contrato backend (mínimo útil)

Estender o perfil (`GET /auth/me`) com entitlements, para o Flutter **não hardcodar** regras:

```json
{
  "id": "...",
  "email": "...",
  "name": "...",
  "preferredCurrency": "BRL",
  "plan": { "code": "free", "name": "Free" },
  "entitlements": {
    "ads": true,
    "maxLists": 2,
    "maxMembersPerList": 3,
    "exportEnabled": false,
    "archiveEnabled": false
  }
}
```

| Plano | `ads` | `maxLists` (ex.) | Premium features |
|-------|-------|------------------|------------------|
| Guest | `true` (só no client) | 1 local | Não |
| Free | `true` | 1–2 | Não |
| Paid | `false` | ilimitado / alto | Sim |

Guest: regras no client (ou endpoint público de limits); **sem** linha em `plans` e **sem** JWT.

Fonte da verdade do plano após compra: **backend** (validação IAP/assinatura → `planCode = paid`), não só `SharedPreferences`.

---

## Fluxo de conversão

```text
Guest (+ ads)
  → criar conta → Free (+ ads, ganha sync)
    → IAP / assinatura → Paid (sem ads, features full)
```

Soft paywall quando bater limite (ex.: “3ª lista = paid ou rewarded ad”).

---

## Cuidados

- Consentimento de ads (UMP / ATT / LGPD) antes de personalizar anúncios
- Ads não devem atrapalhar digitação nem o handshake WS
- Guest “quase free” sem conta: evita abuso de sync no servidor
- Documentar no Flutter: mapa `plan.code` → UI de ads e locks de feature

---

## Próximos passos sugeridos

1. Fechar tabela de entitlements (valores exatos free vs paid vs guest)
2. Incluir `entitlements` em `UserProfileResult` / `GET /auth/me`
3. No Flutter: gate único `adsEnabled` + checks de limite
4. Integrar IAP e endpoint de confirmação de assinatura (atualizar `planCode`)
5. (Opcional) rewarded ads só no free, com entitlement temporário

---

## Relação com o schema atual

- Tabela `plans`: continua com `code` + `name`
- Usuário: `plan_id` → plano vigente
- Guest: fora de `users` / `plans` até o registro

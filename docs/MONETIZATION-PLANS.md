# Monetização: planos, AdMob e modos do app

Documento de produto/técnico para alinhar **AdMob**, **planos** (`free` / `premium`) e a experiência **deslogada (guest)** no backend NestJS + app Flutter.

---

## Modelo em três estados

| Estado | Ads | Conta | Escopo típico |
|--------|-----|-------|----------------|
| **Guest** (deslogado) | Sim | Não | Lista local / limitada, sem sync multi-device |
| **Free** (logado) | Sim | Sim | Sync básico, features “lite” |
| **Premium** | Não | Sim | Tudo + sem ads |

O backend já expõe `plan.id` no perfil. O Flutter deriva:

- `isGuest` → sem JWT / sem sessão
- `plan.id` / `plan.name` → plano vigente (só quando logado)
- `adsEnabled` → preferir `entitlements.ads` do backend (não hardcodar por nome)

AdMob roda **só no client**. O backend decide **plano e entitlements**; o app decide **se mostra ads**.

---

## Papel de `plans.id` vs `plans.name`

| Coluna | Uso |
|--------|-----|
| `id` | Identificador estável (`PlanId.Free = 1`, `PlanId.Premium = 2`); registro usa `PlanId.Free` |
| `name` | Rótulo de UI apenas (`Free`, `Premium`) |

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

### Premium (sem ads)

- Listas/membros ilimitados (ou limites altos)
- Zero banner / interstitial / rewarded
- Features premium (exemplos): compartilhar por link, arquivar listas, estatísticas, multi-moeda avançada, export CSV

---

## AdMob — onde colocar

| Formato | Guest / Free | Premium |
|---------|--------------|------|
| **Banner** | Tela da lista (discreto) | Não |
| **Interstitial** | Raro (sair da lista ou 1x a cada X min) | Não |
| **Rewarded** | Opcional: “Assistir → desbloquear 1 lista extra por 24h” | Não |

Premium: não carregar ads, ou carregar SDK com `adsEnabled = false`.

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
  "plan": { "id": "1", "name": "Free" },
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
| Premium | `false` | ilimitado / alto | Sim |

Guest: regras no client (ou endpoint público de limits); **sem** linha em `plans` e **sem** JWT.

Fonte da verdade do plano após compra: **backend** (validação IAP/assinatura → `planId` do Premium), não só `SharedPreferences`.

---

## Fluxo de conversão

```text
Guest (+ ads)
  → criar conta → Free (+ ads, ganha sync)
    → IAP / assinatura → Premium (sem ads, features full)
```

Soft paywall quando bater limite (ex.: “3ª lista = premium ou rewarded ad”).

---

## Cuidados

- Consentimento de ads (UMP / ATT / LGPD) antes de personalizar anúncios
- Ads não devem atrapalhar digitação nem o handshake WS
- Guest “quase free” sem conta: evita abuso de sync no servidor
- Documentar no Flutter: mapa `plan.id` / entitlements → UI de ads e locks de feature

---

## Próximos passos sugeridos

1. Fechar tabela de entitlements (valores exatos free vs premium vs guest)
2. Incluir `entitlements` em `UserProfileResult` / `GET /auth/me`
3. No Flutter: gate único `adsEnabled` + checks de limite
4. Integrar IAP e endpoint de confirmação de assinatura (atualizar `planId`)
5. (Opcional) rewarded ads só no free, com entitlement temporário

---

## Relação com o schema atual

- Tabela `plans`: `id` + `name` (`Free`, `Premium`)
- Usuário: `plan_id` → plano vigente
- Guest: fora de `users` / `plans` até o registro

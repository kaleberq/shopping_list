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
* Banco de dados (planejado: PostgreSQL)

## Arquitetura

A feature de lista de compras está na fatia vertical **`shoppinglist`**, em **Arquitetura Limpa**: o domínio e a aplicação não dependem de WebSocket, Spring Web nem de onde os dados são guardados (hoje em memória, amanhã em banco).

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

## Estado Atual do Projeto

* Spring Boot com WebSocket em `/ws/list` e lista em **memória** (repositório `InMemoryShoppingListRepository`).
* Fatia **`shoppinglist`** com domínio, caso de uso **adicionar item** e adaptadores (WebSocket + persistência em RAM).

Próximos passos sugeridos:

* Endpoints REST (se quiser além do WebSocket)
* Persistência PostgreSQL/JPA implementando a mesma `ShoppingListRepository`
* Autenticação e autorização (quando for o momento)

## Funcionalidades Futuras

Algumas funcionalidades planejadas incluem:

* Autenticação de usuários
* Compartilhamento de listas entre usuários
* Atualização em tempo real das listas
* Histórico de compras
* Controle de preços
* Sincronização entre múltiplos dispositivos

## Executando o Projeto

Pré-requisitos:

* Java 17
* Gradle

Para executar o projeto:

```id="8v9yuc"
./gradlew bootRun
```

A aplicação será iniciada em:

```id="k0v8aw"
http://localhost:8080
```

## Objetivo

Este backend faz parte de um projeto pessoal com o objetivo de desenvolver uma aplicação de **lista de compras colaborativa em tempo real**, utilizando Flutter no aplicativo mobile e Spring Boot no servidor.

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

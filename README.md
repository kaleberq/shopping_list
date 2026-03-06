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

O projeto segue uma arquitetura em camadas comum em aplicações Spring:

* **Controller** – responsável pelos endpoints da API
* **Service** – contém a lógica de negócio
* **Repository** – acesso ao banco de dados
* **Model** – entidades do domínio da aplicação
* **WebSocket** – comunicação em tempo real
* **Config** – configurações da aplicação

Estrutura inicial do projeto:

```id="lgx1ls"
src/main/java/br/com/shoppinglist/shopping_list

controller
service
repository
model
websocket
config
```

## Estado Atual do Projeto

O projeto está em fase inicial de desenvolvimento.

Primeiros passos planejados:

* Configuração do projeto Spring Boot
* Criação dos primeiros endpoints REST
* Estrutura inicial de WebSocket
* Definição das entidades principais do domínio

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

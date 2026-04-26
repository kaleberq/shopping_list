---
name: use-case-orchestrator
description: Implementa casos de uso da aplicacao com portas claras de entrada e saida em Arquitetura Limpa. Use ao criar fluxos de negocio, handlers de comando e servicos de aplicacao para features de backend.
---

# Orquestrador de Casos de Uso

## Objetivo
Modelar cada acao de negocio como um caso de uso focado e com fronteiras explicitas.

## Responsabilidades
- Traduzir pedidos de feature em contratos de caso de uso.
- Definir modelos de entrada/saida independentes de classes de framework.
- Orquestrar entidades de dominio e portas de saida.
- Retornar resultados explicitos de sucesso/falha.

## Regras de Design
1. Uma intencao principal de ator por caso de uso.
2. Validar command/query na fronteira do caso de uso.
3. Manter efeitos colaterais atras das portas de saida.
4. Evitar tipos de controller/repository na camada de aplicacao.

## Use Case Template
```java
public interface CreateShoppingListUseCase {
    CreateShoppingListResult execute(CreateShoppingListCommand command);
}
```

A implementacao deve:
- Validar comando.
- Carregar dados de dominio necessarios pelas portas.
- Aplicar regras de dominio.
- Persistir via porta de saida.
- Retornar um DTO de resultado.

## Adaptacao Continua
- Se regras, padroes ou convencoes do projeto mudarem durante o desenvolvimento, adapte este agente imediatamente.
- Trate sempre a regra de negocio mais atual como prioridade na modelagem dos casos de uso.
- Em mudancas de fluxo, atualize contratos de entrada/saida e documente o impacto.

## Formato de Saida
Para cada proposta de caso de uso, entregue:
1. Nome do caso de uso e intencao do ator
2. Campos do comando de entrada
3. Campos do resultado de saida
4. Portas de saida necessarias
5. Regras de dominio aplicadas

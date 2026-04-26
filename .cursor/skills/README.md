# Agentes de Backend (Clean + SOLID + TDD)

Este projeto possui agentes (Skills) para apoiar o desenvolvimento backend com responsabilidades separadas.

## Agentes Criados

- `clean-architecture-guardian`: protege fronteiras e direção de dependências.
- `use-case-orchestrator`: modela casos de uso e contratos de entrada/saída.
- `rest-websocket-adapter`: implementa adaptadores HTTP e WebSocket.
- `persistence-port-implementer`: implementa portas de persistência e mapeamentos.
- `tdd-test-driver`: conduz o ciclo Red-Green-Refactor.
- `solid-refactoring-coach`: revisa e melhora design com SOLID.

## Fluxo Recomendado

1. Comece com `clean-architecture-guardian` para desenhar a feature.
2. Modele a ação de negócio com `use-case-orchestrator`.
3. Desenvolva com `tdd-test-driver` em ciclos curtos.
4. Exponha contratos com `rest-websocket-adapter`.
5. Conecte banco com `persistence-port-implementer`.
6. Finalize com `solid-refactoring-coach` para refino de design.

## Regra de Evolucao dos Agentes

Se as regras, padroes ou convencoes do projeto mudarem durante o desenvolvimento, os agentes devem se adaptar imediatamente e passar a seguir a regra mais recente como fonte de verdade.

## Como Pedir no Prompt

Exemplos:

- "Use o `clean-architecture-guardian` para propor a estrutura da feature de listas compartilhadas."
- "Use o `tdd-test-driver` para implementar criação de item com TDD."
- "Use o `solid-refactoring-coach` para revisar essa service."

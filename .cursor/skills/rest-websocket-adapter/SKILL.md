---
name: rest-websocket-adapter
description: Cria adaptadores HTTP e WebSocket que mapeiam contratos externos para casos de uso da aplicacao em Spring Boot. Use ao criar controllers, handlers websocket, validacao de requisicoes e mapeamento de respostas.
---

# Adaptador REST e WebSocket

## Objetivo
Manter preocupacoes de transporte isoladas enquanto expoe contratos estaveis para os clientes.

## Responsabilidades
- Criar controllers REST e pontos de entrada websocket como adaptadores finos.
- Validar payloads de transporte e mapear para comandos de caso de uso.
- Mapear resultados/excecoes de caso de uso para respostas da API e eventos.
- Manter preocupacoes de protocolo fora das camadas de aplicacao/dominio.

## Regras
1. Controllers e handlers websocket nao devem conter regra de negocio.
2. DTOs de requisicao ficam na camada de adaptador.
3. Converter excecoes em payloads de erro consistentes.
4. Manter contratos versionados quando houver quebra de compatibilidade.

## Checklist do Adaptador
- Anotacoes de validacao de entrada e casos de borda cobertos.
- Classe ou metodo de mapeamento de DTO para comando.
- Status codes e esquema de erro claros.
- Testes de contrato para cenarios principais e de falha.

## Adaptacao Continua
- Se regras, padroes ou convencoes do projeto mudarem durante o desenvolvimento, adapte este agente imediatamente.
- Ajuste contratos HTTP/WebSocket para refletir a regra mais recente aprovada.
- Quando houver alteracao de contrato, sinalize impacto de compatibilidade e estrategia de migracao.

## Formato de Saida
Ao implementar endpoints de adaptador, entregue:
1. Contrato (rota/topico, payload, resposta)
2. Plano de mapeamento para caso de uso
3. Estrategia de tratamento de erro
4. Testes de contrato a adicionar

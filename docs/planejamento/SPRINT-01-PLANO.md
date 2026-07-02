# Sprint 01 - Plano de Execucao

Duracao sugerida: 2 semanas

Objetivo da sprint:

- Entregar base tecnica para evolucao com seguranca: estrutura, tipagem, contratos e inicio da hexagonal no fluxo de promocoes.

## Metas da sprint

1. Monorepo inicial pronto sem quebrar app atual.
2. TypeScript base habilitado.
3. Contratos compartilhados com validacao em pelo menos 1 fluxo critico.
4. Primeiro caso de uso backend extraido para camada de aplicacao.

## Escopo fechado da sprint

Inclui:

- E1-I1, E1-I2, E1-I3, E1-I4
- E2-I1
- E2-I2 (apenas rota de promocoes)
- E3-I1 (somente dominio de promocoes)

Nao inclui:

- Migracao total do frontend para framework.
- Observabilidade completa.
- Hardening total de seguranca.

## Backlog da sprint por ordem de dependencia

### Bloco A - Fundacao (dias 1 a 4)

1. Criar estrutura `apps/` e `packages/`.
2. Configurar TS base.
3. Configurar lint/format/hooks.
4. Criar CI minima.

Saida esperada:

- Repositorio padronizado e verificacoes automativas em PR.

### Bloco B - Contratos (dias 5 a 7)

1. Criar `packages/contracts` com schemas Zod:
   - PromotionSearchRequest
   - PromotionSearchResponse
   - ApiError
2. Adaptar rota de promocoes para validar entrada e saida.
3. Expor tipos para consumo no frontend.

Saida esperada:

- Rota de promocoes com contrato forte e padrao de erro unico.

### Bloco C - Hexagonal inicial (dias 8 a 10)

1. Criar modulo `packages/domain/promocoes`.
2. Criar caso de uso `buscarPromocoes` em `packages/application`.
3. Definir porta `PromotionSourcePort`.
4. Adaptar service atual para atender porta.
5. Criar testes unitarios de dominio/aplicacao.

Saida esperada:

- Fluxo de promocoes desacoplado de HTTP.

## Criterios de aceite da sprint

- `npm run lint`, `npm run typecheck`, `npm run test` executam local.
- CI roda e bloqueia merge em falha.
- API de promocoes responde payload invalido com erro estruturado.
- Caso de uso de promocoes testado sem dependencia de Express.

## Planejamento de capacidade (exemplo)

- Capacidade total: 30 pontos
- Compromisso sprint: 24 a 26 pontos
- Buffer tecnico: 4 a 6 pontos (risco de migracao)

Distribuicao sugerida:

- Fundacao: 14 pontos
- Contratos: 8 pontos
- Hexagonal inicial: 8 pontos
- Total alvo: 30 pontos (ajustar para equipe real)

## Riscos da sprint e mitigacoes

Risco 1:

- Refatoracao de estrutura quebrar imports.
  Mitigacao:
- Refatorar por etapas com smoke tests diarias.

Risco 2:

- Scope creep para frontend.
  Mitigacao:
- Congelar frontend em manutencao minima nesta sprint.

Risco 3:

- Baixa previsibilidade de tempo em CI/hook.
  Mitigacao:
- Implementar pipeline minima primeiro, sem overengineering.

## Cerimonias e checkpoints

- Kickoff tecnico: dia 1.
- Checkpoint arquitetura: dia 4.
- Checkpoint contratos: dia 7.
- Dry-run release interno: dia 10.
- Review e retro: dia 11/12.

## Definicao de pronto por issue na sprint

- Codigo implementado.
- Testes minimos no escopo.
- Documentacao de alteracao curta.
- Criterio de aceite validado por reviewer.

## Itens de demonstracao (Sprint Review)

1. CI validando gates basicos em PR.
2. Exemplo de contrato compartilhado usado no back e no front.
3. Execucao de caso de uso de promocoes sem adapter HTTP.
4. Testes unitarios do dominio rodando.

## Plano B (se houver atraso)

Ordem de corte sem perder direcao:

1. Adiar E1-I3 (hooks) mantendo lint em CI.
2. Reduzir E2-I2 para validacao apenas de request.
3. Entregar E3-I1 parcial com entidades principais.

Nao cortar:

- TS base.
- CI minima.
- Contrato compartilhado inicial.

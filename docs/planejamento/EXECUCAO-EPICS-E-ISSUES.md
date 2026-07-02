# Execucao: Epics e Issues

Este documento converte o plano macro em backlog executavel.

## Como usar

1. Criar os Epics no board.
2. Criar as issues filhas conforme a lista abaixo.
3. Aplicar labels padrao: `type:*`, `area:*`, `priority:*`, `stage:*`.
4. Planejar sprint por dependencia, nao por preferencia.
5. Nao iniciar issue sem criterio de aceite objetivo.

## Labels recomendadas

- `type:epic`
- `type:feature`
- `type:tech-debt`
- `type:test`
- `type:doc`
- `area:frontend`
- `area:backend`
- `area:architecture`
- `area:devops`
- `area:security`
- `priority:p0`
- `priority:p1`
- `priority:p2`
- `stage:0-foundation`
- `stage:1-contracts`
- `stage:2-hexagonal`

## Epic E1 - Fundacao de engenharia (P0)

Objetivo:

- Padronizar ambiente, CI e qualidade para escalar com seguranca.

Definition of Done do Epic:

- CI executa lint + typecheck + testes basicos.
- Estrutura `apps/` e `packages/` criada sem quebrar app atual.

Issues filhas:

### E1-I1 - Criar estrutura inicial de monorepo

- Tipo: `type:feature`
- Areas: `area:architecture`
- Prioridade: `priority:p0`
- Estimativa: 3 pontos
- Dependencias: nenhuma
- Entregaveis:
  - Estrutura base de pastas (`apps`, `packages`, `docs`).
  - Script de bootstrap do workspace.
- Criterios de aceite:
  - Projeto atual roda apos reorganizacao.
  - README atualizado com nova estrutura.

### E1-I2 - Configurar TypeScript base no repositorio

- Tipo: `type:feature`
- Areas: `area:architecture`, `area:backend`, `area:frontend`
- Prioridade: `priority:p0`
- Estimativa: 5 pontos
- Dependencias: E1-I1
- Entregaveis:
  - `tsconfig.base.json`.
  - `tsconfig` por app/pacote.
  - Script `typecheck` funcional.
- Criterios de aceite:
  - `npm run typecheck` passa em CI.

### E1-I3 - Padronizar lint/format/hook de commit

- Tipo: `type:tech-debt`
- Areas: `area:devops`
- Prioridade: `priority:p0`
- Estimativa: 3 pontos
- Dependencias: E1-I1
- Entregaveis:
  - ESLint + Prettier configurados.
  - Husky + lint-staged ativos.
- Criterios de aceite:
  - Commit com erro de lint e bloqueado localmente.

### E1-I4 - Pipeline CI minima

- Tipo: `type:feature`
- Areas: `area:devops`
- Prioridade: `priority:p0`
- Estimativa: 3 pontos
- Dependencias: E1-I2, E1-I3
- Entregaveis:
  - Workflow CI com install, lint, typecheck e testes.
- Criterios de aceite:
  - PR sem CI verde nao pode ser mergeado.

## Epic E2 - Contratos e tipagem fim a fim (P0)

Objetivo:

- Eliminar quebra silenciosa entre front e back.

Definition of Done do Epic:

- Todas as rotas principais com schema Zod e tipos compartilhados.

Issues filhas:

### E2-I1 - Criar pacote de contracts

- Tipo: `type:feature`
- Areas: `area:architecture`
- Prioridade: `priority:p0`
- Estimativa: 5 pontos
- Dependencias: E1-I2
- Entregaveis:
  - Schemas Zod: item, promocao, erro.
  - Tipos TS derivados.
- Criterios de aceite:
  - Front e back importam tipos do mesmo pacote.

### E2-I2 - Validacao de request/response nas APIs

- Tipo: `type:feature`
- Areas: `area:backend`
- Prioridade: `priority:p0`
- Estimativa: 5 pontos
- Dependencias: E2-I1
- Entregaveis:
  - Middleware de validacao.
  - Padrao de erro (`code`, `message`, `details`, `traceId`).
- Criterios de aceite:
  - Nenhuma rota publica aceita payload invalido sem resposta estruturada.

### E2-I3 - Cliente API tipado no frontend

- Tipo: `type:feature`
- Areas: `area:frontend`
- Prioridade: `priority:p0`
- Estimativa: 3 pontos
- Dependencias: E2-I1
- Entregaveis:
  - Modulo unico para chamadas HTTP tipadas.
- Criterios de aceite:
  - Chamadas criticas usam contratos compartilhados.

## Epic E3 - Backend hexagonal completo (P0)

Objetivo:

- Isolar regras de negocio e reduzir acoplamento com adapters.

Definition of Done do Epic:

- Casos de uso executam sem dependencia de HTTP/Firestore.

Issues filhas:

### E3-I1 - Extrair dominio de itens e promocoes

- Tipo: `type:feature`
- Areas: `area:backend`, `area:architecture`
- Prioridade: `priority:p0`
- Estimativa: 8 pontos
- Dependencias: E2-I1
- Entregaveis:
  - Entidades e value objects no `packages/domain`.
- Criterios de aceite:
  - Regras centrais cobertas por teste unitario.

### E3-I2 - Implementar casos de uso da aplicacao

- Tipo: `type:feature`
- Areas: `area:backend`
- Prioridade: `priority:p0`
- Estimativa: 8 pontos
- Dependencias: E3-I1
- Entregaveis:
  - Use cases: buscarPromocoes, criarItem, atualizarItem.
  - Portas de entrada/saida.
- Criterios de aceite:
  - Use cases sem import de Express/Firestore.

### E3-I3 - Adaptadores concretos e composition root

- Tipo: `type:feature`
- Areas: `area:backend`
- Prioridade: `priority:p0`
- Estimativa: 5 pontos
- Dependencias: E3-I2
- Entregaveis:
  - Adapter Firestore.
  - Adapter fontes de promocao.
  - Wiring em `backend.js` e `api/buscar-promocoes.js`.
- Criterios de aceite:
  - Entrypoints HTTP apenas recebem request e retornam response.

### E3-I4 - Testes unitarios e integracao do backend core

- Tipo: `type:test`
- Areas: `area:backend`
- Prioridade: `priority:p0`
- Estimativa: 5 pontos
- Dependencias: E3-I2, E3-I3
- Entregaveis:
  - Testes de dominio e aplicacao.
  - Testes de adapter critico.
- Criterios de aceite:
  - Cobertura minima acordada do core backend.

## Epic E4 - Evolucao de frontend para framework (P1)

Objetivo:

- Aumentar velocidade de desenvolvimento e confiabilidade de UI.

Definition of Done do Epic:

- Telas criticas migradas para app componentizado com paridade funcional.

Issues filhas:

### E4-I1 - Bootstrap do novo app web

- Tipo: `type:feature`
- Areas: `area:frontend`
- Prioridade: `priority:p1`
- Estimativa: 5 pontos
- Dependencias: E1-I2
- Entregaveis:
  - Base Next.js (ou React+Vite) com TS.
  - Design tokens iniciais.

### E4-I2 - Migrar dashboard principal

- Tipo: `type:feature`
- Areas: `area:frontend`
- Prioridade: `priority:p1`
- Estimativa: 8 pontos
- Dependencias: E4-I1, E2-I3

### E4-I3 - Migrar room pages e fluxo de item

- Tipo: `type:feature`
- Areas: `area:frontend`
- Prioridade: `priority:p1`
- Estimativa: 8 pontos
- Dependencias: E4-I2

### E4-I4 - E2E dos fluxos criticos de UI

- Tipo: `type:test`
- Areas: `area:frontend`
- Prioridade: `priority:p1`
- Estimativa: 5 pontos
- Dependencias: E4-I3

## Epic E5 - Observabilidade e seguranca (P1)

Objetivo:

- Melhorar operacao em producao e reduzir MTTR.

Issues filhas:

### E5-I1 - Logger estruturado e traceId

- Tipo: `type:feature`
- Areas: `area:backend`, `area:devops`
- Prioridade: `priority:p1`
- Estimativa: 3 pontos

### E5-I2 - Error tracking e alertas basicos

- Tipo: `type:feature`
- Areas: `area:devops`
- Prioridade: `priority:p1`
- Estimativa: 3 pontos

### E5-I3 - Hardening de API

- Tipo: `type:security`
- Areas: `area:security`, `area:backend`
- Prioridade: `priority:p1`
- Estimativa: 5 pontos
- Entregaveis:
  - Rate limit, headers, CORS revisado, sanitizacao.

## Dependencias criticas entre Epics

1. E1 antes de E2.
2. E2 antes de E3.
3. E2 antes de E4.
4. E3 e E4 podem rodar em paralelo apos E2.
5. E5 inicia apos E3-I3 (para ter pontos de instrumentacao maduros).

## Riscos de execucao

- Migracao estrutural travar entrega de produto.
- Escopo de frontend crescer alem do planejado.
- Duplicacao temporaria entre legado e novo app.

Mitigacoes:

- Fatiar por vertical de funcionalidade.
- Feature flags para transicao.
- Definir limites por sprint e congelar escopo da iteracao.

## Template padrao de issue

```md
## Contexto

## Objetivo

## Escopo

- Inclusoes:
- Exclusoes:

## Tarefas tecnicas

1.
2.
3.

## Criterios de aceite

- [ ]
- [ ]

## Testes

- Unitario:
- Integracao:
- E2E:

## Riscos e mitigacoes

## Dependencias
```

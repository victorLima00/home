# Plano de Evolucao Estrutural do Projeto HOME

## 1. Objetivo

Este documento define um plano completo para evoluir o projeto HOME de um MPV funcional para uma plataforma robusta, escalavel e de facil manutencao.

Objetivos principais:

- Consolidar arquitetura limpa (hexagonal) no backend.
- Elevar qualidade de frontend com base componentizada e tipada.
- Padronizar contratos, testes, observabilidade, seguranca e operacao.
- Permitir evolucao sem reescrita total e com risco controlado.

---

## 2. Estado Atual (Resumo Tecnico)

### 2.1 Pontos fortes

- Produto funcional com valor real.
- Fluxo de promocoes ativo com fallback por fonte.
- UI modernizada com visao por comodo e busca global.
- Integracao com Firestore e backup local.
- Deploy pronto para Vercel.

### 2.2 Limitacoes atuais

- Frontend em JS puro (manutencao tende a crescer em complexidade).
- Ausencia de tipagem fim-a-fim (risco de regressao silenciosa).
- Camadas parcialmente separadas (hexagonal iniciada, mas incompleta no sistema todo).
- Cobertura de testes ainda baixa para evolucao acelerada.
- Observabilidade e governanca de erros ainda basicas.

---

## 3. Visao de Arquitetura Alvo

## 3.1 Macroestrutura do repositorio (alvo)

```text
home/
  apps/
    web/                      # Frontend (Next.js ou React+Vite)
    api/                      # Backend HTTP (Express/Fastify/Nest)
  packages/
    domain/                   # Regras de negocio puras (sem framework)
    application/              # Casos de uso e portas
    infrastructure/           # Adaptadores concretos (Firestore, scraping, etc)
    contracts/                # Tipos e schemas compartilhados (Zod)
    ui/                       # Design system e componentes reutilizaveis
    config/                   # ESLint, TSConfig, Prettier, scripts comuns
  docs/
    architecture/
    adr/
    runbooks/
```

## 3.2 Arquitetura hexagonal (backend)

Camadas e responsabilidades:

- Dominio:
  - Entidades (ItemCasa, Promocao, Comodo, Prioridade).
  - Value objects (Preco, Categoria, Status).
  - Regras de negocio puras.
- Aplicacao:
  - Casos de uso (BuscarPromocoes, CriarItem, AtualizarStatus, FiltrarItens).
  - Portas de entrada/saida (interfaces).
  - Orquestracao de fluxo.
- Adaptadores (infrastructure):
  - Repositorio Firestore.
  - Cliente de fontes de promocoes (Zoom, KaBuM e futuras).
  - Cache, logger, metricas, tracing.
- Entrypoints:
  - HTTP REST (server local e serverless Vercel).
  - Jobs futuros (refresh de promocoes, consolidacoes).

Regra de ouro:

- Nada de framework no dominio.
- Aplicacao depende de interfaces, nunca de implementacao concreta.

## 3.3 Arquitetura do frontend (alvo)

- Camada de apresentacao:
  - Componentes (cards, filtros, drawer, tabelas, estados vazios).
  - Roteamento e composicao de paginas.
- Camada de estado:
  - Query/cache (TanStack Query) para dados remotos.
  - Store local (Zustand ou Context+Reducer) para UI state.
- Camada de dominio no frontend:
  - Mapeadores DTO <-> view model.
  - Regras visuais e formatacao.
- Camada de acesso:
  - Client API tipado baseado em contracts compartilhados.

---

## 4. Recomendacao de Stack

## 4.1 Frontend

Recomendacao principal:

- Next.js + TypeScript + React Query + Zod + Vitest + Playwright.

Alternativa menor impacto:

- React + Vite + TypeScript + React Query + Zod.

## 4.2 Backend

Recomendacao de curto prazo:

- Manter Express e migrar para TypeScript + Zod + arquitetura hexagonal.

Recomendacao de medio/longo prazo:

- Avaliar Fastify (performance/simplicidade) ou NestJS (estrutura enterprise).

## 4.3 Ferramentas transversais

- Monorepo: pnpm workspaces (ou npm workspaces).
- Qualidade: ESLint + Prettier + Husky + lint-staged + Commitlint.
- Testes: Vitest/Jest, Supertest, Playwright.
- Observabilidade: Pino, Sentry, OpenTelemetry (fase futura).

---

## 5. Roadmap por Estagios

## Estagio 0 - Fundacao de Engenharia (1 a 2 semanas)

Objetivo:

- Preparar terreno para escalar com confianca.

Entregaveis:

- Monorepo organizado (apps + packages).
- TypeScript configurado em todo o repositorio.
- Padroes de lint/format e hooks de commit.
- Pipeline CI minimo (lint + typecheck + testes basicos).

Tarefas:

1. Definir padrao de pastas alvo.
2. Mover codigo atual para estrutura inicial sem quebrar deploy.
3. Configurar tsconfig base e extends por pacote.
4. Adicionar scripts padrao (`lint`, `test`, `build`, `typecheck`).
5. Configurar GitHub Actions (ou equivalente).

Criterios de aceite:

- CI verde em PR com lint + typecheck.
- Projeto sobe localmente com um unico comando.

Riscos:

- Quebra de path/import.
  Mitigacao:
- Migracao em pequenos PRs com smoke test local.

---

## Estagio 1 - Contratos e Tipagem Fim-a-Fim (1 semana)

Objetivo:

- Eliminar inconsistencias entre frontend e backend.

Entregaveis:

- Pacote `packages/contracts` com schemas Zod.
- Tipos compartilhados de requests/responses.
- Validacao de entrada/saida da API.

Tarefas:

1. Modelar contratos de itens, promocoes e erros.
2. Implementar middlewares de validacao no backend.
3. Consumir tipos no frontend para API client.
4. Criar error model padrao (`code`, `message`, `details`, `traceId`).

Criterios de aceite:

- Nenhuma rota publica sem validacao de schema.
- Frontend consumindo contratos compartilhados.

---

## Estagio 2 - Hexagonal Completa no Backend (2 a 3 semanas)

Objetivo:

- Tornar backend modular, testavel e extensivel.

Entregaveis:

- `packages/domain`, `packages/application`, `packages/infrastructure`.
- Casos de uso isolados com testes unitarios.
- Entrypoints HTTP sem logica de negocio embutida.

Tarefas:

1. Extrair entidades e regras para `domain`.
2. Extrair casos de uso para `application`.
3. Definir portas:
   - ItemRepositoryPort
   - PromotionSourcePort
   - LoggerPort
4. Implementar adaptadores concretos em `infrastructure`.
5. Refatorar `backend.js` e `api/buscar-promocoes.js` para adapters finos.

Criterios de aceite:

- Regra de negocio testada sem depender de HTTP/Firestore.
- Troca de fonte de promocao sem alterar caso de uso.

---

## Estagio 3 - Modernizacao do Frontend (2 a 4 semanas)

Objetivo:

- Aumentar produtividade e qualidade de UI com arquitetura componentizada.

Entregaveis:

- Frontend em framework (Next.js recomendado).
- Componentes reutilizaveis e design tokens.
- Separacao clara entre view, estado e acesso a dados.

Tarefas:

1. Criar app web novo em paralelo (strangler pattern).
2. Migrar gradualmente telas:
   - dashboard principal
   - room pages
   - formulario de item
   - modal/drawer de promocoes
3. Implementar API client tipado.
4. Integrar estados de loading/erro/sucesso padronizados.
5. Adotar acessibilidade base (aria labels, foco, contraste).

Criterios de aceite:

- Paridade funcional com frontend atual.
- Lighthouse minimo acordado (ex.: 85+ em performance/acessibilidade).

---

## Estagio 4 - Estrategia de Dados e Integracoes (1 a 2 semanas)

Objetivo:

- Fortalecer consistencia, resiliencia e expansao de fontes.

Entregaveis:

- Contrato de persistencia versionado.
- Politica de retry/backoff para fontes de promocoes.
- Cache e deduplicacao para consultas repetidas.

Tarefas:

1. Normalizar modelo de item/promocao no dominio.
2. Criar camada de mapeamento para Firestore.
3. Implementar estrategia de timeout/retry por fonte.
4. Adicionar fonte extra de fallback (futuro).
5. Criar healthchecks por adapter externo.

Criterios de aceite:

- Falha de uma fonte nao derruba fluxo.
- Metricas de sucesso por fonte disponiveis.

---

## Estagio 5 - Qualidade e Testes em Camadas (2 semanas)

Objetivo:

- Garantir evolucao continua com seguranca.

Entregaveis:

- Piramide de testes definida e executada em CI.
- Suites de regressao para fluxos criticos.

Matriz minima de testes:

1. Unitarios (dominio/aplicacao):
   - regras de prioridade
   - calculo de status
   - selecao de consulta para promocoes
2. Integracao (adapters):
   - Firestore repository
   - clientes de promocao
   - API routes
3. E2E:
   - criar item
   - editar status
   - buscar promocao
   - navegacao por comodo

Criterios de aceite:

- Cobertura minima acordada (ex.: 70% backend core).
- E2E principal rodando em PR nightly ou pre-release.

---

## Estagio 6 - Observabilidade e Operacao (1 semana)

Objetivo:

- Reduzir MTTR e facilitar diagnostico em producao.

Entregaveis:

- Logs estruturados com correlacao (`traceId`).
- Error tracking (Sentry ou similar).
- Dashboards basicos (latencia, erro por rota, fonte promocao).

Tarefas:

1. Padronizar logger (Pino).
2. Middleware global de erro com codigos padrao.
3. Instrumentar metricas por endpoint/fonte.
4. Criar runbook de incidentes no `docs/runbooks`.

Criterios de aceite:

- Erro em producao com contexto suficiente para reproduzir.
- Alarmes para aumento anormal de falhas de fonte.

---

## Estagio 7 - Seguranca e Compliance (1 semana)

Objetivo:

- Endurecer sistema para operacao real.

Entregaveis:

- Hardening de API e cabecalhos.
- Gestao de secrets e politicas de acesso.
- Checklist de LGPD basico (dados pessoais, retencao, exclusao).

Tarefas:

1. Validar CORS, rate limit, helmet e sanitizacao.
2. Revisar credenciais e variaveis de ambiente.
3. Aplicar scanner de vulnerabilidade em dependencias.
4. Definir politica de backup/restore para Firestore.

Criterios de aceite:

- Nenhum segredo hardcoded.
- Build bloqueado para vulnerabilidades criticas.

---

## Estagio 8 - Escala e Produto (continuo)

Objetivo:

- Transformar base tecnica em acelerador de produto.

Possiveis implementacoes futuras:

- Recomendacao inteligente de itens por comodo.
- Alertas de preco com historico.
- Planejamento financeiro por etapa de obra.
- Modo colaborativo multiusuario com permissao por perfil.
- Internacionalizacao.
- App mobile (React Native/Expo) consumindo mesmas APIs.

---

## 6. Plano de Migracao Sem Parar o Produto

Estrategia: Strangler Pattern

- Manter app atual em producao.
- Construir nova estrutura em paralelo.
- Migrar modulo a modulo com feature flags.
- Encerrar legado somente com paridade e metricas estaveis.

Ordem recomendada de migracao:

1. Contratos compartilhados.
2. Backend hexagonal por casos de uso.
3. API client tipado.
4. Frontend novo por paginas prioritarias.
5. Corte final de legado.

Criterios para corte de legado:

- Paridade funcional validada.
- Sem regressao de performance relevante.
- Taxa de erro igual ou menor por 2 ciclos.

---

## 7. Governanca Tecnica

## 7.1 Definition of Done (DoD)

Uma tarefa so e concluida quando:

- Codigo com testes adequados.
- Tipagem e lint sem erro.
- Logs e erros padronizados quando aplicavel.
- Documentacao minima atualizada.
- Revisao tecnica aprovada.

## 7.2 Rituais

- Planejamento quinzenal com backlog tecnico + produto.
- Revisao arquitetural semanal curta.
- Retro mensal focada em qualidade e lead time.

## 7.3 Politicas de branch e release

- `main`: sempre deployavel.
- Feature branches curtas.
- Conventional commits.
- Release tags semanticas.

---

## 8. Backlog Estrutural Priorizado

Prioridade P0 (imediato)

1. Monorepo + TS base + CI minimo.
2. Contracts com Zod.
3. Hexagonal completa do fluxo de promocoes.
4. Testes unitarios do dominio de promocoes.

Prioridade P1 (curto prazo)

1. Migracao frontend para framework escolhido.
2. API client tipado + estados padrao.
3. Observabilidade basica.
4. Hardening de seguranca.

Prioridade P2 (medio prazo)

1. Cache e retries inteligentes por fonte.
2. Historico de preco e alertas.
3. Otimizacoes de custo/performance.

---

## 9. KPIs de Evolucao

Tecnicos:

- Tempo medio de build CI.
- Taxa de falha em deploy.
- Cobertura de testes por camada.
- Taxa de erro de API.
- Latencia media da busca de promocoes.

Produto:

- Tempo medio para adicionar item.
- Taxa de uso de busca e filtros.
- Taxa de clique em promocoes.
- Conversao de sugestao para item salvo.

Operacao:

- MTTR (tempo medio para recuperar incidente).
- Numero de incidentes por mes.

---

## 10. Cronograma de Referencia (12 semanas)

- Semanas 1-2: Estagio 0
- Semana 3: Estagio 1
- Semanas 4-6: Estagio 2
- Semanas 7-9: Estagio 3
- Semana 10: Estagio 4
- Semana 11: Estagio 5
- Semana 12: Estagios 6 e 7 (baseline)
- Estagio 8: continuo apos semana 12

Observacao:

- Ajustar cronograma pelo tamanho do time e capacidade semanal.

---

## 11. Decisoes Arquiteturais Propostas (ADRs iniciais)

ADR-001: Adotar TypeScript fim-a-fim.
ADR-002: Adotar arquitetura hexagonal no backend.
ADR-003: Adotar contratos compartilhados com Zod.
ADR-004: Adotar framework frontend (Next.js recomendado).
ADR-005: Padronizar testes por camadas.
ADR-006: Padronizar observabilidade com logs estruturados + tracking de erro.

---

## 12. Checklist de Execucao Imediata (proximos 7 dias)

1. Criar estrutura `apps/` e `packages/`.
2. Configurar TypeScript e scripts base.
3. Criar `packages/contracts` com schemas principais.
4. Migrar fluxo de promocoes para caso de uso em `application`.
5. Escrever primeiros testes unitarios de dominio/aplicacao.
6. Configurar CI com lint + typecheck + test.
7. Abrir ADRs 001 a 004 em `docs/adr`.

---

## 13. Resultado Esperado ao final da evolucao

Ao final da jornada, o projeto HOME tera:

- Arquitetura clara e extensivel.
- Menor risco de regressao.
- Time-to-market melhor para novas features.
- Base solida para escalar produto, equipe e integracoes.

---

## 14. Artefatos de Execucao

Documentos criados para tirar o plano do papel:

- [docs/planejamento/EXECUCAO-EPICS-E-ISSUES.md](docs/planejamento/EXECUCAO-EPICS-E-ISSUES.md)
- [docs/planejamento/SPRINT-01-PLANO.md](docs/planejamento/SPRINT-01-PLANO.md)
- [docs/planejamento/RACI-IMPLEMENTACAO.md](docs/planejamento/RACI-IMPLEMENTACAO.md)
- [docs/planejamento/OPERACAO-IA-IMPLEMENTACAO-COMPLETA.md](docs/planejamento/OPERACAO-IA-IMPLEMENTACAO-COMPLETA.md)
- [docs/planejamento/STATUS-EXECUCAO-IA.md](docs/planejamento/STATUS-EXECUCAO-IA.md)

Uso recomendado:

1. Planejamento macro: este arquivo.
2. Backlog executavel: EXECUCAO-EPICS-E-ISSUES.
3. Execucao da primeira iteracao: SPRINT-01-PLANO.
4. Ownership e decisao: RACI-IMPLEMENTACAO.
5. Protocolo de execucao autonoma por IA: OPERACAO-IA-IMPLEMENTACAO-COMPLETA.
6. Andamento real por lotes: STATUS-EXECUCAO-IA.

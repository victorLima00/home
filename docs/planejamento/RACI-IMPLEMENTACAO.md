# RACI de Implementacao

Objetivo:

- Definir ownership claro para acelerar execucao e reduzir bloqueios.

Legenda:

- R = Responsible (executa)
- A = Accountable (dono final)
- C = Consulted (consulta tecnica)
- I = Informed (informado)

## Papeis

- TL: Tech Lead
- BE: Backend Engineer
- FE: Frontend Engineer
- DE: DevOps Engineer
- QA: QA Engineer
- PO: Product Owner

## Matriz RACI por trilha

| Trilha                           | TL  | BE  | FE  | DE  | QA  | PO  |
| -------------------------------- | --- | --- | --- | --- | --- | --- |
| Arquitetura alvo e padroes       | A   | C   | C   | C   | I   | I   |
| Monorepo e estrutura base        | A   | R   | R   | C   | I   | I   |
| TypeScript base                  | A   | R   | R   | C   | I   | I   |
| Contratos compartilhados (Zod)   | A   | R   | C   | I   | C   | I   |
| Validacao de API                 | C   | R   | I   | I   | C   | I   |
| Hexagonal backend                | A   | R   | I   | I   | C   | I   |
| Migracao frontend para framework | C   | I   | R   | I   | C   | I   |
| Testes unitarios backend         | C   | R   | I   | I   | C   | I   |
| Testes de UI/E2E                 | I   | I   | C   | I   | R   | I   |
| CI/CD e quality gates            | C   | I   | I   | R   | C   | I   |
| Observabilidade e alertas        | C   | R   | I   | R   | C   | I   |
| Seguranca de API e secrets       | C   | R   | I   | R   | C   | I   |
| Priorizacao de backlog           | C   | I   | I   | I   | I   | A   |
| Go/No-Go de release              | A   | C   | C   | C   | C   | C   |

## Regras de decisao

1. Toda trilha deve ter exatamente 1 `A`.
2. Nao iniciar item sem `R` definido.
3. Em mudancas de contrato, FE e BE devem estar em `C` mutuo.
4. Em tema de release e incidente, TL coordena e DE executa automacao.

## Fluxo rapido de aprovacao

1. Proposta tecnica curta (1 pagina) pelo `R`.
2. Revisao do `A` em ate 24h.
3. Ajustes com `C` quando houver impacto cross-team.
4. Execucao e validacao com QA.

## Escalonamento de bloqueios

- Bloqueio tecnico > 4h: escalar para TL.
- Bloqueio de ambiente/CI: escalar para DE.
- Bloqueio de escopo/prioridade: escalar para PO.

## Cadencia de acompanhamento

- Daily: status por trilha e impedimentos.
- 2 checkpoints semanais de arquitetura (30 min).
- Review de sprint com metricas de entrega e qualidade.

## Entregaveis por papel na Sprint 01

TL:

- Validar padrao de arquitetura e definicao de pronto.

BE:

- Contratos iniciais, validacao de API e hexagonal inicial de promocoes.

FE:

- Consumo de contratos compartilhados e ajustes minimos de compatibilidade.

DE:

- Pipeline CI minima, gates e apoio em scripts de repositorio.

QA:

- Cenario de regressao para promocoes e smoke do fluxo principal.

PO:

- Priorizacao final e congelamento de escopo da sprint.

---

## Modo IA Unica (execucao completa por agente)

Quando a implementacao for conduzida integralmente por IA, os papeis viram modos operacionais do mesmo executor:

- IA-Arquiteto: assume responsabilidades de TL (definicao de recorte, dependencias e padroes).
- IA-Implementador: assume responsabilidades BE/FE (codigo e refatoracao).
- IA-DevOps: assume responsabilidades DE (scripts, CI, automacao e gates).
- IA-QA: assume responsabilidades QA (testes, regressao, validacao de aceite).
- IA-Produto-Operacional: aplica prioridade definida no plano e evita scope creep.

Regras obrigatorias no modo IA unica:

1. Cada lote deve explicitar qual modo esta ativo.
2. Nenhum lote e concluido sem validacao tecnica e funcional.
3. Mudanca de contrato exige atualizacao simultanea de consumidor e provedor.
4. Todo delta estrutural deve atualizar documentacao de planejamento.

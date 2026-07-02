# Operacao IA-First para Implementacao Completa

Objetivo:

- Adaptar a execucao do roadmap para um fluxo de implementacao completa por uma unica IA executora, com checkpoints objetivos, baixo risco de regressao e alta previsibilidade.

Escopo:

- Este guia define como a IA deve executar arquitetura, codigo, testes, validacao e documentacao de ponta a ponta.

---

## 1. Principios de execucao por IA

1. Incrementalidade obrigatoria

- Implementar em lotes pequenos e verificaveis.
- Nunca executar grandes migracoes sem gate intermediario.

2. Validacao continua

- Toda mudanca relevante deve ter validacao automatica local.
- Sem validacao, a tarefa nao e considerada pronta.

3. Zero acoplamento acidental

- Mudancas arquiteturais devem preservar fronteiras de camada.
- Regras de negocio nao podem depender de framework.

4. Compatibilidade progressiva

- Manter comportamento funcional atual enquanto evolui estrutura.
- Usar estrategia paralela e corte por paridade.

5. Rastreabilidade total

- Toda alteracao deve apontar para issue, estagio e criterio de aceite.

---

## 2. Modelo operacional da IA (single-agent)

A mesma IA atua em 4 modos internos, nesta ordem:

1. Modo Arquiteto

- Define recorte exato do lote, dependencias e impacto.

2. Modo Implementador

- Aplica alteracoes minimas necessarias no codigo.

3. Modo Validador

- Executa checks tecnicos (lint, typecheck, testes, smoke).

4. Modo Revisor

- Verifica regressao funcional e atualiza documentacao.

Regra:

- Um lote so termina apos passar pelos 4 modos.

---

## 3. Estrutura de lotes (batching)

Unidade padrao de trabalho da IA:

- 1 lote = 1 objetivo tecnico + 1 criterio de aceite mensuravel.

Tamanho recomendado:

- Ate 3 arquivos alterados por lote (ideal).
- Ate 120 linhas liquidas alteradas por lote (referencia).

Exemplo de lote valido:

- Criar schema compartilhado da busca de promocoes.
- Integrar validacao em uma rota.
- Adicionar teste de contrato da rota.

Exemplo de lote invalido:

- Migrar frontend inteiro para framework em uma unica entrega.

---

## 4. Gates obrigatorios por lote

Gate G1 - Integridade estatic

- Passar em lint e typecheck do escopo alterado.

Gate G2 - Integridade funcional

- Passar em testes unitarios/integracao do escopo.

Gate G3 - Integridade de fluxo

- Rodar pelo menos 1 smoke test do fluxo principal afetado.

Gate G4 - Integridade documental

- Atualizar docs de arquitetura/execucao quando houver mudanca estrutural.

Sem G1-G4, lote fica em status: parcial.

---

## 5. Ordem de implementacao recomendada (IA)

Fase A - Fundacao executavel

1. Estrutura de pastas alvo (sem quebrar runtime atual).
2. TypeScript base e scripts padrao.
3. CI minima com gates.

Fase B - Contratos

1. Pacote de contratos compartilhados.
2. Validacao de request/response na API de promocoes.
3. Cliente tipado no frontend.

Fase C - Hexagonal backend

1. Dominio de promocoes e itens.
2. Casos de uso e portas.
3. Adaptadores e composition root.
4. Testes do core backend.

Fase D - Frontend framework

1. Bootstrap do novo app.
2. Migracao de telas por ordem de valor.
3. Paridade funcional e corte de legado.

Fase E - Operacao

1. Observabilidade.
2. Hardening de seguranca.
3. Otimizacoes de performance/custo.

---

## 6. Checklist de pronto por lote (DoD IA)

- Escopo do lote definido em 1 frase objetiva.
- Codigo implementado e consistente com arquitetura alvo.
- Testes adicionados/ajustados para o recorte.
- Gates G1-G4 aprovados.
- Documentacao atualizada com delta da mudanca.
- Sem TODO critico aberto no codigo alterado.

---

## 7. Politica de rollback e recuperacao

Quando rollback e obrigatorio:

- Quebra de fluxo principal sem correcao no mesmo lote.
- Falha em gate critico sem diagnostico conclusivo em 2 tentativas.

Como rollback deve ser feito:

1. Reverter somente alteracoes do lote atual.
2. Preservar mudancas estaveis anteriores.
3. Registrar causa raiz e nova abordagem.

---

## 8. Controle de risco por tipo de mudanca

Baixo risco:

- Refatoracao interna sem alterar contrato externo.

Medio risco:

- Mudanca de contrato entre front e back.

Alto risco:

- Migracao de framework e reorganizacao de estrutura de runtime.

Regra:

- Alto risco exige lote menor e smoke adicional.

---

## 9. Roteiro de execucao IA para Sprint 01

Lote 1:

- Criar base TS (configs e scripts).
- Gate: typecheck inicial.

Lote 2:

- Configurar lint/format e hooks.
- Gate: lint em arquivos alterados.

Lote 3:

- Configurar CI minima.
- Gate: pipeline local equivalente.

Lote 4:

- Criar contracts de promocoes com Zod.
- Gate: teste de schema e inferencia de tipos.

Lote 5:

- Integrar validacao na rota de promocoes.
- Gate: teste de payload invalido.

Lote 6:

- Extrair dominio de promocoes.
- Gate: teste unitario de regra de negocio.

Lote 7:

- Criar caso de uso buscarPromocoes.
- Gate: teste de caso de uso com mock de porta.

Lote 8:

- Adaptar adapter atual para porta.
- Gate: smoke test da API local.

---

## 10. Convencao de branch e commits para IA

Branch naming:

- feat/stageX-loteY-descricao-curta
- fix/stageX-loteY-descricao-curta

Conventional commits:

- feat:
- fix:
- refactor:
- test:
- docs:
- chore:

Exemplo:

- feat(stage1): add shared promotion contracts with zod

---

## 11. Evidencias minimas por entrega

Cada entrega da IA deve incluir:

1. Arquivos alterados.
2. O que mudou em comportamento.
3. Comandos de validacao executados.
4. Resultado dos testes/checks.
5. Riscos residuais e proximo lote sugerido.

---

## 12. Definicao de sucesso da implementacao completa

A implementacao completa por IA sera considerada bem-sucedida quando:

- Roadmap ate Estagio 5 estiver entregue com gates estaveis.
- Arquitetura hexagonal estiver consolidada no backend.
- Contratos compartilhados estiverem ativos entre front e back.
- Frontend em framework com paridade funcional comprovada.
- CI impedir regressao basica em PR.
- Documentacao operacional estiver alinhada com o codigo final.

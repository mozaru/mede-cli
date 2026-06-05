---
title: "Apêndice C — Lista de Verificação do Ciclo Documental"
order: 0
---

# Apêndice C — Lista de Verificação do Ciclo Documental

Lista de verificação para o encerramento de cada ciclo. Pode ser usada como checklist manual ou como base para automação via mede-cli.

---

## Antes do ciclo — preparação

- [ ] Material bruto do período está acumulado no staging semântico
- [ ] Notas de reunião, decisões informais e mensagens relevantes foram capturadas
- [ ] Documentos vivos do ciclo anterior estão em versão estável (nenhuma edição avulsa pendente)

---

## Etapa 1 — Ata

- [ ] Ata produzida com nome no padrão `ata-AAAAMMDD-NNN-descricao.md`
- [ ] Número de ciclo é o consecutivo ao ciclo anterior
- [ ] Contexto e ponto de partida registrados
- [ ] Problemas identificados e mudanças de entendimento registrados
- [ ] Decisões tomadas listadas com clareza suficiente para rastreabilidade
- [ ] Encaminhamentos definidos
- [ ] Impacto documental esperado identificado (quais ADRs, ESMs, atualizações)
- [ ] Ata revisada — está como consolidação, não como transcrição

---

## Etapa 2 — ADR (quando aplicável)

- [ ] Avaliado se há decisões com impacto arquitetural relevante
- [ ] Para cada decisão estrutural: ADR produzido com nome `adr-AAAAMMDD-NNN-descricao.md`
- [ ] Número de ciclo do ADR é o mesmo da ata que o originou
- [ ] Contexto explica por que a decisão era necessária naquele momento
- [ ] Decisão declarada de forma clara e direta
- [ ] Alternativas descartadas documentadas com razão do descarte
- [ ] Consequências listadas, incluindo tradeoffs aceitos
- [ ] Se ciclo não gerou decisão arquitetural relevante: etapa pulada (não criar ADR vazio)

---

## Etapa 3 — ESM (quando aplicável)

- [ ] Avaliado se há comportamentos decididos que ainda não podem entrar nos documentos vivos
- [ ] Para cada conjunto de mudanças em transição: ESM produzido com nome `esm-AAAAMMDD-NNN.md`
- [ ] Cada item do ESM descreve o comportamento *esperado*, não o atual
- [ ] IDs dos itens seguem o padrão `ESM-AAAAMMDD-NNN-NAT-TIP-NNNN`
- [ ] Origem do ESM está referenciada (qual ata o gerou)
- [ ] Se ciclo não gerou itens em transição: etapa pulada

---

## Etapa 4 — Log de Entregas (LEG)

- [ ] LEG produzido com nome `leg-AAAAMMDD-NNN-descricao.md`
- [ ] Itens entregues listados com ID, tipo, nome, origem e status
- [ ] Itens planejados não entregues listados com motivo
- [ ] Itens novos identificados no ciclo registrados com origem na ata correspondente
- [ ] Parágrafo de resultado descreve o estado geral ao final do ciclo

---

## Etapas 5–10 — Atualização dos documentos vivos

Atualizar em sequência, respeitando as dependências:

- [ ] `requisitos-funcionais.md` — com base em ata + ADR
- [ ] `requisitos-nao-funcionais.md` — com base em ata + ADR
- [ ] `modelo-de-dados.md` — com base em requisitos + ADR
- [ ] `cronograma.md` — com base em ata + LEG
- [ ] `visao-e-escopo.md` — com base em ata + ADR + requisitos
- [ ] `readme.md` — com base em visão + requisitos + modelo

Para cada documento vivo atualizado:
- [ ] A atualização tem origem rastreável na ata do ciclo
- [ ] Nenhuma informação foi adicionada sem origem na ata ou nos artefatos derivados

---

## Etapa 11 — Situação atual

- [ ] `situacao-atual.md` atualizado com o estado consolidado do ciclo
- [ ] Indicadores (itens concluídos / pendentes) refletem o LEG
- [ ] Tabela de itens está completa e com status corretos
- [ ] Próximos ciclos refletem as pendências reais

---

## Verificação de consistência — antes de fechar o ciclo

- [ ] Os requisitos funcionais são consistentes com o modelo de dados?
- [ ] O cronograma reflete o que o LEG registrou?
- [ ] A situação atual está alinhada com a visão e escopo?
- [ ] O README está atualizado para refletir o estado atual?
- [ ] Nenhum documento vivo tem informação que contradiz outro?
- [ ] Todos os artefatos do ciclo têm o mesmo número NNN?

---

## Encerramento do ciclo

- [ ] Nenhum artefato histórico (ata, ADR, ESM, LEG anteriores) foi alterado
- [ ] Nenhuma edição avulsa nos documentos vivos ficou sem ata de origem
- [ ] IDs de itens existentes não foram renomeados
- [ ] O ciclo está pronto para ser o ponto de partida do próximo

---

## Ciclo zero — itens adicionais

Para o primeiro ciclo de um projeto, verificar também:

- [ ] Estrutura de diretórios criada: `docs/`, `docs/atas/`, `docs/adr/`, `docs/esm/`, `docs/log-entregas/`
- [ ] `entendimento-inicial.md` criado com o melhor entendimento disponível
- [ ] Premissas e incertezas do início registradas honestamente
- [ ] Documentos vivos iniciais criados (visão, requisitos, readme)
- [ ] Ritmo de ciclos definido para o projeto

---

## Referência rápida — o que cada artefato responde

| Artefato | Pergunta que responde |
|---|---|
| Ata | O que aconteceu neste ciclo? O que foi decidido? |
| ADR | Por que o sistema foi construído assim? Quais alternativas foram descartadas? |
| ESM | O que foi decidido mas ainda não está implementado? |
| LEG | O que foi efetivamente entregue neste ciclo? |
| Entendimento inicial | De onde o projeto partiu? |
| Situação atual | Onde o projeto está agora? |
| Visão e escopo | Para onde o projeto vai e por quê? |
| README | O que é este projeto e como navegar sua documentação? |

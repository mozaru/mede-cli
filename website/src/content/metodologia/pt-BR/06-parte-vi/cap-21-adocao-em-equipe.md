---
title: "Adoção em equipe: mudança cultural, não burocrática"
order: 21
---

# Capítulo 21 — Adoção em equipe: mudança cultural, não burocrática

A objeção mais comum quando a MEDE é proposta para uma equipe é previsível:

"Vai aumentar a burocracia."

É uma objeção legítima. Equipes que já carregam o peso de cerimônias ágeis, reuniões de planejamento, retrospectivas e revisões de código têm razão em questionar se mais um processo vai ajudar ou atrapalhar.

A resposta honesta: a MEDE não aumenta reuniões. Aumenta o aproveitamento das reuniões que já acontecem.

---

## O que muda e o que não muda

A MEDE não cria novas reuniões. Não exige novas ferramentas. Não redefine papéis ou responsabilidades.

O que muda é o que acontece com o conhecimento produzido nas reuniões que já existem. Hoje, numa reunião de refinamento ou de review, decisões são tomadas e entendimentos evoluem — e ao final, esse conhecimento existe apenas nas memórias dos participantes. Com a MEDE, ao final do ciclo existe um ritual de consolidação que transforma esse conhecimento em artefatos estruturados e persistentes.

A ata MEDE não é mais longa do que o resumo de reunião que já se deveria fazer. O ADR não é mais trabalhoso do que a discussão que já acontece no chat e se perde. O que muda é a disciplina de capturar — não a quantidade de trabalho gerada.

---

## Sobre papéis: coordenação, não propriedade

Em equipe, é útil definir um responsável pelo ciclo documental — alguém que garante que o ritual acontece ao final de cada sprint. Mas não um "dono exclusivo da documentação".

A responsabilidade precisa ser coordenada, não isolada. Quando a documentação é de uma pessoa só, ela para quando essa pessoa sai, fica sobrecarregada ou muda de foco. Quando é coordenada por uma pessoa mas produzida por todos, ela sobrevive às mudanças de equipe — que é exatamente o problema que a metodologia resolve.

---

## A estratégia de adoção gradual

Tentar adotar a MEDE inteira de uma vez raramente funciona. A sequência que funciona melhor:

**Primeiro: a ata.** É o artefato mais próximo do que equipes já fazem. Comece consolidando reuniões relevantes em atas estruturadas.

**Segundo: o ADR.** Quando surgir a próxima decisão arquitetural relevante, registre num ADR. Um único ADR bem escrito, que responde uma pergunta real da equipe semanas depois, vale mais do que qualquer apresentação sobre o formato.

**Terceiro: os documentos vivos.** Com atas e ADRs estabelecidos, a atualização dos documentos vivos se torna natural — eles simplesmente refletem o que as atas já registraram.

**Quarto: o ESM.** Surge naturalmente quando começa a operação real ou quando se acumula um conjunto de correções que precisam ser especificadas formalmente.

---

## O fator de adesão: o momento que convence

Existe um momento específico que costuma converter os céticos numa equipe: a chegada de um membro novo.

Sem MEDE: o novo membro passa semanas fazendo perguntas, interrompendo os outros, tentando entender o que existe e por que. O time gasta horas repetindo explicações que já foram dadas múltiplas vezes.

Com MEDE: o novo membro lê `readme.md`, depois `situacao-atual.md`, depois os ADRs recentes. Em poucas horas tem uma visão coerente do projeto. As perguntas que faz são de nível superior — não sobre o básico.

Quando a equipe experimenta esse contraste, a pergunta deixa de ser "por que documentar?" e passa a ser "por que não documentamos antes?".

---

## A MEDE no ritual ágil existente

Para equipes que já usam Scrum ou Kanban, a MEDE se encaixa sem substituir nenhum ritual:

- O **encerramento da sprint** é o momento natural para produzir a ata do ciclo
- A **review** fornece o material para o log de entregas
- A **retrospectiva** pode originar ESMs quando identifica comportamentos a corrigir
- O **refinamento** é onde decisões arquiteturais surgem e merecem ADR

---

## Primeiros 30 dias em equipe

Um plano concreto para os primeiros 30 dias de adoção:

**Semana 1 — Estabelecer o hábito da ata**
Registrar atas das reuniões mais relevantes da sprint. Não precisa ser perfeito — o objetivo é criar o hábito de consolidar antes que o conhecimento se disperse.

**Semana 2 — Criar o primeiro ADR real**
Identificar uma decisão arquitetural tomada recentemente (ou a próxima que surgir) e registrá-la com contexto, decisão, alternativas descartadas e consequências. Compartilhar com a equipe.

**Semana 3 — Atualizar os documentos de estado**
Criar ou atualizar `situacao-atual.md` e `readme.md`. Mostrar para o time o que uma pessoa nova encontraria ao chegar hoje. Coletar feedback sobre o que está faltando.

**Semana 4 — Fazer o primeiro ciclo documental completo**
Encerrar a sprint com o ritual completo: ata → ADR (se houver) → atualização dos documentos vivos → log de entregas → situação atual. Registrar quanto tempo levou. Na maior parte dos casos fica abaixo de uma hora.

Após 30 dias, a equipe tem quatro atas, pelo menos um ADR, documentos vivos atualizados, e um ritmo estabelecido. A partir daí, manutenção é mais fácil do que implantação.

---

> **Em resumo**
>
> A adoção em equipe começa por enquadrar a MEDE corretamente: não é burocracia nova, é aproveitamento melhor do que já acontece. Defina um coordenador do ciclo, não um dono exclusivo da documentação. A sequência gradual — ata, ADR, documentos vivos, ESM — reduz a curva de aprendizado. O momento que convence a maioria dos céticos é o onboarding de um novo membro. O plano de 30 dias — ata na semana 1, ADR na 2, documentos de estado na 3, ciclo completo na 4 — é o ponto de partida mais concreto.

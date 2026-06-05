---
title: "Começando do zero: implantando a MEDE em um projeto novo"
order: 15
---

# Capítulo 15 — Começando do zero: implantando a MEDE em um projeto novo

O melhor momento para adotar a MEDE é o início do projeto. Não porque seja impossível adotar depois — o próximo capítulo trata disso — mas porque começar do zero elimina a necessidade de reconstruir o que foi perdido antes da adoção.

Este capítulo descreve o passo a passo de implantação para um projeto novo, usando o caso real como referência concreta em cada etapa.

---

## Passo 1 — Criar a estrutura de diretórios

Antes de escrever qualquer documento, crie a estrutura física:

```
docs/
├── atas/
├── adr/
├── esm/
└── log-entregas/
```

Os documentos vivos ficarão na raiz de `docs/`. Os históricos nos subdiretórios.

Isso leva dois minutos. E estabelece imediatamente a separação entre presente e história que é o coração da metodologia.

---

## Passo 2 — Criar o entendimento inicial

O `entendimento-inicial.md` é o primeiro documento a ser escrito — e o único que nunca será alterado.

Ele deve capturar, com o melhor entendimento disponível naquele momento:

- O problema que o projeto resolve e para quem
- As premissas técnicas fundamentais (stack, infraestrutura, integrações previstas)
- O modelo operacional inicial (quem usa, como usa, em que contexto)
- O backlog inicial — mesmo que incompleto e sujeito a revisão
- O cronograma inicial — mesmo que estimado

No caso real, o entendimento inicial registrou a premissa de *online-first* que seria revista na semana 3. Isso é esperado e correto. O documento não precisa ser perfeito — precisa ser honesto sobre o que se sabe no momento zero. A imperfeição documentada é mais valiosa do que a perfeição imaginada.

**O que não fazer:** não esperar ter certeza sobre tudo para escrever o entendimento inicial. O documento captura o estado do conhecimento no início, não o estado ideal. Incertezas podem — e devem — ser registradas como incertezas.

---

## Passo 3 — Criar os documentos vivos iniciais

Com o entendimento inicial consolidado, crie as versões iniciais dos documentos vivos:

- `visao-e-escopo.md` — para onde o projeto vai e por quê
- `requisitos-funcionais.md` — o que o sistema deve fazer, na perspectiva do usuário
- `requisitos-nao-funcionais.md` — como o sistema deve se comportar
- `readme.md` — a porta de entrada do projeto

Esses documentos iniciais podem ser enxutos. O objetivo não é ter documentação completa no dia um — é ter documentos que evoluirão ao longo dos ciclos, com ponto de partida definido.

---

## Passo 4 — Definir o ritmo dos ciclos

Antes do primeiro ciclo evolutivo, defina a cadência:

- **Projeto com sprint semanal:** um ciclo por semana, sincronizado com a sprint
- **Projeto com geração intensiva de código:** ciclos por demanda, possivelmente múltiplos por dia
- **Projeto em manutenção:** ciclos quinzenais ou mensais

No caso real, o ritmo foi semanal — cada entrega de segunda-feira correspondia ao encerramento de um ciclo.

---

## O ciclo zero vs. os ciclos evolutivos

Um ponto que merece clareza explícita: **o ciclo zero é especial**.

O ciclo zero é o ciclo de fundação. Ele pode conter o entendimento inicial e a ata de kickoff — mas seu propósito é estabelecer a baseline, não registrar evolução. A evolução começa no ciclo 001.

A distinção prática:

| | Ciclo zero (000) | Ciclos evolutivos (001+) |
|---|---|---|
| Propósito | Fundação — criar a baseline | Evolução — consolidar mudanças |
| Artefatos | Entendimento inicial + ata de kickoff + ADRs iniciais | Ata + ADR (se houver) + ESM (se houver) + LEG + atualização dos documentos vivos |
| Entendimento inicial | Criado aqui — nunca alterado depois | Referenciado, nunca alterado |
| Pergunta respondida | "De onde o projeto parte?" | "O que mudou neste ciclo?" |

No caso real, o ciclo 000 produziu o entendimento inicial, a ata de kickoff e dois ADRs. Os ciclos 001 em diante produziram atas, ADRs adicionais, ESMs e logs de entrega — cada um registrando a evolução a partir da baseline.

---

## Passo 5 — Produzir a ata zero

O kickoff do projeto é o primeiro evento decisório. A ata zero registra:

- As decisões tomadas no kickoff
- As premissas acordadas
- Quais ADRs devem ser gerados a partir dessas decisões

No caso real, a ata de 13 de janeiro originou dois ADRs: stack tecnológica e estrutura de repositório.

**Regra prática para criar ou não criar ADR:** se a decisão tem alternativas plausíveis que foram descartadas, e se é provável que alguém no futuro questione "por que foi feito assim?" — crie um ADR. Se a decisão é óbvia, sem alternativas reais, e improvável de ser questionada — um registro na ata basta.

---

## Passo 6 — Estabelecer o ritual do ciclo

O ciclo documental precisa de um momento fixo para acontecer. Sem ritual, tende a escorregar.

Em projetos com sprint semanal, o momento natural é o encerramento da sprint — logo após a review, quando o conhecimento do que foi feito e decidido ainda está fresco.

O ritual mínimo tem três etapas:
1. Revisar o material acumulado no staging semântico
2. Produzir a ata consolidando o que foi relevante
3. Atualizar os documentos vivos com base na ata

Com prática, esse ritual leva entre 30 e 90 minutos por ciclo semanal — dependendo do volume de decisões relevantes.

---

## O que esperar nas primeiras semanas

**Semana 1:** a maior dificuldade é distinguir o que vai para a ata e o que não vai. A tendência é ou documentar demais (transcrever tudo) ou documentar de menos (registrar apenas o que parece "importante"). O critério que calibra: vai para a ata tudo que um novo membro da equipe precisaria saber para trabalhar com segurança.

**Semanas 2–3:** a ata fica mais natural. O maior desafio passa a ser identificar quais eventos merecem ADR. Se você precisaria explicar para alguém novo por que o sistema funciona de determinada forma, e a resposta envolver uma decisão que poderia ter sido diferente — essa decisão merece um ADR.

**Mês 1:** o acervo começa a ter valor perceptível. A situação atual reflete o estado real. Alguém novo consegue se orientar sem precisar perguntar. O ritual começa a parecer natural em vez de trabalhoso.

---

## O que não fazer no início

**Não documente tudo.** Documentação excessiva é tão danosa quanto documentação insuficiente: ninguém lê. O critério não é quantidade — é relevância.

**Não atualize documentos vivos fora do ciclo.** Se você percebeu que algo está desatualizado durante a semana, anote no staging semântico. Atualize no próximo ciclo. A disciplina de não fazer edições avulsas é o que mantém a rastreabilidade intacta.

**Não espere o momento perfeito para criar o entendimento inicial.** O melhor momento é agora, com o que se sabe agora. Um entendimento inicial imperfeito e honesto é infinitamente mais valioso do que a perfeição que nunca foi escrita.

**Não sobrescreva atas após consolidação.** Se você percebeu um erro depois de consolidar — crie uma nota na próxima ata explicando a correção. A ata original permanece como estava.

---

> **Em resumo**
>
> Começar do zero com a MEDE segue seis passos: criar a estrutura de diretórios, escrever o entendimento inicial (o único documento que nunca será alterado), criar os documentos vivos iniciais, definir o ritmo dos ciclos, produzir a ata do ciclo zero, e estabelecer o ritual como prática regular. O ciclo zero é especial — é o ciclo de fundação, que estabelece a baseline. Os ciclos evolutivos começam no 001. O maior desafio das primeiras semanas é calibrar o que merece registro — com o tempo, o critério fica natural.

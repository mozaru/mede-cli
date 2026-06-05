---
title: "A arquitetura conceitual: as quatro camadas"
order: 9
---

# Capítulo 9 — A arquitetura conceitual: as quatro camadas

Os artefatos apresentados no capítulo anterior não são uma lista plana de documentos. Eles formam uma arquitetura — uma estrutura com camadas bem definidas, cada uma com propósito distinto, e com regras claras sobre como as camadas se relacionam.

Entender essa arquitetura é o que permite usar a MEDE de forma coerente, não apenas mecânica. Quando um praticante entende por que cada camada existe, ele consegue tomar decisões corretas em situações que o manual não antecipou — saber quando criar um ADR e quando uma entrada na ata basta, quando atualizar um documento vivo e quando criar um ESM, quando um novo artefato seria bem-vindo e quando seria redundante.

---

## As quatro camadas

A MEDE organiza sua documentação em quatro camadas conceituais, da mais volátil para a mais estável:

| Camada | Artefato principal | Função |
|---|---|---|
| **Causal** | Ata | Registra o evento decisório — de onde tudo parte |
| **Estrutural** | ADR | Preserva decisões com impacto arquitetural duradouro |
| **Evolutiva** | ESM | Formaliza mudanças em transição, entre decisão e consolidação |
| **Consolidação** | Documentos vivos | Reflete o estado atual e integrado da solução |

Cada camada tem uma relação diferente com o tempo. A camada causal opera no presente imediato — cada ciclo produz uma nova ata. A camada estrutural opera em escala mais longa — ADRs são criados quando há decisões estruturais, não em todo ciclo. A camada evolutiva é transitória — ESMs existem até que seus itens sejam absorvidos pelos documentos vivos. A camada de consolidação é permanentemente atual — reflete sempre o que se sabe agora.

---

## A camada causal: onde tudo começa

A camada causal é sustentada pela ata. Sua função é simples e absoluta: registrar que algo aconteceu, o que foi decidido, e qual é o impacto esperado sobre o restante do projeto.

Nenhuma mudança nos demais artefatos acontece sem ter passado pela camada causal. Isso não é burocracia — é o mecanismo que garante que toda mudança seja rastreável até seu evento de origem. Quando alguém, no futuro, quiser entender por que um determinado documento vivo está do jeito que está, a resposta sempre começa na camada causal: existe uma ata que registra o evento que gerou aquela mudança.

A camada causal também é a camada do registro histórico mais granular. As atas preservam a sequência cronológica de eventos do projeto — não como diário, mas como sequência de consolidações formais do entendimento.

---

## A camada estrutural: o que dura

A camada estrutural é sustentada pelos ADRs. Sua função é preservar decisões que têm impacto duradouro na arquitetura do sistema — aquelas que, se não registradas, serão repetidamente questionadas ou inadvertidamente violadas.

A diferença entre o que vai para a camada causal (ata) e o que vai para a camada estrutural (ADR) é uma questão de escopo e durabilidade. Uma decisão sobre o fluxo de uma reunião vai para a ata. Uma decisão sobre a estratégia de autenticação do sistema vai para um ADR. A regra prática: se a decisão molda a estrutura do sistema de forma que seria difícil reverter sem impacto significativo, ela merece um ADR.

ADRs também formam, ao longo do projeto, um mapa das escolhas arquiteturais — um registro de como o sistema chegou à forma que tem. Esse mapa é particularmente valioso em migrações, auditorias, e onboardings de novos membros que precisam entender não apenas o que o sistema faz, mas por que foi construído assim.

---

## A camada evolutiva: o espaço de transição

A camada evolutiva é sustentada pelos ESMs. Ela existe para um propósito específico: formalizar o espaço entre a decisão e a consolidação.

Quando algo é decidido numa ata — uma correção, um ajuste de comportamento, uma nova regra de negócio — raramente é implementado e consolidado nos documentos vivos imediatamente. Existe um intervalo de tempo durante o qual a decisão existe mas ainda não se reflete no estado documentado do sistema.

Sem a camada evolutiva, esse intervalo é gerenciado de forma informal: tickets, mensagens, memória. O ESM formaliza esse espaço — cria um artefato estruturado que diz "estas são as mudanças decididas que ainda não foram absorvidas pelos documentos vivos". Isso torna o estado de transição visível e rastreável, em vez de opaco.

Uma boa prática é tratar o ESM como uma fila de entrada para os documentos vivos: quando os itens de um ESM são implementados e validados, eles são formalmente incorporados aos documentos vivos na consolidação do próximo ciclo, e o ESM passa a ser apenas registro histórico.

---

## A camada de consolidação: o estado atual

A camada de consolidação é sustentada pelos documentos vivos. É nela que reside o entendimento atual e integrado da solução — o que qualquer pessoa que chegar ao projeto hoje deve ler para entender onde está.

Os documentos vivos não são independentes entre si. Eles formam uma visão coerente da solução, e sua coerência precisa ser verificada a cada ciclo. Se os requisitos funcionais foram atualizados, o modelo de dados provavelmente também precisa ser. Se a visão e escopo foi revisada, o README provavelmente precisa refletir isso. A verificação de consistência entre os documentos vivos é parte explícita do ritual de encerramento de ciclo.

A camada de consolidação é a face pública do projeto — o que é apresentado a novos membros, clientes, auditores, ou qualquer pessoa que precise entender o sistema sem ter acompanhado sua evolução passo a passo.

---

## Como as camadas se comunicam

O fluxo entre as camadas segue uma direção primária — de cima para baixo — com rastreabilidade garantida em ambas as direções.

```
EVENTO REAL
    │
    ▼
┌─────────────────────────────────────┐
│  CAMADA CAUSAL                      │
│  Ata — registro do evento           │
└──────────────┬──────────────────────┘
               │ origina
    ┌──────────┴──────────┐
    ▼                     ▼
┌───────────┐      ┌──────────────────┐
│  CAMADA   │      │  CAMADA          │
│ ESTRUTURAL│      │  EVOLUTIVA       │
│  ADR      │      │  ESM             │
└─────┬─────┘      └────────┬─────────┘
      │                     │
      └──────────┬──────────┘
                 │ alimenta
                 ▼
┌─────────────────────────────────────┐
│  CAMADA DE CONSOLIDAÇÃO             │
│  Documentos vivos                   │
│  (visão, requisitos, modelo, etc.)  │
└──────────────┬──────────────────────┘
               │ sintetiza em
               ▼
          Situação atual
               │
               ▼
         Log de entregas
```

A seta vai do evento para a ata, da ata para os artefatos derivados, dos artefatos para os documentos vivos, e dos documentos vivos para a síntese do ciclo. Em sentido inverso — a rastreabilidade — é possível partir de qualquer ponto do sistema e percorrer o caminho até o evento que o gerou.

---

## O que essa arquitetura garante

A arquitetura de quatro camadas oferece três garantias que práticas de documentação menos estruturadas não conseguem oferecer.

**Causalidade completa.** Toda mudança no sistema tem origem rastreável. Dado qualquer documento vivo, é possível encontrar a ata que motivou sua última atualização. Dado qualquer ADR, é possível encontrar a ata do ciclo em que a decisão foi tomada. A cadeia não tem buracos porque a regra é absoluta: nada muda sem ata.

**Separação entre história e presente.** Os artefatos históricos — atas, ADRs, ESMs consolidados — nunca são alterados. Os documentos vivos refletem sempre o presente. Essa separação impede que a história seja reescrita inadvertidamente e garante que o presente seja sempre claro.

**Observabilidade do estado de transição.** A camada evolutiva torna visível o espaço entre decisão e consolidação — o que foi decidido mas ainda não está nos documentos vivos. Sem ela, esse espaço é opaco e frequentemente esquecido.

---

## Quando a arquitetura é violada

Entender a arquitetura também significa reconhecer as formas pelas quais ela pode ser violada — e o que cada violação causa.

**Alterar uma ata após consolidação.** Destrói a rastreabilidade. Se a ata muda, não é mais possível saber o que foi realmente decidido naquele momento. Qualquer ADR ou ESM derivado daquela ata fica sem ancora confiável.

**Atualizar documentos vivos fora de um ciclo.** Cria mudanças sem origem rastreável. O documento vivo passa a refletir algo que não tem ata correspondente. A cadeia causal é quebrada.

**Usar o ESM como documento vivo.** O ESM é transitório por natureza. Se passa a ser tratado como referência de estado atual, cria confusão entre o que foi decidido e o que está implementado.

**Não criar ADR para decisões estruturais.** Não viola nenhuma regra formal — a MEDE não exige ADR para tudo. Mas deixa decisões importantes sem registro estruturado, transferindo para as atas uma responsabilidade que elas não foram projetadas para carregar da mesma forma.

Reconhecer essas violações — e entender por que são violações — é o que distingue um praticante que aplica a MEDE com compreensão de um que aplica mecanicamente.

---

> **Em resumo**
>
> A MEDE organiza sua documentação em quatro camadas conceituais: causal (ata), estrutural (ADR), evolutiva (ESM) e consolidação (documentos vivos). Cada camada tem função distinta e opera em escala temporal diferente. O fluxo entre as camadas segue uma direção primária — do evento para a ata, da ata para os artefatos derivados, dos artefatos para os documentos vivos — com rastreabilidade garantida em ambas as direções. Essa arquitetura oferece três garantias que práticas menos estruturadas não conseguem: causalidade completa, separação clara entre história e presente, e observabilidade do estado de transição. Entender por que cada camada existe é o que permite usar a MEDE com julgamento, não apenas com mecânica.

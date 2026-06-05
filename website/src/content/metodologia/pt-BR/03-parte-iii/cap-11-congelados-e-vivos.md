---
title: "Documentos congelados e documentos vivos"
order: 11
---

# Capítulo 11 — Documentos congelados e documentos vivos

A distinção entre documentos congelados e documentos vivos é o coração conceitual da MEDE. Ela resolve um problema que as abordagens de documentação tradicionais raramente enfrentam explicitamente: como preservar a história sem comprometer a clareza do presente.

---

## O dilema da documentação evolutiva

Quando a documentação de um projeto evolui ao longo do tempo, ela enfrenta um dilema.

Se for atualizada livremente — editada sempre que algo muda — ela mantém aderência ao sistema atual, mas perde a memória do que existia antes. Uma especificação que foi reescrita cinco vezes ao longo de dois anos contém apenas a quinta versão. As quatro versões anteriores, e o raciocínio por trás de cada revisão, desapareceram. O presente é claro; o caminho que levou até ele, não.

Se nunca for alterada — tratada como registro imutável — ela preserva o estado inicial, mas rapidamente se desalinha do sistema real. Um mês depois do kickoff, já está desatualizada. Um ano depois, pode ser enganosa.

A MEDE resolve esse dilema separando explicitamente os dois papéis em dois tipos de documento com regras diferentes.

---

## Documentos congelados

Documentos congelados são artefatos históricos. Uma vez consolidados, nunca são alterados.

Eles preservam o estado do entendimento em um momento específico — uma fotografia semântica do que se sabia, o que foi decidido, o que estava em vigor naquele ponto da trajetória do projeto. Sua imutabilidade é o que garante a integridade da memória histórica.

**Pertencem a esta categoria:**

- **Atas** — fotografia do entendimento ao final de cada ciclo
- **ADRs** — registro das decisões arquiteturais tomadas em determinado momento
- **ESMs consolidados** — especificações de mudanças que já foram absorvidas pelos documentos vivos
- **Logs de entrega** — registro do que foi entregue em cada ciclo
- **Entendimento inicial** — baseline congelada criada no ciclo zero; nunca alterada, mesmo quando o entendimento evolui. Não é um documento vivo — é um documento de estado fixo que representa o ponto de partida do projeto

**A regra de ouro:** um documento congelado que precisa ser corrigido ou complementado não é editado. Uma nova ata ou um novo ADR é criado, registrando o que mudou e por quê. O documento original permanece como estava — com sua imprecisão, se houver, visível para quem quiser entender a trajetória completa.

Essa regra pode parecer rígida. Afinal, se uma ata contém um erro, por que não corrigi-la? A resposta é que editar um documento histórico destrói a confiança em todo o acervo histórico. Se atas podem ser editadas, nunca se sabe se o que está escrito é o que realmente foi decidido ou uma versão revisada a posteriori. A imutabilidade é o que torna os documentos históricos confiáveis como evidência.

---

## Documentos vivos

Documentos vivos refletem o estado atual e consolidado da solução. Eles evoluem — mas de forma controlada, como resultado de ciclos documentais, nunca por edição avulsa.

**Pertencem a esta categoria:**

- `visao-e-escopo.md`
- `requisitos-funcionais.md`
- `requisitos-nao-funcionais.md`
- `modelo-de-dados.md`
- `cronograma.md`
- `situacao-atual.md`
- `readme.md`

**A regra de ouro:** um documento vivo só é atualizado como resultado de um ciclo documental formal — quando há uma ata que origina a mudança, e quando os artefatos causais correspondentes (ADR, ESM) já foram produzidos. Nenhuma atualização acontece "porque alguém percebeu que estava errado" ou "para refletir o que foi implementado". Toda atualização tem origem causal rastreável.

Isso não significa que documentos vivos são raramente atualizados. Em projetos com ritmo intenso, podem ser atualizados a cada ciclo. O que não muda é o mecanismo: a atualização sempre passa pelo ciclo, nunca é avulsa.

---

## Por que a distinção importa na prática

A distinção entre congelados e vivos não é formalismo. Ela resolve problemas reais que surgem quando a documentação é tratada como uma massa homogênea sem essa diferenciação.

**Problema 1: a documentação desatualizada que parece atual.**
Sem a distinção, qualquer documento pode ser tanto histórico quanto atual. Um leitor que encontra uma especificação de requisitos não sabe se está lendo o entendimento do início do projeto ou o entendimento atual. A distinção elimina essa ambiguidade: documentos vivos são sempre o presente; documentos congelados são sempre o passado identificado.

**Problema 2: a história reescrita.**
Quando uma decisão é revisada e o documento original é editado para refletir a nova decisão, a história desaparece. Alguém que lê o documento agora não sabe que a decisão foi diferente antes, nem quando mudou, nem por quê. A distinção preserva o documento original intacto e cria um novo documento para a revisão — mantendo ambas as versões acessíveis.

**Problema 3: a mudança sem origem.**
Sem a regra de que documentos vivos só mudam via ciclo, mudanças avulsas se acumulam sem rastreabilidade. O documento vivo vai sendo editado por impulso — alguém atualiza uma linha aqui, outra ali — e em pouco tempo não há como saber o que mudou, quando, por qual razão, ou se é consistente com o restante do projeto. A regra do ciclo garante que cada mudança tenha origem documentada.

---

## O entendimento inicial: o documento que nunca muda

O `entendimento-inicial.md` merece atenção especial porque é ao mesmo tempo o documento mais parecido com um documento vivo — em formato, em extensão, em conteúdo — e o mais rigorosamente congelado de todos.

Ele é criado no ciclo zero com o melhor entendimento disponível sobre o problema, a solução proposta, as premissas iniciais, o backlog inicial, e o cronograma inicial. E nunca é alterado — nem quando o entendimento evolui, nem quando as premissas se revelam incorretas, nem quando o backlog cresce ou encolhe.

Exatamente por nunca ser alterado, ele cumpre um papel que nenhum outro documento cumpre: ser o ponto de referência fixo contra o qual a evolução do projeto pode ser medida.

Quando o projeto encerra, é possível comparar o `entendimento-inicial.md` com a `situacao-atual.md` final e responder perguntas que raramente têm resposta em projetos convencionais: o que mudou em relação ao planejado? Quais premissas iniciais se confirmaram? Quais precisaram ser revisadas? O backlog cresceu ou encolheu? O cronograma se manteve?

Essas respostas são valiosas não apenas para o projeto em si — são aprendizado organizacional que pode ser aplicado aos projetos seguintes.

---

## A nomenclatura como sinal de papel

A convenção de nomenclatura da MEDE é projetada para que o papel de um documento seja imediatamente inferível pelo nome, sem precisar abrir o arquivo.

**Documentos congelados** têm data e número de ciclo no nome:
```
ata-20260202-004-offline-first.md
adr-20260202-004-sincronizacao-offline.md
esm-20260224-005.md
leg-20260202-004.md
```

**Documentos vivos** têm nomes sem data — porque são sempre atuais:
```
visao-e-escopo.md
requisitos-funcionais.md
situacao-atual.md
readme.md
```

O único documento que parece vivo pelo nome mas é congelado é o `entendimento-inicial.md` — e isso é deliberado. Ele reside fisicamente na raiz de `docs/` junto dos documentos vivos, mas é conceitualmente uma baseline congelada: um documento de estado, como os vivos, mas de um estado que nunca muda.

---

## Consistência interna e o princípio da imutabilidade de IDs

Uma regra adicional que decorre da imutabilidade dos documentos históricos: identificadores de itens de backlog e de artefatos nunca são renomeados, mesmo que a convenção de nomenclatura evolua ao longo do projeto.

Um projeto que começa com uma convenção de IDs e a aperfeiçoa no ciclo 003 não retroativamente renomeia os itens dos ciclos 000 a 002. Os IDs antigos permanecem como estão — porque documentos históricos que os referenciam não podem ser alterados, e alterar apenas os IDs sem alterar as referências criaria inconsistências impossíveis de rastrear.

A consistência histórica tem prioridade sobre a uniformidade de formato. Um projeto bem documentado segundo a MEDE pode ter IDs com formatos ligeiramente diferentes em diferentes fases — e isso é aceitável. O que não é aceitável é quebrar a rastreabilidade retroativamente em nome da padronização.

---

> **Em resumo**
>
> A distinção entre documentos congelados e documentos vivos resolve o dilema central da documentação evolutiva: como preservar a história sem comprometer a clareza do presente. Documentos congelados — atas, ADRs, ESMs, logs de entrega e o entendimento inicial — são imutáveis após consolidação. Representam fotografias semânticas de momentos específicos da trajetória do projeto. Documentos vivos — visão, requisitos, modelo, cronograma, situação atual, README — refletem o entendimento atual e são atualizados de forma controlada a cada ciclo. A nomenclatura sinaliza o papel: datas e números de ciclo indicam congelado; nomes sem data indicam vivo. E identificadores históricos nunca são renomeados — a consistência histórica tem prioridade sobre a uniformidade de formato.

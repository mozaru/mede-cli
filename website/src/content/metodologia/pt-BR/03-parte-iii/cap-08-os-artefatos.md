---
title: "Os artefatos da MEDE"
order: 8
---

# Capítulo 8 — Os artefatos da MEDE

A MEDE organiza a documentação em tipos de artefato com papéis bem definidos. Cada tipo responde a uma pergunta diferente, serve a um propósito diferente, e tem regras diferentes sobre quando é criado e se pode ser alterado.

Entender essa distinção é a base para usar a metodologia corretamente. Um artefato usado no lugar errado — uma ata tratada como documento vivo, um ADR criado para registrar estado atual em vez de decisão — quebra a causalidade que a MEDE busca preservar.

Este capítulo descreve cada artefato em detalhe: o que é, o que não é, quando criar, como estruturar, e o que acontece quando ele é bem — ou mal — utilizado.

---

## A Ata — a entrada causal de tudo

A ata é o artefato de entrada da MEDE. É o único ponto de origem de mudanças nos documentos do projeto.

Isso não é uma regra burocrática. É o mecanismo que garante causalidade: nada muda nos documentos de estado atual sem que tenha passado por uma ata. Toda atualização de requisito, toda mudança arquitetural, toda revisão de entendimento tem uma ata como ponto de origem rastreável.

**O que é.** A ata MEDE é um registro formal do evento decisório — da reunião, da sessão de trabalho, do incidente, ou de qualquer evento que gerou mudança relevante no entendimento ou na direção do projeto. Ela consolida o que foi discutido, quais decisões foram tomadas, e qual é o impacto esperado sobre os demais artefatos.

**O que não é.** A ata não é uma transcrição de reunião. Não precisa registrar tudo o que foi dito, quem falou primeiro, ou os detalhes de cada conversa lateral. É uma consolidação — o que ficou de relevante para o projeto, destilado de forma que possa ser lido e compreendido por alguém que não esteve presente.

**Por que é congelada.** Uma vez consolidada, a ata nunca é alterada. Ela representa uma fotografia semântica do entendimento naquele momento. Se o entendimento mudou depois, isso será registrado em uma ata futura — não editando a anterior. A imutabilidade das atas é o que torna possível rastrear como o entendimento evoluiu ao longo do tempo.

**Quando criar.** Ao final de cada ciclo documental — que pode ser uma semana, um dia, ou qualquer unidade de tempo que faça sentido para o ritmo do projeto. Em situações excepcionais, como incidentes críticos em produção, uma ata extra pode ser criada fora do ciclo regular.

**Como nomear.**
```
ata-AAAAMMDD-NNN-descricao-curta.md
```
O `NNN` é o número do ciclo, com três dígitos. Esse número é o elo que conecta todos os artefatos produzidos no mesmo ciclo — ata, ADR, ESM e log de entregas têm o mesmo número de ciclo quando pertencem à mesma consolidação.

**Estrutura mínima.**
```
Ata — AAAA-MM-DD — Ciclo NNN

Data: AAAA-MM-DD
Ciclo: NNN
Participantes: [lista]

1. Contexto e ponto de partida
   [O que estava em aberto antes desta reunião/ciclo]

2. Problemas identificados / mudanças de entendimento
   [O que foi descoberto, revisado ou questionado]

3. Decisões tomadas
   [O que foi decidido — com clareza suficiente para ser rastreado]

4. Encaminhamentos
   [O que cada pessoa ou artefato precisa fazer a seguir]

5. Impacto documental esperado
   [Quais documentos vivos precisam ser atualizados,
    quais ADRs ou ESMs devem ser gerados]
```

**Exemplo.** Uma ata de kickoff registra que a stack tecnológica foi definida como .NET 8 com Angular, que o sistema operará inicialmente em modo online-first, e que haverá dois perfis de usuário: Gestor e Agente. Três semanas depois, uma nova ata registra que a operação em campo revelou conectividade instável, e que o sistema precisará suportar operação offline-first para o perfil Agente. A segunda ata não altera a primeira — ela registra a mudança de entendimento, com data e ciclo. A trajetória fica visível: o projeto começou com uma premissa e a revisou em determinado momento, por determinada razão.

---

## O ADR — registro de decisão arquitetural

O ADR (Architecture Decision Record) é o artefato que preserva decisões estruturais — aquelas que têm impacto duradouro na forma como o sistema é construído e que, se não forem documentadas, serão repetidamente questionadas ou silenciosamente violadas por quem não participou da discussão original.

**O que é.** Um documento que registra uma decisão arquitetural relevante com três elementos essenciais: o contexto que tornou a decisão necessária, a decisão em si, e as consequências esperadas — incluindo os tradeoffs aceitos. Documentar as alternativas descartadas e as razões do descarte é igualmente importante: é essa informação que permite avaliar, no futuro, se a decisão ainda faz sentido.

**O que não é.** O ADR não é documentação de tudo. Não toda escolha técnica merece um ADR — apenas aquelas com impacto estrutural significativo, que seriam difíceis de reverter ou cujas razões provavelmente não seriam óbvias para quem chegar depois. A escolha de qual biblioteca de ícones usar raramente justifica um ADR. A escolha de como estruturar a autenticação, quase sempre justifica.

**Por que é congelado.** Como a ata, o ADR é imutável após ser consolidado. Se uma decisão é revisada, um novo ADR é criado — possivelmente com status "Supersede ADR-NNN" — e o ADR original permanece inalterado. A história das decisões arquiteturais do projeto fica visível como uma sequência de documentos, não como um único documento que foi editado várias vezes e perdeu seu histórico.

**Quando criar.** Sempre que uma decisão for tomada que: (a) afeta a estrutura do sistema de forma não trivial, (b) tem alternativas plausíveis que foram descartadas, ou (c) provavelmente será questionada no futuro por alguém sem o contexto da discussão original.

**Como nomear.**
```
adr-AAAAMMDD-NNN-descricao-curta.md
```
O número de ciclo `NNN` é o mesmo da ata que originou a decisão.

**Estrutura mínima.**
```
ADR-AAAAMMDD-NNN — [Título da decisão]

Status: Aceito
Data: AAAA-MM-DD
Ciclo: NNN

Contexto
[O problema que precisava ser resolvido e por que a decisão
 era necessária naquele momento]

Decisão
[O que foi decidido, de forma clara e direta]

Alternativas descartadas
[O que foi considerado e por quê não foi escolhido]

Consequências
[O que muda no sistema a partir dessa decisão,
 incluindo tradeoffs aceitos]
```

**Exemplo.** Um ADR registra que o sistema adotará operação offline-first para o perfil Agente, com sincronização ao retornar conectividade. O contexto explica que agentes operam em áreas com sinal instável. As alternativas descartadas incluem "aguardar conectividade para processar" (inviável operacionalmente) e "modo degradado com funcionalidades reduzidas" (experiência ruim para o usuário). As consequências listam: necessidade de banco local no dispositivo, lógica de resolução de conflitos na sincronização, e latência aceitável nas atualizações vistas pelo Gestor.

Quem ler esse ADR dois anos depois entende não apenas o que foi decidido, mas por que — e pode avaliar se as condições que motivaram a decisão ainda existem.

---

## O ESM — especificação de manutenção do sistema

O ESM (Especificação de Manutenção do Sistema) é o artefato de transição — o que formaliza mudanças que já foram decididas mas ainda não estão maduras o suficiente para alterar os documentos vivos.

**O que é.** Um documento que lista comportamentos esperados do sistema que precisam ser implementados ou corrigidos, colhidos da operação real, de testes, de feedback de usuários, ou de decisões tomadas que ainda não foram incorporadas aos documentos de estado atual. O ESM não descreve o sistema como ele está — descreve o sistema como ele deve ficar após as mudanças que especifica.

**Por que existe.** Entre o momento em que algo é decidido e o momento em que está completamente implementado e consolidado nos documentos vivos, existe um espaço. Sem o ESM, esse espaço é informal — as mudanças existem em tickets, conversas e memória das pessoas, mas não num documento estruturado que possa ser rastreado. O ESM formaliza esse espaço intermediário.

**Quando criar.** Após ciclos de operação real que revelam ajustes necessários, ou quando um volume de mudanças menores foi acumulado e precisa ser formalizado antes de entrar nos documentos vivos. Um ESM pode conter correções de bugs, ajustes de usabilidade, novas regras de negócio descobertas em uso, e evoluções funcionais — cada item claramente categorizado.

**Como nomear.**
```
esm-AAAAMMDD-NNN.md
```

**Estrutura dos itens.**

Cada item do ESM tem um identificador que preserva sua origem e natureza:
```
ESM-AAAAMMDD-NNN-NAT-TIP-NNNN

Natureza (NAT): RF (requisito funcional), NF (não funcional),
                RN (regra de negócio), UX (interface), AR (arquitetura)
Tipo (TIP):     COR (correção), AJU (ajuste), EVO (evolução)

Exemplo: ESM-20260224-005-RN-EVO-0003
```

Cada item descreve o comportamento esperado — não o atual, não o motivo da mudança, mas o que o sistema deve fazer após a mudança ser implementada.

**O que acontece com o ESM.** Após os itens serem implementados e validados, eles são absorvidos pelos documentos vivos na consolidação do ciclo seguinte. O ESM permanece como registro histórico — evidência de que aquelas mudanças foram especificadas, em que momento, e como resultado de qual evento.

**ESM não é backlog.** A distinção é importante porque, à primeira vista, um ESM com lista de correções e evoluções pode parecer simplesmente um backlog em Markdown. Não é. O backlog é uma fila de trabalho — seus itens existem para ser priorizados, estimados e executados, e podem mudar de prioridade ou desaparecer sem registro formal. O ESM é uma especificação causal de mudança — seus itens existem para preservar o entendimento do comportamento esperado, com origem rastreável numa ata, e não podem ser descartados silenciosamente. Backlog gerencia execução. ESM preserva conhecimento. Um item que sai do ESM sem ser implementado precisa de uma justificativa documental — não pode simplesmente desaparecer.

---

## O Log de Entregas — LEG

O log de entregas é o registro do que foi efetivamente entregue em cada ciclo, com rastreabilidade até os itens de backlog correspondentes.

**O que é.** Um documento por ciclo que lista os itens concluídos, os itens parcialmente concluídos, e os itens que estavam planejados mas não foram entregues — com o motivo. Não é uma lista de tarefas. É um registro de realidade: o que realmente aconteceu, comparado ao que estava planejado.

**Por que importa.** O histórico de logs de entrega revela o ritmo real do projeto ao longo do tempo — onde houve aceleração, onde houve bloqueio, quais tipos de item consistentemente escorregam para o próximo ciclo. Essa informação é valiosa tanto para gestão quanto para calibração de estimativas futuras.

**Como nomear.**
```
leg-AAAAMMDD-NNN-descricao-ciclo.md
```

---

## Os Documentos Vivos

Os documentos vivos são o conjunto de artefatos que refletem o entendimento atual e consolidado da solução. Diferente dos artefatos históricos — que são imutáveis após consolidados — os documentos vivos são atualizados de forma controlada ao final de cada ciclo documental.

A palavra "vivos" não significa que são atualizados livremente a qualquer momento. Significa que evoluem junto com o sistema — mas apenas como resultado de ciclos documentais formais, não por edições avulsas que não passam pelo processo causal.

**Baseline congelada — criada no ciclo zero, nunca alterada:**

`entendimento-inicial.md` — Registra o que se sabia e o que se pretendia no momento zero: o problema que o projeto resolve, as premissas iniciais, o backlog inicial, o cronograma inicial. Nunca é alterado. Funciona como linha de base imutável contra a qual a evolução do projeto pode ser medida. Embora resida fisicamente junto dos documentos vivos na raiz de `docs/`, é conceitualmente um documento congelado especial — congelado desde o instante em que foi criado.

**O conjunto padrão de documentos vivos:**

`visao-e-escopo.md` — Para onde o projeto vai e por quê. Contém o problema que o sistema resolve, o público que serve, os limites do que está dentro e fora do escopo.

`requisitos-funcionais.md` — O que o sistema faz. Comportamentos e funcionalidades na perspectiva do usuário.

`requisitos-nao-funcionais.md` — Como o sistema se comporta. Performance, segurança, disponibilidade, restrições operacionais.

`modelo-de-dados.md` — Como os dados estão organizados. Entidades, relacionamentos, regras de persistência.

`cronograma.md` — O plano de entregas atualizado, com o que foi entregue e o que está previsto.

`situacao-atual.md` — Síntese do estado do projeto no ciclo atual. É o primeiro documento que alguém novo deve ler — responde "onde o projeto está agora?" de forma direta e completa.

`readme.md` — A porta de entrada do projeto. Orienta quem chega pela primeira vez: o que é o sistema, como está organizado, onde encontrar o quê.

**A regra de atualização.** Nenhum documento vivo é alterado fora de um ciclo documental formal. Toda atualização tem origem numa ata — o documento vivo reflete o resultado consolidado de uma ou mais atas, ADRs e ESMs do ciclo. Isso garante que o estado atual sempre seja rastreável até os eventos que o geraram.

---

## Como os artefatos se relacionam

Os cinco tipos de artefato — ata, ADR, ESM, LEG e documentos vivos — não são independentes. Eles formam uma cadeia causal:

```
Evento real
    ↓
Ata  ←─────────────────────── origem de tudo
    ├──────────────┬───────────────────────┐
    ↓              ↓                       ↓
   ADR            ESM              Itens implementados
    └──────┬───────┘                       │
           ↓                               ↓
    Documentos vivos                      LEG
    (atualizados com                (registra o que foi
    base em ata + ADR + ESM)        efetivamente entregue)
           └───────────────────┬───────────┘
                               ↓
                        Situação atual
                    (síntese consolidada do ciclo)
```

O LEG não deriva dos documentos vivos — deriva da ata e dos itens efetivamente implementados no ciclo. Ele e os documentos vivos são produzidos em paralelo durante o fechamento do ciclo, e ambos alimentam a síntese final na situação atual.

Nenhum artefato muda sem que haja uma ata que o origem. Nenhum documento vivo é atualizado sem que os artefatos causais correspondentes existam. A cadeia pode ser percorrida em qualquer direção: dado um documento vivo, é possível encontrar as atas que o geraram; dada uma ata, é possível encontrar todos os documentos que ela modificou.

Essa rastreabilidade bidirecional é o que torna o projeto epistemologicamente observável — e é o que distingue a MEDE de uma coleção de práticas de documentação aplicadas de forma independente.

---

> **Em resumo**
>
> A MEDE define cinco tipos de artefato, cada um com papel específico: a ata como entrada causal de todas as mudanças, o ADR para preservar decisões estruturais com contexto e alternativas, o ESM para formalizar mudanças em transição entre decisão e consolidação, o LEG para registrar o que foi efetivamente entregue, e os documentos vivos para refletir o estado atual e consolidado da solução. A distinção fundamental é entre artefatos históricos — imutáveis após consolidados — e documentos vivos — atualizados de forma controlada a cada ciclo. Juntos, eles formam uma cadeia causal rastreável: qualquer mudança no projeto pode ser percorrida desde o evento que a originou até o documento de estado que a reflete.

---
title: "Semana a semana: como o conhecimento evoluiu"
order: 14
---

# Capítulo 14 — Semana a semana: como o conhecimento evoluiu

A trajetória de um projeto documentado segundo a MEDE não é uma linha reta. É uma sequência de consolidações — cada uma capturando o entendimento do momento, cada uma potencialmente diferente da anterior.

Este capítulo acompanha o projeto semana a semana, mostrando em detalhe como cada artefato foi produzido, o que capturou, e o que revelou sobre a evolução do conhecimento. Para cada ciclo relevante: o que havia antes, o que o evento documentou, e o que um novo membro da equipe conseguiria entender lendo esse rastro.

---

## Ciclo 000 — O kickoff (13 de janeiro)

O ciclo zero é o ciclo de fundação. Ele não é um ciclo evolutivo ainda — é onde a baseline é criada.

**O que existia antes:** nada. Projeto acabava de começar.

**O que o ciclo 000 produziu:**

O `entendimento-inicial.md` com o mapa do projeto em janeiro: 32 itens de backlog, seis entregas semanais, modelo *online-first*, três perfis de usuário.

A ata de kickoff consolidando as decisões da reunião de alinhamento: stack definida, autenticação obrigatoriamente online, hierarquia operacional Base → Setor → Endereço.

Dois ADRs derivados da ata:

- `adr-2026-01-13-stack-tecnologico.md` — .NET 8 + Angular 20 + PrimeNG, monorepo, com alternativas descartadas (Node.js, React, repositórios separados)
- `adr-2026-01-13-monorepo.md` — backend, frontend e documentação no mesmo repositório Git

**O que um novo membro leria hoje:**

Lendo o entendimento inicial e a ata de kickoff em sequência, em menos de 20 minutos teria o quadro completo: o que era o sistema, para quem, com qual stack, com qual modelo de conectividade, com quais premissas. As alternativas que foram descartadas nos ADRs já revelam o raciocínio de engenharia por trás das escolhas.

---

## Ciclo 001 — O modelo operacional muda (19 de janeiro)

Antes que a primeira entrega formal acontecesse, uma conversa via WhatsApp e telefone gerou mudanças significativas no modelo de dados.

**O que havia antes:** o entendimento inicial previa quatro perfis (incluindo Gestor) e uma entidade Área no modelo operacional.

**O que a ata de 19/01 registrou:**

A ata foi produzida a partir de conversa assíncrona — canal explicitamente registrado: "WhatsApp e ligação telefônica". Decisões:

> *"A entidade Área será removida do modelo de dados. A hierarquia operacional fica definida como: Base de Operação → Setor Censitário → Endereço."*

> *"O perfil Gestor não será criado. O perfil Administrador acumula funções administrativas e gerenciais."*

> *"O sistema permitirá associar mais de um agente a um mesmo setor censitário. Ao tentar realizar essa associação, o sistema deve alertar o usuário."*

A ata também formalizou regras de importação com detalhe considerável: upsert de endereços (sem exclusão automática), bloqueio de reimportação quando há endereços vistoriados, separação explícita entre a tabela de endereços importados (imutável) e a tabela de vistorias.

**O ADR gerado:**

O ADR deste ciclo formalizou as decisões de modelo operacional — com o contexto explícito de que vinham de uma *intenção de redução de escopo e tempo de desenvolvimento* confirmada pelo cliente.

**O que mudou nos documentos vivos:**

Requisitos funcionais atualizados (remoção do perfil Gestor, exclusão da entidade Área, novas regras de importação). Modelo de dados revisado para refletir a hierarquia simplificada.

**O que um novo membro entenderia:**

Lendo a ata de 19/01 e o ADR correspondente, entenderia imediatamente: o projeto começou com quatro perfis e uma entidade Área que foram simplificados ainda antes do início das entregas, por decisão explícita de redução de escopo. Sem a ata, essa simplificação seria invisível — alguém poderia passar horas procurando o perfil Gestor num sistema que nunca chegou a tê-lo.

---

## Ciclo 002 — Primeira entrega e segurança plugável (26 de janeiro)

A primeira entrega formal foi em 26 de janeiro — oito itens do backlog original, mais dois itens que surgiram durante a semana.

**O que a ata e o LEG registraram:**

O log de entrega da semana 1 listou 8 itens com rastreabilidade explícita — cada um com ID, origem (cronograma ou ata) e status. Os dois itens extras tinham origem identificada na ata de 26/01: integração plugável com Azure Key Vault e Application Insights.

Um ADR adicional foi produzido: `adr-2026-01-26-seguranca-e-observabilidade-plugavel.md` — formalizando a decisão de tornar as integrações de segurança e observabilidade plugáveis (ativáveis por configuração), em vez de hardcoded.

**O que mudou nos documentos vivos:**

Situação atual refletindo 8 itens concluídos, 2 novos adicionados. Requisitos não funcionais atualizados com as integrações plugáveis.

---

## Ciclo 004 — A grande revisão (2 de fevereiro)

Este é o ciclo mais importante do projeto. O ciclo que invalida a premissa central do entendimento inicial.

**O que havia antes:**

O entendimento inicial dizia, em texto literal:

> *"O sistema opera em modelo online-first, exigindo autenticação com conectividade ativa. Após autenticação válida, o agente pode executar operações durante curtos períodos de instabilidade de rede, com posterior sincronização."*

**O que a ata de 02/02 registrou:**

A ata começou registrando o contexto com clareza:

> *"Após a apresentação das telas de listagem de endereços e confirmação de endereços, o cliente realizou uma revisão completa do fluxo de trabalho dos agentes em campo e da navegação do sistema. Foram identificados problemas de: coesão visual do frontend, operação offline, navegação por perfil, georreferenciamento por setor censitário e sincronização das vistorias."*

A revisão era abrangente. Cinco dimensões simultâneas:

**Navegação:** o sistema precisava de menu lateral com itens por perfil. Cada perfil (Administrador, Supervisor, Agente) teria itens específicos.

**Mapas:** Google Maps substituindo Bing Maps. A ata foi explícita: *"não houve validação prévia do uso do Bing Maps com o cliente."* Um erro que a ata tornou visível e rastreável.

**Setores como polígonos:** o arquivo de setores censitários passaria a incluir coordenadas geográficas dos vértices do polígono de cada setor, para sobreposição no mapa durante as vistorias.

**Modelo de vistoria:** revisão completa do fluxo de campo, com wizard de vistoria e novo modelo de confirmação por endereço.

**E a mudança central — offline-first:**

O que no entendimento inicial eram "curtos períodos de instabilidade" era, na realidade de campo, operação em áreas com sinal instável ou inexistente de forma recorrente. O modelo *online-first* era inviável.

**Antes e depois — a mudança em texto:**

| | Texto do documento |
|---|---|
| **Entendimento inicial** | *"O sistema opera em modelo online-first, exigindo autenticação com conectividade ativa. Após autenticação válida, o agente pode executar operações durante curtos períodos de instabilidade de rede."* |
| **ADR de offline-first** | *"Os agentes de campo operam em ambientes com conectividade instável ou inexistente. O sistema precisa funcionar de forma confiável nesses cenários sem perda de dados."* |

Dois documentos, lado a lado, mostram a mudança de entendimento com precisão cirúrgica. Sem a MEDE, essa mudança seria invisível no histórico.

**O ADR de offline-first (excerto):**

> *Decisão:*
> *- O aplicativo deve manter um banco de dados local por usuário*
> *- Endereços e vistorias devem permanecer armazenados no dispositivo*
> *- As vistorias devem ser enviadas ao servidor em background*
> *- Cada registro deve possuir status de sincronização: Pendente de envio | Enviado*
> *- Para cada endereço existe no máximo uma vistoria ativa no servidor*
>
> *Consequências:*
> *- O sistema passa a ter consistência eventual entre dispositivo e servidor*
> *- O fluxo de campo se torna resiliente a falhas de conectividade*

**O que mudou nos documentos vivos:**

Requisitos funcionais: seção de operação offline completamente reescrita. Requisitos não funcionais: adição de requisitos de consistência eventual e sincronização. Modelo de dados: banco local, tabela de status de sincronização, histórico de vistorias. Situação atual: baseline operacional redesenhada.

**O que um novo membro entenderia:**

Lendo o entendimento inicial e depois o ADR de offline-first, em menos de 15 minutos entenderia: o projeto começou com uma premissa de conectividade que a realidade de campo contestou, e a solução adotada foi offline-first com banco local e sincronização assíncrona. Saberia por que existe banco local no dispositivo. Saberia por que há um status de sincronização por registro. Saberia que a consistência é eventual — e por quê isso foi aceito conscientemente.

---

## Ciclo 005+ — A reautenticação offline (23 de fevereiro)

Com o sistema em operação real de campo, uma consequência do modelo offline-first que não havia sido antecipada emergiu: agentes que ficavam longas horas sem conectividade encontravam expiração de token — e o sistema bloqueava a operação, perdendo dados não sincronizados.

**O que a ata de 23/02 registrou:**

O problema foi identificado e a solução especificada: reautenticação local com senha quando offline, preservando os dados locais e permitindo continuidade da operação.

**O ADR gerado:**

`adr-2026-02-23-reautenticacao-offline-controlada-no-tablet.md` — formalizando o mecanismo de reautenticação offline como extensão da decisão de offline-first do ciclo 004.

**O que isso revela sobre a metodologia:**

O ADR de offline-first do ciclo 004 não antecipou a necessidade de reautenticação — era uma consequência que só apareceria em uso real. O ADR de reautenticação do ciclo 005 complementou o anterior sem alterá-lo. A cadeia causal ficou completa: decisão original → consequência não antecipada → nova decisão.

Alguém que leia os dois ADRs em sequência entende não apenas o que foi decidido, mas como o entendimento foi refinado progressivamente com o uso real.

---

## Os ESMs — quando o campo fala

As últimas semanas do projeto foram marcadas pelos ESMs — especificações produzidas a partir de operação real de campo.

O ESM de 24 de fevereiro consolidou o que o desenvolvimento em ambiente controlado não havia revelado:

**9 correções:** desde o CPF sendo salvo em formato JSON ao usar "lembrar senha", passando por checkbox de aceite que não respondia ao clique direto, até a vistoria offline perdendo dados ao expirar token.

**12 ajustes de usabilidade:** comportamentos que funcionavam tecnicamente mas que a experiência de campo revelou como inadequados.

**7 regras de negócio:** comportamentos que não haviam sido especificados previamente mas que se mostraram necessários na operação.

**7 evoluções funcionais:** capacidades novas que a operação real revelou como úteis.

Cada item descreve o comportamento *esperado* — não o atual, não a causa. Um item representativo:

> *COR-008 — Vistoria — Vistoria offline perde dados ao expirar token*
> *Comportamento esperado: O sistema deve preservar os dados locais e solicitar reautenticação antes de qualquer sincronização.*

Quarenta e dois itens, todos com origem rastreável na ata da reunião operacional de 23/02. O campo gerou conhecimento que a especificação inicial não poderia ter produzido — e a MEDE capturou esse conhecimento em formato utilizável.

---

## A linha do entendimento — do início ao fim

Para fechar o ciclo, a comparação direta entre onde o projeto começou e onde chegou:

| Dimensão | Entendimento inicial (jan.) | Estado final (mar.) |
|---|---|---|
| Conectividade | Online-first, curtos períodos offline | Offline-first para agentes, banco local |
| Perfis | Admin, Gestor, Supervisor, Agente | Admin, Supervisor, Agente (Gestor removido) |
| Estrutura operacional | Base, Área, Setor, Endereço | Base, Setor, Endereço (Área removida) |
| Vistorias | Múltiplas por endereço, modelo simples | Uma ativa por endereço, com histórico e log |
| Itens de backlog | 32 planejados | 100 rastreados (81 concluídos) |
| Mapa | Não especificado | Google Maps com polígonos de setor |

Cada diferença entre as duas colunas tem uma ata, um ADR ou um ESM correspondente. Nenhuma mudança é anônima.

---

> **Em resumo**
>
> Acompanhar o projeto ciclo a ciclo revela a MEDE em operação real: a ata de 19/01 formalizando decisões tomadas via WhatsApp, o ADR de 02/02 documentando a inversão da premissa central de conectividade, os ESMs capturando o que a operação de campo revelou. A comparação antes/depois — o texto do entendimento inicial vs. o texto do ADR de offline-first — mostra em detalhe como o conhecimento evoluiu e como essa evolução ficou rastreável. O projeto cresceu de 32 para 100 itens não por desordem, mas por aprendizado documentado. Cada item tem origem. Cada decisão tem contexto. E qualquer pessoa que chegue ao projeto hoje pode percorrer essa trajetória do início ao fim.

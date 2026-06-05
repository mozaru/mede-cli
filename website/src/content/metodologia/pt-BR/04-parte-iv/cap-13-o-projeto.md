---
title: "O projeto: o que foi, o que se sabia, e o que mudou"
order: 13
---

# Capítulo 13 — O projeto: o que foi, o que se sabia, e o que mudou

Todo projeto começa com um entendimento. Raramente é o entendimento correto — e isso não é falha. É a natureza do desenvolvimento de software em domínios complexos: o entendimento real só emerge com o uso, com o campo, com as situações que nenhum briefing consegue antecipar.

O valor da MEDE não está em evitar que o entendimento mude. Está em tornar essa mudança visível, rastreável e compreensível. Quando o entendimento inicial e o entendimento final estão documentados — com toda a trajetória entre eles — o projeto se torna uma fonte de aprendizado, não apenas de código entregue.

Este capítulo apresenta o projeto que será acompanhado ao longo desta Parte IV.

---

## O que era o projeto

O sistema foi desenvolvido para suporte à operação distribuída de agentes de campo — profissionais que trabalham em rua, verificando e atualizando informações de endereços georreferenciados numa determinada região.

O contexto operacional tinha características específicas: agentes usando tablets, cobertura de sinal variável dependendo da área, necessidade de registrar vistorias com precisão e rastreabilidade, e uma hierarquia de três perfis — administradores, supervisores e agentes — com responsabilidades distintas.

O prazo era de seis semanas de desenvolvimento ativo, com entregas semanais.

---

## O que o entendimento inicial dizia

O documento de entendimento inicial — criado no começo de janeiro de 2026 e nunca alterado desde então — registrava o seguinte.

**Sobre a stack:** backend em .NET 8 com ASP.NET Core, frontend em Angular com PrimeNG. Decisão tomada no kickoff, antes de qualquer linha de código.

**Sobre a conectividade**, em texto literal:

> *"O sistema opera em modelo online-first, exigindo autenticação com conectividade ativa. Após autenticação válida, o agente pode executar operações durante curtos períodos de instabilidade de rede, com posterior sincronização."*

**Sobre a estrutura operacional:** três entidades — Base de Operação, Setor Censitário e Endereço. A entidade Área *não integrava* o modelo operacional desde o início.

**Sobre o modelo de vistorias:**

> *"O sistema considera que os endereços importados constituem referência cadastral inicial; as vistorias realizadas em campo geram registros próprios; múltiplas vistorias podem ocorrer para um mesmo endereço."*

**Sobre o backlog:** 32 itens planejados, organizados em seis entregas semanais.

Esse era o mapa no início da jornada. Claro, razoável, bem-intencionado — e com uma premissa central que o campo viria a contestar.

---

## O que mudou — e quando

A mudança mais significativa aconteceu na terceira semana, em 2 de fevereiro de 2026.

Após a apresentação das primeiras telas funcionais, o cliente realizou uma revisão completa do fluxo de trabalho dos agentes em campo. O que a revisão revelou foi que a premissa de conectividade do entendimento inicial estava errada — não por uma questão de grau, mas de natureza.

A ata consolidou: *"foram identificados problemas de coesão visual do frontend, operação offline, navegação por perfil, georreferenciamento por setor censitário e sincronização das vistorias."*

A premissa de "curtos períodos de instabilidade" não correspondia à realidade: agentes operavam em áreas com sinal instável ou inexistente de forma recorrente e prolongada. O modelo *online-first* era inviável para a operação real.

Dois dias depois da ata, o ADR correspondente formalizou a decisão:

> *"Os agentes de campo operam em ambientes com conectividade instável ou inexistente. O sistema precisa funcionar de forma confiável nesses cenários sem perda de dados."*

Essa mudança não era pequena. Era uma revisão arquitetural que afetava autenticação, persistência, sincronização e a experiência completa do perfil que mais usaria o sistema.

---

## A trajetória em números

| Momento | Itens no backlog | Estado |
|---|---|---|
| Entendimento inicial (jan.) | 32 | Planejado |
| Semana 2 (fev.) | ~38 | Crescimento por decisões de escopo |
| Semana 4 (fev.) | ~55 | Crescimento por operação real |
| Encerramento (mar.) | 100 | 81 concluídos, 19 pendentes |

O crescimento de 32 para 100 itens não representa falha de planejamento. Representa o aprendizado acumulado ao longo do projeto: regras de negócio descobertas em uso, comportamentos que precisaram ser refinados, evoluções que a operação real revelou como necessárias.

Com a MEDE, cada um dos 100 itens tem origem rastreável: os 32 originais apontam para o entendimento inicial, os demais apontam para a ata ou o ESM que os originou. Não há itens que "apareceram do nada".

---

## O que a documentação preservou

Ao final do projeto, a pasta `docs/` continha:

- 11 atas de reunião
- 7 registros de decisão arquitetural (ADRs)
- 4 especificações de manutenção (ESMs) com dezenas de itens cada
- 8 logs de entrega semanais
- Documentos vivos atualizados
- O entendimento inicial intacto — exatamente como foi escrito em janeiro

Esses documentos permitem que qualquer pessoa que chegue ao projeto hoje — sem ter acompanhado nenhuma reunião, sem ter conversado com nenhum participante — entenda o que o sistema faz, por que foi construído assim, quais decisões foram tomadas e em que contexto, como o entendimento inicial difere do entendimento final, e onde cada item do backlog surgiu.

---

## O teste do "e se não houvesse MEDE?"

Sem documentação causal, o que teria sobrado?

O repositório Git teria o código — e as mensagens de commit, que descrevem o quê mas raramente o porquê. As conversas de WhatsApp e as mensagens de chat teriam registros fragmentados, acessíveis apenas a quem participou. A memória das pessoas teria o contexto — por algum tempo.

Seis meses depois, com qualquer mudança na equipe, uma pergunta como "por que o sistema usa banco local no tablet?" exigiria arqueologia. A resposta existe nos ADRs: *"os agentes de campo operam em ambientes com conectividade instável ou inexistente."* Com a MEDE, a resposta é uma leitura de dois minutos. Sem ela, pode não ter resposta.

---

## Por que este projeto é um bom caso didático

Três características tornam este projeto particularmente útil.

**Primeiro:** teve uma invalidação explícita de premissa central. A mudança de *online-first* para *offline-first* é exatamente o tipo de revisão que, sem documentação causal, se torna invisível no histórico. Com a MEDE, ficou completamente visível.

**Segundo:** o backlog cresceu mais do que o dobro. Documentado semana a semana, ele conta uma história de aprendizado progressivo, não de escopo descontrolado.

**Terceiro:** a documentação tem imperfeições de convenção. Os IDs do backlog nas primeiras semanas usam um formato (`BL-001`, `BL-002`) diferente do padrão formalizado no Capítulo 12. Isso é real e deliberadamente mantido — para mostrar que a MEDE funciona mesmo quando as convenções estão sendo estabelecidas durante o projeto.

---

> **Em resumo**
>
> O caso real desta Parte IV é um sistema de verificação operacional de endereços em campo, desenvolvido em seis semanas com entregas semanais. O entendimento inicial previa operação *online-first* com "curtos períodos de instabilidade de rede". Na terceira semana, a operação real revelou que os agentes trabalham em áreas com sinal instável de forma recorrente — e o sistema foi redesenhado para *offline-first*. Essa mudança ficou completamente documentada: ata, ADR, consequências explicitadas. O projeto começou com 32 itens de backlog e encerrou com 100 rastreados, cada um com origem identificável. Sem a MEDE, o raciocínio por trás dessas decisões seria inacessível para qualquer pessoa que chegasse ao projeto depois.

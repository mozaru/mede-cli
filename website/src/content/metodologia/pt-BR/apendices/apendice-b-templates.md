---
title: "Apêndice B — Templates dos Artefatos"
order: 0
---

# Apêndice B — Templates dos Artefatos

Templates de referência para os artefatos da MEDE. Cada template inclui todos os campos obrigatórios e instruções de preenchimento. O nível de detalhe de cada campo é calibrado ao contexto do projeto — a estrutura é a que não varia.

---

## Template: Ata

**Nome do arquivo:** `ata-AAAAMMDD-NNN-descricao-curta.md`

```
Ata — AAAA-MM-DD — Ciclo NNN

Data: AAAA-MM-DD
Ciclo: NNN
Tipo: [Reunião presencial | Chamada | Assíncrona | Incidente | Outro]
Participantes: [lista de nomes e papéis]

---

1. Contexto e ponto de partida

   [O que estava em aberto, pendente ou em discussão antes deste ciclo.
    Uma ou duas frases são suficientes se o contexto for claro.
    Referenciar o ciclo anterior se relevante: "continuação do ciclo NNN".]

2. Problemas identificados / mudanças de entendimento

   [O que foi descoberto, revisado, questionado ou contestado.
    Inclui: premissas que se mostraram incorretas, feedbacks do campo,
    incidentes, revisões de requisito.
    Omitir se não houve mudança de entendimento relevante neste ciclo.]

3. Decisões tomadas

   [Lista das decisões, cada uma com clareza suficiente para ser
    rastreada. Prefira frases no formato:
    "Decidido que [o quê] por [razão resumida]."
    Decisões com impacto arquitetural devem gerar ADR — indicar aqui.]

4. Encaminhamentos

   [O que cada pessoa ou área deve fazer a partir desta ata.
    Inclui: implementações pendentes, documentos a atualizar,
    validações a realizar, próximas reuniões necessárias.]

5. Impacto documental esperado

   [Quais artefatos devem ser criados ou atualizados como resultado
    desta ata. Exemplos:
    - Gerar ADR sobre [tema]
    - Atualizar requisitos-funcionais.md, seção [X]
    - Gerar ESM com [lista de comportamentos esperados]
    - Nenhum impacto documental adicional além da ata]
```

**Quando produzir:** ao final de cada ciclo documental, consolidando o material acumulado no staging semântico.

**O que não incluir:** transcrições completas de conversas, detalhes operacionais sem impacto no conhecimento do projeto, informações que serão desatualizadas em dias.

---

## Template: ADR

**Nome do arquivo:** `adr-AAAAMMDD-NNN-descricao-curta.md`

```
ADR-AAAAMMDD-NNN — [Título descritivo da decisão]

Status: [Proposto | Aceito | Supersedido por ADR-AAAAMMDD-NNN]
Data: AAAA-MM-DD
Ciclo: NNN
Decisores: [nomes de quem participou da decisão]

---

Contexto

[O problema que precisava ser resolvido e por que a decisão era
 necessária naquele momento. Inclui o contexto técnico e de negócio
 que tornava a decisão relevante.
 
 Uma boa seção de contexto permite que alguém leia o ADR anos depois
 e entenda por que a decisão foi necessária — sem precisar conhecer
 o histórico do projeto.]

Decisão

[O que foi decidido, de forma clara e direta. Evite ambiguidade.
 Se a decisão tem componentes distintos, enumere-os.
 
 Esta seção responde: "o que foi escolhido?"]

Alternativas descartadas

[O que foi considerado e por quê não foi escolhido.
 Para cada alternativa: descreva brevemente o que era e qual foi
 a razão do descarte.
 
 Esta seção é tão importante quanto a decisão em si — é o que permite
 avaliar, no futuro, se as condições que levaram ao descarte ainda existem.]

Consequências

[O que muda no sistema a partir desta decisão. Inclui:
 - impactos técnicos (o que precisa ser implementado)
 - tradeoffs aceitos conscientemente
 - riscos conhecidos
 - restrições que esta decisão impõe a decisões futuras
 
 Esta seção responde: "o que o sistema ganha e o que abre mão?"]
```

**Quando produzir:** quando uma decisão (a) afeta a estrutura do sistema de forma não trivial, (b) tem alternativas plausíveis que foram descartadas, ou (c) provavelmente será questionada no futuro por quem não tinha o contexto da discussão original.

**Quando não produzir:** para decisões de implementação rotineiras, escolhas sem alternativas plausíveis, ou detalhes que não afetam a estrutura do sistema.

**Se uma decisão for revisada:** crie um novo ADR com `Status: Supersedido por ADR-[novo]` no ADR original. Nunca edite o ADR original.

---

## Template: ESM

**Nome do arquivo:** `esm-AAAAMMDD-NNN.md`

```
ESM — AAAA-MM-DD — Ciclo NNN

Identificador: ESM-AAAAMMDD-NNN
Origem: [ata ou evento que gerou este ESM]
Status: [Aberto | Parcialmente implementado | Consolidado]

---

Objetivo

[Uma frase descrevendo o que este ESM especifica: correções,
 ajustes de usabilidade, regras de negócio, evoluções funcionais
 identificadas em [evento de origem].]

---

[Seção por categoria de item. As categorias típicas são:]

Correções

[ID] — [Módulo] — [Título]
Descrição: [o que está errado]
Comportamento esperado: [como deve funcionar após a correção]

[Repetir para cada correção]

---

Ajustes de usabilidade

[ID] — [Módulo] — [Título]
Situação atual: [como está]
Comportamento esperado: [como deve ficar]

[Repetir para cada ajuste]

---

Regras de negócio

[ID] — [Módulo] — [Título]
Comportamento esperado: [descrição da regra]

[Repetir para cada regra]

---

Evoluções funcionais

[ID] — [Módulo] — [Título]
Comportamento esperado: [descrição da nova capacidade]

[Repetir para cada evolução]
```

**Padrão de ID de item:**
```
ESM-AAAAMMDD-NNN-NAT-TIP-NNNN

NAT (Natureza): RF | NF | RN | UX | AR | OP
TIP (Tipo):     COR | AJU | EVO | BLI

Exemplo: ESM-20260224-005-UX-AJU-0003
```

**Quando produzir:** após ciclos de operação real que revelam ajustes necessários, ou quando se acumula um conjunto de mudanças decididas que precisam ser formalizadas antes de entrar nos documentos vivos.

**Regra importante:** cada item descreve o *comportamento esperado* após a mudança — não o comportamento atual, não o motivo técnico do problema. O ESM é especificação, não relatório de bug.

---

## Template: Log de Entregas (LEG)

**Nome do arquivo:** `leg-AAAAMMDD-NNN-descricao-ciclo.md`

```
Log de Entregas — Ciclo NNN

Data de referência: AAAA-MM-DD
Ciclo: NNN

---

Objetivo do ciclo

[Uma ou duas frases descrevendo o foco principal do ciclo.]

---

Itens entregues

| ID | Tipo | Nome | Origem | Status |
|---|---|---|---|---|
| [ID] | [Feature/Ajuste/Correção] | [Nome] | [Ata/Escopo/ESM] | Concluído |

---

Itens planejados não entregues

| ID | Nome | Motivo |
|---|---|---|
| [ID] | [Nome] | [Razão do não-encerramento] |

---

Itens novos identificados no ciclo

| ID | Tipo | Nome | Origem |
|---|---|---|---|
| [ID] | [Tipo] | [Nome] | [Ata que originou] |

---

Resultado

[Parágrafo de duas a quatro frases resumindo o ciclo: o que foi entregue,
 o que ficou pendente, o que surgiu de novo, e o estado geral do projeto.]
```

---

## Template: Entendimento Inicial

**Nome do arquivo:** `entendimento-inicial.md` (raiz de `docs/`)

```
Entendimento Inicial do Projeto

[Nome do projeto]
Data: AAAA-MM-DD (ciclo 000)

Nota: Este documento nunca é alterado após criação.
Representa o entendimento disponível no início do projeto.

---

1. Objetivo do documento

   [Por que este documento existe e o que registra.]

2. Contexto geral do projeto

   [O problema que o projeto resolve, para quem, e em que contexto
    operacional. Inclui o ambiente de uso, os usuários principais,
    e a dor que motiva o desenvolvimento.]

3. Premissas técnicas fundamentais

   [Stack definida, infraestrutura prevista, integrações conhecidas,
    restrições técnicas identificadas no início.]

4. Modelo operacional inicial

   [Como o sistema será usado: perfis de usuário, fluxos principais,
    contexto de operação (desktop, mobile, campo, escritório).]

5. Backlog inicial

   [Lista dos itens planejados, mesmo que incompleta.
    Pode ser uma tabela simples com ID, nome e entrega prevista.
    Incertezas podem ser registradas como incertezas.]

6. Cronograma inicial

   [Entregas planejadas com datas. Mesmo que estimado.
    O cronograma inicial, comparado ao final, mostra o aprendizado
    sobre a complexidade real do projeto.]

7. Premissas e incertezas conhecidas

   [O que se assume como verdadeiro mas ainda não foi validado.
    O que é incerto e será descoberto durante o projeto.
    Registrar as incertezas é tão importante quanto registrar as certezas.]
```

---

## Template: Situação Atual

**Nome do arquivo:** `situacao-atual.md` (raiz de `docs/`, atualizado a cada ciclo)

```
Situação Atual

Projeto: [Nome]
Data de referência: AAAA-MM-DD
Ciclo: NNN

---

1. Resumo analítico

   [Parágrafo de síntese: onde o projeto está, o que está funcionando,
    onde estão as pendências principais. Escrito para quem lê primeiro
    sem contexto anterior.]

2. Indicadores consolidados

   Itens concluídos: [N]
   Itens pendentes: [N]
   
   Distribuição das pendências:
   - Correções: [N]
   - Ajustes: [N]
   - Evoluções: [N]
   - Outros: [N]

3. Tabela consolidada de todos os itens

   | ID | Tipo | Nome | Origem | Situação |
   |---|---|---|---|---|
   | [ID] | [Tipo] | [Nome] | [Origem] | [Status] |

4. Próximos ciclos

   [O que está previsto para os próximos ciclos. Pode ser uma lista
    simples dos itens pendentes mais prioritários.]
```

---

## Template: README

**Nome do arquivo:** `readme.md` (raiz de `docs/`)

```
[Nome do projeto]

[Uma frase descrevendo o que o sistema é e para quem serve.]

---

O que é

[Dois a três parágrafos descrevendo o sistema: problema que resolve,
 quem usa, em que contexto. Escrito para alguém que nunca ouviu
 falar do projeto.]

Como está organizado

[Descrição da estrutura do projeto: repositórios, componentes
 principais, como as partes se relacionam.]

Como navegar a documentação

Este diretório `docs/` contém:

- `situacao-atual.md` — onde o projeto está agora
- `visao-e-escopo.md` — para onde vai e por quê
- `entendimento-inicial.md` — de onde partiu
- `requisitos-funcionais.md` — o que o sistema faz
- `requisitos-nao-funcionais.md` — como o sistema se comporta
- `modelo-de-dados.md` — como os dados estão organizados
- `cronograma.md` — o plano de entregas
- `atas/` — histórico de decisões por ciclo
- `adr/` — decisões arquiteturais estruturadas
- `esm/` — especificações de manutenção
- `log-entregas/` — registro do que foi entregue em cada ciclo

Sequência de leitura sugerida para quem chega agora:
1. Este arquivo
2. `situacao-atual.md`
3. `visao-e-escopo.md`
4. `entendimento-inicial.md`
5. Atas dos últimos dois ciclos
6. ADRs relevantes para a área de trabalho

Configuração e execução

[Instruções técnicas: como clonar, configurar dependências, executar
 localmente, rodar testes. Mantido atualizado a cada release.]
```

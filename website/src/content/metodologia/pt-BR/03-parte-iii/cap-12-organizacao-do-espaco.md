---
title: "Organização do espaço documental"
order: 12
---

# Capítulo 12 — Organização do espaço documental

A forma como os artefatos de um projeto estão organizados fisicamente não é um detalhe estético. É parte integrante da metodologia.

Uma estrutura bem projetada permite que qualquer pessoa navegue pelo projeto sem orientação prévia — encontrando o que procura pela lógica da organização, não pela memória de onde alguém decidiu colocar cada coisa. Ela torna a rastreabilidade trivial. Ela permite automação. E ela comunica, pelo próprio layout, qual é o papel de cada artefato.

Uma estrutura mal projetada — ou inexistente — transfere para a memória humana o trabalho que deveria estar na organização. Onde está a decisão sobre autenticação? Depende de quem pergunta. Quem pergunta à pessoa errada, ou chega depois que ela foi embora, não encontra.

---

## O princípio da navegabilidade sem orientação

A estrutura documental da MEDE é projetada para que um desenvolvedor que chega ao projeto pela primeira vez — sem ninguém para orientar — consiga:

1. Entender o que o projeto é e qual problema resolve (em menos de 5 minutos, lendo o `readme.md`)
2. Entender onde o projeto está agora (em menos de 10 minutos, lendo o `situacao-atual.md`)
3. Encontrar o histórico de qualquer decisão (sem orientação, pelo nome dos arquivos nos diretórios de artefatos históricos)
4. Reconstruir a trajetória do projeto, da origem ao presente (percorrendo as atas em ordem cronológica)

Esse é o teste prático de uma boa estrutura documental MEDE. Se qualquer um desses quatro pontos exige ajuda humana, a estrutura tem uma lacuna.

---

## A estrutura de referência

```
docs/
│
│   entendimento-inicial.md      ← congelado desde o ciclo 000
│   modelo-de-dados.md           ← documento vivo
│   readme.md                    ← documento vivo — porta de entrada
│   requisitos-funcionais.md     ← documento vivo
│   requisitos-nao-funcionais.md ← documento vivo
│   cronograma.md                ← documento vivo
│   situacao-atual.md            ← documento vivo — síntese do ciclo atual
│   visao-e-escopo.md            ← documento vivo
│
├── atas/
│   │   ata-20260113-000-kickoff.md
│   │   ata-20260119-001-modelo-operacional.md
│   │   ata-20260126-002-revisao-ux.md
│   └── ata-20260202-004-offline-first.md
│
├── adr/
│   │   adr-20260113-000-stack-tecnologica.md
│   │   adr-20260113-000-estrutura-repositorio.md
│   └── adr-20260202-004-sincronizacao-offline.md
│
├── esm/
│   │   esm-20260224-005.md
│   └── esm-20260302-006.md
│
└── log-entregas/
    │   leg-20260126-002.md
    └── leg-20260202-004.md
```

Os documentos vivos ficam na raiz do diretório `docs/`. Não em subpastas. A decisão é intencional: eles são o estado atual, o que qualquer pessoa deve encontrar imediatamente ao abrir a pasta.

Os artefatos históricos ficam em subdiretórios separados por tipo. Não há diretório por ciclo — a data no nome do arquivo já garante a ordenação cronológica dentro de cada tipo.

---

## A convenção de nomenclatura em detalhe

**Artefatos históricos** seguem o padrão:
```
tipo-AAAAMMDD-NNN-descricao-curta.md
```

Onde:
- `tipo` é o prefixo que identifica a natureza do artefato: `ata`, `adr`, `esm`, `leg`
- `AAAAMMDD` é a data de consolidação no formato ISO 8601 sem separadores
- `NNN` é o número do ciclo, com três dígitos e zero à esquerda: `000`, `001`, `012`
- `descricao-curta` é opcional — útil em atas e ADRs para identificação rápida sem abrir o arquivo

A ordenação alfabética de qualquer diretório de artefatos históricos é automaticamente cronológica — porque a data antecede o número de ciclo no nome.

**Documentos vivos** têm nomes sem data e sem número de ciclo:
```
situacao-atual.md
requisitos-funcionais.md
```

A ausência de data no nome comunica que o documento é sempre atual — não está associado a um momento específico, mas ao presente.

---

## O padrão de identificação de itens de backlog

Além dos artefatos-arquivo, a MEDE define um padrão para identificar itens individuais — itens de backlog, itens de ESM, itens do log de entregas — de forma que sejam rastreáveis entre documentos.

O padrão completo é:
```
DOC-AAAAMMDD-NNN-NAT-TIP-NNNN
```

Onde:
- `DOC` identifica o documento de origem: `DEI` (entendimento inicial), `ESM`, `ATA`
- `AAAAMMDD-NNN` é a data e ciclo de origem
- `NAT` é a natureza do item: `RF` (requisito funcional), `NF` (não funcional), `RN` (regra de negócio), `UX` (interface), `AR` (arquitetura), `OP` (operacional)
- `TIP` é o tipo de item: `BLI` (backlog item), `COR` (correção), `AJU` (ajuste), `EVO` (evolução)
- `NNNN` é o número sequencial dentro do documento e tipo

**Exemplos:**
```
DEI-20260113-000-RF-BLI-0001   ← item de backlog do entendimento inicial
DEI-20260113-000-RF-BLI-0002   ← segundo item de backlog
ESM-20260224-005-RN-EVO-0001   ← evolução de regra de negócio no ESM do ciclo 005
ESM-20260224-005-UX-COR-0003   ← correção de interface no mesmo ESM
```

Esses IDs permitem que a `situacao-atual.md` referencie qualquer item de qualquer artefato com precisão — e que o status de cada item seja rastreável até sua origem, independentemente de quantos ciclos se passaram.

A regra mais importante: **IDs nunca são renomeados**. Se a convenção evoluiu no ciclo 004 e os ciclos anteriores usavam um formato diferente, os IDs antigos permanecem. Documentos históricos que os referenciam não podem ser alterados — e alterar apenas os IDs criaria referências quebradas nesse acervo imutável.

---

## O diretório docs/ no repositório do projeto

A estrutura documental da MEDE vive, na maioria dos projetos, dentro do repositório de código — no diretório `docs/`. Isso não é acidental.

Manter a documentação no mesmo repositório que o código oferece vantagens concretas:

**Versionamento conjunto.** Mudanças no código e mudanças na documentação correspondente ficam no mesmo commit ou pull request. A sincronia entre código e documentação é facilitada — e a ausência de sincronia fica visível no histórico de commits.

**Acesso unificado.** Todo desenvolvedor que tem acesso ao repositório tem acesso à documentação. Não há conta extra, não há plataforma separada, não há permissão especial.

**Portabilidade.** Markdown é texto simples, versionável por qualquer sistema de controle de versão, legível em qualquer editor, renderizável por qualquer plataforma que suporte Markdown. A documentação não fica presa em nenhuma ferramenta.

**Legibilidade por ferramentas de IA.** Documentação em Markdown estruturado dentro do repositório pode ser lida por ferramentas de desenvolvimento assistido por IA — tornando-se contexto disponível para cada sessão de trabalho, sem necessidade de recontextualização manual.

---

## O que a estrutura comunica

Uma estrutura documental bem organizada comunica, pelo próprio layout, coisas que nenhuma documentação textual precisa explicar explicitamente.

Quando um desenvolvedor abre o diretório `docs/` e vê os documentos vivos na raiz e os históricos em subdiretórios por tipo, entende imediatamente onde está o presente e onde está o passado. Quando abre o diretório `adr/` e vê arquivos ordenados cronologicamente por nome, sabe que pode percorrê-los em ordem para reconstruir a história das decisões arquiteturais. Quando vê um arquivo chamado `adr-20260202-004-sincronizacao-offline.md`, sabe antes de abri-lo que é uma decisão arquitetural do ciclo 4, tomada em 2 de fevereiro de 2026, sobre sincronização offline.

Essa legibilidade sem abertura de arquivo não é luxo. Em projetos com muitos artefatos, ela é o que torna a navegação prática — e o que torna possível que ferramentas automatizadas, incluindo o mede-cli, naveguem programaticamente pelo espaço documental sem configuração adicional.

---

## Adaptações e variações

A estrutura de referência apresentada neste capítulo é um ponto de partida, não uma regra absoluta. Projetos diferentes podem ter necessidades diferentes.

Um projeto com vários subsistemas pode ter um `docs/` por subsistema, com uma pasta `docs/` raiz para decisões que afetam o conjunto. Um projeto com documentação extensa pode organizar os documentos vivos em subcategorias. Uma equipe pode preferir nomes de arquivo em inglês para projetos internacionais.

O que não deve variar são os princípios: documentos vivos separados de históricos, nomenclatura que permita inferir papel e época, IDs imutáveis, e a estrutura que permita navegação sem orientação.

Adaptações que preservam esses princípios são bem-vindas. Adaptações que os comprometem — misturar histórico com presente, usar nomes sem padrão temporal, alterar IDs históricos — quebram as garantias que a MEDE oferece.

---

> **Em resumo**
>
> A organização física do espaço documental é parte integrante da MEDE, não um detalhe secundário. A estrutura de referência coloca documentos vivos na raiz de `docs/` e artefatos históricos em subdiretórios por tipo, com nomenclatura que permite inferir o papel e a época de cada arquivo sem abri-lo. O padrão de nomenclatura dos artefatos históricos — `tipo-AAAAMMDD-NNN-descricao.md` — garante ordenação cronológica automática. O padrão de IDs de itens de backlog permite rastreabilidade precisa entre documentos. A estrutura deve passar no teste da navegabilidade sem orientação: qualquer pessoa que chegue ao projeto pela primeira vez deve conseguir entender o que é, onde está, e como chegou até aqui, percorrendo os documentos na ordem sugerida pela própria estrutura.

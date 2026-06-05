---
title: "Erros comuns e como evitá-los"
order: 18
---

# Capítulo 18 — Erros comuns e como evitá-los

A metodologia é simples de entender. Manter a disciplina de aplicação ao longo do tempo é mais difícil. Este capítulo cataloga os erros mais comuns — os que aparecem repetidamente em equipes que adotam a MEDE — e explica por que cada um compromete o que a metodologia busca garantir.

---

## Erro 1 — Documentar tudo, sempre

O excesso é tão danoso quanto a escassez.

Uma equipe que decide "documentar tudo" rapidamente cria um acervo volumoso que ninguém lê — porque encontrar o que importa em meio ao que não importa custa mais do que não ter documentação nenhuma.

A MEDE não é exaustiva. É criteriosa. O critério central é: **isso tem impacto no conhecimento do projeto a longo prazo?**

Uma discussão sobre o nome de uma variável não tem. Uma decisão sobre a estratégia de autenticação tem. Uma conversa sobre o horário de uma reunião não tem. Uma mudança na política de sincronização offline tem.

Documentar sem critério é esforço que não gera valor — e que pode desmotivar a equipe a continuar o processo.

**Como evitar:** use o teste do novo membro. Se um desenvolvedor que chegasse ao projeto amanhã precisaria saber aquilo para trabalhar com segurança, documente. Se não precisaria, não documente — ou documente no nível mínimo necessário (uma linha na ata basta).

---

## Erro 2 — Atualizar documentos vivos por impulso

O segundo erro mais comum: perceber que algo está desatualizado num documento vivo e corrigi-lo imediatamente, fora de um ciclo formal.

Parece razoável. É prejudicial.

Atualizações avulsas em documentos vivos criam mudanças sem origem rastreável. O documento vivo passa a ter um estado que não tem ata correspondente, que não tem ADR, que não tem ESM. A cadeia causal fica quebrada — e a próxima pessoa a ler o documento não tem como saber quando aquilo mudou, por quê, e se é consistente com o restante do projeto.

**Como evitar:** quando perceber que um documento vivo está desatualizado, anote no staging semântico. A correção acontece no próximo ciclo, com ata que a origina. Se a desatualização é crítica e não pode esperar, crie um ciclo extra — mas produza a ata correspondente.

---

## Erro 3 — Tratar a ata como relato de reunião

A ata MEDE não é uma transcrição. Não registra quem falou primeiro, qual foi a pergunta que abriu a discussão, ou os detalhes de cada conversa lateral.

Uma ata que tenta ser um relato completo de reunião tem dois problemas: é longa demais para ser lida depois, e mistura o que é relevante para o projeto com o que é relevante apenas para os participantes do momento.

A ata MEDE é uma consolidação — o destilado do que foi relevante para o projeto. Ela responde: o que aconteceu? O que foi decidido? Qual é o impacto sobre os artefatos?

**Como evitar:** ao escrever a ata, pense em quem vai ler daqui a um ano. Essa pessoa não precisa de contexto da dinâmica da reunião. Precisa de clareza sobre o que foi decidido e por quê.

---

## Erro 4 — Renomear artefatos históricos

Acontece especialmente quando a convenção de nomenclatura evolui: a equipe padronizou os nomes de uma forma no início e depois percebe que quer um formato diferente. O impulso é renomear os arquivos antigos para ficarem consistentes com o padrão novo.

Não faça isso.

Documentos históricos que referenciam esses artefatos pelo nome original ficam com referências quebradas. O acervo histórico, que deveria ser imutável, passa a ter inconsistências que não podem ser corrigidas sem editar os documentos históricos — o que viola o princípio da imutabilidade.

**Como evitar:** adote a nova convenção apenas nos novos artefatos. Documente a mudança de convenção numa ata. O acervo terá artefatos com formatos diferentes em épocas diferentes — isso é esperado e aceitável. O caso real deste livro é um exemplo: os IDs das primeiras semanas (`BL-001`, `BL-002`) são diferentes do padrão formalizado mais tarde. Essa diferença foi preservada intencionalmente.

---

## Erro 5 — Usar o ESM como backlog alternativo

O ESM lista comportamentos esperados, correções e evoluções. À primeira vista, parece um backlog em Markdown.

Não é.

A diferença está no propósito e nas regras. O backlog organiza trabalho — seus itens podem ser removidos, repriotizados, descartados. O ESM preserva conhecimento — seus itens têm origem causal rastreável e não podem ser descartados silenciosamente.

Quando uma equipe começa a usar o ESM como se fosse backlog — adicionando itens avulsamente, removendo itens sem registro, alterando itens sem ata correspondente — ele perde a propriedade que o torna valioso: a rastreabilidade causal.

**Como evitar:** lembre-se de que o ESM é um documento histórico após consolidação. Itens entram no ESM a partir de atas. Itens saem do ESM quando são absorvidos pelos documentos vivos — não quando são "fechados" como no backlog. Se um item do ESM não for implementado, isso precisa de justificativa documental.

---

## Erro 6 — Criar novos tipos de artefato sem necessidade real

A MEDE define cinco tipos de artefato. Às vezes, equipes sentem necessidade de criar tipos adicionais — "ata de decisão rápida", "nota técnica", "documento de contexto", etc.

Extensibilidade com critério é bem-vinda. Extensibilidade por preferência estética não.

Cada tipo de artefato que não tem papel claro na cadeia causal é um artefato que não será mantido de forma consistente — porque ninguém saberá quando produzi-lo, quando lê-lo, e o que fazer quando ele precisa ser atualizado.

**Como evitar:** antes de criar um novo tipo, pergunte qual dos cinco tipos existentes não cobre o caso — e por quê. Se a resposta for "nenhum cobre exatamente", verifique se o caso realmente não cabe em nenhum deles com um pequeno ajuste de uso. Na maioria das vezes, cabe.

---

## Erro 7 — Aguardar o "momento certo" para começar

"Vamos terminar este ciclo de desenvolvimento e aí começamos a documentar." "Depois que lançarmos a versão 2, organizamos a documentação." "Quando a equipe estiver mais estável, adotamos a metodologia."

O momento certo não existe. O momento útil é agora.

Cada semana sem ciclo documental é uma semana de conhecimento que se acumula apenas na memória das pessoas. E memória é volátil.

Começar com um entendimento inicial imperfeito e um ritmo irregular é incomparavelmente melhor do que não começar. A metodologia melhora com a prática — e a prática começa quando se começa.

**Como evitar:** comece pelo mínimo. Crie o `entendimento-inicial.md` hoje com o que você sabe hoje. Produza uma ata na próxima semana. Os demais elementos vão se encaixando naturalmente.

---

## Erro 8 — Usar a MEDE sem versionamento

A MEDE é muito mais poderosa quando os documentos estão em Git — ou em qualquer sistema de controle de versão. Não porque exija uma ferramenta específica, mas porque a rastreabilidade documental que a metodologia promete precisa de rastreabilidade física para ser confiável.

Quando a documentação MEDE vive em pastas soltas, num Google Drive desorganizado, ou em arquivos enviados por e-mail, acontece o seguinte: alguém atualiza um documento vivo fora do ciclo e ninguém percebe. Alguém edita uma ata depois de consolidada e não há evidência da alteração. O histórico de quem mudou o quê e quando desaparece junto com a memória das pessoas.

O repositório Git resolve tudo isso de forma gratuita: cada commit registra o que mudou, quando e por quem. Um commit associado ao encerramento de um ciclo (com mensagem como `ciclo-007: ata + adr offline-first + atualização requisitos`) cria uma rastreabilidade dupla — a da metodologia (quem gerou o artefato, em qual ciclo) e a do versionamento (quando foi commitado, por quem, com qual estado dos demais arquivos).

**Como evitar:** mantenha o diretório `docs/` no mesmo repositório do projeto, ou num repositório documental dedicado com versionamento. Commits por ciclo são a prática natural — ao encerrar o ciclo, commitar todos os artefatos produzidos juntos. Isso torna o histórico do Git uma linha do tempo legível da evolução documental do projeto.

**Um benefício adicional:** com os documentos versionados, é possível usar o `git diff` para ver exatamente o que mudou entre dois ciclos em qualquer documento vivo — e o `git log` para ver quando cada artefato foi criado. A observabilidade epistemológica que a MEDE promete fica completa.

---

## Uma nota sobre imperfeição

Nenhum projeto aplica a MEDE de forma perfeita. O projeto do caso real deste livro, que serviu de base para a metodologia, tem convenções que evoluíram durante o desenvolvimento, IDs com formatos diferentes em épocas diferentes, e artefatos que não seguem exatamente os padrões apresentados na Parte III.

Isso não compromete o valor da documentação. O que importa é que o conhecimento está preservado, que a trajetória é rastreável, e que alguém novo consegue entender o projeto lendo os documentos na ordem certa.

A MEDE não é um ideal a ser atingido. É uma prática a ser cultivada — com melhorias contínuas, ajustes de convenção ao longo do tempo, e tolerância para imperfeições que não comprometem a rastreabilidade fundamental.

---

> **Em resumo**
>
> Os oito erros mais comuns na adoção da MEDE são: documentar tudo sem critério, atualizar documentos vivos fora do ciclo, tratar a ata como transcrição, renomear artefatos históricos, usar o ESM como backlog alternativo, criar novos tipos de artefato sem necessidade, aguardar o momento perfeito para começar — e manter os documentos MEDE fora de versionamento. Este último é especialmente insidioso porque parece um detalhe técnico, mas compromete a rastreabilidade física que torna confiável a rastreabilidade metodológica. A MEDE funciona melhor quando o `docs/` está no repositório Git do projeto, com commits por ciclo. Nenhum projeto aplica a metodologia de forma perfeita — o que importa é preservar o conhecimento e manter a rastreabilidade fundamental.

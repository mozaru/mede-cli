---
title: "Adoção individual: começando sozinho"
order: 20
---

# Capítulo 20 — Adoção individual: começando sozinho

A forma mais comum de adotar a MEDE é começar sem pedir permissão.

Um desenvolvedor que entende o problema e quer a solução não precisa esperar que a equipe inteira esteja alinhada, que o gerente aprove, ou que o projeto tenha "maturidade suficiente" para documentação estruturada. Pode começar hoje, no seu próprio trabalho, e deixar que os resultados falem por si.

---

## O que faz sentido documentar sozinho

Nem todos os artefatos da MEDE fazem o mesmo sentido quando se trabalha sem interlocutor direto.

**Faz muito sentido:**

O `entendimento-inicial.md` faz sentido mesmo sozinho — documenta o que você sabe hoje, e você mesmo vai agradecer daqui a três meses quando precisar explicar para alguém como o projeto começou.

Os ADRs fazem sentido mesmo sozinho — especialmente em projetos onde você toma decisões arquiteturais e sabe que vai precisar justificá-las no futuro. Escrever um ADR no momento da decisão leva quinze minutos. Reconstruir o raciocínio seis meses depois leva muito mais.

O `situacao-atual.md` faz muito sentido sozinho — é a ferramenta que permite que qualquer pessoa (inclusive você mesmo depois de uma semana de férias) entenda onde o projeto está sem precisar ler todo o código.

**Faz menos sentido sem interlocutor:**

Atas de reunião pressupõem reunião. Mas decisões tomadas individualmente também podem ser registradas — uma "ata de decisão" é apenas o registro de que você, em determinado momento, decidiu algo relevante e registrou o raciocínio. O nome do artefato não precisa mudar; o que importa é que a decisão ficou documentada.

---

## A MEDE como ferramenta de raciocínio

Além do registro para o futuro, existe um benefício imediato e menos óbvio de documentar decisões de forma estruturada: o processo de escrever força a clareza.

Tentar escrever a seção "Alternativas descartadas" de um ADR frequentemente revela que você não considerou alternativas de forma suficientemente rigorosa. Tentar escrever "Consequências" frequentemente revela implicações que você não havia percebido antes de formalizá-las.

A documentação causal não é apenas memória para o futuro. É um instrumento de pensamento no presente.

Desenvolvedores que adotam a MEDE individualmente frequentemente relatam que o processo de escrever um ADR melhorou a decisão em si — não apenas seu registro.

---

## Cadência recomendada para uso individual

Sozinho, um ciclo semanal costuma ser suficiente para projetos em ritmo normal. Em fases intensas de desenvolvimento — quando decisões relevantes se acumulam rapidamente — use ciclos por decisão relevante: sempre que algo acontecer que valha a pena preservar, consolide na hora ou ao final do dia.

A regra prática: se você precisaria lembrar disso amanhã para trabalhar com segurança, documente hoje.

---

## Como convencer a equipe sem fazer um discurso

A forma mais eficaz de convencer uma equipe a adotar a MEDE não é uma apresentação sobre a metodologia. É mostrar resultados práticos em situações concretas:

**Quando alguém pergunta "por que fizemos assim?"** e você consegue responder apontando para um ADR — com contexto, alternativas e consequências.

**Quando um novo membro entra na equipe** e você consegue orientá-lo com `readme.md` e `situacao-atual.md` atualizados, em vez de horas de explicação.

**Quando você retoma um projeto depois de semanas em outro contexto** e o `situacao-atual.md` te devolve o estado em dez minutos.

Esses momentos falam mais do que qualquer apresentação. Quando a equipe percebe que a documentação que você manteve resolveu um problema real, a conversa sobre adoção coletiva fica muito mais fácil.

---

## O risco da adoção individual isolada

Se você adota a MEDE individualmente mas não compartilha os documentos com a equipe — se ficam num diretório que só você acessa, ou num formato que os outros não conhecem — a documentação resolve o problema pessoal mas não resolve o problema do projeto.

A MEDE individual é mais valiosa quando está no repositório do projeto, acessível a todos, mesmo que os outros ainda não estejam contribuindo ativamente para ela. A presença dos documentos no repositório já é uma forma de convite.

---

## Primeiros passos — checklist para a primeira semana

Para sair deste capítulo com ação concreta:

- [ ] Criar `docs/` no repositório do projeto
- [ ] Escrever `entendimento-inicial.md` com o melhor entendimento disponível hoje
- [ ] Criar `situacao-atual.md` com o estado atual do projeto
- [ ] Registrar pelo menos um ADR real — a primeira decisão arquitetural relevante que você conseguir identificar
- [ ] Colocar todos esses arquivos no repositório do projeto (não em pasta local)
- [ ] Revisar o `situacao-atual.md` ao final da semana e atualizar o que mudou

Seis itens. A maioria das pessoas consegue fazer os quatro primeiros em menos de duas horas. O quinto é o que garante que a documentação não fica só com você. O sexto é o que estabelece o hábito.

---

> **Em resumo**
>
> Adotar a MEDE individualmente é possível e valioso — especialmente entendimento inicial, ADRs e situação atual, que fazem sentido mesmo sem interlocutor direto. Além do registro para o futuro, documentar decisões de forma estruturada tem benefício imediato: força a clareza do raciocínio. Sozinho, um ciclo semanal costuma ser suficiente; em fases intensas, ciclos por decisão relevante. A forma mais eficaz de convencer a equipe é mostrar resultados concretos — não fazer apresentações. E a documentação individual é mais valiosa quando está no repositório compartilhado, acessível a todos.

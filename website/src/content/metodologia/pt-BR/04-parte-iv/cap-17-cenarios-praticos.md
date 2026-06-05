---
title: "Cenários práticos"
order: 17
---

# Capítulo 17 — Cenários práticos

A metodologia descrita nos capítulos anteriores funciona bem num projeto de ritmo regular. Mas projetos reais têm irregularidades — eventos que não se encaixam perfeitamente no ciclo semanal planejado, situações que exigem decisão imediata, contextos onde o ritmo normal precisa ser ajustado.

Este capítulo descreve como a MEDE se comporta em cinco cenários recorrentes, com um sexto cenário que muitas equipes não antecipam mas que é cada vez mais comum.

---

## Cenário 1 — Uma mudança de requisito chega no meio do ciclo

O cenário mais comum: o cliente liga na quarta-feira com uma mudança. Ela é relevante, afeta decisões já tomadas, e o time precisa reagir antes do encerramento do ciclo de sexta.

**O que fazer:**

A mudança não vai diretamente para os documentos vivos. Vai para o staging semântico — um registro da conversa, uma nota sobre o que foi pedido e qual é o impacto percebido.

No encerramento do ciclo, a ata consolida o evento: o que foi solicitado, quando, por quem, e qual foi a decisão tomada. Se a mudança tem impacto arquitetural — afeta estrutura, modelo de dados, comportamento de componentes centrais — um ADR é produzido. Se é um ajuste de comportamento ainda não completamente especificado, entra no ESM.

**O que não fazer:** atualizar os documentos vivos imediatamente após a conversa, sem passar pelo ciclo. Isso cria mudanças sem origem rastreável.

**No caso real:** a conversa de 19/01 que removeu a entidade Área e o perfil Gestor aconteceu via WhatsApp e telefone, em meio à semana. A ata registrou o canal explicitamente — "WhatsApp e ligação telefônica" — preservando não apenas o conteúdo mas o contexto da comunicação.

---

## Cenário 2 — Um incidente crítico em produção

O sistema está em produção. Algo falha. A equipe precisa agir imediatamente — analisar, corrigir, verificar.

Incidentes críticos justificam um ciclo extra, fora da cadência regular.

**O que fazer:**

Após a resolução imediata, produza uma ata de incidente registrando: o que aconteceu e quando, o que foi descoberto na investigação, o que foi feito para resolver, e o que foi aprendido sobre o sistema.

Se o incidente revelou uma decisão arquitetural incorreta, um ADR documenta a revisão. Se revelou comportamentos que precisam ser corrigidos, um ESM os formaliza.

**No caso real:** o ESM de 24 de fevereiro consolidou 9 correções identificadas em operação real de campo — incluindo casos como vistoria offline perdendo dados ao expirar token, comportamento que só aparecia em condições específicas de campo.

---

## Cenário 3 — Onboarding de um novo membro

Um novo desenvolvedor entra na equipe. Com a MEDE, existe uma sequência de leitura que permite orientação autônoma:

1. `readme.md` — o que é o projeto e como navegar (10–15 min)
2. `situacao-atual.md` — onde o projeto está agora (15–20 min)
3. `visao-e-escopo.md` — para onde vai e por quê (10 min)
4. `entendimento-inicial.md` — de onde partiu (10 min)
5. Atas dos últimos dois ou três ciclos — o que aconteceu recentemente (20–30 min)
6. ADRs — as decisões estruturais, do mais recente ao mais antigo (a critério)

Com essa sequência, um desenvolvedor novo consegue ter visão coerente do projeto — passado, presente e direção futura — em menos de duas horas. Sem depender de ninguém estar disponível.

**O contraste:** sem documentação estruturada, o onboarding depende de conversas, perguntas ao time, tentativas de ler o código, e descobertas progressivas ao longo de semanas.

---

## Cenário 4 — Migração tecnológica

O sistema precisa ser migrado para uma nova plataforma. Os ADRs são o ponto de partida.

**O que os ADRs revelam:**

- Quais decisões foram tomadas por limitações da tecnologia atual (não precisam ser replicadas)
- Quais foram tomadas por razões de negócio (precisam ser respeitadas)
- Quais tradeoffs foram aceitos conscientemente (podem ser revistos)

**No caso real:** o ADR de stack registrou que o login offline foi *rejeitado* por risco de segurança. O ADR de offline-first, produzido três semanas depois, registrou uma decisão parcialmente diferente — com o contexto que tornou a revisão necessária. Alguém migrando o sistema hoje leria os dois ADRs em sequência e entenderia a trajetória completa sem precisar perguntar a ninguém.

---

## Cenário 5 — Múltiplos ciclos no mesmo dia

Em projetos com uso intensivo de ferramentas de IA generativa, o ritmo de decisões relevantes pode superar um ciclo por semana.

**O que muda:** o número de ciclos por período. Em vez de um por semana, pode haver dois ou três no mesmo dia — cada um com ata, artefatos derivados, e atualização dos documentos vivos.

**O que não muda:** a estrutura causal. O ciclo ainda começa com eventos reais, produz ata, e atualiza os documentos de estado. A rastreabilidade é preservada independentemente da velocidade.

**O benefício adicional:** com documentação atualizada ao final de cada sessão, a próxima sessão — com ou sem ferramentas de IA — começa com contexto completo. O agente de IA tem acesso a documentação que reflete o estado atual do projeto, não o estado de semanas atrás.

---

## Cenário 6 — Handoff contratual

O projeto foi desenvolvido por uma empresa. O contrato se encerra. Uma nova equipe — interna ou de outro fornecedor — assume.

**Sem a MEDE:** a nova equipe recebe o código e começa a fazer perguntas que ninguém consegue responder com documentação. Por que esta integração foi feita assim? Este comportamento é intencional ou é um bug? Semanas de investigação antes de qualquer trabalho produtivo.

**Com a MEDE:** a nova equipe recebe também o acervo documental. A sequência de leitura do onboarding funciona igualmente bem para o handoff. Os ADRs respondem as perguntas arquiteturais. Os ESMs explicam o que foi especificado mais recentemente. A situação atual mostra o estado real do projeto no momento da transferência.

O handoff deixa de ser uma investigação arqueológica e passa a ser uma leitura estruturada.

---

## Referência rápida — cenários e mecanismos

| Cenário | Mecanismo MEDE | Artefatos prováveis |
|---|---|---|
| Mudança no meio do ciclo | Staging semântico → consolidação na ata | Ata, ESM (se especificação pendente), ADR (se decisão estrutural) |
| Incidente crítico | Ciclo extra | Ata de incidente, ADR (se revisão arquitetural), ESM (se correções) |
| Onboarding | Percurso de leitura definido | readme, situacao-atual, atas recentes, ADRs |
| Migração tecnológica | Consulta ao acervo histórico | ADRs (decisões de tecnologia vs. domínio), requisitos, modelo de dados |
| Múltiplos ciclos por dia | Cadência ajustada, mesma estrutura causal | Atas por sessão, documentos vivos atualizados por ciclo |
| Handoff contratual | Pacote documental estruturado | Situação atual, LEG, ADRs, entendimento inicial vs. estado final |

---

> **Em resumo**
>
> A MEDE lida com cenários irregulares sem alterar seus princípios — apenas ajustando a cadência e os artefatos produzidos. Mudanças no meio do ciclo vão para o staging e são consolidadas na ata. Incidentes justificam ciclos extras. Onboarding e handoff têm percurso de leitura definido. Migrações partem dos ADRs para distinguir decisões de tecnologia de decisões de domínio. Projetos com IA simplesmente têm mais ciclos por período. Em todos os casos, a estrutura causal é preservada — qualquer mudança pode ser rastreada até seu evento de origem.

---
title: "O ciclo documental"
order: 10
---

# Capítulo 10 — O ciclo documental

A MEDE não é uma coleção de artefatos que existem de forma estática. É um processo que avança em ciclos — cada ciclo consolidando o conhecimento produzido num período, atualizando os documentos de estado, e preparando o terreno para o período seguinte.

O ciclo documental é a unidade operacional da metodologia. Entendê-lo em detalhe é entender como a MEDE funciona na prática.

---

## O que é um ciclo documental

Um ciclo documental é uma unidade causal de consolidação — o período entre duas consolidações formais do conhecimento do projeto.

A palavra "causal" é importante. O ciclo não é definido pelo calendário — não precisa ser necessariamente uma semana ou uma sprint. É definido pelo volume de eventos relevantes que ocorreram e precisam ser consolidados. Em projetos com ritmo convencional, um ciclo semanal funciona bem. Em projetos com uso intensivo de ferramentas de geração de código, onde múltiplas decisões relevantes podem acontecer num mesmo dia, pode fazer sentido realizar múltiplos ciclos no mesmo dia.

Cada ciclo é identificado por data e número sequencial, começando do zero:

```
Ciclo 000 — kickoff do projeto
Ciclo 001 — primeira semana
Ciclo 002 — segunda semana
...
```

Todos os artefatos produzidos num mesmo ciclo compartilham o mesmo número. Uma ata do ciclo 007 e um ADR do ciclo 007 foram produzidos na mesma consolidação — e essa correspondência é visível no nome de cada arquivo.

---

## O staging semântico

Antes da consolidação formal, existe uma etapa de acumulação: o staging semântico.

Durante o período de um ciclo, eventos relevantes acontecem de forma contínua e assíncrona: reuniões, decisões informais, descobertas em uso, conversas que revelam mudanças de entendimento, incidentes que exigem análise. Nenhum desses eventos gera imediatamente um artefato formal — isso seria impraticável e perturbaria o fluxo de trabalho.

O staging semântico é a área temporária onde o material bruto do ciclo é acumulado: notas de reunião, transcrições, rascunhos, decisões informais registradas de qualquer forma. Não é documentação MEDE — é insumo para ela.

O que vai para o staging semântico:
- Notas tomadas durante reuniões
- Decisões comunicadas por mensagem ou e-mail
- Observações feitas durante revisões de código
- Feedback de usuários que revelou nuances não previstas
- Qualquer registro informal de algo que aconteceu e importa

O que não vai: detalhes operacionais sem impacto no conhecimento do projeto, conversas rotineiras de coordenação, informações já consolidadas em ciclos anteriores.

O staging não é um artefato formal da MEDE — é um mecanismo de trabalho. Pode ser um diretório com arquivos temporários, um documento de rascunho, uma pasta de notas. O que importa é que o material esteja disponível no momento da consolidação.

---

## As etapas do ciclo

A consolidação formal de um ciclo percorre uma sequência de etapas com dependências explícitas. Cada etapa depende das anteriores — o que garante que nenhum documento seja produzido sem os insumos necessários.

**Etapa 1 — Ata**
A ata é produzida primeiro porque é o ponto de origem de tudo. Ela consolida o material do staging semântico em registro formal: o que aconteceu, o que foi decidido, qual é o impacto esperado.

**Etapa 2 — ADR**
Com base na ata, identifica-se quais decisões têm impacto arquitetural suficiente para merecer um registro estruturado. Nem todo ciclo gera um ADR — apenas quando há decisão estrutural relevante. A ata menciona explicitamente se um ADR deve ser gerado.

**Etapa 3 — ESM**
Se há mudanças de comportamento, correções ou ajustes que foram decididos mas ainda não podem ser absorvidos pelos documentos vivos — seja por estarem em implementação, seja por dependerem de validação — eles são formalizados no ESM.

**Etapa 4 — Log de entregas**
Com base na ata e no ESM, o log de entregas registra o que foi efetivamente concluído no ciclo — itens de backlog marcados como prontos, com referência ao ciclo em que foram entregues.

**Etapas 5 a 10 — Atualização dos documentos vivos**
Com ata, ADR e ESM disponíveis, os documentos vivos são atualizados em sequência, respeitando suas interdependências:

```
Requisitos funcionais     ← a partir de ata + ADR
Requisitos não funcionais ← a partir de ata + ADR
Modelo de dados          ← a partir de req. + ADR
Cronograma               ← a partir de ata + log de entregas
Visão e escopo           ← a partir de ata + ADR + req.
README                   ← a partir de visão + req. + modelo
Situação atual           ← síntese de todos os anteriores
```

**Etapa 11 — Verificação de consistência**
Antes de encerrar o ciclo, os documentos vivos são verificados cruzadamente: o modelo de dados é coerente com os requisitos funcionais? O cronograma reflete o que o log de entregas registrou? A situação atual está alinhada com a visão e escopo? Inconsistências identificadas nessa etapa são resolvidas antes do encerramento.

---

## O encerramento do ciclo

O ciclo é encerrado quando todos os artefatos estão produzidos, os documentos vivos estão atualizados, e a verificação de consistência foi realizada. Nesse momento, um snapshot do estado documental é estabelecido — o conjunto de documentos que representa o projeto ao final daquele ciclo.

O snapshot não precisa ser literal (embora ferramentas como o mede-cli possam gerenciá-lo de forma automática). O que importa é que exista clareza sobre qual é o estado documentado ao final de cada ciclo, e que esse estado seja o ponto de partida do ciclo seguinte.

Nenhum artefato histórico é alterado após o encerramento. Os documentos vivos produzidos num ciclo podem ser atualizados no próximo — mas apenas como resultado de uma nova ata, nunca por edição avulsa.

---

## O ciclo zero — o kickoff documental

O primeiro ciclo de qualquer projeto tem características especiais. É o momento em que a base documental é estabelecida do zero.

O ciclo zero produz:

**`entendimento-inicial.md`** — o documento mais especial da MEDE. Registra o que se sabia no início: o problema que o projeto resolve, as premissas iniciais, as hipóteses sobre a solução, o backlog inicial, o cronograma inicial. Este documento nunca é alterado — funciona como linha de base contra a qual a evolução do projeto pode ser medida.

**Documentos vivos iniciais** — versões iniciais de visão e escopo, requisitos funcionais, requisitos não funcionais, e README. São os documentos de estado que começam a existir e que evoluirão ao longo dos ciclos seguintes.

**Ata 000** — o kickoff documental. Registra as decisões iniciais: stack tecnológica, premissas de arquitetura, escopo acordado, estrutura da equipe.

**ADRs iniciais** — para as decisões estruturais tomadas no kickoff que merecem registro formal.

A qualidade do ciclo zero tem impacto significativo nos ciclos seguintes: um entendimento inicial bem documentado oferece um ponto de referência claro para entender quanto o projeto evoluiu e em que direção.

---

## O ritmo do ciclo em diferentes contextos

A MEDE não prescreve um ritmo fixo. O ciclo é calibrado ao ritmo real de decisões relevantes no projeto.

**Projeto convencional com sprint semanal.** Um ciclo por semana, sincronizado com o ritmo da sprint. A ata é produzida na revisão da sprint ou logo depois. ADRs surgem quando há decisões arquiteturais na semana. ESMs surgem quando há itens pendentes de implementação.

**Projeto com geração intensiva de código por IA.** O ritmo de decisões pode ser muito maior. Um ciclo por dia pode ser necessário em fases de desenvolvimento acelerado, reduzindo para semanal quando o ritmo estabiliza. A MEDE acompanha o ritmo real — não impõe um ritmo artificial.

**Projeto em manutenção ou operação.** Ciclos mais espaçados — quinzenais ou mensais — são suficientes quando o volume de mudanças é baixo. A frequência do ciclo é proporcional à frequência de eventos que precisam ser consolidados.

**Incidente crítico em produção.** Justifica um ciclo extra fora da cadência regular — uma ata de incidente que registra o que aconteceu, o que foi descoberto, e quais mudanças foram feitas ou decididas. Esse ciclo não substitui o ciclo regular seguinte.

---

## O ciclo como proteção contra a entropia documental

Um projeto sem ciclo documental tem documentação que evolui por impulso — quando alguém percebe que algo está errado ou faltando. Esse modo reativo funciona mal porque a percepção da lacuna costuma chegar tarde, quando o custo de reconstruir o conhecimento perdido já é alto.

O ciclo documental inverte essa lógica: a consolidação acontece proativamente, no fim de cada período, independentemente de qualquer crise. O conhecimento é capturado enquanto está fresco — enquanto as pessoas que participaram das decisões ainda estão presentes e o contexto ainda é claro.

Com o tempo, um projeto bem ciclado acumula algo valioso: uma memória estruturada e cronológica da sua própria evolução. Qualquer ciclo pode ser revisitado. Qualquer decisão pode ser rastreada até o evento que a originou. O projeto se torna compreensível não apenas no presente, mas em qualquer ponto de sua trajetória.

---

> **Em resumo**
>
> O ciclo documental é a unidade operacional da MEDE — o período entre duas consolidações formais do conhecimento do projeto. Não é definido pelo calendário, mas pelo volume de eventos relevantes que ocorreram. Cada ciclo começa com acumulação no staging semântico e termina com a produção sequencial de artefatos: ata, ADR quando pertinente, ESM quando há mudanças em transição, log de entregas, atualização dos documentos vivos em sequência definida pelas dependências entre eles, e verificação final de consistência. O ciclo zero é especial: estabelece a base documental do projeto, incluindo o entendimento inicial — o único documento que nunca será alterado. O ritmo do ciclo é calibrado ao ritmo real do projeto, podendo variar de múltiplos ciclos por dia a ciclos mensais, conforme a frequência de eventos que precisam ser consolidados.

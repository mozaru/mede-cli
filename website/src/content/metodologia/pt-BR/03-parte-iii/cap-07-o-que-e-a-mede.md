---
title: "O que é a MEDE e o que ela não é"
order: 7
---

# Capítulo 7 — O que é a MEDE e o que ela não é

Antes de descrever o que a MEDE faz, vale ser preciso sobre o que ela não faz. Metodologias novas costumam ser percebidas como substituições de metodologias existentes — e essa percepção gera resistência antes mesmo de qualquer avaliação real.

A MEDE não é um processo de desenvolvimento. Não substitui Scrum, Kanban, XP ou qualquer outra abordagem ágil. Não compete com nenhum método existente de organização do trabalho de engenharia. Equipes que usam sprints continuam usando sprints. Equipes que trabalham com fluxo contínuo continuam trabalhando com fluxo contínuo.

A MEDE não é uma plataforma de documentação. Não exige nenhuma ferramenta específica. Funciona com arquivos Markdown num repositório Git, com documentos num diretório compartilhado, com qualquer sistema de arquivos que suporte texto. A tecnologia é deliberadamente simples — porque documentação que depende de plataformas proprietárias acumula risco de obsolescência junto com o conhecimento que preserva.

A MEDE não é um padrão de documentação como UML, arc42 ou C4. Esses padrões definem formas de representar estrutura — diagramas, modelos, visões arquiteturais. São úteis e complementares. A MEDE define um processo: quando documentar, o que documentar, como manter o que foi documentado em sincronia com o sistema.

O que a MEDE é, em uma formulação direta:

> MEDE é uma metodologia que transforma decisões em registros rastreáveis e registros em conhecimento preservável — para que seu projeto possa evoluir sem perder a memória do que aprendeu.

---

## A posição da MEDE no ecossistema de práticas

Para entender onde a MEDE se encaixa, é útil pensar em camadas.

A camada de **execução técnica** é onde o código é escrito, os testes são rodados, e o sistema é construído e mantido. Práticas como TDD, refatoração, revisão de código e integração contínua operam nessa camada.

A camada de **organização do trabalho** é onde sprints são planejados, backlogs são priorizados, e equipes coordenam suas atividades. Scrum, Kanban, SAFe e similares operam nessa camada.

A camada de **arquitetura e domínio** é onde decisões estruturais são tomadas, o domínio é modelado e as interdependências entre componentes são definidas. DDD, microserviços, padrões de integração operam nessa camada.

A MEDE opera numa quarta camada: a **governança do conhecimento**. Ela não substitui nenhuma das três camadas anteriores. Ela é transversal a todas elas — capturando o conhecimento que é produzido em cada camada e preservando-o de forma que possa ser acessado por qualquer pessoa que trabalhe com o sistema no futuro.

Essa posição transversal é o que torna a MEDE compatível com qualquer stack tecnológico, qualquer metodologia de desenvolvimento, qualquer tamanho de equipe. Ela não exige que nada mude na forma como o trabalho técnico é feito. Exige apenas que o conhecimento produzido por esse trabalho seja capturado de forma estruturada.

---

## Os seis fundamentos

A MEDE é sustentada por seis princípios que orientam todas as suas decisões de design — desde a estrutura dos artefatos até as regras do ciclo documental.

**1. Documentação como mecanismo de preservação do conhecimento, não de descrição do sistema.**

A distinção é sutil mas fundamental. Documentar para descrever é fazer uma fotografia do sistema num dado momento — útil, mas estática. Documentar para preservar conhecimento é registrar o raciocínio, as decisões e as trajetórias que moldaram o sistema — útil a longo prazo, mesmo quando o estado atual mudou.

**2. Evolução documental correspondente à evolução da solução.**

A documentação não pode ser produzida uma vez e esquecida. Ela precisa evoluir junto com o sistema — não de forma caótica, mas de forma controlada, por meio de ciclos documentais que sincronizam o registro com o estado real do conhecimento.

**3. A decisão como unidade causal.**

Toda mudança relevante num sistema tem origem numa decisão. Documentar decisões — não apenas seus resultados, mas seu contexto, suas alternativas e suas consequências — é o mecanismo central de preservação de causalidade.

**4. Distinção rigorosa entre documentação histórica e documentação viva.**

Registros históricos nunca são sobrescritos. Estado atual é mantido em documentos que evoluem de forma controlada. A confusão entre os dois — editar o passado para refletir o presente — é uma das principais causas de perda de rastreabilidade.

**5. Observabilidade da construção da solução.**

Um projeto bem documentado segundo a MEDE é epistemologicamente observável: qualquer pessoa pode ler os artefatos disponíveis e inferir o estado atual do conhecimento, identificar onde existem ambiguidades e compreender a trajetória que levou até o presente.

**6. Neutralidade tecnológica e metodológica.**

A MEDE funciona com qualquer linguagem, qualquer framework, qualquer método de desenvolvimento. Não há dependência de ferramentas específicas nem de metodologias de desenvolvimento específicas. O formato dos artefatos é texto simples, versionável e legível por humanos e máquinas.

---

## O que muda na prática

Para uma equipe que adota a MEDE, a mudança mais visível no cotidiano não é a quantidade de documentação produzida — é a organização de quando e como ela é produzida.

Antes da MEDE, documentação tende a acontecer por impulso: alguém percebe que algo importante não está registrado e dedica tempo para documentá-lo. Ou não percebe, e o conhecimento se perde.

Com a MEDE, a documentação acontece por método: eventos relevantes — reuniões, decisões, incidentes, mudanças de entendimento — são consolidados em artefatos estruturados ao final de cada ciclo documental. A estrutura define o que capturar. O ciclo define quando. O método define como.

Essa mudança não exige mais tempo. Exige tempo diferente — dedicado de forma deliberada à consolidação do conhecimento, em vez de distribuído de forma dispersa entre urgências do dia a dia.

Uma equipe que produz atas estruturadas de suas reuniões relevantes, que registra decisões arquiteturais com contexto e alternativas, e que mantém seus documentos de estado atual sincronizados com a realidade do projeto não está fazendo mais trabalho do que uma equipe que não faz nada disso. Está organizando diferente o trabalho que já acontece — mas que, sem método, não deixa rastro.

---

## MEDE em uma frase

Ao longo das próximas seções, os artefatos, o ciclo e as regras serão apresentados em detalhe. Mas antes de entrar nos detalhes, vale ter a visão do conjunto em mente:

> A MEDE é uma camada transversal de governança documental que define quando, como e o que registrar — para que o conhecimento produzido durante o desenvolvimento do software sobreviva às mudanças inevitáveis de equipe, contexto e tecnologia.

Para tornar isso concreto: imagine que uma equipe decide mudar a estratégia de autenticação do sistema — de sessões online obrigatórias para suporte a operação offline com sincronização posterior.

Em uma equipe sem MEDE, essa mudança pode aparecer como uma tarefa no backlog, um conjunto de commits no repositório, uma mensagem num canal de comunicação e um ajuste numa tela de configuração. Cada registro existe em contexto diferente, com nível de detalhe diferente, e acessível a públicos diferentes. Quem chega depois pode descobrir o quê — mas dificilmente o porquê.

Em uma equipe com MEDE, a mesma mudança gera uma ata que registra o evento decisório e seu contexto, um ADR que preserva a decisão estrutural com as alternativas descartadas e os tradeoffs aceitos, atualizações nos documentos vivos correspondentes, e um item no log de entregas quando implementada. Qualquer pessoa que chegar ao projeto depois pode percorrer essa cadeia do início ao fim.

A diferença não está na quantidade de documentos produzidos. Está na cadeia de causalidade que os conecta — e que torna o conhecimento rastreável e durável.

Isso é o que ela faz. O próximo capítulo apresenta os instrumentos com que ela faz.

---

> **Em resumo**
>
> A MEDE não é um processo de desenvolvimento, uma plataforma de documentação, nem um padrão de representação como UML ou C4. É uma camada transversal de governança do conhecimento que opera de forma independente e complementar a qualquer método de desenvolvimento existente. Seus seis fundamentos — documentação como preservação, evolução correspondente, decisão como unidade causal, distinção entre histórico e vivo, observabilidade e neutralidade tecnológica — definem as regras que guiam todos os seus artefatos e práticas. O que muda na prática não é a quantidade de documentação produzida, mas quando e como ela é produzida: por método, em ciclos definidos, de forma que o conhecimento gerado durante o desenvolvimento sobreviva às mudanças que todo projeto inevitavelmente atravessa.

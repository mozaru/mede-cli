---
title: "A solução não é documentar mais. É documentar de forma evolutiva."
order: 5
---

# Capítulo 5 — A solução não é documentar mais. É documentar de forma evolutiva.

Existe um reflexo natural quando alguém percebe que a documentação de um projeto está insuficiente: produzir mais documentação.

Reuniões são convocadas para "pôr a documentação em dia". Sprints são reservados para "escrever o que falta". Desenvolvedores são escalados para documentar sistemas que conhecem antes que saiam da empresa. O esforço é real. A intenção é boa.

E raramente resolve.

Não porque as pessoas não se empenhem, mas porque documentação produzida assim — em blocos, retrospectivamente, para cobrir uma lacuna percebida — tem os mesmos problemas estruturais que a documentação que estava faltando. Ela descreve o sistema como ele está naquele momento. Não registra por que está assim. Não captura a trajetória que levou até esse estado. E, por ter sido produzida de uma vez, vai começar a envelhecer imediatamente.

O problema não é a quantidade. É a lógica.

---

## Dois tipos de documentação

Para entender a distinção que a MEDE propõe, é útil reconhecer que existem dois tipos fundamentalmente diferentes de documentação em projetos de software — com propósitos diferentes, públicos diferentes e formas de envelhecimento diferentes.

O primeiro tipo é a **documentação descritiva**: registra o que o sistema faz ou deve fazer em determinado momento. Especificações funcionais, diagramas de arquitetura, manuais de usuário, descrições de APIs. Sua utilidade é fornecer uma referência do estado atual — uma fotografia do sistema para quem precisa entendê-lo ou usá-lo agora.

O segundo tipo é a **documentação causal**: registra por que o sistema está como está — as decisões que foram tomadas, o contexto que as motivou, as alternativas que foram descartadas, as hipóteses que foram revisadas. Seu propósito não é descrever o estado, mas preservar a trajetória. Não responde "o que o sistema faz?", mas "por que foi construído assim?".

A maioria das práticas de documentação existentes se concentra no primeiro tipo. Wikis descrevem o sistema. Especificações descrevem o comportamento esperado. Até os diagramas de arquitetura descrevem a estrutura atual — raramente a história de como chegou a ser essa estrutura.

O segundo tipo é o que costuma faltar. E é o que mais importa quando o sistema precisa evoluir, quando a equipe muda, quando uma decisão antiga precisa ser revisitada.

---

## O prontuário médico como analogia

Existe uma profissão que há muito tempo resolveu esse problema de forma sofisticada: a medicina.

Um prontuário médico bem mantido não é apenas uma descrição do estado atual do paciente. É um registro longitudinal: diagnósticos anteriores, tratamentos tentados, medicamentos prescritos e descontinuados, reações observadas, hipóteses que foram confirmadas e hipóteses que foram refutadas. O prontuário preserva a trajetória clínica.

Quando um paciente chega a um médico que nunca o atendeu, o prontuário permite que esse médico entenda não apenas como o paciente está hoje, mas o caminho que o trouxe até aqui. Sabe quais tratamentos já foram tentados. Sabe quais medicamentos causaram reações adversas. Sabe quais diagnósticos foram considerados e descartados. Com essa informação, pode tomar decisões informadas sem precisar reconstruir todo o histórico a partir de conversas.

Sem o prontuário, cada novo médico recomeça. Tenta tratamentos que já falharam. Faz perguntas cujas respostas já foram registradas em algum lugar. Corre riscos desnecessários porque não tem acesso ao aprendizado acumulado sobre aquele paciente específico.

A engenharia de software precisa do equivalente ao prontuário médico. Um registro que preserve não apenas o estado atual do sistema, mas a trajetória de decisões, revisões e aprendizados que o gerou. Um documento que qualquer desenvolvedor possa ler para entender não apenas o que o sistema faz, mas por que foi construído assim — e que permaneça útil mesmo quando todos os que participaram da construção já não estão mais presentes.

---

## Documentação viva não é documentação frequentemente atualizada

Um equívoco comum quando se fala em "documentação viva" é imaginar que ela é simplesmente documentação que é atualizada com frequência — uma wiki que o time se compromete a manter em dia, um README que recebe atenção a cada sprint.

Isso não é documentação viva no sentido relevante. É documentação estática com maior frequência de atualização. O problema estrutural permanece: ela descreve estados, não trajetórias. Quando é atualizada, o estado anterior some. O histórico de como o sistema chegou onde está desaparece.

Documentação verdadeiramente viva é aquela que **acompanha a maturação do entendimento** sobre a solução — que cresce junto com o sistema, que preserva tanto o estado atual quanto a trajetória que levou até ele, e que torna o passado acessível sem sacrificar a clareza do presente.

Para isso, ela precisa de uma distinção que a documentação tradicional raramente faz: a distinção entre documentos que preservam estados históricos (e que, por isso, nunca devem ser alterados após serem consolidados) e documentos que refletem o entendimento atual (e que devem ser atualizados de forma controlada à medida que o entendimento evolui).

Chamaremos esses dois tipos de **documentos congelados** e **documentos vivos**. A MEDE os trata de formas muito diferentes — e essa distinção é um dos fundamentos da metodologia.

---

## A decisão como unidade causal

Se documentação causal preserva trajetórias, qual é a unidade mínima dessa trajetória?

A resposta é: a **decisão**.

Toda mudança significativa num sistema tem origem numa decisão — uma escolha feita por pessoas reais, num contexto específico, com informações disponíveis naquele momento, entre alternativas que foram consideradas. Essa decisão pode ter sido tomada formalmente, numa reunião, com discussão estruturada. Ou informalmente, numa conversa rápida, ou até individualmente por um desenvolvedor no momento em que escrevia código.

Independentemente de como foi tomada, a decisão é o evento causal que explica por que o sistema mudou. E é exatamente esse evento que a documentação tradicional raramente captura.

O que a documentação tradicional captura é o *resultado* da decisão — o código que foi escrito, o backlog item que foi marcado como concluído, o diagrama atualizado. Não o processo de tomada de decisão: o problema que ela resolvia, o contexto que a tornou necessária, as alternativas que foram descartadas e por quê, as consequências esperadas.

Uma documentação que preserva decisões — não apenas seus resultados, mas seu raciocínio — cria algo que a documentação descritiva não consegue: a possibilidade de entender, no futuro, se uma decisão ainda faz sentido no novo contexto, ou se as condições que a motivaram mudaram a ponto de torná-la obsoleta ou incorreta.

---

## O que muda com documentação causal

A diferença prática entre documentação descritiva e causal pode ser ilustrada com uma situação simples.

Um sistema usa uma fila de mensagens para comunicação entre serviços. A documentação descritiva diria: "a comunicação entre o serviço A e o serviço B é feita via fila de mensagens usando o protocolo X".

A documentação causal diria: "a comunicação assíncrona via fila foi escolhida em março de 2024 porque o serviço B processava grandes volumes de dados e bloqueava as requisições do serviço A quando a comunicação era síncrona. Alternativas avaliadas incluíam comunicação síncrona com timeout (descartada pela instabilidade em picos de carga) e cache compartilhado (descartado pela complexidade de invalidação). A fila foi escolhida por desacoplar os ritmos de processamento dos dois serviços. Essa decisão introduz latência nas operações que dependem da resposta do serviço B, o que foi considerado aceitável para os casos de uso identificados na época."

A segunda versão contém a primeira — sabe-se o quê — e acrescenta o porquê, o como chegou até aqui, e o que pode mudar se o contexto mudar. Se amanhã o requisito de latência mudar, a equipe que lê essa documentação sabe exatamente onde está o tradeoff e o que precisaria ser reavaliado.

A diferença não está no volume de texto. Está na natureza da informação registrada.

---

## Observabilidade da construção

Existe um conceito bem estabelecido em sistemas distribuídos modernos: **observabilidade**. Um sistema é observável quando, a partir dos seus outputs — logs, métricas, traces — é possível inferir seu estado interno sem precisar abri-lo e inspecioná-lo diretamente. Sistemas observáveis são mais fáceis de operar porque problemas podem ser diagnosticados a partir de evidências externas.

A MEDE aplica esse conceito ao processo de construção do software.

Um projeto com documentação evolutiva é **epistemologicamente observável**: a partir dos registros documentais — atas, decisões arquiteturais, especificações evolutivas — é possível inferir o estado do entendimento da solução, identificar onde existem ambiguidades ou decisões pendentes, e compreender a trajetória que levou ao estado atual.

Um projeto sem essa documentação é epistemologicamente opaco: para entender onde está, é preciso perguntar às pessoas. Para entender como chegou lá, é preciso reconstruir o histórico a partir de conversas, e-mails e deduções a partir do código.

A observabilidade epistemológica é o que permite que um novo membro da equipe se oriente rapidamente. É o que permite que uma auditoria técnica seja feita com base em documentos, não em entrevistas. É o que permite que a própria equipe identifique, durante o desenvolvimento, onde o entendimento está sólido e onde ainda está fragmentado.

---

## A maturação como processo natural

Uma das premissas mais importantes da MEDE é que o entendimento sobre uma solução não é completo no início do projeto. Ele *amadurece* ao longo do tempo.

Clientes conhecem a dor que enfrentam, mas raramente conhecem de forma completa a solução adequada no início do trabalho. A solução vai sendo descoberta progressivamente, à medida que funcionalidades são entregues, feedback é colhido, e situações inesperadas surgem.

Isso não é falha de planejamento. É a natureza do desenvolvimento de software em domínios complexos. O entendimento inicial é necessariamente parcial — porque o domínio só se revela completamente à medida que se constrói e usa o sistema.

A implicação para a documentação é significativa. Uma documentação que captura apenas o entendimento inicial — como fazem as especificações tradicionais produzidas antes do desenvolvimento — captura o estado menos maduro do conhecimento do projeto. Ela é mais completa exatamente quando o entendimento é menos confiável, e vai ficando defasada à medida que o entendimento melhora.

Uma documentação que acompanha a maturação faz o oposto: ela é mais rica e mais confiável ao longo do tempo, porque registra o aprendizado acumulado, as hipóteses revisadas, as decisões que foram tomadas com base em entendimento crescente.

O objetivo não é documentar o que se sabe no início. É documentar o que se aprende ao longo do caminho — preservando tanto o ponto de partida quanto a trajetória que levou até onde o projeto está agora.

---

## Os quatro tipos e o que cada um preserva

As distinções deste capítulo podem ser organizadas numa estrutura simples que será retomada em detalhe na Parte III:

| Tipo | Pergunta que responde | Risco quando falta |
|---|---|---|
| Documentação descritiva | O que o sistema faz? | O leitor não entende o estado atual |
| Documentação causal | Por que o sistema é assim? | O leitor não entende a trajetória |
| Documento congelado | O que se sabia ou decidiu naquele momento? | A história é reescrita ou se perde |
| Documento vivo | Qual é o entendimento atual? | O presente fica desatualizado |

Projetos que só têm o primeiro tipo ficam sem a trajetória. Projetos que só têm o segundo ficam sem o estado atual claro. A MEDE organiza os dois de forma que coexistam sem se confundir.

Na prática, essa distinção se materializa num conjunto explícito de artefatos: atas para registrar eventos causais, ADRs para preservar decisões estruturais, ESMs para formalizar mudanças em transição, e documentos vivos para representar o estado consolidado da solução. A Parte III apresenta cada um deles em detalhe.

O próximo capítulo examina os mecanismos específicos pelos quais a perda se torna inevitável quando essa lógica não está presente.

---

> **Em resumo**
>
> A solução para a perda de conhecimento em projetos de software não está em produzir mais documentação, mas em mudar sua lógica. Existe uma diferença fundamental entre documentação descritiva — que registra o que o sistema faz em algum momento — e documentação causal — que preserva por que foi construído assim, quais decisões foram tomadas, em que contexto, com quais alternativas descartadas. A segunda é o que falta na maioria dos projetos. A decisão é a unidade causal mínima dessa trajetória: quando se preserva o raciocínio por trás das decisões, o sistema se torna epistemologicamente observável — compreensível por qualquer pessoa que leia os registros, independentemente de quem participou da construção. E como o entendimento sobre uma solução amadurece naturalmente ao longo do desenvolvimento, a documentação precisa acompanhar essa maturação — não capturar apenas o entendimento inicial, mas registrar o aprendizado acumulado ao longo do caminho.

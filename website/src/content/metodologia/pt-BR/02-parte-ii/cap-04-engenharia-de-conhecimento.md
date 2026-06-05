---
title: "A engenharia de software é, antes de tudo, engenharia de conhecimento"
order: 4
---

# Capítulo 4 — A engenharia de software é, antes de tudo, engenharia de conhecimento

Em 1987, Fred Brooks publicou um ensaio chamado "No Silver Bullet" que se tornaria uma das peças mais citadas da literatura de engenharia de software. Seu argumento central era simples e incômodo: não existe nenhuma inovação técnica — nenhuma linguagem, nenhuma metodologia, nenhuma ferramenta — capaz de reduzir em uma ordem de magnitude o esforço de construção de software complexo.

A razão, dizia Brooks, é que a maior parte da dificuldade do desenvolvimento de software não está na implementação — na tradução de um design para código. Está na *complexidade essencial*: a dificuldade inerente de compreender o problema, modelar o domínio, e especificar o que o sistema deve realmente fazer. Essa complexidade não desaparece com linguagens melhores ou compiladores mais rápidos. Ela pertence ao problema, não à ferramenta.

Quase quarenta anos depois, as ferramentas mudaram de forma que Brooks certamente não antecipou. E, paradoxalmente, seu argumento ficou mais relevante, não menos.

---

## O gargalo que se move

A história da engenharia de software pode ser lida como uma série de deslocamentos do gargalo dominante — o ponto onde o esforço se concentra e o progresso é mais difícil.

No início, o gargalo era escrever código. Programar em linguagem de máquina ou assembly era trabalhoso, propenso a erros, e exigia atenção constante a detalhes de baixíssimo nível. As linguagens de alto nível — Fortran, COBOL, depois C, Pascal, e as gerações seguintes — resolveram esse gargalo. Escrever código ficou muito mais rápido e muito menos propenso a erros de sintaxe e alocação de memória.

Com o gargalo da escrita resolvido, o próximo ficou exposto: organizar o processo de desenvolvimento. Projetos grandes eram caóticos, prazos eram consistentemente estourados, equipes grandes não conseguiam coordenar seu trabalho de forma eficiente. As metodologias ágeis, com suas iterações curtas, entregas frequentes e cerimônias de alinhamento, responderam a esse gargalo. Não perfeitamente, mas de forma reconhecível — equipes que adotavam práticas ágeis conseguiam entregar com mais regularidade e adaptar-se a mudanças com mais agilidade.

Com o processo mais organizado, o gargalo seguinte emergiu: domínio e arquitetura. Sistemas complexos exigiam modelagem cuidadosa do domínio e decisões arquiteturais sólidas. O Design Orientado a Domínio, os padrões de microserviços, as práticas de arquitetura evolutiva — todos responderam a essa demanda.

E agora?

Com ferramentas de geração de código baseadas em inteligência artificial tornando a implementação dramaticamente mais rápida — às vezes mais rápida do que a compreensão do problema que o código resolve — o gargalo se moveu mais uma vez. Para um lugar que a disciplina, em grande medida, ainda não aprendeu a trabalhar sistematicamente.

O gargalo agora é a **governança do conhecimento da solução**.

---

## O que Parnas entendeu antes dos outros

Em 1972, David Parnas publicou um artigo que mudaria a forma como a disciplina pensa sobre modularização de software. O artigo se chamava "On the Criteria To Be Used in Decomposing Systems into Modules", e seu argumento principal era sobre como *decidir* como dividir um sistema em partes.

A contribuição de Parnas não era técnica no sentido convencional. Era epistemológica. Ele argumentava que o critério correto para a modularização não é o fluxo de dados ou a estrutura do algoritmo — é o **conhecimento que cada módulo esconde dos outros**. Um módulo bem projetado encapsula uma decisão de design, uma área de conhecimento sobre o domínio, de forma que mudanças nessa área afetem apenas o módulo correspondente.

A implicação é profunda: projetar software bem é, fundamentalmente, projetar a organização do conhecimento sobre o problema. A estrutura do código não reflete apenas a lógica de execução — reflete as decisões sobre o que cada parte do sistema precisa saber e o que pode ignorar.

Quando um sistema perde a memória de suas decisões de projeto — quando os critérios que levaram à modularização que existe não estão documentados — ele perde algo mais do que informação histórica. Perde a capacidade de evoluir de forma coerente, porque os novos desenvolvedores não têm acesso ao raciocínio que deu origem à estrutura que encontram.

---

## O que a aceleração revelou

Durante as fases anteriores de evolução da disciplina, a complexidade essencial de que Brooks falava estava sempre presente — mas parcialmente mascarada pela complexidade acidental da implementação. Quando escrever código era trabalhoso, a maior parte do esforço visível ia para a escrita. O trabalho de entender o problema existia, mas ficava menos visível no conjunto.

À medida que a implementação ficou mais rápida, a complexidade essencial foi ficando mais exposta. Frameworks modernos, bibliotecas maduras, geração automática de código — cada uma dessas inovações reduziu a fração do esforço total dedicada à tradução de design em código. E foi revelando, progressivamente, que a parte mais difícil do desenvolvimento de software nunca foi a tradução.

Foi sempre a compreensão.

Compreender o problema com profundidade suficiente para modelá-lo corretamente. Tomar decisões arquiteturais que se sustentem ao longo do tempo. Preservar o raciocínio que tornou essas decisões as certas no momento em que foram tomadas. Manter esse entendimento acessível e atualizado à medida que o sistema evolui.

Com ferramentas de IA gerando código funcional em minutos, esse deslocamento está acontecendo na velocidade mais alta já vista. A implementação foi quase completamente automatizada para um conjunto grande de problemas comuns. O que restou — e o que não foi automatizado — é exatamente a parte que Brooks identificava como essencial.

---

## A disciplina que ainda não tem metodologia para isso

A engenharia de software desenvolveu, ao longo de décadas, um repertório robusto de práticas para tratar a complexidade técnica: padrões de projeto, práticas de refatoração, testes automatizados, revisão de código, integração contínua. Essas práticas existem porque a disciplina reconheceu que a qualidade técnica não emerge espontaneamente — ela precisa ser cultivada por meio de rituais e ferramentas deliberados.

Para a complexidade epistemológica — para a preservação e governança do conhecimento sobre a solução — o repertório é muito mais escasso.

Existem práticas pontuais: os Architecture Decision Records, propostos por Michael Nygard em 2011, oferecem um formato para registrar decisões arquiteturais relevantes. Wikis e bases de conhecimento oferecem espaços para registro livre. Algumas metodologias ágeis incluem práticas de documentação emergente.

Ainda é raro encontrar, na prática de engenharia de software, uma metodologia integrada que trate a documentação como processo contínuo, causal e evolutivo — que defina quando documentar, o que documentar, como manter a documentação em sincronia com o sistema, e como garantir que o conhecimento preserve a trajetória da solução e não apenas seu estado em algum momento. Práticas pontuais existem e têm valor; o que permanece como lacuna é a integração entre elas num processo coerente e sustentável.

Essa lacuna não é acidental. É consequência de uma ênfase histórica no código como produto central da engenharia de software. Durante décadas, a narrativa dominante foi que software bom é código bom — e código bom fala por si mesmo. A documentação era vista como overhead, não como parte integrante do trabalho de engenharia.

Essa narrativa tem seus méritos. Mas ignora a segunda natureza do software: não apenas o artefato que executa, mas o repositório de conhecimento que sustenta sua evolução.

---

## A engenharia de software como disciplina de aprendizagem

Donald Schön, em seu trabalho sobre a prática reflexiva, argumentava que profissionais competentes não apenas aplicam conhecimento técnico — eles constroem conhecimento *durante* a prática, por meio de um ciclo contínuo de ação, observação e ajuste. O profissional experiente é aquele que desenvolveu a capacidade de aprender com o que faz enquanto faz.

Aplicado à engenharia de software, esse argumento sugere que desenvolvimento de software não é apenas execução de um plano — é um processo de aprendizagem sobre o problema. A cada sprint, a cada funcionalidade entregue, a cada incidente em produção, a equipe sabe mais sobre o domínio do que sabia antes. O sistema que existe ao final do projeto incorpora esse aprendizado acumulado — mas apenas na dimensão do código. O raciocínio por trás do aprendizado, as hipóteses testadas e confirmadas ou refutadas, as decisões tomadas com base no entendimento crescente — tudo isso tende a existir apenas na memória das pessoas.

Quando essas pessoas saem, o aprendizado do projeto vai com elas. O código fica, mas descolado do processo de aprendizagem que o gerou.

Uma disciplina que trata seu trabalho como processo de aprendizagem precisa de mecanismos para preservar o que aprende. Não apenas os artefatos produzidos, mas a trajetória cognitiva que levou até eles. Não apenas o estado atual do sistema, mas as decisões, revisões e consolidações que o moldaram.

É exatamente isso que falta — e é o que a MEDE propõe preencher.

---

## Por que agora

A convergência de três fenômenos torna esse problema urgente de uma forma que não era antes.

O primeiro é a velocidade de geração de código. Ferramentas de IA tornaram possível produzir implementações funcionais em uma fração do tempo que exigiam antes. O descompasso entre velocidade de implementação e velocidade de consolidação do entendimento nunca foi tão grande.

O segundo é a rotatividade de equipes. O mercado de trabalho em tecnologia tem histórico de alta mobilidade. Projetos com ciclo de vida de cinco ou dez anos frequentemente passam por renovação completa de equipe — às vezes mais de uma vez. Cada renovação é uma oportunidade para perda de conhecimento se não existem mecanismos de preservação.

O terceiro é a complexidade crescente dos sistemas. Arquiteturas modernas — distribuídas, orientadas a eventos, com múltiplos serviços interdependentes — têm mais pontos de decisão, mais interdependências implícitas, mais razões por que as coisas são do jeito que são. O volume de conhecimento que precisa ser preservado cresceu junto com a complexidade.

Esses três fenômenos juntos criam uma pressão que a disciplina não pode ignorar por mais tempo. A resposta não está em desacelerar a implementação, reduzir a rotatividade ou simplificar os sistemas — todas essas coisas têm suas próprias dinâmicas. A resposta está em desenvolver práticas e ferramentas que preservem o conhecimento da solução de forma sistemática, contínua e acessível.

O próximo capítulo examina qual é, especificamente, a diferença entre documentar o estado e documentar a trajetória — e por que essa distinção é o fundamento de uma abordagem que realmente resolve o problema.

---

> **Em resumo**
>
> O gargalo dominante da engenharia de software se moveu ao longo das décadas: da escrita de código para a organização do processo, para a arquitetura e o domínio, e agora para a governança do conhecimento da solução. Esse deslocamento foi acelerado pelas ferramentas de geração de código por IA, que reduziram dramaticamente o custo da implementação e expuseram o que sempre foi a parte mais difícil: compreender o problema com profundidade suficiente para modelá-lo bem, e preservar esse entendimento ao longo do tempo. A disciplina tem práticas robustas para tratar complexidade técnica, mas não tem, ainda, uma metodologia completa para tratar a complexidade epistemológica — a preservação e governança do conhecimento que sustenta a evolução dos sistemas.

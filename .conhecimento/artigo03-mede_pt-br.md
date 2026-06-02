# **MEDE — Metodologia de Engenharia Documental Evolutiva**

## **Governança, Observabilidade e Preservação do Conhecimento na Construção de Software**

**Mozar Baptista da Silva**
11Tech Desenvolvimento de Sistemas Ltda.
Emails: [mozar.silva@11tech.com.br](mailto:mozar.silva@11tech.com.br); [mbsilva@faeterj-petropolis.edu.br](mailto:mbsilva@faeterj-petropolis.edu.br)

*Este trabalho apresenta a formalização da Metodologia de Engenharia Documental Evolutiva (MEDE), desenvolvida a partir de experiência prática em projetos reais de software, com foco na preservação do conhecimento da solução, na rastreabilidade das decisões e na mensuração da maturação evolutiva de sistemas ao longo do tempo.*

---

## Resumo

A evolução de sistemas de software em contextos reais frequentemente ocorre sob condições de incerteza progressiva, mudanças estruturais e substituição de tecnologias ou equipes de desenvolvimento. Embora abordagens contemporâneas tenham promovido avanços significativos na eficiência operacional, especialmente por meio de ciclos curtos de entrega e adaptação contínua [1], [2], tais modelos nem sempre oferecem mecanismos explícitos para preservar o conhecimento acumulado sobre a solução ao longo do tempo. Como consequência, projetos que demandam manutenção prolongada, reengenharia ou migração tecnológica frequentemente enfrentam dificuldades decorrentes da perda de rastreabilidade das decisões, da fragmentação do entendimento arquitetural e da ausência de documentação evolutiva consistente.

Este artigo propõe a **Metodologia de Engenharia Documental Evolutiva (MEDE)**, uma abordagem sistemática para governança da documentação de software baseada na formalização da causalidade entre eventos decisórios, alterações estruturais e consolidação progressiva do entendimento do sistema. A metodologia estabelece um conjunto de artefatos documentais inter-relacionados, organizados em ciclos regulares de consolidação, nos quais decisões relevantes são registradas, analisadas e incorporadas de forma controlada à documentação viva do projeto. A distinção entre documentos congelados e documentos evolutivos permite preservar o histórico decisório sem comprometer a adaptabilidade necessária à evolução da solução.

Além de apoiar a continuidade evolutiva de sistemas, a MEDE introduz um aspecto adicional raramente explorado em metodologias tradicionais: a possibilidade de **mensuração da maturação da solução**. Ao estruturar a relação temporal entre decisões, revisões e consolidação documental, a metodologia permite observar indicadores indiretos de estabilidade arquitetural, entropia evolutiva e qualidade do entendimento do domínio. Dessa forma, a construção do software deixa de ser apenas um processo produtivo e passa a constituir um fenômeno parcialmente observável e analisável.

A metodologia é concebida como tecnologicamente neutra e aplicável a projetos de diferentes portes e ciclos de vida, incluindo sistemas de curta duração, soluções evolutivas e projetos sujeitos a reengenharia futura. Adicionalmente, a utilização de documentação estruturada em formatos legíveis por humanos e máquinas, como Markdown versionado em repositórios distribuídos, favorece a geração automatizada de artefatos derivados e o suporte por sistemas assistidos por inteligência artificial. Nesse contexto, a MEDE é apresentada como um mecanismo de governança do conhecimento capaz de reduzir retrabalho estrutural, facilitar a continuidade técnica e ampliar a observabilidade da construção do software ao longo do tempo.

**Palavras-chave —** Engenharia de Software; Documentação Evolutiva; Rastreabilidade; Governança de Decisões; Evolução de Sistemas; Observabilidade do Software

---

## Abstract

The evolution of software systems in real-world contexts frequently occurs under conditions of progressive uncertainty, structural changes, and replacement of technologies or development teams. While contemporary development approaches have significantly improved operational efficiency—particularly through short delivery cycles and continuous adaptation [1], [2]—they do not always provide explicit mechanisms for preserving accumulated knowledge about the solution over time. As a result, projects requiring long-term maintenance, reengineering, or technological migration often face difficulties due to the loss of decision traceability, fragmentation of architectural understanding, and lack of consistent evolutionary documentation.

This paper proposes the **Evolutionary Documentation Engineering Methodology (MEDE)**, a systematic approach to software documentation governance based on the formalization of causal relationships between decision events, structural changes, and the progressive consolidation of system understanding. The methodology defines a set of interrelated documentation artifacts organized in regular consolidation cycles, in which relevant decisions are recorded, analyzed, and incorporated in a controlled manner into the living documentation of the project. The distinction between frozen and evolutionary documents allows preservation of decision history without compromising the adaptability required for solution evolution.

Beyond supporting long-term system continuity, MEDE introduces an additional dimension rarely explored in traditional methodologies: the possibility of **measuring solution maturation**. By structuring the temporal relationship between decisions, revisions, and documentation consolidation, the methodology enables indirect observation of architectural stability, evolutionary entropy, and domain understanding quality. Consequently, software construction is no longer viewed solely as a productive process but also as a partially observable and analyzable phenomenon.

The methodology is designed to be technology-agnostic and applicable to projects of varying sizes and lifecycles, including short-lived systems, evolutionary solutions, and projects subject to future reengineering. Furthermore, the use of documentation structured in formats readable by both humans and machines—such as Markdown versioned in distributed repositories—facilitates automated generation of derived artifacts and support by AI-assisted systems. In this context, MEDE is presented as a knowledge-governance mechanism capable of reducing structural rework, enabling technical continuity, and increasing the observability of software construction over time.

**Keywords —** Software Engineering; Evolutionary Documentation; Traceability; Decision Governance; Software Evolution; Observability

---

# **1. Introdução**

O desenvolvimento de software moderno ocorre em ambientes caracterizados por elevada incerteza, mudanças frequentes de requisitos e pressão contínua por entrega de valor em ciclos cada vez mais curtos. Ao longo das últimas décadas, diferentes abordagens metodológicas foram propostas com o objetivo de aumentar a eficiência produtiva e a adaptabilidade dos projetos, desde modelos sequenciais clássicos até processos iterativos e métodos ágeis contemporâneos. O modelo em cascata proposto por Royce [1] introduziu uma visão estruturada do ciclo de vida de software, enfatizando planejamento e controle, enquanto abordagens posteriores buscaram incorporar mecanismos de realimentação e evolução progressiva, como o modelo espiral de Boehm [2].

Com o advento das metodologias ágeis e da entrega contínua, houve um deslocamento significativo do foco metodológico em direção à organização do fluxo de trabalho e à aceleração da implementação. O Manifesto Ágil [3] consolidou princípios voltados à colaboração, adaptação e redução de formalismos considerados excessivos, ao passo que práticas de integração e entrega contínua passaram a enfatizar a automação e a rapidez na disponibilização de novas versões de software [4]. Embora tais avanços tenham contribuído para aumentar a capacidade de resposta das equipes de desenvolvimento, eles também trouxeram novos desafios relacionados à preservação do conhecimento sobre a solução ao longo do tempo.

Sistemas de software são, por natureza, entidades evolutivas. As leis de evolução de software propostas por Lehman indicam que sistemas utilizados em contextos reais tendem a sofrer modificações contínuas para permanecerem úteis e relevantes [5]. Esse processo evolutivo implica revisões arquiteturais, mudanças tecnológicas e, frequentemente, substituição parcial ou total das equipes responsáveis pela manutenção do sistema. Nesse cenário, a ausência de mecanismos estruturados de governança documental pode resultar na perda progressiva da rastreabilidade das decisões, na fragmentação do entendimento do domínio e no aumento do custo de mudanças estruturais tardias.

A literatura clássica em engenharia de software reconhece a importância da decomposição adequada de sistemas e da explicitação das decisões de projeto como fatores críticos para a manutenção da qualidade estrutural ao longo do tempo. Trabalhos como o de Parnas sobre critérios de modularização [6] e as discussões de Brooks sobre a complexidade essencial do software [7] destacam que o principal desafio da engenharia não reside apenas na implementação técnica, mas na construção e estabilização do entendimento correto da solução. De forma complementar, abordagens relacionadas ao registro de decisões arquiteturais têm enfatizado a necessidade de documentar o raciocínio que sustenta escolhas estruturais, permitindo sua revisão e compreensão futura [8].

Além dos aspectos técnicos, a evolução de software envolve dimensões cognitivas e organizacionais. A engenharia pode ser compreendida como um processo de construção de artefatos artificiais baseado em ciclos de formulação de problemas, tomada de decisão e aprendizado progressivo, conforme discutido por Simon [9] e aprofundado na perspectiva reflexiva da prática profissional apresentada por Schön [10]. Nesse contexto, a construção de software pode ser interpretada como um processo epistemológico progressivo, no qual o entendimento da solução é continuamente refinado e estabilizado ao longo do tempo [11].

Apesar dessas contribuições teóricas, observa-se que muitas práticas contemporâneas de desenvolvimento concentram-se predominantemente na gestão do trabalho e na entrega incremental de funcionalidades, oferecendo suporte limitado à governança sistemática da evolução do conhecimento da solução. Artefatos como backlogs e registros informais de tarefas tendem a capturar o “que deve ser feito”, mas nem sempre preservam o “porquê” das decisões, o contexto em que foram tomadas e suas implicações estruturais futuras. Como consequência, projetos de software frequentemente enfrentam dificuldades quando precisam ser reengenheirados, migrados para novas plataformas ou assumidos por equipes diferentes daquelas que participaram de sua concepção original.

Este trabalho apresenta a **Metodologia de Engenharia Documental Evolutiva (MEDE)**, uma proposta voltada à governança estruturada da documentação de software ao longo de seu ciclo de vida. A metodologia parte do princípio de que a construção de software deve ser compreendida não apenas como um processo produtivo, mas como um processo cognitivo progressivo no qual o entendimento da solução é continuamente refinado, consolidado e preservado [11]. Para isso, a MEDE estabelece mecanismos formais para registrar eventos decisórios, organizar artefatos documentais inter-relacionados e promover a atualização controlada da documentação viva do projeto.

Um diferencial relevante da metodologia é a introdução do conceito de **observabilidade da construção do software**, entendido como a possibilidade de inferir o grau de maturidade da solução a partir da análise estruturada de seus registros documentais. Ao tornar explícita a relação temporal entre decisões, mudanças estruturais e consolidação do entendimento do sistema, a MEDE abre caminho para a definição de indicadores que permitam mensurar aspectos como estabilidade arquitetural, entropia evolutiva e continuidade técnica. Nesse sentido, a metodologia busca contribuir para a redução da chamada **dívida epistemológica**, entendida como o acúmulo de lacunas no entendimento do sistema que aumentam o risco e o custo de sua evolução futura [11].

Adicionalmente, a MEDE foi concebida como uma abordagem tecnologicamente neutra e compatível com diferentes métodos de desenvolvimento e gestão de projetos. Sua adoção não pressupõe a substituição de práticas consolidadas, mas sim a introdução de uma camada transversal de governança documental capaz de integrar e contextualizar o conhecimento produzido ao longo da evolução do software. A utilização de formatos de documentação legíveis por humanos e máquinas, como arquivos Markdown versionados em sistemas distribuídos de controle de versão, favorece ainda a automação de tarefas de manutenção documental e o suporte por ferramentas assistidas por inteligência artificial.

---

# **2. Evolução das Abordagens de Desenvolvimento de Software**

A engenharia de software tem sido marcada por sucessivas tentativas de estruturar o processo de construção de sistemas de forma previsível, controlável e economicamente viável. Desde suas origens, diferentes abordagens foram propostas para lidar com a complexidade inerente ao desenvolvimento de software, variando entre modelos fortemente orientados ao planejamento e modelos voltados à adaptação contínua.

Os primeiros modelos sistemáticos de desenvolvimento enfatizavam a necessidade de etapas bem definidas e sequenciais, nas quais atividades de análise, projeto, implementação e testes eram organizadas de forma estruturada. O trabalho seminal de Royce [1] é frequentemente citado como marco inicial dessa visão, ao propor um modelo disciplinado de condução de projetos de software. Ainda que posteriormente reinterpretado como um modelo rígido, seu objetivo original era justamente evidenciar a necessidade de ciclos de realimentação e revisão ao longo do processo.

A percepção de que o desenvolvimento de software envolve aprendizado progressivo levou ao surgimento de abordagens iterativas e evolutivas. O modelo espiral de Boehm [2] representou uma tentativa de integrar gestão de riscos, prototipação e validação incremental, reconhecendo que decisões técnicas e de negócio precisam ser continuamente reavaliadas. Esse entendimento dialoga com as leis de evolução de software propostas por Lehman, segundo as quais sistemas utilizados em contextos reais tendem a sofrer modificações contínuas para manter sua utilidade e relevância [5].

Paralelamente, avanços na engenharia de projeto destacaram a importância da modularização adequada e da explicitação das decisões estruturais. O trabalho de Parnas [6] evidenciou que a decomposição de sistemas deve considerar critérios de estabilidade e ocultação de informação, enquanto Brooks [7] argumentou que a complexidade essencial do software não pode ser eliminada apenas por melhorias tecnológicas ou processuais. Essas contribuições reforçam a ideia de que a construção de software envolve desafios cognitivos profundos relacionados à compreensão do domínio e à formulação de soluções estruturais adequadas.

A partir dos anos 1990 e início dos anos 2000, métodos iterativos orientados a objetos e abordagens centradas em requisitos passaram a enfatizar a necessidade de evolução progressiva do entendimento do sistema. Trabalhos como o roadmap de engenharia de requisitos apresentado por Nuseibeh e Easterbrook [12] destacam que a elicitação e a consolidação de requisitos constituem processos contínuos, sujeitos a revisões à medida que novas informações são obtidas. Essa perspectiva contribuiu para o surgimento de práticas mais flexíveis de desenvolvimento.

O Manifesto Ágil [3] consolidou uma mudança significativa de paradigma ao valorizar indivíduos e interações, software em funcionamento e adaptação a mudanças. Em conjunto com práticas de integração contínua e entrega contínua [4], tais abordagens passaram a priorizar a redução do tempo entre concepção e disponibilização de funcionalidades. Mais recentemente, estudos empíricos sobre desempenho organizacional em engenharia de software têm enfatizado a relação entre práticas de automação, cultura organizacional e resultados operacionais [13].

Apesar dos ganhos evidentes em eficiência produtiva, esse deslocamento metodológico trouxe desafios relacionados à preservação do conhecimento arquitetural e decisório. A gestão de dívida técnica, discutida por Kruchten, Nord e Ozkaya [14], evidencia que decisões tomadas sob pressão temporal podem gerar impactos estruturais de longo prazo. Nesse contexto, a documentação de decisões arquiteturais tem sido proposta como mecanismo para aumentar a rastreabilidade e facilitar a evolução de sistemas complexos [8].

Outro aspecto relevante diz respeito à relação entre estrutura organizacional e estrutura dos sistemas desenvolvidos. A chamada Lei de Conway sugere que sistemas de software tendem a refletir as formas de comunicação das organizações que os produzem [15]. Tal fenômeno reforça a necessidade de mecanismos capazes de preservar o conhecimento da solução de forma independente de mudanças organizacionais e de equipes.

Sob uma perspectiva mais ampla, a engenharia pode ser compreendida como uma atividade de projeto de artefatos artificiais baseada em ciclos de formulação de problemas e tomada de decisão [9]. Schön [10] complementa essa visão ao caracterizar a prática profissional como um processo reflexivo contínuo, no qual o aprendizado ocorre por meio da interação entre ação e reflexão. Essa interpretação permite compreender o desenvolvimento de software como um processo epistemológico progressivo, no qual o entendimento da solução é construído e estabilizado ao longo do tempo [11].

Diante desse panorama histórico, observa-se que diferentes abordagens contribuíram para melhorar aspectos específicos da engenharia de software — como planejamento, gestão de riscos, adaptação organizacional e automação de processos —, mas poucas se dedicaram explicitamente à governança estruturada da evolução documental do sistema. A Metodologia de Engenharia Documental Evolutiva (MEDE) é proposta neste contexto como uma abordagem complementar, voltada à preservação e observabilidade do conhecimento construído durante o desenvolvimento e a evolução de soluções de software.

---

# **3. Problema da Preservação do Conhecimento em Software**

A preservação do conhecimento em projetos de software constitui um problema estrutural da engenharia de software contemporânea. Embora diferentes métodos e processos tenham avançado significativamente na organização do trabalho, na redução do tempo de entrega e na adaptação a mudanças, permanece frequente a dificuldade de reconstruir, após algum tempo, o entendimento efetivo da solução implementada, das decisões que a moldaram e das razões que justificaram sua evolução [3], [4], [11].

Essa dificuldade decorre, em parte, da própria natureza evolutiva do software. Sistemas em uso real não permanecem estáticos; ao contrário, tendem a sofrer alterações contínuas em resposta a novas necessidades, correções, pressões organizacionais e mudanças tecnológicas [5]. Em consequência, o conhecimento relevante sobre a solução também se transforma ao longo do tempo. Quando esse conhecimento não é preservado de forma explícita e estruturada, a continuidade evolutiva do sistema passa a depender excessivamente da memória dos indivíduos envolvidos em sua construção e manutenção [11].

O problema torna-se mais evidente em cenários de troca de equipe, reengenharia ou migração tecnológica. Nesses casos, o código-fonte, embora essencial, nem sempre é suficiente para explicar a lógica decisória que conduziu à estrutura atual do sistema. Como argumenta Parnas, a decomposição de um sistema envolve critérios deliberados de modularização e ocultação de informação [6]; tais critérios, porém, tendem a desaparecer da memória organizacional quando não são registrados. De forma semelhante, Brooks observa que a complexidade essencial do software não se reduz à implementação, mas envolve a própria formulação da estrutura conceitual da solução [7]. Assim, a perda documental não implica apenas ausência de registro histórico, mas perda de inteligibilidade sobre a própria organização do sistema [6], [7].

A literatura de engenharia de requisitos também oferece evidências desse problema. A elicitação, formulação e consolidação de requisitos não constituem uma atividade pontual, mas um processo contínuo de interpretação e refinamento [12]. Em ambientes reais, requisitos mudam, são reinterpretados ou amadurecem em uso [11], [12]. Quando essas transformações não são incorporadas a uma documentação evolutiva consistente, surge um desalinhamento entre o sistema implementado, a documentação disponível e o entendimento atual dos envolvidos. Esse desalinhamento dificulta manutenção, testes, auditoria, elaboração de manuais e evolução controlada da solução [11], [12].

Além disso, abordagens contemporâneas frequentemente concentram o registro do trabalho em artefatos voltados à execução, como tarefas, histórias ou itens de backlog, os quais nem sempre preservam a causalidade entre eventos, decisões e alterações estruturais [3], [11]. Tais artefatos são úteis para orientar o fluxo de trabalho, mas não necessariamente para reconstruir o raciocínio de engenharia que sustentou a evolução do sistema. A documentação de decisões arquiteturais, como defendido por Nygard, representa um avanço importante nesse sentido [8]; ainda assim, o registro isolado de decisões arquiteturais não resolve, por si só, o problema mais amplo da preservação do conhecimento evolutivo do software [8], [11].

Esse problema possui ainda implicações econômicas e estruturais. Kruchten, Nord e Ozkaya mostram que a dívida técnica está associada ao acúmulo de decisões e compromissos que dificultam a evolução futura do software [14]. No enquadramento epistemológico proposto por Silva, parte relevante dessa dificuldade pode ser interpretada como dívida epistemológica, isto é, como acúmulo de lacunas, pressupostos implícitos ou decisões cuja justificativa deixou de ser observável ao longo do tempo [11]. Quando isso ocorre, mudanças relativamente simples passam a exigir esforço desproporcional, não apenas por razões técnicas, mas pela necessidade de redescobrir o entendimento da solução [11], [14].

Há também um componente organizacional importante. Conway argumenta que sistemas tendem a refletir as estruturas de comunicação das organizações que os produzem [15]. Em consequência, mudanças nas equipes, nos fluxos de comunicação e nas responsabilidades institucionais tendem a impactar diretamente a capacidade de compreender e evoluir o software [15]. Sem mecanismos documentais que preservem o conhecimento além das pessoas e da estrutura organizacional contingente, a continuidade do sistema torna-se frágil diante de substituições de equipe, reorganizações internas ou mudanças contratuais [11], [15].

Sob uma perspectiva mais ampla, esse fenômeno pode ser compreendido como um problema de externalização insuficiente do conhecimento de engenharia. Simon descreve o projeto de artefatos artificiais como atividade orientada à formulação de soluções em contextos complexos [9], enquanto Schön enfatiza o caráter reflexivo da prática profissional, na qual o conhecimento se consolida por meio da interação entre ação, observação e revisão [10]. Quando esse conhecimento permanece predominantemente tácito ou distribuído de maneira informal, sua preservação depende de continuidade pessoal e contexto organizacional estável, condições raramente garantidas em projetos de software de média ou longa duração [9], [10], [11].

Dessa forma, o problema da preservação do conhecimento em software não pode ser reduzido a uma simples ausência de documentação, nem resolvido apenas por aumento volumétrico de artefatos descritivos. O problema central reside na falta de uma governança documental capaz de acompanhar a evolução da solução, preservar sua causalidade decisória e manter coerência entre documentos históricos e documentos vivos [8], [11]. É precisamente essa lacuna que motiva a formulação da Metodologia de Engenharia Documental Evolutiva (MEDE), apresentada nas seções seguintes como uma proposta para estruturar, preservar e tornar observável o conhecimento produzido durante a construção e a evolução de software.

### Preservação Epistemológica do Software

Neste trabalho entende-se por preservação epistemológica a capacidade de um sistema de software manter, ao longo do tempo, não apenas sua funcionalidade operacional, mas também o conhecimento que fundamentou sua concepção, evolução e estruturação[11].

Esse conhecimento inclui elementos abaixo, cuja importância para a estabilidade estrutural e evolutiva dos sistemas tem sido reconhecida como fator crítico na engenharia de software[5][6][8]. 

- decisões arquiteturais
- motivações operacionais
- restrições contratuais
- hipóteses de projeto
- estratégias de evolução

A ausência de mecanismos sistemáticos de registro e consolidação dessas informações produz um fenômeno recorrente na engenharia de software: a dissociação entre o sistema em execução e o conhecimento necessário para compreendê-lo, mantê-lo ou reconstruí-lo[14].

Esse fenômeno compromete:

- a continuidade evolutiva do sistema
- a capacidade de substituição tecnológica
- a transferência de responsabilidade entre equipes
- a governança técnica de longo prazo

A metodologia MEDE é concebida como um mecanismo estruturado de preservação epistemológica, ao estabelecer artefatos documentais que registram causalmente a evolução do sistema e permitem a reconstrução racional de sua trajetória.

---

# **4. Fundamentos da Engenharia Documental Evolutiva**

A Metodologia de Engenharia Documental Evolutiva (MEDE) parte do pressuposto de que a documentação de software não deve ser tratada como um subproduto secundário da implementação, mas como um componente estrutural da própria atividade de engenharia [6], [9], [11]. Essa premissa decorre da compreensão de que o software, em contextos reais de uso, não é apenas um artefato executável, mas a materialização progressiva de um entendimento sobre o problema, suas restrições, suas regras e sua organização estrutural [5], [11].

Sob essa perspectiva, a construção de software não pode ser reduzida à escrita de código ou à gestão de tarefas de implementação. Como argumenta Simon, projetar sistemas artificiais implica formular, comparar e estabilizar alternativas em função de objetivos e restrições [9]. Schön complementa essa visão ao caracterizar a prática profissional como um processo reflexivo, no qual a solução é continuamente reformulada à medida que se observa o comportamento do artefato em uso e se reinterpretam seus resultados [10]. No contexto da engenharia de software, essa dinâmica implica que o conhecimento da solução amadurece progressivamente e precisa ser preservado ao longo do tempo para que o sistema permaneça compreensível e evolutivo [11].

Esse entendimento leva ao primeiro fundamento da MEDE: **a documentação é um mecanismo de preservação do conhecimento da solução** [11]. Em projetos reais, o conhecimento sobre o sistema não se encontra integralmente no código-fonte, nem exclusivamente na memória dos participantes do projeto [6], [7], [11]. Parte relevante desse conhecimento reside nas decisões estruturantes tomadas ao longo do desenvolvimento, nas hipóteses que motivaram essas decisões, nas revisões decorrentes do uso real e nas justificativas que explicam por que determinadas alternativas foram adotadas em detrimento de outras [8], [11]. Quando esses elementos não são externalizados de forma organizada, a continuidade técnica do sistema torna-se dependente de memória tácita e de estabilidade organizacional contingente [10], [11], [15].

O segundo fundamento da MEDE é que **a evolução da solução deve ser acompanhada por evolução documental correspondente** [5], [11]. Se, por definição, software em uso sofre alterações contínuas para preservar sua utilidade [5], então a documentação que pretende representar esse software não pode permanecer estática sem perder aderência ao sistema real. A manutenção da documentação, nesse contexto, não é mera atividade administrativa, mas parte integrante da governança da evolução do software [11]. A ausência dessa correspondência entre evolução do sistema e evolução documental produz divergência crescente entre o entendimento formal disponível e a realidade implementada, aumentando o custo de manutenção, testes, auditoria e migração tecnológica [11], [14].

O terceiro fundamento da MEDE é a centralidade da **decisão como unidade causal da evolução do software** [8], [9], [11]. Alterações relevantes em sistemas não ocorrem apenas como resultado de implementação técnica, mas como consequência de decisões explícitas ou implícitas sobre estrutura, comportamento, prioridade e interpretação do domínio [6], [8], [11]. A literatura sobre decisões arquiteturais já reconhece a necessidade de tornar tais escolhas rastreáveis [8]. A MEDE amplia esse princípio ao considerar que não apenas decisões estritamente arquiteturais, mas também decisões operacionais, funcionais e evolutivas, devem possuir mecanismos formais de entrada e consolidação documental quando impactam o entendimento da solução [11].

O quarto fundamento é a distinção entre **documentação histórica** e **documentação viva** [11]. Nem todo documento exerce o mesmo papel epistemológico dentro de um projeto de software. Alguns artefatos precisam preservar o estado histórico de uma decisão, reunião ou planejamento, servindo como registro congelado de um evento específico. Outros precisam refletir o entendimento vigente da solução, sendo necessariamente passíveis de atualização controlada. Sem essa distinção, a documentação tende a oscilar entre dois extremos igualmente problemáticos: ou permanece congelada e perde aderência ao sistema real, ou é continuamente sobrescrita e perde sua capacidade de preservar a memória evolutiva do projeto [11].

O quinto fundamento da MEDE consiste em reconhecer que a documentação, além de preservar conhecimento, pode tornar a construção do software **observável e parcialmente mensurável** [11]. Quando a evolução da solução é acompanhada por registros documentais estruturados e causalmente relacionados, torna-se possível inferir indicadores indiretos sobre estabilidade decisória, frequência de revisões estruturais, convergência de entendimento e entropia evolutiva do projeto [11], [14]. Essa característica distingue a documentação meramente descritiva de uma documentação de engenharia: enquanto a primeira apenas registra estados, a segunda permite observar o comportamento evolutivo do conhecimento incorporado ao sistema [11].

O sexto fundamento da MEDE é sua **neutralidade tecnológica e metodológica** [11]. A metodologia não depende de uma linguagem de programação específica, de um paradigma arquitetural particular ou de um processo único de gestão de projetos. Sua função não é substituir métodos de modelagem, práticas de teste ou abordagens de entrega contínua, mas oferecer uma camada transversal de governança documental que possa coexistir com diferentes estratégias de desenvolvimento [3], [4], [11], [13]. Essa neutralidade é importante porque o problema da preservação do conhecimento da solução não é exclusivo de métodos ágeis, clássicos ou híbridos; ele emerge em qualquer contexto no qual o software precise permanecer compreensível e evolutivo ao longo do tempo [5], [11].

Por fim, a MEDE adota como fundamento a ideia de que a documentação de software deve ser construída de forma **simples, versionável e legível por humanos e máquinas** [11]. Em um cenário no qual ferramentas de automação e inteligência artificial passam a interagir diretamente com artefatos textuais de projeto, documentos excessivamente rígidos, fechados ou dependentes de formatos proprietários dificultam tanto a governança humana quanto o suporte ferramental [4], [11], [13]. A adoção de artefatos documentais textuais, enxutos e semanticamente organizados favorece sua integração com repositórios versionados, sua leitura por equipes técnicas e seu uso futuro como base para geração de artefatos derivados e apoio automatizado à manutenção documental [11].

Esses fundamentos estabelecem a base conceitual da MEDE como uma metodologia voltada à preservação, governança e observabilidade do conhecimento produzido durante a construção e a evolução de software. Nas seções seguintes, esses princípios são operacionalizados por meio da definição dos artefatos, ciclos e regras que compõem a metodologia.

---

# **5. Metodologia MEDE**

A **Metodologia de Engenharia Documental Evolutiva (MEDE)** é uma metodologia de governança documental voltada à preservação, consolidação e observabilidade do conhecimento produzido durante a construção e a evolução de software [11]. Seu objetivo não é substituir processos de desenvolvimento, práticas de modelagem, técnicas de teste ou métodos de gestão de projetos, mas estabelecer uma disciplina documental capaz de acompanhar a maturação progressiva da solução e preservar sua inteligibilidade ao longo do tempo [3], [4], [11], [13].

A MEDE parte da premissa de que a documentação de software deve ser tratada como parte integrante da engenharia da solução, e não como atividade acessória ou residual [6], [9], [11]. Em sistemas reais, a solução evolui de forma contínua, reinterpretando necessidades, revisando decisões e incorporando aprendizado progressivo decorrente do uso e da operação [5], [10], [11]. Quando essa evolução não é acompanhada por uma estrutura documental coerente, o projeto tende a perder rastreabilidade, memória histórica e capacidade de continuidade técnica [11], [14], [15]. A metodologia propõe, portanto, uma forma disciplinada de transformar a evolução do sistema em evolução documental causalmente organizada [11].

## 5.1 Propósito metodológico

O propósito central da MEDE é garantir que a evolução do software permaneça **compreensível, rastreável, preservável e observável** [11]. Para isso, a metodologia organiza a documentação do projeto de modo a preservar quatro propriedades fundamentais:

1. **causalidade documental**, isto é, a possibilidade de relacionar mudanças no sistema aos eventos e decisões que lhes deram origem [8], [11];

2. **separação entre memória histórica e estado atual da solução**, impedindo que a documentação perca simultaneamente sua aderência operacional e sua função de memória evolutiva [11];

3. **continuidade técnica independente de indivíduos ou tecnologias específicas**, reduzindo a dependência de conhecimento tácito e de estabilidade organizacional contingente [5], [11], [15];

4. **observabilidade da construção da solução**, permitindo inferir o comportamento evolutivo do projeto a partir de seus registros documentais [11], [14].

Essas propriedades respondem ao problema discutido nas seções anteriores: a perda do conhecimento da solução em projetos que evoluem ao longo do tempo, sofrem substituição de equipe, reinterpretação de requisitos e alterações estruturais sucessivas [5], [11], [12], [15].

## 5.2 Unidade causal da metodologia: o evento decisório

Na MEDE, toda entrada formal de trabalho relevante no projeto deve ter origem em um **evento decisório documentado** [11]. O evento decisório é a unidade causal primária da metodologia. Em condições ordinárias, ele corresponde à reunião de consolidação do projeto, na qual são formalizados problemas observados, mudanças desejadas, hipóteses levantadas, decisões tomadas e impactos documentais identificados [10], [11]. Em condições extraordinárias, pode corresponder a uma reunião específica de tratamento de incidente crítico ou hotfix, desde que esse evento seja igualmente documentado [11].

Esse princípio é central porque impede que a evolução do software seja conduzida por fragmentos de comunicação descontextualizados, como mensagens informais, pedidos isolados ou itens de backlog sem lastro semântico suficiente [3], [11]. A metodologia não nega a utilidade operacional desses mecanismos, mas exige que toda entrada com relevância evolutiva, documental ou estrutural seja consolidada por meio de um registro formal de evento [11]. Em outras palavras, a mudança entra no projeto não apenas porque foi solicitada, mas porque foi compreendida, contextualizada e transformada em evento documentalmente observável [10], [11].

Na prática metodológica da MEDE, esse evento é materializado na forma de ata, que constitui o único artefato de entrada formal da evolução do projeto [11].

## 5.3 Arquitetura Conceitual da Metodologia MEDE

A metodologia MEDE pode ser compreendida como uma arquitetura de governança documental evolutiva composta por camadas que organizam o registro causal das decisões e da evolução do software, cuja importância para a estabilidade estrutural, a rastreabilidade das mudanças e a continuidade evolutiva dos sistemas tem sido reconhecida na engenharia de software[5][6][8][14].

### Camada Causal
Representada exclusivamente pelas atas de reunião.

Função:
- registrar demandas reais
- formalizar entendimento entre partes
- constituir a única entrada causal da evolução

### Camada Estrutural
Representada pelos Registros de Decisão Arquitetural (ADR).

Função:
- preservar decisões de impacto estrutural
- registrar justificativas técnicas
- estabilizar a arquitetura do sistema

### Camada Evolutiva
Representada pelas Especificações de Manutenção do Sistema (ESM).

Função:
- operacionalizar correções e melhorias
- consolidar aprendizagem empírica
- alimentar atualização dos documentos vivos

### Camada de Consolidação
Representada pelos documentos vivos do sistema.

Função:
- refletir o estado atual consolidado do software
- permitir compreensão tecnológica independente da implementação

Essa arquitetura estabelece um fluxo causal de evolução:

Ata → ADR/ESM → Atualização de Documentos Vivos → Registro em leg-* no diretório log-entregas/

Esse fluxo constitui o mecanismo central de preservação do conhecimento evolutivo no MEDE.

## 5.4 Ontologia dos artefatos documentais

A MEDE organiza os artefatos documentais segundo uma ontologia funcional, na qual cada tipo de documento possui papel epistemológico específico dentro da evolução do projeto [11]. A metodologia não trata todos os documentos como equivalentes, porque eles não preservam o mesmo tipo de conhecimento nem exercem a mesma função de governança [11].


Os principais artefatos da metodologia são os seguintes.

### 5.4.1 Ata

A **ata** é o registro formal do evento decisório [11]. Ela consolida o que foi observado, discutido, entendido e encaminhado em determinado momento do projeto. Sua função não é apenas relatar uma reunião, mas registrar o estado do entendimento compartilhado em um ponto da evolução da solução [11].

Na MEDE, a ata tem natureza **histórica e congelada**. Uma vez consolidada, não deve ser alterada, pois representa uma fotografia semântica de um instante específico do projeto [11]. Além disso, nenhum artefato derivado pode introduzir novidade normativa não ancorada em uma ata previamente consolidada [11]. Seu valor metodológico está exatamente em preservar a memória da evolução, permitindo reconstruir posteriormente por que determinadas mudanças passaram a existir, sob quais condições foram discutidas e que implicações produziram [11].

### 5.4.2 ADR — Registro de Decisão Arquitetural

O artefato identificado pelo prefixo **`adr`** corresponde, na ontologia da MEDE, ao **Registro de Decisão Arquitetural**. O nome em inglês *Architectural Decision Record* é mencionado aqui apenas por equivalência bibliográfica e terminológica à literatura consolidada [8].

O ADR é utilizado quando um evento decisório produz, revisa ou estabiliza uma decisão estrutural com impacto arquitetural relevante [8], [11]. Seu papel é registrar de forma explícita:

* a decisão tomada;
* o problema que ela procura resolver;
* o contexto em que foi formulada;
* as consequências esperadas;
* e, idealmente, as alternativas não escolhidas [8], [11].

A MEDE incorpora esse artefato porque decisões arquiteturais possuem custo sistêmico elevado quando deixam de ser compreensíveis ou rastreáveis ao longo do tempo [8], [14]. Assim, o ADR atua como mecanismo especializado de congelamento e preservação de decisões estruturais [8], [11].

### 5.4.3 ESM — Especificação de Manutenção do Sistema

O artefato identificado pelo prefixo **`esm`** corresponde, na ontologia da MEDE, à **Especificação de Manutenção do Sistema** [11]. Sua função é formalizar o comportamento esperado de correções, ajustes, regras ou evoluções ainda não consolidadas na documentação viva do projeto [11].

O ESM ocupa uma posição intermediária entre o evento decisório e a documentação consolidada da solução. Ele permite registrar de forma estruturada aquilo que foi entendido como necessário ao sistema, mas que ainda depende de implementação, validação, homologação ou estabilização antes de ser incorporado como verdade documental vigente [11]. Esse papel é metodologicamente importante porque reduz o risco de atualizar prematuramente a documentação viva com elementos ainda não amadurecidos [11].

### 5.4.4 Documentos vivos

Os **documentos vivos** são os artefatos destinados a refletir o entendimento atual e consolidado da solução [11]. Na prática da MEDE, incluem tipicamente documentos como:

* `visao-e-escopo.md`
* `requisitos-funcionais.md`
* `requisitos-nao-funcionais.md`
* `modelo-de-dados.md`
* `readme.md`
* `situacao-atual.md` [11]

Esses documentos têm natureza evolutiva. Eles devem ser atualizados sempre que o entendimento do sistema se estabiliza suficientemente para justificar sua incorporação à documentação corrente [5], [11]. Sua função não é preservar a memória integral do projeto, mas representar seu estado consolidado em determinado momento [11].

### 5.4.5 Artefatos históricos complementares

A metodologia também admite artefatos históricos que preservam a formulação inicial do projeto, como `entendimento-inicial.md`, atas fundadoras de kickoff e, quando aplicável, documentos contratuais de referência [11]. O `entendimento-inicial.md` funciona como baseline epistemológica congelada do projeto, concentrando visão inicial, escopo inicial, premissas, backlog inicial e planejamento inicial de entregas [11]. Esses artefatos não existem para refletir o estado atual da solução, mas para preservar sua concepção inicial e permitir comparação entre o planejado e o efetivamente realizado [11].

## 5.5 Documentos congelados e documentos vivos

Um dos mecanismos centrais da MEDE é a distinção explícita entre **documentos congelados** e **documentos vivos** [11].

Documentos congelados são aqueles cuja função é preservar um estado histórico de entendimento, decisão ou planejamento. Enquadram-se nessa categoria, em especial, as atas, os ADRs e os ESMs, assim como documentos fundadores que se pretende preservar como memória de origem [11]. O valor desses documentos está na imutabilidade semântica: eles registram o que se sabia, o que se decidiu ou o que se planejou em um instante específico [11].

Documentos vivos, por sua vez, são aqueles que devem ser mantidos coerentes com o entendimento consolidado atual da solução [11]. Sua função é operacional e evolutiva: apoiar manutenção, continuidade técnica, leitura do sistema, produção de artefatos derivados e diálogo com humanos ou ferramentas [11].

Essa distinção é metodologicamente necessária porque resolve dois problemas clássicos. Quando toda documentação é congelada, ela rapidamente perde aderência ao sistema real. Quando toda documentação é continuamente sobrescrita, perde-se a memória evolutiva do projeto [11]. A MEDE evita esses dois extremos ao separar explicitamente os papéis de preservação histórica e representação corrente da solução [11].

## 5.6 Organização estrutural do espaço documental

A MEDE considera que a organização física da documentação é parte integrante da metodologia [11]. A forma como os artefatos são distribuídos em diretórios influencia diretamente a inteligibilidade do projeto, a previsibilidade de navegação, a rastreabilidade histórica e a possibilidade de automação futura [11].

A estrutura proposta pela metodologia organiza o espaço documental em uma raiz de documentos vivos e subdiretórios especializados para documentos históricos ou congelados. Um exemplo representativo, já considerando ciclos documentais identificados por número sequencial, é o seguinte:

```text
docs/
|
|   entendimento-inicial.md
|   modelo-de-dados.md
|   readme.md
|   requisitos-funcionais.md
|   requisitos-nao-funcionais.md
|   situacao-atual.md
|   visao-e-escopo.md
|
+---atas-de-reuniao
|       ata-20260113-000-reuniao-geral.md
|       ata-20260119-001-reuniao-audiowhatsapp.md
|       ata-20260126-002-apresentacao-enderecos.md
|       ata-20260127-003-regras-confirmacao-endereco.md
|       ata-20260202-004-definicoes-pos-ux-e-operacao-em-campo.md
|       ata-20260209-005-validacao-operacional.md
|       ata-20260219-006-reuniao-operacional.md
|       ata-20260223-007-reuniao-operacional.md
|       ata-20260302-008-reuniao-operacional.md
|       ata-20260306-009-whatsapp-kayo.md
|       ata-20260309-010-reuniao-operacional.md
|
+---decisoes-arquiteturais
|       adr-20260113-000-stack-tecnologico.md
|       adr-20260119-001-monorepo.md
|       adr-20260126-002-modelo-operacional-importacao-e-vistorias.md
|       adr-20260127-003-seguranca-e-observabilidade-plugavel.md
|       adr-20260219-006-mapas-e-poligonos-de-setores.md
|       adr-20260223-007-online-first-sincronizacao-controlada-e-vistorias.md
|       adr-20260302-008-reautenticacao-online-com-operacao-controlada-no-tablet.md
|
\---log-entregas
|       leg-20260126-002-semana-01.md
|       leg-20260202-004-semana-02.md
|       leg-20260209-005-semana-03.md
|       leg-20260216-006-semana-04.md
|       leg-20260223-007-semana-05.md
|       leg-20260302-008-semana-06.md
|
\---especificacao-manutencao-sistema
|       esm-20260224-007.md
|       esm-20260302-008.md
|       esm-20260306-009-ajustes-gerados-com-agente-llm.md
|       esm-20260309-010.md
|
```

Essa organização materializa, no próprio sistema de arquivos, a distinção ontológica entre:

* o que representa o estado consolidado atual da solução;
* e o que representa memória histórica da sua evolução [11].

A raiz concentra os documentos vivos, porque estes precisam ser facilmente acessíveis como visão corrente do projeto [11]. Os subdiretórios segregam atas, decisões arquiteturais e especificações de manutenção, preservando sua identidade histórica e reduzindo confusão entre atualização corrente e memória evolutiva [11].

## 5.7 Convenção de nomenclatura

A MEDE adota uma convenção de nomenclatura temporal padronizada para os artefatos históricos, de forma a garantir simultaneamente:

* ordenação cronológica natural;
* legibilidade humana;
* previsibilidade semântica;
* e facilidade de processamento automatizado [11].

A convenção geral é:

```text
prefixo-aaaammdd-ciclo-descritivo-curto.md
```

ou, quando não houver descritivo necessário:

```text
prefixo-aaaammdd-ciclo.md
```

No contexto da metodologia:

* `ata-aaaammdd-ciclo-descritivo-curto.md`
* `adr-aaaammdd-ciclo-descritivo-curto.md`
* `esm-aaaammdd-ciclo.md` ou `esm-aaaammdd-ciclo-descritivo-curto.md`
* `leg-aaaammdd-ciclo.md` ou `leg-aaaammdd-ciclo-descritivo-curto.md` [11]

Essa convenção é parte metodológica e não mero detalhe operacional. Ela garante que o espaço documental permaneça ordenável por tempo e por ciclo sem necessidade de índices externos, facilita leitura retrospectiva da evolução do projeto e viabiliza parsing por ferramentas futuras [11]. Além disso, o prefixo explicita imediatamente a natureza epistemológica do artefato: `ata` para evento causal, `adr` para decisão arquitetural, `esm` para especificação intermediária de manutenção e `leg` para registro histórico de entrega consolidada [11].

O campo ciclo diferencia múltiplas consolidações ocorridas na mesma data. Essa necessidade tornou-se mais evidente com o uso intensivo de agentes de LLM e ferramentas de geração de código, capazes de condensar em um único dia um volume de trabalho anteriormente distribuído por vários dias ou semanas. Assim, a data permanece importante, mas deixa de ser identificador suficiente.

Por padrão, o ciclo utiliza três dígitos (`000`, `001`, `002`...), podendo ter mais dígitos em projetos de maior escala. O ciclo inicial do projeto é `000`, e cada nova ata consolidada incrementa esse número. Artefatos derivados da mesma ata devem preservar o mesmo número de ciclo, formando uma cadeia causal explícita entre `ATA`, `ADR`, `ESM`, `LEG` e situação atual.


## 5.8 Fluxo metodológico de consolidação

O fluxo metodológico da MEDE pode ser descrito como uma sequência causal de consolidação documental [11]:

1. ocorre um evento decisório ordinário ou extraordinário;
2. produz-se a ata correspondente;
3. a partir da ata, identificam-se impactos estruturais, funcionais e documentais;
4. quando necessário, geram-se ADRs e ESMs;
5. após implementação, validação e estabilização, atualizam-se os documentos vivos afetados;
6. registra-se a evolução efetiva em arquivo `leg-*` no diretório `log-entregas/` [11].

Esse fluxo não substitui o desenvolvimento técnico do software, mas governa a produção e a preservação do conhecimento derivado desse desenvolvimento [3], [4], [11]. Sua função é garantir que a documentação acompanhe a solução não por acúmulo informal de arquivos, mas por encadeamento causal explícito entre evento, decisão, especificação intermediária e consolidação [11].

## 5.9 Cadência ordinária de consolidação

A forma básica da MEDE pressupõe uma **cadência regular de consolidação** [11]. Em vez de permitir que toda observação operacional, reclamação, pedido ou ideia altere imediatamente a documentação viva ou produza backlog documental disperso, a metodologia concentra a entrada ordinária da evolução em momentos definidos de revisão [11].

Essa cadência possui função cognitiva e não apenas organizacional. Ela reduz ansiedade operacional, evita cristalização prematura de interpretações ainda imaturas e favorece a consolidação do entendimento antes que ele seja incorporado como verdade documental vigente [10], [11]. Em termos metodológicos, isso significa que a evolução da solução é governada por ritmo de maturação, e não apenas por urgência percebida [11].

## 5.10 Exceções metodológicas: hotfix

A MEDE reconhece a existência de situações excepcionais nas quais a operação em produção é criticamente comprometida e não existe rollback viável para restaurar rapidamente o estado anterior do sistema [11]. Nessas situações, admite-se um fluxo extraordinário de tratamento, caracterizado como **hotfix governado** [11].

Contudo, a metodologia não permite que a urgência operacional elimine a governança documental. Mesmo o hotfix deve entrar no sistema por meio de ata extraordinária, que continua sendo a única entrada causal formal da evolução, e, quando aplicável, pelos artefatos derivados correspondentes [11]. Essa regra impede que a exceção destrua a memória do aprendizado obtido com o incidente e evita que remediações urgentes se convertam em conhecimento tácito perdido [11].

## 5.11 Neutralidade metodológica

A MEDE foi concebida para coexistir com múltiplas abordagens de desenvolvimento e gestão [3], [4], [11], [13]. Ela não substitui Scrum, Kanban, modelos iterativos, notações de análise, estratégias de testes ou práticas DevOps. Sua função é fornecer uma camada transversal de governança documental capaz de preservar a inteligibilidade evolutiva do software independentemente do método operacional adotado [11].

Essa neutralidade decorre de uma constatação simples: o problema da perda do conhecimento da solução não é exclusivo de uma abordagem específica, mas emerge em qualquer contexto em que o software precise permanecer compreensível e evolutivo ao longo do tempo [5], [11]. Sistemas pequenos, sistemas de escopo aparentemente fechado e até soluções de curta duração podem se beneficiar dessa disciplina, porque sua futura manutenção, reengenharia ou reimplementação em outra tecnologia dependerá da qualidade do conhecimento preservado [11].

## 5.12 Legibilidade por humanos e máquinas

A MEDE privilegia documentação textual simples, versionável e semanticamente organizada [11]. A adoção de arquivos em formatos como Markdown, armazenados em repositórios versionados, favorece simultaneamente:

* leitura e edição por humanos;
* rastreamento temporal de alterações;
* inspeção por ferramentas automatizadas;
* e uso por sistemas assistidos por inteligência artificial [4], [11], [13].

Esse princípio não é apenas tecnológico, mas metodológico. Uma documentação só cumpre plenamente sua função de preservação e continuidade se puder ser lida, auditada, transformada e reaproveitada com baixo atrito [11]. A estrutura textual enxuta e semanticamente estável favorece a produção futura de manuais, testes, relatórios, propostas de atualização e outros artefatos derivados [11].

## 5.13 Síntese metodológica

Em síntese, a MEDE define uma metodologia em que a evolução do software é acompanhada por uma engenharia documental **causal, histórica, progressiva e observável** [11]. Seu núcleo não está na mera produção de documentos, mas na governança das relações entre:

* eventos decisórios;
* decisões estruturais;
* especificações intermediárias;
* documentos vivos;
* e memória histórica do projeto [8], [11].

Ao organizar o espaço documental, padronizar nomenclaturas, distinguir artefatos congelados de artefatos vivos e exigir causalidade formal para a entrada da evolução, a metodologia busca preservar a inteligibilidade da solução, reduzir retrabalho estrutural, facilitar continuidade técnica e tornar observável a maturação do conhecimento incorporado ao software [11], [14].

---

# **6. Escopo e Limitações da MEDE**

A Metodologia de Engenharia Documental Evolutiva (MEDE) foi concebida como uma metodologia de governança documental voltada à preservação, consolidação e observabilidade do conhecimento da solução ao longo da evolução de sistemas de software [11]. Sua proposta não consiste em substituir o conjunto das práticas da engenharia de software, mas atuar sobre uma dimensão específica e frequentemente subatendida: a organização causal e evolutiva da documentação do projeto [8], [11]. Por essa razão, a delimitação explícita de seu escopo é parte integrante da própria metodologia.

## 6.1 Escopo da metodologia

O escopo primário da MEDE é a **governança documental da evolução da solução** [11]. Isso significa que a metodologia se ocupa de estabelecer:

* mecanismos formais de entrada da evolução do projeto por meio de eventos decisórios;
* artefatos documentais com papéis epistemológicos distintos;
* regras para distinção entre memória histórica e documentação viva;
* convenções de organização, nomenclatura e versionamento documental;
* e disciplina para atualização controlada do entendimento vigente da solução [11].

Nesse sentido, a MEDE atua sobre o problema da preservação do conhecimento em software, particularmente em contextos nos quais o sistema evolui ao longo do tempo, sofre reinterpretação funcional, mudanças tecnológicas ou substituição de equipes [5], [11], [15]. Seu foco não está em acelerar a implementação, mas em garantir que a evolução do software permaneça inteligível e rastreável [11].

A metodologia também se propõe a apoiar a **continuidade técnica da solução** [11]. Isso inclui facilitar manutenção, reengenharia, migração tecnológica, auditoria, produção de documentação derivada e reaproveitamento futuro do conhecimento consolidado em novos contextos [11]. Em razão disso, a MEDE é aplicável não apenas a projetos longos e fortemente evolutivos, mas também a sistemas inicialmente percebidos como pequenos, estáveis ou de curta duração, desde que exista interesse em preservar a inteligibilidade do que foi construído [11].

## 6.2 O que a MEDE não substitui

A MEDE não se apresenta como substituta de metodologias clássicas, abordagens ágeis, processos iterativos ou práticas DevOps [1], [2], [3], [4], [13]. Sua função é complementar essas abordagens por meio de uma camada transversal de governança documental [11]. Em outras palavras, ela não define como programar, como testar, como estimar esforço ou como gerenciar fluxo de trabalho diário; define como preservar de forma estruturada o conhecimento produzido durante essas atividades [11].

Assim, a metodologia **não substitui processos de gestão de projeto**. Scrum, Kanban e práticas correlatas podem continuar sendo utilizados para organização do trabalho, priorização, cadência operacional e visibilidade de execução [3], [11]. A MEDE apenas exige que entradas evolutivas relevantes para a solução sejam formalizadas por meio de eventos decisórios e artefatos documentais adequados [11].

Do mesmo modo, a metodologia **não substitui métodos de modelagem ou análise**. Técnicas como decomposição modular, modelagem de domínio, modelos de dados, diagramas arquiteturais, casos de uso e outras representações consagradas da engenharia continuam plenamente válidas quando úteis ao projeto [6], [11], [12]. A MEDE não elimina esses artefatos; ao contrário, oferece uma estrutura documental capaz de abrigá-los, contextualizá-los e preservá-los dentro de uma evolução governada [11].

A metodologia também **não substitui práticas de arquitetura de software**. O registro de decisões arquiteturais, por exemplo, é incorporado como parte da ontologia documental da MEDE, mas o conteúdo arquitetural em si continua dependente do trabalho de análise, projeto e julgamento técnico dos responsáveis pelo sistema [8], [11]. A MEDE organiza a preservação dessas decisões; não decide a arquitetura no lugar do engenheiro [8], [11].

De maneira semelhante, a metodologia **não substitui práticas de garantia de qualidade**. Testes automatizados, testes manuais, observabilidade operacional, integração contínua, validação funcional e mecanismos de confiabilidade permanecem necessários por razões técnicas próprias [4], [13]. A MEDE pode melhorar a rastreabilidade entre decisões, mudanças e impactos de qualidade, mas não define por si mesma uma estratégia de testes ou de verificação de software [11].

## 6.3 Aspectos do projeto não contemplados diretamente

A MEDE não tem como objetivo principal a gestão financeira do projeto. Ela não define mecanismos de orçamento, controle de custos, apropriação contábil, análise de rentabilidade ou governança econômica da contratação [11]. Embora a preservação do conhecimento possa influenciar indiretamente o custo total de propriedade do software, a metodologia não se propõe a substituir instrumentos de gestão financeira [11], [14].

Da mesma forma, a MEDE não define técnicas de estimativa de prazo, nem métodos formais de replanejamento cronológico. A metodologia admite a existência de um cronograma inicial e reconhece seu valor como artefato histórico de concepção do projeto, mas não pretende substituir práticas de planejamento ou replanejamento de cronograma [1], [11]. Seu foco está em preservar a diferença entre o que foi inicialmente planejado e o que foi efetivamente executado, não em determinar a melhor técnica de estimativa [11].

Também não constitui objetivo direto da metodologia produzir um “cronograma executado” como substituto da linha do tempo documental do projeto. Na MEDE, a reconstrução da execução ocorre principalmente por meio de artefatos como atas, ESMs, ADRs e arquivos `leg-*` no diretório `log-entregas/`, isto é, por registros causais da evolução do sistema [11]. Essa opção decorre do entendimento de que a trajetória efetiva da solução é melhor compreendida pela cadeia de decisões e entregas do que por mera reedição retrospectiva de cronogramas [11].

## 6.4 Relação com artefatos de modelagem consolidados

A MEDE tampouco pretende substituir artefatos consolidados de modelagem técnica, como modelos de dados, representações arquiteturais ou diagramas de apoio à análise [6], [11]. Tais artefatos podem continuar existindo, inclusive como parte dos documentos vivos do projeto, desde que façam sentido para o contexto específico da solução [11].

O ponto metodológico relevante é que esses artefatos, quando adotados, devem ser incorporados ao espaço documental do projeto de forma coerente com a ontologia da MEDE [11]. Isso significa que eles não devem permanecer como representações isoladas, sem vínculo com a cadeia de decisões e revisões que lhes deu origem [8], [11]. A metodologia não exige determinado formalismo gráfico ou notação específica; exige, sim, que qualquer artefato relevante para o entendimento do sistema esteja contextualizado dentro da governança documental do projeto [11].

## 6.5 Limitações intrínsecas da metodologia

A primeira limitação da MEDE é que sua efetividade depende de **disciplina organizacional mínima** [10], [11]. Como a metodologia exige formalização de eventos, distinção de artefatos e atualização controlada da documentação viva, ela pressupõe que a equipe reconheça valor na preservação do conhecimento e aceite incorporar essa disciplina ao modo de trabalho [11]. Em ambientes que operam exclusivamente sob improvisação, urgência permanente ou descontinuidade extrema, a adoção da metodologia tende a ser parcial ou instável [10], [11].

A segunda limitação é que a MEDE não elimina o custo de produzir e manter documentação. Ela procura reduzir entropia documental e aumentar valor informacional, mas ainda assim exige investimento contínuo na consolidação do entendimento do sistema [11]. Seu argumento não é que documentar não custa, mas que a ausência de documentação evolutiva estruturada tende a gerar custo maior no longo prazo por perda de inteligibilidade, retrabalho estrutural e redescoberta do problema [11], [14].

A terceira limitação é que a metodologia não garante, por si só, qualidade conceitual das decisões registradas. Um projeto pode documentar bem decisões tecnicamente frágeis ou equivocadas [11]. A MEDE preserva, rastreia e torna observável a evolução do conhecimento da solução, mas não substitui julgamento técnico, capacidade analítica ou experiência arquitetural [6], [8], [11].

Por fim, a metodologia é particularmente adequada a contextos em que a solução precisa permanecer compreensível e evolutiva por horizonte temporal relevante [5], [11]. Em sistemas descartáveis, protótipos extremamente efêmeros ou artefatos cujo valor reside apenas em experimentação de curtíssimo prazo, o custo de adoção integral da metodologia pode não se justificar [11]. Ainda assim, mesmo nesses contextos, parte de seus princípios — especialmente organização textual simples, versionamento e preservação mínima de causalidade — pode trazer benefícios proporcionais ao esforço [11].

## 6.6 Síntese de escopo

Em síntese, a MEDE é uma metodologia de **governança documental da evolução da solução**, não uma metodologia total de engenharia de software [11]. Ela não substitui arquitetura, modelagem, testes, gestão financeira, estimativa ou gerenciamento de projetos [1], [3], [4], [6], [8], [11], [13]. Seu papel é mais específico e, justamente por isso, metodologicamente relevante: preservar o conhecimento da solução, organizar sua memória evolutiva, manter coerência entre documentos históricos e documentos vivos e tornar observável a construção do software ao longo do tempo [8], [11], [14].

---

# **7. Governança Documental da Evolução da Solução**

A governança documental na MEDE consiste no conjunto de regras que disciplina a criação, a atualização, o congelamento e a relação causal entre os artefatos documentais do projeto [8], [11]. Sua função é assegurar que a evolução da solução permaneça documentalmente coerente ao longo do tempo, evitando tanto a fragmentação do entendimento quanto a perda da memória histórica da engenharia realizada [5], [11], [14].

Em termos metodológicos, a governança documental da MEDE não se limita à existência de documentos; ela define **como os documentos passam a existir, em que condições podem ser atualizados e de que forma preservam a inteligibilidade da trajetória do sistema** [10], [11]. Essa governança responde diretamente ao problema identificado nas seções anteriores: a dificuldade de reconstruir o entendimento efetivo da solução quando decisões, revisões e justificativas ficam dispersas, implícitas ou não preservadas [8], [11].

## 7.1 Causalidade documental

O primeiro princípio da governança documental da MEDE é a **causalidade explícita** [11]. Nenhuma alteração relevante na documentação viva deve ocorrer sem origem em um evento decisório formalmente registrado [11]. Esse princípio garante que a documentação não evolua por sobrescrita arbitrária nem por acúmulo desordenado de alterações, mas por encadeamento causal entre:

* evento decisório;
* ata;
* eventual ADR;
* eventual ESM;
* consolidação nos documentos vivos [8], [11].

Esse encadeamento preserva a rastreabilidade do entendimento da solução [8], [11]. Quando uma mudança funcional, arquitetural ou operacional passa a constar da documentação vigente, deve ser possível compreender de onde ela surgiu, em que contexto foi discutida e sob quais condições foi consolidada [11]. Essa propriedade é importante porque, sem causalidade, a documentação pode até refletir parcialmente o estado atual do sistema, mas perde sua capacidade de explicar por que o sistema passou a ser o que é [8], [11].

## 7.2 Relação entre artefatos

Na MEDE, a governança documental depende da relação funcional entre os artefatos [11]. Essa relação não é apenas organizacional; ela é epistemológica, porque cada artefato preserva um tipo distinto de conhecimento sobre a solução [11].

A **ata** é o artefato de entrada causal. Ela registra o evento decisório e preserva o entendimento compartilhado em um instante específico [11]. O **ADR** registra decisões arquiteturais estruturantes cuja preservação explícita é necessária para compreender a organização profunda do sistema [8], [11]. O **ESM** formaliza mudanças esperadas ainda não consolidadas na documentação viva, funcionando como zona intermediária entre entendimento recém-formulado e entendimento estabilizado [11]. Os **documentos vivos**, por sua vez, refletem o estado consolidado atual da solução [11].

A governança documental exige que esses artefatos não sejam tratados como substitutos entre si [11]. Uma ata não substitui um ADR; um ESM não substitui um requisito consolidado; e um documento vivo não substitui a memória histórica contida em documentos congelados [8], [11]. Quando essa diferenciação se perde, o projeto tende a confundir estado atual com histórico, hipótese com consolidação e decisão com mera descrição [11].

## 7.3 Critério de atualização dos documentos vivos

Na MEDE, documentos vivos não devem ser atualizados apenas porque uma ideia surgiu, uma demanda foi formulada ou uma tarefa foi criada [11]. A atualização exige **consolidação suficiente do entendimento da solução** [11]. Isso significa que a incorporação de uma mudança na documentação viva depende de algum grau de estabilização semântica, normalmente obtido após evento decisório, eventual especificação intermediária, implementação e validação prática [11].

Esse critério é importante porque protege a documentação viva de dois riscos complementares. O primeiro é a **obsolescência por rigidez**, quando os documentos deixam de ser atualizados e passam a representar apenas uma visão antiga do sistema [5], [11]. O segundo é a **instabilidade por precipitação**, quando os documentos correntes são alterados a cada interpretação provisória, perdendo coerência e tornando-se semanticamente voláteis [11]. A governança documental da MEDE procura equilibrar esses extremos por meio de atualização controlada e baseada em consolidação [11].

## 7.4 Imutabilidade dos documentos históricos

Documentos históricos ou congelados existem para preservar o conhecimento tal como era compreendido em determinado momento do projeto [11]. Por isso, a governança documental da MEDE estabelece que atas, ADRs e ESMs, uma vez consolidados, não devem ser alterados [8], [11]. Essa imutabilidade semântica preserva a linha do tempo do entendimento do sistema e impede que o projeto reescreva retrospectivamente sua própria história [11].

A importância desse princípio pode ser compreendida à luz da natureza evolutiva do software [5]. Em sistemas sujeitos a mudança contínua, a memória da evolução é tão importante quanto o estado atual, pois é ela que permite distinguir aprendizado legítimo de instabilidade desorganizada [11]. Sem documentos congelados, o projeto corre o risco de manter apenas uma narrativa presente do sistema, perdendo a capacidade de reconstruir os processos decisórios que o produziram [8], [11].

## 7.5 Consolidação progressiva

A governança documental na MEDE opera por **consolidação progressiva** [10], [11]. Isso significa que o entendimento do sistema não é considerado pronto de uma vez por todas, mas amadurece por ciclos de observação, discussão, decisão, implementação e incorporação documental [5], [10], [11]. Essa visão é coerente com a compreensão de que a prática de engenharia envolve reflexão em ação e revisão sucessiva do entendimento do problema e da solução [9], [10], [11].

Na MEDE, essa consolidação progressiva é governada por ritmo e não apenas por urgência [11]. O projeto deve dispor de cadência ordinária de revisão, para que mudanças relevantes sejam absorvidas de forma contextualizada e disciplinada [11]. Isso reduz o risco de que pressões operacionais imediatas passem a governar diretamente a documentação viva sem amadurecimento suficiente [11].

## 7.6 Papel do diretório `log-entregas/`

Dentro da governança documental da MEDE, o diretório `log-entregas/` ocupa função particular [11]. Ele não substitui atas, ADRs ou ESMs, mas atua como espaço de **reconstrução da execução evolutiva do projeto** [11]. Sua função é preservar, por meio de arquivos históricos `leg-*`, o que efetivamente foi entregue, incorporado ou estabilizado ao longo do tempo [11].

Esse papel é metodologicamente relevante porque permite diferenciar três planos distintos:

* o que foi pensado ou discutido;
* o que foi especificado como esperado;
* e o que foi efetivamente realizado [11].

Ao preservar esse terceiro plano, o diretório `log-entregas/` complementa a governança documental e contribui para a observabilidade da trajetória do sistema [11]. Ele também permite comparação entre planejamento inicial, evolução real e estado documental vigente, sem confundir esses níveis entre si [11].

## 7.7 Papel do `entendimento-inicial.md`

O `entendimento-inicial.md` possui papel distinto do diretório `log-entregas/` [11]. Na MEDE, ele é tratado como artefato de concepção e planejamento inicial, preservado como memória histórica do que se compreendia e se planejava realizar no início do projeto [11]. Sua função não é refletir continuamente a execução real, mas manter observável a formulação inicial do problema, da solução, do backlog e do planejamento temporal [11].

Essa escolha metodológica evita que o planejamento inicial seja continuamente reescrito até perder valor histórico [11]. Em vez disso, a MEDE separa claramente o plano idealizado do plano efetivamente realizado: o primeiro é preservado em `entendimento-inicial.md`; o segundo emerge da cadeia de atas, ESMs, ADRs e arquivos `leg-*` em `log-entregas/` [11]. Essa separação melhora a capacidade de análise retrospectiva e reduz a tendência de apagar diferenças entre intenção inicial e evolução real [11].

## 7.8 Governança da exceção

A governança documental da MEDE também contempla a exceção, especialmente na forma de hotfixes críticos [11]. Nessas situações, a urgência operacional não anula a disciplina documental; ela apenas altera sua cadência [11]. O tratamento excepcional continua exigindo evento decisório, ata extraordinária e, quando necessário, artefatos derivados [11].

Esse princípio é importante porque impede que situações críticas destruam justamente a memória do aprendizado mais valioso do projeto [11]. Incidentes graves frequentemente revelam fragilidades reais da solução, e sua documentação adequada é condição para que o projeto transforme emergência em conhecimento preservado [11], [14].

## 7.9 Governança como redução de entropia evolutiva

A função mais profunda da governança documental na MEDE é reduzir a **entropia evolutiva** do projeto [11]. À medida que um sistema evolui, cresce naturalmente o risco de dispersão de entendimento, sobreposição de interpretações, perda de justificativas e divergência entre código, documentação e memória organizacional [5], [11], [14], [15]. A governança documental atua precisamente sobre esse risco, organizando o fluxo de produção de conhecimento e estabelecendo disciplina para sua preservação [11].

Sob esse ponto de vista, governar a documentação não significa burocratizar a engenharia, mas reduzir a desordem semântica que tende a se acumular em projetos evolutivos [11]. Essa redução de entropia melhora a capacidade de manutenção, continuidade, auditoria e reengenharia da solução [11], [14].

## 7.10 Síntese da governança documental

Em síntese, a governança documental da MEDE define as regras pelas quais a documentação do projeto permanece simultaneamente:

* histórica, porque preserva sua memória evolutiva;
* viva, porque acompanha o entendimento consolidado atual da solução;
* causal, porque relaciona mudança a evento e decisão;
* e observável, porque permite reconstruir a trajetória do conhecimento incorporado ao software [8], [11].

A partir dessa governança, a documentação deixa de ser apenas um conjunto de arquivos e passa a constituir uma infraestrutura de preservação e inteligibilidade da solução [11]. Essa infraestrutura é a base sobre a qual a metodologia pretende tornar o software não apenas executável, mas também compreensível e evolutivamente sustentável [5], [11].

---

# **8. Mensuração da Maturação da Solução**

Um dos diferenciais conceituais da MEDE é a possibilidade de tratar a evolução documental do software não apenas como mecanismo de preservação do conhecimento, mas também como base para **observação e mensuração indireta da maturação da solução** [11]. Essa possibilidade decorre do fato de que, na metodologia, a evolução do entendimento do sistema deixa rastros formais: eventos decisórios, decisões estruturais, especificações intermediárias e atualizações controladas da documentação viva [8], [11]. Quando esses rastros são preservados de forma consistente, torna-se possível inferir aspectos relevantes do comportamento evolutivo do projeto [11].

Essa perspectiva é coerente com a compreensão de que a engenharia de software, em contextos reais, não consiste apenas em implementar funcionalidades, mas em estabilizar progressivamente um entendimento adequado da solução [5], [9], [10], [11]. Se a maturação da solução corresponde à redução progressiva da necessidade de reinterpretar decisões centrais sob uso real [11], então os registros documentais da evolução do projeto podem funcionar como indicadores indiretos dessa estabilização [11], [14].

## 8.1 Mensuração como observação do comportamento evolutivo

Na MEDE, mensurar não significa reduzir a engenharia a indicadores simplificados de produtividade, como quantidade de tarefas concluídas, volume de código ou velocidade de entrega [3], [4], [13]. Esses indicadores podem ser úteis para gestão operacional, mas não capturam diretamente a qualidade do entendimento da solução nem sua estabilidade evolutiva [11]. A mensuração proposta pela metodologia tem outro foco: observar o comportamento documental da construção do software como manifestação do comportamento cognitivo e estrutural do projeto [11].

Nesse sentido, a documentação governada pela MEDE passa a funcionar como uma superfície observável da maturação da solução [11]. Através dela, pode-se acompanhar, por exemplo, a frequência com que decisões estruturais são revisadas, o tempo necessário para consolidar uma mudança do estado de hipótese para o estado de documentação viva, ou a intensidade com que o projeto reinterpreta seu próprio domínio ao longo do tempo [11]. Tais sinais não substituem julgamento técnico, mas oferecem elementos objetivos para análise da trajetória do software [9], [10], [11].

## 8.2 Estabilidade decisória

O primeiro eixo de mensuração proposto pela MEDE é a **estabilidade decisória** [11]. Como a metodologia preserva eventos decisórios, registros de decisões arquiteturais e consolidação progressiva do entendimento, torna-se possível observar se determinadas escolhas permanecem estáveis ao longo do tempo ou se são continuamente revisitadas [8], [11].

Essa observação é relevante porque decisões estruturais instáveis tendem a indicar fragilidade do entendimento da solução, inadequação do modelo adotado ou alta dependência de hipóteses ainda não suficientemente validadas [6], [8], [11]. Por outro lado, a estabilização progressiva de decisões centrais sugere aumento da maturidade da solução, desde que essa estabilidade decorra de validação e não de simples rigidez organizacional [10], [11]. A distinção é importante: a MEDE não interpreta ausência de mudança como virtude em si, mas como possível indício de convergência quando acompanhada de coerência documental e redução de revisões estruturais [11].

Em termos práticos, a estabilidade decisória pode ser observada por sinais como:

* frequência de criação de ADRs sobre o mesmo tema;
* necessidade recorrente de rever decisões arquiteturais previamente congeladas;
* tempo de permanência de uma decisão sem invalidação documental posterior [8], [11].

## 8.3 Entropia evolutiva

O segundo eixo de mensuração é a **entropia evolutiva**, entendida como o grau de dispersão, instabilidade ou sobreposição de interpretações durante a evolução do sistema [11]. Em projetos sem governança documental explícita, essa entropia tende a se manifestar como proliferação de mudanças desconexas, perda de justificativas, divergência entre entendimento atual e registros históricos ou reinterpretação frequente de elementos já considerados estáveis [11], [14].

Na MEDE, a entropia evolutiva pode ser inferida pela relação entre quantidade de eventos, número de especificações intermediárias abertas, volume de mudanças ainda não consolidadas e frequência de revisões em documentos vivos [11]. Um aumento persistente desses sinais pode indicar que o projeto está acumulando variabilidade sem conseguir convertê-la em entendimento estável [11]. Isso não significa que todo aumento de atividade documental seja problemático — em determinados períodos, alta variação pode representar aprendizado legítimo [5], [10], [11] —, mas a persistência prolongada de alta entropia tende a sinalizar dificuldade de convergência [11].

Sob esse ponto de vista, a MEDE permite observar se o projeto está:

* transformando mudança em conhecimento consolidado;
* ou apenas acumulando movimento sem estabilização correspondente [11].

## 8.4 Maturidade documental

O terceiro eixo de mensuração é a **maturidade documental** [11]. Esse conceito não se refere à quantidade de documentos existentes, mas ao grau em que a documentação viva representa adequadamente o entendimento consolidado do sistema, mantendo coerência com os artefatos históricos que explicam sua evolução [11].

Uma documentação volumosa pode continuar imatura se estiver desatualizada, desconectada das decisões reais do projeto ou incapaz de explicar a trajetória da solução [11]. Da mesma forma, uma documentação relativamente enxuta pode ser madura se preservar adequadamente a cadeia causal entre decisão, implementação e consolidação [11]. A maturidade documental, portanto, deve ser analisada em função da qualidade da correspondência entre o sistema, sua memória histórica e sua representação corrente [11].

Na prática, sinais de maturidade documental incluem:

* atualização consistente dos documentos vivos após consolidação relevante;
* baixa divergência entre documentação viva e estado efetivo da solução;
* presença de memória histórica suficiente para reconstrução das decisões principais;
* capacidade de explicar não apenas o estado atual do sistema, mas o caminho que levou até ele [8], [11].

## 8.5 Continuidade técnica

O quarto eixo de mensuração é a **continuidade técnica** [11]. Um projeto documentalmente bem governado tende a reduzir dependência de pessoas específicas e aumentar a capacidade de continuidade por novos membros, novas equipes ou novas tecnologias [11], [15]. Essa propriedade é particularmente importante em projetos evolutivos, nos quais a permanência da solução no tempo frequentemente ultrapassa a permanência das pessoas que a conceberam originalmente [5], [11], [15].

A continuidade técnica pode ser observada de maneira indireta pela capacidade de:

* compreender a estrutura atual do sistema sem dependência crítica de autores originais;
* identificar a origem de mudanças relevantes;
* localizar decisões estruturantes e sua motivação;
* reconstruir a lógica evolutiva da solução com base no repositório documental [8], [11].

Em termos metodológicos, a continuidade técnica não é um atributo puramente humano nem puramente tecnológico; ela é resultado da capacidade do projeto de externalizar e preservar conhecimento de forma suficiente para sobreviver à rotatividade organizacional [10], [11], [15].

## 8.6 Relação com dívida epistemológica e custo evolutivo

A proposta de mensuração da MEDE também se conecta ao problema da dívida epistemológica [11]. Quando o projeto perde capacidade de explicar por que a solução é como é, ou quando a documentação deixa de refletir a evolução real do sistema, cresce a necessidade de redescobrir o entendimento antes de qualquer mudança relevante [11]. Esse fenômeno aumenta o custo evolutivo do software não apenas por razões técnicas, mas porque parte do esforço passa a ser consumida na reconstrução do conhecimento perdido [11], [14].

Nesse contexto, sinais como revisões frequentes de decisões centrais, aumento persistente de especificações intermediárias não consolidadas e divergência entre memória histórica e documentação viva podem indicar acúmulo de dívida epistemológica [11]. A mensuração proposta pela MEDE não elimina esse problema, mas permite torná-lo mais visível e, portanto, mais governável [11], [14].

## 8.7 Limites da mensuração

A mensuração proposta pela MEDE possui limites claros [11]. Em primeiro lugar, ela é **indireta**: a metodologia não mede diretamente “qualidade da solução” ou “correção conceitual” de forma absoluta, mas observa rastros documentais da estabilização ou instabilidade do entendimento [11]. Em segundo lugar, esses indicadores não devem ser interpretados isoladamente, pois o mesmo sinal pode ter significados distintos em diferentes estágios do projeto. Um aumento temporário de ESMs, por exemplo, pode representar fase saudável de aprendizado e consolidação, enquanto a persistência prolongada do mesmo padrão pode indicar dificuldade de convergência [11].

Além disso, a mensuração documental não substitui análise técnica, julgamento arquitetural ou validação em uso real [5], [6], [11]. Seu valor está em tornar observável uma dimensão que frequentemente permanece implícita: o comportamento evolutivo do conhecimento da solução ao longo do tempo [11].

## 8.8 Síntese da mensuração na MEDE

Em síntese, a MEDE permite tratar a documentação do projeto como base para mensuração indireta da maturação da solução [11]. A partir da estrutura causal dos artefatos, torna-se possível observar ao menos quatro dimensões relevantes:

* estabilidade decisória;
* entropia evolutiva;
* maturidade documental;
* continuidade técnica [11].

Essas dimensões não pretendem reduzir a engenharia a um painel simplificado de métricas, mas ampliar sua observabilidade [9], [10], [11]. Nesse sentido, a mensuração proposta pela MEDE não é um apêndice estatístico da metodologia; ela decorre de sua própria estrutura. A metodologia chama-se MEDE não apenas por constituir uma engenharia documental evolutiva, mas porque permite, justamente por meio dessa engenharia, **medir indiretamente a trajetória de maturação do software** [11].

---

# **9. Aplicabilidade da MEDE**

A aplicabilidade da Metodologia de Engenharia Documental Evolutiva (MEDE) decorre do tipo de problema que ela procura resolver: a preservação, a inteligibilidade e a observabilidade do conhecimento da solução ao longo do tempo [11]. Como esse problema não é exclusivo de uma única abordagem de desenvolvimento, linguagem de programação ou tipo de sistema, a metodologia pode ser adotada em contextos bastante diversos, desde que exista valor em preservar a trajetória de construção e evolução do software [5], [11].

A MEDE não depende de processo clássico, ágil ou híbrido para existir [1], [2], [3], [4]. Sua função é transversal: atuar sobre a governança documental do conhecimento produzido por qualquer processo de construção de software [11]. Por essa razão, sua aplicabilidade deve ser analisada não pela metodologia operacional do projeto, mas pelo grau em que a continuidade técnica, a rastreabilidade das decisões e a preservação do entendimento da solução são relevantes para o contexto em questão [11].

## 9.1 Projetos evolutivos de média e longa duração

O contexto mais evidente de aplicação da MEDE é o de projetos evolutivos de média e longa duração [5], [11]. Sistemas que permanecem em operação por anos tendem a acumular alterações funcionais, revisões arquiteturais, adaptações regulatórias, correções operacionais e substituições de equipe [5], [14], [15]. Nesses cenários, a perda de memória evolutiva se converte rapidamente em custo de manutenção, aumento de risco estrutural e dificuldade de continuidade técnica [11], [14].

A MEDE é particularmente adequada a esse tipo de projeto porque organiza documentalmente a trajetória da solução [11]. Ao preservar atas, registros de decisão arquitetural, especificações intermediárias e documentação viva coerente, a metodologia permite que a evolução do sistema continue compreensível mesmo após longos períodos de mudança acumulada [8], [11]. Isso reduz a necessidade de reconstrução informal do entendimento do software toda vez que uma alteração relevante precisa ser realizada [11].

## 9.2 Sistemas sujeitos a reengenharia ou migração tecnológica

Outro contexto de forte aplicabilidade da MEDE é o de sistemas que, em algum momento, possam precisar ser reimplementados, reestruturados ou migrados para outra plataforma tecnológica [5], [11]. Em muitos projetos, a tecnologia originalmente adotada se torna inadequada ao longo do tempo, seja por obsolescência, restrições de escalabilidade, exigências de integração ou mudanças estratégicas da organização [5], [11].

Nesses casos, o código existente raramente é suficiente para sustentar uma migração segura e economicamente racional [6], [7], [11]. O que precisa ser preservado não é apenas o comportamento observável do sistema, mas o entendimento consolidado sobre suas regras, decisões, exceções e razões de estruturação [11]. A MEDE se aplica precisamente porque preserva esse conhecimento em formato documental causal, tornando mais viável uma futura reengenharia baseada na solução amadurecida, e não apenas na inspeção retrospectiva do código [11].

## 9.3 Projetos com troca de equipe ou descontinuidade organizacional

A metodologia também possui alta aplicabilidade em contextos de troca de equipe, rotatividade de desenvolvedores, reorganizações internas ou substituição de fornecedores [11], [15]. Como argumenta Conway, sistemas refletem de algum modo as estruturas de comunicação das organizações que os produzem [15]. Quando essas estruturas mudam, a continuidade do software depende fortemente da qualidade com que o conhecimento da solução foi preservado além das pessoas que o produziram [11], [15].

Nesses cenários, a MEDE funciona como mecanismo de redução de dependência de memória tácita [10], [11]. Ao separar documentos históricos e vivos, registrar a origem das mudanças e preservar decisões relevantes, a metodologia aumenta a capacidade de novas equipes compreenderem o sistema sem necessidade de reconstrução integral por entrevistas, suposições ou leitura exclusiva de código [11]. Isso não elimina o custo de transição, mas reduz seu grau de improvisação e opacidade [11].

## 9.4 Sistemas com escopo relativamente fechado

Embora a MEDE seja especialmente valiosa em sistemas fortemente evolutivos, sua aplicabilidade não se limita a projetos de escopo aberto ou continuamente mutável [11]. Sistemas com escopo relativamente fechado também podem se beneficiar da metodologia, desde que exista interesse em preservar a inteligibilidade da solução ao longo do tempo [11].

Mesmo quando um sistema é concebido sob requisitos aparentemente estáveis, a documentação estruturada continua tendo valor para auditoria, produção de manuais, elaboração de testes, treinamento de usuários, continuidade técnica e eventual reimplementação futura [11], [12]. Além disso, a percepção inicial de fechamento de escopo nem sempre se mantém em uso real, já que sistemas concretos tendem a sofrer revisões quando confrontados com práticas operacionais e necessidades não inteiramente antecipadas [5], [11], [12]. Nesses casos, uma documentação evolutiva enxuta, mas causalmente organizada, tende a oferecer maior valor do que documentação estática produzida apenas no início do projeto [11].

## 9.5 Sistemas de curta duração ou caráter experimental

A aplicabilidade da MEDE também pode ser reconhecida em sistemas de curta duração ou de caráter experimental, ainda que em intensidade distinta [11]. Em tais contextos, a adoção integral da metodologia pode não ser economicamente necessária, especialmente quando a solução possui horizonte de vida extremamente reduzido [11]. No entanto, mesmo nesses casos, princípios da metodologia podem trazer benefícios proporcionais, como organização textual simples, preservação mínima da causalidade e versionamento documental coerente [11].

Esse ponto é relevante porque sistemas inicialmente considerados temporários podem precisar ser retomados, reimplementados ou reinterpretados em novos contextos [11]. Quando isso ocorre, a ausência total de memória documental transforma uma solução curta em problema longo. A MEDE, mesmo em aplicação parcial, pode reduzir esse risco ao preservar o mínimo necessário do entendimento construído [11].

## 9.6 Compatibilidade com repositórios versionados

A MEDE apresenta aplicabilidade particularmente alta em ambientes que utilizam repositórios versionados para desenvolvimento de software [4], [11], [13]. A adoção de documentação textual, estruturada e semanticamente organizada em diretórios previsíveis favorece sua convivência com sistemas como Git, nos quais histórico, rastreabilidade de alterações e colaboração distribuída já fazem parte da prática cotidiana [4], [11].

Essa compatibilidade é importante porque reduz o atrito de adoção metodológica [11]. Em vez de depender de plataformas paralelas ou formatos opacos, a documentação pode habitar o mesmo ecossistema de versionamento do software, favorecendo inspeção conjunta por humanos e ferramentas [11]. A metodologia, portanto, aplica-se especialmente bem a contextos em que o projeto já se beneficia de práticas de versionamento distribuído e revisão textual [4], [11].

## 9.7 Documentação como base para produção de artefatos derivados

Outro eixo de aplicabilidade da MEDE está relacionado ao reaproveitamento da documentação como base para produção de artefatos derivados [11]. Quando a documentação preserva causalidade, distinção entre memória histórica e estado atual da solução, e organização semântica consistente, ela pode sustentar a geração ou manutenção de outros produtos informacionais, como manuais, relatórios, planos de teste, descrições técnicas e materiais de transição [11], [12].

Nesse sentido, a metodologia amplia o valor da documentação para além da leitura humana retrospectiva. A documentação deixa de existir apenas para “registrar o que aconteceu” e passa a funcionar como base de trabalho para continuidade técnica e produção estruturada de conhecimento derivado [11]. Essa característica reforça sua aplicabilidade em ambientes que exigem documentação reutilizável e não apenas arquivística [11].

## 9.8 Compatibilidade com suporte por inteligência artificial

A aplicabilidade da MEDE torna-se ainda mais relevante em contextos nos quais ferramentas assistidas por inteligência artificial passam a interagir com artefatos documentais [4], [11], [13]. A utilização de documentação em formatos simples, textuais, versionáveis e semanticamente estáveis favorece leitura, análise e transformação por sistemas automatizados [11].

Nesse cenário, a metodologia não delega à inteligência artificial a responsabilidade pela decisão de engenharia [11]. Seu valor está em oferecer uma base documental suficientemente organizada para que ferramentas possam auxiliar na manutenção da consistência, na identificação de impactos, na produção de artefatos derivados e na navegação pelo conhecimento do projeto sob supervisão humana [11]. Essa aplicabilidade é especialmente importante porque, à medida que a implementação se torna mais automatizável, tende a crescer o valor relativo da qualidade da documentação que orienta e preserva o entendimento da solução [4], [11], [13].

## 9.9 Limites práticos da aplicabilidade

A aplicabilidade da MEDE não deve ser confundida com obrigatoriedade universal de sua adoção integral [11]. Em projetos extremamente efêmeros, sem expectativa de continuidade, sem relevância de manutenção futura e sem necessidade de reuso do conhecimento produzido, o custo de adoção completa pode superar o benefício esperado [11]. Ainda assim, mesmo nesses casos, seus princípios continuam úteis como referência mínima para organização documental [11].

O ponto metodologicamente importante é que a aplicabilidade da MEDE cresce à medida que cresce a necessidade de:

* continuidade técnica;
* inteligibilidade evolutiva;
* independência em relação a pessoas específicas;
* reutilização futura do conhecimento;
* e capacidade de observar a maturação da solução [11].

## 9.10 Síntese da aplicabilidade

Em síntese, a MEDE é aplicável sempre que a preservação do conhecimento da solução constitui ativo relevante do projeto [11]. Isso inclui sistemas evolutivos de longa duração, projetos sujeitos a reengenharia, contextos com troca de equipe, soluções de escopo relativamente fechado, ambientes versionados e cenários que pretendem utilizar documentação como base para automação ou inteligência artificial [4], [5], [11], [13], [15].

Sua aplicabilidade não deriva de promessa genérica de adaptação universal, mas do fato de que o problema que enfrenta — a perda de inteligibilidade da solução ao longo do tempo — atravessa diferentes formas de desenvolvimento de software [5], [11]. A MEDE se aplica, portanto, não porque todo projeto precise dos mesmos documentos, mas porque todo projeto que queira sobreviver com continuidade, inteligibilidade e capacidade de evolução se beneficia de alguma forma de governança documental causalmente estruturada [11].

---

# **10. Suporte Ferramental e Automação Assistida por IA**

A MEDE foi concebida como uma metodologia tecnologicamente neutra, mas essa neutralidade não implica indiferença ao suporte ferramental [11]. Ao contrário, parte de sua força metodológica decorre justamente do fato de estruturar a documentação de modo suficientemente simples, versionável e semanticamente organizado para que ela possa ser manipulada, analisada e transformada por ferramentas automatizadas sem perder sua legibilidade humana [4], [11], [13]. Nesse sentido, a metodologia não depende de uma ferramenta específica para existir, mas oferece condições particularmente favoráveis para automação assistida.

Essa característica torna-se especialmente relevante no contexto atual, em que a redução do custo de implementação e a ampliação da capacidade de automação deslocam progressivamente o gargalo da engenharia do ato de codificar para a qualidade do entendimento da solução e da documentação que a sustenta [4], [11], [13]. Como argumentado no enquadramento epistemológico que fundamenta esta proposta, tornar a implementação mais barata não reduz a importância da decisão; em muitos casos, aumenta o impacto relativo de decisões mal compreendidas ou mal preservadas [11]. Por essa razão, o suporte por inteligência artificial à MEDE deve ser entendido não como delegação da engenharia à máquina, mas como ampliação da capacidade humana de manter coerência, rastreabilidade e continuidade documental [11].

## 10.1 Papel do ferramental na MEDE

O papel do ferramental na MEDE é apoiar a governança documental do projeto [11]. Isso inclui, por exemplo:

* apoiar a atualização consistente de documentos vivos;
* identificar artefatos potencialmente impactados por uma nova decisão;
* verificar coerência entre documentação histórica e documentação corrente;
* facilitar navegação entre atas, ADRs, ESMs e documentos vivos;
* e produzir artefatos derivados a partir da base documental consolidada [11].

Essas funções não alteram a natureza metodológica da MEDE. A metodologia continua baseada em eventos decisórios, distinção entre documentos congelados e vivos, e causalidade formal entre decisão e atualização documental [11]. O ferramental apenas aumenta a capacidade operacional de aplicar essa disciplina de maneira mais eficiente e escalável [11].

Em outras palavras, a automação na MEDE é subordinada à governança documental, e não o contrário [11]. Ferramentas existem para apoiar a metodologia; a metodologia não é redesenhada para se submeter às limitações de uma ferramenta específica [11].

## 10.2 Condições documentais para automação útil

A possibilidade de automação assistida depende diretamente da forma como a documentação está organizada [11]. Documentos opacos, inconsistentes, excessivamente dispersos ou sem convenção semântica clara dificultam tanto leitura humana quanto processamento automatizado [11]. Por isso, a organização proposta pela MEDE — artefatos com ontologia explícita, nomenclatura padronizada, distinção entre histórico e estado atual e estrutura estável de diretórios — favorece o suporte ferramental [11].

Essa compatibilidade decorre do fato de que ferramentas automatizadas operam melhor quando encontram:

* artefatos com função bem definida;
* convenções previsíveis de nome e localização;
* conteúdo textual semanticamente estável;
* e relações claras entre documentos [11].

Nesse sentido, a própria disciplina documental da MEDE pode ser vista como condição de possibilidade para automação útil [11]. Não é a inteligência artificial que cria a governança; é a governança que torna a inteligência artificial aplicável de modo confiável ao espaço documental do projeto [11].

## 10.3 Uso de Markdown e repositórios versionados

A adoção de formatos textuais simples, como Markdown, em repositórios versionados é particularmente adequada ao suporte ferramental no contexto da MEDE [4], [11], [13]. Esse modelo oferece, simultaneamente:

* legibilidade por humanos;
* rastreabilidade temporal de alterações;
* integração com práticas de desenvolvimento baseadas em versionamento;
* e facilidade de inspeção por ferramentas automatizadas [4], [11].

Ao habitar o mesmo ecossistema de versionamento do software, a documentação pode ser tratada como ativo técnico de primeira classe, e não como anexo externo ou repositório paralelo [4], [11]. Isso reduz atrito operacional e melhora a possibilidade de inspeção conjunta entre mudanças no sistema e mudanças em seu entendimento documental [11].

Além disso, a natureza textual e versionável desses artefatos facilita sua utilização como entrada para sistemas assistidos por inteligência artificial, sem necessidade de conversões frágeis, extrações opacas ou dependência de formatos proprietários [11]. Essa característica reforça a aplicabilidade da MEDE em ambientes que desejam combinar engenharia documental com automação progressiva [11].

## 10.4 Automação a partir de atas

Entre os diversos pontos de apoio ferramental possíveis, a **ata** ocupa posição privilegiada [11]. Como a ata é o registro formal do evento decisório e o ponto de entrada causal da evolução do projeto, ela constitui fonte primária adequada para automação assistida da manutenção documental [11].

Em termos metodológicos, uma ferramenta baseada na MEDE poderia utilizar a ata como insumo para:

* identificar menções a mudanças funcionais ou arquiteturais;
* sugerir criação de ADR quando houver decisão estrutural relevante;
* sugerir criação de ESM quando houver mudança esperada ainda não consolidada;
* propor atualização de documentos vivos potencialmente impactados;
* e apontar divergências entre o que foi decidido e o que está documentado [11].

Esse tipo de automação não substitui o julgamento humano sobre a validade da decisão nem sobre a oportunidade de consolidação [11]. Seu papel é reduzir esforço de manutenção documental e ampliar a capacidade de consistência entre artefatos [11]. A decisão de aceitar, rejeitar ou revisar a proposta permanece sob responsabilidade humana [11].

## 10.5 IA como apoio à consistência, não como origem da decisão

A MEDE estabelece uma distinção fundamental entre **apoio automatizado** e **decisão de engenharia** [11]. A inteligência artificial pode auxiliar na leitura, comparação, sugestão, organização e transformação de artefatos textuais, mas não deve ser tratada como origem autônoma e legitimadora da verdade documental do projeto [11].

Essa restrição decorre do próprio fundamento da metodologia. Se a evolução da solução deve permanecer causalmente vinculada a eventos decisórios formais e a registros historicamente preservados, então nenhum agente automatizado pode introduzir, por conta própria, mudança documental relevante sem base em evento e sem supervisão humana [11]. Caso contrário, perder-se-ia precisamente a propriedade metodológica que a MEDE pretende preservar: a rastreabilidade do entendimento da solução [11].

Nesse sentido, a inteligência artificial é mais adequadamente compreendida, no contexto da MEDE, como instrumento de **manutenção de coerência documental** do que como “autora” do conhecimento do projeto [11]. Ela pode acelerar tarefas de consolidação, navegação e atualização, mas não substituir a responsabilidade humana pela arquitetura da solução, pela validação do entendimento e pela decisão do que deve ou não tornar-se parte da documentação viva [8], [11].

## 10.6 Benefícios potenciais do suporte por IA

Quando aplicado sob governança adequada, o suporte por IA pode trazer benefícios concretos à MEDE [11]. Entre eles, destacam-se:

* redução do esforço manual de atualização documental;
* maior consistência entre documentos históricos e documentos vivos;
* detecção mais rápida de divergências ou lacunas documentais;
* apoio à geração de artefatos derivados, como manuais, resumos técnicos e propostas de atualização;
* e aumento da navegabilidade do espaço documental do projeto [11].

Esses benefícios tornam-se especialmente relevantes em cenários de evolução contínua, nos quais a manutenção da documentação compete por atenção com demandas de implementação, suporte e operação [4], [13]. Nesses contextos, a automação assistida pode reduzir parte do custo operacional da disciplina documental sem eliminar sua governança humana [11].

## 10.7 Riscos da automação não governada

A MEDE também exige cautela explícita quanto aos riscos da automação não governada [11]. Se a ferramenta passa a atualizar documentos sem preservação da causalidade, sem distinção entre hipótese e consolidação ou sem validação humana suficiente, a automação pode degradar exatamente aquilo que deveria proteger: a integridade evolutiva do conhecimento do sistema [11].

Esse risco é particularmente relevante porque a aceleração promovida por automação pode amplificar erros de compreensão com a mesma eficiência com que acelera acertos [4], [11], [13]. Em outras palavras, quanto mais barata se torna a manipulação documental ou a geração de artefatos, mais importante se torna a governança sobre o que é autorizado a entrar na base documental do projeto [11].

A metodologia, portanto, não trata automação como valor intrínseco. Ela admite automação apenas sob as mesmas regras que regem qualquer outra entrada evolutiva: origem causal, contexto preservado, distinção de artefatos e consolidação supervisionada [11].

## 10.8 Ferramental como evolução natural da metodologia

O suporte ferramental pode ser visto, assim, como uma evolução natural da MEDE [11]. Uma vez que a metodologia organiza o conhecimento do projeto de forma textual, causal e semanticamente previsível, torna-se possível conceber ferramentas que operem sobre essa base para auxiliar sua manutenção [11]. Essa possibilidade não altera a natureza da metodologia, mas amplia sua capacidade de aplicação em ambientes de maior escala, maior rotatividade ou maior velocidade de mudança [11], [13].

Dessa forma, a relação entre MEDE e IA não deve ser interpretada como substituição da engenharia documental por automação, mas como aprofundamento de sua capacidade operacional [11]. Quanto mais bem estruturada a documentação, mais útil pode ser a automação; e quanto melhor governada a automação, maior a preservação da inteligibilidade da solução [11].

## 10.9 Síntese do suporte ferramental

Em síntese, a MEDE oferece condições particularmente favoráveis para suporte ferramental e automação assistida por inteligência artificial porque organiza a documentação como um espaço textual, versionável, causal e semanticamente estruturado [4], [11], [13]. Essa estrutura permite que ferramentas:

* leiam e comparem artefatos;
* proponham atualizações;
* identifiquem impactos;
* produzam artefatos derivados;
* e apoiem a consistência documental [11].

No entanto, a metodologia mantém um limite conceitual claro: **a decisão de engenharia permanece humana** [8], [11]. A inteligência artificial pode apoiar a manutenção do conhecimento preservado, mas não substituir a responsabilidade sobre sua formulação, validação e consolidação [11]. É precisamente essa combinação entre disciplina documental e apoio automatizado que torna a MEDE particularmente adequada a um cenário em que o software é cada vez mais automatizável, mas continua dependendo de entendimento humano para permanecer correto e evolutivamente sustentável [4], [11], [13].

---

# **11. Discussão**

A MEDE foi apresentada neste artigo como uma metodologia de governança documental orientada à preservação, à inteligibilidade e à observabilidade do conhecimento da solução ao longo da evolução de sistemas de software [11]. Sua contribuição principal não está em propor novo processo de desenvolvimento, novo paradigma arquitetural ou novo mecanismo de entrega, mas em tornar explícita uma dimensão frequentemente tratada de forma residual na prática: a necessidade de governar documentalmente a maturação progressiva do entendimento do sistema [5], [8], [11].

## 11.1 A contribuição da MEDE no contexto da engenharia de software

Ao longo da história da engenharia de software, diferentes abordagens procuraram enfrentar problemas distintos: previsibilidade e planejamento [1], [2], adaptação e colaboração [3], aceleração da entrega [4], qualidade estrutural [6], explicitação de decisões arquiteturais [8] e gestão de custos evolutivos [14]. A MEDE não se propõe a substituir nenhuma dessas contribuições. Sua relevância está em articular uma camada transversal que permite preservar, contextualizar e observar o conhecimento gerado por essas práticas ao longo do tempo [11].

Sob essa perspectiva, a metodologia atua sobre um problema estrutural: software evolui [5], mas o conhecimento sobre sua evolução frequentemente não é preservado com a mesma disciplina com que o código é alterado [11]. A consequência é que parte significativa do custo de manutenção e reengenharia passa a decorrer não apenas de mudanças técnicas, mas da necessidade de reconstruir entendimento perdido [11], [14]. Ao organizar a relação entre eventos decisórios, decisões estruturais, especificações intermediárias e documentação viva, a MEDE procura reduzir exatamente esse tipo de opacidade evolutiva [8], [11].

## 11.2 Relação com abordagens orientadas à execução

A discussão sobre a MEDE torna-se particularmente relevante em um cenário no qual boa parte das práticas contemporâneas de desenvolvimento privilegia organização do fluxo de trabalho, ciclos curtos de entrega e adaptação operacional [3], [4], [13]. Tais abordagens trouxeram ganhos claros de responsividade e automação [4], [13], mas frequentemente deixam subespecificada a governança do conhecimento da solução [11].

A MEDE não se opõe a esse movimento; ela o complementa [11]. Em vez de contestar a utilidade de mecanismos de backlog, entrega contínua ou integração contínua, a metodologia afirma que tais mecanismos não bastam, por si sós, para garantir preservação da inteligibilidade da solução ao longo do tempo [3], [4], [11]. Em outras palavras, executar com eficiência não equivale a preservar entendimento com qualidade [11].

Essa distinção é importante porque evita um falso dilema entre velocidade e documentação. A proposta da MEDE não é retornar a modelos documentais rígidos e massivos, mas introduzir uma documentação causal, enxuta e evolutiva, capaz de coexistir com ambientes de desenvolvimento rápidos sem perder coerência histórica [4], [11], [13].

## 11.3 Documentação como infraestrutura de continuidade

Um dos resultados conceituais mais importantes da metodologia é a reinterpretação da documentação como **infraestrutura de continuidade técnica** [11]. Tradicionalmente, documentação é muitas vezes vista como apoio secundário à implementação ou como exigência externa de auditoria, transferência ou conformidade. A MEDE desloca esse entendimento ao tratá-la como parte constitutiva da capacidade do software de permanecer compreensível e evolutivo [11].

Esse ponto dialoga com a percepção de que o software não deve ser analisado apenas como conjunto de instruções executáveis, mas como artefato artificial cuja estrutura expressa decisões, compromissos e interpretações do domínio [6], [7], [9]. Quando essas decisões deixam de ser observáveis, a continuidade da solução passa a depender de memória tácita e de permanência organizacional, tornando-se vulnerável a rotatividade de equipes, reorganizações e migrações tecnológicas [11], [15]. Nesse sentido, a governança documental proposta pela MEDE pode ser interpretada como uma estratégia deliberada de redução da dependência de conhecimento implícito [10], [11].

## 11.4 Observabilidade da construção do software

Outro aspecto que distingue a MEDE é a introdução da ideia de **observabilidade da construção do software** [11]. A metodologia sugere que, quando a evolução documental é governada de forma causal e consistente, torna-se possível observar indiretamente o comportamento evolutivo do projeto por meio de sinais como estabilidade decisória, frequência de revisões estruturais, tempo de consolidação de mudanças e coerência entre documentação histórica e documentação viva [11], [14].

Essa proposta não deve ser confundida com medição clássica de produtividade ou qualidade de código [11]. Seu foco está em tornar parcialmente observável a maturação do entendimento da solução, e não em reduzir a engenharia a indicadores operacionais simplificados [11]. A relevância dessa ideia está no fato de que grande parte dos problemas evolutivos do software emerge justamente em dimensões pouco observadas por métricas tradicionais: perda de justificativas, fragilidade semântica, reinterpretação recorrente de conceitos e acúmulo de dívida epistemológica [11], [14].

## 11.5 Implicações para continuidade, migração e reengenharia

A discussão sobre a aplicabilidade da MEDE mostra que sua utilidade se torna particularmente evidente em projetos que precisam sobreviver à passagem do tempo [5], [11]. Sistemas sujeitos a manutenção prolongada, troca de equipe ou migração tecnológica dependem menos da mera presença de código executável e mais da preservação do entendimento consolidado sobre a solução [11]. Nesses cenários, a documentação deixa de ser elemento periférico e passa a funcionar como ativo de reengenharia [11].

Esse ponto também ilumina uma limitação recorrente de abordagens exclusivamente centradas em implementação: o código revela o que o sistema faz em determinado momento, mas nem sempre explica por que passou a fazê-lo daquela forma, em que contexto isso foi decidido e que alternativas foram rejeitadas [8], [11]. A MEDE procura reduzir essa lacuna ao estruturar a memória evolutiva do sistema de forma legível por humanos e por ferramentas [11].

## 11.6 IA e automação: amplificação, não substituição

A discussão sobre suporte ferramental e automação assistida por IA reforça outro ponto central do artigo: a utilidade da inteligência artificial cresce quando a documentação é bem governada, mas essa utilidade não elimina a centralidade da decisão humana [4], [11], [13]. Em um ambiente no qual a implementação se torna progressivamente mais automatizável, o valor relativo da documentação que orienta e preserva o entendimento da solução tende a aumentar [4], [11].

A MEDE é particularmente adequada a esse cenário porque organiza a documentação em formato textual, versionável e semanticamente estruturado [11]. Isso favorece seu uso por ferramentas automatizadas sem transferir à máquina a responsabilidade sobre a verdade documental do projeto [11]. A contribuição da metodologia, portanto, não está em prometer automação irrestrita, mas em oferecer um modelo de documentação no qual a automação pode operar sob governança, com preservação de causalidade e supervisão humana [11].

## 11.7 Limites interpretativos da proposta

Apesar de suas contribuições, a MEDE não deve ser interpretada como solução total para os problemas da engenharia de software [11]. Como discutido anteriormente, a metodologia não substitui arquitetura, modelagem, testes, gestão financeira, estimativa de prazo ou gerenciamento de projetos [1], [3], [4], [6], [8], [11], [13]. Sua função é mais específica: preservar o conhecimento da solução e tornar observável sua evolução [11].

Também não se deve inferir que maior volume documental implique necessariamente melhor governança [11]. A metodologia não valoriza documentação extensa por si mesma, mas documentação causal, contextualizada e semanticamente estável [11]. Da mesma forma, a simples adoção formal de atas, ADRs e ESMs não garante qualidade do entendimento do sistema; esses artefatos apenas aumentam a capacidade de preservá-lo e inspecioná-lo [8], [11].

Por fim, a efetividade da MEDE depende de disciplina organizacional mínima e de reconhecimento de valor na documentação como ativo de engenharia [10], [11]. Sem esse compromisso, a metodologia corre o risco de ser reduzida a ritual documental, perdendo sua função principal de governança do conhecimento [11].

## 11.8 Síntese da discussão

Em síntese, a MEDE pode ser compreendida como uma metodologia que reposiciona a documentação de software no centro da continuidade evolutiva da solução [11]. Sua principal contribuição é mostrar que preservar a inteligibilidade do sistema ao longo do tempo exige mais do que armazenamento de arquivos ou produção inicial de especificações: exige uma governança documental capaz de acompanhar, explicar e tornar observável a trajetória do conhecimento incorporado ao software [5], [8], [11].

Essa contribuição torna-se particularmente relevante em um cenário de crescente automação da implementação, alta rotatividade organizacional e pressão por velocidade [4], [11], [13]. Nesses contextos, a capacidade de produzir software rapidamente não elimina a necessidade de preservar por que ele existe da forma como existe [11]. A MEDE insere-se justamente nesse ponto: como metodologia para garantir que a evolução do sistema não destrua a memória de sua própria construção [11].

---

# **12. Conclusão**

Este artigo apresentou a **Metodologia de Engenharia Documental Evolutiva (MEDE)** como uma proposta voltada à governança da documentação de software ao longo de sua evolução [11]. Partiu-se do reconhecimento de que a engenharia de software contemporânea, embora tenha avançado significativamente em práticas de organização do trabalho, adaptação incremental e automação da entrega [3], [4], [13], ainda enfrenta de forma recorrente um problema estrutural: a perda progressiva do conhecimento da solução à medida que o sistema evolui, as equipes mudam e a memória histórica do projeto se torna opaca [5], [11], [15].

Ao longo do trabalho, argumentou-se que esse problema não pode ser reduzido a mera ausência de documentação nem resolvido por produção volumétrica de artefatos estáticos [11]. O desafio central reside em preservar de forma inteligível a relação entre eventos decisórios, decisões estruturais, mudanças esperadas, entregas realizadas e estado documental vigente da solução [8], [11]. Nessa perspectiva, a documentação deixa de ser compreendida como apêndice administrativo da implementação e passa a ser tratada como infraestrutura de continuidade técnica e de preservação do conhecimento do sistema [11].

A MEDE foi formulada como resposta metodológica a esse problema. Seu núcleo consiste em organizar a evolução documental do projeto por meio de causalidade explícita, distinção entre documentos históricos e documentos vivos, padronização estrutural do espaço documental e disciplina de consolidação progressiva do entendimento da solução [11]. Ao fazer isso, a metodologia procura garantir que o software permaneça não apenas executável, mas também compreensível, rastreável e preservável ao longo do tempo [5], [8], [11].

Uma contribuição importante da metodologia é a reinterpretação da documentação como mecanismo de observabilidade da construção do software [11]. Ao preservar rastros formais da evolução do entendimento da solução, a MEDE permite tratar a documentação não apenas como repositório de informação, mas como base para inferir estabilidade decisória, entropia evolutiva, maturidade documental e continuidade técnica [11], [14]. Nesse sentido, a metodologia amplia o papel da documentação na engenharia de software, aproximando-a de uma função analítica e não apenas descritiva [11].

Outro ponto relevante discutido no artigo foi a compatibilidade da MEDE com ambientes de desenvolvimento contemporâneos. A metodologia não se opõe a abordagens ágeis, práticas de entrega contínua ou suporte ferramental assistido por inteligência artificial [3], [4], [11], [13]. Ao contrário, propõe uma camada documental capaz de coexistir com essas abordagens, oferecendo-lhes aquilo que frequentemente lhes falta: uma estrutura para preservação da memória evolutiva do sistema e para redução da dependência de conhecimento tácito [10], [11], [15].

Também se mostrou que a aplicabilidade da MEDE não se restringe a sistemas longos e fortemente mutáveis, embora esses sejam contextos nos quais seu valor se torna mais evidente [5], [11]. Projetos de escopo relativamente fechado, soluções inicialmente temporárias e sistemas sujeitos a futura reengenharia também podem se beneficiar da metodologia na medida em que desejem preservar o entendimento da solução de forma reutilizável, versionável e legível por humanos e máquinas [11].

Em síntese, a contribuição central deste artigo está em afirmar que a preservação do conhecimento da solução deve ser tratada como problema metodológico explícito da engenharia de software [11]. A MEDE foi apresentada como uma resposta a esse problema: uma metodologia voltada à documentação evolutiva, causal e observável de sistemas de software, capaz de aumentar sua inteligibilidade ao longo do tempo e reduzir o custo de continuidade técnica [11], [14]. Em um cenário de crescente automação da implementação e aceleração da entrega, preservar por que o software existe da forma como existe torna-se tão importante quanto produzir novas versões rapidamente [4], [11], [13]. É nesse ponto que a MEDE se posiciona: como metodologia para garantir que a evolução do sistema não destrua a memória de sua própria construção [11].

---

# **13. Trabalhos Futuros**

A proposta da Metodologia de Engenharia Documental Evolutiva (MEDE) apresentada neste artigo constitui um passo inicial na formalização de práticas de governança documental voltadas à preservação do conhecimento da solução ao longo da evolução de sistemas de software [11]. Embora a metodologia tenha sido motivada por experiências práticas e fundamentada em princípios consolidados da engenharia de software e da teoria da decisão [5], [9], [11], sua consolidação como abordagem científica requer continuidade de investigação empírica, teórica e ferramental.

## 13.1 Validação empírica em projetos reais

Um dos caminhos mais relevantes para trabalhos futuros consiste na realização de estudos empíricos sistemáticos sobre a aplicação da MEDE em diferentes contextos de desenvolvimento [11]. Esses estudos podem investigar, por exemplo:

* impacto da metodologia na continuidade de projetos ao longo do tempo;
* redução do esforço de reengenharia em cenários de troca de equipe;
* influência da governança documental na estabilidade arquitetural;
* e relação entre maturidade documental e capacidade de evolução funcional do sistema [5], [11], [14].

Tais investigações podem assumir a forma de estudos de caso longitudinais, experimentos controlados ou análises comparativas entre projetos com e sem adoção da metodologia [11]. A construção de evidência empírica consistente permitirá avaliar não apenas a viabilidade operacional da MEDE, mas também seus limites de aplicabilidade e custo organizacional associado [11].

## 13.2 Formalização de métricas documentais

Outro eixo importante de pesquisa refere-se à formalização de métricas associadas à evolução documental do projeto [11]. Embora este artigo tenha introduzido conceitos como estabilidade decisória, entropia evolutiva e maturidade documental em nível conceitual, há espaço para desenvolvimento de modelos quantitativos ou semi-quantitativos capazes de operacionalizar tais ideias [11].

Nesse sentido, trabalhos futuros podem explorar:

* indicadores de coerência entre documentação histórica e documentação viva;
* métricas de frequência e impacto de revisões arquiteturais;
* tempo médio de consolidação de mudanças funcionais;
* e relações entre densidade decisória e ocorrência de dívida técnica ou epistemológica [11], [14].

A construção de modelos de mensuração mais formais pode contribuir para integrar a governança documental ao conjunto mais amplo de práticas de observabilidade e gestão da evolução do software [13].

## 13.3 Desenvolvimento de suporte ferramental especializado

A compatibilidade da MEDE com automação assistida por inteligência artificial abre espaço para desenvolvimento de ferramentas específicas voltadas à manutenção documental governada [11]. Trabalhos futuros podem investigar arquiteturas de ferramentas capazes de:

* analisar automaticamente atas de reunião;
* sugerir criação ou atualização de artefatos documentais;
* identificar inconsistências entre decisões registradas e documentação vigente;
* e apoiar geração de artefatos derivados, como manuais, resumos técnicos ou propostas de evolução [11].

Essas ferramentas devem ser concebidas de modo a preservar o princípio metodológico central da MEDE: a decisão de engenharia permanece sob responsabilidade humana, enquanto a automação atua como mecanismo de ampliação da consistência documental [11]. Investigações nessa direção podem contribuir para reduzir o custo operacional da disciplina documental sem comprometer sua governança [4], [11], [13].

## 13.4 Integração com processos organizacionais e educacionais

Outro campo promissor de pesquisa refere-se à integração da MEDE com processos organizacionais de gestão do conhecimento e com programas educacionais em engenharia de software [11]. Estudos futuros podem explorar:

* adoção da metodologia em ambientes corporativos com diferentes níveis de maturidade;
* impacto na transferência de conhecimento entre equipes;
* uso da estrutura documental como instrumento pedagógico em formação de engenheiros;
* e relação entre disciplina documental e desenvolvimento de pensamento arquitetural reflexivo [10], [11].

Essa linha de investigação pode contribuir para posicionar a MEDE não apenas como prática técnica, mas como abordagem formativa voltada à construção de responsabilidade epistemológica na engenharia de software [11].

## 13.5 Evolução teórica da engenharia documental

Finalmente, a proposta da MEDE abre espaço para desenvolvimento de um campo mais amplo de investigação teórica sobre engenharia documental em software [11]. Trabalhos futuros podem aprofundar:

* modelos formais de causalidade documental;
* relação entre documentação evolutiva e leis de evolução do software;
* papel da documentação na redução de incerteza em decisões arquiteturais;
* e implicações epistemológicas da preservação estruturada do conhecimento técnico [5], [9], [11].

O avanço dessas discussões pode contribuir para consolidar a documentação evolutiva como dimensão reconhecida da engenharia de software, complementando abordagens centradas em processo, arquitetura e automação [11].

## 13.6 Síntese dos trabalhos futuros

Em síntese, a agenda de pesquisa associada à MEDE envolve validação empírica, formalização conceitual, desenvolvimento ferramental e integração organizacional [11]. O amadurecimento desses eixos poderá permitir avaliar com maior precisão o impacto da metodologia na continuidade técnica de sistemas de software e na preservação do conhecimento necessário à sua evolução sustentável [5], [11]. Assim, a proposta apresentada neste artigo deve ser entendida como ponto de partida para um programa de investigação mais amplo sobre governança documental e observabilidade da construção do software [11].

---

# **14. Referências**

[1] W. W. Royce, “Managing the Development of Large Software Systems,” in *Proc. IEEE
WESCON*, 1970.

[2] B. W. Boehm, “A Spiral Model of Software Development and Enhancement,” *Computer*, vol.
21, no. 5, pp. 61–72, 1988.

[3] K. Beck _et al._, “Manifesto for Agile Software Development,” 2001. [Online]. Available:
agilemanifesto.org. Accessed: 2026-01-07.

[4] J. Humble and D. Farley, *Continuous Delivery: Reliable Software Releases through Build, Test,
and Deployment Automation*. Boston, MA, USA: Addison-Wesley, 2010.

[5] M. M. Lehman and L. A. Belady, *Program Evolution: Processes of Software Change*. London,
UK: Academic Press, 1985.

[6] D. L. Parnas, “On the Criteria To Be Used in Decomposing Systems into Modules,” *Commun.
ACM*, vol. 15, no. 12, pp. 1053–1058, 1972.

[7] F. P. Brooks Jr., “No Silver Bullet — Essence and Accidents of Software Engineering,”
*Computer*, vol. 20, no. 4, pp. 10–19, 1987.

[8] M. Nygard, “Documenting Architecture Decisions,” Cognitect Blog, Nov. 2011. [Online].
Available: https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions.
Accessed: 2026-01-07.

[9] H. A. Simon, *The Sciences of the Artificial*, 3rd ed. Cambridge, MA, USA: MIT Press, 1996.

[10] D. A. Schön, *The Reflective Practitioner: How Professionals Think in Action*. New York, NY,
USA: Basic Books, 1983.

[11] M. Silva, “An Epistemological Model of Software Engineering - Centered on Decision-Making
and the Progressive Maturation of the Solution (preprint),” Zenodo, 2026. [Online]. Available:
https://doi.org/10.5281/zenodo.18188250. Accessed: 2026-03-12.

[12] B. Nuseibeh and S. Easterbrook, “Requirements Engineering: A Roadmap,” in *Proc. Conf. on
the Future of Software Engineering (ICSE/FSE)*, 2000.

[13] N. Forsgren, J. Humble, and G. Kim, *Accelerate: The Science of Lean Software and DevOps:
Building and Scaling High Performing Technology Organizations*. Portland, OR, USA: IT
Revolution, 2018.

[14] P. Kruchten, R. L. Nord, and I. Ozkaya, “Managing Technical Debt: Reducing Friction in Software
Development,” in *Proc. 34th Int. Conf. Software Engineering (ICSE)*, 2012.

[15] M. E. Conway, “How Do Committees Invent?,” *Datamation*, vol. 14, no. 4, pp. 28–31, Apr.
1968. [Online]. Available: https://www.melconway.com/Home/Committees_Paper.html.
Accessed: 2026-01-07.

---

# **Anexo A — Glossário MEDE**

## **Ata de reunião**

Registro formal de um evento decisório relacionado ao projeto de software. A ata constitui o ponto de entrada causal da evolução documental na MEDE, descrevendo demandas, problemas identificados, decisões preliminares e encaminhamentos.

## **Causalidade documental**

Relação explícita entre um evento decisório e a criação, modificação ou consolidação de artefatos documentais. Na MEDE, toda alteração relevante na documentação deve possuir origem rastreável em uma ata ou evento equivalente.

## **Continuidade técnica**

Capacidade de um sistema de software permanecer compreensível, evolutivo e passível de manutenção ao longo do tempo, independentemente de mudanças tecnológicas, organizacionais ou de equipe.

## **Decisão arquitetural**

Escolha estrutural relevante que impacta a organização, o comportamento ou a evolução do sistema. Na MEDE, decisões arquiteturais são formalizadas por meio de Registros de Decisão Arquitetural.

## **Documento congelado**

Artefato documental que representa o estado histórico de um planejamento, decisão ou entendimento em determinado momento do projeto. Após sua consolidação, não sofre alterações, sendo preservado como registro evolutivo.

## **Documento vivo**

Artefato documental sujeito a atualização controlada ao longo da evolução do sistema. Representa o entendimento vigente da solução e deve manter coerência com os registros históricos que justificam sua forma atual.

## **Entropia evolutiva**

Tendência ao aumento da desorganização ou inconsistência do entendimento da solução ao longo do tempo, decorrente de mudanças não documentadas ou mal contextualizadas.

## **Especificação de Manutenção do Sistema (ESM)**

Artefato documental que descreve mudanças funcionais, técnicas ou operacionais previstas, ainda não plenamente consolidadas no entendimento estável do sistema. Funciona como ponte entre decisão e atualização definitiva dos documentos vivos.

## **Estabilidade decisória**

Grau de permanência das decisões estruturais ao longo do tempo. Pode ser inferido pela frequência de revisões arquiteturais e pela necessidade de reinterpretação de soluções anteriormente adotadas.

## **Evento decisório**

Situação formal ou excepcional em que o entendimento do sistema é discutido, revisado ou ampliado. Na MEDE, eventos decisórios são tipicamente registrados por meio de atas.

## **Governança documental**

Conjunto de práticas metodológicas voltadas a garantir consistência, rastreabilidade, preservação histórica e coerência evolutiva da documentação do projeto.

## **Hotfix governado**

Correção emergencial realizada em ambiente de produção que, apesar de sua urgência, deve ser posteriormente formalizada documentalmente por meio de ata e atualização dos artefatos pertinentes.

## **Inteligibilidade da solução**

Grau em que o sistema pode ser compreendido por engenheiros, equipes ou organizações, a partir da documentação disponível e da preservação do contexto evolutivo.

## **Log de entregas**

Conjunto de registros históricos de entrega, preservados em arquivos `leg-*` no diretório `log-entregas/`, que documenta cronologicamente as entregas efetivamente realizadas no projeto e permite comparação entre planejamento inicial e execução real.

## **Entendimento inicial**

Documento histórico e congelado que registra a baseline epistemológica inicial do projeto, concentrando visão inicial, escopo inicial, premissas, backlog inicial e planejamento inicial de entregas.

## **Situação atual**

Documento vivo que consolida o estado vigente do backlog e dos itens do projeto, preservando a fotografia operacional atual sem substituir a memória histórica das entregas.

## **Maturidade documental**

Nível de consistência, estabilidade e completude do entendimento registrado sobre a solução ao longo do tempo.

## **Metodologia de Engenharia Documental Evolutiva (MEDE)**

Abordagem metodológica voltada à governança causal e evolutiva da documentação de software, com o objetivo de preservar o conhecimento da solução e tornar observável sua construção ao longo do tempo.

## **Observabilidade da construção do software**

Capacidade de inferir aspectos do comportamento evolutivo do projeto por meio da análise estruturada de sua documentação.

## **Registro de Decisão Arquitetural (ADR)**

Artefato documental que formaliza uma decisão estrutural relevante do sistema, incluindo contexto, alternativas consideradas, justificativa e consequências esperadas.

## **Ritmo decisório**

Periodicidade com que eventos decisórios são realizados no projeto, influenciando a cadência de evolução documental e de consolidação do entendimento da solução.

## **Rastreabilidade evolutiva**

Capacidade de identificar, ao longo do tempo, a origem, o contexto e o impacto das mudanças realizadas no sistema.

## **Responsabilidade epistemológica**

Compromisso dos responsáveis pelo projeto em preservar, validar e consolidar o conhecimento necessário à correta evolução da solução.

---

# **ANEXO B — Estrutura Documental do MEDE e Modelos de Artefatos**

## **B.1 Estrutura geral de diretórios**

A metodologia MEDE recomenda a organização documental em estrutura simples, versionável e semanticamente orientada à evolução do sistema [11].

Uma estrutura típica, observada no projeto analisado, é:

```text
docs/
│
│ entendimento-inicial.md
│ modelo-de-dados.md
│ readme.md
│ requisitos-funcionais.md
│ requisitos-nao-funcionais.md
│ situacao-atual.md
│ visao-e-escopo.md
│
├── atas-de-reuniao/
├── decisoes-arquiteturais/
├── especificacao-manutencao-sistema/
└── log-entregas/
```

Essa estrutura reflete três dimensões fundamentais:

1. **Documentos de referência e estado do sistema**
2. **Registro histórico das decisões**
3. **Registro histórico da evolução operacional**

---

## **B.2 Documentos principais da raiz do projeto**

Os documentos mantidos diretamente na raiz de `docs/` cumprem papéis distintos dentro da governança documental da metodologia.

Parte deles representa o **estado atual consolidado do sistema** e deve ser atualizada de forma controlada. Outra parte preserva o **entendimento inicial e o planejamento original**, funcionando como memória histórica da concepção do projeto [11].

### **B.2.1 Visão e Escopo**

Define objetivo, contexto operacional, limites contratuais e funcionalidades incluídas.

Exemplo observado:

* definição clara do propósito do sistema;
* delimitação explícita do que está fora do escopo;
* separação entre responsabilidade da contratante e da contratada.

Essas características permitem:

* reduzir ambiguidade contratual;
* evitar crescimento não controlado de escopo;
* preservar a intenção funcional e operacional do sistema.

Esse papel é evidenciado de forma recorrente em documentos de visão e escopo adotados segundo a metodologia [11].

---

### **B.2.2 Requisitos Funcionais e Não Funcionais**

Esses documentos consolidam comportamento esperado do sistema.

O conjunto de requisitos analisado apresenta:

* requisitos de segurança;
* requisitos de performance;
* regras de autenticação e conectividade;
* requisitos de auditoria;
* limites operacionais;
* critérios para operação em campo.

Esse tipo de formalização contribui para:

* preservação da arquitetura operacional;
* manutenção da qualidade do sistema;
* continuidade de evolução tecnológica.

Esse padrão é compatível com a prática documental observada em projetos aderentes à metodologia [11].

---

### **B.2.3 Modelo de Dados**

Define a estrutura lógica persistente do sistema.

Sua existência no conjunto documental:

* permite reconstrução tecnológica futura;
* preserva semântica das entidades;
* reduz dependência da implementação;
* sustenta continuidade da solução em caso de reengenharia.

---

### **B.2.4 Situação Atual**

Documento vivo que consolida o estado atual dos itens do projeto.

Registra:

* backlog vigente;
* situação atual de cada item;
* fotografia operacional do projeto;
* base de consulta corrente para equipe e gestão.

Permite:

* leitura rápida do estado atual;
* comparação com o planejamento inicial;
* separação entre estado vigente e memória histórica.

No material analisado, esse documento absorve a tabela consolidada final do projeto, deixando de sobrecarregar o log histórico de entregas com uma função de consulta permanente [11].

---

### **B.2.5 Entendimento Inicial**

Documento **imutável**.

Sua função é preservar:

* visão inicial do projeto;
* escopo inicial;
* premissas técnicas e operacionais;
* backlog inicial;
* planejamento inicial de entregas.

Essa separação evita reescrita histórica do entendimento e do planejamento de origem, permitindo comparação posterior entre hipótese inicial de solução e evolução efetiva do sistema [11].

---

### **B.2.6 README documental**

Documento orientador da pasta `docs/`.

Sua função é:

* definir a finalidade da documentação;
* explicitar a estrutura adotada;
* registrar convenções de nomeação;
* reforçar que `docs/` é a fonte de verdade documental do projeto.

Esse artefato é metodologicamente relevante porque explicita, em linguagem operacional, as regras de uso da própria estrutura documental [11].

---

## **B.3 Atas de Reunião**

As atas são o **documento causal primário da evolução do sistema** [11].

Cada ata:

* registra decisões;
* registra problemas;
* registra demandas;
* registra entendimento entre as partes.

Esse comportamento é coerente com atas de kickoff, atas de alinhamento técnico, atas de validação operacional e atas de consolidação periódica do projeto.

No MEDE:

* **toda entrada de trabalho relevante deve ter origem em uma ata**;
* atas são **imutáveis após consolidação**;
* a ata funciona como marco causal da evolução documental [11].

---

## **B.4 Registro de Decisão Arquitetural (ADR)**

Os ADRs registram decisões estruturais que impactam:

* arquitetura;
* modelo operacional;
* tecnologia;
* segurança;
* sincronização;
* conectividade;
* políticas de sessão e autenticação.

Exemplos concretos observados no material analisado incluem decisões sobre:

* stack tecnológica;
* organização do repositório;
* modelo operacional de importação e vistorias;
* segurança e observabilidade plugável;
* uso de mapas e polígonos de setores;
* sincronização e retomada de sessão em operação de campo.

Características no MEDE:

* são **imutáveis**;
* possuem data no nome;
* derivam de ata;
* registram consequências técnicas e operacionais [8], [11].

---

## **B.5 Especificação de Manutenção do Sistema (ESM)**

Documento responsável por formalizar:

* correções;
* ajustes operacionais;
* evoluções;
* melhorias técnicas;
* demandas surgidas do uso real e da estabilização da solução.

Esse padrão é compatível com ESMs de abertura e com ESMs posteriores de manutenção evolutiva.

Funções do ESM:

* consolidar demandas reais de uso;
* preservar histórico funcional e operacional;
* orientar ciclos de evolução;
* evitar perda de conhecimento operacional ainda não consolidado na documentação viva [11].

---

## **B.6 Log de Entregas**

Na forma amadurecida da MEDE, `log-entregas` é tratado como **diretório histórico**, e não como documento vivo único [11].

Cada arquivo `leg-*` registra:

* a entrega consolidada do ciclo;
* os itens efetivamente entregues;
* novos itens absorvidos;
* referências documentais;
* estatísticas do ciclo.

Esse formato preserva a cadência evolutiva do projeto e mantém a memória do realizado separada do documento vivo de situação atual [11].

---

## **B.7 Nomenclatura padronizada**

No MEDE recomenda-se:

```text
ata-AAAAMMDD-CICLO-descricao.md
adr-AAAAMMDD-CICLO-descricao.md
esm-AAAAMMDD-CICLO-descricao.md
leg-AAAAMMDD-CICLO-descricao.md
```

Isso permite:

* ordenação temporal automática;
* rastreabilidade causal;
* análise histórica do sistema;
* leitura humana previsível;
* processamento automatizado por ferramentas [11].

Nos documentos principais da raiz, observam-se nomes estáveis e sem data, como:

```text
entendimento-inicial.md
visao-e-escopo.md
requisitos-funcionais.md
requisitos-nao-funcionais.md
modelo-de-dados.md
situacao-atual.md
readme.md
```

Essa separação entre nomes estáveis para documentos centrais e nomes temporais para artefatos históricos é coerente com a ontologia documental da metodologia [11].

---

## **B.8 Benefícios da estrutura documental**

A estrutura observada permite:

* reconstrução do sistema em outra tecnologia;
* troca de equipe sem perda de conhecimento;
* suporte a auditoria técnica e contratual;
* comparação entre entendimento inicial, planejamento e execução real;
* alimentação de ferramentas de IA;
* geração automatizada de artefatos derivados [11].

Além disso, a coexistência entre `entendimento-inicial.md`, `situacao-atual.md` e `log-entregas/` permite distinguir claramente:

* o que foi inicialmente compreendido;
* o que foi inicialmente compreendido e planejado;
* o que foi efetivamente entregue;
* e o que constitui o estado atual consolidado da solução [11].

---

## **B.9 Consideração final**

O conjunto documental estruturado segundo a MEDE demonstra que:

* a documentação não é tratada como produto secundário;
* ela constitui o **mecanismo central de preservação do conhecimento do sistema** [11].

Os exemplos analisados mostram uma organização documental em que atas, ADRs, ESMs, documentos principais da raiz e registros históricos de entrega formam um sistema coerente de governança da evolução da solução [8], [11].

Essa característica é um dos fundamentos centrais da MEDE.

---

# **ANEXO C — Templates dos Artefatos da MEDE**

Este anexo apresenta modelos operacionais recomendados para os principais artefatos da Metodologia de Engenharia Documental Evolutiva (MEDE). Os templates foram derivados da análise de documentação real de projeto, preservando sua lógica de governança, rastreabilidade e consolidação evolutiva. A estrutura proposta assume que a pasta `docs/` é a fonte oficial de verdade documental do projeto e que alterações relevantes de entendimento devem ser formalizadas nesse espaço.

---

## **C.1 Princípios gerais de preenchimento**

Todo template da MEDE deve obedecer a cinco princípios:

1. **clareza causal**: o documento precisa deixar explícito por que existe;
2. **delimitação de escopo**: o leitor deve entender o que o documento cobre e o que não cobre;
3. **rastreabilidade**: o documento deve permitir ligação com atas, ADRs, ESMs, planejamento inicial e documentos vivos quando aplicável;
4. **imutabilidade ou atualização controlada**: documentos históricos não devem ser reescritos; documentos vivos devem ser revisados de forma disciplinada;
5. **legibilidade humana e por máquina**: estrutura textual simples, cabeçalhos consistentes e nomenclatura estável.

---

## **C.2 Template — Ata de Reunião**

A ata é o **artefato causal primário** da MEDE. Nos exemplos reais, ela registra contexto, participantes, demandas, ajustes solicitados, entregas realizadas, pendências, decisões e observações finais.

### **Nome do arquivo**

```text
ata-AAAAMMDD-CICLO-descricao-curta.md
```

### **Template recomendado**

```markdown
# Ata de Reunião – AAAAMMDD — Ciclo CICLO

**Projeto:** <nome do projeto>
**Data:** <AAAA-MM-DD>
**Ciclo:** <000 | 001 | 002 | ...>
**Tipo:** <kickoff | alinhamento | homologação | reunião operacional | reunião técnica | hotfix | validação>
**Participantes:**
- <nome / papel / organização>
- <nome / papel / organização>

---

## 1. Objetivo

Descrever em 1 a 3 parágrafos o objetivo específico da reunião.
Explicar por que a reunião ocorreu e qual decisão, validação, alinhamento ou problema motivou sua realização.

---

## 2. Contexto

Descrever o estado atual do projeto no momento da reunião:
- situação funcional
- situação contratual
- situação operacional
- entregas já concluídas
- riscos ou limitações já conhecidas

Evitar opiniões vagas. Registrar fatos observáveis.

---

## 3. Itens discutidos

### 3.1 <tema>
Descrever o ponto discutido.

### 3.2 <tema>
Descrever o ponto discutido.

### 3.3 <tema>
Descrever o ponto discutido.

---

## 4. Solicitações, problemas ou não conformidades

Registrar itens levantados pelo cliente, pela operação ou pela equipe técnica.

Para cada item:
- descrição objetiva
- impacto observado
- módulo afetado
- severidade estimada (se aplicável)
- necessidade ou não de originar ESM
- necessidade ou não de originar ADR

---

## 5. Decisões registradas

Listar decisões explícitas tomadas na reunião.

Para cada decisão:
- decisão
- justificativa resumida
- impacto esperado
- documento futuro esperado (nenhum / ESM / ADR / atualização de documento vivo)

---

## 6. Entregas apresentadas ou validadas

Quando houver demonstração funcional, registrar:
- funcionalidades demonstradas
- evidências de entrega
- eventuais limitações observadas
- se a entrega foi aceita, parcialmente aceita ou apenas apresentada

---

## 7. Pendências e encaminhamentos

Listar os próximos passos objetivos.
Para cada item:
- ação
- responsável
- prazo ou janela esperada
- documento relacionado

---

## 8. Impactos documentais

Indicar explicitamente quais documentos devem ser criados ou revisados após a reunião.

### Criar
- <esm-AAAAMMDD-CICLO-descricao-curta.md>
- <adr-AAAAMMDD-CICLO-descricao-curta.md>

### Atualizar
- <visao-e-escopo.md>
- <requisitos-funcionais.md>
- <requisitos-nao-funcionais.md>
- <modelo-de-dados.md>
- <situacao-atual.md>

### Registrar em entrega futura
- <leg-AAAAMMDD-CICLO-descricao-curta.md>

### Sem impacto documental
- <itens que não exigem alteração documental>

---

## 9. Observação final

Registrar limites da ata:
- o que esta ata formaliza
- o que esta ata não altera automaticamente
- se há dependência de aditivo contratual
- se há decisão ainda pendente de confirmação
```

### **Regras de uso**

A ata deve ser usada para formalizar alinhamento, homologação, encerramento de escopo, início de estabilização operacional, análise técnica e registro de problemas observados em campo, exatamente como aparece nos documentos reais.

---

## **C.3 Template — Registro de Decisão Arquitetural (ADR)**

Nos ADRs analisados, a estrutura forte é: **status, data, decisores, contexto, decisões, consequências e observações finais/referências**. Eles não são atas resumidas; são documentos de decisão estrutural.

### **Nome do arquivo**

```text
adr-AAAAMMDD-CICLO-descricao-curta.md
```

### **Template recomendado**

```markdown
# ADR-AAAAMMDD-CICLO — <título da decisão>

**Status:** <Proposto | Aceito | Rejeitado | Substituído | Cancelado>
**Data:** <AAAA-MM-DD>
**Ciclo:** <000 | 001 | 002 | ...>
**Ata de origem:** <ata-AAAAMMDD-CICLO-descricao-curta.md>
**Decisores:** <nomes ou papéis>

---

## Contexto

Descrever o problema arquitetural, estrutural ou operacional que exige decisão.

Responder:
- qual problema existe?
- por que ele importa?
- que restrições existem?
- qual risco existe se nada for decidido?

---

## Decisões

### 1. <subdecisão>
Descrever a decisão tomada de forma inequívoca.

**Decisão:**
- <regra normativa>
- <regra normativa>

### 2. <subdecisão>
Descrever a decisão tomada de forma inequívoca.

**Decisão:**
- <regra normativa>
- <regra normativa>

### 3. <subdecisão>
Descrever a decisão tomada de forma inequívoca.

**Decisão:**
- <regra normativa>
- <regra normativa>

---

## Consequências

### Consequências positivas
- <benefícios>

### Trade-offs
- <custos aceitos>

### Riscos
- <riscos residuais>

### Impactos técnicos
- backend
- frontend
- dados
- segurança
- infraestrutura
- operação

---

## Observações finais

Registrar:
- limites da decisão
- hipóteses assumidas
- possibilidade de revisão futura
- condições que exigiriam novo ADR
```

### **Quando criar ADR**

Criar quando a reunião produzir decisão sobre modelo operacional, autenticação, importação, sincronização, arquitetura de conectividade, plataforma de mapas, governança de dados, segurança, observabilidade ou outro ponto estrutural do sistema. Isso está claramente demonstrado nos ADRs reais sobre modelo operacional, sincronização e retomada controlada de sessão.

---

## **C.4 Template — ESM (Especificação de Manutenção do Sistema)**

O ESM é mais do que uma simples lista de mudanças. Ele formaliza comportamento esperado, classifica itens, preserva origem e serve de ponte entre uso real, correção, ajuste e evolução.

### **Nome do arquivo**

```text
esm-AAAAMMDD-CICLO-descricao-curta.md
```

### **Estrutura geral recomendada**

```markdown
# ESM — Especificação de Manutenção do Sistema

**Data:** <AAAA-MM-DD>
**Ciclo:** <000 | 001 | 002 | ...>
**Ata de origem:** <ata-AAAAMMDD-CICLO-descricao-curta.md>
**Origem:** <ata / testes / operação / infraestrutura / relatório externo>
**Sistema:** <nome do sistema>
**Fase:** <estabilização operacional | manutenção corretiva | manutenção evolutiva | ajuste técnico>

---

## 1. Contexto

Explicar:
- por que este ESM foi criado
- que fase do projeto motivou sua abertura
- se trata estabilização operacional, manutenção corretiva, melhoria de performance, ajuste técnico ou evolução funcional

---

## 2. Correções

### COR-001 — <título curto do item>

**Módulo:** <módulo afetado>  
**Descrição:** <descrever o problema com precisão factual>  
**Resultado esperado:** <descrever o comportamento correto após implementação>

---

### COR-002 — <título curto do item>

**Módulo:** <módulo afetado>  
**Descrição:** <descrever o problema com precisão factual>  
**Resultado esperado:** <descrever o comportamento correto após implementação>

---

## 3. Ajustes

### AJU-001 — <título curto do item>

**Descrição:** <refinamento esperado>  
**Resultado esperado:** <comportamento esperado após ajuste>

---

### AJU-002 — <título curto do item>

**Descrição:** <refinamento esperado>  
**Resultado esperado:** <comportamento esperado após ajuste>

---

## 4. Regras de negócio

### RN-001 — <título curto da regra>

**Descrição:** <regra operacional ou funcional>  
**Resultado esperado:** <efeito esperado no sistema>

---

## 5. Evoluções

### EVO-001 — <título curto da evolução>

**Descrição:** <nova capacidade ou ampliação funcional>  
**Resultado esperado:** <resultado esperado após implementação>

---

## 6. Observações finais

Explicar:
- o que este ESM formaliza
- o que ainda depende de decisão externa
- o que não altera automaticamente no escopo contratual
- que itens deverão migrar para documentos vivos após consolidação
```

### **Template de item individual do ESM**

```markdown
### <PREFIXO>-NNN — <título curto do item>

**Módulo:** <módulo afetado>  
**Descrição:** <problema, ajuste, regra ou evolução descrita de forma objetiva>  
**Resultado esperado:** <comportamento correto após implementação>

<opcional: observação complementar, restrição, exceção operacional ou nota de uso>
```

### **Template completo do ESM**

```markdown
# ESM — Especificação de Manutenção do Sistema

**Data:** <AAAA-MM-DD>
**Ciclo:** <000 | 001 | 002 | ...>
**Ata de origem:** <ata-AAAAMMDD-CICLO-descricao-curta.md>
**Origem:** <origem>
**Sistema:** <nome>
**Fase:** <fase do projeto>

---

## 1. Contexto
<texto>

## 2. Correções
### COR-001 — ...
...

## 3. Ajustes
### AJU-001 — ...
...

## 4. Regras de negócio
### RN-001 — ...
...

## 5. Evoluções
### EVO-001 — ...
...

## 6. Observações finais
<texto>
```

### **Observações**

O ESM deve mostrar claramente os itens novos, sua categoria e sua origem, observando os seguintes critérios:

* separação por blocos de correções, ajustes, regras e evoluções;
* formulação em termos de comportamento esperado;
* origem explícita em reunião, não conformidade, operação ou infraestrutura;
* uso do ESM como histórico formal de evolução pós-entrega.

---

## **C.5 Template — Registro de Entrega (`leg`)**

O registro de entrega é um artefato central da metodologia. Ele não é apenas um diário de entrega; registra o ciclo consolidado, preserva o que foi efetivamente entregue, absorve itens novos e mantém estatísticas do período, enquanto a tabela consolidada do estado atual passa a viver em `situacao-atual.md`.

### **Nome do arquivo**

```text
leg-AAAAMMDD-CICLO-descricao-curta.md
```

### **Estrutura recomendada**

```markdown
# Registro de Entrega do Projeto

**Sistema:** <nome do sistema>
**Cliente:** <cliente>
**Fornecedor:** <fornecedor>
**Data de referência:** <AAAA-MM-DD>
**Ciclo:** <000 | 001 | 002 | ...>
**Ata de origem:** <ata-AAAAMMDD-CICLO-descricao-curta.md>

---

## 1. Objetivo

Descrever o objetivo do ciclo.

---

## 2. Entregas

| ID | Tipo | Nome | Origem | Status |
|----|------|------|--------|--------|

---

## 3. Resultado

Síntese do que realmente foi consolidado.

---

## 4. Novos

| ID | Tipo | Nome | Origem | Status |
|----|------|------|--------|--------|

Se não houver novos itens, manter a seção e registrar tabela vazia ou observação objetiva.

---

## 5. Documentos

Ata:
- <ata relacionada>

Ata complementar:
- <ata complementar, se houver>

ESM:
- <esm relacionado, se houver>

ADR:
- <adr relacionado, se houver>

Outros:
- <documentos adicionais, se houver>

---

## 6. Estatística

Total itens entregues: **N**
Total itens pendentes: **N**
Percentual de entrega: **X%**
```

### **Observações metodológicas**

O `leg-AAAAMMDD-CICLO-descricao-curta.md` deve ser o documento que:

* preserva a cadeia causal do ciclo documental;
* absorve itens novos surgidos de atas, validações e ESMs;
* registra a consolidação efetiva do ciclo;
* não substitui o documento vivo `situacao-atual.md`.

Quando houver necessidade excepcional, pode existir complemento explícito do ciclo, mantendo a mesma lógica de registro histórico, por exemplo:

```text
leg-AAAAMMDD-CICLO-descricao-curta-complementar.md
```

---

## **C.6 Template — Visão e Escopo**

O documento de visão e escopo deve cumprir ao menos quatro funções: definir objetivo, contexto, perfis e limites contratuais, além de separar claramente escopo incluído e fora de escopo.

```markdown
# Visão e Escopo

## <nome do sistema>

---

## 1. Objetivo do Sistema
Descrever a finalidade principal do sistema.

## 2. Contexto
Descrever:
- organização contratante
- origem dos dados
- ambiente operacional
- limites de responsabilidade do sistema

## 3. Perfis de Usuário

### 3.1 <perfil>
Responsabilidades

### 3.2 <perfil>
Responsabilidades

### 3.3 <perfil>
Responsabilidades

## 4. Funcionalidades Incluídas no Escopo

### 4.1 <tema funcional>
Descrever funcionalidades, regras e limites operacionais.

### 4.2 <tema funcional>
Descrever funcionalidades, regras e limites operacionais.

### 4.3 <tema funcional>
Descrever funcionalidades, regras e limites operacionais.

## 5. Fora de Escopo

### 5.1 Infraestrutura e ambientes
### 5.2 Implantação e publicação
### 5.3 DevOps e automação
### 5.4 Bases de dados e conteúdo
### 5.5 Softwares e serviços de terceiros
### 5.6 Suporte e treinamento
### 5.7 Alterações de escopo

## 6. Consideração Final

Explicar:
- o que não altera automaticamente o contrato
- papel das atas
- papel do ESM durante estabilização
- limites de alteração automática do documento
```

Esse modelo é coerente com a estrutura recomendada para documentos de visão e escopo na metodologia.

---

## **C.7 Template — Requisitos Funcionais**

O documento de requisitos funcionais deve trabalhar com RF numerado, descrição, regras, funcionalidades, dados envolvidos, critérios mínimos de aceite e definições pendentes, além de seção final de evolução pós-entrega.

```markdown
# Requisitos Funcionais (RF)

## <nome do sistema>

> **Status do documento:** <rascunho | inicial | consolidado | atualizado>
> **Observação importante:** <descrever o estágio do documento e a política para definições pendentes>

---

## RF-01 — <nome do requisito>

### Descrição
Descrever o comportamento funcional esperado.

### Regras
- regra 1
- regra 2
- regra 3

### Funcionalidades
- funcionalidade 1
- funcionalidade 2

### Dados envolvidos
- entidades
- campos
- perfis

### Critérios mínimos de aceite
- critério 1
- critério 2

### Definições pendentes (quando houver)
- item pendente 1
- item pendente 2

---

## RF-02 — <nome do requisito>

### Descrição
Descrever o comportamento funcional esperado.

### Regras
- regra 1
- regra 2

### Funcionalidades
- funcionalidade 1
- funcionalidade 2

### Dados envolvidos
- entidades
- campos
- perfis

### Critérios mínimos de aceite
- critério 1
- critério 2

### Definições pendentes (quando houver)
- item pendente 1

---

## Evoluções Pós-Entrega e Ajustes Operacionais

Explicar:
- que o ESM é o mecanismo oficial de evolução
- que itens de ESM não alteram automaticamente o escopo base
- quando um ESM vira requisito consolidado
```

Esse formato é coerente com o padrão recomendado para requisitos funcionais na metodologia.

---

## **C.8 Template — Requisitos Não Funcionais**

O documento de requisitos não funcionais deve ser organizado por temas como segurança, performance, auditoria, observabilidade, disponibilidade, usabilidade, manutenibilidade, conformidade e SLA.

```markdown
# Requisitos Não Funcionais (RNF)

## <nome do sistema>

> **Status do documento:** <status>
> **Observação:** <descrição do estágio do documento>

---

## RNF-01 — Segurança

### Descrição
Descrever o objetivo não funcional do tema.

### Requisitos
- requisito 1
- requisito 2
- requisito 3

### Definições pendentes
- item pendente 1
- item pendente 2

---

## RNF-02 — Performance e Capacidade

### Descrição
Descrever o objetivo não funcional do tema.

### Requisitos
- requisito 1
- requisito 2

---

## RNF-03 — Auditoria

### Descrição
Descrever o objetivo não funcional do tema.

### Requisitos
- requisito 1
- requisito 2

---

## RNF-04 — Observabilidade e Logs

### Descrição
Descrever o objetivo não funcional do tema.

### Requisitos
- requisito 1
- requisito 2

---

## RNF-05 — Disponibilidade e Resiliência

### Descrição
Descrever o objetivo não funcional do tema.

### Requisitos
- requisito 1
- requisito 2

---

## RNF-06 — Usabilidade

### Descrição
Descrever o objetivo não funcional do tema.

### Requisitos
- requisito 1
- requisito 2

---

## RNF-07 — Manutenibilidade

### Descrição
Descrever o objetivo não funcional do tema.

### Requisitos
- requisito 1
- requisito 2

---

## RNF-08 — Conformidade Legal e LGPD

### Descrição
Descrever o objetivo não funcional do tema.

### Requisitos
- requisito 1
- requisito 2

### Definições pendentes
- item pendente 1

---

## RNF-09 — SLA e Suporte

### Descrição
Descrever o objetivo não funcional do tema.

### Definições pendentes
- item pendente 1

---

## Consideração Final
Registrar limites, pendências e política de atualização do documento.
```

Esse modelo é coerente com a organização temática recomendada para requisitos não funcionais na metodologia.

---

## **C.9 Template — Modelo de Dados**

O documento normalmente é extenso e deve mostrar: visão geral, entidades, regras, relacionamentos, importação, domínios, índices, segurança, itens dependentes de definição externa e consideração final.

```markdown
# Modelo de Dados

> **Status:** <status>
> **Objetivo:** <objetivo do documento>
> **Observação:** <fontes, limites e notas de leitura>

---

## 1. Visão Geral
Descrever os grandes blocos do modelo.

## 2. Entidades Principais

### 2.1 <Entidade>
#### Campos mínimos
- campo 1
- campo 2
- campo 3

#### Regras
- regra 1
- regra 2

### 2.2 <Entidade>
#### Campos mínimos
- campo 1
- campo 2

#### Regras
- regra 1
- regra 2

## 3. Relacionamentos (Resumo)
- relacionamento 1
- relacionamento 2

## 4. Importação de Dados

### 4.1 <processo>
Descrever o fluxo.

### 4.2 <staging>
Descrever o papel da staging.

### 4.3 <regras de consolidação>
Descrever as regras de transformação, atualização e integridade.

## 5. Restrições e Índices Recomendados

### Restrições
- restrição 1
- restrição 2

### Índices
- índice 1
- índice 2

## 6. Auditoria e Segurança

### EventoAuditoria
Descrever a entidade ou o mecanismo.

### Sessão / tokens / integridade
Descrever as regras principais.

## 7. Tabelas de Domínio

### 7.1 <domínio>
- valor 1
- valor 2

### 7.2 <domínio>
- valor 1
- valor 2

## 8. Itens de Ajuste Dependentes de Fonte Externa
- item 1
- item 2

## 9. Consideração Final
Registrar limites, hipóteses e política de revisão do documento.
```

---

## **C.10 Template — README documental do projeto**

O README documental funciona como documento orientador da pasta `docs`, definindo papel da documentação, estrutura e convenções.

````markdown
# Documentação do Projeto

Breve descrição do projeto.

## Objetivo da Documentação
- registrar o que foi contratado
- registrar o que foi entendido e consolidado
- evitar ambiguidades
- dar rastreabilidade
- apoiar desenvolvimento, aceite, auditoria e manutenção futura

## Estrutura Recomendada
```text
docs/
...
````

## Tipos de Documentos

### Entendimento Inicial

### Visão e Escopo

### Requisitos

### ADR

### Atas

### ESM

### Log de Entregas

### Situação Atual

## Boas Práticas

* um arquivo por tema
* não sobrescrever decisões antigas
* preferir Markdown
* registrar o que, quando, por quem e impacto

## Convenção de nomenclatura obrigatória

* ata-AAAAMMDD-CICLO-descricao.md
* adr-AAAAMMDD-CICLO-descricao.md
* esm-AAAAMMDD-CICLO.descricao.md
* leg-AAAAMMDD-CICLO-descricao.md

## Regra de Ouro

> Código muda. Documento explica por quê.

````

---

## **C.11 Convenções de nomenclatura consolidadas**

Com base no material real e na lógica da metodologia, a convenção recomendada fica:

```text
ata-AAAAMMDD-CICLO-descricao-curta.md
adr-AAAAMMDD-CICLO-descricao-curta.md
esm-AAAAMMDD-CICLO-descricao-curta.md
leg-AAAAMMDD-CICLO-descricao-curta.md
````

Obs: A descrição curta é opcional, embora fortemente recomendada.

Nos documentos vivos e de referência:

```text
entendimento-inicial.md
visao-e-escopo.md
requisitos-funcionais.md
requisitos-nao-funcionais.md
modelo-de-dados.md
situacao-atual.md
readme.md
```

---

## **C.12 Observação metodológica final**

Os templates acima não foram desenhados como formulários meramente descritivos, mas como **mecanismos de preservação de causalidade, consolidação e continuidade técnica**. Na MEDE, sua função é estruturar artefatos com papéis distintos e complementares: registro causal, decisão estrutural, manutenção evolutiva, baseline inicial, reconstrução histórica da execução e consolidação do estado atual da solução.

---

# **ANEXO D — Convenções de Organização e Nomenclatura**

Este anexo formaliza as convenções de organização física, nomeação e classificação dos artefatos da Metodologia de Engenharia Documental Evolutiva (MEDE). Seu objetivo é garantir previsibilidade estrutural, ordenação temporal, legibilidade por humanos, legibilidade por máquina, rastreabilidade causal e preservação histórica da evolução do projeto. A necessidade dessas convenções aparece de forma explícita tanto no README documental do projeto quanto na estrutura real da pasta `docs/`, que distingue documentos vivos, documentos históricos de referência, atas, decisões arquiteturais, especificações de manutenção e registros históricos de entrega. [11]

---

## **D.1 Princípio geral**

Na MEDE, a organização do espaço documental não é detalhe operacional secundário. Ela faz parte da própria metodologia, pois influencia diretamente:

* a inteligibilidade da solução;
* a rastreabilidade entre decisão e evolução;
* a preservação da memória histórica do projeto;
* a capacidade de navegação por novos integrantes;
* e a possibilidade de automação futura por ferramentas.

Por essa razão, nomes de arquivos, diretórios e categorias documentais devem obedecer a regras estáveis e explícitas, evitando convenções informais, renomeações arbitrárias e agrupamentos sem função metodológica clara.

---

## **D.2 Diretório raiz da documentação**

Toda a documentação do projeto deve ser mantida em um diretório raiz dedicado, denominado:

```text
docs/
```

Esse diretório deve ser versionado juntamente com o repositório do sistema, sendo tratado como parte do ativo técnico do projeto e não como material externo ou acessório. Essa prática está alinhada ao README documental e à estrutura observada no projeto, em que a pasta `docs/` funciona como fonte de verdade documental. [11]

---

## **D.3 Separação estrutural entre documentos vivos, documentos históricos de referência e documentos históricos evolutivos**

A organização da pasta `docs/` deve separar explicitamente:

1. **documentos vivos**, que representam o estado atual consolidado do sistema;
2. **documentos históricos de referência**, que preservam entendimento e planejamento inicial;
3. **documentos históricos evolutivos**, que preservam reuniões, decisões, manutenção e entregas já registradas.

A estrutura recomendada é:

```text
docs/
|
|   entendimento-inicial.md
|   modelo-de-dados.md
|   readme.md
|   requisitos-funcionais.md
|   requisitos-nao-funcionais.md
|   situacao-atual.md
|   visao-e-escopo.md
|
+---atas-de-reuniao
|
+---decisoes-arquiteturais
|
+---especificacao-manutencao-sistema
|
\---log-entregas
```

Essa forma de organização está coerente com a prática observada na documentação real do projeto e materializa, no próprio sistema de arquivos, a distinção entre memória histórica, referências congeladas e estado vigente da solução. [11]

---

## **D.4 Convenções para documentos vivos**

Os documentos vivos devem permanecer diretamente na raiz de `docs/`, com nomes estáveis, sem data no nome e sem numeração artificial. Isso ocorre porque tais documentos representam o entendimento vigente do sistema e precisam ser encontrados rapidamente, sem obrigar o leitor a identificar qual é a “versão mais recente” pelo nome do arquivo.

Os nomes recomendados são:

```text
visao-e-escopo.md
requisitos-funcionais.md
requisitos-nao-funcionais.md
modelo-de-dados.md
situacao-atual.md
readme.md
```

Esses nomes devem ser preservados ao longo do projeto. Quando o conteúdo evoluir, a atualização deve ocorrer dentro do mesmo arquivo, com versionamento provido pelo sistema de controle de versão e pela cadeia causal da metodologia, e não por duplicação de nomes como `requisitos-v2.md` ou `modelo-de-dados-final.md`.

---

## **D.5 Convenções para documentos históricos de referência**

A versão atual da MEDE admite documentos históricos de referência diretamente na raiz de `docs/`, quando eles preservam a concepção inicial do projeto e não devem ser continuamente reescritos.

Os nomes recomendados são:

```text
entendimento-inicial.md
```

### **Função metodológica**

* `entendimento-inicial.md` preserva a baseline epistemológica inicial do projeto, incluindo visão inicial, premissas, backlog inicial e planejamento inicial de entregas.
* a comparação entre planejamento e realizado passa a ser observável na articulação entre `entendimento-inicial.md`, `log-entregas/` e `situacao-atual.md`.

### **Regras obrigatórias**

1. esses documentos permanecem na raiz de `docs/`;
2. seus nomes são estáveis e sem data no nome;
3. após consolidados, não devem ser reescritos como documentos vivos;
4. revisões posteriores do entendimento do sistema devem ser absorvidas pelos documentos vivos e pela cadeia causal da metodologia, e não pela substituição desses artefatos históricos.

---

## **D.6 Convenções para atas de reunião**

As atas são documentos históricos e congelados. Sua nomenclatura deve preservar simultaneamente:

* tipo do artefato;
* data do evento;
* e descrição curta do assunto.

O padrão obrigatório é:

```text
ata-AAAAMMDD-CICLO-descricao-curta.md
```

Exemplos reais observados incluem nomes como:

* `ata-20260113-000-reuniao-geral.md`
* `ata-20260223-007-reuniao-operacional.md`
* `ata-20260302-009-consolidacao-com-agente-llm.md`

### **Regras obrigatórias**

1. toda ata deve iniciar com o prefixo `ata-`;
2. toda ata deve conter data no formato `AAAAMMDD`;
3. toda ata deve conter número de ciclo com pelo menos tres digitos `000`;
4. a descrição curta deve ser objetiva, sem termos vagos como `reuniao1`, `teste`, `ajustes-diversos`;
5. a data da ata corresponde ao evento decisório que lhe deu origem;
6. o ciclo identifica a ordem causal da consolidação documental;
7. após consolidada, a ata não deve ser renomeada.

### **Regras recomendadas**

1. preferir descrições entre 2 e 8 palavras;
2. usar apenas letras minúsculas, números e hífens;
3. evitar caracteres especiais, acentos e espaços;
4. quando houver duas interações relevantes muito próximas, usar a descrição para distinguir contexto, e não alterar a data de forma artificial.

---

## **D.7 Convenções para Registros de Decisão Arquitetural (ADR)**

Os registros de decisão arquitetural são documentos históricos e congelados. Na ontologia da MEDE, o nome principal é **Registro de Decisão Arquitetural**, mas o prefixo de arquivo permanece `adr`, preservando compatibilidade terminológica e operacional.

O padrão obrigatório é:

```text
adr-AAAAMMDD-CICLO-descricao-curta.md
```

Exemplos reais incluem:

* `adr-20260126-002-modelo-operacional-importacao-e-vistorias.md`
* `adr-20260223-007-online-first-sincronizacao-controlada-e-vistorias.md`
* `adr-20260302-008-reautenticacao-online-com-operacao-controlada-no-tablet.md`

### **Regras obrigatórias**

1. todo arquivo de decisão arquitetural deve iniciar com `adr-`;
2. deve conter a data da decisão consolidada;
3. deve conter o ciclo documental da ata que originou ou consolidou a decisão;
4. deve conter descrição curta suficiente para indicar o tema da decisão;
5. o nome do arquivo não deve ser convertido para numeração sequencial isolada sem data, pois isso reduz inteligibilidade temporal.

### **Regras recomendadas**

1. o nome deve refletir o objeto principal da decisão, e não detalhes periféricos;
2. quando a decisão tiver subtópicos internos, não se deve multiplicar ADRs artificialmente; o nome deve refletir o núcleo decisório;
3. se uma decisão for substituída, deve-se criar novo ADR, e não reescrever o nome do antigo.

---

## **D.8 Convenções para Especificações de Manutenção do Sistema (ESM)**

As ESMs também são documentos históricos e congelados, usados para formalizar correções, ajustes, regras e evoluções decorrentes de uso real, homologação, estabilização ou manutenção.

O padrão mínimo obrigatório é:

```text
esm-AAAAMMDD-CICLO.md
```

Exemplos reais incluem:

* `esm-20260302-008.md`
* `esm-20260306-009-ajustes-gerados-com-agente-llm.md`
* `esm-20260309-010.md`

### **Regras obrigatórias**

1. todo arquivo de manutenção deve iniciar com `esm-`;
2. deve conter a data do evento que originou a consolidação da manutenção;
3. o nome padrão não precisa conter descrição curta se o conteúdo do documento já for suficientemente delimitado pela data e pelo contexto.

### **Regra opcional**

Em projetos com múltiplos ESMs no mesmo dia, admite-se:

```text
esm-AAAAMMDD-CICLO-descricao-curta.md
```

Por exemplo:

```text
esm-20260309-010-estabilizacao-dashboard.md
esm-20260309-011-ajustes-pos-homologacao.md
```

Essa extensão só deve ser usada quando realmente necessária para evitar ambiguidade.

---

## **D.9 Convenções para registros históricos de entrega (`leg`)**

Os registros de entrega são documentos históricos e congelados, armazenados em diretório próprio. Na versão atual da MEDE, o `log-entregas` deixa de ser documento vivo único e passa a ser um **diretório histórico** cujos arquivos registram a consolidação de cada ciclo de entrega. [11]

O padrão obrigatório é:

```text
leg-AAAAMMDD-CICLO.md
```

Exemplos reais incluem:

* `leg-20260126-002.md`
* `leg-20260223-007-semana-05.md`
* `leg-20260302-008.md`

### **Regras obrigatórias**

1. todo arquivo de entrega deve iniciar com `leg-`;
2. deve conter a data de referência da entrega;
3. deve conter o ciclo documental correspondente;
4. deve existir no máximo um `leg` ordinário por ciclo;
5. após consolidado, não deve ser renomeado nem sobrescrito.

### **Regra opcional**

Quando houver necessidade excepcional de complemento do ciclo, admite-se:

```text
leg-AAAAMMDD-CICLO-descricao-curta.md
```

Essa extensão só deve ser usada quando houver justificativa documental clara, como consolidação complementar ou absorção extraordinária formalmente registrada.

---

## **D.10 Convenções de diretórios históricos**

Os diretórios históricos devem ter nomes semânticos, estáveis e em português, refletindo sua função metodológica. Recomenda-se:

```text
atas-de-reuniao/
decisoes-arquiteturais/
especificacao-manutencao-sistema/
log-entregas/
```

Esses nomes aparecem de forma consistente na documentação analisada. [11]

### **Regras obrigatórias**

1. o nome do diretório deve refletir a natureza do artefato, não sua tecnologia;
2. diretórios históricos não devem misturar tipos diferentes de documentos;
3. a criação de novos diretórios deve ser excepcional e justificada por função documental distinta.

### **Evitar**

* `geral/`
* `outros/`
* `antigos/`
* `documentos-diversos/`
* `reunioes/` quando o padrão adotado já é `atas-de-reuniao/`

---

## **D.11 Convenções de escrita para nomes de arquivos**

Todos os arquivos devem seguir as seguintes regras lexicais:

### **Obrigatórias**

1. usar apenas letras minúsculas;
2. separar palavras com hífen (`-`);
3. usar extensão `.md`;
4. não usar espaços;
5. não usar caracteres especiais decorativos.

### **Recomendadas**

1. evitar acentos;
2. evitar abreviações obscuras;
3. evitar nomes excessivamente longos;
4. manter coerência vocabular entre arquivos do mesmo projeto.

### **Exemplos corretos**

```text
visao-e-escopo.md
situacao-atual.md
ata-2026-03-09-reuniao-operacional.md
adr-2026-02-23-online-first-sincronizacao-controlada-e-vistorias.md
leg-2026-03-02-semana-06.md
```

### **Exemplos a evitar**

```text
visão e escopo final.md
RequisitosFuncionais.md
ata_final_09marco.doc
ADRnovo.md
ajustes diversos março.md
```

---

## **D.12 Convenções de classificação interna de itens**

Além da nomenclatura de arquivos, a MEDE recomenda padronização da taxonomia interna de itens, especialmente em ESMs, registros de entrega e situação atual.

O padrão de identificação formal de itens rastreáveis é:

```text 
<DOC>-<AAAAMMDD>-<CICLO>-<NAT>-<TIP>-<NNNN>
```

Exemplos:

```text 
DEI-20260201-000-RF-BLI-0001 
ESM-20260301-001-RF-COR-0001 
ESM-20260301-001-UX-AJU-0003 
ESM-20260301-001-AR-EVO-0002 
LEG-20260310-003-OP-COR-0002 
SAT-20260315-005-AR-EVO-0001
```

### Natureza

* **RF** — requisito funcional
* **NF** — requisito não funcional
* **RN** — regra de negócio
* **UX** — interface ou experiência do usuário
* **OP** — operação
* **AR** — arquitetura, integração ou dados

### Tipo

* **BLI** — backlog inicial
* **COR** — correção
* **AJU** — ajuste
* **EVO** — evolução

### Tags auxiliares

As tags auxiliares não substituem a classificação formal, mas adicionam sinalização operacional:

* **HOT** — demanda quente, urgente ou crítica
* **PERF** — performance
* **SEC** — segurança
* **MIG** — migração

### Status possíveis

* **Pendente**
* **Cancelado**
* **Concluído**
* **Esclarecido**
* **Aguardando**

### **Regras obrigatórias**

1. toda classificação interna deve ter significado estável ao longo do projeto;
2. a mesma sigla não deve mudar de sentido entre documentos;
3. os identificadores formais são imutáveis;
4. descrição, status, tags e classificação operacional podem evoluir, mas o ID não deve ser alterado;
5. `situacao-atual.md` e os arquivos `leg-*` devem reutilizar essas categorias de forma coerente ao consolidar itens.

---

## **D.13 Convenções para identificadores internos de itens**

Quando o projeto adotar identificadores internos de backlog, manutenção ou evolução, deve-se usar o padrão formal:

```text
<PREFIXO><AAAAMMDD>-<CICLO>-<CATEGORIA>-<NNN>
```

ou, quando houver backlog base independente de data:

```text
BL-001
BL-002
```

Exemplos observados na documentação incluem:

* `BL-001`
* `ESM260224-001-COR-001`
* `ESM260224-001-EVO-003`
* `ESM260309-005-AJU-023`

### **Regras recomendadas**

1. backlog inicial deve usar DEI como documento de origem quando vier do entendimento inicial;
2. itens originados de ESM devem preservar referência ao ESM de origem;
3. itens consolidados por entrega podem usar LEG quando a entrega for o evento de formalização;
4. itens consolidados na situação atual podem usar SAT quando a situação atual for o primeiro ponto de formalização;
5. a natureza e o tipo do item devem estar embutidos no identificador.

### Exemplo de tabela consolidada em situacao-atual.md

O documento situacao-atual.md representa a visão consolidada e vigente do backlog rastreável do projeto. Recomenda-se que ele contenha uma tabela com, no mínimo, os seguintes campos:

```text 
ID | Descrição | Tags | Ata | Origem | Entrega | Status 
DEI-20260201-000-RF-BLI-0001 | Autenticação online por CPF e senha | | ata-20260101-000 | entendimento-inicial | leg-20260206 | Concluído 
ESM-20260301-001-UX-AJU-0003 | Regra de habilitação do campo Tipo de Edificação | | ata-20260301-001 | esm-20260301-001 | | Pendente 
ESM-20260301-001-AR-EVO-0002 | Paginação da listagem de endereços | MIG, PERF | ata-20260301-001 | esm-20260301-001 | | Pendente 
ESM-20260220-004-OP-COR-0004 | Remoção de setor de agente em ambiente offline | HOT | ata-20260220-004 | esm-20260220-004 | leg-20260228 | Concluído 
---

## **D.14 Convenções para referências cruzadas**

Sempre que possível, um documento deve citar explicitamente os artefatos relacionados.

### **Exemplos de referência cruzada recomendada**

* ata referenciando ESM e ADR a serem criados;
* ADR referenciando ata de origem;
* ESM referenciando ata e documento funcional afetado;
* `leg-*` referenciando ata, ESM, ADR e outros documentos do ciclo;
* `situacao-atual.md` preservando a visão consolidada dos itens e de sua situação vigente;
* visão e escopo deixando claro que ESM não altera automaticamente o escopo contratual.

### **Regras recomendadas**

1. referências cruzadas devem usar o nome exato do arquivo;
2. sempre que houver impacto documental, ele deve ser explicitado;
3. o registro histórico da entrega deve permanecer separado da fotografia atual consolidada do projeto.

---

## **D.15 Convenções para imutabilidade e versionamento**

A MEDE distingue documentos congelados e documentos vivos.

### **Documentos congelados**

* atas
* ADRs
* ESMs
* arquivos `leg-*`
* `entendimento-inicial.md`

### **Documentos vivos**

* visão e escopo
* requisitos funcionais
* requisitos não funcionais
* modelo de dados
* readme
* situação atual

### **Regra obrigatória**

Documentos congelados **não devem ser sobrescritos nem renomeados** após consolidação. Essa diretriz aparece explicitamente no README documental e é coerente com a lógica causal da metodologia. [11]

### **Regra recomendada**

Quando um entendimento histórico precisar ser corrigido, deve-se criar novo documento ou novo registro correlato, em vez de apagar o anterior.

---

## **D.16 Convenções para extensibilidade**

A metodologia admite ampliação da estrutura documental, mas essa ampliação deve obedecer a critérios de necessidade real.

### **Criar novo diretório ou novo tipo documental apenas quando:**

1. houver função epistemológica distinta;
2. o novo artefato não puder ser absorvido com clareza por ata, ADR, ESM, `leg-*` ou documento vivo existente;
3. a nova estrutura não quebrar a inteligibilidade do repositório.

### **Exemplos admissíveis**

* `modelos-e-diagramas/`
* `anexos-contratuais/`
* `evidencias-de-homologacao/`

### **Exemplos inadequados**

* criar um novo tipo documental só porque um time prefere outro nome;
* duplicar conteúdo entre diretórios com funções equivalentes;
* mover documentos históricos para “arquivo morto”.

---

## **D.17 Regra de ouro**

A convenção de organização e nomenclatura da MEDE pode ser resumida pela seguinte regra:

> **o nome do artefato deve permitir inferir o que ele é, quando surgiu e qual papel exerce na evolução do projeto.**

Se um arquivo não permite ao leitor responder essas três perguntas, sua nomeação provavelmente está inadequada.

---

## **D.18 Síntese final**

As convenções aqui descritas não têm função meramente estética. Elas operam como gramática estrutural da MEDE, sustentando:

* ordenação temporal;
* preservação histórica;
* atualização controlada;
* leitura humana rápida;
* leitura automatizável;
* e reconstrução futura do conhecimento do sistema.

A documentação analisada demonstra que essas convenções não são artificiais: elas emergem diretamente do uso consistente da metodologia em projeto real, no qual a pasta `docs/` funciona como espaço organizado de causalidade, evolução e memória do software. [11]

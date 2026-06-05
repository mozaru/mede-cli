---
title: "Adotando a MEDE em um projeto existente"
order: 16
---

# Capítulo 16 — Adotando a MEDE em um projeto existente

O cenário mais comum não é o projeto novo. É o projeto que já existe há meses ou anos, com dívida epistemológica acumulada, documentação desatualizada ou inexistente, e uma equipe que sabe que o problema existe mas não sabe por onde começar a resolver.

A boa notícia: a MEDE pode ser adotada em projetos existentes. A má notícia honesta: não dá para recuperar o passado completamente. Mas é possível estabelecer um ponto de partida claro e garantir que daqui para frente o conhecimento seja preservado.

---

## A armadilha da reconstrução total

O impulso mais comum quando se decide adotar a MEDE num projeto existente é tentar reconstruir todo o histórico: documentar todas as decisões que foram tomadas, escrever as atas que deveriam ter sido escritas, registrar os ADRs de todas as escolhas arquiteturais passadas.

Esse impulso é compreensível — e quase sempre é uma armadilha.

Reconstruir o histórico de um projeto longo a partir da memória das pessoas que participaram é caro, demorado, e produz documentação de qualidade duvidosa. Memórias são seletivas. O contexto que tornava uma decisão óbvia em 2022 pode ter se perdido. O que as pessoas lembram é frequentemente o resultado, não o raciocínio.

Documentação reconstituída tem um problema adicional: ninguém sabe com certeza o quanto é precisa. Se as atas e ADRs foram escritos durante o evento, são confiáveis. Se foram escritos dois anos depois a partir da memória, têm um nível de confiabilidade diferente — e misturar os dois sem distinção é enganoso.

A MEDE não precisa do passado completo. Ela precisa de um ponto de partida honesto e de rigor a partir daí.

---

## A estratégia de adoção incremental

**Etapa 1 — Diagnóstico**

Antes de escrever qualquer documento, entenda o que existe e o que está faltando:

- Que documentação existe? Em que estado está?
- Quais são os pontos de maior perda de conhecimento — onde estão as áreas do sistema que menos se consegue explicar?
- Quem ainda detém conhecimento crítico que não está documentado?
- Qual é o ritmo atual de mudanças — a que velocidade o sistema está evoluindo?

O diagnóstico não precisa ser formal. Uma conversa com os membros da equipe sobre "o que você precisaria saber para manter este sistema se toda a equipe fosse substituída amanhã" frequentemente revela os pontos críticos rapidamente.

**Etapa 2 — Criar o entendimento inicial com o estado atual**

O `entendimento-inicial.md` num projeto existente não registra o estado do início do projeto — registra o melhor entendimento disponível hoje.

Isso pode parecer estranho — afinal, o entendimento inicial deveria ser do início. Mas num projeto existente sem documentação, o "início" perdido não pode ser recuperado com fidelidade. O que pode ser feito é estabelecer uma baseline honesta: "este é o que sabemos sobre o sistema em março de 2026, quando adotamos a MEDE". Esse documento nunca será alterado — funcionará como ponto de referência para tudo que vier depois.

**Etapa 3 — Criar os documentos vivos com o conhecimento atual**

Com o entendimento inicial estabelecido, crie as versões iniciais dos documentos vivos — visão e escopo, requisitos, modelo de dados, situação atual — com o melhor conhecimento disponível hoje.

Esses documentos serão incompletos e provavelmente terão imprecisões. Isso é aceitável. O objetivo não é ter documentação perfeita no dia da adoção — é ter um ponto de partida que pode ser refinado nos ciclos seguintes.

**Etapa 4 — Registrar as decisões estruturais ainda relevantes**

Algumas decisões arquiteturais do passado ainda moldam o sistema de forma significativa — e seria valioso ter registros formais delas, mesmo que reconstituídos.

A seleção deve ser criteriosa: apenas decisões que (a) ainda afetam a estrutura atual do sistema, (b) seriam questionadas por qualquer desenvolvedor novo que chegasse ao projeto, e (c) têm alternativas plausíveis que foram descartadas por razões que não estão documentadas em lugar nenhum.

Esses ADRs retroativos devem ser claramente marcados como reconstituídos — com nota de que foram documentados após o fato, a partir da memória dos participantes. Isso preserva a honestidade do acervo.

**Etapa 5 — Iniciar os ciclos a partir daí**

Com a baseline estabelecida, os ciclos documentais começam. A partir desse ponto, tudo o que acontecer — decisões novas, mudanças de entendimento, incidentes, evoluções — é capturado de forma prospectiva, não retrospectiva.

---

## O que esperar na transição

**Os primeiros ciclos serão mais trabalhosos.** A equipe ainda está desenvolvendo o hábito, os documentos vivos iniciais terão lacunas que surgirão durante os primeiros ciclos, e haverá discussão sobre o que vai e o que não vai para cada artefato.

**O acervo começa a ter valor após o segundo ou terceiro mês.** É o tempo necessário para que os ciclos produzam um histórico suficiente para contar uma história — para que alguém novo possa chegar, ler os artefatos em ordem e entender a trajetória do projeto.

**A dívida epistemológica passada não desaparece imediatamente.** Partes do sistema que existiam antes da adoção e que não foram documentadas nos ADRs retroativos continuarão sendo opacas. O que muda é que essa opacidade não cresce mais — tudo o que acontece daqui para frente é documentado.

---

## Um caso especial: o projeto em crise epistemológica

Existe uma situação extrema: o projeto em que a perda de conhecimento já causou dano real e a adoção da MEDE é urgente. Equipe nova, sistema incompreensível, e pressão para entregar.

Nesse caso, a sequência muda ligeiramente:

1. **Primeiro:** identificar os membros da equipe (atual ou anterior) que ainda têm conhecimento crítico e conduzir sessões estruturadas de extração de conhecimento. Documentar o resultado como ADRs retroativos, claramente marcados.

2. **Segundo:** criar o entendimento inicial com o estado atual, mesmo que incompleto e com muitas incertezas explicitadas.

3. **Terceiro:** iniciar os ciclos imediatamente — não esperar que os documentos vivos iniciais estejam completos. A completude vem com os ciclos.

4. **Quarto:** usar o `situacao-atual.md` como ferramenta de onboarding para os novos membros da equipe, atualizando-o a cada ciclo com o nível de detalhe necessário para orientar quem está chegando.

A crise não é resolvida em um mês. Mas com esse processo, após dois ou três ciclos, a equipe começa a ter documentação que realmente ajuda — em vez de documentação que só existe para parecer que existe.

---

> **Em resumo**
>
> Adotar a MEDE num projeto existente começa por resistir à tentação de reconstruir o histórico completo — isso é caro, demorado, e produz documentação de qualidade duvidosa. A estratégia correta é: diagnosticar o estado atual, criar um entendimento inicial com o que se sabe hoje (não com o que se sabia no início), criar documentos vivos iniciais com o conhecimento disponível, registrar seletivamente as decisões estruturais passadas ainda relevantes como ADRs retroativos marcados como reconstituídos, e iniciar os ciclos a partir daí. A dívida epistemológica passada não desaparece imediatamente — mas deixa de crescer. O acervo começa a ter valor após dois ou três meses de ciclos regulares.

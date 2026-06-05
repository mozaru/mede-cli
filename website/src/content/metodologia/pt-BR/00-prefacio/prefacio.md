---
title: "Prefácio"
order: 0
---

# Prefácio

Este livro nasceu de uma pergunta que me acompanha há muito tempo.

Não era uma pergunta teórica. Era uma pergunta prática, incômoda, que surgiu repetidas vezes ao longo de décadas trabalhando com desenvolvimento de software — primeiro como desenvolvedor, depois como arquiteto, depois gerindo equipes e projetos de diferentes portes e domínios.

A pergunta é simples: **por que sistemas que funcionam bem deixam de poder ser entendidos?**

Não estou falando de sistemas ruins. Estou falando de sistemas que entregaram valor, que foram construídos por pessoas competentes, que rodaram em produção por anos. E que, em algum momento, tornaram-se opacos. Não para as máquinas — para as máquinas eles continuavam funcionando. Mas para as pessoas. Para o time técnico que precisava mantê-los. Para a empresa que dependia deles e precisava fazê-los evoluir.

Esse fenômeno tem um nome neste livro: **dívida epistemológica**. É diferente da dívida técnica que a indústria já aprendeu a identificar e medir. A dívida epistemológica é mais silenciosa. Ela não aparece nos testes. Não gera alertas no monitoramento. Ela se acumula lentamente, à medida que decisões são tomadas sem registro, que mudanças acontecem sem rastreabilidade, que as pessoas que sabiam o porquê das coisas vão embora levando esse conhecimento consigo.

Quando a dívida epistemológica é alta, o sistema ainda funciona. Ele apenas deixa de ser plenamente governável.

---

A Metodologia de Engenharia Documental Evolutiva — MEDE — é a resposta que fui construindo para esse problema ao longo de anos de prática. A MEDE nasceu do campo, mas dialoga com uma tradição importante da engenharia de software: decisões arquiteturais, evolução de sistemas, complexidade essencial e aprendizagem organizacional. Ela não surgiu pronta de uma revisão bibliográfica — surgiu da observação sistemática de projetos reais: o que se perde, quando se perde, e o que teria sido necessário para não perder. A teoria veio depois, para dar nome e estrutura ao que a prática já havia ensinado.

A MEDE não propõe documentar mais. Propõe documentar de forma diferente — de um jeito que acompanha a evolução do sistema, preserva a causalidade das decisões e mantém o conhecimento acessível mesmo quando as pessoas mudam.

Ela é tecnologicamente neutra. Funciona com qualquer linguagem, qualquer framework, qualquer método de desenvolvimento. Não substitui Scrum, Kanban ou qualquer prática ágil. Não compete com nenhuma ferramenta de gestão. É uma camada transversal de governança documental que pode coexistir com o que você já usa.

---

Este livro é organizado em seis partes.

A **Parte I** nomeia o problema. Se você já sentiu que seu projeto "perdeu a memória", essa parte vai articular o que você provavelmente já percebeu de forma intuitiva.

A **Parte II** explica por que o problema é estrutural — não uma falha de disciplina individual, mas uma consequência previsível da forma como a engenharia de software evoluiu historicamente.

A **Parte III** apresenta a MEDE: seus fundamentos, seus artefatos, seus ciclos e suas regras.

A **Parte IV** mostra a metodologia em uso num projeto real, anonimizado. Não é um exemplo construído para parecer perfeito. É um projeto com mudanças de escopo, decisões que precisaram ser revertidas e entendimentos que evoluíram semana a semana.

A **Parte V** apresenta o mede-cli, a ferramenta open source que automatiza o ciclo documental com supervisão humana.

A **Parte VI** trata da adoção — individual, em equipe e organizacional — e do uso da MEDE como modelo de consultoria.

---

Uma nota sobre o momento em que este livro é escrito.

Estamos em um período em que ferramentas de inteligência artificial generativa tornaram a produção de código dramaticamente mais rápida. Isso é bom. E também expõe uma fragilidade que sempre existiu, mas que antes ficava mascarada pela lentidão natural da implementação manual.

Quando uma equipe consegue gerar código funcional em horas, o gargalo do projeto deixa de ser a velocidade de escrita e passa a ser a qualidade do entendimento sobre o problema. O código fica pronto mais rápido. O conhecimento sobre o que foi feito e por quê não acompanha automaticamente. Em alguns casos, a IA pode até acelerar o acúmulo de dívida epistemológica — gerando código mais depressa do que o entendimento consegue acompanhar.

A MEDE foi desenvolvida exatamente nesse contexto. E acredito que sua relevância só aumenta à medida que a geração automática de código se torna mais presente no cotidiano das equipes.

---

Este livro também foi organizado segundo os princípios da MEDE.

Boa leitura.

**Mozar Baptista da Silva**
Petrópolis, junho de 2026

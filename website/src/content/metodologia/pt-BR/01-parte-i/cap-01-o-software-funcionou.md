---
title: "O software funcionou. O conhecimento não sobreviveu."
order: 1
---

# Capítulo 1 — O software funcionou. O conhecimento não sobreviveu.

Imagine a seguinte situação.

Um sistema está em produção há três anos. Funciona. Os usuários usam. O negócio depende dele. A empresa que o construiu considera o projeto um sucesso.

Então alguém precisa fazer uma mudança. Não uma mudança grande — um ajuste moderado numa regra de negócio que evoluiu com o tempo. O desenvolvedor que vai fazer o trabalho abre o código. Começa a explorar. E depara com algo que vai encontrar em quase todo sistema com alguma idade: um campo no banco de dados chamado `tipo_antigo`. Ninguém sabe o que ele fazia. Ninguém sabe por que foi criado. A documentação disponível — se existe — não menciona. As pessoas que sabiam foram embora.

O desenvolvedor não remove o campo. Não é seguro. Poderia quebrar algo. Então ele trabalha em torno dele, adicionando mais lógica, mais condicionais, mais complexidade — preservando uma peça cujo propósito ninguém conhece, com medo de descobrir que ela ainda importa.

Esse sistema funciona. Mas ele perdeu a memória de si mesmo.

---

## O software como artefato duplo

Todo sistema de software tem duas naturezas simultâneas.

A primeira é operacional: o sistema executa, responde, processa, armazena. Essa natureza é visível, mensurável, testável. Você sabe se o sistema está funcionando porque ele produz resultados observáveis. Pipelines de CI/CD verificam isso. Testes automatizados verificam isso. Monitoramento de produção verifica isso.

A segunda natureza é epistemológica: o sistema carrega, incorporado em sua estrutura, um conjunto de conhecimentos sobre o domínio que ele modela. Conhecimentos sobre as regras do negócio. Sobre as decisões que foram tomadas ao longo do desenvolvimento. Sobre o que foi tentado e descartado. Sobre por que determinadas escolhas foram feitas e não outras.

Essa segunda natureza não é visível da mesma forma. Ela não aparece nos logs. Não é coberta por testes. É fundamentalmente dependente das pessoas que participaram da construção — o que significa que ela se deteriora sempre que essas pessoas saem.

Quando dizemos que um software é bem construído, tendemos a pensar apenas na primeira natureza: ele funciona corretamente, é rápido, tem boa cobertura de testes, segue boas práticas de arquitetura. Mas um software bem construído no sentido pleno precisa preservar também a segunda natureza — precisa ser compreensível, explicável e evolutivo por pessoas que não estavam presentes na sua construção.

É possível ter a primeira natureza sem a segunda. É exatamente o que acontece quando um projeto perde a memória de si mesmo. O código continua funcionando. O conhecimento que o explica não sobrevive.

Um sistema sem memória pode continuar funcionando. Mas deixa de ser plenamente governável.

---

## A ilusão de que o código é a documentação

Existe um argumento que circula há muito tempo em comunidades de desenvolvimento: o código bem escrito é sua própria documentação. Nomes claros, funções coesas, estrutura legível — tudo isso comunica intenção. Para quê duplicar em texto o que já está expresso no código?

Há verdade nessa ideia. Código ruim não é melhorado por documentação que o descreve — é melhorado sendo reescrito. E código realmente claro comunica o que faz de forma muito mais precisa do que qualquer descrição em prosa.

O problema é que o código, por mais claro que seja, comunica muito bem o "o quê" e o "como". Mas raramente preserva, de forma confiável, o "por quê". O "por quê" costuma ficar fora do código — em conversas, em reuniões, em decisões tomadas num contexto que o código não consegue carregar.

Um exemplo simples: o código pode mostrar que uma regra de desconto não se aplica a clientes do tipo X. Mas raramente mostra se isso aconteceu por exigência contratual específica de um cliente importante, por uma restrição fiscal de determinado período, por um bug histórico que foi contornado em vez de corrigido, ou por uma decisão temporária que nunca foi revisada porque "todo mundo sabia que era temporária" — até que todo mundo foi embora.

A diferença importa. Muito.

Se a regra existe por exigência contratual, ela não pode ser removida sem consulta ao cliente. Se existe por restrição fiscal de um período já encerrado, provavelmente deveria ter sido removida há anos. Se é um bug camuflado de regra, remover pode corrigir um problema silencioso. Se era temporária e foi esquecida, a remoção é o comportamento correto.

O código mostra que a regra existe. Dificilmente mostra qual das quatro situações é a verdadeira. Para saber isso, alguém precisa investigar — encontrar a pessoa que sabe, ler e-mails antigos, olhar commits do repositório na esperança de que a mensagem diga algo útil, ou fazer uma suposição e torcer para que esteja certa.

Essa investigação tem custo. E se precisar ser feita toda vez que alguém tocar naquele módulo, o custo se acumula ao longo do tempo de forma significativa.

---

## O que o código raramente consegue carregar

Além do "por quê" das regras individuais, existem categorias inteiras de conhecimento que o código raramente consegue preservar de forma confiável.

**Decisões de arquitetura e suas alternativas.** O código mostra a decisão que foi tomada. Raramente mostra o que foi considerado e descartado. Por que se usou este banco de dados e não aquele? Por que este módulo está separado quando poderia estar integrado? Por que esta API segue este contrato quando outro seria mais simples? Essas escolhas têm história. Sem a história, qualquer um que vier depois pode questionar a decisão sem o contexto que a justificava — ou, pior, mudá-la sem perceber que havia razões sólidas para ela ser do jeito que era.

**Restrições externas que moldaram o sistema.** Às vezes o sistema foi construído de determinada forma não por escolha técnica, mas por restrição de infraestrutura disponível na época, por limitação de orçamento, por prazo que não permitia a solução ideal, por exigência de integração com sistema legado do cliente. Essas restrições desaparecem da visibilidade quando o contexto muda — e o código que elas moldaram fica parecendo uma decisão técnica estranha.

**A evolução do entendimento do domínio.** Sistemas raramente são construídos com entendimento completo do domínio desde o início. O entendimento cresce com o uso, com o feedback dos usuários, com situações que a equipe não havia previsto. Muitas vezes, partes do sistema refletem entendimentos que foram revisados — mas apenas a implementação foi atualizada, não o raciocínio que a sustentava. O código novo é correto. O código antigo que ainda existe "por precaução" já não corresponde ao entendimento atual. E nem sempre é fácil saber qual é qual.

**O que foi tentado e não funcionou.** Uma das fontes mais valiosas de conhecimento num projeto é a memória dos caminhos que foram explorados e abandonados — e por quê. Essa memória costuma existir apenas nas cabeças das pessoas que viveram a experiência. Sem ela, futuros desenvolvedores estão condenados a repetir as mesmas explorações, descobrir os mesmos problemas, e chegar às mesmas conclusões — com o custo de fazer tudo isso novamente, sem saber que já foi feito antes.

---

## A degradação silenciosa

A perda do conhecimento epistemológico num projeto não acontece de uma vez. Ela é gradual, quase imperceptível no cotidiano.

Começa quando a primeira decisão importante é tomada numa reunião e ninguém anota o raciocínio, apenas o resultado. Continua quando um desenvolvedor faz uma mudança "porque faz sentido" sem registrar o contexto que tornou esse sentido visível para ele naquele momento. Avança quando o único membro da equipe que lembrava por que determinada regra existia aceita uma proposta em outra empresa.

Em cada um desses momentos, o sistema continua funcionando exatamente da mesma forma. Nenhum teste quebra. Nenhum alerta dispara. A produção segue estável.

O custo só aparece depois, quando alguém precisa fazer algo com aquela parte do sistema — e descobre que o conhecimento que tornaria esse trabalho seguro e previsível não existe mais em lugar nenhum acessível. A investigação começa. E raramente é contabilizada pelo seu custo real — ela some dentro da estimativa de "tempo de desenvolvimento". O atraso é registrado. A causa fica invisível.

---

## Dívida epistemológica

A engenharia de software cunhou um conceito útil chamado dívida técnica — o custo futuro de decisões tomadas no presente em detrimento da qualidade estrutural do sistema. Atalhos que funcionam agora mas que vão custar mais para manter ou corrigir depois.

A dívida técnica é bem compreendida. Existem métricas para ela. Ferramentas que a identificam. Práticas estabelecidas para pagá-la.

Mas existe uma dívida diferente, menos visível e igualmente real: a **dívida epistemológica**.

A dívida epistemológica não se acumula no código. Ela se acumula no espaço entre o sistema e o entendimento sobre ele. É o conjunto crescente de lacunas no conhecimento disponível sobre o software — decisões sem justificativa registrada, mudanças sem rastro, regras de negócio que existem apenas na memória de quem as criou, hipóteses iniciais que foram revisadas mas cujas revisões nunca foram formalizadas.

Como toda dívida, ela tem juros. Quando a dívida epistemológica é baixa, mudanças no sistema são previsíveis e relativamente seguras. A equipe sabe o que está mexendo, sabe o que pode quebrar, sabe quais dependências existem. O risco é controlável porque o entendimento é sólido.

Quando é alta, cada mudança exige investigação antes de qualquer trabalho de engenharia. O esforço de entender o que existe passa a dominar o esforço de construir o que é necessário. Estimativas se tornam difíceis porque não se sabe o que será encontrado no caminho. Riscos são difíceis de avaliar porque não se conhece o mapa completo do sistema.

O campo `tipo_antigo` que ninguém ousa remover é um sintoma de dívida epistemológica. A regra que "todo mundo sabe" mas que não está documentada em lugar nenhum é dívida epistemológica. A decisão arquitetural que fez sentido em 2021 mas cujo contexto foi perdido e por isso continua sendo respeitada mesmo quando não deveria — também é dívida epistemológica.

A diferença crucial entre dívida técnica e epistemológica é que a técnica pode ser vista no código: complexidade alta, acoplamento excessivo, ausência de testes. A epistemológica só aparece quando alguém precisa fazer algo com o código — e descobre que não entende o suficiente para fazê-lo com segurança.

Uma é visível antes do problema. A outra só se revela quando o problema já está acontecendo.

---

## Por que isso importa agora mais do que antes

Durante décadas, a lentidão natural do desenvolvimento de software impôs uma cadência que, sem ser perfeita, pelo menos criava oportunidades para que o conhecimento fosse transmitido. Quando uma mudança levava semanas, havia tempo para discussões, para transferência de contexto, para que novos membros da equipe absorvessem o entendimento dos mais experientes.

Esse ritmo mudou. Ferramentas modernas — e especialmente as de geração de código baseadas em inteligência artificial — tornaram possível implementar em horas o que antes levava dias. O código cresce mais rápido. O sistema evolui mais rápido.

E o conhecimento? O conhecimento não acelera automaticamente junto com o código. Uma ferramenta de IA pode gerar uma implementação funcional em minutos. Não gera o entendimento sobre por que aquela implementação faz sentido naquele contexto específico, quais foram as alternativas consideradas e descartadas, quais restrições existem que a implementação precisa respeitar.

Quando o ritmo de geração de código supera o ritmo de consolidação do entendimento, a dívida epistemológica se acumula ainda mais rápido. Não porque as ferramentas sejam ruins — são eficazes no que fazem. Mas porque produzir código e produzir entendimento são coisas distintas, e por enquanto só uma delas foi automatizada.

A solução para esse problema não está em desacelerar o código. Está em criar mecanismos que preservem o conhecimento no mesmo ritmo em que o sistema evolui. O próximo passo é entender por que a documentação tradicional, mesmo quando existe, normalmente não impede essa perda.

---

> **Em resumo**
>
> Software tem duas naturezas: a operacional, que executa, e a epistemológica, que carrega o conhecimento sobre por que foi construído assim. A segunda se deteriora quando não é preservada ativamente — de forma silenciosa e gradual, invisível enquanto o sistema funciona. Essa deterioração acumula dívida epistemológica: o custo crescente de entender o sistema antes de poder evoluí-lo com segurança. Com ferramentas de IA acelerando a produção de código, esse problema tende a se intensificar se não houver mecanismos deliberados de preservação do conhecimento. A solução não está em documentar mais, mas em documentar de forma que preserve a causalidade das decisões e acompanhe a evolução real do projeto.

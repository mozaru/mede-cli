---
title: "A MEDE como modelo de consultoria"
order: 23
---

# Capítulo 23 — A MEDE como modelo de consultoria

Existe uma tensão fundamental em projetos de software contratados: o cliente contrata uma solução, mas no início do contrato raramente sabe exatamente qual solução precisa. Sabe qual dor quer resolver. Não sabe, ainda, qual é a melhor forma de resolvê-la.

Essa tensão produz o conflito mais recorrente da indústria: escopo que muda, cliente que "não sabe o que quer", fornecedor que entregou "o que foi pedido" mas não o que era necessário. O problema não é má-fé de nenhum lado. É que a solução madura só emerge com o tempo, com o uso, com o feedback da realidade.

A MEDE oferece uma estrutura para trabalhar nessa tensão de forma honesta e produtiva.

---

## O modelo de maturação progressiva

A premissa central:

> Clientes conhecem a dor que enfrentam. Raramente conhecem, de forma completa e madura, a solução adequada no início do trabalho.

Aceitar essa premissa como verdade — em vez de fingir que o escopo inicial é definitivo — muda a forma como o projeto é estruturado.

O serviço deixa de ser "entregar o que foi especificado" e passa a ser "conduzir um processo estruturado de descoberta, validação e evolução da solução". O `entendimento-inicial.md` torna isso explícito: registra o que se sabia no início. Quando o entendimento evolui — e vai evoluir — a evolução é documentada nos ciclos seguintes. O cliente pode comparar o entendimento inicial com o estado atual e ver exatamente o que mudou, por quê, e como as mudanças foram incorporadas.

---

## O que o cliente recebe além do sistema

Com a MEDE, o cliente não recebe apenas um sistema funcionando. Recebe:

**O registro da trajetória de decisões.** O `entendimento-inicial.md` e os documentos vivos ao final contam a história. Qualquer pessoa que leia os dois consegue entender o aprendizado que o projeto produziu.

**O raciocínio por trás das decisões técnicas.** Os ADRs respondem perguntas que frequentemente surgem meses depois: por que foi escolhida esta tecnologia? Por que o sistema funciona assim e não de outra forma? Essas respostas existem — não dependem de ninguém estar disponível.

**Uma base para evolução futura.** Qualquer equipe que assumir o sistema encontra documentação que permite entender sem reconstruir o conhecimento do zero.

---

## A separação entre fixo e variável

Um modelo de consultoria baseado na MEDE é mais honesto do que o modelo de escopo fechado precisamente porque separa explicitamente o que é fixo do que é variável:

**Fixo:** o método de trabalho, o ritmo de entregas, os critérios de validação, a governança documental.

**Variável:** os detalhes da solução, o refinamento funcional, os ajustes que emergem do uso real.

Essa separação elimina o conflito mais comum em projetos: o cliente que pede mudanças e o fornecedor que diz que "não estava no escopo". Com a MEDE, mudanças são parte esperada e estruturada do processo — documentadas em atas, absorvidas nos ESMs, refletidas nos documentos vivos.

---

## Como apresentar isso ao cliente

Para incluir a MEDE numa proposta comercial, o acervo documental pode ser descrito assim:

> Além do sistema, o projeto entrega um acervo documental MEDE contendo:
> - entendimento inicial — o ponto de partida documentado
> - decisões arquiteturais — o raciocínio por trás de cada escolha estrutural
> - histórico de mudanças — como o entendimento evoluiu ao longo do projeto
> - situação atual — o estado da solução no encerramento
> - base para manutenção e evolução futura — sem dependência do fornecedor original

Esse acervo é o que diferencia a entrega: não apenas código, mas o conhecimento que sustenta o código.

---

## Entrega tradicional vs. entrega com MEDE

| Entrega tradicional | Entrega com MEDE |
|---|---|
| Código-fonte | Código-fonte + conhecimento preservado |
| Manual técnico (quando existe) | Documentação causal e documentos vivos |
| Handoff por reunião e entrevistas | Handoff por acervo documental estruturado |
| Mudança de escopo vista como desvio | Mudança vista como maturação registrada |
| Conhecimento retido no fornecedor | Conhecimento transferido ao cliente |

Esse quadro é útil tanto em propostas comerciais quanto em conversas internas sobre por que vale a pena investir no processo documental.

---

## O argumento para diferentes perfis

**Para o tech lead:** a MEDE é o que torna possível delegar com segurança. Quando o conhecimento está documentado, qualquer desenvolvedor pode verificar o ADR correspondente antes de mexer num componente estrutural.

**Para o gestor:** a MEDE é o que torna possível estimar com mais segurança. Projetos com documentação causal têm estimativas mais confiáveis porque o histórico de mudanças é rastreável.

**Para o CTO:** a MEDE é o que torna possível substituir equipes sem perder o projeto. A dependência de pessoas específicas para entender sistemas específicos é um risco organizacional real — a MEDE reduz esse risco sistematicamente.

---

## Primeiros passos — como incluir MEDE numa proposta

- [ ] Descrever o acervo documental como entregável explícito (não como overhead)
- [ ] Apresentar o `entendimento-inicial.md` como documento de linha de base que o cliente co-valida
- [ ] Incluir a produção de ciclos documentais no cronograma (não como tarefa separada, mas como parte do ritual de encerramento de sprint)
- [ ] Ao final do projeto, entregar o diretório `docs/` completo como parte formal do pacote de entrega

---

> **Em resumo**
>
> A MEDE como modelo de consultoria parte de uma premissa honesta: clientes raramente conhecem a solução ideal no início. Com esse modelo, o cliente recebe além do sistema: o registro da trajetória de decisões, o raciocínio por trás de cada escolha estrutural, e uma base documental que qualquer equipe futura pode usar sem depender do fornecedor original. A separação explícita entre o que é fixo e o que é variável elimina o conflito mais recorrente em projetos de escopo fechado. E o acervo MEDE é um entregável concreto, descritível numa proposta, que diferencia a entrega de qualquer projeto que não preserve o conhecimento que produz.

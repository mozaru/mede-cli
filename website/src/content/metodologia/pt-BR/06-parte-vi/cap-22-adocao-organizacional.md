---
title: "Adoção organizacional"
order: 22
---

# Capítulo 22 — Adoção organizacional

Quando múltiplos projetos numa organização adotam a MEDE, emergem benefícios que vão além do que qualquer projeto individual consegue. A governança do conhecimento deixa de ser uma prática de equipe e passa a ser uma capacidade organizacional.

---

## A MEDE como padrão de entrega

Numa empresa de desenvolvimento de software, a MEDE pode ser adotada como padrão de entrega — parte do contrato implícito ou explícito com o cliente, além do código.

O argumento para o cliente é direto: ao final do projeto, você não recebe apenas um sistema funcionando. Recebe o conhecimento sobre o sistema — documentado, estruturado, e compreensível por qualquer equipe técnica que venha a trabalhar com ele no futuro.

Esse argumento tem valor especial em dois contextos:

**Projetos com handoff posterior.** Quando o sistema vai ser entregue e mantido por equipe diferente da que desenvolveu, a documentação MEDE é o que torna o handoff seguro.

**Projetos com auditoria ou conformidade.** Organizações que precisam demonstrar controle sobre seus sistemas têm no acervo MEDE um instrumento de evidência rastreável.

---

## Governança de portfólio

Quando vários projetos seguem a MEDE, torna-se possível navegar entre eles com a mesma lógica:

- `readme.md` é sempre a porta de entrada
- `situacao-atual.md` é sempre o estado atual
- `atas/` é sempre onde está o histórico decisório
- `adr/` é sempre onde estão as decisões arquiteturais

Essa uniformidade permite que um tech lead que gerencia múltiplos projetos se oriente em qualquer um seguindo a mesma sequência de leitura. Um desenvolvedor realocado parte de um terreno familiar.

---

## O mínimo não negociável

A adoção organizacional precisa de um núcleo invariante — o que é exigido de todo projeto, independentemente de tamanho, tecnologia ou metodologia de desenvolvimento.

**Mínimo organizacional da MEDE:**

- [ ] Todo projeto tem `entendimento-inicial.md` e `situacao-atual.md`
- [ ] Toda decisão arquitetural relevante tem ADR
- [ ] Ciclos documentais são regulares e produzem ata
- [ ] Artefatos históricos são imutáveis após consolidação
- [ ] Todo projeto mantém `docs/` em repositório versionado
- [ ] Todo projeto tem percurso de leitura definido para onboarding

O que fica fora do mínimo — nível de detalhe das atas, ritmo dos ciclos, extensão dos ADRs — é adaptação ao contexto de cada projeto.

---

## Padronizando sem engessar

Diferentes projetos têm diferentes necessidades. A tabela a seguir diferencia o que faz sentido exigir por nível de maturidade do projeto:

| Nível | O que exigir | O que não exigir |
|---|---|---|
| Projeto pequeno / exploratório | Ata, ADR quando necessário, situação atual | ESM em todo ciclo, LEG formal |
| Projeto médio / produto | Ciclo regular, docs vivos completos, LEG | Templates excessivamente longos |
| Portfólio / múltiplos projetos | Estrutura padrão, nomenclatura, revisão periódica | Conteúdo idêntico entre projetos |

A padronização deve incidir sobre a estrutura e os princípios — não sobre o volume de texto ou o nível de detalhe de cada artefato.

---

## Formação deliberada

Para que a MEDE funcione como padrão organizacional, os membros da equipe precisam entendê-la — não apenas seguir templates.

A diferença entre um praticante que entende e um que segue mecanicamente aparece nas situações ambíguas: quando uma decisão é estrutural o suficiente para merecer ADR? Quando o ESM é mais adequado que uma entrada na ata?

Qualquer forma de formação funciona melhor do que distribuir um manual e esperar adesão espontânea: sessões de leitura conjunta dos primeiros capítulos deste livro, revisão dos primeiros artefatos de projetos em adoção, discussão de casos onde houve dúvida.

---

## Primeiros passos — mínimo organizacional

Para uma organização que está iniciando a adoção em escala:

- [ ] Definir os seis itens do mínimo organizacional como padrão formal
- [ ] Escolher dois ou três projetos piloto para adoção inicial
- [ ] Realizar uma sessão de revisão dos primeiros artefatos produzidos (não para corrigir, mas para calibrar o entendimento coletivo)
- [ ] Após 60 dias, revisar o que está funcionando e o que precisa de ajuste antes de expandir

---

> **Em resumo**
>
> A adoção organizacional cria capacidades que projetos individuais não conseguem: navegação uniforme entre projetos, análise comparativa de portfólio, e a MEDE como padrão de entrega que inclui documentação como parte do que o cliente recebe. O mínimo não negociável — seis itens que todo projeto deve ter — é o que garante consistência sem engessamento. A padronização deve incidir sobre estrutura e princípios, não sobre volume de texto. Formação deliberada é o que distingue praticantes que entendem de praticantes que apenas seguem templates.

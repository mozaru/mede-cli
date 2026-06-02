# Arquitetura Isomórfica de Software: Um Modelo de Organização Agnóstico de Plataforma para Aplicações Frontend e Backend

**Mozar Baptista da Silva**
mozar.silva@gmail.com · mozar.silva@11tech.com.br
ORCID: [0009-0000-5747-0984](https://orcid.org/0009-0000-5747-0984)
11Tech Desenvolvimento de Sistemas Ltda.

---

> *Technical Report — versão 1.0.0*
>
> *Para citar este trabalho: M. B. da Silva, "Arquitetura Isomórfica de Software: Um Modelo de Organização Agnóstico de Plataforma para Aplicações Frontend e Backend," 11Tech Desenvolvimento de Sistemas Ltda., Technical Report v1.0.0, 2026.*

---

## Resumo

A automação da produção de código por meio de frameworks, geradores, plataformas low-code e, mais recentemente, modelos de linguagem de grande escala (LLMs) e agentes de codificação como Claude Code, Codex e Gemini CLI tem deslocado progressivamente o gargalo da engenharia de software da implementação para a governança do conhecimento da solução [1]. Nesse contexto, a organização arquitetural do código deixa de ser um detalhe de preferência de equipe e passa a ser um fator crítico de manutenibilidade e longevidade: quanto mais robusta e previsível a arquitetura, maior a capacidade de qualquer agente — humano ou automatizado — compreender, navegar e evoluir o sistema sem necessidade de explicações contextuais repetidas [2]. Este artigo propõe o conceito de **arquitetura isomórfica de software**, entendida como uma organização estrutural de camadas e responsabilidades capaz de preservar a mesma topologia conceitual entre aplicações frontend, backend e múltiplas plataformas. A proposta sintetiza princípios de Clean Architecture [3], Domain-Driven Design [4], Ports & Adapters [5] e Feature-Sliced Design [6], com foco na organização física de diretórios e arquivos como contrato arquitetural estável para desenvolvedores humanos e agentes de geração assistida por IA. As principais contribuições são: (i) a definição formal do conceito de isomorfismo arquitetural estrutural; (ii) um modelo de camadas com ciclos de vida distintos aplicável a frontend e backend; (iii) a demonstração de que esse modelo colapsa naturalmente em plataformas sem fronteira HTTP; (iv) estruturas de diretórios de referência para web SPA, web tradicional, desktop, console e CLI; e (v) arquivos de diretiva de referência (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`) que materializam a arquitetura como contrato legível por agentes de codificação, com hipóteses empíricas associadas para verificação futura.

**Palavras-chave:** arquitetura de software, organização de código, Clean Architecture, Domain-Driven Design, Ports and Adapters, geração de código, LLM, agentes de codificação, isomorfismo arquitetural, Engenharia de Software 4.0.

---

## Abstract

The automation of code production through frameworks, generators, low-code platforms, and, more recently, large language models (LLMs) and coding agents such as Claude Code, Codex, and Gemini CLI has progressively shifted the bottleneck of software engineering from implementation to the governance of solution knowledge [1]. In this context, the architectural organization of code ceases to be a matter of team preference and becomes a critical factor for maintainability and longevity: the more robust and predictable the architecture, the greater the capacity of any agent — human or automated — to understand, navigate, and evolve the system without repeated contextual explanations [2]. This paper proposes the concept of **isomorphic software architecture**, defined as a structural organization of layers and responsibilities capable of preserving the same conceptual topology across frontend, backend, and multiple platform applications. The proposal synthesizes principles from Clean Architecture [3], Domain-Driven Design [4], Ports & Adapters [5], and Feature-Sliced Design [6], with a focus on the physical organization of directories and files as a stable architectural contract for human developers and AI-assisted code generation agents. The main contributions are: (i) a formal definition of the concept of structural architectural isomorphism; (ii) a layer model with distinct life cycles applicable to both frontend and backend; (iii) a demonstration that this model naturally collapses in platforms without an HTTP boundary; (iv) reference directory structures for SPA web, traditional web, desktop, console, and CLI applications; and (v) reference directive files (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`) that materialize the architecture as a machine-readable contract for coding agents, with associated empirical hypotheses identified for future verification.

**Keywords:** software architecture, code organization, Clean Architecture, Domain-Driven Design, Ports and Adapters, code generation, LLM, coding agents, architectural isomorphism, Software Engineering 4.0.

---

## 1. Introdução

A engenharia de software tem atravessado, nas últimas décadas, sucessivos deslocamentos no seu gargalo central [1]. Da codificação manual ao controle de processos, da arquitetura ao domínio, e mais recentemente à governança do conhecimento da solução — cada deslocamento foi provocado pela redução do custo relativo da etapa anterior. Quando LLMs e agentes de codificação passaram a gerar código com qualidade crescente, o problema central passou a ser garantir que o conhecimento arquitetural que sustenta esse código seja claro o suficiente para ser seguido por qualquer agente, humano ou automatizado [1], [7].

Nesse cenário, a organização de arquivos e diretórios em um projeto de software — frequentemente tratada como decisão secundária, resolvida por convenção de framework ou hábito de equipe — revela sua real importância. A abordagem mais comum, organizar por tipo de arquivo com pastas como `components/`, `services/`, `controllers/` e `repositories/` na raiz do projeto, falha de forma previsível: para entender uma única funcionalidade, o desenvolvedor precisa navegar por múltiplas pastas sem relação entre si [3]. Esse problema é amplificado quando o agente que navega o código não é um desenvolvedor humano com memória persistente entre sessões, mas um modelo de linguagem que reconstrói o contexto a cada interação.

A motivação central deste artigo é oferecer uma arquitetura de organização de código suficientemente clara, formal e documentada para que ferramentas de geração assistida por IA possam produzir código estruturalmente correto e consistente sem que o desenvolvedor precise reexplicar os princípios organizacionais a cada sessão de trabalho. Uma arquitetura bem definida funciona como um contrato estável que qualquer agente pode seguir, da mesma forma que a MEDE [2] oferece mecanismos de preservação do conhecimento decisório ao longo do ciclo de vida do projeto.

A observação prática que sustenta este trabalho é dupla. Primeiro, que projetos bem arquiteturados conceitualmente frequentemente apresentam desorganização física — o código correto no lugar errado — gerando custo cognitivo desnecessário para humanos e ambiguidade estrutural para agentes automatizados. Segundo, que a ausência de um modelo isomórfico entre frontend e backend força desenvolvedores e agentes a reaprender a navegação do projeto a cada transição de camada, mesmo que os conceitos subjacentes sejam os mesmos [1].

A literatura de engenharia de software oferece respostas consolidadas para o problema arquitetural. Clean Architecture [3], Domain-Driven Design [4] e Ports & Adapters [5] propõem, cada um a sua maneira, que o código de negócio deve ser isolado de detalhes de infraestrutura e de mecanismos de entrega. Contudo, essas referências são frequentemente aplicadas de forma isolada — no backend, no frontend, ou em uma única plataforma — sem uma visão unificada que permita que o mesmo raciocínio arquitetural guie decisões em qualquer contexto tecnológico.

### 1.1 Contribuições

As principais contribuições deste artigo são:

1. A formalização do conceito de **arquitetura isomórfica de software** como organização estrutural que preserva a mesma topologia conceitual de camadas entre plataformas distintas.
2. A definição de um **modelo de camadas com ciclos de vida distintos**, aplicável de forma consistente a frontend e backend, com mapeamento explícito entre as nomenclaturas de cada lado.
3. A demonstração de que o modelo **colapsa naturalmente em plataformas sem fronteira HTTP** (desktop, console, CLI), eliminando camadas redundantes que existem exclusivamente como artefato do protocolo de comunicação.
4. A apresentação de **estruturas de diretórios de referência** para cinco tipos de aplicação: web SPA, web tradicional, desktop, console e CLI.
5. A discussão do papel dessa organização como **contrato arquitetural para agentes de IA**, conectando a proposta ao ecossistema da Engenharia de Software 4.0 [1], MEDE [2] e Janus [7].
6. A apresentação de **arquivos de diretiva de referência** (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`) que materializam a arquitetura isomórfica como contrato legível por agentes de codificação, com hipóteses empíricas associadas identificadas para verificação futura.

### 1.2 Relação com o ecossistema ES 4.0

Este artigo insere-se no ecossistema conceitual da Engenharia de Software 4.0 [1], que reposiciona o foco da disciplina da produção de código para a governança do conhecimento da solução. A arquitetura isomórfica proposta pode ser compreendida como um artefato de governança arquitetural: um documento que preserva o conhecimento organizacional do projeto de forma suficientemente formal para orientar tanto desenvolvedores humanos quanto agentes automatizados.

A relação com a MEDE [2] é direta: a estrutura de diretórios proposta é ela mesma um artefato documental que registra decisões arquiteturais estabilizadas. Cada pasta e cada convenção de nomenclatura representa uma decisão sobre responsabilidade e ciclo de vida que, quando explicitada, pode ser preservada, rastreada e evoluída de forma governada.

A relação com o Janus [7] é igualmente relevante: a organização isomórfica cria as condições para que infraestruturas de geração operem de forma confiável, pois a separação disciplinada entre camadas estáveis (domínio) e camadas substituíveis (infraestrutura, transporte, view) é exatamente o que permite que geradores produzam artefatos corretos para cada plataforma sem precisar conhecer os detalhes das demais.

Dois conceitos novos são formalizados neste artigo como contribuição ao ecossistema ES 4.0. O primeiro é o **contrato arquitetural legível por agente**: a organização física de diretórios, complementada por arquivos de diretiva (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`), como especificação persistente e versionada que agentes de codificação podem consumir diretamente, sem depender de reexplicação contextual por sessão. O segundo é o **custo de reconstrução de contexto**: o custo — pago em re-prompts, correções e artefatos mal localizados — que agentes LLMs sem memória persistente incorrem ao reconstruir o modelo do projeto a cada sessão, e que uma arquitetura previsível reduz sistematicamente. Complementar a esse, o **custo de decisão por artefato** descreve o consumo de tokens e iterações que ocorre dentro de cada sessão quando o agente precisa inferir, a cada novo arquivo, onde ele deve residir, como deve se chamar e de quais camadas pode depender — custo que a estrutura isomórfica elimina ao tornar essas respostas deriváveis diretamente das regras de nomenclatura e dependência.

### 1.3 Escopo e limitações

Este artigo trata exclusivamente da organização de diretórios e arquivos — a arquitetura física do projeto. Não aborda decisões de design interno de cada arquivo, padrões de comunicação entre serviços, ou escolhas de frameworks e bibliotecas. As estruturas propostas nos apêndices são intencionalmente mínimas e devem ser adaptadas ao contexto de cada equipe e projeto. A validação empírica em larga escala com agentes de IA está fora do escopo deste trabalho e é identificada como direção de pesquisa futura.

O restante do artigo está organizado da seguinte forma. A Seção 2 apresenta o problema e a motivação. A Seção 3 discute os trabalhos relacionados. A Seção 4 descreve o método de construção da proposta. A Seção 5 apresenta a arquitetura isomórfica proposta. As Seções 6 e 7 detalham a aplicação no frontend e no backend. A Seção 8 discute a portabilidade entre plataformas. A Seção 9 apresenta a discussão. As Seções 10 e 11 tratam de limitações e trabalhos futuros. A Seção 12 conclui o artigo.

---

## 2. Problema e Motivação

A organização de código em projetos de software é frequentemente tratada como uma decisão secundária, resolvida por convenção de framework ou hábito de equipe. Com o crescimento dos projetos, essa decisão revela consequências diretas na manutenibilidade, na portabilidade e no custo cognitivo de evolução do sistema.

O problema se manifesta em duas dimensões complementares. A primeira é a **fragmentação por tipo**: a organização type-based, onde arquivos são agrupados por categoria técnica (`components/`, `services/`, `controllers/`), exige que o desenvolvedor navegue por múltiplas pastas para compreender uma única funcionalidade de negócio. A segunda é a **assimetria entre camadas**: a ausência de um modelo comum entre frontend e backend impõe que desenvolvedores e agentes de IA reaprendam a estrutura do projeto a cada transição de contexto.

A emergência de agentes de codificação baseados em LLMs intensifica ambos os problemas. Um modelo de linguagem que reconstrói o contexto a cada sessão depende criticamente de uma estrutura de diretórios previsível e coerente para produzir código correto. Uma arquitetura física bem definida funciona, para esses agentes, como uma gramática do projeto — ela elimina ambiguidade sobre onde cada tipo de artefato deve residir e como as dependências entre camadas devem fluir [1], [2].

---

## 3. Trabalhos Relacionados

### 3.1 Clean Architecture

R. C. Martin [3] propõe uma arquitetura em camadas concêntricas onde a regra fundamental é que dependências de código-fonte só podem apontar para dentro — em direção ao domínio, nunca para fora em direção a infraestrutura ou mecanismos de entrega. As camadas propostas são: *Entities* (regras de negócio corporativas), *Use Cases* (regras de negócio da aplicação), *Interface Adapters* (controllers, presenters, gateways) e *Frameworks & Drivers* (web, banco de dados, UI). A contribuição direta deste trabalho é a tradução dessa estrutura conceitual em uma organização física de diretórios aplicável de forma consistente tanto ao frontend quanto ao backend.

### 3.2 Domain-Driven Design

E. Evans [4] introduz a separação entre camadas de domínio, aplicação, infraestrutura e interface do usuário. V. Vernon [8] aprofunda a aplicação prática desses conceitos, incluindo a separação entre repositórios como interfaces de domínio e suas implementações em infraestrutura. A nomenclatura `application/` adotada neste artigo para a camada de domínio no backend deriva diretamente dessa tradição.

### 3.3 Ports & Adapters

A. Cockburn [5] propõe que uma aplicação deve ser igualmente controlável por usuários, programas, testes automatizados ou scripts batch, e deve ser desenvolvida e testada isoladamente dos dispositivos e bancos de dados que usará em produção. Para isso, define *ports* — interfaces que o domínio expõe ou consome — e *adapters* — implementações concretas dessas interfaces para tecnologias específicas. Este padrão é a base do raciocínio central deste artigo: o que muda por plataforma são os adapters; o que é estável em relação à plataforma são as ports e o domínio.

### 3.4 Feature-Sliced Design

Feature-Sliced Design [6] é uma metodologia arquitetural para aplicações frontend que propõe camadas com regras explícitas de dependência: `app`, `pages`, `widgets`, `features`, `entities` e `shared`. Embora focado em frontend, introduz o conceito de organização por fatia de funcionalidade que influencia diretamente a estrutura proposta neste artigo.

### 3.5 Padrões de organização e geração assistida por IA

M. Fowler [9] documenta padrões como *Service Layer*, *Repository* e *Data Transfer Object* (DTO) que são referenciados diretamente na nomenclatura dos arquivos propostos neste artigo. Mais recentemente, a emergência de agentes de codificação como Claude Code [10], Codex [11] e Gemini CLI [12] tem evidenciado que a organização física do código não é apenas um problema humano: modelos de linguagem dependem de estruturas previsíveis para produzir artefatos corretos sem ambiguidade de contexto [1].

---

## 4. Método de Construção da Proposta

Este trabalho é uma **síntese conceitual fundamentada em experiência prática**, construída a partir de quatro fontes complementares:

1. **Análise de padrões arquiteturais consolidados**: os padrões de Clean Architecture [3], DDD [4], Ports & Adapters [5] e Feature-Sliced Design [6] foram analisados quanto à sua aplicabilidade à organização física de diretórios, identificando as contribuições de cada um e as lacunas não endereçadas na literatura.

2. **Experiência prática em projetos frontend e backend**: a proposta emergiu da observação recorrente, em projetos reais de software, de que projetos bem arquiteturados conceitualmente frequentemente apresentam desorganização física, e de que a ausência de um modelo comum entre frontend e backend gera custo cognitivo desnecessário.

3. **Necessidade de padronização para geração assistida por IA**: a motivação prática de ter uma estrutura suficientemente clara para que agentes de IA sigam sem necessidade de reexplicação a cada sessão orientou as decisões de nomenclatura, granularidade e explicitação de ciclos de vida das camadas.

4. **Validação conceitual por aplicação a múltiplas plataformas**: a proposta foi estendida sistematicamente a cinco tipos de aplicação (web SPA, web tradicional, desktop, console e CLI), e o resultado — em particular o colapso natural das camadas redundantes em plataformas sem fronteira HTTP — foi tomado como evidência da coerência interna do modelo.

O artigo não é um estudo experimental com grupo de controle, coleta de métricas ou análise estatística. Ele é classificado como **relato técnico fundamentado** (*experience report*), formato adequado para publicação como Technical Report em repositórios abertos como Zenodo.

---

## 5. Arquitetura Isomórfica de Software

### 5.1 Definição

Neste artigo, entende-se por **arquitetura isomórfica de software** uma organização estrutural na qual diferentes plataformas preservam a mesma topologia conceitual de camadas, responsabilidades e relações de dependência, ainda que substituam as implementações externas específicas de cada ambiente tecnológico.

O termo isomorfismo é empregado aqui em sentido **estrutural e conceitual** — não matemático estrito, e tampouco no sentido de "isomorphic JavaScript" ou aplicações universais que executam o mesmo código no cliente e no servidor. Aqui, isomorfismo refere-se à preservação da topologia conceitual de camadas e responsabilidades entre plataformas distintas, independentemente de como cada camada é implementada. Duas arquiteturas são isomórficas neste contexto quando: (a) as mesmas camadas conceituais estão presentes; (b) as relações de dependência entre elas seguem a mesma direção; e (c) as responsabilidades de cada camada são equivalentes, ainda que implementadas de forma diferente. A analogia com isomorfismo de grafos é intuitiva — a estrutura de nós e arestas é preservada; o que muda são os rótulos e os pesos das arestas.

### 5.2 Princípio central

O princípio que organiza toda a arquitetura proposta é: **separar o que muda por plataforma do que é independente da plataforma**.

O que é independente da plataforma é o domínio da aplicação — as regras de negócio, os contratos de dados e as interfaces que definem como os dados são acessados. Esse núcleo pode mudar quando o negócio muda, mas não muda quando muda a tecnologia de apresentação ou o protocolo de comunicação. Esse código representa o conhecimento do negócio e deve ser independente de qualquer tecnologia [3].

O que muda por plataforma são os mecanismos de entrega (como o usuário interage com o sistema), os mecanismos de transporte (como os dados chegam e saem) e os mecanismos de persistência (onde e como os dados são armazenados). Esses são detalhes de implementação [5].

### 5.3 As camadas

A arquitetura proposta define seis camadas, cada uma com responsabilidade clara e ciclo de vida distinto:

| Camada | Responsabilidade | Muda quando |
|---|---|---|
| `core/` | Infraestrutura transversal: autenticação, logging, observabilidade, segurança, erros, sessão | Muda a plataforma ou o protocolo de segurança |
| `view/` ou `transport/` | Ponto de entrada: telas (frontend) ou controllers/commands (backend) | Muda a tecnologia de apresentação ou o protocolo |
| `features/` ou `application/` | Domínio: DTOs, interfaces de serviços e repositórios | Independente da plataforma — muda quando muda o negócio |
| `services/` | Implementação dos serviços de negócio | Muda a lógica de negócio |
| `infrastructure/` | Implementação dos repositórios: banco relacional, documentos, arquivo, API externa | Muda a tecnologia de persistência |
| `shared/` | Utilitários reutilizáveis: componentes, lib, types, constantes, enums | Muda raramente — evolui com o projeto |

Adicionalmente, existem elementos de bootstrap presentes em toda plataforma mas específicos de cada uma: `app/` (ponto de entrada e composição), `config/` (configuração de ambiente), `assets/` (recursos visuais, apenas em plataformas com UI) e `styles/` (estilos globais, apenas em plataformas web).

### 5.4 A regra de dependência

Seguindo a Dependency Rule de Martin [3], as dependências de importação entre camadas só podem apontar de fora para dentro — em direção ao domínio, nunca em direção às implementações externas:

```
view/ ou transport/   →   services/              →   features/ ou application/
infrastructure/       →   features/ ou application/
core/                 →   features/ ou application/
features/ ou application/  →   shared/
```

As camadas externas dependem das abstrações internas; as camadas internas não importam implementações externas. `features/` ou `application/` definem as portas — interfaces de serviços e repositórios; `services/` implementa a lógica de negócio consumindo essas interfaces; `infrastructure/` implementa os repositórios definidos como interfaces em `application/`. Nenhuma dessas camadas internas conhece as externas: `features/` não importa de `view/`, `application/` não importa de `infrastructure/`, e o domínio não sabe como é apresentado nem como persiste seus dados [5].

### 5.5 O isomorfismo entre plataformas

A propriedade central da arquitetura proposta é que o mesmo modelo conceitual aparece em todas as plataformas, com apenas as implementações das camadas externas sendo substituídas:

```
frontend web    frontend desktop    backend REST    backend CLI
────────────────────────────────────────────────────────────────
core/       →   core/           →   core/       →   core/
view/       →   view/           →   transport/  →   transport/
features/   →   application/   →   application/ →  application/
services/   →   services/       →   services/   →   services/
(sem infra) →   infrastructure/ →   infrastructure/ → infrastructure/
shared/     →   shared/         →   shared/     →   shared/
```

### 5.6 Representação visual das camadas

As figuras a seguir ilustram a arquitetura proposta em quatro perspectivas complementares. A Figura 1 apresenta a visão macro de uma aplicação completa em três camadas. As Figuras 2 e 3 detalham as camadas internas do frontend e do backend respectivamente, destacando com cores distintas o que muda por plataforma e o que é independente dela. A Figura 4 é o diagrama central da tese do artigo: mostra que as camadas redundantes da aplicação web — `features/` e `services/` do frontend, mais `transport/` do backend — existem exclusivamente por causa da fronteira HTTP, e colapsam naturalmente no desktop onde frontend e backend rodam no mesmo processo.

**Figura 1 — Visão geral: aplicação em três camadas**

![Figura 1][fig1]

> **Figura 1.** Frontend, Backend e Persistência como três blocos com protocolos de comunicação explícitos entre eles. O usuário interage exclusivamente com o Frontend; o Backend nunca é acessado diretamente pela interface.

---

**Figura 2 — Camadas internas do frontend**

![Figura 2][fig2]

> **Figura 2.** Estrutura interna do frontend organizada por ciclo de vida. Camadas em azul mudam quando a plataforma muda. Camadas em âmbar representam o domínio — estáveis em relação à plataforma, mas sujeitas a mudança quando o negócio evolui. A camada cinza (`shared/`) é compartilhada entre features e evolui lentamente com o projeto.

---

**Figura 3 — Camadas internas do backend**

![Figura 3][fig3]

> **Figura 3.** Estrutura interna do backend com nomenclatura correspondente ao frontend. Camadas em roxo mudam quando o protocolo muda. Camadas em âmbar são o domínio — idênticas às do frontend em termos de responsabilidade. A `infrastructure/` implementa os repositórios definidos como interfaces em `application/`.

---

**Figura 4 — O custo da fronteira HTTP: web versus desktop**

![Figura 4][fig4]

> **Figura 4.** Comparativo lado a lado entre aplicação web SPA e aplicação desktop. As chaves vermelhas na coluna web marcam as camadas que existem exclusivamente por causa da fronteira HTTP. No desktop, essas camadas desaparecem: `application/` e `services/` existem uma única vez, e o `transport/` não existe. Linhas sólidas (=) indicam camadas com responsabilidade idêntica; linhas tracejadas (≠) indicam camadas substituíveis sem afetar o domínio.

---

## 6. Aplicação no Frontend

### 6.1 Estrutura de camadas

No frontend, a camada de `features/` tende a ser mais enxuta do que a camada equivalente no backend. Em muitas aplicações orientadas a backend — o caso mais comum — não existem entidades com comportamento no sentido do DDD [4]; existem apenas contratos de dados (DTOs) e interfaces de serviços. Essa simplificação é honesta com a natureza do frontend convencional: ele atua como camada de apresentação e orquestração, delegando as regras de negócio complexas ao backend [3]. Em aplicações ricas, offline-first ou com lógica local significativa — editores visuais, ferramentas financeiras, colaboração em tempo real, PWAs com state machines complexas —, essa camada pode conter entidades e invariantes próprias. O modelo proposto acomoda ambos os casos: a diferença está na densidade de comportamento em `features/`, não na presença da camada em si.

### 6.2 DTOs no frontend

O padrão Data Transfer Object [9] é central na organização dos contratos de dados. No frontend, DTOs representam o formato exato em que os dados chegam e saem da API. Quando o contrato da API coincide com o tipo que as telas consomem, não há necessidade de criar tipos separados — o DTO é o tipo. A herança entre DTOs é usada para eliminar repetição quando operações diferentes compartilham campos:

```typescript
// perfil.dto.ts
export interface PerfilDto {
  id: string
  nome: string
  apelido: string
  email: string
  fotoPerfil: string
  tema: 'auto' | 'light' | 'dark' | 'default'
}

export interface AtualizarPerfilRequest {
  nome: string
  apelido: string
  cpf: string
  telefone: string
  email: string
}

export interface TrocarSenhaRequest {
  senhaAtual: string
  novaSenha: string
  confirmacaoSenha: string
}
```

### 6.3 O use-case como orquestrador de plataforma

O arquivo `use-case.ts` de cada feature pertence à camada `view/`, não à camada `features/`, porque ele conhece como a plataforma reage — como mostrar um erro, como navegar entre telas, como atualizar o estado reativo [5]. Essa decisão contrasta com algumas implementações do FSD [6], onde o use-case fica dentro da feature. A justificativa para a separação proposta é precisamente a portabilidade: o use-case de uma aplicação web SPA é diferente do use-case de uma aplicação desktop, mesmo que ambos orquestrem os mesmos serviços.

### 6.4 A Navbar como consumidora de estado de feature

Um caso especial que merece atenção é o componente de navegação global. Ele reside em `shared/components/layout/` por ser reutilizável e sem domínio próprio, mas consome estado da feature de perfil — exibindo apelido, foto e tema do usuário logado. Esse acoplamento é legítimo: a Navbar não contém lógica de perfil, apenas lê estado reativo exposto pelo use-case de perfil. A distinção entre *consumir estado* e *conter lógica* é importante para manter a separação de responsabilidades sem criar indireções desnecessárias.

---

## 7. Aplicação no Backend

### 7.1 Diferenças em relação ao frontend

O backend apresenta duas camadas que não existem no frontend web: `transport/` e `infrastructure/`. Ambas existem pelo mesmo motivo — isolar o domínio de detalhes que mudam por tecnologia [3]. A `transport/` abstrai o protocolo de entrada: um sistema que hoje expõe uma API REST pode amanhã expor também uma interface gRPC ou um conjunto de commands para CLI, sem que a camada de `application/` saiba da diferença. A `infrastructure/` abstrai o mecanismo de persistência: um repositório definido como interface em `application/` pode ser implementado em PostgreSQL, MongoDB, arquivo JSON ou chamada a uma API externa, sem que os serviços de negócio saibam da diferença [9].

### 7.2 Entidades no backend

Ao contrário do frontend, o backend pode ter entidades com comportamento real — métodos que encapsulam regras de negócio, validações de invariantes, computed properties. Essa é a distinção fundamental entre as camadas de `features/` e `application/`: no frontend são só dados; no backend podem ser objetos com comportamento [4].

### 7.3 O Repository como Port

O arquivo `*.repository.ts` dentro de `application/` define uma interface — uma *port* no vocabulário de Cockburn [5]. As implementações concretas ficam em `infrastructure/` e são os *adapters*. Isso permite trocar o banco de dados sem tocar em nenhuma linha de código de negócio, e permite testar a lógica de negócio com implementações em memória sem dependência de banco real.

---

## 8. Portabilidade entre Plataformas

### 8.1 O custo da fronteira HTTP

A Figura 4 revela o argumento central deste artigo de forma visual. Na aplicação web, a fronteira HTTP entre frontend e backend força a existência de camadas redundantes: `features/` e `services/` no frontend existem porque o browser é um processo separado que precisa serializar dados em JSON, transmiti-los pela rede e desserializá-los de volta em tipos nativos da linguagem. O `transport/` no backend existe para receber esse JSON, validá-lo e convertê-lo de volta para os tipos do domínio. Todas essas camadas são **artefatos da fronteira**, não do domínio.

No desktop, frontend e backend rodam no mesmo processo, falam a mesma linguagem, compartilham os mesmos tipos nativos. A fronteira desaparece, e com ela desaparecem as camadas redundantes. O `application/` e o `services/` existem uma única vez, servindo tanto a camada de apresentação quanto o acesso a dados, sem serialização intermediária.

### 8.2 O que muda e o que permanece

A tabela a seguir sintetiza o comportamento de cada camada nos cinco tipos de plataforma suportados:

| Camada | Web SPA | Web Tradicional | Desktop | Console | CLI |
|---|---|---|---|---|---|
| `core/` | JWT, HTTP client, CSRF | Sessão server-side, cookies | Singleton em memória | Variáveis de ambiente | Args/flags |
| `view/` | Componentes HTML/CSS/JS | Templates server-side | Forms/Janelas | stdout estruturado | Commands |
| `features/` ou `application/` | Mesma responsabilidade conceitual | Mesma responsabilidade conceitual | Mesma responsabilidade conceitual | Mesma responsabilidade conceitual | Mesma responsabilidade conceitual |
| `services/` | Mesma lógica, implementação adaptável | Mesma lógica, implementação adaptável | Mesma lógica, implementação adaptável | Mesma lógica, implementação adaptável | Mesma lógica, implementação adaptável |
| `infrastructure/` | Não existe (HTTP é o core) | ORM, arquivo | ORM, DLL, named pipe | ORM, arquivo | ORM, arquivo |
| `shared/` | Reutilizável quando compatível | Reutilizável quando compatível | Reutilizável quando compatível | Reutilizável quando compatível (sem UI) | Reutilizável quando compatível (sem UI) |

### 8.3 O controle de acesso em plataformas não-web

Em aplicações web, o controle de acesso envolve JWT, tokens de refresh, storage seguro e guards de rota — mecanismos necessários porque o browser é um ambiente não confiável e stateless [13]. Em aplicações desktop, console e CLI, o ambiente tende a ser stateful e controlado pelo processo local, embora não deva ser assumido como plenamente confiável — um atacante com acesso ao sistema pode alterar arquivos de configuração, memória ou credenciais locais. O modelo de ameaça é diferente do web, não ausente. Por isso, o controle de acesso pode ser simplificado em relação ao modelo web, mas não eliminado. Na prática, simplifica para um singleton de usuário carregado uma vez no início da execução, e a navegação entre telas ou commands verifica as permissões desse singleton antes de prosseguir. O conceito é o mesmo — autenticação e autorização — mas a implementação em `core/auth/` é radicalmente diferente. Essa é precisamente a razão pela qual `core/` existe como camada separada: ela absorve a mudança de modelo de segurança sem deixar vazar para `features/` ou `application/`.

### 8.4 Tema e preferências do usuário

Um caso de uso que ilustra bem a portabilidade é o gerenciamento de tema (claro, escuro, automático). Em uma aplicação web com backend, o tema é uma propriedade do perfil do usuário, persistida no servidor e carregada junto com os dados de autenticação, garantindo que a preferência seja respeitada independentemente do dispositivo. O DTO de perfil carrega o campo `tema`, o use-case aplica o tema imediatamente após o carregamento, e o store global de UI reflete esse valor de forma reativa para os componentes. Em uma aplicação desktop, a mesma lógica se aplica — a única diferença é que a aplicação do tema usa as APIs nativas de UI em vez de variáveis CSS.

---

## 9. Discussão

### 9.1 Benefícios da abordagem

A arquitetura isomórfica oferece três benefícios principais. O primeiro é a **redução do custo cognitivo de transição**: um desenvolvedor que conhece a estrutura de um projeto consegue navegar em qualquer outro projeto que siga o mesmo modelo, independentemente da tecnologia utilizada. O segundo é a **facilitação da geração assistida por IA**: agentes de codificação que operam com uma estrutura previsível produzem artefatos mais corretos e consistentes sem necessidade de reexplicação contextual [1], [2]. O terceiro é a **portabilidade estrutural**: a separação disciplinada entre camadas invariantes e camadas substituíveis cria condições para extração de pacotes compartilhados em monorepos, onde `features/application/` e `shared/` podem ser literalmente o mesmo código em aplicações web, desktop e CLI [14].

### 9.2 Trade-offs

A arquitetura proposta tem custos que devem ser avaliados. O **custo de setup inicial** de uma estrutura com seis camadas bem definidas é maior do que uma estrutura type-based simples, e para projetos pequenos pode não se justificar. O **risco de over-engineering** existe quando `services/` é simples o suficiente para ser integrado a `features/` sem perda de clareza. A **disciplina de equipe** é necessária para manter a regra de dependência — sem ferramentas de lint ou revisão focadas nessa regra, a arquitetura tende a degradar com o tempo [3].

### 9.3 Quando não usar

A arquitetura proposta é mais adequada para projetos de médio a grande porte com expectativa de evolução e manutenção ao longo do tempo. Para projetos pequenos, provas de conceito ou scripts de uso único, uma organização mais simples é mais apropriada — a complexidade da estrutura deve ser proporcional à complexidade do problema.

### 9.4 O contrato arquitetural legível por agente

A literatura de engenharia de software trata documentação arquitetural como artefato destinado a desenvolvedores humanos — Architecture Decision Records (ADRs), diagramas C4, documentos de visão e escopo [3], [4]. Este artigo propõe uma extensão dessa tradição: a **organização física de diretórios como documentação legível por máquina**.

A distinção é relevante. Um documento em linguagem natural descreve a arquitetura; uma estrutura de diretórios bem definida *materializa uma parte da arquitetura no próprio espaço do código* — ela existe junto ao código, é verificável por ferramentas, e pode ser inspecionada por um agente de IA a partir da listagem de arquivos do projeto. Quando essa estrutura é complementada por um arquivo de diretiva (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`) que explicita as regras de dependência e as convenções de nomenclatura, o resultado é um **contrato arquitetural legível por agente**: uma especificação que um agente pode consumir diretamente para produzir artefatos estruturalmente corretos sem que o desenvolvedor precise reexplicar a organização do projeto a cada sessão.

Esse conceito difere de abordagens anteriores de geração assistida por IA em um aspecto fundamental: não é uma instrução de prompt ad hoc, mas um artefato persistente e versionado que faz parte do repositório do projeto. Ele pode ser atualizado, revisado, referenciado em code review e evoluído junto com o código — comportando-se, portanto, como um artefato de governança no sentido da MEDE [2].

### 9.5 O custo de reconstrução de contexto e o custo de decisão por artefato

A interação entre agentes de codificação e projetos de software gera dois tipos de custo computacional que uma arquitetura isomórfica bem definida reduz sistematicamente.

**Custo de reconstrução de contexto (entre sessões).** Agentes de codificação baseados em LLMs não possuem memória persistente entre sessões. A cada nova interação, o agente reconstrói seu modelo do projeto a partir do contexto fornecido — arquivos abertos, histórico de conversa, listagem de diretórios e instruções explícitas. Esse processo tem um custo que se manifesta de duas formas: o **custo direto**, pago pelo desenvolvedor que precisa reexplicar a estrutura do projeto; e o **custo indireto**, expresso em artefatos gerados no lugar errado, violações de dependência não detectadas e re-prompts corretivos.

Uma arquitetura previsível e isomórfica reduz ambos. Quando a estrutura de diretórios é suficientemente regular — as mesmas camadas, os mesmos sufixos de nomenclatura, as mesmas relações de dependência em todo o projeto —, o agente pode inferir o contexto arquitetural a partir de uma amostra pequena do projeto, ou diretamente do arquivo de diretiva. Ele não precisa que o desenvolvedor explique que `auth.IService.ts` é uma interface de domínio e que sua implementação estará em `services/auth.service.ts` — a regularidade da estrutura torna essa inferência direta.

**Custo de decisão por artefato (dentro de cada iteração).** Um segundo mecanismo opera em granularidade menor: a cada artefato que o agente precisa criar ou modificar, ele resolve implicitamente um conjunto de decisões arquiteturais — *onde este arquivo deve residir? Como deve se chamar? De quais camadas pode importar? Quais interfaces deve implementar?* Em projetos sem estrutura definida, esse espaço de decisão é amplo e consome tokens de raciocínio a cada operação. Orquestradores que não encontram uma arquitetura explícita precisam também executar uma fase de *scaffolding inference* — iterações de leitura de diretórios e arquivos existentes para inferir a organização do projeto antes de produzir qualquer artefato novo.

Com a arquitetura isomórfica e um arquivo de diretiva, esse espaço de decisão colapsa: a resposta para cada uma das perguntas acima é derivável diretamente das regras de nomenclatura e da tabela de camadas definidas em `AGENTS.md`. O agente não precisa raciocinar sobre localização — apenas consultar. O efeito prático é uma redução no número de tokens consumidos por artefato gerado, no número de iterações de leitura de diretório por sessão, e na taxa de artefatos produzidos no lugar errado que exigem correção em iterações subsequentes.

Os dois mecanismos são complementares e se reforçam: uma arquitetura previsível reduz o custo de reconstrução de contexto ao início de cada sessão, e reduz o custo de decisão a cada artefato gerado dentro da sessão. A cadeia causal completa é:

> **estrutura isomórfica + arquivo de diretiva → eliminação da fase de descoberta arquitetural → menor espaço de decisão por artefato → menos tokens e iterações por sessão → menor taxa de erros arquiteturais**

Esse mecanismo é apresentado aqui como hipótese conceitual e identificado para verificação empírica na Seção 11.

---

## 10. Limitações

Este trabalho apresenta as seguintes limitações que devem ser consideradas na interpretação e aplicação dos resultados:

**Ausência de validação empírica quantitativa.** A proposta é fundamentada em análise conceitual e experiência prática, sem coleta sistemática de métricas de produtividade, qualidade de código ou desempenho de agentes de IA em projetos que adotem a arquitetura proposta.

**Dependência de disciplina de equipe.** A efetividade da arquitetura pressupõe que todos os membros da equipe (e os agentes de IA utilizados) conheçam e respeitem as regras de dependência entre camadas. Sem mecanismos automáticos de verificação, a estrutura tende a degradar.

**Cobertura parcial de tipos de aplicação.** Os apêndices cobrem cinco tipos de aplicação, mas não abordam sistemas distribuídos com múltiplos serviços, aplicações mobile nativas, sistemas embarcados ou arquiteturas orientadas a eventos, que podem exigir adaptações não triviais do modelo proposto.

**Nomenclatura não universalmente adotada.** Os termos `features/`, `application/`, `transport/` e `infrastructure/` têm usos variados na literatura e em diferentes frameworks. A proposta consolida uma nomenclatura específica que pode conflitar com convenções estabelecidas em equipes ou projetos existentes.

---

## 11. Trabalhos Futuros

As seguintes direções de pesquisa são identificadas como extensões naturais deste trabalho:

1. **Validação empírica com agentes de IA e desenvolvedores**: conduzir estudos comparativos medindo qualidade, consistência e custo cognitivo em projetos que adotam a arquitetura isomórfica versus projetos com organização type-based ou sem estrutura definida. As hipóteses a seguir são derivadas das observações práticas que motivaram este trabalho e são apresentadas como agenda de pesquisa:

| Hipótese | Dimensão | Formulação verificável |
|---|---|---|
| **H1** | Redução de violações arquiteturais | Projetos com `AGENTS.md` referenciando estrutura isomórfica produzem código com menor taxa de violações arquiteturais por sessão de agente, comparados a projetos sem arquivo de diretiva. |
| **H2** | Redução da barreira de entrada | A barreira de entrada para manutenção de projetos isomórficos é menor, medida pelo tempo até o primeiro commit arquiteturalmente válido por desenvolvedores sem experiência prévia em Clean Architecture. |
| **H3** | Redução de re-prompts corretivos | O número de re-prompts corretivos por sessão é menor em projetos com estrutura isomórfica e arquivo de diretiva explícito, em comparação com projetos sem estrutura definida. |
| **H4** | Redução de custo cognitivo independente de IA | O modelo reduz custo cognitivo de navegação e manutenção independentemente do uso de agentes de IA, medido pelo tempo de localização de artefatos em tarefas de manutenção controladas. |
| **H5** | Redução de custo de onboarding entre camadas | A simetria estrutural entre frontend e backend reduz o tempo de onboarding e o número de erros de localização em transições de contexto entre as duas camadas. |
| **H6** | Redução de custo computacional por artefato | Projetos com estrutura isomórfica e arquivo de diretiva explícito consomem menos tokens e executam menos iterações de leitura de diretório por artefato gerado em tarefas de criação de feature completa, comparados a projetos sem estrutura definida. |

H6 é a hipótese mais diretamente mensurável do conjunto: tokens por sessão são logáveis pela maioria dos orquestradores de agentes, e a comparação entre projetos com e sem `AGENTS.md` é metodologicamente direta. Um estudo comparativo com dois ou três projetos reais — um adotando a arquitetura isomórfica com `AGENTS.md`, outro com organização type-based — já seria suficiente para fornecer evidência preliminar sobre H1, H3, H4 e H6, elevando o artigo de proposta conceitual para proposta com evidência exploratória.

2. **Ferramental de verificação arquitetural**: desenvolver ferramentas de lint estático capazes de verificar automaticamente a conformidade com a regra de dependência entre camadas, aplicável a diferentes linguagens e frameworks.

3. **Extensão para sistemas distribuídos**: investigar como o modelo isomórfico se comporta em arquiteturas de microsserviços, onde cada serviço pode ser visto como uma instância independente da stack proposta.

4. **Integração com MEDE e Janus**: formalizar o uso da estrutura de diretórios como artefato documental no ciclo da MEDE [2] e como pré-condição para geração governada no Janus [7].

5. **Estudo de adoção e resistência**: investigar os fatores organizacionais, técnicos e cognitivos que facilitam ou dificultam a adoção da arquitetura isomórfica em equipes de desenvolvimento.

---

## 12. Conclusão

Este artigo apresentou o conceito de arquitetura isomórfica de software — uma organização estrutural de camadas e responsabilidades capaz de preservar a mesma topologia conceitual entre aplicações frontend, backend e múltiplas plataformas. A proposta é derivada de padrões consolidados na literatura — Clean Architecture [3], Domain-Driven Design [4] e Ports & Adapters [5] — e apresentada de forma unificada e aplicável a cinco tipos de plataforma: web SPA, web tradicional, desktop, console e CLI.

A contribuição central é a demonstração de que as camadas redundantes da aplicação web — `features/` e `services/` no frontend, `transport/` no backend — existem exclusivamente como artefatos da fronteira HTTP, e colapsam naturalmente em plataformas onde frontend e backend rodam no mesmo processo. Esse resultado, visualizado na Figura 4, oferece uma justificativa estrutural para a organização proposta que vai além da preferência de equipe ou da convenção de framework.

A propriedade de isomorfismo tem consequências práticas diretas: redução do custo cognitivo de transição entre tecnologias, facilitação da portabilidade de código e, em especial, aumento da efetividade de agentes de codificação baseados em IA que dependem de estruturas previsíveis para produzir artefatos corretos. Nesse sentido, este artigo contribui para o ecossistema da Engenharia de Software 4.0 [1] ao propor a arquitetura física do projeto como um mecanismo de governança do conhecimento da solução — estável o suficiente para ser seguido por qualquer agente, humano ou automatizado.

---

## Referências

[1] M. B. da Silva, "Engenharia de Software 4.0: da produção de código à governança do conhecimento da solução," 11Tech Desenvolvimento de Sistemas Ltda., Technical Report, 2024.

[2] M. B. da Silva, "MEDE — Metodologia de Engenharia Documental Evolutiva: Governança, Observabilidade e Preservação do Conhecimento na Construção de Software," 11Tech Desenvolvimento de Sistemas Ltda., Technical Report, 2024.

[3] R. C. Martin, *Clean Architecture: A Craftsman's Guide to Software Structure and Design*. Prentice Hall, 2017.

[4] E. Evans, *Domain-Driven Design: Tackling Complexity in the Heart of Software*. Addison-Wesley, 2003.

[5] A. Cockburn, "Hexagonal Architecture," 2005. [Online]. Available: https://alistair.cockburn.us/hexagonal-architecture/. [Accessed: May 2026].

[6] Feature-Sliced Design, "Feature-Sliced Design: Architectural methodology for frontend projects," 2023. [Online]. Available: https://feature-sliced.design. [Accessed: May 2026].

[7] M. B. da Silva, "Janus: Uma Infraestrutura de Produção de Software Baseada em Linguagens de Domínio e Projeção Tecnológica," 11Tech Desenvolvimento de Sistemas Ltda., Technical Report, 2024.

[8] V. Vernon, *Implementing Domain-Driven Design*. Addison-Wesley, 2013.

[9] M. Fowler, *Patterns of Enterprise Application Architecture*. Addison-Wesley, 2002.

[10] Anthropic, "Claude Code Documentation," 2026. [Online]. Available: https://docs.anthropic.com/claude-code. [Accessed: May 2026].

[11] OpenAI, "Codex CLI Documentation," 2026. [Online]. Available: https://platform.openai.com/docs/guides/code. [Accessed: May 2026].

[12] Google, "Gemini CLI Documentation," 2026. [Online]. Available: https://ai.google.dev/gemini-api/docs. [Accessed: May 2026].

[13] OWASP, "OWASP Top Ten 2021," 2021. [Online]. Available: https://owasp.org/www-project-top-ten/. [Accessed: May 2026].

[14] Nx, "Nx: Smart Monorepos, Fast CI," 2023. [Online]. Available: https://nx.dev. [Accessed: May 2026].

---




<!-- Referências de imagens (base64) -->
[fig1]: data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2ODAiIGhlaWdodD0iMzQwIiB2aWV3Qm94PSIwIDAgNjgwIDM0MCIgcm9sZT0iaW1nIj4KICA8dGl0bGU+RmlndXJhIDEg4oCUIFZpc8OjbyBnZXJhbDogYXBsaWNhw6fDo28gZW0gdHLDqnMgY2FtYWRhczwvdGl0bGU+CiAgPGRlc2M+RnJvbnRlbmQsIEJhY2tlbmQgZSBQZXJzaXN0w6puY2lhIGNvbW8gdHLDqnMgYmxvY29zIGNvbSBzZXRhcyBkZSBjb211bmljYcOnw6NvIGVudHJlIGVsZXM8L2Rlc2M+CiAgPGRlZnM+CiAgICA8bWFya2VyIGlkPSJhIiB2aWV3Qm94PSIwIDAgMTAgMTAiIHJlZlg9IjgiIHJlZlk9IjUiIG1hcmtlcldpZHRoPSI2IiBtYXJrZXJIZWlnaHQ9IjYiIG9yaWVudD0iYXV0by1zdGFydC1yZXZlcnNlIj4KICAgICAgPHBhdGggZD0iTTIgMUw4IDVMMiA5IiBmaWxsPSJub25lIiBzdHJva2U9ImNvbnRleHQtc3Ryb2tlIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CiAgICA8L21hcmtlcj4KICA8L2RlZnM+CiAgPHN0eWxlPgogICAgdGV4dCB7IGZvbnQtZmFtaWx5OiBzYW5zLXNlcmlmOyBmaWxsOiAjMmMyYzJhOyB9CiAgICAudGggeyBmb250LXNpemU6IDE0cHg7IGZvbnQtd2VpZ2h0OiA1MDA7IH0KICAgIC50cyB7IGZvbnQtc2l6ZTogMTJweDsgfQogICAgLmxibCB7IGZvbnQtc2l6ZTogMTFweDsgZmlsbDogIzVmNWU1YTsgfQogIDwvc3R5bGU+CgogIDwhLS0gRnJvbnRlbmQgLS0+CiAgPHJlY3QgeD0iNDAiIHk9IjYwIiB3aWR0aD0iMTcyIiBoZWlnaHQ9IjIyMCIgcng9IjEyIiBmaWxsPSIjRTZGMUZCIiBzdHJva2U9IiMxODVGQTUiIHN0cm9rZS13aWR0aD0iMC41Ii8+CiAgPHRleHQgY2xhc3M9InRoIiB4PSIxMjYiIHk9IjkwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Gcm9udGVuZDwvdGV4dD4KICA8dGV4dCBjbGFzcz0idHMiIHg9IjEyNiIgeT0iMTEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMTg1RkE1Ij5pbnRlcmZhY2UgZG8gdXN1w6FyaW88L3RleHQ+CiAgPHJlY3QgeD0iNjAiIHk9IjEyOCIgd2lkdGg9IjEzMiIgaGVpZ2h0PSIzNiIgcng9IjYiIGZpbGw9IiNCNUQ0RjQiIHN0cm9rZT0iIzE4NUZBNSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KICA8dGV4dCBjbGFzcz0idHMiIHg9IjEyNiIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj52aWV3LzwvdGV4dD4KICA8cmVjdCB4PSI2MCIgeT0iMTc0IiB3aWR0aD0iMTMyIiBoZWlnaHQ9IjM2IiByeD0iNiIgZmlsbD0iI0I1RDRGNCIgc3Ryb2tlPSIjMTg1RkE1IiBzdHJva2Utd2lkdGg9IjAuNSIvPgogIDx0ZXh0IGNsYXNzPSJ0cyIgeD0iMTI2IiB5PSIxOTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPmZlYXR1cmVzLzwvdGV4dD4KICA8cmVjdCB4PSI2MCIgeT0iMjIwIiB3aWR0aD0iMTMyIiBoZWlnaHQ9IjM2IiByeD0iNiIgZmlsbD0iI0I1RDRGNCIgc3Ryb2tlPSIjMTg1RkE1IiBzdHJva2Utd2lkdGg9IjAuNSIvPgogIDx0ZXh0IGNsYXNzPSJ0cyIgeD0iMTI2IiB5PSIyNDIiIHRleHQtYW5jaG9yPSJtaWRkbGUiPmNvcmUvIMK3IHNoYXJlZC88L3RleHQ+CgogIDwhLS0gU2V0YXMgRkUg4oaUIEJFIC0tPgogIDxsaW5lIHgxPSIyMTQiIHkxPSIxNzAiIHgyPSIyNTQiIHkyPSIxNzAiIHN0cm9rZT0iIzM3OEFERCIgc3Ryb2tlLXdpZHRoPSIxLjUiIG1hcmtlci1lbmQ9InVybCgjYSkiLz4KICA8bGluZSB4MT0iMjU0IiB5MT0iMTkwIiB4Mj0iMjE0IiB5Mj0iMTkwIiBzdHJva2U9IiMzNzhBREQiIHN0cm9rZS13aWR0aD0iMS41IiBtYXJrZXItZW5kPSJ1cmwoI2EpIi8+CiAgPHRleHQgY2xhc3M9ImxibCIgeD0iMjM0IiB5PSIxNjMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlJFU1Q8L3RleHQ+CiAgPHRleHQgY2xhc3M9ImxibCIgeD0iMjM0IiB5PSIyMDMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkpTT048L3RleHQ+CgogIDwhLS0gQmFja2VuZCAtLT4KICA8cmVjdCB4PSIyNTYiIHk9IjYwIiB3aWR0aD0iMTcyIiBoZWlnaHQ9IjIyMCIgcng9IjEyIiBmaWxsPSIjRUVFREZFIiBzdHJva2U9IiM1MzRBQjciIHN0cm9rZS13aWR0aD0iMC41Ii8+CiAgPHRleHQgY2xhc3M9InRoIiB4PSIzNDIiIHk9IjkwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CYWNrZW5kPC90ZXh0PgogIDx0ZXh0IGNsYXNzPSJ0cyIgeD0iMzQyIiB5PSIxMTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM1MzRBQjciPmzDs2dpY2EgZGUgbmVnw7NjaW88L3RleHQ+CiAgPHJlY3QgeD0iMjc2IiB5PSIxMjgiIHdpZHRoPSIxMzIiIGhlaWdodD0iMzYiIHJ4PSI2IiBmaWxsPSIjQ0VDQkY2IiBzdHJva2U9IiM1MzRBQjciIHN0cm9rZS13aWR0aD0iMC41Ii8+CiAgPHRleHQgY2xhc3M9InRzIiB4PSIzNDIiIHk9IjE1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+dHJhbnNwb3J0LzwvdGV4dD4KICA8cmVjdCB4PSIyNzYiIHk9IjE3NCIgd2lkdGg9IjEzMiIgaGVpZ2h0PSIzNiIgcng9IjYiIGZpbGw9IiNDRUNCRjYiIHN0cm9rZT0iIzUzNEFCNyIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KICA8dGV4dCBjbGFzcz0idHMiIHg9IjM0MiIgeT0iMTk2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5hcHBsaWNhdGlvbi88L3RleHQ+CiAgPHJlY3QgeD0iMjc2IiB5PSIyMjAiIHdpZHRoPSIxMzIiIGhlaWdodD0iMzYiIHJ4PSI2IiBmaWxsPSIjQ0VDQkY2IiBzdHJva2U9IiM1MzRBQjciIHN0cm9rZS13aWR0aD0iMC41Ii8+CiAgPHRleHQgY2xhc3M9InRzIiB4PSIzNDIiIHk9IjI0MiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+aW5mcmFzdHJ1Y3R1cmUvPC90ZXh0PgoKICA8IS0tIFNldGFzIEJFIOKGlCBEQiAtLT4KICA8bGluZSB4MT0iNDMwIiB5MT0iMTcwIiB4Mj0iNDcwIiB5Mj0iMTcwIiBzdHJva2U9IiM3Rjc3REQiIHN0cm9rZS13aWR0aD0iMS41IiBtYXJrZXItZW5kPSJ1cmwoI2EpIi8+CiAgPGxpbmUgeDE9IjQ3MCIgeTE9IjE5MCIgeDI9IjQzMCIgeTI9IjE5MCIgc3Ryb2tlPSIjN0Y3N0REIiBzdHJva2Utd2lkdGg9IjEuNSIgbWFya2VyLWVuZD0idXJsKCNhKSIvPgogIDx0ZXh0IGNsYXNzPSJsYmwiIHg9IjQ1MCIgeT0iMTYzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TUUw8L3RleHQ+CiAgPHRleHQgY2xhc3M9ImxibCIgeD0iNDUwIiB5PSIyMDMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPnJvd3M8L3RleHQ+CgogIDwhLS0gUGVyc2lzdMOqbmNpYSAtLT4KICA8cmVjdCB4PSI0NzIiIHk9IjYwIiB3aWR0aD0iMTcyIiBoZWlnaHQ9IjIyMCIgcng9IjEyIiBmaWxsPSIjRTFGNUVFIiBzdHJva2U9IiMwRjZFNTYiIHN0cm9rZS13aWR0aD0iMC41Ii8+CiAgPHRleHQgY2xhc3M9InRoIiB4PSI1NTgiIHk9IjkwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5QZXJzaXN0w6puY2lhPC90ZXh0PgogIDx0ZXh0IGNsYXNzPSJ0cyIgeD0iNTU4IiB5PSIxMTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMwRjZFNTYiPmRhZG9zIGUgZXN0YWRvPC90ZXh0PgogIDxyZWN0IHg9IjQ5MiIgeT0iMTI4IiB3aWR0aD0iMTMyIiBoZWlnaHQ9IjM2IiByeD0iNiIgZmlsbD0iIzlGRTFDQiIgc3Ryb2tlPSIjMEY2RTU2IiBzdHJva2Utd2lkdGg9IjAuNSIvPgogIDx0ZXh0IGNsYXNzPSJ0cyIgeD0iNTU4IiB5PSIxNTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPmJhbmNvIHJlbGFjaW9uYWw8L3RleHQ+CiAgPHJlY3QgeD0iNDkyIiB5PSIxNzQiIHdpZHRoPSIxMzIiIGhlaWdodD0iMzYiIHJ4PSI2IiBmaWxsPSIjOUZFMUNCIiBzdHJva2U9IiMwRjZFNTYiIHN0cm9rZS13aWR0aD0iMC41Ii8+CiAgPHRleHQgY2xhc3M9InRzIiB4PSI1NTgiIHk9IjE5NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+YmFuY28gZG9jdW1lbnRvczwvdGV4dD4KICA8cmVjdCB4PSI0OTIiIHk9IjIyMCIgd2lkdGg9IjEzMiIgaGVpZ2h0PSIzNiIgcng9IjYiIGZpbGw9IiM5RkUxQ0IiIHN0cm9rZT0iIzBGNkU1NiIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KICA8dGV4dCBjbGFzcz0idHMiIHg9IjU1OCIgeT0iMjQyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5hcnF1aXZvIMK3IGNhY2hlPC90ZXh0PgoKICA8IS0tIFVzdcOhcmlvIC0tPgogIDx0ZXh0IGNsYXNzPSJsYmwiIHg9IjEyNiIgeT0iNDQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPnVzdcOhcmlvPC90ZXh0PgogIDxsaW5lIHgxPSIxMjYiIHkxPSI1MCIgeDI9IjEyNiIgeTI9IjU4IiBzdHJva2U9IiMzNzhBREQiIHN0cm9rZS13aWR0aD0iMSIgbWFya2VyLWVuZD0idXJsKCNhKSIvPgo8L3N2Zz4=
[fig2]: data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2ODAiIGhlaWdodD0iNDYwIiB2aWV3Qm94PSIwIDAgNjgwIDQ2MCIgcm9sZT0iaW1nIj4KICA8dGl0bGU+RmlndXJhIDIg4oCUIENhbWFkYXMgaW50ZXJuYXMgZG8gZnJvbnRlbmQ8L3RpdGxlPgogIDxkZXNjPkNhbWFkYXMgZG8gZnJvbnRlbmQgc2VwYXJhZGFzIGVudHJlIG8gcXVlIG11ZGEgcG9yIHBsYXRhZm9ybWEgZSBvIHF1ZSBudW5jYSBtdWRhPC9kZXNjPgogIDxzdHlsZT4KICAgIHRleHQgeyBmb250LWZhbWlseTogc2Fucy1zZXJpZjsgZmlsbDogIzJjMmMyYTsgfQogICAgLnRoIHsgZm9udC1zaXplOiAxNHB4OyBmb250LXdlaWdodDogNTAwOyB9CiAgICAudHMgeyBmb250LXNpemU6IDEycHg7IH0KICAgIC5sYmwgeyBmb250LXNpemU6IDExcHg7IGZpbGw6ICM1ZjVlNWE7IH0KICA8L3N0eWxlPgogIDxkZWZzPgogICAgPG1hcmtlciBpZD0iYSIgdmlld0JveD0iMCAwIDEwIDEwIiByZWZYPSI4IiByZWZZPSI1IiBtYXJrZXJXaWR0aD0iNiIgbWFya2VySGVpZ2h0PSI2IiBvcmllbnQ9ImF1dG8tc3RhcnQtcmV2ZXJzZSI+CiAgICAgIDxwYXRoIGQ9Ik0yIDFMOCA1TDIgOSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjb250ZXh0LXN0cm9rZSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgogICAgPC9tYXJrZXI+CiAgPC9kZWZzPgoKICA8IS0tIEZhaXhhIG11ZGEgcG9yIHBsYXRhZm9ybWEgLS0+CiAgPHJlY3QgeD0iNDAiIHk9IjI4IiB3aWR0aD0iNjAwIiBoZWlnaHQ9IjE2IiByeD0iNCIgZmlsbD0iI0U2RjFGQiIgc3Ryb2tlPSIjMTg1RkE1IiBzdHJva2Utd2lkdGg9IjAuNSIvPgogIDx0ZXh0IGNsYXNzPSJ0cyIgeD0iMzQwIiB5PSI0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzBDNDQ3QyI+bXVkYSBwb3IgcGxhdGFmb3JtYTwvdGV4dD4KCiAgPCEtLSBhcHAvIGNvbmZpZy8gLS0+CiAgPHJlY3QgeD0iNDAiIHk9IjU0IiB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQ0IiByeD0iOCIgZmlsbD0iI0U2RjFGQiIgc3Ryb2tlPSIjMTg1RkE1IiBzdHJva2Utd2lkdGg9IjAuNSIvPgogIDx0ZXh0IGNsYXNzPSJ0aCIgeD0iMzQwIiB5PSI3NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzBDNDQ3QyI+YXBwLyDCtyBjb25maWcvIMK3IGFzc2V0cy8gwrcgc3R5bGVzLzwvdGV4dD4KICA8dGV4dCBjbGFzcz0ibGJsIiB4PSI2NDAiIHk9IjgwIiB0ZXh0LWFuY2hvcj0iZW5kIj5ib290c3RyYXA8L3RleHQ+CgogIDwhLS0gY29yZS8gLS0+CiAgPHJlY3QgeD0iNDAiIHk9IjExMCIgd2lkdGg9IjYwMCIgaGVpZ2h0PSI1NiIgcng9IjgiIGZpbGw9IiNFNkYxRkIiIHN0cm9rZT0iIzE4NUZBNSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KICA8dGV4dCBjbGFzcz0idGgiIHg9IjM0MCIgeT0iMTMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMEM0NDdDIj5jb3JlLzwvdGV4dD4KICA8dGV4dCBjbGFzcz0idHMiIHg9IjM0MCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMTg1RkE1Ij5hdXRoIMK3IGh0dHAgwrcgc2Vzc2lvbiDCtyBlcnJvcnMgwrcgc2VjdXJpdHkgwrcgcGVybWlzc2lvbnM8L3RleHQ+CgogIDwhLS0gdmlldy8gLS0+CiAgPHJlY3QgeD0iNDAiIHk9IjE3OCIgd2lkdGg9IjYwMCIgaGVpZ2h0PSI1NiIgcng9IjgiIGZpbGw9IiNFNkYxRkIiIHN0cm9rZT0iIzE4NUZBNSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KICA8dGV4dCBjbGFzcz0idGgiIHg9IjM0MCIgeT0iMTk4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMEM0NDdDIj52aWV3LzwvdGV4dD4KICA8dGV4dCBjbGFzcz0idHMiIHg9IjM0MCIgeT0iMjE4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMTg1RkE1Ij50ZWxhcyDCtyB1c2UtY2FzZXMgwrcgbmF2ZWdhw6fDo288L3RleHQ+CgogIDwhLS0gRmFpeGEgbnVuY2EgbXVkYSAtLT4KICA8cmVjdCB4PSI0MCIgeT0iMjQ4IiB3aWR0aD0iNjAwIiBoZWlnaHQ9IjE2IiByeD0iNCIgZmlsbD0iI0ZBRUVEQSIgc3Ryb2tlPSIjODU0RjBCIiBzdHJva2Utd2lkdGg9IjAuNSIvPgogIDx0ZXh0IGNsYXNzPSJ0cyIgeD0iMzQwIiB5PSIyNjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2MzM4MDYiPm51bmNhIG11ZGEg4oCUIG8gbmVnw7NjaW88L3RleHQ+CgogIDwhLS0gZmVhdHVyZXMvIC0tPgogIDxyZWN0IHg9IjQwIiB5PSIyNzQiIHdpZHRoPSI2MDAiIGhlaWdodD0iNTYiIHJ4PSI4IiBmaWxsPSIjRkFFRURBIiBzdHJva2U9IiM4NTRGMEIiIHN0cm9rZS13aWR0aD0iMC41Ii8+CiAgPHRleHQgY2xhc3M9InRoIiB4PSIzNDAiIHk9IjI5NCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzYzMzgwNiI+ZmVhdHVyZXMvPC90ZXh0PgogIDx0ZXh0IGNsYXNzPSJ0cyIgeD0iMzQwIiB5PSIzMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM4NTRGMEIiPkRUT3MgwrcgSVNlcnZpY2VzIMK3IGNvbnRyYXRvcyBkZSBkb23DrW5pbzwvdGV4dD4KCiAgPCEtLSBzZXJ2aWNlcy8gLS0+CiAgPHJlY3QgeD0iNDAiIHk9IjM0MiIgd2lkdGg9IjYwMCIgaGVpZ2h0PSI1NiIgcng9IjgiIGZpbGw9IiNGQUVFREEiIHN0cm9rZT0iIzg1NEYwQiIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KICA8dGV4dCBjbGFzcz0idGgiIHg9IjM0MCIgeT0iMzYyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjMzODA2Ij5zZXJ2aWNlcy88L3RleHQ+CiAgPHRleHQgY2xhc3M9InRzIiB4PSIzNDAiIHk9IjM4MiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzg1NEYwQiI+aW1wbGVtZW50YcOnw6NvIGRvcyBJU2VydmljZXMgKFJFU1QsIG1vY2ssIGxvY2FsKTwvdGV4dD4KCiAgPCEtLSBzaGFyZWQvIC0tPgogIDxyZWN0IHg9IjQwIiB5PSI0MTAiIHdpZHRoPSI2MDAiIGhlaWdodD0iMzIiIHJ4PSI4IiBmaWxsPSIjRjFFRkU4IiBzdHJva2U9IiM1RjVFNUEiIHN0cm9rZS13aWR0aD0iMC41Ii8+CiAgPHRleHQgY2xhc3M9InRoIiB4PSIzNDAiIHk9IjQyOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzQ0NDQ0MSI+c2hhcmVkLyDigJQgY29tcG9uZW50cyDCtyBob29rcyDCtyBsaWIgwrcgdHlwZXMgwrcgY29uc3RhbnRzPC90ZXh0PgoKICA8IS0tIFNldGFzIC0tPgogIDxsaW5lIHgxPSIzNDAiIHkxPSIxMDAiIHgyPSIzNDAiIHkyPSIxMDgiIHN0cm9rZT0iIzM3OEFERCIgc3Ryb2tlLXdpZHRoPSIxIiBtYXJrZXItZW5kPSJ1cmwoI2EpIi8+CiAgPGxpbmUgeDE9IjM0MCIgeTE9IjE2OCIgeDI9IjM0MCIgeTI9IjE3NiIgc3Ryb2tlPSIjMzc4QUREIiBzdHJva2Utd2lkdGg9IjEiIG1hcmtlci1lbmQ9InVybCgjYSkiLz4KICA8bGluZSB4MT0iMzQwIiB5MT0iMjM2IiB4Mj0iMzQwIiB5Mj0iMjcyIiBzdHJva2U9IiNCQTc1MTciIHN0cm9rZS13aWR0aD0iMSIgbWFya2VyLWVuZD0idXJsKCNhKSIvPgogIDxsaW5lIHgxPSIzNDAiIHkxPSIzMzIiIHgyPSIzNDAiIHkyPSIzNDAiIHN0cm9rZT0iI0JBNzUxNyIgc3Ryb2tlLXdpZHRoPSIxIiBtYXJrZXItZW5kPSJ1cmwoI2EpIi8+CiAgPGxpbmUgeDE9IjM0MCIgeTE9IjQwMCIgeDI9IjM0MCIgeTI9IjQwOCIgc3Ryb2tlPSIjODg4NzgwIiBzdHJva2Utd2lkdGg9IjEiIG1hcmtlci1lbmQ9InVybCgjYSkiLz4KCiAgPCEtLSBMZWdlbmRhIC0tPgogIDxyZWN0IHg9IjQwIiB5PSI0NDgiIHdpZHRoPSIxMiIgaGVpZ2h0PSI4IiByeD0iMiIgZmlsbD0iI0U2RjFGQiIgc3Ryb2tlPSIjMTg1RkE1IiBzdHJva2Utd2lkdGg9IjAuNSIvPgogIDx0ZXh0IGNsYXNzPSJsYmwiIHg9IjU4IiB5PSI0NTYiPm11ZGEgcG9yIHBsYXRhZm9ybWE8L3RleHQ+CiAgPHJlY3QgeD0iMjIwIiB5PSI0NDgiIHdpZHRoPSIxMiIgaGVpZ2h0PSI4IiByeD0iMiIgZmlsbD0iI0ZBRUVEQSIgc3Ryb2tlPSIjODU0RjBCIiBzdHJva2Utd2lkdGg9IjAuNSIvPgogIDx0ZXh0IGNsYXNzPSJsYmwiIHg9IjIzOCIgeT0iNDU2Ij5udW5jYSBtdWRhPC90ZXh0PgogIDxyZWN0IHg9IjM2MCIgeT0iNDQ4IiB3aWR0aD0iMTIiIGhlaWdodD0iOCIgcng9IjIiIGZpbGw9IiNGMUVGRTgiIHN0cm9rZT0iIzVGNUU1QSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KICA8dGV4dCBjbGFzcz0ibGJsIiB4PSIzNzgiIHk9IjQ1NiI+Y29tcGFydGlsaGFkbzwvdGV4dD4KPC9zdmc+
[fig3]: data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2ODAiIGhlaWdodD0iNDkwIiB2aWV3Qm94PSIwIDAgNjgwIDQ5MCIgcm9sZT0iaW1nIj4KICA8dGl0bGU+RmlndXJhIDMg4oCUIENhbWFkYXMgaW50ZXJuYXMgZG8gYmFja2VuZDwvdGl0bGU+CiAgPGRlc2M+RXN0cnV0dXJhIGludGVybmEgZG8gYmFja2VuZCBjb20gY29ycmVzcG9uZMOqbmNpYSDDoHMgY2FtYWRhcyBkbyBmcm9udGVuZDwvZGVzYz4KICA8c3R5bGU+CiAgICB0ZXh0IHsgZm9udC1mYW1pbHk6IHNhbnMtc2VyaWY7IGZpbGw6ICMyYzJjMmE7IH0KICAgIC50aCB7IGZvbnQtc2l6ZTogMTRweDsgZm9udC13ZWlnaHQ6IDUwMDsgfQogICAgLnRzIHsgZm9udC1zaXplOiAxMnB4OyB9CiAgICAubGJsIHsgZm9udC1zaXplOiAxMXB4OyBmaWxsOiAjNWY1ZTVhOyB9CiAgPC9zdHlsZT4KICA8ZGVmcz4KICAgIDxtYXJrZXIgaWQ9ImEiIHZpZXdCb3g9IjAgMCAxMCAxMCIgcmVmWD0iOCIgcmVmWT0iNSIgbWFya2VyV2lkdGg9IjYiIG1hcmtlckhlaWdodD0iNiIgb3JpZW50PSJhdXRvLXN0YXJ0LXJldmVyc2UiPgogICAgICA8cGF0aCBkPSJNMiAxTDggNUwyIDkiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY29udGV4dC1zdHJva2UiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KICAgIDwvbWFya2VyPgogIDwvZGVmcz4KCiAgPCEtLSBGYWl4YSBtdWRhIHBvciBwcm90b2NvbG8gLS0+CiAgPHJlY3QgeD0iNDAiIHk9IjI4IiB3aWR0aD0iNjAwIiBoZWlnaHQ9IjE2IiByeD0iNCIgZmlsbD0iI0VFRURGRSIgc3Ryb2tlPSIjNTM0QUI3IiBzdHJva2Utd2lkdGg9IjAuNSIvPgogIDx0ZXh0IGNsYXNzPSJ0cyIgeD0iMzQwIiB5PSI0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzNDMzQ4OSI+bXVkYSBwb3IgcHJvdG9jb2xvIC8gdGVjbm9sb2dpYTwvdGV4dD4KCiAgPCEtLSBhcHAvIGNvbmZpZy8gLS0+CiAgPHJlY3QgeD0iNDAiIHk9IjU0IiB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQ0IiByeD0iOCIgZmlsbD0iI0VFRURGRSIgc3Ryb2tlPSIjNTM0QUI3IiBzdHJva2Utd2lkdGg9IjAuNSIvPgogIDx0ZXh0IGNsYXNzPSJ0aCIgeD0iMzQwIiB5PSI3NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzNDMzQ4OSI+YXBwLyDCtyBjb25maWcvPC90ZXh0PgoKICA8IS0tIGNvcmUvIC0tPgogIDxyZWN0IHg9IjQwIiB5PSIxMTAiIHdpZHRoPSI2MDAiIGhlaWdodD0iNTYiIHJ4PSI4IiBmaWxsPSIjRUVFREZFIiBzdHJva2U9IiM1MzRBQjciIHN0cm9rZS13aWR0aD0iMC41Ii8+CiAgPHRleHQgY2xhc3M9InRoIiB4PSIzNDAiIHk9IjEzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzNDMzQ4OSI+Y29yZS88L3RleHQ+CiAgPHRleHQgY2xhc3M9InRzIiB4PSIzNDAiIHk9IjE1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzUzNEFCNyI+YXV0aCDCtyBsb2dnaW5nIMK3IGRhdGFiYXNlIMK3IG9ic2VydmFiaWxpZGFkZSDCtyBlcnJvcnMgwrcgc2Vzc2lvbjwvdGV4dD4KCiAgPCEtLSB0cmFuc3BvcnQvIC0tPgogIDxyZWN0IHg9IjQwIiB5PSIxNzgiIHdpZHRoPSI2MDAiIGhlaWdodD0iNTYiIHJ4PSI4IiBmaWxsPSIjRUVFREZFIiBzdHJva2U9IiM1MzRBQjciIHN0cm9rZS13aWR0aD0iMC41Ii8+CiAgPHRleHQgY2xhc3M9InRoIiB4PSIzNDAiIHk9IjE5OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzNDMzQ4OSI+dHJhbnNwb3J0LzwvdGV4dD4KICA8dGV4dCBjbGFzcz0idHMiIHg9IjM0MCIgeT0iMjE4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNTM0QUI3Ij5SRVNUIGNvbnRyb2xsZXJzIMK3IGdSUEMgwrcgQ0xJIGNvbW1hbmRzIMK3IHdvcmtlcnM8L3RleHQ+CgogIDwhLS0gRmFpeGEgbnVuY2EgbXVkYSAtLT4KICA8cmVjdCB4PSI0MCIgeT0iMjQ4IiB3aWR0aD0iNjAwIiBoZWlnaHQ9IjE2IiByeD0iNCIgZmlsbD0iI0ZBRUVEQSIgc3Ryb2tlPSIjODU0RjBCIiBzdHJva2Utd2lkdGg9IjAuNSIvPgogIDx0ZXh0IGNsYXNzPSJ0cyIgeD0iMzQwIiB5PSIyNjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2MzM4MDYiPm51bmNhIG11ZGEg4oCUIG8gbmVnw7NjaW88L3RleHQ+CgogIDwhLS0gYXBwbGljYXRpb24vIC0tPgogIDxyZWN0IHg9IjQwIiB5PSIyNzQiIHdpZHRoPSI2MDAiIGhlaWdodD0iNTYiIHJ4PSI4IiBmaWxsPSIjRkFFRURBIiBzdHJva2U9IiM4NTRGMEIiIHN0cm9rZS13aWR0aD0iMC41Ii8+CiAgPHRleHQgY2xhc3M9InRoIiB4PSIzNDAiIHk9IjI5NCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzYzMzgwNiI+YXBwbGljYXRpb24vPC90ZXh0PgogIDx0ZXh0IGNsYXNzPSJ0cyIgeD0iMzQwIiB5PSIzMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM4NTRGMEIiPmVudGl0aWVzIMK3IERUT3MgwrcgSVNlcnZpY2VzIMK3IElSZXBvc2l0b3JpZXMgwrcgdXNlLWNhc2VzPC90ZXh0PgoKICA8IS0tIHNlcnZpY2VzLyAtLT4KICA8cmVjdCB4PSI0MCIgeT0iMzQyIiB3aWR0aD0iNjAwIiBoZWlnaHQ9IjU2IiByeD0iOCIgZmlsbD0iI0ZBRUVEQSIgc3Ryb2tlPSIjODU0RjBCIiBzdHJva2Utd2lkdGg9IjAuNSIvPgogIDx0ZXh0IGNsYXNzPSJ0aCIgeD0iMzQwIiB5PSIzNjIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2MzM4MDYiPnNlcnZpY2VzLzwvdGV4dD4KICA8dGV4dCBjbGFzcz0idHMiIHg9IjM0MCIgeT0iMzgyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjODU0RjBCIj5pbXBsZW1lbnRhw6fDo28gZG9zIElTZXJ2aWNlcyDigJQgbMOzZ2ljYSBkZSBuZWfDs2NpbzwvdGV4dD4KCiAgPCEtLSBpbmZyYXN0cnVjdHVyZS8gLS0+CiAgPHJlY3QgeD0iNDAiIHk9IjQxMCIgd2lkdGg9IjYwMCIgaGVpZ2h0PSI0NCIgcng9IjgiIGZpbGw9IiNFRUVERkUiIHN0cm9rZT0iIzUzNEFCNyIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KICA8dGV4dCBjbGFzcz0idGgiIHg9IjM0MCIgeT0iNDI2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjM0MzNDg5Ij5pbmZyYXN0cnVjdHVyZS88L3RleHQ+CiAgPHRleHQgY2xhc3M9InRzIiB4PSIzNDAiIHk9IjQ0NCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzUzNEFCNyI+aW1wbGVtZW50YcOnw6NvIGRvcyBJUmVwb3NpdG9yaWVzIOKAlCBQb3N0Z3JlcyDCtyBNb25nbyDCtyBSZWRpcyDCtyBhcnF1aXZvPC90ZXh0PgoKICA8IS0tIHNoYXJlZC8gLS0+CiAgPHJlY3QgeD0iNDAiIHk9IjQ2NiIgd2lkdGg9IjYwMCIgaGVpZ2h0PSIxNCIgcng9IjYiIGZpbGw9IiNGMUVGRTgiIHN0cm9rZT0iIzVGNUU1QSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KICA8dGV4dCBjbGFzcz0idHMiIHg9IjM0MCIgeT0iNDc3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNDQ0NDQxIj5zaGFyZWQvIOKAlCBsaWIgwrcgdHlwZXMgwrcgY29uc3RhbnRzIMK3IGRlY29yYXRvcnM8L3RleHQ+CgogIDwhLS0gU2V0YXMgLS0+CiAgPGxpbmUgeDE9IjM0MCIgeTE9IjEwMCIgeDI9IjM0MCIgeTI9IjEwOCIgc3Ryb2tlPSIjN0Y3N0REIiBzdHJva2Utd2lkdGg9IjEiIG1hcmtlci1lbmQ9InVybCgjYSkiLz4KICA8bGluZSB4MT0iMzQwIiB5MT0iMTY4IiB4Mj0iMzQwIiB5Mj0iMTc2IiBzdHJva2U9IiM3Rjc3REQiIHN0cm9rZS13aWR0aD0iMSIgbWFya2VyLWVuZD0idXJsKCNhKSIvPgogIDxsaW5lIHgxPSIzNDAiIHkxPSIyMzYiIHgyPSIzNDAiIHkyPSIyNzIiIHN0cm9rZT0iI0JBNzUxNyIgc3Ryb2tlLXdpZHRoPSIxIiBtYXJrZXItZW5kPSJ1cmwoI2EpIi8+CiAgPGxpbmUgeDE9IjM0MCIgeTE9IjMzMiIgeDI9IjM0MCIgeTI9IjM0MCIgc3Ryb2tlPSIjQkE3NTE3IiBzdHJva2Utd2lkdGg9IjEiIG1hcmtlci1lbmQ9InVybCgjYSkiLz4KICA8bGluZSB4MT0iMzQwIiB5MT0iNDAwIiB4Mj0iMzQwIiB5Mj0iNDA4IiBzdHJva2U9IiM3Rjc3REQiIHN0cm9rZS13aWR0aD0iMSIgbWFya2VyLWVuZD0idXJsKCNhKSIvPgo8L3N2Zz4=
[fig4]: data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2ODAiIGhlaWdodD0iNzIwIiB2aWV3Qm94PSIwIDAgNjgwIDcyMCIgcm9sZT0iaW1nIj4KICA8dGl0bGU+RmlndXJhIDQg4oCUIFdlYiB2ZXJzdXMgZGVza3RvcDogbyBjdXN0byBkYSBmcm9udGVpcmEgSFRUUDwvdGl0bGU+CiAgPGRlc2M+Tm8gd2ViLCBhIGZyb250ZWlyYSBIVFRQIGZvcsOnYSBkdXBsaWNhw6fDo28gZGUgZmVhdHVyZXMgZSBzZXJ2aWNlcyBub3MgZG9pcyBsYWRvcy4gTm8gZGVza3RvcCwgZXNzYSBmcm9udGVpcmEgZGVzYXBhcmVjZTogYXBwbGljYXRpb24gZSBzZXJ2aWNlcyBleGlzdGVtIHVtYSDDum5pY2EgdmV6LCBzZW0gdHJhbnNwb3J0LCBzZW0gc2VyaWFsaXphw6fDo28uPC9kZXNjPgogIDxzdHlsZT4KICAgIHRleHQgeyBmb250LWZhbWlseTogc2Fucy1zZXJpZjsgZmlsbDogIzJjMmMyYTsgfQogICAgLnRoIHsgZm9udC1zaXplOiAxNHB4OyBmb250LXdlaWdodDogNTAwOyB9CiAgICAudHMgeyBmb250LXNpemU6IDEycHg7IH0KICAgIC50bSB7IGZvbnQtc2l6ZTogMTBweDsgZmlsbDogIzVmNWU1YTsgfQogIDwvc3R5bGU+CiAgPGRlZnM+CiAgICA8bWFya2VyIGlkPSJhcnIiIHZpZXdCb3g9IjAgMCAxMCAxMCIgcmVmWD0iOCIgcmVmWT0iNSIgbWFya2VyV2lkdGg9IjYiIG1hcmtlckhlaWdodD0iNiIgb3JpZW50PSJhdXRvLXN0YXJ0LXJldmVyc2UiPgogICAgICA8cGF0aCBkPSJNMiAxTDggNUwyIDkiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY29udGV4dC1zdHJva2UiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KICAgIDwvbWFya2VyPgogIDwvZGVmcz4KCiAgPCEtLSBUw41UVUxPUyAtLT4KICA8cmVjdCB4PSIzMCIgeT0iMTIiIHdpZHRoPSIyOTAiIGhlaWdodD0iMjgiIHJ4PSI2IiBmaWxsPSIjRTZGMUZCIiBzdHJva2U9IiMxODVGQTUiIHN0cm9rZS13aWR0aD0iMC41Ii8+CiAgPHRleHQgY2xhc3M9InRoIiB4PSIxNzUiIHk9IjI2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZmlsbD0iIzBDNDQ3QyI+YXBsaWNhw6fDo28gd2ViIChTUEEgKyBiYWNrZW5kKTwvdGV4dD4KICA8cmVjdCB4PSIzNjAiIHk9IjEyIiB3aWR0aD0iMjkwIiBoZWlnaHQ9IjI4IiByeD0iNiIgZmlsbD0iI0ZBRUNFNyIgc3Ryb2tlPSIjOTkzQzFEIiBzdHJva2Utd2lkdGg9IjAuNSIvPgogIDx0ZXh0IGNsYXNzPSJ0aCIgeD0iNTA1IiB5PSIyNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiIGZpbGw9IiM3MTJCMTMiPmFwbGljYcOnw6NvIGRlc2t0b3A8L3RleHQ+CgogIDwhLS0gTEFCRUxTIGZyb250ZW5kIC0tPgogIDx0ZXh0IGNsYXNzPSJ0cyIgeD0iMTc1IiB5PSI1NCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzVmNWU1YSI+ZnJvbnRlbmQ8L3RleHQ+CiAgPHRleHQgY2xhc3M9InRzIiB4PSI1MDUiIHk9IjU0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNWY1ZTVhIj5mcm9udGVuZDwvdGV4dD4KCiAgPCEtLSB2aWV3LyB3ZWIgLS0+CiAgPHJlY3QgeD0iMzAiIHk9IjYwIiB3aWR0aD0iMjkwIiBoZWlnaHQ9IjQ0IiByeD0iOCIgZmlsbD0iI0U2RjFGQiIgc3Ryb2tlPSIjMTg1RkE1IiBzdHJva2Utd2lkdGg9IjAuNSIvPgogIDx0ZXh0IGNsYXNzPSJ0aCIgeD0iMTc1IiB5PSI3OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiIGZpbGw9IiMwQzQ0N0MiPnZpZXcvPC90ZXh0PgogIDx0ZXh0IGNsYXNzPSJ0cyIgeD0iMTc1IiB5PSI5NCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiIGZpbGw9IiMxODVGQTUiPnRlbGFzIEhUTUwgwrcgQ1NTIMK3IEpTIMK3IHVzZS1jYXNlczwvdGV4dD4KICA8IS0tIHZpZXcvIGRlc2t0b3AgLS0+CiAgPHJlY3QgeD0iMzYwIiB5PSI2MCIgd2lkdGg9IjI5MCIgaGVpZ2h0PSI0NCIgcng9IjgiIGZpbGw9IiNGQUVDRTciIHN0cm9rZT0iIzk5M0MxRCIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KICA8dGV4dCBjbGFzcz0idGgiIHg9IjUwNSIgeT0iNzgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIiBmaWxsPSIjNzEyQjEzIj52aWV3LzwvdGV4dD4KICA8dGV4dCBjbGFzcz0idHMiIHg9IjUwNSIgeT0iOTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIiBmaWxsPSIjOTkzQzFEIj5Gb3JtcyDCtyBYQU1MIMK3IHVzZS1jYXNlczwvdGV4dD4KICA8bGluZSB4MT0iMzIyIiB5MT0iODIiIHgyPSIzNTgiIHkyPSI4MiIgc3Ryb2tlPSIjODg4NzgwIiBzdHJva2Utd2lkdGg9IjAuNSIgc3Ryb2tlLWRhc2hhcnJheT0iMyAzIi8+CiAgPHRleHQgY2xhc3M9InRzIiB4PSIzNDAiIHk9Ijg3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNWY1ZTVhIj7iiaA8L3RleHQ+CgogIDwhLS0gZmVhdHVyZXMvIGZyb250ZW5kIHdlYiAtLT4KICA8cmVjdCB4PSIzMCIgeT0iMTE0IiB3aWR0aD0iMjkwIiBoZWlnaHQ9IjQ0IiByeD0iOCIgZmlsbD0iI0ZBRUVEQSIgc3Ryb2tlPSIjODU0RjBCIiBzdHJva2Utd2lkdGg9IjAuNSIvPgogIDx0ZXh0IGNsYXNzPSJ0aCIgeD0iMTc1IiB5PSIxMzIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIiBmaWxsPSIjNjMzODA2Ij5mZWF0dXJlcy8gPHRzcGFuIGNsYXNzPSJ0bSI+KGZyb250ZW5kKTwvdHNwYW4+PC90ZXh0PgogIDx0ZXh0IGNsYXNzPSJ0cyIgeD0iMTc1IiB5PSIxNDgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIiBmaWxsPSIjODU0RjBCIj5EVE9zIMK3IElTZXJ2aWNlcyDigJQgdGlwb3MgbmF0aXZvcyBKUy9UUzwvdGV4dD4KCiAgPCEtLSBzZXJ2aWNlcy8gZnJvbnRlbmQgd2ViIC0tPgogIDxyZWN0IHg9IjMwIiB5PSIxNjgiIHdpZHRoPSIyOTAiIGhlaWdodD0iNDQiIHJ4PSI4IiBmaWxsPSIjRkFFRURBIiBzdHJva2U9IiM4NTRGMEIiIHN0cm9rZS13aWR0aD0iMC41Ii8+CiAgPHRleHQgY2xhc3M9InRoIiB4PSIxNzUiIHk9IjE4NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiIGZpbGw9IiM2MzM4MDYiPnNlcnZpY2VzLyA8dHNwYW4gY2xhc3M9InRtIj4oZnJvbnRlbmQpPC90c3Bhbj48L3RleHQ+CiAgPHRleHQgY2xhc3M9InRzIiB4PSIxNzUiIHk9IjIwMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiIGZpbGw9IiM4NTRGMEIiPnNlcmlhbGl6YSDCtyBjaGFtYSBIVFRQIMK3IGRlc3NlcmlhbGl6YTwvdGV4dD4KCiAgPCEtLSBzaGFyZWQvIGNvcmUvIHdlYiAtLT4KICA8cmVjdCB4PSIzMCIgeT0iMjIyIiB3aWR0aD0iMjkwIiBoZWlnaHQ9IjI4IiByeD0iNiIgZmlsbD0iI0YxRUZFOCIgc3Ryb2tlPSIjNUY1RTVBIiBzdHJva2Utd2lkdGg9IjAuNSIvPgogIDx0ZXh0IGNsYXNzPSJ0cyIgeD0iMTc1IiB5PSIyMzYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIiBmaWxsPSIjNDQ0NDQxIj5zaGFyZWQvIMK3IGNvcmUvIChhdXRoLCBodHRwLCBzZXNzaW9uKTwvdGV4dD4KICA8IS0tIHNoYXJlZC8gY29yZS8gZGVza3RvcCAtLT4KICA8cmVjdCB4PSIzNjAiIHk9IjIyMiIgd2lkdGg9IjI5MCIgaGVpZ2h0PSIyOCIgcng9IjYiIGZpbGw9IiNGMUVGRTgiIHN0cm9rZT0iIzVGNUU1QSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KICA8dGV4dCBjbGFzcz0idHMiIHg9IjUwNSIgeT0iMjM2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZmlsbD0iIzQ0NDQ0MSI+c2hhcmVkLyDCtyBjb3JlLyAoYXV0aCwgc2luZ2xldG9uLCBzZXNzaW9uKTwvdGV4dD4KICA8bGluZSB4MT0iMzIyIiB5MT0iMjM2IiB4Mj0iMzU4IiB5Mj0iMjM2IiBzdHJva2U9IiM4ODg3ODAiIHN0cm9rZS13aWR0aD0iMS41Ii8+CiAgPHRleHQgY2xhc3M9InRzIiB4PSIzNDAiIHk9IjI0MSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzVmNWU1YSI+PTwvdGV4dD4KCiAgPCEtLSBGUk9OVEVJUkEgSFRUUCB3ZWIgLS0+CiAgPHJlY3QgeD0iMzAiIHk9IjI2MiIgd2lkdGg9IjI5MCIgaGVpZ2h0PSIyNCIgcng9IjQiIGZpbGw9IiNGQUVDRTciIHN0cm9rZT0iI0Q4NUEzMCIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPHRleHQgY2xhc3M9InRzIiB4PSIxNzUiIHk9IjI3NCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiIGZpbGw9IiM3MTJCMTMiPuKAlOKAlOKAlCBmcm9udGVpcmEgSFRUUCDCtyBKU09OIOKAlOKAlOKAlDwvdGV4dD4KICA8IS0tIG1lc21vIHByb2Nlc3NvIGRlc2t0b3AgLS0+CiAgPHJlY3QgeD0iMzYwIiB5PSIyNjIiIHdpZHRoPSIyOTAiIGhlaWdodD0iMjQiIHJ4PSI0IiBmaWxsPSIjRTFGNUVFIiBzdHJva2U9IiMwRjZFNTYiIHN0cm9rZS13aWR0aD0iMC41Ii8+CiAgPHRleHQgY2xhc3M9InRzIiB4PSI1MDUiIHk9IjI3NCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiIGZpbGw9IiMwODUwNDEiPm1lc21vIHByb2Nlc3NvIMK3IHRpcG9zIG5hdGl2b3M8L3RleHQ+CgogIDwhLS0gTEFCRUxTIGJhY2tlbmQgLyBkb23DrW5pbyAtLT4KICA8dGV4dCBjbGFzcz0idHMiIHg9IjE3NSIgeT0iMzAyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNWY1ZTVhIj5iYWNrZW5kPC90ZXh0PgogIDx0ZXh0IGNsYXNzPSJ0cyIgeD0iNTA1IiB5PSIzMDIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM1ZjVlNWEiPmRvbcOtbmlvPC90ZXh0PgoKICA8IS0tIHRyYW5zcG9ydC8gd2ViIC0tPgogIDxyZWN0IHg9IjMwIiB5PSIzMDgiIHdpZHRoPSIyOTAiIGhlaWdodD0iNDQiIHJ4PSI4IiBmaWxsPSIjRUVFREZFIiBzdHJva2U9IiM1MzRBQjciIHN0cm9rZS13aWR0aD0iMC41Ii8+CiAgPHRleHQgY2xhc3M9InRoIiB4PSIxNzUiIHk9IjMyNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiIGZpbGw9IiMzQzM0ODkiPnRyYW5zcG9ydC88L3RleHQ+CiAgPHRleHQgY2xhc3M9InRzIiB4PSIxNzUiIHk9IjM0MiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiIGZpbGw9IiM1MzRBQjciPmNvbnRyb2xsZXJzIMK3IGRlc2VyaWFsaXphIEpTT04gwrcgZ3VhcmRzPC90ZXh0PgogIDwhLS0gdHJhbnNwb3J0LyBkZXNrdG9wIOKAlCBuw6NvIGV4aXN0ZSAtLT4KICA8cmVjdCB4PSIzNjAiIHk9IjMwOCIgd2lkdGg9IjI5MCIgaGVpZ2h0PSI0NCIgcng9IjgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0I0QjJBOSIgc3Ryb2tlLXdpZHRoPSIwLjUiIHN0cm9rZS1kYXNoYXJyYXk9IjQgMyIvPgogIDx0ZXh0IGNsYXNzPSJ0cyIgeD0iNTA1IiB5PSIzMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIiBmaWxsPSIjQjRCMkE5Ij50cmFuc3BvcnQvIOKAlCBuw6NvIGV4aXN0ZTwvdGV4dD4KCiAgPCEtLSBhcHBsaWNhdGlvbi8gd2ViIC0tPgogIDxyZWN0IHg9IjMwIiB5PSIzNjIiIHdpZHRoPSIyOTAiIGhlaWdodD0iNDQiIHJ4PSI4IiBmaWxsPSIjRkFFRURBIiBzdHJva2U9IiM4NTRGMEIiIHN0cm9rZS13aWR0aD0iMC41Ii8+CiAgPHRleHQgY2xhc3M9InRoIiB4PSIxNzUiIHk9IjM4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiIGZpbGw9IiM2MzM4MDYiPmFwcGxpY2F0aW9uLyA8dHNwYW4gY2xhc3M9InRtIj4oYmFja2VuZCk8L3RzcGFuPjwvdGV4dD4KICA8dGV4dCBjbGFzcz0idHMiIHg9IjE3NSIgeT0iMzk2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZmlsbD0iIzg1NEYwQiI+ZW50aXRpZXMgwrcgRFRPcyDCtyBJU2VydmljZXMgwrcgSVJlcG9zaXRvcmllczwvdGV4dD4KICA8IS0tIGFwcGxpY2F0aW9uLyBkZXNrdG9wIC0tPgogIDxyZWN0IHg9IjM2MCIgeT0iMzYyIiB3aWR0aD0iMjkwIiBoZWlnaHQ9IjQ0IiByeD0iOCIgZmlsbD0iI0ZBRUVEQSIgc3Ryb2tlPSIjODU0RjBCIiBzdHJva2Utd2lkdGg9IjAuNSIvPgogIDx0ZXh0IGNsYXNzPSJ0aCIgeD0iNTA1IiB5PSIzODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIiBmaWxsPSIjNjMzODA2Ij5hcHBsaWNhdGlvbi88L3RleHQ+CiAgPHRleHQgY2xhc3M9InRzIiB4PSI1MDUiIHk9IjM5NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiIGZpbGw9IiM4NTRGMEIiPmVudGl0aWVzIMK3IERUT3MgwrcgSVNlcnZpY2VzIMK3IElSZXBvc2l0b3JpZXM8L3RleHQ+CiAgPGxpbmUgeDE9IjMyMiIgeTE9IjM4NCIgeDI9IjM1OCIgeTI9IjM4NCIgc3Ryb2tlPSIjQkE3NTE3IiBzdHJva2Utd2lkdGg9IjIiLz4KICA8dGV4dCBjbGFzcz0idHMiIHg9IjM0MCIgeT0iMzg5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjMzODA2Ij49PC90ZXh0PgoKICA8IS0tIHNlcnZpY2VzLyB3ZWIgLS0+CiAgPHJlY3QgeD0iMzAiIHk9IjQxNiIgd2lkdGg9IjI5MCIgaGVpZ2h0PSI0NCIgcng9IjgiIGZpbGw9IiNGQUVFREEiIHN0cm9rZT0iIzg1NEYwQiIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KICA8dGV4dCBjbGFzcz0idGgiIHg9IjE3NSIgeT0iNDM0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZmlsbD0iIzYzMzgwNiI+c2VydmljZXMvIDx0c3BhbiBjbGFzcz0idG0iPihiYWNrZW5kKTwvdHNwYW4+PC90ZXh0PgogIDx0ZXh0IGNsYXNzPSJ0cyIgeD0iMTc1IiB5PSI0NTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIiBmaWxsPSIjODU0RjBCIj5sw7NnaWNhIGRlIG5lZ8OzY2lvPC90ZXh0PgogIDwhLS0gc2VydmljZXMvIGRlc2t0b3AgLS0+CiAgPHJlY3QgeD0iMzYwIiB5PSI0MTYiIHdpZHRoPSIyOTAiIGhlaWdodD0iNDQiIHJ4PSI4IiBmaWxsPSIjRkFFRURBIiBzdHJva2U9IiM4NTRGMEIiIHN0cm9rZS13aWR0aD0iMC41Ii8+CiAgPHRleHQgY2xhc3M9InRoIiB4PSI1MDUiIHk9IjQzNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiIGZpbGw9IiM2MzM4MDYiPnNlcnZpY2VzLzwvdGV4dD4KICA8dGV4dCBjbGFzcz0idHMiIHg9IjUwNSIgeT0iNDUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZmlsbD0iIzg1NEYwQiI+bMOzZ2ljYSBkZSBuZWfDs2NpbzwvdGV4dD4KICA8bGluZSB4MT0iMzIyIiB5MT0iNDM4IiB4Mj0iMzU4IiB5Mj0iNDM4IiBzdHJva2U9IiNCQTc1MTciIHN0cm9rZS13aWR0aD0iMiIvPgogIDx0ZXh0IGNsYXNzPSJ0cyIgeD0iMzQwIiB5PSI0NDMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2MzM4MDYiPj08L3RleHQ+CgogIDwhLS0gaW5mcmFzdHJ1Y3R1cmUvIHdlYiAtLT4KICA8cmVjdCB4PSIzMCIgeT0iNDcwIiB3aWR0aD0iMjkwIiBoZWlnaHQ9IjQ0IiByeD0iOCIgZmlsbD0iI0VFRURGRSIgc3Ryb2tlPSIjNTM0QUI3IiBzdHJva2Utd2lkdGg9IjAuNSIvPgogIDx0ZXh0IGNsYXNzPSJ0aCIgeD0iMTc1IiB5PSI0ODgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIiBmaWxsPSIjM0MzNDg5Ij5pbmZyYXN0cnVjdHVyZS88L3RleHQ+CiAgPHRleHQgY2xhc3M9InRzIiB4PSIxNzUiIHk9IjUwNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiIGZpbGw9IiM1MzRBQjciPnJlcG9zaXRvcmllcyDigJQgUG9zdGdyZXMgwrcgTW9uZ28gwrcgUmVkaXM8L3RleHQ+CiAgPCEtLSBpbmZyYXN0cnVjdHVyZS8gZGVza3RvcCAtLT4KICA8cmVjdCB4PSIzNjAiIHk9IjQ3MCIgd2lkdGg9IjI5MCIgaGVpZ2h0PSI0NCIgcng9IjgiIGZpbGw9IiNFRUVERkUiIHN0cm9rZT0iIzUzNEFCNyIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KICA8dGV4dCBjbGFzcz0idGgiIHg9IjUwNSIgeT0iNDg4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZmlsbD0iIzNDMzQ4OSI+aW5mcmFzdHJ1Y3R1cmUvPC90ZXh0PgogIDx0ZXh0IGNsYXNzPSJ0cyIgeD0iNTA1IiB5PSI1MDQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIiBmaWxsPSIjNTM0QUI3Ij5yZXBvc2l0b3JpZXMg4oCUIFNRTGl0ZSDCtyBQb3N0Z3JlcyDCtyBhcnF1aXZvPC90ZXh0PgogIDxsaW5lIHgxPSIzMjIiIHkxPSI0OTIiIHgyPSIzNTgiIHkyPSI0OTIiIHN0cm9rZT0iIzg4ODc4MCIgc3Ryb2tlLXdpZHRoPSIwLjUiIHN0cm9rZS1kYXNoYXJyYXk9IjMgMyIvPgogIDx0ZXh0IGNsYXNzPSJ0cyIgeD0iMzQwIiB5PSI0OTciIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM1ZjVlNWEiPuKJoDwvdGV4dD4KCiAgPCEtLSBwZXJzaXN0w6puY2lhIHdlYiAtLT4KICA8bGluZSB4MT0iMTc1IiB5MT0iNTE2IiB4Mj0iMTc1IiB5Mj0iNTMwIiBzdHJva2U9IiM3Rjc3REQiIHN0cm9rZS13aWR0aD0iMS41IiBtYXJrZXItZW5kPSJ1cmwoI2FycikiLz4KICA8cmVjdCB4PSIzMCIgeT0iNTMyIiB3aWR0aD0iMjkwIiBoZWlnaHQ9IjQ0IiByeD0iOCIgZmlsbD0iI0UxRjVFRSIgc3Ryb2tlPSIjMEY2RTU2IiBzdHJva2Utd2lkdGg9IjAuNSIvPgogIDx0ZXh0IGNsYXNzPSJ0aCIgeD0iMTc1IiB5PSI1NTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIiBmaWxsPSIjMDg1MDQxIj5wZXJzaXN0w6puY2lhPC90ZXh0PgogIDx0ZXh0IGNsYXNzPSJ0cyIgeD0iMTc1IiB5PSI1NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIiBmaWxsPSIjMEY2RTU2Ij5Qb3N0Z3JlcyDCtyBNb25nbyDCtyBSZWRpcyDCtyBhcnF1aXZvPC90ZXh0PgoKICA8IS0tIHBlcnNpc3TDqm5jaWEgZGVza3RvcCAtLT4KICA8bGluZSB4MT0iNTA1IiB5MT0iNTE2IiB4Mj0iNTA1IiB5Mj0iNTMwIiBzdHJva2U9IiM3Rjc3REQiIHN0cm9rZS13aWR0aD0iMS41IiBtYXJrZXItZW5kPSJ1cmwoI2FycikiLz4KICA8cmVjdCB4PSIzNjAiIHk9IjUzMiIgd2lkdGg9IjI5MCIgaGVpZ2h0PSI0NCIgcng9IjgiIGZpbGw9IiNFMUY1RUUiIHN0cm9rZT0iIzBGNkU1NiIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KICA8dGV4dCBjbGFzcz0idGgiIHg9IjUwNSIgeT0iNTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZmlsbD0iIzA4NTA0MSI+cGVyc2lzdMOqbmNpYTwvdGV4dD4KICA8dGV4dCBjbGFzcz0idHMiIHg9IjUwNSIgeT0iNTY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZmlsbD0iIzBGNkU1NiI+U1FMaXRlIMK3IFBvc3RncmVzIMK3IGFycXVpdm8gbG9jYWw8L3RleHQ+CiAgPGxpbmUgeDE9IjMyMiIgeTE9IjU1NCIgeDI9IjM1OCIgeTI9IjU1NCIgc3Ryb2tlPSIjMUQ5RTc1IiBzdHJva2Utd2lkdGg9IjIiLz4KICA8dGV4dCBjbGFzcz0idHMiIHg9IjM0MCIgeT0iNTU5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMDg1MDQxIj49PC90ZXh0PgoKICA8IS0tIENIQVZFUzogY2FtYWRhcyBxdWUgZXhpc3RlbSBzw7MgcGVsbyBIVFRQIC0tPgogIDxyZWN0IHg9IjgiIHk9IjEwOCIgd2lkdGg9IjE2IiBoZWlnaHQ9IjIwNiIgcng9IjMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0Q4NUEzMCIgc3Ryb2tlLXdpZHRoPSIwLjgiIHN0cm9rZS1kYXNoYXJyYXk9IjMgMyIvPgogIDx0ZXh0IGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjkiIHg9IjUiIHk9IjIxNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgdHJhbnNmb3JtPSJyb3RhdGUoLTkwLDUsMjE1KSIgZmlsbD0iIzk5M0MxRCI+c8OzIHBlbG8gSFRUUDwvdGV4dD4KICA8cmVjdCB4PSI4IiB5PSIzMDIiIHdpZHRoPSIxNiIgaGVpZ2h0PSI1OCIgcng9IjMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0Q4NUEzMCIgc3Ryb2tlLXdpZHRoPSIwLjgiIHN0cm9rZS1kYXNoYXJyYXk9IjMgMyIvPgogIDx0ZXh0IGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjkiIHg9IjUiIHk9IjMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgdHJhbnNmb3JtPSJyb3RhdGUoLTkwLDUsMzMzKSIgZmlsbD0iIzk5M0MxRCI+c8OzIHBlbG8gSFRUUDwvdGV4dD4KCiAgPCEtLSBMRUdFTkRBIC0tPgogIDxsaW5lIHgxPSIzMCIgeTE9IjYwMCIgeDI9IjU4IiB5Mj0iNjAwIiBzdHJva2U9IiNCQTc1MTciIHN0cm9rZS13aWR0aD0iMiIvPgogIDx0ZXh0IGNsYXNzPSJ0cyIgeD0iNjQiIHk9IjYwNCIgZmlsbD0iIzVmNWU1YSI+aWTDqm50aWNvPC90ZXh0PgogIDxsaW5lIHgxPSIxNDAiIHkxPSI2MDAiIHgyPSIxNjgiIHkyPSI2MDAiIHN0cm9rZT0iIzg4ODc4MCIgc3Ryb2tlLXdpZHRoPSIxLjUiLz4KICA8dGV4dCBjbGFzcz0idHMiIHg9IjE3NCIgeT0iNjA0IiBmaWxsPSIjNWY1ZTVhIj5jb25jZWl0byBpZ3VhbCDCtyBpbXBsZW1lbnRhw6fDo28gZGlmZXJlbnRlPC90ZXh0PgogIDxsaW5lIHgxPSI0NDAiIHkxPSI2MDAiIHgyPSI0NjgiIHkyPSI2MDAiIHN0cm9rZT0iIzg4ODc4MCIgc3Ryb2tlLXdpZHRoPSIwLjUiIHN0cm9rZS1kYXNoYXJyYXk9IjMgMyIvPgogIDx0ZXh0IGNsYXNzPSJ0cyIgeD0iNDc0IiB5PSI2MDQiIGZpbGw9IiM1ZjVlNWEiPnN1YnN0aXR1w612ZWw8L3RleHQ+Cjwvc3ZnPg==

## Apêndice A — Estrutura Base do Frontend (Camadas e Contratos)

Estrutura de referência independente de framework, representando as camadas e seus contratos.

```
src/
├── app/
│   ├── app.tsx                          // composição raiz: providers + router
│   ├── providers.tsx                    // AuthProvider, QueryProvider, ThemeProvider
│   └── router.tsx                       // monta as rotas globais a partir das features
│
├── assets/
│   ├── images/                          // imagens estáticas gerais
│   ├── icons/                           // ícones SVG globais
│   └── fonts/                           // fontes customizadas
│
├── config/
│   └── env.ts                           // variáveis de ambiente tipadas (ex: VITE_API_URL)
│
├── core/
│   ├── auth/
│   │   ├── auth.context.ts              // contexto do usuário logado
│   │   ├── auth.provider.tsx            // provider que gerencia sessão JWT
│   │   ├── auth.token.ts                // get/set/remove token no storage
│   │   └── auth.guard.ts                // protege rotas privadas
│   ├── http/
│   │   ├── http.client.ts               // instância HTTP com baseURL
│   │   └── http.interceptors.ts         // injeta JWT, trata 401, refresh token
│   ├── errors/
│   │   └── http-error.ts                // mapeamento e padronização de erros HTTP
│   └── session/
│       └── session.storage.ts           // persistência de sessão (remember me)
│
├── view/                                // camada de plataforma: telas + use-cases
│   ├── auth/
│   │   ├── view-login/
│   │   │   ├── view-login.html
│   │   │   ├── view-login.scss
│   │   │   └── view-login.ts            // chama auth.use-case
│   │   ├── view-esqueci-senha/
│   │   │   ├── view-esqueci-senha.html
│   │   │   ├── view-esqueci-senha.scss
│   │   │   └── view-esqueci-senha.ts    // chama auth.use-case
│   │   └── view-redefinir-senha/
│   │       ├── view-redefinir-senha.html
│   │       ├── view-redefinir-senha.scss
│   │       └── view-redefinir-senha.ts  // chama auth.use-case
│   │   └── auth.use-case.ts             // login, logout, loginGoogle, manterLogado, redefinirSenha
│   └── perfil/
│       ├── view-meus-dados/
│       │   ├── view-meus-dados.html
│       │   ├── view-meus-dados.scss
│       │   └── view-meus-dados.ts       // chama perfil.use-case
│       ├── view-trocar-foto/
│       │   ├── view-trocar-foto.html
│       │   ├── view-trocar-foto.scss
│       │   └── view-trocar-foto.ts      // chama perfil.use-case
│       └── view-trocar-senha/
│           ├── view-trocar-senha.html
│           ├── view-trocar-senha.scss
│           └── view-trocar-senha.ts     // chama perfil.use-case
│       └── perfil.use-case.ts           // carregarPerfil, atualizarDados, trocarFoto, trocarSenha, aplicarTema
│
├── features/                            // camada de domínio: contratos independentes da plataforma
│   ├── auth/
│   │   ├── auth.dto.ts                  // LoginRequest, LoginResponse, RedefinirSenhaRequest
│   │   └── auth.IService.ts             // interface IAuthService
│   └── perfil/
│       ├── perfil.dto.ts                // PerfilDto, AtualizarPerfilRequest, TrocarSenhaRequest, TrocarFotoRequest
│       └── perfil.IService.ts           // interface IPerfilService
│
├── services/                            // implementação dos IServices (chama API REST)
│   ├── auth.service.ts                  // implementa IAuthService → POST /auth/login, /auth/google
│   └── perfil.service.ts                // implementa IPerfilService → GET/PUT /perfil
│
├── shared/
│   ├── components/
│   │   ├── ui/                          // Button, Input, Modal, Avatar, Spinner, Toast
│   │   ├── layout/
│   │   │   ├── navbar/
│   │   │   │   ├── navbar.html
│   │   │   │   ├── navbar.scss
│   │   │   │   └── navbar.ts            // lê perfil.use-case: apelido, foto, tema, submenu
│   │   │   ├── sidebar/
│   │   │   └── footer/
│   │   ├── forms/                       // FieldText, FieldPhone, FieldCpf, FieldEmail, FieldPassword
│   │   └── feedback/                    // LoadingSpinner, EmptyState, ErrorMessage, AlertBanner
│   │       └── notification.service.ts  // toast/alert global: success, error, warning
│   ├── hooks/                           // useDebounce, useMediaQuery, useOutsideClick
│   ├── lib/
│   │   ├── formatters.ts                // formatCpf, formatPhone, formatDate
│   │   ├── validators.ts                // cpfValido, emailValido
│   │   └── cn.ts                        // utilitário de classnames
│   └── types/
│       └── api.types.ts                 // ApiResponse<T>, PaginatedResponse<T>, ApiError
│
├── stores/
│   └── ui.store.ts                      // estado reativo de UI: sidebar, tema (espelho do perfil)
│
├── styles/
│   ├── global.scss                      // reset, variáveis CSS, tipografia base
│   └── tailwind.css                     // diretivas @tailwind
│
├── pages/
│   └── not-found/
│       ├── not-found.html
│       ├── not-found.scss
│       └── not-found.ts                 // página 404 global
│
├── main.tsx                             // ReactDOM.createRoot, monta <App />
└── vite-env.d.ts                        // tipos do Vite (import.meta.env)
```

---

## Apêndice B — Estrutura Base do Backend (Camadas e Contratos)

```
src/
├── app/
│   ├── app.module.ts                    // módulo raiz da aplicação
│   └── bootstrap.ts                     // inicialização, configuração de middlewares globais
│
├── config/
│   ├── env.ts                           // variáveis de ambiente tipadas
│   └── app.config.ts                    // configurações globais da aplicação
│
├── core/
│   ├── auth/
│   │   ├── auth.guard.ts                // guard de autenticação JWT
│   │   ├── auth.decorator.ts            // @CurrentUser, @Public
│   │   └── jwt.strategy.ts              // validação e extração do JWT
│   ├── http/
│   │   ├── exception.filter.ts          // filtro global de exceções HTTP
│   │   └── response.interceptor.ts      // padronização do envelope de resposta
│   ├── logging/
│   │   └── logger.service.ts            // logging estruturado global
│   ├── observability/
│   │   └── tracing.ts                   // tracing distribuído (OpenTelemetry)
│   └── errors/
│       └── domain-error.ts              // classe base de erros de domínio
│
├── transport/                           // camada de entrada — muda por protocolo
│   └── rest/
│       ├── auth/
│       │   └── auth.controller.ts       // POST /auth/login, /auth/google, /auth/redefinir-senha
│       └── perfil/
│           └── perfil.controller.ts     // GET /perfil, PUT /perfil, PUT /perfil/senha, PUT /perfil/foto
│
├── application/                         // camada de domínio — independente da plataforma
│   ├── auth/
│   │   ├── auth.dto.ts                  // LoginRequest, LoginResponse, RedefinirSenhaRequest
│   │   ├── auth.entity.ts               // entidade Usuario com comportamento de domínio
│   │   ├── auth.IService.ts             // interface IAuthService
│   │   └── auth.IRepository.ts          // interface IAuthRepository
│   └── perfil/
│       ├── perfil.dto.ts                // PerfilDto, AtualizarPerfilRequest, TrocarSenhaRequest
│       ├── perfil.entity.ts             // entidade Perfil com comportamento de domínio
│       ├── perfil.IService.ts           // interface IPerfilService
│       └── perfil.IRepository.ts        // interface IPerfilRepository
│
├── services/                            // implementação dos IServices
│   ├── auth.service.ts                  // implementa IAuthService: lógica de autenticação
│   └── perfil.service.ts                // implementa IPerfilService: lógica de perfil
│
├── infrastructure/                      // implementação dos IRepositories — muda por tecnologia
│   ├── database/
│   │   ├── auth.pg.repository.ts        // implementa IAuthRepository → PostgreSQL
│   │   └── perfil.pg.repository.ts      // implementa IPerfilRepository → PostgreSQL
│   └── storage/
│       └── foto.s3.storage.ts           // upload de foto → AWS S3 ou equivalente
│
├── shared/
│   ├── lib/
│   │   ├── formatters.ts                // formatCpf, formatDate
│   │   └── validators.ts                // cpfValido, emailValido
│   ├── types/
│   │   └── api.types.ts                 // ApiResponse<T>, PaginatedResponse<T>
│   ├── decorators/                      // decorators compartilhados entre features
│   └── constants/                       // constantes e enums globais
│
└── main.ts                              // bootstrap da aplicação
```

---

## Apêndice C — Aplicação Web SPA (Angular, React, Vue)

Derivação da estrutura base do Apêndice A para aplicações Single Page Application.

**O que muda em relação à estrutura base:**

| Elemento | Estrutura base | SPA |
|---|---|---|
| `view/*.ts` | TypeScript genérico | Componente do framework (`.tsx`, `.vue`, `.component.ts`) |
| `view/*.html` | HTML puro | Template do framework ou JSX inline |
| `auth.guard.ts` | Conceito genérico | Route Guard (Angular), wrapper de rota (React), navigation guard (Vue) |
| `auth.provider.tsx` | Conceito genérico | Context Provider (React), Composable (Vue), Service injetável (Angular) |
| `ui.store.ts` | Conceito genérico | Zustand/Jotai (React), Pinia (Vue), Service com BehaviorSubject (Angular) |

```
src/
├── app/
│   ├── app.tsx                          // <App>: providers + <RouterProvider>
│   ├── providers.tsx                    // <QueryClientProvider>, <AuthProvider>, <ThemeProvider>
│   └── router.tsx                       // createBrowserRouter com lazy loading por feature
│
├── assets/
├── config/
│   └── env.ts                           // import.meta.env tipado
│
├── core/
│   ├── auth/
│   │   ├── auth.context.tsx             // createContext + useAuth hook
│   │   ├── auth.provider.tsx            // <AuthProvider> gerencia token e usuário logado
│   │   ├── auth.token.ts                // localStorage/sessionStorage com criptografia
│   │   └── auth.guard.tsx               // <PrivateRoute> redireciona para /login se não autenticado
│   ├── http/
│   │   ├── http.client.ts               // instância axios com baseURL e timeout
│   │   └── http.interceptors.ts         // Bearer token, refresh 401, erro padronizado
│   ├── errors/
│   │   └── http-error.ts
│   └── session/
│       └── session.storage.ts           // remember me: persiste token por 30 dias
│
├── view/
│   ├── auth/
│   │   ├── view-login/
│   │   │   └── view-login.tsx           // formulário de login com validação Zod/Yup
│   │   ├── view-esqueci-senha/
│   │   │   └── view-esqueci-senha.tsx   // input de email, chama solicitarRedefinicao
│   │   └── view-redefinir-senha/
│   │       └── view-redefinir-senha.tsx // lê token da query string, define nova senha
│   │   └── auth.use-case.ts             // login(req), logout(), loginGoogle(), manterLogado(bool), redefinirSenha(req)
│   └── perfil/
│       ├── view-meus-dados/
│       │   └── view-meus-dados.tsx      // formulário com nome, apelido, cpf, telefone, email
│       ├── view-trocar-foto/
│       │   └── view-trocar-foto.tsx     // upload com preview, crop opcional
│       └── view-trocar-senha/
│           └── view-trocar-senha.tsx    // senha atual + nova senha + confirmação
│       └── perfil.use-case.ts           // carregarPerfil(), atualizarDados(req), trocarFoto(file), trocarSenha(req), aplicarTema(tema)
│
├── features/
│   ├── auth/
│   │   ├── auth.dto.ts
│   │   └── auth.IService.ts
│   └── perfil/
│       ├── perfil.dto.ts
│       └── perfil.IService.ts
│
├── services/
│   ├── auth.service.ts                  // POST /auth/login, /auth/google, /auth/esqueci-senha, /auth/redefinir-senha
│   └── perfil.service.ts                // GET /perfil, PUT /perfil, PUT /perfil/senha, PUT /perfil/foto
│
├── shared/
│   ├── components/
│   │   ├── ui/                          // Button, Input, Modal, Avatar, Spinner, Toast
│   │   ├── layout/
│   │   │   └── navbar/
│   │   │       └── navbar.tsx           // apelido + foto + submenu: trocar senha, foto, meus dados, tema
│   │   ├── forms/                       // FieldCpf, FieldPhone, FieldPassword, FieldEmail
│   │   └── feedback/                    // LoadingSpinner, EmptyState, ErrorBoundary
│   ├── hooks/
│   │   ├── use-debounce.ts
│   │   ├── use-media-query.ts
│   │   └── use-outside-click.ts
│   ├── lib/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── cn.ts
│   └── types/
│       └── api.types.ts
│
├── stores/
│   └── ui.store.ts                      // tema (espelho do perfil), sidebar aberta/fechada
│
├── styles/
│   ├── global.scss
│   └── tailwind.css
│
├── pages/
│   ├── not-found/
│   │   └── not-found.tsx
│   └── unauthorized/
│       └── unauthorized.tsx
│
├── main.tsx
└── vite-env.d.ts
```

---

## Apêndice D — Aplicação Web Tradicional (PHP, C# Blazor, ASP.NET MVC)

**O que muda em relação à estrutura base:**

| Camada | SPA | Web Tradicional |
|---|---|---|
| `core/auth/` | JWT no browser | Sessão server-side, cookies HttpOnly |
| `core/http/` | axios no cliente | HttpClient do framework no servidor |
| `view/` | Componentes JS | Views/Razor Pages/Blade templates |
| `app/` | ReactDOM.createRoot | Program.cs / index.php / Startup |
| `stores/` | Estado reativo cliente | ViewBag, TempData, Session server-side |

```
src/
├── app/
│   └── Program.cs                       // bootstrap: middlewares, DI, pipeline HTTP
│
├── config/
│   ├── appsettings.json                 // configurações por ambiente
│   └── app.config.cs                    // configurações tipadas
│
├── core/
│   ├── auth/
│   │   ├── auth.middleware.cs           // valida sessão/cookie em cada request
│   │   ├── auth.session.cs              // lê/escreve usuário na sessão HTTP
│   │   └── auth.filter.cs               // filtro de autorização para actions/pages
│   ├── errors/
│   │   └── error.handler.cs             // middleware global de erros, página de erro
│   └── logging/
│       └── logger.cs                    // logging estruturado (Serilog, Monolog)
│
├── view/                                // camada de apresentação server-side
│   ├── auth/
│   │   ├── view-login/
│   │   │   ├── view-login.cshtml        // formulário POST para /auth/login
│   │   │   └── view-login.cs            // chama auth.use-case, redireciona
│   │   ├── view-esqueci-senha/
│   │   │   ├── view-esqueci-senha.cshtml
│   │   │   └── view-esqueci-senha.cs
│   │   └── view-redefinir-senha/
│   │       ├── view-redefinir-senha.cshtml
│   │       └── view-redefinir-senha.cs
│   │   └── auth.use-case.cs             // login(), logout(), loginGoogle(), redefinirSenha()
│   └── perfil/
│       ├── view-meus-dados/
│       │   ├── view-meus-dados.cshtml
│       │   └── view-meus-dados.cs       // GET carrega, POST atualiza, redirect com feedback
│       ├── view-trocar-foto/
│       │   ├── view-trocar-foto.cshtml
│       │   └── view-trocar-foto.cs
│       └── view-trocar-senha/
│           ├── view-trocar-senha.cshtml
│           └── view-trocar-senha.cs
│       └── perfil.use-case.cs
│
├── features/
│   ├── auth/
│   │   ├── auth.dto.cs
│   │   └── IAuthService.cs
│   └── perfil/
│       ├── perfil.dto.cs
│       └── IPerfilService.cs
│
├── services/
│   ├── auth.service.cs
│   └── perfil.service.cs
│
├── shared/
│   ├── components/                      // Partial Views, ViewComponents, Blade components
│   │   ├── layout/
│   │   │   └── _navbar.cshtml           // apelido, foto, submenu de perfil
│   │   ├── forms/                       // _field-cpf.cshtml, _field-phone.cshtml
│   │   └── feedback/                    // _loading.cshtml, _error.cshtml
│   ├── lib/
│   │   ├── formatters.cs
│   │   └── validators.cs
│   └── types/
│       └── api.types.cs
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── styles/
│   └── global.css                       // compilado do SCSS/Tailwind
│
└── pages/
    ├── not-found.cshtml                 // 404
    └── unauthorized.cshtml              // 403
```

---

## Apêndice E — Aplicação Desktop (WinForms, WPF, MAUI, Electron)

**O que muda em relação à estrutura base:**

| Camada | Web SPA | Desktop |
|---|---|---|
| `core/auth/` | JWT, localStorage | Singleton em memória, sem token |
| `core/http/` | axios, interceptors | Não existe (chama serviço direto ou DLL) |
| `core/session/` | refresh token, remember me | Não existe — sessão é o processo |
| `view/` | HTML/CSS/JS | Forms/Janelas/Pages XAML |
| `styles/` | global.scss, tailwind | App.xaml, ResourceDictionaries |
| `stores/` | estado reativo JS | Não existe ou é simplificado |
| `services/` | chama API REST | Chama serviço local, DLL ou named pipe |

```
src/
├── app/
│   ├── App.xaml                         // definição da aplicação WPF/MAUI
│   ├── App.xaml.cs                      // inicialização: carrega usuário, aplica tema
│   └── MainWindow.xaml                  // janela principal com navbar e área de conteúdo
│
├── assets/
│   ├── Images/                          // imagens e ícones como Resource
│   └── Fonts/                           // fontes como Resource
│
├── config/
│   └── app.config.cs                    // connectionStrings, endpoints, configurações
│
├── core/
│   ├── auth/
│   │   ├── auth.singleton.cs            // usuário logado em memória (sem token)
│   │   └── auth.guard.cs                // verifica auth.singleton antes de abrir janela
│   ├── navigation/
│   │   └── navigator.cs                 // abre/fecha janelas, verifica permissões
│   ├── errors/
│   │   └── error.handler.cs             // captura exceções globais, exibe MessageBox
│   └── permissions/
│       └── permission.checker.cs        // consulta auth.singleton para verificar roles
│
├── view/
│   ├── auth/
│   │   ├── view-login/
│   │   │   ├── FormLogin.xaml
│   │   │   └── FormLogin.xaml.cs        // chama auth.use-case.login()
│   │   ├── view-esqueci-senha/
│   │   │   ├── FormEsqueciSenha.xaml
│   │   │   └── FormEsqueciSenha.xaml.cs
│   │   └── view-redefinir-senha/
│   │       ├── FormRedefinirSenha.xaml
│   │       └── FormRedefinirSenha.xaml.cs
│   │   └── auth.use-case.cs             // login(), logout(), redefinirSenha()
│   └── perfil/
│       ├── view-meus-dados/
│       │   ├── FormMeusDados.xaml
│       │   └── FormMeusDados.xaml.cs
│       ├── view-trocar-foto/
│       │   ├── FormTrocarFoto.xaml
│       │   └── FormTrocarFoto.xaml.cs   // OpenFileDialog, preview, chama use-case
│       └── view-trocar-senha/
│           ├── FormTrocarSenha.xaml
│           └── FormTrocarSenha.xaml.cs
│       └── perfil.use-case.cs           // carregarPerfil(), atualizarDados(), aplicarTema()
│
├── features/
│   ├── auth/
│   │   ├── auth.dto.cs
│   │   └── IAuthService.cs
│   └── perfil/
│       ├── perfil.dto.cs
│       └── IPerfilService.cs
│
├── services/
│   ├── auth.service.cs                  // chama API REST ou serviço local conforme config
│   └── perfil.service.cs
│
├── shared/
│   ├── components/
│   │   ├── layout/
│   │   │   └── NavbarControl.xaml       // UserControl: foto, apelido, submenu
│   │   ├── forms/                       // UserControls: FieldCpf, FieldPhone
│   │   └── feedback/                    // LoadingOverlay, ErrorDialog
│   ├── lib/
│   │   ├── formatters.cs
│   │   └── validators.cs
│   └── types/
│       └── common.types.cs
│
└── styles/
    ├── App.xaml                         // ResourceDictionary global
    ├── theme.light.xaml                 // tema claro
    └── theme.dark.xaml                  // tema escuro
```

---

## Apêndice F — Aplicação Console

**O que muda em relação à estrutura base:**

| Camada | Web SPA | Console |
|---|---|---|
| `core/auth/` | JWT, browser storage | Singleton em memória, login interativo no início |
| `core/http/` | axios | Não existe ou é HttpClient direto |
| `view/` | HTML/CSS | Telas de console: menus, prompts, stdout formatado |
| `assets/`, `styles/` | Existem | Não existem |
| `shared/components/` | Componentes visuais | Helpers de output: tabelas, cores ANSI, prompts |

```
src/
├── app/
│   └── Program.cs                       // bootstrap: login interativo, menu principal
│
├── config/
│   └── app.config.cs                    // endpoints, configurações de ambiente
│
├── core/
│   ├── auth/
│   │   ├── auth.singleton.cs            // usuário logado em memória
│   │   └── auth.guard.cs                // verifica permissão antes de executar tela
│   ├── errors/
│   │   └── error.handler.cs             // captura exceções, exibe mensagem formatada no console
│   └── permissions/
│       └── permission.checker.cs
│
├── view/
│   ├── auth/
│   │   ├── view-login/
│   │   │   └── view-login.cs            // prompt: email + senha, chama auth.use-case
│   │   └── view-redefinir-senha/
│   │       └── view-redefinir-senha.cs  // prompt: token + nova senha
│   │   └── auth.use-case.cs
│   └── perfil/
│       ├── view-meus-dados/
│       │   └── view-meus-dados.cs       // exibe dados em tabela, prompt para editar
│       ├── view-trocar-foto/
│       │   └── view-trocar-foto.cs      // prompt: caminho do arquivo
│       └── view-trocar-senha/
│           └── view-trocar-senha.cs     // prompt: senha atual + nova + confirmação
│       └── perfil.use-case.cs
│
├── features/
│   ├── auth/
│   │   ├── auth.dto.cs
│   │   └── IAuthService.cs
│   └── perfil/
│       ├── perfil.dto.cs
│       └── IPerfilService.cs
│
├── services/
│   ├── auth.service.cs
│   └── perfil.service.cs
│
└── shared/
    ├── components/
    │   ├── layout/
    │   │   └── header.cs                // exibe apelido, role e separador no topo de cada tela
    │   └── feedback/
    │       ├── spinner.cs               // animação de loading no terminal
    │       └── table.cs                 // renderiza dados em tabela ANSI formatada
    ├── lib/
    │   ├── formatters.cs
    │   └── validators.cs
    └── types/
        └── common.types.cs
```

---

## Apêndice G — Aplicação CLI (Command-Line Interface)

A CLI difere do console por ser não-interativa: cada execução resolve um comando específico passado como argumento. Não há menus nem prompts — a entrada é totalmente via argumentos e flags.

**O que muda em relação ao console:**

| Camada | Console | CLI |
|---|---|---|
| `core/auth/` | Login interativo no início | Token via variável de ambiente ou arquivo de credenciais |
| `view/` | Menus e prompts interativos | Commands: um arquivo por comando |
| `app/` | Loop de menu | Parser de args (ex: System.CommandLine, Commander.js) |

```
src/
├── app/
│   └── Program.cs                       // registra commands, executa parser de argumentos
│
├── config/
│   └── app.config.cs                    // endpoints, token path, configurações
│
├── core/
│   ├── auth/
│   │   ├── auth.token.cs                // lê token de variável de ambiente ou ~/.config/app/token
│   │   └── auth.guard.cs                // verifica token antes de executar command
│   ├── errors/
│   │   └── error.handler.cs             // exit code não-zero + mensagem de erro padronizada
│   └── permissions/
│       └── permission.checker.cs
│
├── transport/                           // camada de entrada — commands como equivalente de controllers
│   ├── auth/
│   │   ├── login.command.cs             // app login --email x --password y
│   │   └── redefinir-senha.command.cs   // app auth reset-password --token x --password y
│   └── perfil/
│       ├── ver-dados.command.cs         // app perfil show
│       ├── atualizar-dados.command.cs   // app perfil update --nome x --email y
│       ├── trocar-senha.command.cs      // app perfil change-password --current x --new y
│       └── trocar-foto.command.cs       // app perfil set-photo --file ./foto.jpg
│
├── features/
│   ├── auth/
│   │   ├── auth.dto.cs
│   │   └── IAuthService.cs
│   └── perfil/
│       ├── perfil.dto.cs
│       └── IPerfilService.cs
│
├── services/
│   ├── auth.service.cs
│   └── perfil.service.cs
│
└── shared/
    ├── output/                          // equivalente de components para CLI
    │   ├── table.cs                     // renderiza resultado em tabela ou JSON conforme --format
    │   ├── json.cs                      // serializa saída como JSON (--output json)
    │   └── error.cs                     // formata erros para stderr com exit code
    ├── lib/
    │   ├── formatters.cs
    │   └── validators.cs
    └── types/
        └── common.types.cs
```

> **Nota sobre a camada `transport/` na CLI:** na CLI, `transport/` substitui `view/` porque os commands não têm estado interativo — eles recebem argumentos, executam e encerram. O padrão é idêntico ao `transport/rest/` do backend, reforçando o isomorfismo arquitetural proposto no artigo.

---

## Apêndice H — Arquivos de Diretiva para Agentes de Codificação

Este apêndice apresenta a aplicação prática da arquitetura isomórfica como contrato legível por agentes de IA. A proposta é que a organização física de diretórios, descrita nos Apêndices A a G, seja referenciada explicitamente nos arquivos de instrução que os principais agentes de codificação reconhecem: `AGENTS.md` (Codex CLI), `CLAUDE.md` (Claude Code) e `GEMINI.md` (Gemini CLI).

### H.1 Hierarquia canônica recomendada

A estrutura recomendada adota um arquivo canônico neutro (`AGENTS.md`) como fonte de verdade, com os arquivos específicos de cada agente apontando para ele ou resumindo as mesmas regras. Isso garante interoperabilidade: equipes que alternam entre agentes mantêm um único ponto de atualização.

```
raiz-do-projeto/
├── AGENTS.md        # arquivo canônico — neutro, interoperável, fonte de verdade
├── CLAUDE.md        # aponta para AGENTS.md ou resume as mesmas regras
├── GEMINI.md        # aponta para AGENTS.md ou resume as mesmas regras
├── src/
│   └── ...          # estrutura isomórfica conforme Apêndices A–G
└── architecture/
    └── FRONTEND.md  # Apêndice A em formato markdown separado (opcional)
```

### H.2 AGENTS.md — arquivo canônico

`AGENTS.md` é o arquivo de instrução reconhecido pelo Codex CLI [11] e adotado como padrão neutro nesta proposta. Por ser agnóstico de ferramenta, serve como fonte de verdade para qualquer agente que não possua arquivo próprio, e pode ser referenciado pelos demais.

```markdown
# Arquitetura do Projeto

Este projeto adota a **Arquitetura Isomórfica de Software** [ref].
A organização de diretórios é um contrato arquitetural — não uma preferência estética.
Siga as regras abaixo em toda geração, edição ou refatoração de código.

---

## Princípio central

Separar o que muda por plataforma do que é independente da plataforma.

- O que é **independente da plataforma**: `features/` (frontend) e `application/` (backend)
  — contratos de dados (DTOs) e interfaces de serviços. Muda quando o negócio muda.
- O que **muda por plataforma**: `view/`, `transport/`, `core/`, `infrastructure/`
  — implementações de apresentação, protocolo, segurança e persistência.

---

## Estrutura de camadas (frontend)

```
src/
├── app/          # bootstrap, providers, router — muda por plataforma
├── config/       # variáveis de ambiente tipadas
├── core/         # auth, http, session, errors — muda por plataforma/protocolo
├── view/         # telas + use-cases — muda por plataforma
├── features/     # DTOs + IServices — independente da plataforma
├── services/     # implementação dos IServices (chamadas REST) — muda por protocolo
├── shared/       # componentes, hooks, lib, types — evolui lentamente
└── styles/       # estilos globais — apenas plataformas web
```

## Estrutura de camadas (backend)

```
src/
├── app/            # bootstrap — muda por plataforma
├── config/         # variáveis de ambiente tipadas
├── core/           # auth, logging, observabilidade, errors — muda por plataforma
├── transport/      # controllers REST, gRPC, commands — muda por protocolo
├── application/    # entities, DTOs, IServices, IRepositories — independente da plataforma
├── services/       # implementação dos IServices — lógica de negócio
├── infrastructure/ # implementação dos IRepositories — muda por tecnologia
└── shared/         # lib, types, decorators, constants — evolui lentamente
```

---

## Regra de dependência

As dependências de importação só podem apontar **de fora para dentro**:

```
view/ ou transport/  →  services/  →  application/ ou features/
infrastructure/      →  application/ ou features/
core/                →  application/ ou features/
qualquer camada      →  shared/
```

**Proibido:**
- `features/` ou `application/` importar de `view/`, `transport/` ou `infrastructure/`
- `services/` importar de `view/` ou `transport/`
- `shared/` importar de qualquer camada de negócio

---

## Convenções de nomenclatura

| Tipo de artefato       | Sufixo esperado              | Camada             |
|------------------------|------------------------------|--------------------|
| DTO de entrada/saída   | `*.dto.ts`                   | `features/` ou `application/` |
| Interface de serviço   | `*.IService.ts`              | `features/` ou `application/` |
| Interface de repositório | `*.IRepository.ts`         | `application/`     |
| Implementação de serviço | `*.service.ts`             | `services/`        |
| Implementação de repositório | `*.repository.ts`    | `infrastructure/`  |
| Tela / componente de página | `view-*.ts` / `view-*.html` | `view/`      |
| Orquestrador de plataforma | `*.use-case.ts`          | `view/`            |
| Controller HTTP        | `*.controller.ts`            | `transport/rest/`  |
| Guard de rota/auth     | `*.guard.ts`                 | `core/auth/`       |

---

## O que NÃO fazer

- Não crie pastas `controllers/`, `services/`, `repositories/` na raiz do `src/`
  sem a hierarquia de camadas definida acima.
- Não coloque lógica de negócio em `view/` ou `transport/`.
- Não importe implementações concretas de serviço ou repositório diretamente em componentes de tela. A orquestração deve passar pelo `use-case` da camada `view/`, que consome os contratos definidos em `features/` ou `application/`.
- Não crie um segundo bloco `services/` fora da camada `services/` raiz.
- Não coloque arquivos de UI (componentes, telas) em `features/` ou `application/`.

---

## Referência

Estrutura detalhada de cada tipo de aplicação: ver `architecture/FRONTEND.md`
e `architecture/BACKEND.md`, ou os Apêndices A–G do Technical Report de referência.
```

### H.3 CLAUDE.md — diretiva para Claude Code

`CLAUDE.md` é o arquivo reconhecido pelo Claude Code [10] na raiz do projeto. A abordagem recomendada é delegar ao arquivo canônico, evitando duplicação de regras.

```markdown
# Arquitetura do Projeto — Claude Code

> As regras de arquitetura deste projeto estão definidas em `AGENTS.md`.
> Leia `AGENTS.md` antes de gerar, editar ou mover qualquer arquivo.

## Instruções adicionais específicas do Claude Code

- Antes de criar um arquivo novo, identifique em qual camada ele pertence
  consultando a tabela de convenções em `AGENTS.md`.
- Ao receber uma instrução ambígua sobre onde colocar um artefato,
  pergunte explicitamente antes de assumir uma localização.
- Ao refatorar, verifique se a mudança viola a regra de dependência.
  Se violar, sinalize antes de aplicar.
- Em projetos monorepo, cada pacote (`apps/web`, `apps/api`, `apps/desktop`)
  segue a mesma estrutura isomórfica de forma independente.
```

### H.4 GEMINI.md — diretiva para Gemini CLI

`GEMINI.md` é o arquivo reconhecido pelo Gemini CLI [12]. Segue o mesmo padrão de delegação ao arquivo canônico.

```markdown
# Arquitetura do Projeto — Gemini CLI

> As regras de arquitetura deste projeto estão definidas em `AGENTS.md`.
> Leia `AGENTS.md` antes de gerar, editar ou mover qualquer arquivo.

## Instruções adicionais específicas do Gemini CLI

- Ao gerar código para uma nova feature, crie os artefatos nas camadas corretas
  em paralelo: DTO em `features/`, IService em `features/`, implementação em `services/`,
  tela em `view/`. Não gere apenas a tela sem os contratos.
- Ao sugerir uma estrutura de diretórios alternativa, justifique explicitamente
  por que ela não viola a regra de dependência definida em `AGENTS.md`.
- Em caso de dúvida sobre a camada correta, consulte a tabela de convenções
  de nomenclatura em `AGENTS.md` antes de decidir.
```

### H.5 Papel deste apêndice na proposta

A inclusão destes arquivos como artefatos de referência tem três implicações para a proposta central do artigo:

**1. A arquitetura isomórfica torna-se verificável por agentes.** Um agente que lê `AGENTS.md` pode, a partir da regra de dependência e da tabela de convenções, validar se um arquivo que está sendo criado ou modificado está na camada correta — sem que o desenvolvedor precise explicar a estrutura a cada sessão.

**2. O custo de reconstrução de contexto é reduzido.** Agentes de codificação baseados em LLMs reconstroem o contexto do projeto a cada sessão. Um `CLAUDE.md` ou `AGENTS.md` que explicita a estrutura de camadas e as regras de dependência elimina a ambiguidade sobre onde cada artefato deve residir, reduzindo a necessidade de correções e re-prompts.

**3. A barreira de entrada para desenvolvedores juniores é reduzida.** Um desenvolvedor com pouca experiência em arquitetura pode orientar um agente de IA com segurança ao referenciar `AGENTS.md` nas instruções de sessão. A separação física clara entre camadas funciona como andaime cognitivo: o desenvolvedor não precisa conhecer Clean Architecture para seguir as convenções — basta consultar a tabela de nomenclatura e a regra de dependência.

**4. O consumo de tokens e iterações por sessão é reduzido.** Em projetos sem estrutura definida, orquestradores de agentes executam uma fase de *scaffolding inference* — iterações de leitura de diretórios para inferir a organização do projeto — antes de produzir qualquer artefato. Com `AGENTS.md` e estrutura isomórfica, essa fase é eliminada: o agente lê o arquivo de diretiva e já sabe onde cada tipo de artefato deve residir. Adicionalmente, o espaço de decisão por artefato é reduzido — nomenclatura, camada e regras de dependência são deriváveis diretamente das convenções, sem necessidade de raciocínio adicional a cada operação.

Esses quatro efeitos são identificados como hipóteses a serem verificadas empiricamente em trabalhos futuros (ver Seção 11), com destaque para H6 — a mais diretamente mensurável, por envolver métricas de tokens e iterações logáveis pelos próprios orquestradores de agentes.

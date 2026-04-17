# Visão e Escopo

## MEDE-CLI

---

## 1. Objetivo do Produto

O **MEDE-CLI** é uma ferramenta de linha de comando destinada a operacionalizar, de forma assistida por LLM e supervisionada por humanos, a evolução documental de projetos de software segundo a metodologia **MEDE**.

Seu propósito central é permitir que a documentação de um projeto:

- evolua de forma causal;
- preserve a rastreabilidade das decisões;
- mantenha separação entre artefatos históricos e documentos vivos;
- permaneça reconstruível ao longo do tempo;
- possa ser atualizada com apoio de inteligência artificial sem perder governança metodológica.

O produto não foi concebido como um simples gerador de documentos, editor automatizado de Markdown ou wrapper de APIs de LLM. Sua finalidade é mais específica e mais estrutural: **atuar como motor operacional da governança documental evolutiva do projeto**.

Em termos práticos, o MEDE-CLI transforma a evolução documental em um fluxo supervisionado de change-sets, no qual alterações são propostas, revisadas, aprovadas ou rejeitadas antes de sua aplicação.

---

## 2. Problema que o Produto Resolve

Projetos reais de software tendem a sofrer, ao longo do tempo, com uma combinação recorrente de problemas:

- documentação desatualizada;
- decisões arquiteturais não explicitadas;
- perda de contexto sobre por que o sistema evoluiu de determinada forma;
- dependência excessiva da memória dos indivíduos;
- divergência entre reuniões, entendimento do negócio, implementação e documentos correntes;
- uso desgovernado de LLMs para produzir textos técnicos sem preservação de causalidade.

Em muitos contextos, existe código, existem tarefas, existem mensagens e existem arquivos documentais, mas não existe um mecanismo disciplinado que preserve a trajetória racional da solução.

Esse problema se agrava em cenários de:

- manutenção evolutiva;
- mudança de equipe;
- reengenharia;
- migração tecnológica;
- adoção crescente de IA como apoio à produção técnica.

O MEDE-CLI nasce para enfrentar precisamente essa lacuna: **garantir que a documentação do projeto continue inteligível, rastreável e operacionalmente útil à medida que o sistema evolui**.

---

## 3. Proposta de Valor

A proposta de valor do MEDE-CLI está na combinação de cinco capacidades:

### 3.1 Evolução documental causal

O produto organiza a documentação como consequência de eventos formais e impactos identificáveis, e não como edição arbitrária de arquivos.

### 3.2 Supervisão humana obrigatória

Toda alteração proposta pela ferramenta deve ser revisada por um responsável humano antes de ser aplicada.

### 3.3 Apoio efetivo por LLM

A ferramenta usa LLMs para sugerir alterações, derivar artefatos e apoiar sincronizações documentais, sem transferir à máquina a responsabilidade final pela verdade documental do projeto.

### 3.4 Reconstrução de estado

O projeto deve continuar compreensível mesmo que o estado operacional efêmero do CLI seja perdido, preservando capacidade de reconstrução a partir da documentação persistente.

### 3.5 Configurabilidade metodológica e operacional

A ferramenta deve adaptar nomes de arquivos, diretórios, prefixos, idioma documental, prompts por fase e provedor de LLM por projeto, sem romper sua ontologia interna.

---

## 4. Visão de Longo Prazo

A visão de longo prazo do MEDE-CLI é tornar-se o primeiro componente de um ecossistema mais amplo de engenharia de software orientada por governança documental, no qual:

- a documentação deixa de ser subproduto passivo;
- reuniões e decisões passam a gerar efeitos documentais estruturados;
- o conhecimento de engenharia se torna preservável e auditável;
- LLMs deixam de atuar como geradores livres e passam a operar sob disciplina metodológica;
- a evolução de software se torna mais observável e menos dependente de memória tácita.

Em horizonte mais amplo, o MEDE-CLI deve servir como:

- ferramenta operacional da metodologia MEDE;
- referência de boas práticas de documentação causal;
- base para extensões de editor;
- base para GUI futura;
- ponto de entrada para integração com outros produtos do ecossistema, inclusive o Janus.

---

## 5. Público-Alvo

O produto destina-se prioritariamente a perfis e contextos nos quais a preservação do entendimento do sistema é um ativo real.

### 5.1 Público-alvo primário

- arquitetos de software;
- líderes técnicos;
- consultores de engenharia de software;
- equipes que trabalham com documentação viva de projetos;
- empresas que precisam manter continuidade documental entre ciclos de evolução;
- projetos que usam ou pretendem usar LLMs com supervisão metodológica.

### 5.2 Público-alvo secundário

- pesquisadores em engenharia de software;
- professores e instrutores;
- times que precisam preservar decisões e contexto;
- organizações com exigência de rastreabilidade documental;
- equipes que desejam reduzir retrabalho causado por perda de entendimento.

### 5.3 Contextos de maior aderência

- projetos evolutivos;
- sistemas de média e longa duração;
- produtos com forte acoplamento entre negócio e tecnologia;
- iniciativas que sofrem com mudança frequente de requisito ou entendimento;
- times que desejam unificar documentação, decisão e operação assistida por IA.

---

## 6. Princípios de Produto

O MEDE-CLI deve ser desenvolvido e comunicado segundo os princípios abaixo.

### 6.1 A documentação é parte da engenharia

A ferramenta parte do princípio de que documentação não é apêndice administrativo, mas mecanismo de preservação do conhecimento da solução.

### 6.2 A alteração documental precisa de causalidade

Mudanças relevantes na documentação devem estar vinculadas a um ciclo metodológico explícito.

### 6.3 A verdade documental não é automática

LLMs podem propor, comparar, sugerir e reorganizar, mas a consolidação da documentação continua dependendo de supervisão e decisão humana.

### 6.4 O estado do projeto precisa ser reconstruível

O sistema não pode depender exclusivamente de banco local ou memória operacional efêmera.

### 6.5 O produto deve ser configurável sem perder ontologia

Cada projeto pode escolher representação física própria, mas a engine deve operar sobre um modelo conceitual estável.

### 6.6 O CLI deve ser simples por fora e rigoroso por dentro

A experiência do usuário deve ser direta, mas o motor interno precisa preservar consistência, previsibilidade e trilha operacional.

---

## 7. Escopo Funcional do Produto

### 7.1 Comando principal: ciclo metodológico

O produto deve possuir um ponto de entrada principal, representado pelo comando:

```bash
mede-cli cycle
```

Esse comando executa o próximo ciclo metodológico de evolução documental do projeto, com comportamento dependente do estado corrente.

#### 7.1.1 Quando não houver baseline documental suficiente

O comando deve iniciar o ciclo fundacional da documentação, propondo change-sets para criação inicial dos artefatos necessários, como:

* `entendimento-inicial.md`;
* `readme.md`;
* opcionalmente `situacao-atual.md`.

#### 7.1.2 Quando já houver baseline

O comando deve iniciar um ciclo de evolução documental, normalmente derivado de uma nova reunião, contexto decisório ou necessidade de atualização do entendimento.

---

### 7.2 Fluxo orientado a change-sets

Toda alteração produzida pela ferramenta deve ser representada como **change-set pendente**, contendo uma ou mais operações revisáveis.

As operações possíveis incluem, no mínimo:

* criação de diretórios;
* criação de arquivos;
* modificação de arquivos;
* inserção de trechos;
* remoção de trechos;
* substituição de blocos ou seções;
* renomeação de arquivos;
* movimentação de arquivos;
* remoção de arquivos.

As três últimas devem existir no modelo, mas seu uso prático tende a ser raro.

Nenhuma dessas operações deve ser aplicada sem aprovação explícita.

---

### 7.3 Revisão e decisão humana

O produto deve permitir que cada change-set pendente seja:

* inspecionado;
* aprovado;
* rejeitado;
* refinado.

O fluxo operacional deve prever tanto revisão individual quanto revisão em lote.

#### 7.3.1 Aprovação individual

Aplicação do change-set corrente.

#### 7.3.2 Rejeição individual

Descarte do change-set corrente.

#### 7.3.3 Aprovação em lote

Aplicação de todos os change-sets pendentes.

#### 7.3.4 Rejeição em lote

Descarte de todos os change-sets pendentes.

#### 7.3.5 Refinamento

Refino assistido por LLM:

* do change-set corrente;
* ou de todos os change-sets pendentes da conversa ativa.

---

### 7.4 Estado operacional e comando de status

O produto deve possuir um mecanismo claro de inspeção do estado metodológico corrente.

O comando de status deve informar, no mínimo:

* se existe conversa ativa;
* se o projeto está livre para novo ciclo;
* fase atual do fluxo;
* quantidade de change-sets pendentes;
* change-set corrente;
* origem do ciclo em andamento;
* possibilidade ou bloqueio de novas execuções.

Esse comando é essencial porque o MEDE-CLI não deve iniciar novo ciclo enquanto existirem pendências abertas do ciclo anterior.

---

### 7.5 Baseline documental inicial

No ciclo inicial, o produto deve ser capaz de propor a base documental mínima do projeto.

O escopo inicial deve contemplar, no mínimo:

* `entendimento-inicial.md`;
* `readme.md`;
* documento equivalente a `situacao-atual.md`, quando fizer sentido desde a primeira execução.

Esse fluxo inicial deve privilegiar:

* documentos fornecidos pelo usuário;
* prompt contextual;
* anexos de apoio;
* eventual leitura complementar do projeto, quando configurado.

A baseline inicial não deve ser tratada como “adivinhação automática” do projeto, mas como proposta supervisionada de fundação documental.

---

### 7.6 Fluxo de evolução documental pós-baseline

Após a existência da baseline, o produto deve seguir um fluxo causal em fases.

#### 7.6.1 Fase 1 — registro do evento corrente

O sistema deve primeiro propor a ata ou documento equivalente ao evento de entrada do ciclo.

#### 7.6.2 Fase 2 — derivações históricas

A partir da aprovação da ata, o sistema deve avaliar se existem impactos que justifiquem gerar:

* ADR;
* ESM;
* ou nenhum dos dois.

#### 7.6.3 Fase 3 — sincronização de documentos vivos

Somente após resolução dos artefatos históricos derivados, o sistema deve propor atualização dos documentos vivos impactados, tais como:

* `modelo-de-dados.md`;
* `requisitos-funcionais.md`;
* `requisitos-nao-funcionais.md`;
* `visao-e-escopo.md`.

Nem todos precisam ser alterados em todo ciclo.

#### 7.6.4 Fase 4 — fechamento operacional

Ao final, o sistema pode propor atualização de:

* `leg-*`;
* `situacao-atual.md`.

Essa fase também é condicional: pode gerar um, ambos ou nenhum dos artefatos.

---

### 7.7 Configuração por projeto

O produto deve possuir arquivo de configuração por projeto, por exemplo:

```json
mede.config.json
```

Esse arquivo deve permitir configurar, no mínimo:

* idioma da documentação;
* diretório raiz da documentação;
* nomes dos diretórios metodológicos;
* nomes físicos dos arquivos documentais;
* prefixos de três letras para artefatos históricos;
* prompts de sistema por fase metodológica;
* configuração de provedores de LLM;
* parâmetros por modelo ou por fase;
* políticas de envio de conteúdo à LLM;
* comportamento de reconstrução e estado local.

---

### 7.8 Abstração de LLM

O produto deve suportar diferentes provedores de LLM, de forma desacoplada da metodologia.

Devem ser contemplados, no mínimo:

* OpenAI;
* Anthropic;
* Ollama;
* endpoints compatíveis com API estilo OpenAI;
* provedores futuros.

A configuração deve permitir:

* endpoint;
* modelo;
* chave via variável de ambiente;
* timeout;
* retries;
* parâmetros de geração;
* perfis por fase.

---

### 7.9 Estado local efêmero

O diretório `.mede/` deve abrigar o estado operacional transitório do produto, incluindo:

* banco SQLite local;
* fila de change-sets;
* metadados da conversa ativa;
* backlog indexado;
* ponteiros para o current;
* índices auxiliares.

Esse diretório deve poder ser apagado sem destruir a verdade documental do projeto.

---

### 7.10 Reconstrução de estado

Quando o diretório `.mede/` não existir, o produto deve ser capaz de reconstruir estado operacional mínimo a partir da documentação persistente, com prioridade para o documento de situação atual.

Idealmente, essa reconstrução deve considerar:

* `situacao-atual.md`;
* documentos vivos centrais;
* logs de entrega recentes;
* eventualmente atas e artefatos históricos recentes.

---

## 8. Escopo de Arquitetura Técnica

### 8.1 Tipo de aplicação

Ferramenta de linha de comando.

### 8.2 Motor interno

O produto deve ter:

* engine de fases metodológicas;
* engine de change-sets;
* camada de abstração de LLM;
* applier de operações de filesystem;
* camada de estado local;
* camada de reconstrução;
* camada de configuração.

### 8.3 Persistência operacional

SQLite local em `.mede/`.

### 8.4 Persistência documental

Arquivos Markdown e afins no diretório documental do projeto.

### 8.5 Revisão humana

Obrigatória antes de qualquer operação destrutiva ou modificadora.

---

## 9. Escopo Open Source

O MEDE-CLI deve nascer com vocação de disseminação ampla.

### 9.1 O que deve ser aberto no núcleo

* engine principal do CLI;
* fluxo metodológico;
* ontologia documental interna;
* sistema de change-sets;
* configuração por projeto;
* adaptadores básicos de LLM;
* reconstrução de estado;
* documentação do próprio projeto.

### 9.2 O que pode permanecer fora do núcleo no futuro

* integrações corporativas especializadas;
* recursos enterprise;
* serviços hospedados;
* plugins pagos;
* modelos ou prompts proprietários avançados;
* recursos acoplados ao Janus.

---

## 10. Fora de Escopo do Produto na Versão Inicial

A versão inicial do MEDE-CLI não tem como objetivo:

* substituir arquitetos ou responsáveis documentais;
* produzir documentação perfeita sem revisão humana;
* inferir profundamente um projeto apenas a partir de código-fonte;
* atuar como plataforma gráfica;
* oferecer colaboração multiusuário distribuída em tempo real;
* manter base remota obrigatória;
* resolver gestão financeira ou contratual do projeto;
* realizar análise semântica total do sistema;
* produzir grafo completo de conhecimento organizacional;
* substituir sistemas de versionamento como Git.

Também está fora do escopo inicial a tentativa de capturar todos os documentos possíveis da MEDE em comandos independentes. O foco do produto está em um ciclo principal simples, porém rigoroso.

---

## 11. Restrições de Projeto

O desenvolvimento do produto deve respeitar as seguintes restrições:

### 11.1 Simplicidade operacional

O usuário não deve precisar aprender um vocabulário extenso de comandos para obter valor inicial.

### 11.2 Segurança de credenciais

Credenciais de LLM não devem ser gravadas de forma insegura em configuração de projeto.

### 11.3 Portabilidade

O produto deve funcionar em ambientes reais de desenvolvimento com o menor atrito possível.

### 11.4 Legibilidade dos artefatos

Toda documentação gerada ou alterada precisa permanecer legível e editável por humanos.

### 11.5 Preservação da metodologia

Customização não pode destruir a identidade metodológica do produto.

---

## 12. Diferenciais do Produto

Os principais diferenciais do MEDE-CLI são:

* tratar evolução documental como pipeline metodológico, não como geração avulsa de texto;
* transformar LLM em mecanismo de proposta supervisionada, não em autoridade documental;
* preservar separação entre artefatos históricos e documentos vivos;
* manter estado local efêmero e projeto persistente reconstruível;
* permitir configuração profunda sem perder ontologia estável;
* servir como ponte entre teoria metodológica e prática operacional.

---

## 13. Riscos e Cuidados Estratégicos

### 13.1 Risco de excesso de automação percebida

Se o produto parecer “editor automático que mexe em tudo”, ele perderá confiança.

### 13.2 Risco de burocratização

Se o fluxo ficar pesado demais, ele afasta times menores.

### 13.3 Risco de dependência excessiva de prompt

O núcleo não pode depender de prompts frágeis e gigantescos sem arquitetura de fases.

### 13.4 Risco de acoplamento a um provedor

O produto não deve nascer dependente de um único fornecedor de LLM.

### 13.5 Risco de divergência entre estado local e documentação persistente

A reconstrução deve ser tratada como requisito de arquitetura, não como detalhe opcional.

---

## 14. Critérios de Sucesso

O produto será considerado bem-sucedido se, em uso real, conseguir:

* reduzir o esforço de manutenção documental;
* melhorar a coerência entre evento, decisão e documento;
* permitir ciclos assistidos por LLM com supervisão humana prática;
* manter a documentação do projeto mais atual e mais explicável;
* sobreviver à perda do diretório `.mede/`;
* ser adotado em projetos reais sem exigir mudança radical de cultura logo no primeiro uso.

---

## 15. Consideração Final

O MEDE-CLI não é um simples utilitário de automação textual. Ele é a tentativa de transformar a governança documental da engenharia de software em um fluxo operacional concreto, leve o suficiente para uso real e rigoroso o suficiente para preservar conhecimento ao longo do tempo.

Seu valor não está apenas em “escrever documentos”, mas em ajudar a garantir que a evolução do projeto permaneça inteligível, rastreável, supervisionada e metodologicamente consistente.

Por isso, este produto deve ser entendido como ferramenta de engenharia documental evolutiva, e não apenas como assistente de redação técnica.

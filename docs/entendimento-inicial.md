# Entendimento Inicial — MEDE-CLI

## 1. Contexto do Problema

Projetos de engenharia de software frequentemente sofrem com perda progressiva de entendimento ao longo do tempo.
Documentações tornam-se desatualizadas, decisões não são rastreáveis e a relação entre reuniões, evolução arquitetural e documentos vivos tende a ser implícita ou fragmentada.

Com a crescente utilização de Modelos de Linguagem de Grande Escala (LLMs) no apoio ao desenvolvimento, surge um novo risco:
a documentação pode ser gerada mais rapidamente, porém sem governança metodológica, supervisão humana adequada e preservação da causalidade entre decisões e artefatos.

Esse cenário pode levar à chamada **deriva epistemológica**, caracterizada por inconsistência documental, perda de contexto e aumento do risco de manutenção.

A metodologia MEDE propõe um fluxo causal estruturado para a evolução documental:

* reuniões geram atas formais;
* atas podem derivar decisões arquiteturais (ADR) ou especificações de evolução/manutenção do sistema (ESM);
* artefatos históricos aprovados devem sincronizar os documentos vivos;
* o estado atual do projeto deve permanecer observável e reconstruível.

A aplicação manual desse processo, entretanto, é custosa e sujeita a falhas.

Surge, portanto, a necessidade de uma ferramenta operacional que:

* auxilie a atualização documental com apoio de LLMs;
* preserve a supervisão humana;
* garanta consistência causal entre artefatos;
* trate mudanças documentais como propostas estruturadas;
* mantenha um estado atual do projeto reconstruível.

Essa necessidade motiva a criação do **MEDE-CLI**.

---

## 2. Propósito do MEDE-CLI

O MEDE-CLI é uma ferramenta de linha de comando destinada a operacionalizar a metodologia MEDE, orquestrando a evolução documental por meio de propostas de alteração assistidas por LLM e supervisionadas por humanos.

Seus objetivos principais são:

* iniciar a base documental de um projeto;
* registrar reuniões como eventos causais formais;
* derivar artefatos históricos quando houver justificativa;
* sincronizar incrementalmente os documentos vivos;
* manter o estado atual do projeto claro e reconstruível;
* garantir que toda alteração documental seja revisada antes de sua aplicação.

O MEDE-CLI não substitui o julgamento de engenharia humana.
Ele atua como um **copiloto metodológico**, propondo atualizações estruturadas e organizando ciclos de revisão.

---

## 3. Princípios Operacionais Fundamentais

### 3.1 Fluxo orientado a Change-Sets

Toda evolução documental é tratada como **change-sets pendentes**.

Cada change-set pode conter operações como:

* criação de diretórios;
* criação de arquivos;
* modificação de conteúdo;
* inserção ou remoção de seções estruturadas;
* renomeação de arquivos (raro);
* movimentação de arquivos (raro);
* remoção de arquivos (raro).

Nenhuma alteração é aplicada automaticamente.

Cada proposta deve ser:

* aprovada;
* rejeitada;
* ou refinada iterativamente.

---

### 3.2 Modelo de Conversa Única Ativa

O MEDE-CLI mantém, em qualquer momento:

* uma conversa ativa;
* uma fila de change-sets pendentes;
* um change-set corrente em análise.

Novos ciclos causais só podem iniciar quando não existirem pendências.

---

### 3.3 Pipeline Causal de Evolução Documental

Dois comandos principais conduzem o ciclo:

#### `mede-cli init`

Propõe a criação da base documental inicial, incluindo:

* `entendimento-inicial.md`;
* `readme.md`;
* opcionalmente `situacao-atual.md`.

#### `mede-cli ata`

Registra uma reunião e inicia um pipeline condicional:

1. Geração da ata (`min-*`);
2. Análise de derivações após aprovação;
3. Geração opcional de ADR (`adr-*`) e/ou ESM (`esm-*`);
4. Sincronização incremental dos documentos vivos impactados;
5. Atualização opcional do log de entregas (`leg-*`) e do documento de situação atual.

Cada fase só avança quando todas as propostas da fase anterior forem resolvidas.

---

### 3.4 Estado Operacional Efêmero

O estado operacional é armazenado no diretório `.mede/`, incluindo:

* base SQLite com change-sets pendentes;
* metadados da conversa ativa;
* indexação de itens do estado atual.

Esse diretório é considerado descartável.

A reconstrução do estado do projeto deve ser possível a partir da documentação persistente, especialmente do arquivo `situacao-atual.md`.

---

### 3.5 Abstração de Provedores de LLM

O MEDE-CLI deve suportar múltiplos provedores de LLM configuráveis, tais como:

* OpenAI;
* Anthropic;
* Ollama (modelos locais);
* APIs compatíveis;
* modelos proprietários futuros.

A configuração é definida em `mede.config.json`, utilizando variáveis de ambiente para credenciais.

Os prompts são organizados por fase metodológica e podem ser customizados por projeto.

---

### 3.6 Ontologia Documental Configurável

Internamente, o MEDE-CLI opera sobre tipos estáveis de artefatos documentais.
A estrutura física de diretórios e nomes de arquivos é configurável por projeto.

Essa abordagem desacopla a lógica metodológica da representação local.

---

## 4. Escopo Inicial

A versão inicial visa suportar:

* inicialização documental;
* registro de reuniões e pipeline causal associado;
* ciclo supervisionado de change-sets;
* aplicação de operações em filesystem;
* reconstrução básica de estado;
* configuração de provedores de LLM;
* customização de prompts metodológicos.

---

## 5. Fora do Escopo Inicial

* aplicação automática de mudanças sem revisão humana;
* reconstrução profunda baseada apenas em código-fonte;
* interface gráfica;
* sincronização distribuída multiusuário;
* grafo completo de conhecimento do projeto;
* análises preditivas de risco.

---

## 6. Critérios de Sucesso

O MEDE-CLI será considerado bem-sucedido se:

* reduzir o esforço de manutenção documental;
* aumentar a rastreabilidade de decisões;
* permitir uso seguro de LLMs na evolução documental;
* manter o estado do projeto reconstruível;
* ser utilizável em projetos reais;
* atrair adoção em comunidades open-source.

---

## 7. Questões em Aberto

* granularidade ideal de change-sets;
* heurísticas para distinguir ADR de ESM;
* nível de fidelidade na reconstrução sem `.mede/`;
* equilíbrio entre padronização metodológica e customização;
* desempenho em modo offline;
* convenções de nomenclatura multilíngue.

---

## 8. Visão

O MEDE-CLI é concebido como o primeiro passo para um ecossistema em que:

* a documentação evolui de forma causal;
* o conhecimento de engenharia é preservado sistematicamente;
* LLMs operam sob governança metodológica;
* geração de software e evolução documental convergem em um fluxo unificado de engenharia.

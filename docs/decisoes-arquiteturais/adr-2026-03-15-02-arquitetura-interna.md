# ADR-2026-03-15 — Arquitetura Interna do MEDE-CLI

* **Status:** Aprovado
* **Data:** 2026-03-15
* **Projeto:** MEDE-CLI
* **Decisor:** Mozar Baptista da Silva

---

## 1. Contexto

O MEDE-CLI foi concebido como motor operacional da metodologia MEDE, responsável por:

* conduzir ciclos metodológicos de evolução documental;
* gerar e controlar change-sets;
* integrar-se a LLMs;
* aplicar alterações supervisionadas no filesystem;
* reconstruir estado operacional quando necessário.

Dada a natureza do produto, a arquitetura precisa atender simultaneamente a:

* previsibilidade operacional;
* rastreabilidade;
* baixo acoplamento;
* capacidade de evolução;
* suporte a múltiplos provedores de IA;
* suporte a reconstrução de estado.

Foi necessário definir uma arquitetura interna modular e orientada a motores funcionais independentes.

---

## 2. Decisão

Foi decidido que o MEDE-CLI será estruturado em **camadas funcionais internas**, organizadas como motores especializados.

A arquitetura será composta pelos seguintes componentes principais:

1. CLI Layer
2. Cycle Engine
3. Change-Set Engine
4. Filesystem Engine
5. LLM Integration Layer
6. State & Persistence Layer
7. Reconstruction Engine
8. Configuration Layer
9. Observability Layer

---

## 3. Descrição das Camadas

### 3.1 CLI Layer

Responsável por:

* parsing de comandos;
* validação de argumentos;
* roteamento para motores internos;
* formatação de saída;
* mensagens operacionais.

Essa camada não contém lógica metodológica.

Função:

> Interface de interação com o usuário.

---

### 3.2 Cycle Engine

Responsável por:

* iniciar ciclos metodológicos;
* determinar tipo de ciclo (baseline ou evolução);
* controlar fases do pipeline;
* decidir quando encerrar ciclo;
* orquestrar geração de change-sets.

Essa camada é o **coração metodológico do sistema**.

---

### 3.3 Change-Set Engine

Responsável por:

* criação de change-sets;
* versionamento interno;
* definição de change-set corrente;
* refinamento;
* aprovação ou rejeição;
* transição de estados.

Essa camada representa a **unidade operacional de decisão**.

---

### 3.4 Filesystem Engine

Responsável por:

* aplicação de operações aprovadas;
* geração e aplicação de diffs;
* validação de caminhos;
* execução ordenada de operações;
* rollback em caso de falha parcial.

Essa camada garante:

* segurança operacional;
* consistência documental.

---

### 3.5 LLM Integration Layer

Responsável por:

* abstração de provedores de LLM;
* execução de prompts por fase;
* controle de timeout e retry;
* normalização de respostas;
* conversão de respostas em propostas estruturadas.

Essa camada permite:

* independência de fornecedor;
* uso de modelos locais ou remotos.

---

### 3.6 State & Persistence Layer

Responsável por:

* persistência em SQLite local;
* gestão de conversa ativa;
* fila de change-sets;
* backlog indexado;
* metadados operacionais.

Esse estado será considerado **efêmero**.

---

### 3.7 Reconstruction Engine

Responsável por:

* reconstruir estado quando `.mede/` não existir;
* ler documento de situação atual;
* indexar backlog;
* reconstituir contexto mínimo do projeto.

Essa camada é essencial para:

* resiliência;
* baixo acoplamento ao estado transitório.

---

### 3.8 Configuration Layer

Responsável por:

* leitura de `mede.config.json`;
* mapeamento de artefatos;
* seleção de idioma;
* seleção de prompts;
* configuração de LLM;
* parâmetros operacionais.

Essa camada garante:

* adaptabilidade do produto a diferentes projetos.

---

### 3.9 Observability Layer

Responsável por:

* registro de eventos operacionais;
* logs estruturados;
* auditoria de decisões;
* rastreamento de execuções de LLM.

Permite:

* diagnóstico;
* melhoria contínua;
* governança.

---

## 4. Fluxo Operacional Principal

Execução típica do comando:

```bash id="jqk7h8"
mede-cli cycle
```

Fluxo interno:

1. CLI Layer recebe comando
2. State Layer valida pendências
3. Cycle Engine inicia ou continua ciclo
4. LLM Layer gera propostas
5. Change-Set Engine registra change-sets
6. Usuário revisa
7. Filesystem Engine aplica mudanças aprovadas
8. State Layer atualiza contexto
9. Cycle Engine avança fase ou encerra

---

## 5. Consequências da Arquitetura

### Positivas

* forte separação de responsabilidades;
* alta capacidade de evolução;
* facilidade de testes unitários;
* suporte a múltiplos provedores de IA;
* robustez operacional;
* reconstruibilidade do estado.

### Trade-offs

* maior número de módulos;
* necessidade de coordenação clara entre engines;
* curva inicial de implementação maior.

---

## 6. Alternativas Consideradas

### Arquitetura monolítica simples

Rejeitada por:

* dificultar evolução;
* misturar responsabilidades;
* reduzir testabilidade.

---

### Persistência permanente obrigatória

Rejeitada por:

* aumentar acoplamento;
* dificultar reconstrução;
* reduzir portabilidade.

---

### Integração direta com LLM sem camada de abstração

Rejeitada por:

* criar dependência tecnológica;
* dificultar uso offline;
* limitar evolução futura.

---

## 7. Consideração Final

Esta arquitetura estabelece as bases para que o MEDE-CLI seja:

* modular
* evolutivo
* seguro
* metodologicamente consistente
* preparado para integração profunda com o ecossistema de engenharia assistida por IA.

Ela deverá ser refinada conforme a implementação evoluir e novos requisitos surgirem.

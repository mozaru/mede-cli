# ADR-2026-03-15 — Criação do Produto MEDE-CLI e Modelo Operacional Metodológico

* **Status:** Aprovado
* **Data:** 2026-03-15
* **Contexto:** Linha de pesquisa Engenharia de Software 4.0 / Plataforma Janus
* **Decisor:** Mozar Baptista da Silva

---

## 1. Contexto

A evolução recente da engenharia de software indica:

* aumento significativo do uso de LLMs na geração de código;
* redução do diferencial competitivo baseado apenas na codificação manual;
* necessidade crescente de controle metodológico da evolução do entendimento do sistema;
* necessidade de rastreabilidade das decisões técnicas e documentais.

Foi identificado que:

* o produto **Janus** já permite geração determinística de backend;
* o uso de LLM mostrou alta eficiência para geração de UI e apoio documental;
* projetos reais já demonstraram valor do uso combinado de geração automática e decisão metodológica.

Entretanto, ainda não existia uma ferramenta operacional que permitisse:

* conduzir ciclos estruturados de evolução documental;
* controlar alterações propostas por IA;
* manter supervisão humana obrigatória;
* garantir auditabilidade e governança do entendimento do sistema.

Diante desse cenário, foi proposta a criação do produto **MEDE-CLI**.

---

## 2. Decisão

Foi decidido:

### 2.1 Criar o produto MEDE-CLI

O MEDE-CLI será uma ferramenta de linha de comando responsável por:

* conduzir ciclos metodológicos de evolução documental;
* registrar reuniões e eventos relevantes;
* gerar propostas estruturadas de alteração em documentos;
* permitir revisão humana antes da aplicação;
* integrar-se a múltiplos provedores de LLM;
* manter rastreabilidade de decisões e mudanças.

O produto será o **motor operacional da metodologia MEDE**.

---

### 2.2 Definir ciclo metodológico como unidade de evolução

A evolução documental do projeto ocorrerá por ciclos.

O comando principal será:

```
mede-cli cycle
```

Esse comando será responsável por:

* iniciar baseline documental quando necessário;
* registrar reuniões e decisões;
* gerar change-sets;
* conduzir pipeline metodológico;
* encerrar o ciclo quando não houver pendências.

---

### 2.3 Definir change-set como unidade de decisão

Toda alteração proposta pelo sistema deverá ser representada como **change-set** contendo:

* justificativa;
* artefato alvo;
* operações de filesystem;
* diffs claros e auditáveis.

Nenhuma alteração será aplicada automaticamente.

A aplicação dependerá de decisão humana explícita.

---

### 2.4 Definir supervisão humana obrigatória

Foi decidido que:

* a LLM nunca modificará diretamente arquivos do projeto;
* toda saída será apresentada como proposta revisável;
* o usuário deverá aprovar ou rejeitar cada change-set.

Essa decisão visa:

* segurança metodológica;
* governança documental;
* redução de risco de corrupção do entendimento do sistema.

---

### 2.5 Definir estado operacional local efêmero

O sistema utilizará:

* diretório `.mede/`
* banco SQLite local

Esse estado será considerado **efêmero**.

O sistema deverá ser capaz de:

* reconstruir estado operacional mínimo a partir da documentação persistente;
* especialmente do documento de situação atual.

---

### 2.6 Definir arquivo de configuração do projeto

Foi decidido utilizar:

```
mede.config.json
```

Esse arquivo permitirá configurar:

* idioma documental;
* mapeamento de artefatos;
* diretórios documentais;
* prompts metodológicos;
* provedores de LLM;
* parâmetros operacionais.

---

### 2.7 Definir tecnologia de implementação

Foi decidido implementar a primeira versão do produto em:

> **TypeScript + Node.js**

Motivos:

* rapidez de desenvolvimento;
* portabilidade multiplataforma;
* integração natural com VSCode;
* facilidade de distribuição via npm;
* ampla disponibilidade de SDKs de LLM.

---

### 2.8 Definir estratégia de licenciamento

O produto será disponibilizado como:

> **Open-source sob licença Apache 2.0**

Objetivos:

* estimular adoção;
* permitir uso comercial;
* preservar possibilidade de exploração futura;
* fomentar comunidade técnica.

---

## 3. Consequências da Decisão

### 3.1 Consequências positivas

* criação de ferramenta operacional alinhada ao futuro da engenharia de software;
* aumento da governança sobre uso de IA em projetos;
* padronização da evolução documental;
* maior previsibilidade na manutenção de sistemas;
* possibilidade de disseminação acadêmica e corporativa;
* integração natural com a plataforma Janus.

---

### 3.2 Trade-offs e impactos negativos

* aumento da complexidade inicial do produto;
* necessidade de maturação da experiência de uso;
* dependência parcial da qualidade dos prompts de LLM;
* necessidade de validação em projetos maiores;
* curva de adoção metodológica por novos usuários.

Esses impactos foram considerados aceitáveis no contexto da decisão.

---

## 4. Alternativas Consideradas e Rejeitadas

### 4.1 Não criar ferramenta dedicada

Rejeitado porque:

* dificultaria adoção estruturada da metodologia;
* limitaria rastreabilidade e governança;
* aumentaria dependência de processos manuais.

---

### 4.2 Ferramenta totalmente automática (sem supervisão humana)

Rejeitado porque:

* eleva risco de alteração indevida do entendimento do sistema;
* reduz confiabilidade metodológica;
* compromete auditabilidade.

---

### 4.3 Persistência operacional permanente

Rejeitado porque:

* aumenta acoplamento ao estado transitório;
* dificulta reconstrução;
* eleva complexidade de manutenção.

---

### 4.4 Implementação inicial em Go ou Rust

Rejeitado para a primeira versão porque:

* reduziria velocidade de construção;
* aumentaria esforço inicial;
* traria menor integração com ecossistema de IDEs.

---

## 5. Consideração Final

A criação do MEDE-CLI é uma decisão estratégica alinhada:

* à evolução tecnológica do desenvolvimento de software;
* à consolidação da metodologia MEDE;
* à integração com a plataforma Janus;
* à construção de uma linha de pesquisa em Engenharia de Software 4.0.

Este ADR formaliza o início da construção do produto e estabelece os princípios operacionais fundamentais que deverão orientar sua arquitetura e evolução futura.

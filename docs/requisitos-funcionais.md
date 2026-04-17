# Requisitos Funcionais

## MEDE-CLI

**Status:** versão inicial consolidada
**Objetivo:** definir as capacidades funcionais obrigatórias do MEDE-CLI para suportar a evolução documental causal supervisionada segundo a metodologia MEDE.

---

## 1. Gerenciamento do Projeto

### RF-001 — Inicialização do contexto do projeto

O sistema deve permitir inicializar o contexto operacional do MEDE-CLI em um projeto local.

Deve:

* identificar diretório raiz do projeto;
* localizar ou criar diretório `.mede/`;
* localizar arquivo `mede.config.json`, quando existente;
* registrar projeto no banco local.

---

### RF-002 — Carregamento da configuração do projeto

O sistema deve carregar a configuração metodológica e operacional a partir de `mede.config.json`.

Deve suportar:

* idioma documental;
* diretório raiz da documentação;
* mapeamento de artefatos;
* configuração de LLM;
* prompts por fase;
* prefixos documentais.

---

### RF-003 — Atualização da configuração

O sistema deve detectar alteração no arquivo de configuração e recarregar parâmetros operacionais.

---

## 2. Execução do Ciclo Metodológico

### RF-004 — Comando principal de ciclo

O sistema deve executar um ciclo metodológico completo por meio do comando:

```bash
mede-cli cycle
```

Deve:

* verificar estado atual;
* impedir execução se houver pendências;
* iniciar baseline ou evolução conforme contexto.

---

### RF-005 — Determinação automática do tipo de ciclo

O sistema deve identificar se o ciclo é:

* ciclo fundacional (baseline);
* ciclo evolutivo.

Critério:

* existência ou não de documentação mínima válida.

---

### RF-006 — Criação de conversa ativa

Ao iniciar ciclo, o sistema deve criar uma conversa ativa associada ao projeto.

---

### RF-007 — Controle de fases metodológicas

O sistema deve controlar o avanço entre fases do ciclo:

* geração de baseline;
* registro de evento;
* derivações históricas;
* sincronização de documentos vivos;
* sincronização final.

---

### RF-008 — Encerramento automático do ciclo

O sistema deve encerrar a conversa ativa quando:

* não existirem change-sets pendentes;
* não existirem novas fases a executar.

---

## 3. Geração e Gerenciamento de Change-Sets

### RF-009 — Geração de change-sets

O sistema deve gerar change-sets contendo propostas de alteração documental.

Cada change-set deve possuir:

* justificativa;
* artefato alvo;
* lista de operações.

---

### RF-010 — Geração de múltiplos change-sets

O sistema deve permitir geração de múltiplos change-sets dentro de uma mesma fase.

---

### RF-011 — Definição de change-set corrente

O sistema deve manter um change-set corrente entre os pendentes.

---

### RF-012 — Listagem de change-sets

O sistema deve permitir listar todos os change-sets pendentes.

---

### RF-013 — Inspeção detalhada de change-set

O sistema deve permitir visualizar:

* operações propostas;
* diffs;
* conteúdo novo.

---

### RF-014 — Aprovação individual de change-set

O sistema deve permitir aprovar change-set corrente.

Deve:

* aplicar operações no filesystem;
* atualizar status.

---

### RF-015 — Rejeição individual de change-set

O sistema deve permitir rejeitar change-set corrente.

---

### RF-016 — Aprovação em lote

O sistema deve permitir aprovar todos os change-sets pendentes.

---

### RF-017 — Rejeição em lote

O sistema deve permitir rejeitar todos os change-sets pendentes.

---

### RF-018 — Refinamento do change-set corrente

O sistema deve permitir enviar instruções adicionais para refinar o change-set corrente.

---

### RF-019 — Refinamento global

O sistema deve permitir refinar todos os change-sets pendentes da conversa ativa.

---

### RF-020 — Versionamento interno do change-set

O sistema deve registrar revisões sucessivas de um change-set após refinamento.

---

## 4. Operações de Filesystem

### RF-021 — Criação de diretórios

O sistema deve criar diretórios conforme operações aprovadas.

---

### RF-022 — Criação de arquivos

O sistema deve criar arquivos com conteúdo proposto.

---

### RF-023 — Modificação de arquivos

O sistema deve modificar arquivos existentes com base em diffs.

---

### RF-024 — Inserção de seções

O sistema deve inserir trechos em posições identificadas.

---

### RF-025 — Remoção de seções

O sistema deve remover trechos conforme change-set aprovado.

---

### RF-026 — Substituição de conteúdo

O sistema deve substituir blocos existentes.

---

### RF-027 — Renomeação de arquivos

O sistema deve suportar renomeação quando proposta.

---

### RF-028 — Movimentação de arquivos

O sistema deve suportar mover arquivos entre diretórios.

---

### RF-029 — Exclusão de arquivos

O sistema deve permitir exclusão quando explicitamente aprovado.

---

## 5. Estado Operacional e Status

### RF-030 — Exibição do status do sistema

O sistema deve fornecer comando para exibir:

* existência de conversa ativa;
* fase atual;
* quantidade de change-sets pendentes;
* current change-set.

---

### RF-031 — Bloqueio de novo ciclo

O sistema deve impedir execução de novo ciclo enquanto existirem pendências.

---

## 6. Integração com LLM

### RF-032 — Seleção de provedor de LLM

O sistema deve permitir configurar e utilizar diferentes provedores.

---

### RF-033 — Uso de perfis por fase

O sistema deve permitir associar perfis de LLM a fases metodológicas.

---

### RF-034 — Execução de chamadas à LLM

O sistema deve enviar prompts estruturados e receber propostas de change-sets.

---

### RF-035 — Registro de execução de LLM

O sistema deve registrar metadados das chamadas realizadas.

---

## 7. Reconstrução de Estado

### RF-036 — Reconstrução do estado operacional

O sistema deve ser capaz de reconstruir estado mínimo do projeto quando `.mede/` não existir.

---

### RF-037 — Indexação do documento de situação atual

O sistema deve ler e indexar backlog existente no documento de situação atual.

---

### RF-038 — Recriação da base SQLite

O sistema deve recriar automaticamente o banco operacional.

---

## 8. Configuração Metodológica

### RF-039 — Mapeamento configurável de artefatos

O sistema deve permitir alterar nomes físicos dos documentos.

---

### RF-040 — Configuração de prompts por fase

O sistema deve permitir customizar system prompts.

---

### RF-041 — Configuração de idioma documental

O sistema deve suportar documentação em diferentes idiomas.

---

## 9. Auditoria e Registro Operacional

### RF-042 — Registro de eventos operacionais

O sistema deve registrar eventos relevantes:

* início de ciclo;
* geração de changes;
* aprovação;
* rejeição;
* reconstrução.

---

### RF-043 — Registro de decisões humanas

O sistema deve registrar decisões de revisão.

---

## 10. Usabilidade e Experiência de Uso

### RF-044 — Interface de linha de comando consistente

O sistema deve apresentar mensagens claras e previsíveis.

---

### RF-045 — Feedback de progresso

O sistema deve informar avanço entre fases.

---

### RF-046 — Tratamento de erros operacionais

O sistema deve tratar:

* arquivos inexistentes;
* conflitos de diff;
* falha de LLM;
* inconsistência de estado.

---

## 11. Consideração Final

Estes requisitos funcionais definem o comportamento mínimo esperado do MEDE-CLI para cumprir seu papel como motor de evolução documental supervisionada.

A arquitetura interna, o modelo de dados e o backlog devem evoluir em conformidade com este conjunto de requisitos.

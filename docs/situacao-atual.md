# Situação Atual

**Sistema:** MEDE-CLI  
**Cliente:** Projeto interno / Open Source  
**Fornecedor:** 11Tech  
**Data de referência:** 2026-03-15  
**Origem da consolidação:** consolidação inicial derivada do entendimento atual do produto, das definições arquiteturais já discutidas e da documentação base já produzida  
**Ritmo de evolução:** incremental, orientado por ciclos metodológicos

---

## 1. Resumo analítico

O projeto **MEDE-CLI** encontra-se em fase inicial de estruturação, com o núcleo conceitual já bem definido e com decisões relevantes já tomadas sobre o modelo operacional do produto.

No estado atual, já existe entendimento consolidado sobre:

- problema que o produto pretende resolver;
- proposta de valor central;
- papel do comando principal `mede-cli cycle`;
- necessidade de change-sets supervisionados;
- existência de estado operacional efêmero em `.mede/`;
- uso de SQLite local;
- reconstrução de estado a partir da documentação persistente;
- configuração de provedores de LLM e prompts por fase em `mede.config.json`;
- uso de ontologia documental interna desacoplada de nomes físicos de arquivos.

As pendências concentram-se principalmente em:

- definição detalhada da arquitetura interna;
- modelagem formal do banco SQLite;
- definição completa dos requisitos funcionais e não funcionais;
- estrutura do repositório;
- implementação do protótipo inicial;
- formalização dos formatos de change-set e das regras de reconstrução.

Neste momento, o projeto já possui **base conceitual forte**, mas ainda não possui **implementação funcional mínima concluída**.

---

## 2. Indicadores consolidados

**Itens concluídos:** 11  
**Itens pendentes:** 19  

### Distribuição do backlog pendente

- Arquitetura: 5
- CLI / UX operacional: 4
- Persistência / Estado local: 3
- LLM / Integração: 3
- Documentação metodológica: 2
- Estrutura de repositório / publicação: 2

---

## 3. Tabela consolidada de todos os itens do projeto

| ID       | Tipo                  | Nome                                                                 | Origem                         | Situação Atual |
|----------|-----------------------|----------------------------------------------------------------------|--------------------------------|----------------|
| BL-001   | Conceito              | Definição do problema central do produto                             | Entendimento inicial           | Concluído      |
| BL-002   | Conceito              | Definição do propósito do MEDE-CLI                                   | Entendimento inicial           | Concluído      |
| BL-003   | Conceito              | Definição de change-sets como unidade operacional                    | Discussões do produto          | Concluído      |
| BL-004   | Conceito              | Supervisão humana obrigatória para aplicação de mudanças             | Discussões do produto          | Concluído      |
| BL-005   | Decisão               | Adoção de diretório `.mede/` como estado operacional efêmero         | Discussões do produto          | Concluído      |
| BL-006   | Decisão               | Uso de SQLite local para estado operacional                          | Discussões do produto          | Concluído      |
| BL-007   | Decisão               | Reconstrução do estado a partir da documentação persistente          | Discussões do produto          | Concluído      |
| BL-008   | Decisão               | Adoção de `mede.config.json` para configuração do projeto            | Discussões do produto          | Concluído      |
| BL-009   | Decisão               | Suporte a múltiplos provedores de LLM                                | Discussões do produto          | Concluído      |
| BL-010   | Decisão               | Uso de prompts por fase metodológica                                 | Discussões do produto          | Concluído      |
| BL-011   | Decisão               | Adoção do comando principal `mede-cli cycle`                         | Discussões do produto          | Concluído      |
| DOC-001  | Documento             | `entendimento-inicial.md`                                            | Baseline documental            | Concluído      |
| DOC-002  | Documento             | `readme.md`                                                          | Baseline documental            | Concluído      |
| DOC-003  | Documento             | `visao-e-escopo.md`                                                  | Baseline documental            | Concluído      |
| DOC-004  | Documento             | `situacao-atual.md`                                                  | Baseline documental            | Concluído      |
| ARQ-001  | Arquitetura           | Definir camadas internas do MEDE-CLI                                 | Próxima etapa técnica          | Pendente       |
| ARQ-002  | Arquitetura           | Definir engine de fases metodológicas                                | Próxima etapa técnica          | Pendente       |
| ARQ-003  | Arquitetura           | Definir engine de change-sets                                        | Próxima etapa técnica          | Pendente       |
| ARQ-004  | Arquitetura           | Definir filesystem applier para operações aprovadas                  | Próxima etapa técnica          | Pendente       |
| ARQ-005  | Arquitetura           | Definir mecanismo de reconstrução de estado                          | Próxima etapa técnica          | Pendente       |
| CLI-001  | Funcionalidade CLI    | Definir comando `status`                                             | UX operacional                 | Pendente       |
| CLI-002  | Funcionalidade CLI    | Definir comando `changes`                                            | UX operacional                 | Pendente       |
| CLI-003  | Funcionalidade CLI    | Definir comando `approve`                                            | UX operacional                 | Pendente       |
| CLI-004  | Funcionalidade CLI    | Definir comando `reject`                                             | UX operacional                 | Pendente       |
| CLI-005  | Funcionalidade CLI    | Definir comando `refine`                                             | UX operacional                 | Pendente       |
| CLI-006  | Funcionalidade CLI    | Definir comportamento detalhado do `cycle`                           | UX operacional                 | Pendente       |
| DB-001   | Persistência          | Modelar esquema SQLite de estado operacional                         | Estado local                   | Pendente       |
| DB-002   | Persistência          | Modelar tabela de backlog indexado                                   | Estado local                   | Pendente       |
| DB-003   | Persistência          | Modelar representação de current change e fila pendente              | Estado local                   | Pendente       |
| LLM-001  | Integração            | Definir interface abstrata de provedores de LLM                      | Integração LLM                 | Pendente       |
| LLM-002  | Integração            | Definir suporte inicial a OpenAI                                     | Integração LLM                 | Pendente       |
| LLM-003  | Integração            | Definir suporte inicial a Ollama                                     | Integração LLM                 | Pendente       |
| CFG-001  | Configuração          | Definir estrutura completa de `mede.config.json`                     | Configuração do projeto        | Pendente       |
| CFG-002  | Configuração          | Definir sistema de prompts por fase metodológica                     | Configuração do projeto        | Pendente       |
| DOC-005  | Documento             | Produzir `requisitos-funcionais.md`                                  | Documentação base              | Pendente       |
| DOC-006  | Documento             | Produzir `requisitos-nao-funcionais.md`                              | Documentação base              | Pendente       |
| DOC-007  | Documento             | Produzir `modelo-de-dados.md`                                        | Documentação base              | Pendente       |
| OSS-001  | Publicação            | Definir estrutura inicial do repositório                             | Preparação open source         | Pendente       |
| OSS-002  | Publicação            | Adicionar licença Apache 2.0 ao projeto                              | Preparação open source         | Pendente       |

---

## 4. Observações sobre o estado atual

### 4.1 Itens concluídos neste estágio

Os itens marcados como concluídos referem-se principalmente a:

- decisões conceituais já consolidadas;
- definição do modelo metodológico do produto;
- produção da documentação base inicial.

Esses itens não representam ainda entrega funcional de software, mas representam **estabilização do entendimento do produto**, o que é essencial nesta fase.

### 4.2 Itens pendentes prioritários

Os itens mais críticos para a próxima etapa são:

- definição da arquitetura interna;
- modelagem do banco SQLite;
- definição do comportamento operacional dos comandos;
- produção dos requisitos funcionais e não funcionais;
- estruturação do repositório inicial.

### 4.3 Natureza do backlog atual

Neste momento, o backlog é predominantemente:

- arquitetural;
- metodológico;
- documental;
- fundacional.

Ainda não se trata de backlog de manutenção corretiva ou evolutiva de software já implementado, mas de backlog de **construção inicial do produto**.

---

## 5. Riscos atuais

Os principais riscos identificados neste momento são:

- excesso de complexidade já na primeira versão;
- modelagem excessivamente conceitual sem prototipação rápida;
- definição insuficiente do comportamento real dos change-sets;
- dificuldade de equilibrar flexibilidade de configuração e preservação metodológica;
- risco de a ferramenta parecer um gerador genérico de documentação em vez de motor metodológico.

---

## 6. Próximos passos imediatos

1. Produzir `requisitos-funcionais.md`.
2. Produzir `requisitos-nao-funcionais.md`.
3. Produzir `modelo-de-dados.md`.
4. Definir arquitetura interna detalhada do MEDE-CLI.
5. Definir o esquema SQLite.
6. Definir o contrato operacional completo do comando `cycle`.
7. Estruturar o repositório inicial.
8. Implementar protótipo mínimo funcional.

---

## 7. Consideração final

O MEDE-CLI já possui uma base conceitual consistente e um backlog inicial suficientemente claro para iniciar a fase de detalhamento técnico.

O foco agora deve ser transformar esse entendimento consolidado em:

- requisitos claros;
- arquitetura executável;
- persistência bem modelada;
- fluxo operacional testável.

Este documento passa a ser a referência viva para acompanhamento do estado atual do produto, servindo também como base para futura reconstrução do backlog operacional.
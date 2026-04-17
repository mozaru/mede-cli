# Requisitos Não Funcionais

## MEDE-CLI

**Status:** versão inicial consolidada
**Objetivo:** definir atributos de qualidade, restrições operacionais, critérios de desempenho, confiabilidade, segurança, usabilidade e evolução do MEDE-CLI.

---

## 1. Desempenho

### RNF-001 — Tempo de inicialização do CLI

O sistema deve iniciar e apresentar resposta ao comando em tempo inferior a **2 segundos** em ambiente local padrão.

---

### RNF-002 — Tempo de leitura do estado operacional

A leitura do estado operacional local (`.mede/`) deve ocorrer em tempo inferior a **1 segundo** para projetos com até **5.000 change-sets históricos**.

---

### RNF-003 — Tempo de listagem de change-sets

A listagem de change-sets pendentes deve ocorrer em tempo inferior a **1 segundo**.

---

### RNF-004 — Tempo de aplicação de change-set

A aplicação de change-set deve ocorrer de forma incremental e previsível, com feedback ao usuário.

Operações individuais de filesystem não devem exceder **500 ms** em média.

---

### RNF-005 — Execução de chamadas a LLM

O sistema deve:

* permitir timeout configurável;
* permitir retries configuráveis;
* não bloquear permanentemente a execução do CLI em caso de falha externa.

---

## 2. Escalabilidade

### RNF-006 — Volume de documentação

O sistema deve suportar projetos com:

* até **50.000 arquivos documentais**;
* até **1.000.000 linhas totais de documentação**.

---

### RNF-007 — Volume de backlog indexado

O sistema deve suportar backlog com:

* até **10.000 itens ativos** no documento de situação atual.

---

### RNF-008 — Volume de change-sets

O sistema deve suportar:

* até **20.000 change-sets históricos** sem degradação significativa.

---

## 3. Confiabilidade

### RNF-009 — Persistência transacional

Operações aprovadas devem ser aplicadas com consistência.

O sistema deve evitar:

* aplicação parcial silenciosa;
* corrupção de arquivos;
* inconsistência entre banco local e filesystem.

---

### RNF-010 — Recuperação após falha

O sistema deve permitir:

* retomada segura após interrupção;
* reexecução idempotente de operações pendentes.

---

### RNF-011 — Reconstrução de estado

O sistema deve conseguir reconstruir estado operacional mínimo quando:

* o diretório `.mede/` for removido;
* o banco SQLite estiver corrompido.

---

### RNF-012 — Detecção de inconsistência

O sistema deve detectar:

* arquivo alvo inexistente;
* diff não aplicável;
* conflito estrutural.

---

## 4. Segurança

### RNF-013 — Proteção de credenciais

Credenciais de LLM não devem ser armazenadas em texto puro no banco.

Devem ser referenciadas por:

* variáveis de ambiente;
* provedores externos.

---

### RNF-014 — Controle de envio de dados para LLM

O sistema deve permitir:

* configuração de política de envio;
* desativação completa de chamadas externas.

---

### RNF-015 — Execução local segura

O sistema não deve executar:

* comandos arbitrários derivados de conteúdo de change-sets;
* scripts externos não confiáveis.

---

### RNF-016 — Proteção contra operações destrutivas involuntárias

Operações como:

* delete_file
* move_file
* rename_file

devem exigir:

* aprovação explícita;
* destaque visual ao usuário.

---

## 5. Usabilidade

### RNF-017 — Clareza de mensagens

O CLI deve apresentar:

* mensagens objetivas;
* estados explícitos;
* sugestões de ação.

---

### RNF-018 — Modelo mental simples

O usuário deve conseguir operar o sistema dominando:

* `cycle`
* `status`
* revisão de change-sets.

---

### RNF-019 — Feedback de progresso

O sistema deve informar:

* fase atual;
* avanço do ciclo;
* existência de pendências.

---

### RNF-020 — Legibilidade dos diffs

Os diffs devem ser:

* legíveis em terminal padrão;
* consistentes;
* previsíveis.

---

## 6. Portabilidade

### RNF-021 — Sistemas operacionais suportados

O sistema deve funcionar em:

* Linux
* macOS
* Windows

---

### RNF-022 — Dependências externas mínimas

O sistema deve evitar dependências pesadas.

---

### RNF-023 — Funcionamento offline

O sistema deve permitir operação offline:

* usando modelos locais;
* sem chamadas externas.

---

## 7. Observabilidade

### RNF-024 — Logs operacionais

O sistema deve registrar:

* eventos relevantes;
* erros;
* decisões.

---

### RNF-025 — Níveis de log

O sistema deve suportar níveis:

* INFO
* WARNING
* ERROR
* DEBUG

---

## 8. Governança de IA

### RNF-026 — Supervisão humana obrigatória

Nenhuma alteração documental deve ser aplicada automaticamente.

---

### RNF-027 — Auditabilidade das propostas

Toda proposta gerada por LLM deve ser:

* rastreável;
* justificável;
* revisável.

---

### RNF-028 — Configurabilidade de prompts

O sistema deve permitir customização de prompts por projeto.

---

## 9. Manutenibilidade

### RNF-029 — Arquitetura modular

O sistema deve possuir:

* engine de ciclo;
* engine de change-sets;
* camada de LLM;
* camada de persistência.

---

### RNF-030 — Evolução incremental

O produto deve permitir:

* introdução de novos tipos documentais;
* novas fases metodológicas;
* novos provedores de LLM.

---

## 10. Testabilidade

### RNF-031 — Testes automatizáveis

O sistema deve permitir:

* testes unitários da engine;
* testes de aplicação de diff;
* testes de reconstrução.

---

### RNF-032 — Simulação de LLM

O sistema deve permitir:

* uso de mock de LLM;
* execução determinística em testes.

---

## 11. Consideração Final

Estes requisitos não funcionais estabelecem o nível mínimo de qualidade esperado para que o MEDE-CLI seja utilizável em ambientes reais de engenharia de software, mantendo:

* previsibilidade operacional;
* governança documental;
* segurança no uso de IA;
* capacidade de evolução.

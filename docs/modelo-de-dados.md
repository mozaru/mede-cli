# Modelo de Dados

## MEDE-CLI

> **Status:** Modelo lógico inicial – sujeito a ajustes conforme a arquitetura interna consolidada  
> **Objetivo:** Definir entidades, campos mínimos, relacionamentos e estruturas necessárias para suportar o estado operacional do MEDE-CLI, a fila de change-sets, a conversa ativa, a reconstrução do estado e a configuração metodológica do projeto.  
> **Observação:** Este documento descreve principalmente o **modelo lógico do estado operacional local** do produto, persistido em SQLite no diretório `.mede/`, além dos vínculos documentais necessários para reconstrução do estado a partir dos arquivos persistentes do projeto.  
> **Nota:** Os nomes abaixo estão documentados em `snake_case` para leitura técnica. A implementação física poderá adotar convenção diferente, desde que mantenha coerência.

---

## 1. Visão Geral

O modelo de dados do MEDE-CLI se organiza em seis blocos principais:

1. **Projeto e Configuração**  
2. **Conversa Ativa e Ciclos Metodológicos**  
3. **Change-Sets e Operações Pendentes**  
4. **Backlog / Estado Atual Indexado**  
5. **Integração com LLM e Refinamentos**  
6. **Reconstrução, Auditoria Local e Metadados Operacionais**

O modelo foi concebido com duas premissas centrais:

- o diretório `.mede/` é **estado operacional efêmero**, podendo ser apagado;
- a documentação persistente do projeto, especialmente o documento de **situação atual**, deve permitir **reconstrução suficiente do estado operacional**.

---

## 2. Entidades Principais

### 2.1 Projeto (`Projeto`)

Representa o contexto local do projeto em que o MEDE-CLI está operando.

**Campos mínimos**

- `id` (PK)
- `nome` (nullable)
- `raiz_projeto_path`
- `docs_root_path`
- `mede_config_path`
- `idioma_documentacao`
- `criado_em`
- `atualizado_em`

**Regras**

- Deve existir apenas um projeto ativo por banco local `.mede`.
- `raiz_projeto_path` deve apontar para a raiz real do projeto.
- `docs_root_path` deve refletir a configuração efetiva do projeto.

---

### 2.2 Configuração do Projeto (`ConfiguracaoProjeto`)

Representa a configuração consolidada lida de `mede.config.json`.

**Campos mínimos**

- `id` (PK)
- `projeto_id` (FK → `Projeto.id`)
- `conteudo_json`
- `hash_configuracao`
- `carregado_em`

**Regras**

- O conteúdo completo da configuração deve ser preservado como JSON.
- O hash deve permitir verificar se a configuração mudou desde o último carregamento.
- A configuração efetiva deve ser reprocessável a partir do arquivo físico do projeto.

---

### 2.3 Mapeamento de Artefatos (`MapeamentoArtefato`)

Permite desacoplar a ontologia interna do MEDE-CLI dos nomes físicos dos arquivos e diretórios do projeto.

**Campos mínimos**

- `id` (PK)
- `projeto_id` (FK → `Projeto.id`)
- `tipo_artefato`
- `nome_fisico_arquivo`
- `diretorio_fisico`
- `prefixo_padrao` (nullable)
- `ativo`
- `criado_em`
- `atualizado_em`

**Exemplos de `tipo_artefato`**

- `initial_understanding`
- `project_readme`
- `current_state`
- `scope_and_vision`
- `functional_requirements`
- `non_functional_requirements`
- `data_model`
- `meeting_minutes`
- `architectural_decision`
- `system_maintenance_specification`
- `delivery_log`

**Regras**

- O tipo de artefato é estável internamente.
- O nome físico pode variar conforme idioma e configuração do projeto.
- Prefixos de artefatos históricos devem ser preferencialmente de três letras.

---

## 3. Conversa Ativa e Ciclo Metodológico

### 3.1 Conversa Ativa (`ConversaAtiva`)

Representa a linha principal de conversa do ciclo metodológico em andamento.

**Campos mínimos**

- `id` (PK)
- `projeto_id` (FK → `Projeto.id`)
- `origem_comando` (ex.: `cycle`)
- `tipo_ciclo` (`baseline`, `evolucao`)
- `fase_atual_id` (FK → `FaseCiclo.id`)
- `status_conversa_id` (FK → `StatusConversa.id`)
- `prompt_inicial` (nullable)
- `resumo_contexto` (nullable)
- `iniciada_em`
- `atualizada_em`
- `encerrada_em` (nullable)

**Regras**

- Pode existir no máximo uma conversa ativa por projeto.
- Uma nova conversa só pode iniciar se não houver change-sets pendentes.
- A conversa deve morrer quando todas as pendências forem resolvidas e não houver próxima fase a gerar.

---

### 3.2 Fase do Ciclo (`FaseCiclo`)

Representa as fases possíveis do pipeline metodológico.

**Campos mínimos**

- `id` (PK)
- `codigo`
- `nome`
- `ordem`
- `ativo`

**Carga inicial sugerida**

- `baseline_generation`
- `meeting_record`
- `historical_derivations`
- `living_docs_sync`
- `final_sync`
- `done`

**Regras**

- A conversa ativa deve sempre apontar para uma fase válida.
- Nem toda conversa precisa passar por todas as fases.
- O avanço entre fases depende de zerar o loop de changes da fase corrente e reavaliar impactos.

---

### 3.3 Status da Conversa (`StatusConversa`)

**Campos mínimos**

- `id` (PK)
- `nome`

**Carga inicial sugerida**

- `Ativa`
- `Aguardando Revisao`
- `Concluida`
- `Cancelada`

---

## 4. Change-Sets e Operações

### 4.1 Change-Set (`ChangeSet`)

Unidade principal de alteração pendente proposta pelo sistema.

**Campos mínimos**

- `id` (PK)
- `projeto_id` (FK → `Projeto.id`)
- `conversa_ativa_id` (FK → `ConversaAtiva.id`)
- `fase_ciclo_id` (FK → `FaseCiclo.id`)
- `tipo_change_set_id` (FK → `TipoChangeSet.id`)
- `artefato_alvo_tipo` (nullable)
- `arquivo_alvo_path` (nullable)
- `titulo_resumo`
- `justificativa`
- `incertezas_json` (nullable)
- `confianca` (nullable)
- `status_change_set_id` (FK → `StatusChangeSet.id`)
- `revision_number` (default: 1)
- `is_current` (bool, default: false)
- `gerado_por_llm` (bool, default: true)
- `criado_em`
- `atualizado_em`
- `decidido_em` (nullable)

**Regras**

- Pode existir apenas um `is_current = true` entre os change-sets pendentes da conversa ativa.
- Change-sets aprovados devem ser aplicados.
- Change-sets rejeitados devem ser ignorados.
- Um refine do current não cria item paralelo; deve gerar nova revisão do mesmo change-set lógico.

---

### 4.2 Tipo de Change-Set (`TipoChangeSet`)

**Campos mínimos**

- `id` (PK)
- `nome`

**Carga inicial sugerida**

- `CreateArtifact`
- `ModifyArtifact`
- `DeriveArtifact`
- `SyncLivingDocument`
- `FinalizeState`
- `FilesystemOperation`

---

### 4.3 Status do Change-Set (`StatusChangeSet`)

**Campos mínimos**

- `id` (PK)
- `nome`

**Carga inicial sugerida**

- `Pendente`
- `Aprovado`
- `Rejeitado`
- `Aplicado`
- `Substituido`

---

### 4.4 Operação de Change-Set (`OperacaoChangeSet`)

Representa cada operação concreta que compõe um change-set.

**Campos mínimos**

- `id` (PK)
- `change_set_id` (FK → `ChangeSet.id`)
- `tipo_operacao_id` (FK → `TipoOperacao.id`)
- `target_path`
- `source_path` (nullable)
- `anchor_text` (nullable)
- `start_line` (nullable)
- `end_line` (nullable)
- `diff_text` (nullable)
- `conteudo_novo` (nullable)
- `ordem_execucao`
- `criado_em`

**Regras**

- Um change-set pode conter uma ou mais operações.
- A revisão humana é feita sobre o conjunto, mas a aplicação respeita a ordem das operações.
- Operações destrutivas devem ser raras e claramente identificadas.

---

### 4.5 Tipo de Operação (`TipoOperacao`)

**Campos mínimos**

- `id` (PK)
- `nome`

**Carga inicial sugerida**

- `mkdir`
- `create_file`
- `modify_file`
- `insert_section`
- `remove_section`
- `replace_section`
- `rename_file`
- `move_file`
- `delete_file`

---

## 5. Revisão, Aprovação e Refinamento

### 5.1 Revisão de Change-Set (`RevisaoChangeSet`)

Registra a decisão humana sobre um change-set.

**Campos mínimos**

- `id` (PK)
- `change_set_id` (FK → `ChangeSet.id`)
- `acao_revisao_id` (FK → `AcaoRevisao.id`)
- `comentario` (nullable)
- `executado_em`

**Regras**

- Toda aprovação ou rejeição relevante deve gerar uma revisão registrada.
- Aprovação individual implica aplicação do change-set.
- Rejeição individual implica descarte do change-set.

---

### 5.2 Ação de Revisão (`AcaoRevisao`)

**Campos mínimos**

- `id` (PK)
- `nome`

**Carga inicial sugerida**

- `Approve`
- `Reject`
- `ApproveAll`
- `RejectAll`

---

### 5.3 Refinamento (`Refinamento`)

Representa instruções adicionais fornecidas ao sistema para refinar change-sets.

**Campos mínimos**

- `id` (PK)
- `conversa_ativa_id` (FK → `ConversaAtiva.id`)
- `change_set_id` (FK → `ChangeSet.id`, nullable)
- `escopo_refinamento_id` (FK → `EscopoRefinamento.id`)
- `prompt_refinamento`
- `anexos_json` (nullable)
- `criado_em`

**Regras**

- Quando `change_set_id` for preenchido, o refinamento é local ao current ou a um item específico.
- Quando `change_set_id` for nulo, o refinamento é global à conversa ativa.
- Refinamentos devem poder influenciar a próxima geração da proposta.

---

### 5.4 Escopo do Refinamento (`EscopoRefinamento`)

**Campos mínimos**

- `id` (PK)
- `nome`

**Carga inicial sugerida**

- `Current`
- `PendingConversation`

---

## 6. Backlog e Estado Atual Indexado

### 6.1 Item de Backlog Indexado (`ItemBacklogIndexado`)

Representa os itens do estado atual do projeto persistidos ou reconstruídos a partir do documento de situação atual.

**Campos mínimos**

- `id` (PK)
- `projeto_id` (FK → `Projeto.id`)
- `codigo_item`
- `tipo_item`
- `nome_item`
- `origem_item`
- `situacao_atual`
- `detalhes_json` (nullable)
- `fonte_reconstrucao`
- `criado_em`
- `atualizado_em`

**Regras**

- Este backlog é espelho operacional do documento de situação atual.
- Não é a fonte de verdade definitiva; a fonte durável é documental.
- Deve ser possível reconstruí-lo a partir de `situacao-atual.md` quando `.mede/` for perdido.

---

### 6.2 Snapshot do Estado Atual (`SnapshotEstadoAtual`)

Guarda metadados sobre a última leitura e indexação do documento de situação atual.

**Campos mínimos**

- `id` (PK)
- `projeto_id` (FK → `Projeto.id`)
- `arquivo_estado_atual_path`
- `hash_arquivo`
- `itens_total`
- `lido_em`

**Regras**

- Deve permitir detectar se o documento de situação atual mudou desde a última indexação.
- Deve suportar reindexação idempotente.

---

## 7. Integração com LLM

### 7.1 Perfil de LLM (`PerfilLLM`)

Representa um perfil configurado de uso de LLM.

**Campos mínimos**

- `id` (PK)
- `projeto_id` (FK → `Projeto.id`)
- `nome_perfil`
- `provider`
- `model`
- `endpoint` (nullable)
- `api_key_env` (nullable)
- `temperature` (nullable)
- `max_tokens` (nullable)
- `timeout_ms` (nullable)
- `retry_json` (nullable)
- `ativo`

**Regras**

- Credenciais sensíveis não devem ser persistidas em texto puro.
- A referência à variável de ambiente pode ser armazenada.
- Perfis podem ser específicos por fase metodológica.

---

### 7.2 Perfil de LLM por Fase (`PerfilLLMFase`)

Relaciona perfis de LLM a fases metodológicas.

**Campos mínimos**

- `id` (PK)
- `projeto_id` (FK → `Projeto.id`)
- `fase_ciclo_id` (FK → `FaseCiclo.id`)
- `perfil_llm_id` (FK → `PerfilLLM.id`)

**Regras**

- Uma fase pode ter perfil dedicado.
- Se não houver perfil específico, deve existir fallback global do projeto.

---

### 7.3 Prompt de Sistema por Fase (`PromptSistemaFase`)

Representa os system prompts especializados por fase do pipeline.

**Campos mínimos**

- `id` (PK)
- `projeto_id` (FK → `Projeto.id`)
- `fase_ciclo_id` (FK → `FaseCiclo.id`)
- `prompt_texto`
- `modo_prompt_id` (FK → `ModoPrompt.id`)
- `ativo`
- `criado_em`
- `atualizado_em`

**Regras**

- Os prompts do projeto podem sobrescrever ou estender os padrões.
- O comportamento final deve combinar núcleo metodológico e customização local.

---

### 7.4 Modo de Prompt (`ModoPrompt`)

**Campos mínimos**

- `id` (PK)
- `nome`

**Carga inicial sugerida**

- `Replace`
- `Extend`

---

### 7.5 Execução de LLM (`ExecucaoLLM`)

Registra uma chamada operacional ao motor de linguagem.

**Campos mínimos**

- `id` (PK)
- `projeto_id` (FK → `Projeto.id`)
- `conversa_ativa_id` (FK → `ConversaAtiva.id`, nullable)
- `change_set_id` (FK → `ChangeSet.id`, nullable)
- `fase_ciclo_id` (FK → `FaseCiclo.id`, nullable)
- `perfil_llm_id` (FK → `PerfilLLM.id`)
- `tipo_execucao`
- `prompt_hash`
- `input_resumo` (nullable)
- `output_resumo` (nullable)
- `status_execucao_id` (FK → `StatusExecucaoLLM.id`)
- `iniciado_em`
- `finalizado_em` (nullable)
- `duracao_ms` (nullable)
- `tokens_entrada` (nullable)
- `tokens_saida` (nullable)
- `mensagem_erro` (nullable)

**Regras**

- Não é obrigatório persistir prompt e resposta integrais.
- Deve existir possibilidade de operar em modo mais restritivo para ambientes corporativos.
- Logs operacionais não devem comprometer segurança do projeto.

---

### 7.6 Status de Execução de LLM (`StatusExecucaoLLM`)

**Campos mínimos**

- `id` (PK)
- `nome`

**Carga inicial sugerida**

- `Iniciada`
- `Concluida`
- `Falhou`
- `Cancelada`

---

## 8. Auditoria Local e Metadados Operacionais

### 8.1 Evento Operacional Local (`EventoOperacionalLocal`)

Registro de eventos relevantes do funcionamento local do MEDE-CLI.

**Campos mínimos**

- `id` (PK)
- `projeto_id` (FK → `Projeto.id`)
- `conversa_ativa_id` (FK → `ConversaAtiva.id`, nullable)
- `change_set_id` (FK → `ChangeSet.id`, nullable)
- `tipo_evento`
- `descricao`
- `detalhes_json` (nullable)
- `executado_em`

**Exemplos de `tipo_evento`**

- `conversation_started`
- `phase_advanced`
- `changes_generated`
- `change_approved`
- `change_rejected`
- `change_applied`
- `state_rebuilt`
- `llm_call_failed`

---

### 8.2 Ponteiro Current (`PonteiroCurrent`)

Tabela auxiliar para registrar explicitamente o current da conversa ativa, se a implementação preferir separação.

**Campos mínimos**

- `id` (PK)
- `conversa_ativa_id` (FK → `ConversaAtiva.id`)
- `change_set_id` (FK → `ChangeSet.id`)
- `definido_em`

**Regras**

- Deve haver no máximo um current por conversa ativa.
- Pode ser derivado de `ChangeSet.is_current`, mas tabela dedicada pode simplificar queries.

---

## 9. Documentos Persistentes Relevantes para Reconstrução

Embora o banco local contenha o estado operacional, a reconstrução deve considerar os artefatos persistentes do projeto.

Os principais artefatos de interesse são:

- `entendimento-inicial.md`
- `readme.md`
- `situacao-atual.md`
- `visao-e-escopo.md`
- `requisitos-funcionais.md`
- `requisitos-nao-funcionais.md`
- `modelo-de-dados.md`
- `min-*`
- `adr-*`
- `esm-*`
- `leg-*`

> Observação importante:
> Esses artefatos não precisam ser espelhados integralmente no banco, mas sua leitura deve ser suportada por mecanismos de indexação ou reconstrução.

---

## 10. Relacionamentos (Resumo)

- `Projeto (1) -> (1) ConfiguracaoProjeto`
- `Projeto (1) -> (N) MapeamentoArtefato`
- `Projeto (1) -> (N) ConversaAtiva`
- `ConversaAtiva (1) -> (N) ChangeSet`
- `ChangeSet (1) -> (N) OperacaoChangeSet`
- `ChangeSet (1) -> (N) RevisaoChangeSet`
- `ConversaAtiva (1) -> (N) Refinamento`
- `Projeto (1) -> (N) ItemBacklogIndexado`
- `Projeto (1) -> (N) PerfilLLM`
- `FaseCiclo (1) -> (N) PerfilLLMFase`
- `FaseCiclo (1) -> (N) PromptSistemaFase`
- `Projeto (1) -> (N) ExecucaoLLM`
- `Projeto (1) -> (N) EventoOperacionalLocal`

---

## 11. Restrições e Índices Recomendados

### Restrições

- Deve existir no máximo uma `ConversaAtiva` com status ativo por projeto.
- Deve existir no máximo um `ChangeSet` corrente pendente por conversa ativa.
- `MapeamentoArtefato.tipo_artefato` não deve duplicar no mesmo projeto quando ativo.
- `ItemBacklogIndexado.codigo_item` deve ser único por projeto.
- `PerfilLLM.nome_perfil` deve ser único por projeto.

### Índices recomendados

- `ChangeSet (conversa_ativa_id, status_change_set_id, is_current)`
- `OperacaoChangeSet (change_set_id, ordem_execucao)`
- `ItemBacklogIndexado (projeto_id, situacao_atual)`
- `ExecucaoLLM (projeto_id, iniciado_em)`
- `EventoOperacionalLocal (projeto_id, executado_em)`
- `PromptSistemaFase (projeto_id, fase_ciclo_id, ativo)`

---

## 12. Observações de Implementação

### 12.1 Natureza do banco SQLite

O SQLite local não é o banco de negócio do projeto do usuário.  
Ele é o **banco operacional do MEDE-CLI**, usado para:

- fila de change-sets;
- conversa ativa;
- backlog indexado;
- metadados de execução;
- reconstrução auxiliar.

### 12.2 Efemeridade de `.mede/`

O conteúdo de `.mede/` pode ser removido sem destruir a verdade documental do projeto.  
Por isso, o modelo precisa priorizar:

- reconstruibilidade;
- baixo acoplamento com estado transitório;
- reindexação a partir dos arquivos persistentes.

### 12.3 Diferença entre verdade documental e índice operacional

O banco local é índice operacional.  
A documentação do projeto é a verdade durável.

---

## 13. Itens de Ajuste Dependentes da Arquitetura Final

Ainda dependem de consolidação:

- granularidade final do change-set;
- nível exato de persistência de logs de LLM;
- política de retenção de refinamentos;
- formato exato do backlog indexado reconstruído;
- decisão entre `is_current` em `ChangeSet` versus tabela dedicada;
- política de armazenamento de anexos e referências externas.

---

## 14. Consideração Final

Este modelo define a base lógica necessária para que o MEDE-CLI opere como motor de evolução documental supervisionada, mantendo:

- ciclo metodológico controlado;
- fila de change-sets revisáveis;
- integração configurável com LLMs;
- estado local efêmero;
- capacidade de reconstrução a partir da documentação persistente.

Ele deve ser revisado após a definição formal da arquitetura interna, dos requisitos funcionais e do formato definitivo de `mede.config.json`.
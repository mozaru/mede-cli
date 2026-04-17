## 1. Princípio de arquitetura

Eu recomendo uma arquitetura em 5 camadas:

1. **Domain**
   Regras do negócio do MEDE-CLI, estados, entidades, invariantes e políticas do ciclo.

2. **Application**
   Orquestra os casos de uso: iniciar ciclo, refinar fase, aprovar, rejeitar, aplicar diff, rollback, commit.

3. **Infrastructure**
   Persistência, filesystem, SQLite, LLM providers, parser/diff engine, snapshot físico.

4. **Interface/CLI**
   Parsing de comandos, argumentos, rendering de saída, mapping comando → use case.

5. **Shared**
   Tipos utilitários, erros, helpers, constantes, convenções comuns.

O ponto central é: **CLI não decide regra**, **repositório não orquestra fluxo**, **LLM não conhece ciclo**, **serviço de aplicação não contém regra estrutural que deveria estar no domínio**.

---

## 2. Camadas e responsabilidades

## 2.1 Domain

Responsabilidade: representar o MEDE como máquina de estados metodológica.

Aqui entram:

* entidades centrais;
* enums de fase/status;
* regras de transição;
* políticas de aprovação/rejeição;
* política de snapshot/rollback;
* definição de dependência documental por fase;
* semântica de artefato vazio e diff vazio;
* regras de encerramento do ciclo.

### Entidades principais que eu criaria

#### `Project`

Representa o projeto configurado.

Responsabilidades:

* raiz lógica do projeto;
* localização de documentos;
* ontologia documental;
* política de nomes e diretórios.

#### `Cycle`

É a entidade mais importante.

Responsabilidades:

* estado global do ciclo;
* fase atual;
* modo manual / approve-all / reject-all;
* estado de abertura/fechamento;
* referência para snapshot inicial;
* decisão final: commit ou rollback.

Campos típicos:

* `id`
* `projectId`
* `status` (`OPEN`, `AWAITING_COMMIT`, `COMMITTED`, `ROLLEDBACK`)
* `currentPhase`
* `autoMode` (`NONE`, `APPROVE_ALL`, `REJECT_ALL`)
* `startedAt`, `finishedAt`

#### `CyclePhaseExecution`

Representa a execução concreta de uma fase no ciclo.

Responsabilidades:

* controlar a fase corrente e seu histórico;
* registrar se houve proposta vazia;
* registrar artefato alvo;
* registrar estado da fase.

Campos:

* `id`
* `cycleId`
* `phaseCode`
* `artifactPath`
* `artifactKind`
* `state` (`REFINING`, `AWAITING_APPROVAL`, `APPROVED`, `REJECTED`, `SKIPPED`)
* `proposalState` (`EMPTY`, `NON_EMPTY`, `NOT_GENERATED`)
* `startedAt`, `finishedAt`

#### `Artifact`

Representa um documento do projeto, vivo ou histórico.

Responsabilidades:

* identidade lógica do documento;
* tipo;
* caminho físico;
* natureza (`LIVING`, `HISTORICAL`, `TEMPORARY`);
* existência no snapshot.

#### `PhaseConversation`

Conversa de refinamento de uma fase.

Responsabilidades:

* histórico de interações da fase;
* anexos;
* contexto do refinamento;
* reset da conversa.

#### `PhaseRefinement`

Uma iteração específica de refinamento.

Responsabilidades:

* prompt do usuário;
* arquivos anexados;
* resposta da LLM;
* referência à proposta gerada.

#### `ChangeSet`

Continua existindo, mas perde protagonismo.

Responsabilidades:

* representar mudanças propostas para documentos vivos;
* agrupar trecho-diffs pendentes;
* saber se está vazio ou resolvido.

#### `ChangeChunk`

Trecho-diff individual.

Responsabilidades:

* arquivo alvo;
* operação;
* trecho;
* status (`PENDING`, `APPLIED`, `DISCARDED`).

#### `Snapshot`

Representa o backup cego dos documentos vivos no início do ciclo.

Responsabilidades:

* lista de arquivos vivos originais;
* hash opcional;
* mapa origem → backup;
* base para rollback integral.

#### `OperationalEvent`

Log operacional auditável.

Responsabilidades:

* trilha de eventos do ciclo;
* refinamento, approve, reject, apply, discard, commit, rollback.

---

### Objetos de regra que eu criaria

#### `PhaseDependencyPolicy`

Define quais documentos entram no contexto de cada fase. Isso está explícito no anexo e não deve ficar espalhado em handlers. 

#### `CycleTransitionPolicy`

Define:

* o que acontece no `approve`;
* o que acontece no `reject`;
* regra especial da ATA;
* passagem para próxima fase;
* entrada em estado `AWAITING_COMMIT` no final.

#### `SnapshotPolicy`

Define:

* quais documentos entram no snapshot;
* quais nunca entram;
* como rollback remove históricos criados no ciclo.  

#### `ArtifactNamingPolicy`

Define nomes como:

* `ata-YYYY-MM-DD.md`
* `adr-YYYY-MM-DD.md`
* `esm-YYYY-MM-DD.md`
* `leg-YYYY-MM-DD.md`

---

## 2.2 Application

Responsabilidade: executar casos de uso usando entidades/regras do domínio e portas de infraestrutura.

Aqui não deve existir regra difusa. Deve existir orquestração.

### Casos de uso principais

* `InitProjectUseCase`
* `StartCycleUseCase`
* `GetStatusUseCase`
* `RefineCurrentPhaseUseCase`
* `ResetCurrentPhaseUseCase`
* `ApproveCurrentPhaseUseCase`
* `RejectCurrentPhaseUseCase`
* `ListPendingChunksUseCase`
* `ApplyPendingChunkUseCase`
* `DiscardPendingChunkUseCase`
* `ListCycleFilesUseCase`
* `ShowFileDiffUseCase`
* `ShowFileContentUseCase`
* `CommitCycleUseCase`
* `RollbackCycleUseCase`
* `ListLlmProvidersUseCase`
* `TestLlmUseCase`
* `ShowConfigUseCase`
* `InitConfigUseCase`
* `ApplyConfigUseCase`

### Serviços de aplicação relevantes

#### `CycleOrchestrator`

Esse é o coração da aplicação.

Responsabilidades:

* iniciar ciclo;
* preparar primeira fase;
* avançar fase;
* preparar contexto documental de cada fase;
* decidir se gera arquivo, diff ou fase vazia;
* colocar ciclo em `AWAITING_COMMIT`.

#### `PhaseExecutionService`

Responsabilidades:

* montar contexto da fase;
* chamar prompt builder;
* chamar LLM gateway;
* interpretar retorno;
* atualizar artefato corrente;
* gerar change-set, quando aplicável.

#### `CommitRollbackService`

Responsabilidades:

* commit final;
* rollback integral;
* limpeza da `.mede/`.

#### `StatusProjectionService`

Responsabilidades:

* compor a visão operacional do `mede-cli status`.

---

## 2.3 Infrastructure

Responsabilidade: implementar portas técnicas.

Aqui entram os adaptadores concretos.

### Persistência

* SQLite repositories
* filesystem repositories
* snapshot repository
* config repository
* conversation store
* diff store

### LLM

* adapters OpenAI / Ollama / Anthropic / Gemini / Azure OpenAI
* provider factory
* normalização de resposta

### Arquivos

* leitura/escrita de markdown
* enumeração de diretórios
* criação de backups
* restauração de snapshot
* remoção de arquivos criados no ciclo

### Diff / parsing

* parser de change-set
* diff generator
* diff applier
* markdown artifact parser, quando necessário

---

## 2.4 Interface / CLI

Responsabilidade: entrada e saída do usuário.

A CLI deve ser fina.

Ela faz:

* parse do comando;
* validação sintática simples;
* chamada do use case;
* rendering textual.

Ela não deve:

* conhecer regra de transição;
* decidir documentos dependentes;
* montar contexto metodológico;
* aplicar regra especial da ATA.

---

## 2.5 Shared

Responsabilidade: coisas transversais e neutras.

Exemplos:

* `Result<T>`
* `DomainError`
* `ApplicationError`
* `Clock`
* `IdGenerator`
* helpers de path
* helpers de string
* tipos comuns

---

## 3. Estrutura de diretórios que eu recomendo

Hoje a árvore está funcional, mas está muito orientada a implementação incremental e pouco orientada ao domínio. Ela mistura comando, serviço, repositório e entidade sem explicitar fronteiras. 

Eu reorganizaria assim:

```text
src/
  cli/
    commands/
    presenters/
    parsers/
    index.ts

  application/
    use-cases/
      cycle/
      config/
      files/
      llm/
      status/
    services/
    dto/
    ports/

  domain/
    entities/
    value-objects/
    enums/
    policies/
    services/
    events/
    repositories/

  infrastructure/
    persistence/
      sqlite/
        repositories/
        database/
        mappers/
    filesystem/
      repositories/
      snapshot/
      diff/
    llm/
      providers/
      factory/
    config/
    parsers/

  shared/
    errors/
    types/
    utils/
    constants/
```

---

## 4. Diretórios por camada e responsabilidade

## `src/cli/`

Responsável só por comando e apresentação.

Sugestão:

```text
src/cli/
  commands/
    init-command.ts
    cycle-command.ts
    refine-command.ts
    approve-command.ts
    reject-command.ts
    pending-command.ts
    apply-command.ts
    discard-command.ts
    status-command.ts
    commit-command.ts
    rollback-command.ts
    files-command.ts
    diff-command.ts
    cat-command.ts
    llm-command.ts
    config-command.ts

  presenters/
    status-presenter.ts
    pending-presenter.ts
    files-presenter.ts
    diff-presenter.ts

  parsers/
    argv-parser.ts
```

Aqui eu renomearia quase todos os `*-handler.ts` para `*-command.ts` ou `*-controller.ts`. “Handler” está genérico demais.

---

## `src/application/`

Responsável por casos de uso.

```text
src/application/
  use-cases/
    cycle/
      start-cycle.use-case.ts
      refine-phase.use-case.ts
      reset-phase.use-case.ts
      approve-phase.use-case.ts
      reject-phase.use-case.ts
      commit-cycle.use-case.ts
      rollback-cycle.use-case.ts
      get-cycle-status.use-case.ts
    changes/
      list-pending-chunks.use-case.ts
      apply-pending-chunk.use-case.ts
      discard-pending-chunk.use-case.ts
    files/
      list-cycle-files.use-case.ts
      show-file-diff.use-case.ts
      show-file-content.use-case.ts
    config/
      show-config.use-case.ts
      init-config.use-case.ts
      apply-config.use-case.ts
    llm/
      list-providers.use-case.ts
      test-llm.use-case.ts
    init/
      init-project.use-case.ts

  services/
    cycle-orchestrator.ts
    phase-execution-service.ts
    commit-rollback-service.ts
    context-assembly-service.ts
    prompt-assembly-service.ts
    status-projection-service.ts

  dto/
  ports/
```

### `ports/`

Interfaces que a aplicação consome:

* `CycleRepository`
* `PhaseExecutionRepository`
* `SnapshotRepository`
* `ArtifactRepository`
* `LlmGateway`
* `FileSystemGateway`
* `DiffGateway`
* `ConfigGateway`

---

## `src/domain/`

Responsável pelo modelo do negócio.

```text
src/domain/
  entities/
    project.ts
    cycle.ts
    cycle-phase-execution.ts
    artifact.ts
    phase-conversation.ts
    phase-refinement.ts
    change-set.ts
    change-chunk.ts
    snapshot.ts
    operational-event.ts

  value-objects/
    artifact-path.ts
    phase-context.ts
    document-dependency.ts
    snapshot-entry.ts

  enums/
    cycle-status.ts
    phase-code.ts
    phase-state.ts
    proposal-state.ts
    auto-mode.ts
    artifact-kind.ts
    artifact-nature.ts
    chunk-status.ts
    review-action.ts

  policies/
    cycle-transition-policy.ts
    phase-dependency-policy.ts
    snapshot-policy.ts
    artifact-naming-policy.ts
    rollback-policy.ts

  services/
    cycle-domain-service.ts
    change-set-domain-service.ts

  repositories/
    cycle.repository.ts
    project.repository.ts
    phase-execution.repository.ts
    change-set.repository.ts
    snapshot.repository.ts
```

---

## `src/infrastructure/`

Responsável pelos adapters concretos.

```text
src/infrastructure/
  persistence/
    sqlite/
      database/
        database.ts
      repositories/
        sqlite-cycle-repository.ts
        sqlite-project-repository.ts
        sqlite-phase-execution-repository.ts
        sqlite-change-set-repository.ts
        sqlite-snapshot-repository.ts
        sqlite-operational-event-repository.ts
      mappers/

  filesystem/
    repositories/
      file-system-repository.ts
    snapshot/
      blind-snapshot-service.ts
      snapshot-restore-service.ts
    diff/
      unified-diff-generator.ts
      diff-apply-service.ts

  llm/
    providers/
      openai-llm-provider.ts
      ollama-llm-provider.ts
      anthropic-llm-provider.ts
      gemini-llm-provider.ts
      azure-openai-llm-provider.ts
    factory/
      llm-provider-factory.ts

  config/
    json-config-repository.ts

  parsers/
    markdown-parser.ts
    llm-response-parser.ts
```

---

## `src/shared/`

Responsável por utilidades neutras.

```text
src/shared/
  errors/
  types/
  utils/
  constants/
```

---

## 5. Entidades e repositórios mínimos

Você perguntou que o principal é definir entidades e repositórios. Então aqui vai a versão objetiva.

## Entidades mínimas

Se eu fosse refatorar agora, eu trataria estas como obrigatórias:

* `Project`
* `Cycle`
* `CyclePhaseExecution`
* `Artifact`
* `PhaseConversation`
* `PhaseRefinement`
* `ChangeSet`
* `ChangeChunk`
* `Snapshot`
* `OperationalEvent`

Sem isso, o código tende a continuar espalhando estado operacional em tabelas e handlers.

## Repositórios mínimos

* `ProjectRepository`
* `CycleRepository`
* `PhaseExecutionRepository`
* `ConversationRepository`
* `RefinementRepository`
* `ChangeSetRepository`
* `SnapshotRepository`
* `OperationalEventRepository`
* `ConfigRepository`
* `FileSystemRepository`
* `LlmGateway`

---

## 6. O que eu mudaria na estrutura atual

Pelo `tree.txt`, já existe material aproveitável, mas a modelagem está parcialmente desalinhada com o novo conceito. 

### O que reaproveitar

* `database.ts`
* providers LLM
* `config-service.ts`
* `context-file-service.ts`
* parte dos repositórios atuais
* enums que façam sentido
* `operational-state-service.ts` como base conceitual, se simplificado

### O que eu reduziria ou fundiria

* handlers redundantes de “current-*”
* separação confusa entre `approve-handler`, `current-approve-handler`, `review-handler`, `changes-handler`
* entidades excessivamente técnicas que não expressem o domínio novo

### O que eu provavelmente removeria ou renomearia

* `current-pointer.ts`
* `current-state-snapshot.ts` se estiver modelando detalhe técnico e não snapshot do ciclo
* `artifact-mapping.ts` se estiver só compensando ausência de ontologia clara
* `timeline-handler.ts`, `backlog-handler.ts` se não estiverem aderentes ao novo recorte

---

## 7. Fluxo arquitetural correto do ciclo

O fluxo principal deveria ficar assim:

1. `cycle` chama `StartCycleUseCase`
2. o use case cria `Cycle`
3. executa `SnapshotPolicy` e gera `Snapshot`
4. prepara fase `ATA`
5. `refine` opera sobre `PhaseConversation` + `PhaseRefinement`
6. resposta da LLM gera:

   * artefato histórico completo, ou
   * change-set para documento vivo
7. `approve` ou `reject` muda estado da `CyclePhaseExecution`
8. `CycleOrchestrator` prepara a próxima fase
9. ao fim da última fase, ciclo entra em `AWAITING_COMMIT`
10. `commit` finaliza e limpa estado efêmero
11. `rollback` restaura snapshot, remove criados no ciclo, limpa estado efêmero

Isso está coerente com o anexo: aprovação em cada etapa, rejeição especial da ATA, possibilidade de fases vazias, snapshot cego dos vivos e fechamento obrigatório por commit/rollback. 

---

## 8. Regra importante: o eixo não é “arquivo”, é “fase”

Esse ponto é crucial.

O sistema atual provavelmente está meio puxado para “mudança em arquivo”. Mas o método está puxado para:

* fase metodológica,
* contexto documental por fase,
* artefato resultante da fase,
* refinamento da fase,
* decisão da fase.

Então a unidade central da aplicação precisa ser **PhaseExecution**, não apenas `ChangeSet`.

`ChangeSet` é consequência das fases de atualização, não o eixo estrutural do sistema.

---

## 9. Minha recomendação prática de implementação

Eu faria em 4 passos:

### Etapa 1 — congelar o domínio

Definir:

* enums,
* entidades,
* políticas,
* transições,
* contrato dos repositórios.

### Etapa 2 — refatorar aplicação

Criar use cases limpos e `CycleOrchestrator`.

### Etapa 3 — adaptar persistência

Mapear tabelas atuais para os novos agregados.
Aqui talvez nem precise trocar tudo de uma vez.

### Etapa 4 — reescrever CLI fina

Trocar handlers atuais por commands magros.

---

## 10. Estrutura final resumida

Se eu tivesse que te deixar uma versão de referência curta, seria esta:

```text
src/
  cli/              -> comandos e apresentação
  application/      -> casos de uso e orquestração
  domain/           -> entidades, políticas, regras e contratos
  infrastructure/   -> sqlite, filesystem, llm, diff, config
  shared/           -> utilidades e erros transversais
```

E o centro do domínio seria:

```text
Cycle
  -> possui várias CyclePhaseExecution
  -> usa Snapshot
  -> gera OperationalEvent
  -> termina em Commit ou Rollback
```

e não:

```text
Command -> Handler -> arquivo
```


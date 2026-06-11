# Tarefas — Evolução Estrutural MEDE-CLI

## Contexto e Motivação

Este documento descreve as tarefas de evolução estrutural do MEDE-CLI derivadas de uma sessão de design que diagnosticou os seguintes problemas fundamentais:

1. **LLM resumindo dados estruturados** — tabelas de backlog eram enviadas ao LLM junto com o template, o LLM as via como dados para sintetizar, e gerava tabelas comprimidas ou com faixas de IDs.
2. **Dados dinâmicos misturados com conteúdo narrativo** — o LLM recebia documentos com tabelas grandes (centenas de linhas), gastando tokens e aumentando risco de alucinação.
3. **Nenhuma verificação de consistência causal** — não havia forma de provar que `situacao-atual.md` é o resultado cumulativo de todos os ciclos aplicados sobre `entendimento-inicial.md`.

### Princípio arquitetural adotado

**Separação entre conteúdo narrativo (responsabilidade do LLM) e conteúdo estruturado (responsabilidade da aplicação).**

Os documentos passam a ter marcadores HTML `<!-- BEGIN-NOME -->` / `<!-- END-NOME -->` delimitando seções determinísticas. Antes de enviar ao LLM, a aplicação comprime essas seções para um placeholder de uma linha. O LLM opera sobre o documento comprimido, nunca toca os placeholders. Após receber o diff do LLM, a aplicação: (a) recalcula as coordenadas do diff para o documento original e (b) gera diffs determinísticos para cada seção estruturada usando dados do SQLite. Ambos os tipos de chunk entram no mesmo ChangeSet e são revisáveis pelo usuário.

---

## Ordem de Execução

```
T01 → T02 → T03 → T04 → T05 → T06 → T07 → T08 → T09 → T10
```

Cada tarefa deve: ter testes escritos antes ou junto com a implementação, passar em todos os testes existentes, e ter seu próprio commit git ao final.

---

## T01 — Novos campos de configuração do projeto

**Objetivo:** Adicionar metadados do projeto ao `mede.config.json` para que placeholders como `##NOME_PROJETO##`, `##CLIENTE##` e `##FORNECEDOR##` tenham fonte de dados confiável sem depender do LLM inferir esses valores.

**Arquivos a modificar:**
- `src/shared/mede-config-schema.ts` — adicionar campos opcionais ao schema zod
- `src/domain/entities/mede-config-model-entity.ts` — adicionar campos ao tipo
- `locales/pt-BR/prompts/` — nenhum, ainda (usados nas tarefas seguintes)

**Implementação:**

Em `mede-config-schema.ts`, dentro do schema zod existente, adicionar:
```typescript
projectName: z.string().optional(),   // nome do sistema/projeto
clientName: z.string().optional(),    // nome do cliente
supplierName: z.string().optional(),  // nome do fornecedor
```

Em `mede-config-model-entity.ts`:
```typescript
projectName?: string;
clientName?: string;
supplierName?: string;
```

Em `src/cli/commands/config-handler.ts` (comando `mede-cli config init`), adicionar os campos no JSON de exemplo gerado com comentários explicativos.

**Testes:**
- Parsear config sem os campos novos → deve funcionar (opcionais)
- Parsear config com os campos → campos presentes no model
- Arquivo: `src/shared/mede-config-schema.test.ts` (criar se não existir) ou adicionar casos ao existente

**Commit:** `feat: add projectName, clientName, supplierName to mede.config.json schema`

---

## T02 — Novos placeholders escalares

**Objetivo:** Adicionar placeholders de valor único (não tabela) ao `PromptPlaceholderBuilder`, alimentados por dados do SQLite + config + ciclo.

**Novos placeholders:**

| Placeholder | Fonte | Descrição |
|---|---|---|
| `##NOME_PROJETO##` | `config.projectName` | Nome do projeto/sistema |
| `##CLIENTE##` | `config.clientName` | Nome do cliente |
| `##FORNECEDOR##` | `config.supplierName` | Nome do fornecedor |
| `##CICLO_CORRENTE##` | `CycleEntity.id` + contagem de atas | Número do ciclo atual com 3 dígitos (ex: `003`) |
| `##DATA_REFERENCIA##` | `CycleEntity.startedAt` | Data de referência do ciclo (AAAA-MM-DD) |
| `##TOTAL_ENTREGUES##` | SQLite COUNT | Total de itens com status Concluído |
| `##TOTAL_PENDENTES##` | SQLite COUNT | Total de itens Pendente + Aguardando |
| `##TOTAL_ENTREGUES_CICLO##` | SQLite COUNT filtrado | Itens entregues neste ciclo específico |
| `##NOVOS_CICLO##` | SQLite COUNT filtrado | Itens novos surgidos neste ciclo |
| `##PERCENTUAL_ENTREGA##` | Calculado | `(TOTAL_ENTREGUES / total_nao_cancelados) * 100`, formato `21,0%` |

**Arquivos a modificar:**
- `src/shared/prompt-place-holder-builder.ts` — métodos e mapa de placeholders
- `src/domain/entities/mede-config-model-entity.ts` — já alterado em T01
- Interface `IPromptPlaceholderBuilder` se existir

**Implementação:**

O `PromptPlaceholderBuilder` atualmente recebe apenas `backlogRepository` no construtor. Precisa receber também `config` e `cycleNumber` de alguma forma. Opções:

- **Opção A (recomendada):** `buildAll()` passa a aceitar um segundo parâmetro `context: PlaceholderContext` com `{config, cycleNumber, referenceDate}`. Não altera o construtor.
- **Opção B:** Injetar no construtor — mais acoplado.

```typescript
interface PlaceholderContext {
  config?: MedeConfigModelEntity;
  cycleNumber?: number;   // ex: 3 para ciclo "003"
  referenceDate?: string; // AAAA-MM-DD
}
```

`buildAll()` usa esse contexto para montar os placeholders escalares.

**Testes:**
- `buildAll()` sem contexto → placeholders escalares retornam string vazia ou `—`
- `buildAll()` com contexto completo → cada placeholder tem o valor correto
- `PERCENTUAL_ENTREGA` com zero itens → `0,0%` (sem divisão por zero)
- Arquivo: adicionar casos em `src/shared/prompt-place-holder-builder.test.ts`

**Commit:** `feat: add scalar placeholders (project metadata, cycle stats) to PromptPlaceholderBuilder`

---

## T03 — Novos placeholders de tabelas

**Objetivo:** Adicionar tabelas filtradas por estado do backlog.

**Novos placeholders:**

| Placeholder | Filtro SQLite | Colunas |
|---|---|---|
| `##TABELA_ENTREGUES##` | `status = Concluído` | ID, Tipo, Nome, Origem, Ciclo de Entrega, Observação |
| `##TABELA_PENDENTES##` | `status IN (Pendente, Aguardando, Em andamento)` | ID, Tipo, Nome, Origem, Status, Prioridade |
| `##TABELA_NOVOS_CICLO##` | `isNewInPeriod = true` | ID, Tipo, Nome, Origem, Status |

**Arquivos a modificar:**
- `src/shared/prompt-place-holder-builder.ts` — três novos métodos privados + entradas no mapa

**Implementação:**

Os métodos seguem o mesmo padrão de `buildRecentBacklogTable()`: filtrar `currentItems`, ordenar, e chamar `toMarkdownTable()`.

Para `##TABELA_NOVOS_CICLO##`, usar o mesmo `baselineDate` e `previousMap` que já existem em `buildRecentBacklogTable()` — extrair essa lógica para um método compartilhado `compareAllWithPrevious()` para evitar recalcular duas vezes.

Adicionar ao tipo `PlaceholderKey` e ao mapa `PLACEHOLDERS` em `buildAll()`.

**Testes:**
- Cada tabela retorna apenas os itens do filtro correto
- Tabela vazia retorna a linha de cabeçalho + uma linha com `—`
- Arquivo: `src/shared/prompt-place-holder-builder.test.ts`

**Commit:** `feat: add filtered backlog table placeholders (entregues, pendentes, novos_ciclo)`

---

## T04 — PlaceholderBlockExtractor e DocumentCompressor

**Objetivo:** Implementar os dois primeiros componentes do mecanismo BEGIN-END.

**`PlaceholderBlockExtractor`** — lê um documento Markdown e encontra todos os blocos delimitados por marcadores HTML:

```typescript
interface PlaceholderBlock {
  name: string;         // ex: "TABELA_ENTREGUES"
  startLine: number;    // índice 0 da linha "<!-- BEGIN-TABELA_ENTREGUES -->"
  endLine: number;      // índice 0 da linha "<!-- END-TABELA_ENTREGUES -->"
  innerContent: string; // conteúdo entre os marcadores (sem as linhas de marcador)
  innerLineCount: number; // número de linhas do innerContent
}

function extractPlaceholderBlocks(content: string): PlaceholderBlock[]
```

Regex para identificar marcadores:
```
/^<!-- BEGIN-([A-Z0-9_]+) -->$/
/^<!-- END-([A-Z0-9_]+) -->$/
```

Retorna blocos ordenados por `startLine`. Lança erro se houver BEGIN sem END correspondente ou blocos aninhados.

**`DocumentCompressor`** — substitui os `innerContent` de cada bloco por uma linha de placeholder:

```typescript
interface CompressionResult {
  compressedContent: string;
  blocks: PlaceholderBlock[];  // os blocos com posições no documento ORIGINAL
}

function compressDocument(content: string): CompressionResult
```

Para cada bloco (processado de baixo para cima para não invalidar posições anteriores):
- Remove as linhas `[startLine+1 .. endLine-1]` (o inner content)
- Insere uma linha `##NOME##` no lugar

O `compressedContent` resultante tem o documento com cada bloco reduzido a:
```
<!-- BEGIN-TABELA_ENTREGUES -->
##TABELA_ENTREGUES##
<!-- END-TABELA_ENTREGUES -->
```

**Arquivos a criar:**
- `src/shared/placeholder-block-extractor.ts`
- `src/shared/placeholder-block-extractor.test.ts`

**Casos de teste obrigatórios:**
- Documento sem blocos → retorna lista vazia / documento intacto
- Bloco no início do documento
- Bloco no meio do documento (com texto antes e depois)
- Bloco no final do documento
- Múltiplos blocos em posições distintas
- Bloco com conteúdo vazio (BEGIN imediatamente seguido de END)
- BEGIN sem END correspondente → deve lançar erro com mensagem clara
- Blocos com nomes diferentes coexistindo
- Conteúdo do bloco com linhas em branco, tabelas Markdown, etc.

**Commit:** `feat: implement PlaceholderBlockExtractor and DocumentCompressor`

---

## T05 — DiffCoordinateTransformer

**Objetivo:** Transformar as coordenadas de linha de um diff calculado sobre o documento comprimido (`placeholderDoc`) para o documento original (`originalDoc`).

**Contexto do problema:**

O LLM recebe `placeholderDoc` e gera um diff com hunks `@@ -L,C +L,C @@`. Esses números de linha são válidos para `placeholderDoc`. Mas vamos aplicar o diff sobre `originalDoc`, que tem mais linhas (os blocos expandidos). Precisamos recalcular `L` para cada hunk.

**O algoritmo de transformação:**

Para cada bloco comprimido `B`:
```
B.shrinkage = B.innerLineCount  // linhas removidas do original para criar a versão comprimida
```
(O inner content de N linhas vira 1 linha `##NOME##`, portanto shrinkage = N - 1. Mas como a linha do placeholder também existe na versão comprimida, o shrinkage em termos de offset é `B.innerLineCount`.)

Para um hunk com linha de início `L` (em `placeholderDoc`):
```
offset = Σ B.shrinkage  para todo bloco B onde B.startLine_compressed < L
```
```
L_original = L + offset
```

Onde `B.startLine_compressed` é a posição do BEGIN no documento comprimido (calculada a partir das posições originais subtraindo os shrinkages anteriores).

**Interface:**

```typescript
interface CompressionMap {
  blocks: Array<{
    name: string;
    startLineCompressed: number;   // linha do BEGIN no placeholderDoc
    endLineCompressed: number;     // linha do END no placeholderDoc
    shrinkage: number;             // innerLineCount (linhas que "sumiram")
  }>;
}

function transformDiffCoordinates(
  chunks: ChunkModel[],
  compressionMap: CompressionMap
): ChunkModel[]
```

Para cada `ChunkModel`, parsear `location` (`@@ -L,C +L,C @@`), calcular `offset`, reescrever `location` com `L + offset`.

**Premissa garantida por instrução ao LLM:** nenhum hunk vai cruzar uma linha de marcador (o LLM é instruído a nunca modificar blocos BEGIN-END). Portanto o offset de cada hunk é constante (não há hunk que comece antes e termine depois de um bloco).

**Arquivos a criar:**
- `src/shared/diff-coordinate-transformer.ts`
- `src/shared/diff-coordinate-transformer.test.ts`

**Casos de teste obrigatórios:**
- Documento sem blocos → diff passa intacto
- Hunk antes do único bloco → offset = 0
- Hunk após o único bloco → offset = shrinkage do bloco
- Hunk entre dois blocos → offset = shrinkage do primeiro bloco
- Hunk após dois blocos → offset = soma dos dois shrinkages
- Bloco com innerLineCount = 0 → shrinkage = 0, nenhum offset
- Múltiplos hunks num mesmo diff → cada um transformado independentemente
- Verificar que a linha `@@ -L_original,C +L_original,C @@` resultante é válida

**Commit:** `feat: implement DiffCoordinateTransformer for placeholder-aware diff rebasing`

---

## T06 — DeterministicChunkBuilder

**Objetivo:** Gerar `ChangeChunk[]` determinísticos que substituem cada bloco BEGIN-END pelo conteúdo fresco do SQLite, a serem adicionados ao mesmo ChangeSet do LLM.

**Fluxo:**

1. Recebe `docAfterLlm: string` — o documento original após aplicar o diff ajustado do LLM em memória (sem escrever em disco)
2. Extrai blocos BEGIN-END presentes em `docAfterLlm` (via `PlaceholderBlockExtractor`)
3. Para cada bloco, obtém o conteúdo fresco via `PromptPlaceholderBuilder.getContentForPlaceholder(name)`
4. Gera o diff entre o conteúdo atual do bloco e o conteúdo fresco usando `generateDiff()`
5. Cada diff de bloco vira um `ChangeChunk` com índice continuado após os chunks do LLM

**Interface:**

```typescript
interface DeterministicChunkBuilderOptions {
  projectId: number;
  config: MedeConfigModelEntity;
  cycleNumber: number;
  referenceDate: string;
  previousCurrentStateFilePath: string;
  startChunkIndex: number;  // índice do próximo chunk (após os do LLM)
}

function buildDeterministicChunks(
  docAfterLlm: string,
  options: DeterministicChunkBuilderOptions,
  placeholderBuilder: PromptPlaceholderBuilder
): ChangeChunkEntity[]
```

**Registro de placeholders:**

Criar um mapa interno que associa nome do bloco (ex: `"TABELA_ENTREGUES"`) ao método do `PromptPlaceholderBuilder` que retorna o conteúdo. Novos placeholders são registrados aqui.

```typescript
const PLACEHOLDER_REGISTRY: Record<string, (builder: PromptPlaceholderBuilder, opts: DeterministicChunkBuilderOptions) => string> = {
  "TABELA_ENTREGUES": (b, o) => b.buildEntreguesTable(o.projectId),
  "TABELA_PENDENTES": (b, o) => b.buildPendentesTable(o.projectId),
  "TABELA_NOVOS_CICLO": (b, o) => b.buildNovosCicloTable(o.projectId, o.previousCurrentStateFilePath),
  "TABELA_SITUACAO_ATUAL": (b, o) => b.buildCurrentStateTableFromProject(o.projectId),
  "TOTAL_ENTREGUES": (b, o) => b.buildTotalEntregues(o.projectId),
  "TOTAL_PENDENTES": (b, o) => b.buildTotalPendentes(o.projectId),
  "TOTAL_ENTREGUES_CICLO": (b, o) => b.buildTotalEntreguesCiclo(o.projectId, o.previousCurrentStateFilePath),
  "NOVOS_CICLO": (b, o) => b.buildNovosCicloCount(o.projectId, o.previousCurrentStateFilePath),
  "PERCENTUAL_ENTREGA": (b, o) => b.buildPercentualEntrega(o.projectId),
  "CICLO_CORRENTE": (_, o) => String(o.cycleNumber).padStart(3, "0"),
  "DATA_REFERENCIA": (_, o) => o.referenceDate,
  "NOME_PROJETO": (_, o) => o.config.projectName ?? "—",
  "CLIENTE": (_, o) => o.config.clientName ?? "—",
  "FORNECEDOR": (_, o) => o.config.supplierName ?? "—",
};
```

**Comportamento quando placeholder não está no registro:** logar aviso, pular o bloco (não gerar chunk determinístico para ele — o conteúdo existente é mantido).

**Arquivos a criar:**
- `src/shared/deterministic-chunk-builder.ts`
- `src/shared/deterministic-chunk-builder.test.ts`

**Casos de teste obrigatórios:**
- Documento sem blocos → retorna array vazio
- Bloco com placeholder registrado → gera chunk com conteúdo do SQLite
- Bloco com placeholder não registrado → retorna array vazio (sem erro)
- Bloco onde conteúdo atual já é igual ao fresco → `generateDiff` retorna array vazio → nenhum chunk gerado
- Múltiplos blocos → múltiplos chunks, índices continuados a partir de `startChunkIndex`
- Conteúdo do SQLite com múltiplas linhas → chunk correto com location `@@ -L,C +L,D @@`

**Commit:** `feat: implement DeterministicChunkBuilder with placeholder registry`

---

## T07 — Orquestração em sendMessage

**Objetivo:** Conectar todos os componentes anteriores dentro de `phase-conversation-service.ts`, de forma que todo ciclo de geração passe pelo pipeline BEGIN-END automaticamente.

**Fluxo atual em `sendMessage`:**
```
buildPlaceholders → getSystemPrompt → getPrompt → sendToLLM → parseDiff → validateDiffChunks → createChangeSet → createChangeChunks
```

**Novo fluxo:**
```
getOutputDocCurrentContent
    ↓
compressDocument (PlaceholderBlockExtractor + DocumentCompressor)
    ↓
sendToLLM (com o documento comprimido como outputDoc)
    ↓
parseDiff → validateDiffChunks
    ↓
transformDiffCoordinates (DiffCoordinateTransformer)
    ↓
applyInMemory (adjusted LLM diff sobre originalContent)
    ↓
buildDeterministicChunks (DeterministicChunkBuilder)
    ↓
createChangeSet com todos os chunks (LLM + determinísticos)
```

**Detalhes de implementação:**

`sendMessage` atualmente não tem acesso a `cycleRepository` nem ao número do ciclo. Adicionar ao construtor de `PhaseConversationService`:
- `cycleRepository: ICycleRepository` — para buscar `cycle.id` a partir de `phase.cycleId`

O `cycleNumber` para os placeholders escalares é calculado pelo método já existente (contagem de atas).

O `applyInMemory` é o mesmo `applyDiff` usado em `applyAll`, mas sem persistência — resultado usado apenas para gerar os chunks determinísticos.

**ChangeChunks do LLM:** índices 1..N (como hoje)
**ChangeChunks determinísticos:** índices N+1..M

Ambos com `status = "AWAITING_APPROVAL"` — revisáveis pelo usuário normalmente.

**Documentos sem marcadores BEGIN-END:** `compressDocument` retorna o documento original intacto e `compressionMap` vazia. `transformDiffCoordinates` com mapa vazio retorna o diff intacto. `buildDeterministicChunks` com nenhum bloco retorna array vazio. Comportamento idêntico ao atual — retrocompatível.

**Arquivos a modificar:**
- `src/application/services/phase-conversation-service.ts`
- `src/domain/interfaces/services/phase-conversation-service-interface.ts` (se assinatura de `sendMessage` mudar)
- Testes existentes que mockam `sendMessage`

**Testes de integração a escrever:**
- `phase-conversation-service.placeholder-pipeline.test.ts`
  - Documento com um bloco BEGIN-END: LLM gera diff em placeholder-space, chunks transformados são aplicáveis ao original
  - Documento com dois blocos: offsets acumulados corretos
  - Documento sem blocos: comportamento idêntico ao atual
  - LLM retorna diff que não toca bloco → chunk determinístico gerado corretamente
  - Chunk determinístico tem conteúdo idêntico ao atual → nenhum chunk determinístico gerado (sem diff vazio no ChangeSet)

**Commit:** `feat: wire placeholder BEGIN-END pipeline into sendMessage orchestration`

---

## T08 — Atualização de templates e system prompts

**Objetivo:** Adicionar marcadores BEGIN-END nos templates dos documentos que têm seções estruturadas, e atualizar os system prompts para instruir o LLM a preservá-los.

**Templates a atualizar:**

**`locales/pt-BR/prompts/templates/delivery-log.md`**

Seções com marcadores:
```markdown
## Entregas

<!-- BEGIN-TABELA_ENTREGUES -->
(dados gerados pela aplicação)
<!-- END-TABELA_ENTREGUES -->

## Novos

<!-- BEGIN-TABELA_NOVOS_CICLO -->
(dados gerados pela aplicação)
<!-- END-TABELA_NOVOS_CICLO -->

## Estatística

<!-- BEGIN-TOTAL_ENTREGUES --><!-- END-TOTAL_ENTREGUES --> itens entregues no total
<!-- BEGIN-TOTAL_PENDENTES --><!-- END-TOTAL_PENDENTES --> itens pendentes
<!-- BEGIN-TOTAL_ENTREGUES_CICLO --><!-- END-TOTAL_ENTREGUES_CICLO --> entregues neste ciclo
<!-- BEGIN-NOVOS_CICLO --><!-- END-NOVOS_CICLO --> novos itens neste ciclo
Percentual de entrega: <!-- BEGIN-PERCENTUAL_ENTREGA --><!-- END-PERCENTUAL_ENTREGA -->
```

Cabeçalho do LEG:
```markdown
# Registro de Entrega — Ciclo <!-- BEGIN-CICLO_CORRENTE --><!-- END-CICLO_CORRENTE -->

**<!-- BEGIN-NOME_PROJETO --><!-- END-NOME_PROJETO -->**

Cliente: <!-- BEGIN-CLIENTE --><!-- END-CLIENTE -->
Fornecedor: <!-- BEGIN-FORNECEDOR --><!-- END-FORNECEDOR -->
Data de referência: **<!-- BEGIN-DATA_REFERENCIA --><!-- END-DATA_REFERENCIA -->**
```

**`locales/pt-BR/prompts/templates/current-state.md`** (situacao-atual)

Seção do backlog:
```markdown
## Backlog

<!-- BEGIN-TABELA_SITUACAO_ATUAL -->
(dados gerados pela aplicação)
<!-- END-TABELA_SITUACAO_ATUAL -->
```

**`locales/pt-BR/prompts/templates/initial-understanding.md`** (entendimento-inicial)

```markdown
## Backlog Inicial

<!-- BEGIN-TABELA_BACKLOG_INICIAL -->
(dados gerados pela aplicação)
<!-- END-TABELA_BACKLOG_INICIAL -->
```

**System prompts a atualizar:**

Em todos os system prompts que envolvem documentos com marcadores, adicionar (após `{{DIFF_RULES}}`):

```markdown
Regra obrigatória sobre blocos estruturados:
Os blocos delimitados por `<!-- BEGIN-NOME -->` e `<!-- END-NOME -->` são gerados deterministicamente pela aplicação.
Nunca gere conteúdo entre esses marcadores.
No diff de saída, preserve os marcadores exatamente como estão — a aplicação substituirá o conteúdo.
```

**Arquivos a modificar:**
- `locales/pt-BR/prompts/templates/delivery-log.md`
- `locales/pt-BR/prompts/templates/current-state.md`
- `locales/pt-BR/prompts/templates/initial-understanding.md`
- `locales/pt-BR/prompts/system/delivery-log.md`
- `locales/pt-BR/prompts/system/current-state.md`
- `locales/pt-BR/prompts/system/initial-understanding.md`

**Testes:**
- Verificar que os templates carregam sem erro após as alterações
- Verificar que `PlaceholderBlockExtractor` encontra todos os blocos esperados em cada template
- Arquivo: `src/infrastructure/llm/llm-prompts-provider.test.ts` — adicionar verificação de templates carregados

**Commit:** `feat: add BEGIN-END placeholder markers to delivery-log, current-state and initial-understanding templates`

---

## T09 — Fase EXTRACT_BACKLOG

**Objetivo:** Adicionar uma fase nova no início de cada ciclo (`mede-cli cycle`) dedicada a extrair e atualizar o backlog no SQLite antes de qualquer geração documental.

**Posição no ciclo:** fase 1, antes de `GENERATE_MEETING` (que passa a ser fase 2).

**Fluxo da fase:**

1. A aplicação monta o contexto:
   - Backlog atual completo (do SQLite, ou do `situacao-atual.md` se SQLite vazio)
   - Contadores de categoria por `documentType + nature + interventionType` (já calculados hoje para formatar IDs)
   - Prompt do usuário + arquivos passados

2. O LLM retorna **JSON puro** (não um diff):
```json
{
  "statusChanges": [
    { "id": "DEI-20260609-000-RF-BLI-0001", "newStatus": "Concluído", "observation": "..." }
  ],
  "newItems": [
    {
      "documentType": "DEI",
      "nature": "RF",
      "interventionType": "EVO",
      "description": "Nova feature X",
      "source": "cliente",
      "deliver": "ciclo 004",
      "tags": [],
      "status": "Pendente"
    }
  ]
}
```

3. A aplicação valida o JSON via schema zod.

4. A aplicação converte o JSON em um diff do `situacao-atual.md` (seção `<!-- BEGIN-TABELA_SITUACAO_ATUAL -->`) mostrando as mudanças de status e os novos itens — visível para o usuário como ChangeChunk.

5. Quando o usuário aprova o chunk, a aplicação aplica as mudanças no SQLite (não apenas no arquivo). Isso é diferente das outras fases: a aprovação do chunk dispara `backlogRepository.updateStatus()` e `backlogRepository.insert()` além de atualizar o arquivo.

**System prompt para EXTRACT_BACKLOG:**
- Instruir o LLM a retornar apenas JSON válido, sem markdown fence, sem explicações
- Proibir explicitamente inferir entregas sem evidência no contexto do usuário
- Incluir os contadores de categoria para que o LLM formate IDs corretamente

**User prompt:**
- Recebe `##TABELA_SITUACAO_ATUAL##` (backlog atual) + prompt livre do usuário

**Schema zod:**
```typescript
const StatusChangeSchema = z.object({
  id: z.string().regex(/^[A-Z]+-\d{8}-\d{3}-[A-Z]+-[A-Z]+-\d{4}$/),
  newStatus: z.enum(["Concluído", "Pendente", "Em andamento", "Aguardando", "Cancelado", "Esclarecido"]),
  observation: z.string().optional(),
});

const NewItemSchema = z.object({
  documentType: z.string(),
  nature: z.enum(["RF", "NF", "RN", "UX", "OP", "AR"]),
  interventionType: z.enum(["BLI", "COR", "AJU", "EVO"]),
  description: z.string().min(1),
  source: z.string().optional(),
  deliver: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.string().optional(),
});

const ExtractBacklogResponseSchema = z.object({
  statusChanges: z.array(StatusChangeSchema),
  newItems: z.array(NewItemSchema),
});
```

**Comportamento especial no `applyAll`:** quando a fase é `EXTRACT_BACKLOG` e o usuário aprova o chunk, além de escrever o arquivo, chamar `BacklogSyncService.applyExtraction(result)`.

**Arquivos a criar:**
- `src/application/services/backlog-sync-service.ts` — aplica as mudanças do JSON no SQLite
- `locales/pt-BR/prompts/system/extract-backlog.md`
- `locales/pt-BR/prompts/user/extract-backlog.md`

**Arquivos a modificar:**
- `src/application/services/cycle-service.ts` — adicionar fase `EXTRACT_BACKLOG` como fase 1
- `src/infrastructure/llm/llm-prompts-provider.ts` — carregar o novo prompt
- `src/application/services/phase-conversation-service.ts` — tratamento especial para `EXTRACT_BACKLOG` no `applyAll`
- `src/domain/entities/phase-entity.ts` (ou onde estão os nomes de fase) — adicionar `EXTRACT_BACKLOG`

**Testes:**
- JSON válido do LLM → parseado corretamente
- JSON inválido (ID no formato errado) → erro de validação zod
- JSON com `statusChanges` para ID inexistente → aviso mas sem crash
- `backlogSyncService.applyExtraction()` atualiza SQLite corretamente
- Arquivo: `src/application/services/backlog-sync-service.test.ts`
- Arquivo: adicionar casos em `src/application/services/cycle-service.test.ts`

**Commit:** `feat: add EXTRACT_BACKLOG phase as first phase of each cycle`

---

## T10 — Comando mede-cli validate

**Objetivo:** Implementar `mede-cli validate` que reconstrói o backlog a partir de `entendimento-inicial.md` + sequência de LEGs e verifica se o resultado é idêntico ao `situacao-atual.md`.

**Algoritmo (replay causal):**

```
1. Ler entendimento-inicial.md
   → extrair bloco <!-- BEGIN-TABELA_BACKLOG_INICIAL --> → estado inicial
   → se não tiver marcador: avisar e tentar parsear via CurrentStateParser

2. Para cada LEG em ordem cronológica (pelo nome do arquivo AAAAMMDD-NNN):
   a. Extrair <!-- BEGIN-TABELA_ENTREGUES --> → marcar IDs como Concluído
   b. Extrair <!-- BEGIN-TABELA_NOVOS_CICLO --> → adicionar novos itens
   c. Calcular estatísticas sobre o estado atual do replay
   d. Comparar com <!-- BEGIN-TOTAL_ENTREGUES --> etc. no LEG
   e. Se divergir → registrar inconsistência interna (qual LEG, qual stat, esperado vs encontrado)

3. Comparar estado final reconstruído com <!-- BEGIN-TABELA_SITUACAO_ATUAL --> em situacao-atual.md
   → se idêntico: VALID
   → se diferente: mostrar diff entre reconstruído e atual
```

**Saída do comando:**

```
✓ Backlog inicial carregado: 120 itens (entendimento-inicial.md)
✓ LEG 001 (2026-01-15): 5 entregues, 3 novos — estatísticas OK
✓ LEG 002 (2026-03-20): 12 entregues, 7 novos — estatísticas OK
✗ LEG 003 (2026-06-11): estatística diverge
    TOTAL_ENTREGUES esperado: 96  encontrado no LEG: 94
✓ Estado final reconstruído = situacao-atual.md  ← ou diff se divergir
```

**Flag `--fix`:** se o estado reconstruído divergir do `situacao-atual.md`, gerar os diffs determinísticos e criar um ChangeSet para o usuário revisar.

**Integração com `mede-cli commit`:** ao final do `commit`, executar o validate automaticamente. Se falhar, exibir aviso (não bloquear — usar `--strict` para bloquear).

**Componentes a criar:**

- `src/application/services/backlog-replay-service.ts`
  - `replay(entendimentoInicialPath, legPaths): BacklogState`
  - `validateLegStats(legDoc, stateAtLeg): ValidationResult[]`

- `src/application/services/consistency-checker.service.ts`
  - `check(replayedState, situacaoAtualPath): ConsistencyResult`
  - `diff(replayedState, currentState): string`

- `src/cli/commands/validate-handler.ts`
  - Ler config para saber onde estão os arquivos
  - Chamar replay + check
  - Formatar saída

**Arquivos a modificar:**
- `src/cli/runner.ts` — registrar o comando `validate`
- `src/application/services/cycle-service.ts` — chamar validate no `commit` com aviso

**Testes:**
- Replay com 0 LEGs → estado = estado inicial
- Replay com 1 LEG com entregas e novos → estado correto
- LEG com estatística errada → detectado e reportado com localização exata
- Estado reconstruído igual ao atual → VALID
- Estado reconstruído diferente → diff correto
- Arquivo: `src/application/services/backlog-replay-service.test.ts`
- Arquivo: `src/application/services/consistency-checker.service.test.ts`

**Commit:** `feat: implement mede-cli validate command for causal consistency check`

---

## Resumo das dependências

```
T01 (config fields)
  └─► T02 (scalar placeholders)
        └─► T06 (deterministic chunks — usa PromptPlaceholderBuilder)
T03 (table placeholders)
  └─► T06

T04 (extractor + compressor)
  └─► T05 (coordinate transformer)
        └─► T07 (sendMessage orchestration)
              └─► T08 (templates — ativa o pipeline no ciclo real)
T06
  └─► T07

T07 + T08
  └─► T09 (EXTRACT_BACKLOG — depende do pipeline funcionando)

T08
  └─► T10 (validate — depende dos marcadores existirem nos documentos)
```

## Notas gerais para o implementador

- Cada tarefa deve começar com todos os testes existentes passando (`npm test`)
- Escrever os testes da tarefa antes ou junto com a implementação (não depois)
- Usar `tsx src/cli/index.ts` para testes manuais no projeto `D:\projetos\11Tech - Projetos\Produtos\11publish`
- Nunca alterar o schema do banco SQLite sem migration correspondente
- O projeto do usuário em `.mede/mede.db` pode estar com dados reais — testes de integração usam banco em memória ou path temporário
- Retrocompatibilidade obrigatória: documentos sem marcadores BEGIN-END devem funcionar como antes em todas as tarefas

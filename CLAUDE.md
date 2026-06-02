# CLAUDE.md — MEDE-CLI

## O que é este projeto

**MEDE-CLI** é uma ferramenta de linha de comando que operacionaliza a **metodologia MEDE** (Metodologia de Evolução Documental Estruturada): a documentação de engenharia de software evolui por ciclos causais supervisionados, assistidos por LLM, com obrigatória revisão humana antes de qualquer aplicação.

Toda alteração documental é tratada como **change-set pendente**. Nada é modificado automaticamente.

O projeto está em fase inicial de desenvolvimento (v0.1.x). Há estrutura de código funcional mas o produto não está completo.

---

## Stack e ferramentas

- **Linguagem:** TypeScript (ESM, `"type": "module"`)
- **Runtime:** Node.js
- **Build:** `tsdown` → `dist/cli/index.mjs`
- **CLI parser:** `commander`
- **Banco local:** `better-sqlite3` (SQLite em `.mede/mede.db`)
- **Diff:** biblioteca `diff`
- **Validação:** `zod`
- **Dev runner:** `tsx src/cli/index.ts`

### Scripts npm

```bash
npm run dev          # executa via tsx (sem build)
npm run build        # compila para dist/
npm run typecheck    # verifica tipos sem emitir
npm run clean        # remove dist/
```

---

## Estrutura de diretórios do código-fonte

```
src/
  cli/
    index.ts          # entry point
    runner.ts         # registra todos os comandos via commander
  commands/
    *-handler.ts      # handlers de cada comando CLI (ciclo, config, changes, etc.)
  db/
    better-sqlite-connection-factory.ts
    unit-of-work.ts
    *-interface.ts
  entities/
    *.ts              # tipos/interfaces de domínio (cycle, change-set, phase, etc.)
  models/
    *.ts              # modelos de resultado/projeção
  repositories/
    *.ts              # implementações SQLite
    interfaces/       # contratos de repositório
  services/
    *.ts              # lógica de negócio (cycle, changes, llm, etc.)
    interfaces/       # contratos de serviço
  shared/
    llm/              # providers: OpenAI, Anthropic, Ollama, Gemini, Azure
    diff.ts           # geração e aplicação de diffs
    current-state-parser.ts
    initial-understanding-parser.ts
    utils.ts
    crypto.ts
    json.ts
```

### Organização alvo (arquitetura recomendada em `arquitetura.md`)

A arquitetura recomendada é em 5 camadas. O código atual ainda usa uma estrutura mais flat, mas está sendo migrado:

```
src/
  cli/           → parsing de comandos, apresentação (sem regra de negócio)
  application/   → casos de uso e orquestração
  domain/        → entidades, políticas, enums, contratos
  infrastructure/→ SQLite, filesystem, LLM, diff, config
  shared/        → utilitários transversais
```

---

## Configuração do projeto (`mede.config.json`)

Arquivo na raiz do projeto do usuário (não do MEDE-CLI). Controla:

- `language`: idioma dos documentos (ex: `"pt-BR"`)
- `docsRoot`: diretório raiz da documentação
- `directories`: mapeamento de subdiretórios (atas, adr, esm, log-entregas)
- `fileNames`: nomes físicos dos documentos vivos
- `prefixes`: prefixos para artefatos históricos (min, adr, esm, leg)
- `llm`: provider, model, endpoint, apiKeyEnv, temperature, maxTokens, timeoutMs
- `systemPrompts`: prompts metodológicos por fase (opcionais)

---

## Conceitos fundamentais da metodologia MEDE

### Ciclo metodológico

O comando `mede-cli cycle` inicia o ciclo de evolução documental. As fases são **sequenciais e dependentes**:

1. ATA (gerada a partir de contexto do projeto)
2. ADR (derivada da ATA)
3. ESM (derivada da ATA)
4. LEG / log de entrega (ATA + ESM)
5. Requisitos funcionais (ATA + ADR)
6. Requisitos não funcionais (ATA + ADR)
7. Modelo de dados (ATA + ADR + RFs + RNFs)
8. Cronograma (ATA + ADR + ESM + RFs + RNFs + modelo)
9. Visão e escopo (ATA + ADR + RFs + RNFs + modelo)
10. README (ATA + ADR + visão-e-escopo)
11. Situação atual (ATA + ADR + RFs + RNFs + modelo + visão-e-escopo)

**Regra do número do ciclo:** o ciclo corrente = quantidade de atas existentes + 1. O número entra nos nomes de artefatos históricos com 3 dígitos (ex: `001`, `002`).

### Tipos de documento

- **Documentos vivos** (entram no snapshot): `readme.md`, `situacao-atual.md`, `requisitos-funcionais.md`, `requisitos-nao-funcionais.md`, `modelo-de-dados.md`, `cronograma.md`, `visao-e-escopo.md`
- **Artefatos históricos** (nunca entram no snapshot): `min-*`, `adr-*`, `esm-*`, `leg-*`

### Convenção de nomenclatura de artefatos históricos

```
prefixo-AAAAMMDD-NNN.md
```
Onde `NNN` é o número do ciclo com 3 dígitos.

### Change-set e change-chunk

- **ChangeSet**: proposta de alteração para um artefato (pode criar, modificar, sincronizar)
- **ChangeChunk**: trecho-diff individual dentro de um change-set
  - Status possíveis: `PENDING`, `APPLIED`, `DISCARDED`

### Snapshot e rollback

- Ao iniciar um ciclo, todos os documentos vivos são copiados para snapshot
- `commit`: descarta snapshot, mantém tudo aprovado
- `rollback`: restaura snapshot, remove artefatos históricos criados no ciclo

### Estado operacional efêmero

O diretório `.mede/` contém o banco SQLite operacional. Ele **pode ser removido sem perder a verdade documental** — o estado deve ser reconstruível a partir dos arquivos Markdown persistentes.

### Modelo transacional por fase

Cada fase do ciclo tem seu próprio loop interno:
1. LLM gera proposta
2. usuário pode refinar N vezes
3. usuário aprova ou rejeita
4. fase avança

**Comportamento especial da ATA:** `reject` encerra o ciclo inteiro. Em todas as demais fases, `reject` pula a fase mas o ciclo continua.

### Identificadores formais de backlog

```
<DOC>-<AAAAMMDD>-<CICLO>-<NAT>-<TIP>-<NNNN>
```

Naturezas: `RF`, `NF`, `RN`, `UX`, `OP`, `AR`
Tipos: `BLI`, `COR`, `AJU`, `EVO`
Tags auxiliares: `HOT`, `PERF`, `SEC`, `MIG`
Status: `Pendente`, `Cancelado`, `Concluído`, `Esclarecido`, `Aguardando`

---

## Comandos disponíveis

| Comando | Descrição |
|---|---|
| `mede-cli cycle [-p prompt] [-f file]` | Inicia ciclo metodológico |
| `mede-cli status` | Estado operacional atual |
| `mede-cli approve [-a]` | Aprova fase atual (`-a` = auto-aprova todas) |
| `mede-cli reject [-a]` | Rejeita fase atual (`-a` = auto-rejeita todas) |
| `mede-cli refine [-p prompt] [-f file]` | Refina fase atual |
| `mede-cli commit` | Finaliza ciclo, mantém alterações |
| `mede-cli rollback` | Cancela ciclo, restaura snapshot |
| `mede-cli pending [-a]` | Lista trecho-diffs pendentes |
| `mede-cli apply [-a]` | Aplica trecho-diff atual |
| `mede-cli discard [-a]` | Descarta trecho-diff atual |
| `mede-cli files [-b]` | Lista arquivos alterados/criados no ciclo |
| `mede-cli diff <file>` | Mostra diff de um arquivo |
| `mede-cli cat <file> [-b]` | Mostra conteúdo de um arquivo |
| `mede-cli init [-p prompt] [-f file]` | Inicializa projeto / reconstrói estado |
| `mede-cli config` | Mostra configuração atual |
| `mede-cli config init` | Cria `mede.config.json` |
| `mede-cli config apply` | Aplica alterações manuais na configuração |
| `mede-cli llm` | Inspeciona configuração de LLM |
| `mede-cli llm test [-p prompt]` | Executa prompt de teste isolado |

---

## Provedores de LLM suportados

Implementados em `src/shared/llm/`:

- `openai-llm-provider.ts` (e endpoint `openai-compatible`)
- `anthropic-llm-provider.ts`
- `ollama-llm-provider.ts`
- `gemini-llm-provider.ts`
- `azure-openai-llm-provider.ts`

Credenciais **sempre via variável de ambiente** (`apiKeyEnv`). Nunca gravar em texto puro.

---

## Banco de dados (SQLite local)

Arquivo: `.mede/mede.db`

Entidades principais (mapeadas em `src/entities/` e `src/repositories/`):
- `Projeto`, `ProjectConfig`
- `Cycle`, `CycleArtifact`
- `Phase`, `PhaseConversation`, `PhaseAttachment`
- `ChangeSet`, `ChangeChunk`
- `Backlog`, `BacklogInterventionCounters`
- `LlmProfile`
- `Nature`

O banco é recriado automaticamente quando perdido.

---

## Documentação do projeto (em `docs/`)

| Arquivo | Tipo |
|---|---|
| `entendimento-inicial.md` | Histórico — não alterar |
| `visao-e-escopo.md` | Vivo |
| `requisitos-funcionais.md` | Vivo |
| `requisitos-nao-funcionais.md` | Vivo |
| `modelo-de-dados.md` | Vivo |
| `situacao-atual.md` | Vivo — referência principal de rastreabilidade |
| `atas-de-reuniao/` | Históricos imutáveis |
| `decisoes-arquiteturais/` | Históricos imutáveis |

---

## Princípios que guiam o desenvolvimento

1. **A CLI não decide regra.** Toda lógica metodológica fica no domínio/application.
2. **O repositório não orquestra fluxo.** Apenas persiste e recupera.
3. **A LLM não conhece o ciclo.** Ela recebe contexto montado pela aplicação e retorna proposta estruturada.
4. **O eixo do sistema é a fase (PhaseExecution), não o arquivo.** ChangeSet é consequência da fase.
5. **Nunca aplicar alterações sem aprovação humana explícita.**
6. **Estado em `.mede/` é efêmero.** A documentação Markdown é a fonte de verdade.
7. **Credenciais sempre por variável de ambiente.** Nunca em `mede.config.json` em texto puro.

---

## Base de conhecimento da metodologia MEDE

Os artigos e documentos de fundamento da metodologia estão em `.conhecimento/`:

- `aplicacao-manual-do-mede.md` — processo manual de consolidação documental
- `arquitetura-isomorfica-de-software-v1_0_0.md` — arquitetura isomórfica
- `artigo03-mede_pt-br.md` — artigo fundacional da MEDE
- `artigo04-es4.0-*.md` — Engenharia de Software 4.0 e governança do conhecimento
- `artigo05-mede-instrumentador-*.md` — MEDE como instrumentador de rastreamento

Consulte esses arquivos para entender as decisões metodológicas por trás do produto.

# TODO — MEDE-CLI

Pendências conhecidas, organizadas por área. Atualizado em 2026-06-03.

Contexto do roadmap acordado (ordem): Q3 mínima ✅ → Q1 ✅ → Q2 ✅ → **Q3 rica (TUI)** → **Q4 (integração)**.
Concluído até aqui: console interativo mínimo (REPL), conexão única, e OAuth para LLMs (3 fatias).

---

## 1. Q3 rica — TUI com Ink/React (próximo do roadmap)

Evoluir o console mínimo (`src/cli/repl.ts`, readline) para uma TUI rica.

- [ ] Avaliar e adicionar `ink` + `react` (dependências novas; impacto no build `tsdown` e no tamanho do bundle).
- [ ] Tela de status do ciclo/fase como componente (consumir `StatusService`).
- [ ] Navegação interativa por trecho-diffs (pending/apply/discard) com preview do diff.
- [ ] Fluxo de fase (gerar → refinar N× → aprovar/rejeitar) como UI guiada.
- [ ] Reuso dos mesmos handlers/serviços (não duplicar regra de negócio na camada de UI).
- [ ] Manter a CLI one-shot e o REPL mínimo funcionando (a TUI é aditiva).
- [ ] Tratar terminais sem TTY (CI, pipes) caindo para o modo texto atual.

## 2. Q4 — Testes de integração reais com credenciais (BACKLOG)

- [ ] Suite separada `*.integration.test.ts` com `describe.skipIf(!process.env.<KEY>)`, **fora do `npm test` padrão**.
- [ ] Job de CI dedicado (`workflow_dispatch` / `schedule` noturno) com chaves em GitHub Actions Secrets.
- [ ] Asserções estruturais (diff parseável/não-vazio), modelo mais barato, `maxTokens` baixo.
- [ ] Ideal: **record & replay** (VCR / nock / Polly) para determinismo sem custo.
- [ ] **Validar OAuth com credenciais reais** (ver seção 3 — hoje só há teste com I/O simulado).

## 3. OAuth (Q2) — pendências e validação real

A lógica está implementada e testada com I/O **simulado**; falta exercitar contra os provedores de verdade.

- [ ] **Validar o device-code Azure AAD** ponta a ponta (registrar app no Entra ID, `clientId`+`tenant`, conferir scope `https://cognitiveservices.azure.com/.default offline_access`).
- [ ] **Validar ADC (Vertex/Gemini)**: `gcloud auth application-default print-access-token` + chamada real ao endpoint Vertex. Confirmar o endpoint correto (Vertex usa host/rota diferente do `generativelanguage.googleapis.com`).
- [ ] **Validar OpenRouter PKCE** ponta a ponta (abrir navegador, servidor de callback local na porta 8765, troca `code`→`key`). Conferir porta/callback aceitos pelo OpenRouter.
- [ ] **Presets explícitos de Vertex/Gemini**: hoje Vertex usa `auth: "adc"` e o Gemini público segue `apiKey`; não há preset dedicado que ajuste endpoint do Vertex automaticamente.
- [ ] **Refresh real do Azure**: confirmar que o refresh token é emitido e que `OAuthAuthStrategy` o renova corretamente.
- [ ] **`llm logout` para ADC**: ADC não guarda nada no cofre — hoje `logout` só apaga a chave `oauth:<provider>`; avaliar mensagem específica para o modo adc.
- [ ] **Porta de callback OpenRouter configurável** (hoje fixa em 8765; pode colidir). Tratar `EADDRINUSE`.
- [ ] **Abertura de navegador** (`openInDefaultBrowser`) não tem teste e é sensível a SO (cmd/open/xdg-open) — validar em Windows/macOS/Linux.
- [ ] **Cofre opcional via keychain do SO**: a interface `ISecretVault` já permite plugar um credential-helper depois (estilo Docker). Não implementado.
- [ ] **Documentar** os modos de auth (`apiKey`/`oauth`/`adc`), o bloco `llm.oauth`, e `llm login`/`logout` no `CLAUDE.md` e no `readme.md`.

## 4. Migração de arquitetura (recomendada em `arquitetura.md`)

O código atual ainda usa estrutura flat (`commands/`, `services/`, `repositories/`, `entities/`, `models/`, `shared/`); a arquitetura-alvo é em 5 camadas.

- [ ] Migrar para `cli/` (parsing/apresentação) · `application/` (casos de uso) · `domain/` (entidades/políticas/contratos) · `infrastructure/` (SQLite, FS, LLM, diff, config) · `shared/`.
- [ ] Mover entidades de domínio de `entities/` para `domain/`.
- [ ] Concentrar orquestração nos casos de uso de `application/` (a CLI não decide regra).

## 5. Banco de dados / migrações

- [ ] Há apenas a migração 1 (schema inicial) em `better-sqlite-connection-factory.ts`. Estabelecer convenção para futuras migrações conforme o schema evoluir (ex.: o campo `auth`/`oauth` vive só no `mede.config.json`, não no SQLite — confirmar que não precisa de coluna).
- [ ] Avaliar `:memory:` no app apenas para o console interativo de processo longo (já suportado pelo factory; hoje usado só em testes).

## 6. Qualidade / DX

- [ ] Cobrir o loop do REPL (`startRepl`) com teste (hoje só `tokenize`/`buildProgram` são testados); o ciclo de shared container está testado em `container.test.ts`, mas o loop de leitura não.
- [ ] Conferir `config init` — o template inline em `config-service.ts` agora inclui `auth: "apiKey"`; avaliar incluir um exemplo comentado de bloco `llm.oauth`.
- [ ] Revisar mensagens de erro de OAuth para consistência de idioma (pt-BR) e tom.

## 7. Itens menores / dívidas observadas

- [ ] `LlmService.providers()` compara `provider === "anthropic-compatible"`, `"azure-compatible"`, etc., que **não** são valores suportados (o factory usa `anthropic`, `azure`, `gemini`, `ollama`, `openai-compatible`). O status sempre mostra "None" para a maioria — provável bug pré-existente a corrigir.
- [ ] Avaliar tornar a porta/timeout do callback OpenRouter e o caminho do cofre configuráveis por env var para cenários avançados.

# TODO — MEDE-CLI

Pendências conhecidas, organizadas por área. Atualizado em 2026-06-03.

Contexto do roadmap acordado (ordem): Q3 mínima ✅ → Q1 ✅ → Q2 ✅ → **Q3 rica (TUI)** → **Q4 (integração)**.
Concluído até aqui: console interativo mínimo (REPL), conexão única, e OAuth para LLMs (3 fatias).

---

## 1. Q3 rica — TUI com Ink/React (próximo do roadmap)

Evoluir o console mínimo (`src/cli/repl.ts`, readline) para uma TUI rica.

- [x] Avaliar e adicionar `ink` + `react` (dependências novas; impacto no build `tsdown` e no tamanho do bundle). (Implementado: adicionado e compilado com dynamic-import no build para otimização de bundle).
- [x] Tela de status do ciclo/fase como componente (consumir `StatusService`). (Implementado: componente TUI lê e renderiza o estado completo da fase/ciclo).
- [x] Navegação interativa por trecho-diffs (pending/apply/discard) com preview do diff. (Implementado: tela de navegação interativa via setinhas do teclado, preview colorido e ações locais).
- [x] Fluxo de fase (gerar → refinar N× → aprovar/rejeitar) como UI guiada. (Implementado: fluxo guiado integrado com prompts de refinamento).
- [x] Reuso dos mesmos handlers/serviços (não duplicar regra de negócio na camada de UI). (Implementado: consome diretamente os repositórios e serviços do container).
- [x] Manter a CLI one-shot e o REPL mínimo funcionando (a TUI é aditiva). (Implementado: REPL tradicional acessado via flag --repl e CLI one-shot intacta).
- [x] Tratar terminais sem TTY (CI, pipes) caindo para o modo texto atual. (Implementado: cai para o REPL automaticamente se process.stdout.isTTY for falso).

## 2. Q4 — Testes de integração reais com credenciais (BACKLOG)

- [x] Suite separada `*.integration.test.ts` com `describe.skipIf(!process.env.<KEY>)`, **fora do `npm test` padrão**. (Implementado: configurado no vitest.config.ts e executável via npm run test:integration).
- [x] Job de CI dedicado (`workflow_dispatch` / `schedule` noturno) com chaves em GitHub Actions Secrets. (Implementado: workflow em .github/workflows/integration-tests.yml).
- [x] Asserções estruturais (diff parseável/não-vazio), modelo mais barato, `maxTokens` baixo. (Implementado: suite usa gpt-4o-mini e gemini-1.5-flash com maxTokens 10 e asserção estrutural).
- [ ] Ideal: **record & replay** (VCR / nock / Polly) para determinismo sem custo.
- [ ] **Validar OAuth com credenciais reais** (ver seção 3 — hoje só há teste com I/O simulado).

## 3. OAuth (Q2) — pendências e validação real

A lógica está implementada e testada com I/O **simulado**; falta exercitar contra os provedores de verdade.

- [ ] **Validar o device-code Azure AAD** ponta a ponta (registrar app no Entra ID, `clientId`+`tenant`, conferir scope `https://cognitiveservices.azure.com/.default offline_access`).
- [ ] **Validar ADC (Vertex/Gemini)**: `gcloud auth application-default print-access-token` + chamada real ao endpoint Vertex. Confirmar o endpoint correto (Vertex usa host/rota diferente do `generativelanguage.googleapis.com`).
- [ ] **Validar OpenRouter PKCE** ponta a ponta (abrir navegador, servidor de callback local na porta 8765, troca `code`→`key`). Conferir porta/callback aceitos pelo OpenRouter.
- [x] **Presets explícitos de Vertex/Gemini**: hoje Vertex usa `auth: "adc"` e o Gemini público segue `apiKey`; não há preset dedicado que ajuste endpoint do Vertex automaticamente. (Implementado: suporte a providers vertex e google-vertex com auto-resolução de endpoint com base no GCP Project ID e região).
- [ ] **Refresh real do Azure**: confirmar que o refresh token é emitido e que `OAuthAuthStrategy` o renova corretamente.
- [x] **`llm logout` para ADC**: ADC não guarda nada no cofre — hoje `logout` só apaga a chave `oauth:<provider>`; avaliar mensagem específica para o modo adc. (Implementado: retorna mensagem descritiva indicando como revogar via gcloud/provedor).
- [x] **Porta de callback OpenRouter configurável** (hoje fixa em 8765; pode colidir). Tratar `EADDRINUSE`. (Implementado: configurável via llm.oauth.callbackPort e trata EADDRINUSE amigavelmente).
- [x] **Abertura de navegador** (`openInDefaultBrowser`) não tem teste e é sensível a SO (cmd/open/xdg-open) — validar em Windows/macOS/Linux. (Implementado: movido para utils.ts e coberto com testes simulando as plataformas).
- [x] **Cofre opcional via keychain do SO**: a interface `ISecretVault` já permite plugar um credential-helper depois (estilo Docker). (Implementado: SystemKeychainSecretVault usando utilitários nativos e DockerCredentialHelperSecretVault integrado via createSecretVault).
- [x] **Documentar** os modos de auth (`apiKey`/`oauth`/`adc`), o bloco `llm.oauth`, e `llm login`/`logout` no `CLAUDE.md` e no `readme.md`.

## 4. Migração de arquitetura (recomendada em `arquitetura.md`)

O código atual foi completamente estruturado em 5 camadas arquiteturais conforme as recomendações do target architecture.

- [x] Migrar para `cli/` (parsing/apresentação) · `application/` (casos de uso) · `domain/` (entidades/políticas/contratos) · `infrastructure/` (SQLite, FS, LLM, diff, config) · `shared/`. (Implementado: estrutura e importações atualizadas).
- [x] Mover entidades de domínio de `entities/` para `domain/`. (Implementado: entidades e subdiretórios reorganizados em src/domain).
- [x] Concentrar orquestração nos casos de uso de `application/` (a CLI não decide regra). (Implementado: regras concentradas nos serviços de aplicação).

## 5. Banco de dados / migrações

- [x] Há apenas a migração 1 (schema inicial) em `better-sqlite-connection-factory.ts`. Estabelecer convenção para futuras migrações conforme o schema evoluir (ex.: o campo `auth`/`oauth` vive só no `mede.config.json`, não no SQLite — confirmar que não precisa de coluna). (Implementado: convenções documentadas no factory e confirmado que a autenticação reside fora do banco).
- [x] Avaliar `:memory:` no app apenas para o console interativo de processo longo (já suportado pelo factory; hoje usado só em testes). (Implementado: adicionado suporte a --in-memory e env MEDE_IN_MEMORY=true para REPL e TUI).

## 6. Qualidade / DX

- [x] Cobrir o loop do REPL (`startRepl`) com teste (hoje só `tokenize`/`buildProgram` são testados); o ciclo de shared container está testado em `container.test.ts`, mas o loop de leitura não. (Implementado: testes adicionados em repl.test.ts cobrindo a inicialização, loop de comandos vazios, help e encerramento).
- [x] Conferir `config init` — o template inline em `config-service.ts` agora inclui `auth: "apiKey"`; avaliar incluir um exemplo comentado de bloco `llm.oauth`. (Avaliado: como o mede.config.json é parseado estritamente por JSON.parse, comentários não são suportados. Os exemplos e explicações do bloco oauth foram amplamente documentados no CLAUDE.md e no readme.md).
- [x] Revisar mensagens de erro de OAuth para consistência de idioma (pt-BR) e tom. (Implementado: mensagens traduzidas para português pt-BR mais polido e amigável).

## 7. Itens menores / dívidas observadas

- [x] `LlmService.providers()` compara `provider === "anthropic-compatible"`, `"azure-compatible"`, etc., que **não** são valores suportados (o factory usa `anthropic`, `azure`, `gemini`, `ollama`, `openai-compatible`). O status sempre mostra "None" para a maioria — provável bug pré-existente a corrigir.
- [x] Avaliar tornar a porta/timeout do callback OpenRouter e o caminho do cofre configuráveis por env var para cenários avançados. (Implementado: porta via MEDE_OPENROUTER_PORT, timeout via MEDE_OPENROUTER_TIMEOUT e caminho do cofre via MEDE_VAULT_PATH ou MEDE_CREDENTIALS_PATH).

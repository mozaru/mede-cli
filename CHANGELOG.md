# Changelog

Todas as mudanças notáveis deste projeto são documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e o projeto adota [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não lançado]

### Adicionado
- Tratamento de erro global na CLI: falhas viram mensagem amigável e código de
  saída diferente de zero (variável `MEDE_DEBUG` mostra o stack completo).
- Transações atômicas nas operações multi-passo do ciclo (`begin`,
  `beginInitialization`, `createBackupDocs`, `clearCycle`).
- Validação de configuração com Zod (`mede.config.json`) e da resposta de diff
  da LLM, com mensagens de erro por campo.
- Versionamento de schema do SQLite via `PRAGMA user_version` com migrations
  incrementais idempotentes.
- Retry com backoff exponencial para erros transitórios da LLM e logger com
  níveis controlado por `MEDE_DEBUG`/`MEDE_LOG_LEVEL`.
- Composition root central (`src/cli/container.ts`) eliminando a injeção de
  dependências duplicada nos handlers.
- Ferramental de qualidade: ESLint (flat config), Prettier e CI no GitHub
  Actions (typecheck, lint, testes e build).
- Cobertura de testes ampliada para repositórios, transações, parsers, schemas
  e fluxo de ciclo com um provedor de LLM falso.

### Corrigido
- Métodos de escrita dos repositórios agora reportam corretamente se uma linha
  foi alterada (`result.changes > 0`) em vez de retornar `true` fixo.
- `ChangeChunkRepository.getCurrent` consultava o status com casing errado
  (`awaitingApproval`) e nunca encontrava o chunk pendente.

### Unificado
- A versão exibida pela CLI passa a ser lida do `package.json` (fonte única).

## [0.1.0] - 2025

- Versão inicial: estrutura do ciclo metodológico, providers de LLM
  (OpenAI/Anthropic/Ollama/Gemini/Azure), persistência SQLite e comandos da CLI.

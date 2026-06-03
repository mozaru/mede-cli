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
- Documentação de distribuição: seção de instalação no `readme.md` (requisitos,
  instalação global, `npx`, build a partir do código-fonte) e guia de publicação
  para mantenedores em `DISTRIBUICAO.md` (empacotamento, fluxo de release,
  versionamento e checklist).

### Segurança
- Utilitário de contenção de caminho (`src/shared/path-safety.ts`):
  `isPathWithin`/`assertPathWithin` e rejeição de NUL bytes. O
  `FileSystemRepository` passa a recusar NUL bytes em todas as operações de
  escrita e, quando raízes permitidas são configuradas, bloqueia escritas que
  escapem da árvore do projeto (travessia `../`). Padrão sem raízes preserva o
  comportamento atual.
- `SECURITY.md` com política de divulgação responsável.

### Qualidade
- Todo o código-fonte passa em `prettier --check` e `eslint` sem erros nem
  warnings. `.prettierignore` alinhado ao escopo do ESLint (ignora `src-prisma`
  e `src-old`); warnings residuais (`any`, variáveis/imports não usados, blocos
  e funções vazias) eliminados sem alterar comportamento.
- Medição de cobertura (`@vitest/coverage-v8`) com `all: true` e limites mínimos
  que falham o CI em caso de regressão (`npm run test:coverage`); o CI passa a
  rodar a suíte com cobertura.
- Testes do núcleo `CycleService` (snapshot/`begin`, `rollback`, `commit`) —
  a garantia central da metodologia — e do `FileSystemRepository`/`path-safety`.
  Cobertura geral subiu de ~29% para ~38% das linhas; 170 testes no total.
- Governança OSS: `CONTRIBUTING.md`, templates de issue e de pull request.

### Corrigido
- Métodos de escrita dos repositórios agora reportam corretamente se uma linha
  foi alterada (`result.changes > 0`) em vez de retornar `true` fixo.
- `ChangeChunkRepository.getCurrent` consultava o status com casing errado
  (`awaitingApproval`) e nunca encontrava o chunk pendente.
- Campo `files` do `package.json` referenciava `README.md`, mas o arquivo é
  `readme.md`; em filesystems case-sensitive (Linux/CI) o README era omitido do
  pacote publicado.

### Unificado
- A versão exibida pela CLI passa a ser lida do `package.json` (fonte única).

## [0.1.0] - 2025

- Versão inicial: estrutura do ciclo metodológico, providers de LLM
  (OpenAI/Anthropic/Ollama/Gemini/Azure), persistência SQLite e comandos da CLI.

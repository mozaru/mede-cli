# Distribuição e Publicação — MEDE-CLI

Este documento descreve como empacotar, validar e publicar o **MEDE-CLI** no
registro npm. É um guia voltado a **mantenedores** do projeto. Para instruções
de instalação e uso, consulte o [readme.md](./readme.md).

---

## Visão geral do empacotamento

O pacote publicado é deliberadamente enxuto. O campo `files` do `package.json`
controla o que entra no tarball:

```json
"files": [
  "dist",
  "locales",
  "readme.md",
  "CHANGELOG.md",
  "LICENSE"
]
```

Conteúdo do pacote publicado:

| Item                  | Origem                          | Observação                              |
| --------------------- | ------------------------------- | --------------------------------------- |
| `dist/cli/index.mjs`  | `npm run build` (`tsdown`)      | Bundle ESM único, executável (`bin`)    |
| `locales/`            | raiz do repositório             | Dicionários de prompts e traduções      |
| `readme.md`           | raiz do repositório             | Documentação principal                  |
| `CHANGELOG.md`        | raiz do repositório             | Histórico de versões                    |
| `LICENSE`             | raiz do repositório             | Apache-2.0                              |
| `package.json`        | sempre incluído pelo npm        | Metadados, `bin`, `engines`             |

> **Atenção a maiúsculas/minúsculas:** o `files` precisa casar exatamente com o
> nome real dos arquivos (o repositório usa `readme.md` em minúsculas). O npm
> publica a partir de filesystems case-sensitive (Linux/CI); um nome divergente
> faz o arquivo sumir silenciosamente do pacote.

O `bin` aponta para o bundle gerado (oferecendo os comandos `mede-cli` e o alias `mede`):

```json
"bin": {
  "mede-cli": "dist/cli/index.mjs",
  "mede": "dist/cli/index.mjs"
}
```

O `better-sqlite3` é declarado como dependência de runtime e marcado como
`deps.neverBundle` no `tsdown.config.ts` — ele **não** é embutido no bundle e é resolvido
via `node_modules` na máquina do usuário (binário nativo).

---

## Pré-requisitos do mantenedor

* Node.js ≥ 20 e npm;
* conta no npm com acesso de publicação ao pacote `mede-cli`
  (`publishConfig.access` está como `public`);
* autenticação local: `npm login` (ou token `NPM_TOKEN` no ambiente de CI).

---

## Fluxo de release

### 1. Garantir a árvore limpa e atualizada

```bash
git checkout main
git pull
git status        # deve estar limpo
```

### 2. Rodar a verificação de qualidade completa

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

O mesmo conjunto roda no CI (`.github/workflows/ci.yml`) para Node 20 e 22 a cada
push/PR. O script `prepublishOnly` (`typecheck && test && build`) também executa
automaticamente antes de qualquer `npm publish`, como rede de segurança.

### 3. Atualizar o CHANGELOG

Mover os itens de `## [Não lançado]` para uma nova seção versionada, seguindo
[Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/):

```markdown
## [0.1.2] - 2026-06-02
```

### 4. Bumpar a versão

Use [SemVer](https://semver.org/lang/pt-BR/). O `npm version` atualiza o
`package.json`, cria o commit e a tag:

```bash
npm version patch    # correções            → 1.0.0 -> 1.0.1
npm version minor    # novas funcionalidades → 1.0.x -> 1.1.0
npm version major    # mudanças incompatíveis→ 1.x.x -> 2.0.0
```

### 5. Validar o conteúdo do tarball antes de publicar

```bash
npm pack --dry-run
```

Confirme que aparecem exatamente: `dist/cli/index.mjs`, `readme.md`,
`CHANGELOG.md`, `LICENSE` e `package.json` — e nada de código-fonte, testes ou
`.mede/`.

### 6. Publicar

```bash
npm publish
```

Para validar uma pré-release sem torná-la a versão padrão:

```bash
npm publish --tag next
```

### 7. Propagar as tags

```bash
git push origin main --follow-tags
```

---

## Verificação pós-publicação

```bash
npm view mede-cli version          # confirma a versão publicada
npx mede-cli@latest --help         # smoke test do pacote real
```

---

## Checklist rápido

- [ ] `main` atualizada e árvore limpa
- [ ] `typecheck`, `lint`, `test` e `build` verdes
- [ ] `CHANGELOG.md` atualizado para a nova versão
- [ ] `npm version <patch|minor|major>`
- [ ] `npm pack --dry-run` revisado
- [ ] `npm publish`
- [ ] `git push origin main --follow-tags`
- [ ] smoke test com `npx mede-cli@latest`

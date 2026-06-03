# Contribuindo com o MEDE-CLI

Obrigado pelo interesse em contribuir! Este guia descreve o fluxo de
desenvolvimento e os critérios de qualidade do projeto.

Antes de propor mudanças estruturais, recomenda-se compreender os princípios
metodológicos da **MEDE** e o fluxo causal adotado (veja o [readme.md](./readme.md)
e os artigos em `.conhecimento/`).

---

## Pré-requisitos

- **Node.js ≥ 20** (o CI valida em 20 e 22);
- **npm**;
- toolchain de compilação nativa para o `better-sqlite3` (Python 3 + compilador
  C++), caso não haja binário pré-compilado para o seu ambiente.

```bash
git clone https://github.com/mozaru/mede-cli.git
cd mede-cli
npm install
```

---

## Fluxo de desenvolvimento

```bash
npm run dev -- <comando>   # executa a CLI via tsx, sem build
npm run typecheck          # verificação de tipos
npm run lint               # ESLint
npm run lint:fix           # ESLint com correção automática
npm run format             # Prettier (escreve)
npm run format:check       # Prettier (somente verifica)
npm test                   # Vitest (uma vez)
npm run test:watch         # Vitest em watch
npm run build              # bundle de produção (tsdown)
```

---

## Critérios de qualidade (obrigatórios antes do PR)

Todo PR deve passar **integralmente** nos quatro portões, que também rodam no CI:

```bash
npm run typecheck
npm run lint        # zero erros e zero warnings
npm run format:check
npm test
```

Diretrizes adicionais:

- **Testes acompanham o código.** Correções de bug vêm com um teste que falha
  sem a correção; novas funcionalidades vêm com cobertura dos caminhos felizes e
  de erro. A cobertura é medida (`npm run test -- --coverage`) e não deve
  regredir abaixo dos limites configurados.
- **Sem `any` novo.** Prefira `unknown` + narrowing ou tipos explícitos.
- **Respeite as camadas.** A CLI não decide regra de negócio; o repositório não
  orquestra fluxo; a LLM não conhece o ciclo (veja os princípios no
  [CLAUDE.md](./CLAUDE.md) e em `arquitetura.md`).
- **Credenciais nunca em texto puro.** Sempre via variável de ambiente
  (`llm.apiKeyEnv`).
- **Não edite arquivos gerados.** O diretório `src-prisma/` é produzido por
  geração de código e está fora do escopo de lint/format.

---

## Mensagens de commit

Use mensagens curtas e descritivas, em português, no imperativo
(ex.: `adiciona teste de reconstrução de estado`). Agrupe mudanças coesas em um
único commit.

---

## Abrindo um Pull Request

1. Crie um branch a partir da `main`.
2. Garanta os quatro portões verdes localmente.
3. Atualize o `CHANGELOG.md` (seção `## [Não lançado]`) quando a mudança for
   relevante para usuários.
4. Descreva o **porquê** da mudança, não só o **o quê**.

---

## Reportando bugs e sugerindo melhorias

Use os templates de issue disponíveis. Para vulnerabilidades de segurança, **não
abra issue pública** — siga o [SECURITY.md](./SECURITY.md).

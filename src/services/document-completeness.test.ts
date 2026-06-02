import { describe, it, expect } from 'vitest'
import { parseDiff, applyDiff } from '../shared/diff.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Converts plain document content into a creation diff (new file from empty).
// Mirrors what a well-behaved LLM should return for a new document.
function makeDiff(content: string): string {
  const lines = content.trim().split('\n')
  const diffLines = lines.map(l => `+${l}`).join('\n')
  return `@@ -0,0 +1,${lines.length} @@\n${diffLines}`
}

// Applies all chunks from a diff to a base string and returns the result.
function applyAll(base: string, diffText: string): string {
  const chunks = parseDiff(diffText)
  let content = base
  let offset = 0
  for (const chunk of chunks) {
    const result = applyDiff(content, { ...chunk, offset })
    content = result.newContent
    offset += result.addedCount - result.removedCount
  }
  return content
}

// Asserts that all required sections are present in the document.
function assertSections(doc: string, sections: string[], label: string): void {
  for (const section of sections) {
    expect(doc, `[${label}] missing: "${section}"`).toContain(section)
  }
}

// ---------------------------------------------------------------------------
// Document fixtures — minimal but structurally complete content per type.
// Each fixture represents what a correct LLM response should produce.
// ---------------------------------------------------------------------------

const ATA_CONTENT = `
# Ata de Reunião – 2026-06-02

**Projeto:** Projeto Exemplo
**Tipo:** Alinhamento técnico
**Participantes:**
- Participante A

---

## 1. Objetivo

Alinhar decisões técnicas sobre o módulo de autenticação.

---

## 2. Contexto

O sistema está em fase inicial de desenvolvimento.

---

## 3. Pontos Discutidos e Decisões

### 3.1 Estratégia de autenticação

Foi discutida a adoção de JWT para sessões stateless.

**Decisões:**
- Adotar JWT com expiração de 1 hora.

---

## 4. Impactos

- Backend: implementar geração e validação de tokens.
- Frontend: armazenar token em memória.

---

## 5. Encaminhamentos

- Criar ADR sobre autenticação.
- Atualizar requisitos funcionais.

---

## 6. Observação Final

Esta ata registra as decisões tomadas. Alterações futuras devem ser formalizadas.
`.trim()

const ADR_CONTENT = `
# ADR-2026-06-02 — Estratégia de Autenticação

**Status:** Aceito
**Data:** 2026-06-02
**Contexto:** Sistema Exemplo
**Decisores:** Time de engenharia

---

## 1. Contexto

O sistema precisa de um mecanismo de autenticação seguro e stateless.

---

## 2. Decisão

Adotar JWT para autenticação de usuários.

### 2.1 Configuração do token

- Expiração de 1 hora para tokens de acesso.
- Refresh token com expiração de 7 dias.

---

## 3. Consequências

### 3.1 Consequências Positivas
- Stateless, sem armazenamento de sessão no servidor.

### 3.2 Consequências Negativas / Trade-offs
- Tokens não podem ser invalidados antes de expirar sem blocklist.

---

## 4. Alternativas Consideradas e Rejeitadas

### 4.1 Sessões no servidor
**Rejeitada porque:**
- Requer armazenamento de estado, aumentando complexidade.
`.trim()

const ESM_CONTENT = `
# ESM-2026-06-02 — Especificação de Manutenção do Sistema

**Projeto:** Sistema Exemplo
**Período de referência:** 2026-06-02
**Origem:** ATA
**Status:** Em análise

---

## 1. Objetivo

Formalizar correções e ajustes identificados na reunião de 2026-06-02.

---

## 2. Contexto

Foram identificados problemas de validação no módulo de cadastro.

---

## 3. Referências

- ata-2026-06-02.md

---

## 4. Controle de Intervenções

| ID | Natureza | Tipo | Nome | Origem | Entrega | Status |
| --- | --- | --- | --- | --- | --- | --- |
| — | — | — | — | — | — | — |

---

## 5. Itens de Manutenção

### ESM-20260602-RF-COR-0001

**Título:** Validação de e-mail duplicado no cadastro
**Tipo:** COR
**Natureza:** RF
**Tags:**
**Status:** Pendente
**Origem:** Ata
**Módulo:** Cadastro

#### Contexto

Usuários conseguem cadastrar o mesmo e-mail duas vezes.

#### Problema Atual

Ausência de validação de unicidade no cadastro.

#### Comportamento Esperado

O sistema deve rejeitar cadastros com e-mail já existente.

#### Critérios de Aceite

- Retornar erro 409 quando e-mail já cadastrado.

---

## 6. Observações

Nenhuma observação adicional.
`.trim()

const DELIVERY_LOG_CONTENT = `
# Registro de Entrega — Semana 01

**Sistema Exemplo**

Cliente: Cliente A
Fornecedor: Fornecedor B
Data de referência: **2026-06-02**
Semana: **01**
Tipo: **normal**

---

## Objetivo

Registrar as entregas da primeira semana de desenvolvimento.

---

## Entregas

| ID | Tipo | Nome | Origem | Status | MudouEm | ObservacaoEntrega ou Evidencia | FoiEntregueNoPeriodo | EhNovoNoPeriodo |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| — | — | — | — | — | — | — | — | — |

---

## Resultado

Semana focada em configuração inicial do projeto e arquitetura base.

---

## Novos

| ID | Tipo | Nome | Origem | Status |
| --- | --- | --- | --- | --- |
| — | — | — | — | — |

---

## Documentos

- ata-2026-06-02.md
- adr-2026-06-02.md

---

## Estatística

Total itens entregues: **0**
Total itens pendentes: **0**
Percentual de entrega: **0,0%**
`.trim()

const RF_CONTENT = `
# Requisitos Funcionais (RF)

## Sistema Exemplo

> **Status do documento:** Versão inicial
> **Observação importante:** Este documento descreve os requisitos funcionais conhecidos até o momento.

---

## RF-01 — Autenticação de Usuários

### Descrição

O sistema deve autenticar usuários com e-mail e senha.

### Regras

- Senha mínima de 8 caracteres.
- Bloqueio após 5 tentativas inválidas.

### Funcionalidades

- Login com e-mail e senha.
- Geração de token JWT.

### Fluxo

1. Usuário informa e-mail e senha.
2. Sistema valida credenciais.
3. Sistema retorna token JWT.

---

## RF-02 — Cadastro de Usuários

### Descrição

O sistema deve permitir cadastro de novos usuários.

### Regras

- E-mail deve ser único.
- Nome obrigatório.

---

## Considerações sobre Evoluções Pós-Entrega

Ajustes posteriores devem ser tratados via ESM.

---

## Consideração Final

Funcionalidades não descritas estão fora do escopo.
`.trim()

const RNF_CONTENT = `
# Requisitos Não Funcionais (RNF)

## Sistema Exemplo

> **Status do documento:** Versão inicial
> **Observação:** Este documento define os requisitos não funcionais já acordados.

---

## RNF-01 — Segurança

### Descrição

O sistema deve garantir autenticação segura e proteção de dados.

### Requisitos

- Senhas armazenadas com hash bcrypt.
- Comunicação exclusivamente via HTTPS.

### Métricas e Limites

- Token JWT com expiração de 1 hora.

---

## RNF-02 — Performance

### Descrição

O sistema deve responder dentro de limites aceitáveis.

### Requisitos

- Tempo de resposta inferior a 500ms em 95% das requisições.

---

## Consideração Final

Itens pendentes devem ser formalizados. Mudanças exigem atualização documental.
`.trim()

const DATA_MODEL_CONTENT = `
# Modelo de Dados

## Sistema Exemplo

> **Status:** Versão inicial
> **Objetivo:** Definir entidades e relacionamentos principais.

---

## 1. Visão Geral

O modelo é composto por entidades de identidade, domínio e auditoria.

---

## 2. Entidades Principais

### 2.1 Usuário (\`usuario\`)

Representa um usuário do sistema.

**Campos mínimos**

* \`id\` (PK)
* \`email\`
* \`senha_hash\`
* \`criado_em\`

**Regras**

* E-mail único por usuário.

---

## 3. Relacionamentos (Resumo)

* \`Usuario (1) -> (N) Sessao\`

---

## 4. Fluxos de Persistência e Importação

Não aplicável nesta versão.

---

## 5. Restrições e Índices Recomendados

### Restrições

* Unicidade de e-mail em \`usuario\`.

### Índices recomendados

* \`usuario.email\`

---

## 6. Auditoria e Segurança

Campos \`criado_em\` e \`atualizado_em\` em todas as entidades.

---

## 7. Itens Pendentes e Ajustes Futuros

- Definir modelo de sessão/refresh token.

---

## 8. Consideração Final

O modelo representa o estado atual. Ajustes devem ser formalizados.
`.trim()

const TIMELINE_CONTENT = `
# Cronograma do Projeto

## Sistema Exemplo

> **Status do cronograma:** Inicial
> **Observação:** Representa o planejamento atual.

---

## 1. Backlog Inicial do Projeto

O backlog foi construído a partir do entendimento inicial.

| ID | Tipo | Nome | Origem | Status |
| --- | --- | --- | --- | --- |
| — | — | — | — | — |

**Total inicial:** 0 itens.

---

## 2. Duração Total do Projeto

Duração prevista: 12 semanas.

---

## 3. Estrutura Geral de Entregas

O projeto é dividido em 3 fases: núcleo, gestão e estabilização.

---

## 4. Detalhamento das Entregas

### Entrega 1 – Núcleo Operacional

**Período:** Semanas 1 a 4

**Escopo incluído:**

* Autenticação
* Cadastro de usuários

**Dependências:**

* Validação do modelo de dados com o cliente.

**Riscos ou Observações:**

* Dependência de infraestrutura.

**Regras de aceite:**

* Login funcional com JWT.

---

## 5. Marcos Relevantes

- Semana 4: homologação do núcleo.
- Semana 12: go-live.

---

## 6. Regras Gerais de Aceite

O aceite ocorre mediante homologação do cliente.

---

## 7. Observação Final

Mudanças de cronograma exigem formalização.
`.trim()

const SCOPE_CONTENT = `
# Visão e Escopo

## Sistema Exemplo

> **Status do documento:** Inicial
> **Observação:** Descreve a visão geral, objetivos e limites do projeto.

---

## 1. Objetivo do Sistema

O sistema resolve o problema de gestão descentralizada de usuários.

---

## 2. Contexto do Projeto

O cliente utiliza planilhas para controle de acesso, gerando inconsistências.

---

## 3. Perfis de Usuário

### 3.1 Administrador

Responsável pela gestão de usuários e permissões.

---

## 4. Funcionalidades Incluídas no Escopo

### 4.1 Autenticação e Autorização

* Login com e-mail e senha.
* Controle de permissões por perfil.

---

## 5. Fora de Escopo

### 5.1 Integrações Externas

* Integração com sistemas legados não está prevista.

---

## 6. Premissas e Restrições

- Infraestrutura provida pelo cliente.
- Sem operação offline nesta versão.

---

## 7. Consideração Final

Apenas o que está descrito faz parte do escopo. Mudanças exigem formalização.
`.trim()

const CURRENT_STATE_CONTENT = `
# Situação Atual

**Sistema:** Sistema Exemplo
**Cliente:** Cliente A
**Fornecedor:** Fornecedor B
**Data de referência:** 2026-06-02
**Origem da consolidação:** Reunião de kick-off
**Ritmo de entrega:** Semanal

---

## 1. Resumo Analítico

Projeto em fase inicial. Sem itens entregues ainda.

---

## 2. Indicadores Consolidados

**Itens concluídos:** 0
**Itens pendentes:** 0

### Distribuição do backlog pendente

- Correções: 0
- Ajustes / UX: 0
- Evoluções Pendentes: 0

### Situação geral consolidada

* Escopo funcional originalmente contratado: em definição
* Fase atual: kick-off
* Principais temas em aberto: arquitetura base

---

## 3. Tabela Consolidada de Todos os Itens do Projeto

| ID | Descrição | Tags | Ata | Origem | Entrega | Status |
| --- | --- | --- | --- | --- | --- | --- |
| — | — | — | — | — | — | — |

---

## 4. Principais Pendências Atuais

| ID | Tipo | Nome | Origem | Situação Atual | Próximo Passo |
| --- | --- | --- | --- | --- | --- |
| — | — | — | — | — | — |

---

## 5. Evoluções em Avaliação ou Aguardando Formalização

Nenhuma no momento.

---

## 6. Riscos e Observações

- Arquitetura ainda em definição.

---

## 7. Consideração Final

Este documento representa o estado consolidado atual. Deve ser mantido atualizado.
`.trim()

const README_CONTENT = `
# Sistema Exemplo

Plataforma de gestão de usuários e controle de acesso.

## Visão Geral

O sistema resolve o problema de controle de acesso descentralizado.

* Autenticação via JWT
* Gestão de permissões por perfil
* API REST

## Funcionalidades

* Login e logout de usuários
* Cadastro de novos usuários
* Gestão de permissões

## Tecnologias Utilizadas

* Node.js
* TypeScript
* PostgreSQL
* Docker

## Pré-requisitos

* Node.js >= 20
* Docker >= 24

## Instalação

\`\`\`bash
git clone <repositorio>
npm install
\`\`\`

## Execução

\`\`\`bash
npm run dev
\`\`\`
`.trim()

const ENTENDIMENTO_INICIAL_CONTENT = `
# Entendimento Inicial do Projeto

Sistema Exemplo

Cliente: Cliente A
Fornecedor: Fornecedor B

Período de formação do entendimento: Janeiro/2026
Marco previsto de início das entregas operacionais: Março/2026

---

## 1. Objetivo do Documento

Este documento registra o entendimento inicial consolidado do projeto.
Ele representa a baseline inicial congelada e não substitui documentos evolutivos.

## 2. Contexto Geral do Projeto

O cliente necessita de uma plataforma centralizada de gestão de usuários.

## 3. Visão Inicial e Delimitação de Escopo

### 3.1 Objetivo Geral do Sistema

Centralizar o controle de acesso de usuários.

### 3.2 Principais Perfis de Usuário

- Administrador: gestão de usuários.
- Operador: uso do sistema.

### 3.3 Funcionalidades Inicialmente Incluídas

- Autenticação com JWT.
- Cadastro e gestão de usuários.

### 3.4 Itens Fora de Escopo

- Integrações com sistemas externos.

### 3.5 Premissas e Restrições Iniciais

- Infraestrutura provida pelo cliente.

## 4. Premissas Técnicas Fundamentais

### 4.1 Arquitetura tecnológica

API REST com Node.js e TypeScript.

### 4.2 Modelo de autenticação e conectividade

JWT stateless com expiração de 1 hora.

### 4.3 Estratégia de persistência e dados

PostgreSQL como banco principal.

### 4.4 Estratégia inicial de integrações

Sem integrações previstas nesta fase.

### 4.5 Premissas de infraestrutura e deploy

Docker + VPS do cliente.

## 5. Modelo Operacional Inicial

Operação multi-usuário com perfis diferenciados.

## 6. Modelo de Registro / Funcionamento Central

Usuários autenticados recebem token JWT para acesso às APIs.

## 7. Segurança e Observabilidade

Senhas com hash bcrypt. Logs de acesso.

## 8. Convenção de Identificação e Contadores Iniciais

### 8.1 Padrão de Identificação Formal

\`\`\`text
<DOC>-<AAAAMMDD>-<NAT>-<TIP>-<NNNN>
\`\`\`

### 8.2 Convenções

Natureza: RF, NF, RN, UX, OP, AR
Tipo: BLI, COR, AJU, EVO

### 8.3 Contadores Iniciais de Referência

| Tipo | Valor Inicial de Referência |
| ---- | --------------------------- |
| BLI  | 0                           |
| COR  | 0                           |
| AJU  | 0                           |
| EVO  | 0                           |

## 9. Planejamento Inicial e Backlog

| ID | Natureza | Tipo | Descrição | Tags | Origem | Status Inicial |
| -- | -------- | ---- | --------- | ---- | ------ | -------------- |

## 10. Planejamento Inicial das Entregas

### 10.1 Duração Total Prevista

12 semanas.

### 10.2 Estratégia Geral de Fases

3 fases: núcleo, gestão e estabilização.

### 10.3 Cronograma Inicial Resumido

| Entrega | Período | Objetivo | Itens Principais | Critério Inicial de Aceite | Dependências / Observações |
| ------- | ------- | -------- | ---------------- | -------------------------- | -------------------------- |

### 10.4 Detalhamento das Entregas

Fase 1 — Núcleo: semanas 1 a 4.

## 11. Início Previsto da Evolução Operacional

A partir da Entrega 1, semana 4.

## 12. Considerações Finais

Este documento é a referência inicial congelada do projeto.
`.trim()

// ---------------------------------------------------------------------------
// Required sections per document type
// ---------------------------------------------------------------------------

const REQUIRED: Record<string, string[]> = {
  ATA: [
    '## 1. Objetivo',
    '## 2. Contexto',
    '## 3. Pontos Discutidos e Decisões',
    '## 4. Impactos',
    '## 5. Encaminhamentos',
    '## 6. Observação Final',
  ],
  ADR: [
    '## 1. Contexto',
    '## 2. Decisão',
    '## 3. Consequências',
    '## 4. Alternativas Consideradas e Rejeitadas',
  ],
  ESM: [
    '## 1. Objetivo',
    '## 2. Contexto',
    '## 3. Referências',
    '## 4. Controle de Intervenções',
    '## 5. Itens de Manutenção',
    '## 6. Observações',
  ],
  'Delivery Log': [
    '## Objetivo',
    '## Entregas',
    '## Resultado',
    '## Novos',
    '## Documentos',
    '## Estatística',
  ],
  RF: [
    '## RF-01',
    '## Considerações sobre Evoluções Pós-Entrega',
    '## Consideração Final',
  ],
  RNF: [
    '## RNF-01',
    '## Consideração Final',
  ],
  'Modelo de Dados': [
    '## 1. Visão Geral',
    '## 2. Entidades Principais',
    '## 3. Relacionamentos (Resumo)',
    '## 4. Fluxos de Persistência e Importação',
    '## 5. Restrições e Índices Recomendados',
    '## 6. Auditoria e Segurança',
    '## 7. Itens Pendentes e Ajustes Futuros',
    '## 8. Consideração Final',
  ],
  Cronograma: [
    '## 1. Backlog Inicial do Projeto',
    '## 2. Duração Total do Projeto',
    '## 3. Estrutura Geral de Entregas',
    '## 4. Detalhamento das Entregas',
    '## 5. Marcos Relevantes',
    '## 6. Regras Gerais de Aceite',
    '## 7. Observação Final',
  ],
  'Visão e Escopo': [
    '## 1. Objetivo do Sistema',
    '## 2. Contexto do Projeto',
    '## 3. Perfis de Usuário',
    '## 4. Funcionalidades Incluídas no Escopo',
    '## 5. Fora de Escopo',
    '## 6. Premissas e Restrições',
    '## 7. Consideração Final',
  ],
  'Situação Atual': [
    '## 1. Resumo Analítico',
    '## 2. Indicadores Consolidados',
    '## 3. Tabela Consolidada de Todos os Itens do Projeto',
    '## 4. Principais Pendências Atuais',
    '## 5. Evoluções em Avaliação ou Aguardando Formalização',
    '## 6. Riscos e Observações',
    '## 7. Consideração Final',
  ],
  README: [
    '## Visão Geral',
    '## Funcionalidades',
    '## Tecnologias Utilizadas',
  ],
  'Entendimento Inicial': [
    '## 1. Objetivo do Documento',
    '## 2. Contexto Geral do Projeto',
    '## 3. Visão Inicial e Delimitação de Escopo',
    '## 4. Premissas Técnicas Fundamentais',
    '## 5. Modelo Operacional Inicial',
    '## 6. Modelo de Registro / Funcionamento Central',
    '## 7. Segurança e Observabilidade',
    '## 8. Convenção de Identificação e Contadores Iniciais',
    '## 9. Planejamento Inicial e Backlog',
    '## 10. Planejamento Inicial das Entregas',
    '## 11. Início Previsto da Evolução Operacional',
    '## 12. Considerações Finais',
  ],
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

const FIXTURES: Record<string, string> = {
  ATA: ATA_CONTENT,
  ADR: ADR_CONTENT,
  ESM: ESM_CONTENT,
  'Delivery Log': DELIVERY_LOG_CONTENT,
  RF: RF_CONTENT,
  RNF: RNF_CONTENT,
  'Modelo de Dados': DATA_MODEL_CONTENT,
  Cronograma: TIMELINE_CONTENT,
  'Visão e Escopo': SCOPE_CONTENT,
  'Situação Atual': CURRENT_STATE_CONTENT,
  README: README_CONTENT,
  'Entendimento Inicial': ENTENDIMENTO_INICIAL_CONTENT,
}

describe('Document completeness — pipeline: LLM diff response → final document', () => {
  for (const [docType, content] of Object.entries(FIXTURES)) {
    it(`${docType}: diff is parseable and applies cleanly`, () => {
      const diffText = makeDiff(content)
      const chunks = parseDiff(diffText)

      expect(chunks.length).toBeGreaterThan(0)

      const result = applyAll('', diffText)
      expect(result.length).toBeGreaterThan(0)
    })

    it(`${docType}: generated document contains all required sections`, () => {
      const result = applyAll('', makeDiff(content))
      assertSections(result, REQUIRED[docType], docType)
    })
  }

  it('detects missing sections (negative test)', () => {
    // A truncated ATA that is missing sections 2-6
    const incomplete = `# Ata de Reunião\n\n## 1. Objetivo\n\nConteúdo.`
    const result = applyAll('', makeDiff(incomplete))

    expect(result).toContain('## 1. Objetivo')
    expect(result).not.toContain('## 2. Contexto')
    expect(result).not.toContain('## 6. Observação Final')
  })

  it('update diff: preserves existing sections and adds new content', () => {
    // Simulate an update: document already has section 1, LLM adds section 2
    const existing = `# Ata\n\n## 1. Objetivo\n\nConteúdo existente.`
    const updateDiff = `@@ -3,3 +3,7 @@\n ## 1. Objetivo\n \n Conteúdo existente.\n+\n+## 2. Contexto\n+\n+Contexto adicionado.`
    const chunks = parseDiff(updateDiff)

    expect(chunks).toHaveLength(1)

    const result = applyAll(existing, updateDiff)
    expect(result).toContain('## 1. Objetivo')
    expect(result).toContain('## 2. Contexto')
    expect(result).toContain('Conteúdo existente.')
    expect(result).toContain('Contexto adicionado.')
  })
})

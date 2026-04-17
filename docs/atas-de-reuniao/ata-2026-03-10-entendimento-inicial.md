# ✅ ATA — Engenharia de Software 4.0 / Janus / MEDE

**Data:** 15/03/2026
**Tipo:** Reunião estratégica de definição de produto e linha de pesquisa
**Participantes:**

* Mozar Baptista da Silva
* Assistente técnico (IA)

---

# 1. Objetivo

Registrar decisões estratégicas relacionadas à:

* evolução do produto Janus (antigo Prisma)
* formalização da metodologia MEDE
* criação da ferramenta **mede-cli**
* definição de arquitetura de produto
* posicionamento open-source
* direção de pesquisa em Engenharia de Software 4.0

---

# 2. Contexto Atual

Foi apresentado o cenário atual de maturidade tecnológica:

## Janus

* Plataforma determinística de geração de backend
* Geração de:

  * banco de dados
  * repositories
  * services
  * entities
  * models
  * controllers
* Geração de integração frontend
* Uso em:

  * projetos reais de clientes
  * projetos internos
  * resolução massiva de problemas algorítmicos (beecrowd)

Conclusão:

👉 Janus já validado tecnicamente
👉 arquitetura determinística é diferencial forte
👉 backend determinístico tende a ser **commodity estrutural do futuro**

---

## Uso de LLM

* Geração de frontend via LLM mostrou melhor resultado que geração determinística
* LLM sendo usada para:

  * UI
  * documentação
  * atas
  * atualização de requisitos

Conclusão:

👉 **LLM + geração determinística é combinação estruturalmente correta**

---

## MEDE

* Metodologia prática de:

  * entendimento
  * decisão
  * documentação progressiva
  * controle epistemológico do projeto

Já validada comercialmente:

* cliente já treinado
* projeto real já vendido usando MEDE + Janus + LLM

Conclusão:

👉 MEDE já é **produto vendável**

---

# 3. Decisão de Produto

Foi decidido que:

### 3.1 Janus será produto principal de geração de software

Características estratégicas:

* motor determinístico
* arquitetura padronizada
* foco inicial backend
* frontend via integração com LLM

Posicionamento:

👉 **Engine de geração arquitetural**

---

### 3.2 MEDE será produto metodológico

Características:

* metodologia de decisão e rastreabilidade
* geração progressiva de documentação
* controle de mudanças via change-sets
* supervisão humana obrigatória

Posicionamento:

👉 **Framework operacional de engenharia**

---

### 3.3 mede-cli será produto de disseminação

Decisão:

Criar ferramenta CLI open-source para:

* registrar atas
* gerar entendimento inicial
* gerar change-sets
* controlar backlog
* integrar com LLMs

Fluxo principal definido:

```
init -> loop changes -> entendimento inicial

cycle -> loop changes -> ata -> loop changes -> ADR/ESM -> loop changes -> docs impactados
```

---

# 4. Arquitetura da Ferramenta mede-cli

Definições registradas:

## Estado do projeto

* controlado por diretório `.mede`
* persistência em SQLite
* change-sets como unidade de decisão

## Supervisão humana

Toda saída da LLM deve ser:

* apresentada como diff
* aprovada ou rejeitada
* aplicada somente após aprovação

## Comandos principais

* `mede init`
* `mede cycle`
* `mede status`
* `mede changes`
* `mede approve`
* `mede refine`

---

# 5. Decisão Tecnológica

Foi discutida a tecnologia ideal para implementação da CLI.

Conclusão estratégica:

👉 CLI deve ser construída em **TypeScript (Node)**

Motivos:

* integração natural com VSCode
* maior velocidade de desenvolvimento
* fácil distribuição via npm
* portabilidade
* facilidade de integração com LLM APIs

---

# 6. Roadmap de Produto

## Curto prazo

* mede-cli funcional
* plugin VSCode
* documentação MEDE consolidada
* melhoria do compilador Janus

## Médio prazo

* GUI (Tauri)
* marketplace de templates
* integração profunda com IDEs
* geração de artefatos completos de projeto

## Longo prazo

* Janus como engine universal
* MEDE como padrão metodológico
* linha acadêmica consolidada
* possível spin-off ou funding

---

# 7. Decisão de Licenciamento

Foi decidido:

👉 mede-cli será open-source sob **Apache 2.0**

Motivos:

* permite uso comercial
* protege patenteabilidade futura
* facilita adoção corporativa

---

# 8. Observação Estratégica Final

Foi reconhecido que existem três ativos estratégicos:

1. Janus (engine)
2. MEDE (metodologia)
3. Linha de pesquisa em Engenharia de Software 4.0

Conclusão registrada:

👉 O momento atual é crítico para consolidação desses ativos
👉 Existe possibilidade real de liderança tecnológica se houver execução rápida


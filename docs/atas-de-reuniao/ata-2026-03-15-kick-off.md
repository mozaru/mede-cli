# Ata de Kick-off – Desenvolvimento do MEDE-CLI

**Data:** 15/03/2026
**Projeto:** MEDE-CLI
**Tipo:** Reunião estratégica de início de desenvolvimento do produto
**Participantes:** Mozar Baptista da Silva

---

## 1. Objetivo da Reunião

Formalizar o início do desenvolvimento do produto **MEDE-CLI**, consolidando:

* visão do produto
* escopo inicial
* decisões arquiteturais já tomadas
* modelo operacional
* estratégia tecnológica
* estratégia de licenciamento
* roadmap inicial
* riscos identificados

Esta ata estabelece o **marco fundador do produto**.

---

## 2. Contexto Estratégico

Foi identificado que a engenharia de software está entrando em uma nova fase caracterizada por:

* massificação da geração automática de código
* aumento da participação de LLMs na produção de software
* redução do valor diferencial da escrita manual de código
* aumento da importância da decisão arquitetural e documental

Neste cenário, foi reconhecida a necessidade de uma ferramenta que permita:

* controle metodológico da evolução documental
* rastreabilidade de decisões
* supervisão humana sobre saídas de IA
* governança do entendimento do sistema

O MEDE-CLI nasce como resposta direta a esse contexto.

---

## 3. Definição do Produto

O **MEDE-CLI** será uma ferramenta de linha de comando destinada a:

* conduzir ciclos metodológicos de evolução documental
* registrar reuniões e decisões
* gerar propostas de alteração em documentos
* permitir revisão humana estruturada
* aplicar mudanças aprovadas no filesystem
* integrar-se a múltiplos provedores de LLM

O produto atuará como:

> **Motor operacional da metodologia MEDE.**

---

## 4. Modelo Operacional Definido

### 4.1 Unidade de evolução: ciclo metodológico

Foi definido que a evolução documental ocorrerá por meio de ciclos.

O comando principal será:

```bash
mede-cli cycle
```

Esse comando será responsável por:

* iniciar baseline quando necessário
* registrar evento ou reunião
* gerar change-sets
* conduzir pipeline metodológico
* encerrar ciclo quando não houver pendências

---

### 4.2 Change-set como unidade de decisão

Foi decidido que:

* toda alteração documental será proposta como change-set
* change-sets devem conter diffs claros
* nenhuma alteração será aplicada automaticamente

A evolução do projeto será sempre:

> **supervisionada por decisão humana.**

---

### 4.3 Supervisão humana obrigatória

Foi definido que:

* a LLM nunca altera diretamente arquivos
* toda saída deve ser apresentada como proposta
* o usuário deve aprovar ou rejeitar

Isso estabelece:

* segurança metodológica
* governança documental
* auditabilidade

---

### 4.4 Estado operacional local

Foi definido que:

* o sistema utilizará diretório `.mede/`
* persistência será feita em SQLite local
* este estado será considerado **efêmero**

O sistema deverá:

* reconstruir estado a partir da documentação persistente
* especialmente do documento de situação atual

---

## 5. Estrutura Funcional Inicial do CLI

Comandos essenciais definidos:

* `cycle`
* `status`
* `changes`
* `approve`
* `reject`
* `refine`

Outros comandos poderão surgir conforme evolução.

---

## 6. Configuração do Produto

Foi definido que:

* o projeto utilizará arquivo `mede.config.json`
* este arquivo permitirá:

  * configurar LLM
  * configurar prompts por fase
  * configurar idioma documental
  * mapear artefatos
  * definir diretórios
  * definir prefixos

---

## 7. Tecnologia de Implementação

Foi decidido que a primeira versão será desenvolvida em:

> **TypeScript + Node.js**

Motivos:

* velocidade de desenvolvimento
* integração natural com VSCode
* portabilidade
* distribuição simples via npm
* facilidade de integração com APIs de LLM

---

## 8. Estratégia de Licenciamento

Foi decidido que o produto será:

> **Open-source sob licença Apache 2.0**

Objetivos:

* facilitar adoção
* permitir uso comercial
* proteger direitos futuros
* fomentar comunidade

---

## 9. Roadmap Inicial

### Curto prazo

* implementar núcleo do ciclo metodológico
* implementar engine de change-sets
* implementar integração básica com LLM
* implementar reconstrução de estado
* disponibilizar versão CLI funcional

### Médio prazo

* plugin para VSCode
* melhoria da experiência de revisão
* suporte a múltiplos modelos locais
* estruturação do repositório open-source

### Longo prazo

* interface gráfica
* integração com pipelines de desenvolvimento
* evolução da metodologia MEDE
* adoção acadêmica e corporativa

---

## 10. Riscos Identificados

* complexidade excessiva na primeira versão
* dependência forte de qualidade de prompts
* curva de adoção metodológica
* risco de o produto ser percebido apenas como gerador de documentação
* necessidade de validação real em projetos maiores

---

## 11. Critério de Sucesso Inicial

O produto será considerado validado quando:

* for possível conduzir ciclo completo em projeto real
* for possível gerar baseline documental
* for possível registrar reunião e atualizar documentos
* houver pelo menos um projeto externo utilizando o fluxo completo

---

## 12. Consideração Final

Foi formalmente iniciado o desenvolvimento do MEDE-CLI.

O produto será construído como:

* ferramenta open-source
* motor metodológico
* suporte operacional à engenharia de software orientada à decisão

Esta ata marca o início da fase de implementação prática.

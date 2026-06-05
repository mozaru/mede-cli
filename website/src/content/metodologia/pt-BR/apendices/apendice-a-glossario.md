---
title: "Apêndice A — Glossário"
order: 0
---

# Apêndice A — Glossário

Termos usados ao longo deste livro, organizados alfabeticamente.

---

**ADR (Architecture Decision Record)**
Registro de Decisão Arquitetural. Artefato congelado que preserva uma decisão estrutural com contexto, alternativas descartadas e consequências esperadas. Produzido quando uma decisão tem impacto duradouro na estrutura do sistema e provavelmente será questionada ou precisará ser justificada no futuro. Imutável após consolidação.

**Ata**
Registro formal do evento decisório — o único ponto de entrada causal de mudanças no projeto. Consolida o que foi relevante num ciclo: o que aconteceu, o que foi decidido, e qual é o impacto esperado sobre os demais artefatos. Não é transcrição de reunião. Imutável após consolidação.

**Baseline congelada**
Ver: *Entendimento inicial*.

**Cadeia causal**
A possibilidade de percorrer, em qualquer direção, o caminho entre um evento real e os artefatos que ele gerou — e vice-versa. Dado um documento vivo, encontrar a ata que o originou. Dada uma ata, encontrar todos os documentos que ela modificou. A cadeia causal é o que torna um projeto epistemologicamente observável.

**Camada causal**
A primeira das quatro camadas conceituais da MEDE, sustentada pelas atas. Registra eventos decisórios e é o ponto de origem de todas as mudanças nos demais artefatos.

**Camada de consolidação**
A quarta camada conceitual da MEDE, sustentada pelos documentos vivos. Reflete o estado atual e integrado da solução.

**Camada estrutural**
A segunda camada conceitual da MEDE, sustentada pelos ADRs. Preserva decisões com impacto arquitetural duradouro.

**Camada evolutiva**
A terceira camada conceitual da MEDE, sustentada pelos ESMs. Formaliza mudanças em transição — decididas mas ainda não consolidadas nos documentos vivos.

**Ciclo documental**
Unidade operacional da MEDE. Período entre duas consolidações formais do conhecimento do projeto. Não é necessariamente uma semana — é definido pelo volume de eventos relevantes que ocorreram. Identificado por data e número sequencial (000, 001, 002...). Todos os artefatos produzidos num mesmo ciclo compartilham o mesmo número.

**Complexidade essencial**
Conceito de Fred Brooks: a dificuldade inerente de compreender o problema que o software resolve — independente da tecnologia usada para implementá-lo. A complexidade essencial não diminui com linguagens melhores ou ferramentas mais rápidas. A MEDE trata da governança do conhecimento produzido ao enfrentar essa complexidade.

**Documento congelado**
Artefato histórico imutável após consolidação. Representa uma fotografia semântica do entendimento num momento específico. Inclui atas, ADRs, ESMs consolidados, logs de entrega e o entendimento inicial. Nunca é alterado — se algo precisa ser corrigido ou complementado, um novo artefato é criado.

**Documento vivo**
Artefato que reflete o estado atual e consolidado da solução. Evolui de forma controlada — apenas como resultado de ciclos documentais formais, nunca por edição avulsa. Inclui visão e escopo, requisitos funcionais, requisitos não funcionais, modelo de dados, cronograma, situação atual e README.

**Dívida epistemológica**
O acúmulo de lacunas no conhecimento disponível sobre um sistema — decisões sem justificativa registrada, mudanças sem rastro, regras de negócio que existem apenas na memória de quem as criou. Diferente da dívida técnica (visível no código), a dívida epistemológica só aparece quando alguém precisa fazer algo com o código e descobre que não entende o suficiente para fazê-lo com segurança.

**Entropia documental**
O acúmulo silencioso de ambiguidades, inconsistências e desalinhamentos entre artefatos — resultado da ausência de um processo estruturado de preservação do conhecimento.

**Entendimento inicial**
Documento especial criado no ciclo zero e nunca alterado. Registra o melhor entendimento disponível no início do projeto: problema, premissas, modelo operacional, backlog inicial, cronograma inicial. Funciona como linha de base imutável contra a qual a evolução do projeto pode ser medida. Fisicamente na raiz de `docs/`, mas conceitualmente um documento congelado desde o instante em que foi criado.

**ESM (Especificação de Manutenção do Sistema)**
Artefato da camada evolutiva. Formaliza mudanças decididas que ainda não estão consolidadas nos documentos vivos — correções, ajustes, novas regras, evoluções funcionais identificadas em operação real. Não é backlog: seus itens têm origem causal rastreável e não podem ser descartados silenciosamente. Imutável após consolidação.

**Governança do conhecimento**
A camada de prática que a MEDE ocupa no ecossistema de engenharia de software — transversal às camadas de execução técnica, organização do trabalho e arquitetura/domínio. Trata de quando, como e o que documentar para que o conhecimento produzido durante o desenvolvimento sobreviva às mudanças inevitáveis de equipe, contexto e tecnologia.

**ID de item**
Identificador único e imutável de um item de backlog ou ESM. Segue o padrão `DOC-AAAAMMDD-NNN-NAT-TIP-NNNN`. Nunca é renomeado, mesmo que a convenção evolua — a consistência histórica tem prioridade sobre a uniformidade de formato.

**LEG (Log de Entregas)**
Registro do que foi efetivamente entregue em cada ciclo, com rastreabilidade até os itens de backlog correspondentes. Produzido no encerramento de cada ciclo.

**MEDE**
Metodologia de Engenharia Documental Evolutiva. Camada transversal de governança do conhecimento que define quando, como e o que registrar — para que o conhecimento produzido durante o desenvolvimento do software sobreviva às mudanças inevitáveis de equipe, contexto e tecnologia.

**mede-cli**
Ferramenta open source de linha de comando que implementa o ciclo documental da MEDE com assistência de LLMs, mantendo supervisão humana em cada etapa. Disponível em `github.com/mozaru/mede-cli`.

**Navegabilidade sem orientação**
Princípio de organização do espaço documental: qualquer pessoa que chegue ao projeto pela primeira vez deve conseguir entender o que é, onde está e como chegou até aqui, percorrendo os documentos na ordem sugerida pela própria estrutura — sem depender de ninguém estar disponível para orientar.

**Observabilidade epistemológica**
A capacidade de inferir o estado do entendimento da solução, identificar onde existem ambiguidades ou decisões pendentes, e compreender a trajetória que levou ao estado atual — a partir dos registros documentais, sem precisar perguntar às pessoas. Análogo ao conceito de observabilidade em sistemas distribuídos, aplicado ao processo de construção do software.

**Princípio da imutabilidade**
Regra central da MEDE: artefatos históricos — atas, ADRs, ESMs consolidados, logs de entrega, entendimento inicial — nunca são alterados após consolidação. Se algo precisa ser corrigido ou complementado, um novo artefato é criado. A imutabilidade é o que torna os documentos históricos confiáveis como evidência.

**Situação atual**
Documento vivo que contém a síntese consolidada do estado do projeto no ciclo atual. É o primeiro documento que alguém novo deve ler — responde "onde o projeto está agora?" de forma direta e completa. Atualizado ao final de cada ciclo.

**Staging semântico**
Área temporária de acumulação de evidências brutas durante um ciclo — notas de reunião, decisões informais, transcrições, rascunhos. Não é documentação MEDE formal: é o insumo que alimenta a consolidação da ata ao final do ciclo. Pode ser um diretório de arquivos temporários, um documento de rascunho, qualquer repositório informal de material bruto.

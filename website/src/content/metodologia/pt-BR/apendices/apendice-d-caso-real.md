---
title: "Apêndice D — O Caso Real Anonimizado: Documentos Selecionados"
order: 0
---

# Apêndice D — O Caso Real Anonimizado: Documentos Selecionados

Este apêndice reproduz, com comentários, uma seleção de artefatos reais do projeto usado como caso ao longo da Parte IV. Os nomes do cliente e da contratada foram omitidos. O sistema, a documentação e as decisões são reais.

O objetivo não é fornecer documentação completa do projeto — é mostrar como os artefatos MEDE aparecem na prática, com as imperfeições, formatos em evolução e decisões reais que exemplos construídos não têm.

---

## D.1 — Entendimento Inicial (excerto)

*Criado em janeiro de 2026. Nunca alterado.*

> **Premissas Técnicas Fundamentais**
>
> **Arquitetura tecnológica**
> O sistema adota arquitetura cliente-servidor baseada em aplicações web.
> Tecnologias definidas:
> - Backend: ASP.NET Core Web API (.NET 8)
> - Frontend: Angular com biblioteca PrimeNG
>
> **Modelo de autenticação e conectividade**
> O sistema opera em modelo *online-first*, exigindo autenticação com conectividade ativa.
> Após autenticação válida, o agente pode executar operações durante curtos períodos de instabilidade de rede, com posterior sincronização.

**Comentário:** a premissa de conectividade — "curtos períodos de instabilidade" — seria contestada pela realidade de campo três semanas depois. O entendimento inicial registra o que se sabia em janeiro, não o que se descobriria em fevereiro. Essa é exatamente a função do documento: preservar o ponto de partida, não o ponto de chegada.

---

## D.2 — Ata de Kickoff, 13 de janeiro de 2026 (excerto)

*Ata do ciclo 000. Primeiro artefato histórico do projeto.*

> **Stack Tecnológico**
> Durante a reunião, foi informado e alinhado que a solução seria desenvolvida com a seguinte stack:
> - Backend: .NET 8 (ASP.NET Core Web API)
> - Frontend: Angular 20 + PrimeNG
>
> Essa definição foi apresentada como base técnica para viabilizar o desenvolvimento dentro do prazo contratual e atender aos requisitos de robustez, segurança e governança.
>
> **Autenticação e Acesso**
> Foi esclarecido que:
> - O login no sistema será obrigatoriamente online, para todos os perfis
> - A autenticação inicial sempre exige conectividade
> - Usuários bloqueados devem perder acesso imediatamente

**Comentário:** a ata registra a decisão de autenticação online como requisito de segurança e controle operacional. Essa mesma decisão seria parcialmente revisada no ADR de offline-first — mas a revisão não apagou esta ata. A trajetória completa ficou visível: o projeto começou com autenticação online obrigatória, e em fevereiro formalizou uma exceção para operação de campo prolongada.

---

## D.3 — ADR de Stack Tecnológica, 13 de janeiro de 2026 (excerto)

*Primeiro ADR do projeto. Gerado a partir da ata de kickoff.*

> **Contexto**
> O projeto demanda um sistema web corporativo com:
> - Perfis distintos (Admin/Supervisor/Agente) e RBAC
> - Execução em desktop (gestão) e tablet (campo)
> - Operação com conectividade variável, mas com autenticação online obrigatória
> - Auditoria e rastreabilidade de ações
>
> **Decisão**
> Backend: .NET 8 (ASP.NET Core Web API)
> Frontend: Angular 20 + PrimeNG
> Estrutura de repositório: monorepo (`/backend`, `/frontend`, `/docs`)
> Autenticação: login obrigatoriamente online para todos os perfis
>
> **Alternativas consideradas e rejeitadas**
> - Backend em Node.js / Java / Python: rejeitado por não ser a stack decidida e por aumentar risco de prazo e padronização
> - Frontend em React / Vue: rejeitado em favor do Angular por consistência arquitetural
> - Repositórios separados: rejeitado por risco de desalinhamento de versões durante entregas semanais
> - Login offline: rejeitado por risco de segurança e inconsistência de permissões
>
> **Consequências (trade-offs aceitos)**
> - Dependência de conectividade no momento do login (campo)
> - Monorepo exige disciplina mínima de organização
> - PrimeNG impõe padrão visual; customizações profundas custam mais

**Comentário:** note a seção "Alternativas consideradas e rejeitadas" — especificamente "Login offline: rejeitado por risco de segurança". Três semanas depois, a realidade de campo levou a uma decisão parcialmente diferente. O ADR original não foi alterado — um novo ADR foi criado, formalizando a revisão. A tensão entre as duas decisões ficou visível no acervo.

---

## D.4 — Ata de 19 de janeiro de 2026 (excerto)

*Decisões via WhatsApp e telefone — formalizadas em ata no mesmo dia.*

> **Estrutura organizacional**
> - A entidade Área será removida do modelo de dados
> - A hierarquia operacional fica definida como: Base de Operação → Setor Censitário → Endereço
> - A associação entre Supervisor e Base de Operação será do tipo N:N
>
> **Perfil Gestor**
> - O perfil Gestor não será criado
> - O perfil Administrador acumula funções administrativas e gerenciais
>
> **Motivo:** redução de escopo e tempo de desenvolvimento, confirmado pelo cliente

**Comentário:** esta ata é um bom exemplo do que formatos tradicionais perdem. A conversa aconteceu por WhatsApp e telefone — sem a ata, existiria apenas como mensagem num aplicativo, invisível para quem não estava na conversa. A ata preservou o conteúdo, os participantes, as decisões e o motivo — tudo num formato rastreável e persistente.

---

## D.5 — ADR de Offline-First, 2 de fevereiro de 2026 (completo)

*A maior decisão arquitetural do projeto. Invalida parcialmente o entendimento inicial.*

> **Status:** Aceito
>
> **Contexto**
> Os agentes de campo operam em ambientes com conectividade instável ou inexistente.
> O sistema precisa funcionar de forma confiável nesses cenários sem perda de dados.
> Em 02/02/2026 foi definido que o módulo de vistorias deve operar de forma offline-first, com sincronização assíncrona com o servidor.
>
> **Decisão**
>
> Banco Local
> - O aplicativo deve manter um banco de dados local por usuário
> - Endereços e vistorias devem permanecer armazenados no dispositivo
> - O logout do usuário remove apenas os dados daquele usuário
>
> Sincronização
> - As vistorias devem ser enviadas ao servidor em background
> - Cada registro deve possuir status de sincronização: Pendente de envio | Enviado
> - O agente pode editar um endereço mesmo após envio, o que gera um novo envio
>
> Modelo de Vistoria
> - Para cada endereço existe no máximo uma vistoria ativa no servidor
> - Ao editar um endereço já vistoriado: a vistoria existente deve ser atualizada; os dados anteriores devem ser registrados em log histórico
> - Não deve ser criada uma nova vistoria para cada edição
>
> Endereços Duplicados e Inclusão em Lote
> - Endereços criados por duplicação ou inclusão de prédios existem apenas localmente até serem confirmados
> - Só são enviados ao servidor quando a vistoria é confirmada
>
> **Consequências**
> - Backend deve suportar: atualização de vistorias existentes; histórico de alterações
> - Frontend deve: indicar status de sincronização; garantir que nenhuma informação seja perdida em modo offline
> - O sistema passa a ter consistência eventual entre dispositivo e servidor
> - O fluxo de campo se torna resiliente a falhas de conectividade

**Comentário:** este ADR é o artefato mais importante do projeto. Ele documenta a maior revisão de entendimento — a passagem de *online-first* para *offline-first* — com precisão suficiente para que qualquer desenvolvedor que chegue ao projeto depois entenda não apenas o que foi decidido, mas por que, e quais são as implicações técnicas de cada parte da decisão.

Compare com o ADR de stack, que registrava "Login offline: rejeitado". Os dois ADRs, lidos em conjunto, mostram a trajetória completa: a decisão original e sua revisão parcial, com os contextos que motivaram cada uma.

---

## D.6 — ESM de 24 de fevereiro de 2026 (excerto representativo)

*Especificação produzida após operação real em campo. 9 correções, 12 ajustes, 7 regras, 7 evoluções.*

> **Identificador:** ESM-2026-02-24
> **Origem:** Reunião operacional com equipe de campo (23/02/2026) + Relatório recebido em 24/02/2026
>
> **Objetivo:** Formalizar solicitações operacionais identificadas durante o uso real do sistema em campo. Os itens aqui descritos representam o comportamento esperado do sistema após a implementação, não necessariamente o comportamento atual.
>
> **Correções (seleção)**
>
> COR-001 — Autenticação — Persistência incorreta do CPF no login
> Comportamento esperado: O CPF deve conter apenas o valor formatado do documento do usuário.
>
> COR-003 — Termos de Uso — Checkbox de aceite não responde ao clique
> Comportamento esperado: Clique direto no checkbox deve alterar o estado.
>
> COR-008 — Vistoria — Vistoria offline perde dados ao expirar token
> Comportamento esperado: O sistema deve preservar os dados locais e solicitar reautenticação antes de qualquer sincronização.

**Comentário:** note a formulação de cada item — "comportamento esperado", não "bug" ou "o que está errado". Isso é deliberado: o ESM especifica o que o sistema deve fazer, não apenas o que está acontecendo de errado. Um desenvolvedor que lê o ESM tem especificação de implementação, não apenas relato de problema. Note também a rastreabilidade: cada item tem ID próprio, e o documento inteiro tem origem na ata da reunião de 23/02 — a cadeia causal está preservada.

---

## D.7 — Situação Atual, 6 de março de 2026 (excerto)

*Documento vivo ao final do projeto. Atualizado no último ciclo.*

> **Indicadores consolidados**
> Itens concluídos: 81
> Itens pendentes: 19
>
> Distribuição do backlog pendente:
> - Correções: 6
> - UX/Ajustes: 11
> - Evoluções: 2
>
> [Tabela com 100 itens rastreados, cada um com ID, tipo, nome, origem e situação]

**Comentário:** compare este documento com o entendimento inicial, que listava 32 itens. O crescimento de 32 para 100 é o aprendizado documentado do projeto — cada item tem origem identificável (escopo inicial, ata específica, ESM específico). Não há itens "que apareceram do nada". A situação atual é o estado consolidado do projeto ao final — e o entendimento inicial é preservado intacto, como testemunho do ponto de partida.

---

## Nota sobre as convenções do caso

Os artefatos deste projeto usam convenções que diferem ligeiramente do padrão formalizado na Parte III. Os IDs de backlog (`BL-001`, `BL-002`) e de ESM (`COR-001`, `UX-001`) são anteriores ao padrão estruturado (`ESM-AAAAMMDD-NNN-NAT-TIP-NNNN`). Os nomes de diretórios (`atas-de-reuniao/`, `decisoes-arquiteturais/`) diferem ligeiramente da estrutura de referência (`atas/`, `adr/`).

Isso é real e deliberadamente preservado. A metodologia emergiu do uso — o padrão formal apresentado neste livro é a consolidação do que foi aprendido durante e após este projeto. A imperfeição não compromete a rastreabilidade fundamental: cada artefato tem origem clara, cada mudança tem ata correspondente, e qualquer pessoa pode percorrer a trajetória do projeto do início ao fim.

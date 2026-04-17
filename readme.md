# MEDE-CLI

**MEDE-CLI** é uma ferramenta de linha de comando para **evolução documental causal assistida por LLMs**, baseada na metodologia **MEDE (Metodologia de Evolução Documental Estruturada)**.

O objetivo do projeto é permitir que a documentação de engenharia de software evolua de forma **supervisionada, rastreável e consistente**, acompanhando decisões reais de projeto ao longo do tempo.

---

## ✦ Motivação

Projetos de software frequentemente enfrentam:

* documentação desatualizada ou inconsistente;
* decisões arquiteturais não registradas;
* perda de entendimento do estado real do sistema;
* divergência entre código, decisões e documentação;
* uso descontrolado de LLMs para geração de conteúdo técnico.

O MEDE-CLI organiza a evolução documental como um **processo causal estruturado**, no qual mudanças são propostas, analisadas e aprovadas antes de serem aplicadas.

---

## ✦ Conceito Central

Toda alteração documental no MEDE-CLI é tratada como um **change-set pendente**.

A ferramenta:

* propõe mudanças estruturadas;
* organiza ciclos de revisão;
* aplica alterações somente após aprovação humana.

Nenhuma modificação é realizada automaticamente.

---

## ✦ Princípios de Projeto

* Supervisão humana obrigatória.
* Evolução documental orientada por causalidade.
* Separação entre documentação histórica e documentação viva.
* Estado do projeto sempre reconstruível.
* Independência de fornecedor de LLM.
* Arquitetura open-source extensível.
* Compatibilidade com fluxos reais de engenharia.

---

## ✦ Ciclo Metodológico

O comando central do projeto é:

### `mede-cli cycle`

Ele inicia um ciclo metodológico supervisionado de evolução documental do projeto.

O comportamento depende do estado atual:

* se o projeto ainda não possui base documental → inicia a criação da baseline;
* se já existe baseline → inicia um novo ciclo de evolução documental.

O ciclo trabalha com etapas sequenciais e dependentes entre si.

### Ordem do ciclo

1. geração de ata;
2. geração de ADR;
3. geração de ESM;
4. geração de log de entrega (LEG);
5. atualização de requisitos funcionais;
6. atualização de requisitos não funcionais;
7. atualização do modelo de dados;
8. atualização do cronograma;
9. atualização de visão e escopo;
10. atualização do README;
11. atualização da situação atual do projeto.

### Dependências entre etapas

Cada etapa utiliza apenas os documentos relevantes para aquele tipo de geração ou atualização.

```text
ATA
- apenas contexto do projeto e instrução do usuário

ADR
- ATA

ESM
- ATA

LEG
- ATA + ESM

requisitos-funcionais.md
- ATA + ADR

requisitos-nao-funcionais.md
- ATA + ADR

modelo-de-dados.md
- ATA + ADR + requisitos-funcionais.md + requisitos-nao-funcionais.md

cronograma.md
- ATA + ADR + ESM + requisitos-funcionais.md + requisitos-nao-funcionais.md + modelo-de-dados.md

visao-e-escopo.md
- ATA + ADR + requisitos-funcionais.md + requisitos-nao-funcionais.md + modelo-de-dados.md

readme.md
- ATA + ADR + visao-e-escopo.md

situacao-atual.md
- ATA + ADR + requisitos-funcionais.md + requisitos-nao-funcionais.md + modelo-de-dados.md + visao-e-escopo.md
```

A mesma lógica pode ser lida de forma resumida assim:

```text
ATA -> ADR
ATA -> ESM
ATA + ESM -> LEG
ATA + ADR -> requisitos-funcionais.md
ATA + ADR -> requisitos-nao-funcionais.md
ATA + ADR + requisitos-funcionais.md + requisitos-nao-funcionais.md -> modelo-de-dados.md
ATA + ADR + ESM + requisitos-funcionais.md + requisitos-nao-funcionais.md + modelo-de-dados.md -> cronograma.md
ATA + ADR + requisitos-funcionais.md + requisitos-nao-funcionais.md + modelo-de-dados.md -> visao-e-escopo.md
ATA + ADR + visao-e-escopo.md -> readme.md
ATA + ADR + requisitos-funcionais.md + requisitos-nao-funcionais.md + modelo-de-dados.md + visao-e-escopo.md -> situacao-atual.md
```

### Artefatos produzidos no ciclo

Durante um ciclo, o MEDE-CLI pode:

* gerar atas de reunião (`min-*`);
* propor decisões arquiteturais (`adr-*`);
* propor especificações de evolução/manutenção (`esm-*`);
* propor logs de entrega (`leg-*`);
* sincronizar documentos vivos;
* atualizar cronograma, visão e escopo, README e situação atual.

### Regras de progressão

Se uma etapa não produzir conteúdo relevante:

* artefatos opcionais podem ser ignorados;
* diffs vazios não geram atualização.

Ainda assim, a passagem para a próxima etapa depende de ação explícita do usuário.

Cada fase só avança após resolução dos change-sets pendentes.

---

## ✦ Modelo Transacional do Ciclo

Cada etapa possui seu próprio ciclo interno:

1. a LLM gera uma proposta inicial;
2. o usuário pode refinar quantas vezes quiser;
3. o usuário pode aprovar ou rejeitar;
4. após aprovação ou rejeição, a etapa seguinte é preparada.

### Comportamento por etapa

Na etapa de ATA:

* `approve` avança para a próxima fase;
* `reject` encerra o ciclo.

Nas demais etapas:

* `approve` aceita a proposta atual e avança;
* `reject` ignora a proposta atual e avança;
* mesmo artefatos vazios podem ser aprovados ou rejeitados.

Cada etapa mantém:

* histórico de refinamentos;
* mensagens trocadas com a LLM;
* arquivos anexados;
* change-sets pendentes;
* estado do artefato atual.

---

## ✦ Commit e Rollback

Ao iniciar um ciclo, o MEDE-CLI cria um snapshot completo de todos os documentos vivos.

Exemplos:

```text
readme.md
situacao-atual.md
requisitos-funcionais.md
requisitos-nao-funcionais.md
modelo-de-dados.md
cronograma.md
visao-e-escopo.md
```

Também entram no snapshot quaisquer outros documentos marcados como living documents pela ontologia do projeto.

Não entram no snapshot:

```text
ata-*
adr-*
esm-*
leg-*
```

Esses documentos históricos são apenas criados durante o ciclo.

### `mede-cli commit`

Finaliza o ciclo e mantém todos os arquivos aprovados.

Após commit:

* o snapshot é descartado;
* os artefatos históricos permanecem;
* os documentos vivos permanecem atualizados;
* o ciclo é encerrado.

### `mede-cli rollback`

Restaura integralmente o estado anterior ao ciclo.

Após rollback:

* todos os documentos vivos voltam ao snapshot inicial;
* artefatos históricos criados no ciclo são removidos;
* documentos vivos criados durante o ciclo são removidos;
* o ciclo é encerrado.

---

## ✦ Comandos Disponíveis

### `mede-cli init`

Cria a baseline operacional e a configuração inicial do projeto.

```bash
mede-cli init -p "contexto adicional" -f "file1;dir;file2"
```

Parâmetros:

* `-p`, `--prompt`: prompt adicional enviado à LLM;
* `-f`, `--files`: arquivos ou diretórios adicionados ao contexto.

---

### `mede-cli cycle`

Inicia um novo ciclo metodológico.

```bash
mede-cli cycle -p "ajustes desejados" -f "ata.txt;docs/"
```

Parâmetros:

* `-p`, `--prompt`
* `-f`, `--files`

---

### `mede-cli status`

Mostra o estado operacional atual do ciclo.

Exemplo:

```text
Cycle: aberto
Phase: ATA
Artifact: ata-2026-04-04.md
State: aguardando approve/reject
Proposal: não vazia
Refinements: 3
Changed files: 1
Created files: 1
Auto-approve: não

Available actions:
- refine
- approve
- reject
- rollback
```

---

### `mede-cli refine`

Refina a etapa atual.

```bash
mede-cli refine -p "explique melhor a decisão" -f "reuniao.md"
mede-cli refine -r
```

Parâmetros:

* `-p`, `--prompt`
* `-f`, `--files`
* `-r`, `--reset`

O reset:

* limpa histórico da conversa;
* limpa anexos;
* remove change-sets pendentes;
* restaura o artefato da etapa;
* remove arquivos criados pela etapa.

---

### `mede-cli approve`

Aprova a etapa atual.

```bash
mede-cli approve
mede-cli approve -a
```

Parâmetros:

* `-a`, `--all`: aprova automaticamente todas as etapas seguintes.

---

### `mede-cli reject`

Rejeita a etapa atual.

```bash
mede-cli reject
mede-cli reject -a
```

Parâmetros:

* `-a`, `--all`: rejeita automaticamente todas as etapas seguintes.

---

### `mede-cli pending`

Lista os trecho-diff pendentes do change-set atual.

Exemplo:

```text
[1] requisitos-funcionais.md
replace lines 10-18
status: pending

[2] requisitos-funcionais.md
insert after line 44
status: pending
```

---

### `mede-cli apply`

Aplica trecho-diff pendente.

```bash
mede-cli apply
mede-cli apply -a
```

---

### `mede-cli discard`

Descarta trecho-diff pendente.

```bash
mede-cli discard
mede-cli discard -a
```

---

### `mede-cli files`

Lista os arquivos alterados ou criados no ciclo atual.

```bash
mede-cli files
mede-cli files -b
```

Parâmetros:

* `-b`, `--backup`: mostra os arquivos do snapshot inicial.

---

### `mede-cli diff`

Mostra o diff do arquivo informado.

```bash
mede-cli diff readme.md
```

---

### `mede-cli cat`

Mostra o conteúdo do arquivo informado.

```bash
mede-cli cat readme.md
mede-cli cat readme.md -b
```

---

### `mede-cli llm providers`

Lista os provedores compatíveis.

---

### `mede-cli llm test`

Executa um prompt isolado sem afetar o contexto atual.

```bash
mede-cli llm test -p "explique este requisito"
```

---

### `mede-cli config`

Mostra o conteúdo atual da configuração.

---

### `mede-cli config init`

Cria `mede.config.json` caso ainda não exista.

---

### `mede-cli config apply`

Aplica alterações feitas manualmente no arquivo de configuração.

---

## ✦ Semântica dos Níveis de Operação

```text
Nível trecho-diff:
- pending
- apply
- discard

Nível etapa:
- refine
- refine --reset
- approve
- reject

Nível ciclo:
- cycle
- commit
- rollback
```

---

## ✦ Convenções de Backlog, Situação Atual e Rastreabilidade

O MEDE-CLI diferencia:

* itens em formação de conhecimento;
* backlog formal rastreável;
* registros históricos imutáveis.

Durante entendimento inicial e atas, os itens ainda podem ser reorganizados, fundidos, cancelados ou reclassificados.

Por isso, documentos como:

* `entendimento-inicial.md`
* atas (`min-*`)

registram apenas:

* descrição;
* natureza;
* tipo de intervenção;
* tags opcionais.

O identificador definitivo e imutável surge apenas quando o item passa a existir formalmente no backlog operacional do projeto, em documentos como:

* `esm-*`;
* `leg-*`;
* `situacao-atual.md`.

### Padrão de identificação formal

```text
<DOC>-<AAAAMMDD>-<NAT>-<TIP>-<NNNN>
```

Exemplos:

```text
DEI-20260201-RF-BLI-0001
ESM-20260301-RF-COR-0001
ESM-20260301-UX-AJU-0003
ESM-20260301-AR-EVO-0002
LEG-20260310-OP-COR-0002
SAT-20260315-AR-EVO-0001
```

### Convenções

```text
Natureza:
RF = requisito funcional
NF = requisito não funcional
RN = regra de negócio
UX = interface / experiência
OP = operação
AR = arquitetura / integração / dados

Tipo:
BLI = backlog inicial
COR = correção
AJU = ajuste
EVO = evolução
```

### Tags auxiliares

```text
HOT
PERF
SEC
MIG
```

### Status possíveis

```text
Pendente
Cancelado
Concluído
Esclarecido
Aguardando
```

Os identificadores formais são imutáveis e devem permanecer estáveis ao longo do tempo, mesmo que descrição, status ou classificação evoluam.

O documento `situacao-atual.md` representa a visão consolidada e vigente do backlog rastreável do projeto.

### Exemplo de tabela em `situacao-atual.md`

```text
ID                       | Descrição                                         | Tags        | Ata          | Origem               | Entrega      | Status
DEI-20260201-RF-BLI-0001 | Autenticação online por CPF e senha               |             | ata-20260101 | entendimento-inicial | leg-20260206 | Concluído
ESM-20260301-UX-AJU-0003 | Regra de habilitação do campo Tipo de Edificação  |             | ata-20260301 | esm-20260301         |              | Pendente
ESM-20260301-AR-EVO-0002 | Paginação da listagem de endereços                | MIG, PERF   | ata-20260301 | esm-20260301         |              | Pendente
ESM-20260220-OP-COR-0004 | Remoção de setor de agente em ambiente offline    | HOT         | ata-20260220 | esm-20260220         | leg-20260228 | Concluído
```

---

## ✦ Estado Operacional

O estado operacional do MEDE-CLI é armazenado no diretório:

```text
.mede/
```

Este diretório contém:

* fila de change-sets pendentes;
* metadados da conversa ativa;
* base SQLite local.

O diretório é **efêmero** e pode ser removido.
O estado do projeto deve ser reconstruível a partir da documentação persistente.

---

## ✦ Configuração, Provedores de LLM e Ontologia Documental

O MEDE-CLI permite o uso de diferentes provedores de modelos de linguagem, configuráveis por projeto:

* OpenAI
* Anthropic
* Ollama (modelos locais)
* APIs compatíveis
* modelos proprietários futuros

A configuração é realizada no arquivo:

```text
mede.config.json
```

Ela permite:

* seleção de modelo por fase metodológica;
* operação offline;
* controle de custos;
* adequação a requisitos corporativos.

Internamente, o MEDE-CLI trabalha com tipos documentais estáveis.

O projeto pode configurar:

* nomes de arquivos;
* estrutura de diretórios;
* prefixos documentais;
* idioma dos documentos;
* prompts metodológicos.

Essa abordagem desacopla a lógica da metodologia da representação física da documentação.

---

## ✦ Estrutura Documental Esperada

```text
docs/
 ├── entendimento-inicial.md
 ├── readme.md
 ├── situacao-atual.md
 ├── requisitos-funcionais.md
 ├── requisitos-nao-funcionais.md
 ├── modelo-de-dados.md
 ├── cronograma.md
 ├── visao-e-escopo.md
 ├── atas/
 ├── adr/
 ├── esm/
 └── log-entregas/
```

---

## ✦ Exemplo de Uso (conceitual)

```text
mede-cli cycle

mede-cli status

mede-cli pending

mede-cli approve
```

---

## ✦ Status do Projeto

O MEDE-CLI encontra-se em fase inicial de desenvolvimento.

Focos atuais:

* engine de change-sets;
* pipeline causal de evolução documental;
* abstração de provedores de LLM;
* reconstrução de estado do projeto;
* experiência operacional via CLI.

---

## ✦ Roadmap Inicial

* implementação funcional do comando `cycle`;
* gerenciamento completo de change-sets;
* reconstrução de estado a partir da documentação;
* configuração multi-LLM;
* suporte a modo offline;
* plugin para VSCode;
* interface gráfica futura.

---

## ✦ Visão

O MEDE-CLI é o primeiro passo para um novo paradigma de engenharia de software, no qual:

* documentação evolui junto com o sistema;
* decisões são preservadas como conhecimento estruturado;
* LLMs operam sob governança metodológica;
* geração de código e evolução documental convergem em um fluxo unificado de engenharia.

---

## ✦ Licença

Este projeto está licenciado sob a **Apache License 2.0**.

Consulte o arquivo `LICENSE` para mais detalhes.

---

## ✦ Contribuições

Contribuições são bem-vindas.

Antes de propor mudanças estruturais, recomenda-se compreender os princípios metodológicos da MEDE e o fluxo causal adotado pelo projeto.

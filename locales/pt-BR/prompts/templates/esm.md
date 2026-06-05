
# ESM-<AAAA-MM-DD> — Especificação de Manutenção do Sistema

**Projeto:** <NOME DO PROJETO>
**Período de referência:** <DATA OU CICLO>
**Origem:** <ATA, RELATÓRIO, INCIDENTE, HOMOLOGAÇÃO, CHAMADO, OPERAÇÃO>
**Status:** <Em análise | Aprovado | Em andamento | Concluído>

---

## 1. Objetivo

Descrever:
- por que este ESM foi criado;
- quais problemas, correções, ajustes ou evoluções motivaram sua criação;
- qual comportamento esperado se deseja obter após implementação.

---

## 2. Contexto

Descrever:
- situação atual do sistema;
- origem das solicitações;
- impactos percebidos;
- relação com atas, ADRs, homologações, operação em campo ou backlog anterior;
- restrições relevantes.

---

## 3. Referências

Listar, quando existirem:
- atas;
- ADRs;
- requisitos;
- relatórios;
- chamados;
- homologações;
- backlog anterior;
- situação atual;
- documentos técnicos.

---

## 4. Controle de Intervenções

##TABELA_INTERVENCAO##

---

## 5. Itens de Manutenção

Cada item deve possuir identificador formal e imutável.

Formato obrigatório do identificador:

<DOC>-<AAAAMMDD>-<NAT>-<TIP>-<NNNN>

Exemplos:

- ESM-20260301-RF-COR-0001
- ESM-20260301-UX-AJU-0002
- ESM-20260301-AR-EVO-0003

---

### <IDENTIFICADOR>

**Título:** <TÍTULO CURTO E OBJETIVO>  
**Tipo:** <BLI | COR | AJU | EVO>  
**Natureza:** <RF | NF | RN | UX | OP | AR>  
**Tags:** <HOT | PERF | SEC | MIG | vazio>  
**Status:** <Pendente | Aguardando | Concluído | Cancelado | Esclarecido>  
**Origem:** <Ata, homologação, incidente, operação, ADR, chamado>  
**Módulo:** <ÁREA, MÓDULO OU COMPONENTE IMPACTADO>  

#### Contexto

Descrever:
- como o problema ou necessidade foi identificado;
- sintomas observados;
- quem é impactado;
- quando ocorre;
- impactos percebidos.

#### Problema Atual

Descrever claramente:
- qual comportamento está incorreto, ausente ou insuficiente;
- quais regras atuais estão falhando;
- quais limitações existem.

#### Comportamento Esperado

Descrever:
- como o sistema deve funcionar após a intervenção;
- regras operacionais;
- validações;
- restrições;
- mensagens;
- comportamento offline;
- sincronização;
- persistência;
- permissões;
- exceções.

#### Impactos Técnicos

Indicar impacto em:
- frontend;
- backend;
- banco de dados;
- sincronização;
- integração;
- observabilidade;
- logs;
- segurança;
- performance;
- infraestrutura;
- documentação;
- testes.

#### Critérios de Aceite

- ...
- ...
- ...

#### Dependências

Listar:
- dependência de outro item;
- dependência de ADR;
- dependência de requisito;
- dependência de homologação;
- dependência de modelo de dados;
- dependência de deploy;
- dependência de validação do cliente.

---

## 6. Observações

Registrar:
- limites deste ESM;
- itens fora de escopo;
- itens ainda exploratórios;
- dependências contratuais;
- necessidade de novos ESMs;
- necessidade de ADR complementar;
- riscos pendentes.

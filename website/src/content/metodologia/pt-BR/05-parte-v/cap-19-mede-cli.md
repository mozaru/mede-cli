---
title: "A ferramenta que automatiza o ciclo"
order: 19
---

# Capítulo 19 — A ferramenta que automatiza o ciclo

Executar o ciclo documental manualmente é viável. Em projetos com ritmo moderado, uma equipe disciplinada consegue manter a cadência sem ferramentas específicas: um editor de texto, um repositório Git, e o hábito de reservar tempo ao final de cada ciclo para a consolidação.

**A MEDE não depende do mede-cli. O mede-cli apenas reduz o atrito de aplicar a metodologia.**

Mas há um atrito real. Percorrer as onze etapas do ciclo — da ata até a situação atual — exige atenção, consistência e tempo. Em projetos com ritmo acelerado, especialmente com uso intensivo de ferramentas de geração de código, esse atrito pode ser suficiente para que o ciclo escorregue: a consolidação fica para depois, "depois" não chega, e a dívida epistemológica começa a se acumular de novo.

O mede-cli existe para remover esse atrito sem remover a supervisão humana que é o coração da metodologia.

---

## O que é o mede-cli

O mede-cli é uma ferramenta de linha de comando open source que implementa o ciclo documental da MEDE com assistência de LLMs.

- **npm:** `https://www.npmjs.com/package/mede-cli`
- **GitHub:** `https://github.com/mozaru/mede-cli`
- **Instalação:** `npm install -g mede-cli`
- **Licença:** Apache 2.0

O princípio central é simples e não negocia com a metodologia:

> A ferramenta propõe. O humano decide. O ciclo consolida.

Nenhuma modificação nos documentos do projeto é realizada automaticamente. O mede-cli gera propostas com base no contexto do projeto e no material do ciclo; o responsável revisa, refina quantas vezes quiser, e aprova ou rejeita cada etapa antes de avançar.

---

## Como o ciclo funciona com o mede-cli

O fluxo básico de um ciclo assistido pelo mede-cli é:

```
Material bruto do ciclo (staging semântico)
            ↓
mede-cli gera proposta para cada etapa
            ↓
humano revisa e refina (quantas vezes precisar)
            ↓
humano aprova ou rejeita a etapa
            ↓
mede-cli aplica o change-set aprovado
            ↓
próxima etapa — até concluir o ciclo
            ↓
commit (confirma) ou rollback (desfaz tudo)
```

Cada etapa do ciclo — ata, ADR, ESM, log de entregas, documentos vivos, situação atual — segue esse mesmo padrão. O humano nunca perde o controle do que está sendo escrito nos documentos do projeto.

---

## Um exemplo mínimo de uso

Para dar concretude ao que a ferramenta faz na prática, um ciclo típico após uma reunião de revisão:

```bash
# Iniciar o ciclo com o contexto da reunião
mede-cli cycle -p "revisão de 09/06: mudança na sincronização offline"

# Ver em qual etapa está e o que foi proposto
mede-cli status

# A proposta de ata não capturou um ponto importante
mede-cli refine -p "registrar impacto da mudança sobre operação em campo"

# Aprovar a ata e avançar para o ADR
mede-cli approve

# Não houve decisão arquitetural neste ciclo — rejeitar a etapa ADR
mede-cli reject

# Aprovar as demais etapas em sequência
mede-cli approve   # ESM
mede-cli approve   # LEG
mede-cli approve -a  # aprovar automaticamente as restantes

# Revisar o que mudou antes de confirmar
mede-cli files
mede-cli diff situacao-atual.md

# Confirmar o ciclo
mede-cli commit
```

Isso não é um manual — é uma ilustração do ritmo de trabalho. Os comandos exatos e as opções disponíveis estão na documentação do repositório, que evolui com cada versão.

---

## O que a ferramenta faz — e o que não faz

**Faz:**
- Percorre as etapas do ciclo MEDE em sequência, com dependências respeitadas
- Gera propostas de conteúdo com base no staging semântico e nos documentos existentes
- Suporta múltiplos provedores de LLM (OpenAI, Anthropic, Ollama, Google, Azure e outros)
- Mantém snapshot dos documentos vivos para rollback completo se necessário
- Confirma mudanças apenas quando o responsável executa o commit

**Não faz:**
- Decidir o que foi relevante no ciclo — isso é do responsável
- Criar ADRs automaticamente — a etapa pode ser rejeitada se não há decisão arquitetural
- Substituir o julgamento sobre quando o entendimento realmente mudou
- Garantir que a documentação está correta — garante apenas que está estruturada

---

## MEDE e IA: a documentação como contexto

Existe um benefício adicional que emerge da combinação da MEDE com ferramentas de desenvolvimento assistido por IA.

Quando a documentação MEDE está bem estruturada e atualizada — `readme.md`, `situacao-atual.md`, ADRs recentes, visão e escopo — ela pode ser usada como contexto para qualquer ferramenta de geração de código. Um agente que lê esses documentos antes de começar a trabalhar parte de uma base de conhecimento governada, não de uma folha em branco.

O princípio se aplica tanto ao mede-cli quanto a qualquer outra ferramenta: o agente consulta a documentação; o humano decide o que fazer com as sugestões; o ciclo consolida o que foi decidido.

---

## O que fica fora deste livro

Instalação passo a passo, referência completa de comandos, configuração de provedores de LLM, exemplos avançados de uso — tudo isso está na documentação do repositório e no tutorial online, que evoluem junto com as versões da ferramenta.

Não faz sentido reproduzir aqui o que vai mudar a cada release. O que importa entender é o princípio: o mede-cli é a MEDE operacionalizada como software. Quem entende a metodologia entende por que a ferramenta funciona do jeito que funciona — e consegue usá-la bem mesmo quando os comandos específicos mudarem.

---

> **Em resumo**
>
> O mede-cli é uma ferramenta open source de linha de comando que implementa o ciclo documental da MEDE com assistência de LLMs. Seu princípio é inegociável: a ferramenta propõe, o humano decide, o ciclo consolida. A MEDE não depende do mede-cli — a ferramenta apenas reduz o atrito de aplicar a metodologia em projetos de ritmo intenso. O fluxo básico: staging semântico → proposta gerada → revisão humana → aprovação → change-set aplicado → commit ou rollback. Detalhes técnicos e referência de comandos vivem na documentação do repositório, que evolui com a ferramenta.

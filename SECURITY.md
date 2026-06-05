# Política de Segurança

## Versões suportadas

O MEDE-CLI está na versão estável (linha `1.x.x`). Correções de
segurança são aplicadas sobre a versão mais recente publicada no npm.

| Versão  | Suportada |
| ------- | --------- |
| 1.x.x   | ✅        |
| < 1.0   | ❌        |

## Reportando uma vulnerabilidade

**Não abra uma issue pública** para vulnerabilidades de segurança.

Envie os detalhes por e-mail para **mozar.silva@gmail.com** com:

- descrição da vulnerabilidade e do impacto potencial;
- passos para reproduzir (proof of concept, se houver);
- versão do MEDE-CLI, do Node.js e do sistema operacional.

Você receberá uma confirmação de recebimento em até **5 dias úteis**. Após a
triagem, combinaremos um prazo de correção e de divulgação coordenada.

## Boas práticas de segurança da ferramenta

- **Credenciais de LLM nunca são gravadas em texto puro.** O `mede.config.json`
  armazena apenas o *nome* da variável de ambiente (`llm.apiKeyEnv`); a chave em
  si vive no ambiente do usuário.
- **O estado operacional em `.mede/` é local e efêmero.** Não inclua esse
  diretório em commits nem o compartilhe — ele pode conter trechos de documentos
  em processamento.
- **Conteúdo enviado a provedores de LLM externos sai da sua máquina.** Avalie a
  sensibilidade da documentação antes de usar provedores em nuvem; para dados
  sensíveis, prefira um provedor local (ex.: Ollama).

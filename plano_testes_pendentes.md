# Plano de Implementação de Testes Faltantes

Este documento apresenta o mapeamento dos testes unitários ausentes na arquitetura do **mede-cli** (com foco especial nas alterações recentes de internacionalização e resolução de prompts) e descreve o plano detalhado para implementá-los.

---

## 1. Mapeamento de Gaps de Testes

Atualmente, o projeto possui excelente cobertura de testes de integração e cenários E2E (com 262 testes no Vitest), porém existem lacunas em testes unitários isolados para serviços fundamentais da aplicação:

| Serviço | Módulo Testado | Cobertura Atual | Gap Identificado |
| :--- | :--- | :--- | :--- |
| **PhaseConversationService** | `phase-conversation-service.ts` | Indireta (E2E / LLM cycles) | Ausência de teste unitário para validar prioridade de resolução do config/fallback. |
| **LlmPromptsProvider** | `llm-prompts-provider.ts` | Parcial | Validar a hierarquia de 3 níveis de resolução de prompts (.mede/prompts -> locales -> fallback). |
| **ConfigService** | `config-service.ts` | Indireta (E2E / CLI Handler) | Ausência de testes unitários para a geração de configuração padrão e fluxo de renomeação de arquivos (`apply`). |
| **InitService** | `init-service.ts` | Indireta (E2E) | Ausência de testes unitários testando inicialização isolada, criação de caminhos e marcação de fase. |
| **StatusService** | `status-service.ts` | Indireta (E2E) | Ausência de testes unitários para a geração de relatórios de status. |

---

## 2. Detalhamento dos Novos Testes

### 2.1. Testes de `PhaseConversationService`
**Arquivo**: [phase-conversation-service.test.ts](file:///D:/projetos/11Tech%20-%20Projetos/Engernharia%20de%20software/mede-cli/src/application/services/phase-conversation-service.test.ts)
* **Objetivo**: Garantir o funcionamento da prioridade na resolução de prompts a nível de serviço de conversação.
* **Cenários**:
  * Validar a prioridade de resolução: `config.systemPrompts` / `config.prompts` -> fallback nos valores estáticos importados de `LlmPrompts`.
  * Garantir que, se o prompt estiver definido na configuração (não vazio), ele seja preferencialmente retornado.
  * Garantir que, se o prompt não estiver na configuração (ou estiver vazio), ele utilize os valores estáticos de fallback (`LlmPrompts.SYSTEM_PROMPT_*` / `LlmPrompts.USER_PROMPT_*`).

### 2.2. Testes da Hierarquia de Resolução de Prompts no `LlmPromptsProvider`
**Arquivo**: [llm-prompts-provider.test.ts](file:///D:/projetos/11Tech%20-%20Projetos/Engernharia%20de%20software/mede-cli/src/infrastructure/llm/llm-prompts-provider.test.ts)
* **Objetivo**: Testar a hierarquia de resolução dinâmica de prompts implementada no provedor de prompts.
* **Cenários**:
  * **Nível 1 (Customização Local)**: Validar que busca o prompt em `.mede/prompts/` antes de qualquer outra localização.
  * **Nível 2 (Pacote/Idioma Selecionado)**: Validar que, se não houver arquivo local, busca no diretório de assets de tradução do pacote `locales/<lang>/prompts/` com base no idioma ativo.
  * **Nível 3 (Fallback Default)**: Validar que, se não houver tradução no idioma ativo, cai de volta para `locales/pt-BR/prompts/`.

### 2.3. Testes Unitários de `ConfigService`
**Arquivo**: [config-service.test.ts](file:///D:/projetos/11Tech%20-%20Projetos/Engernharia%20de%20software/mede-cli/src/application/services/config-service.test.ts)
* **Objetivo**: Testar operações de configuração de forma isolada, mitigando riscos de mascaramento de erros usando infraestrutura real para operações de renomeação.
* **Cenários**:
  * `init()`: Validar que gera um arquivo `mede.config.json` válido contendo `"language": "pt-BR"` e sem o campo obsoleto `localesDir`.
  * `apply()` com filesystem real:
    > [!IMPORTANT]
    > Não utilizar mocks de filesystem para o teste do método `apply()`. Implementar os testes usando caminhos reais em um diretório temporário (e.g. via `fs.mkdtemp`) para garantir que problemas de caminhos, permissões e renomeação (`rename`) sob diferentes sistemas operacionais (Windows vs Unix) não sejam mascarados por mocks de repositório.
    * Validar que renomeia arquivos e pastas de documentação caso o usuário mude os nomes ou o prefixo na configuração.
    * Verificar normalização de caminhos (barras unix `/` e barras windows `\`).

### 2.4. Testes Unitários de `InitService`
**Arquivo**: [init-service.test.ts](file:///D:/projetos/11Tech%20-%20Projetos/Engernharia%20de%20software/mede-cli/src/application/services/init-service.test.ts)
* **Objetivo**: Validar de forma isolada e unitária o fluxo de inicialização do serviço `InitService`.
* **Cenários**:
  * **Criação de Diretórios Históricos e de Base**: Validar que chama `ensureDirectory` para todas as pastas de artefatos definidas na configuração (`meetingMinutes`, `architecturalDecisions`, `systemMaintenanceSpecifications`, `deliveryLog`).
  * **Criação dos Arquivos Base**: Validar que chama `ensureFile` para os arquivos padrão de fase (`initialUnderstanding`, `readme`, `currentState`, `scopeAndVision`, `functionalRequirements`, `nonFunctionalRequirements`, `dataModel`).
  * **Inserção de Prompt como Artifact Info**: Validar que, se o parâmetro `prompt` for fornecido na inicialização, insere um artefato do tipo `info` e nome `prompt` com o conteúdo original no repositório de artefatos do ciclo.
  * **Marcação de Estado da Fase (Empty/NonEmpty)**:
    * Se `changeSet` retornado for `null` ou não possuir chunks, a fase deve ser marcada como `empty` no repositório.
    * Se possuir chunks, deve marcar a fase como `nonEmpty`.
  * **Retorno e Formatação de Status**: Validar que o serviço retorna o status textual chamando `statusService.generate` com as entidades corretas correspondentes à nova fase criada.

### 2.5. Testes Unitários de `StatusService`
**Arquivo**: [status-service.test.ts](file:///D:/projetos/11Tech%20-%20Projetos/Engernharia%20de%20software/mede-cli/src/application/services/status-service.test.ts)
* **Objetivo**: Validar a geração correta de relatórios do terminal.
* **Cenários**:
  * Validar que o relatório de status preserva o idioma/`documentationLanguage` do projeto e cobre corretamente todos os textos, estados das fases, do ciclo, e ações disponíveis geradas.
  
  > [!NOTE]
  > Os rótulos e mensagens textuais de status (como `"aguardando refine"`, `"vazia"`, etc.) estão atualmente hardcoded em português. Se o objetivo futuro for suportar a tradução total e dinâmica desses rótulos de status com base na localização atual do sistema, isso deve ser planejado como uma **melhoria de implementação no próprio StatusService**, e não apenas coberto por testes.

---

## 3. Cronograma de Execução

1. **Fase 1**: Criar [phase-conversation-service.test.ts](file:///D:/projetos/11Tech%20-%20Projetos/Engernharia%20de%20software/mede-cli/src/application/services/phase-conversation-service.test.ts) e testar a prioridade de resolução do config vs fallback.
2. **Fase 2**: Atualizar [llm-prompts-provider.test.ts](file:///D:/projetos/11Tech%20-%20Projetos/Engernharia%20de%20software/mede-cli/src/infrastructure/llm/llm-prompts-provider.test.ts) para validar rigorosamente a resolução em 3 níveis (local -> pacote locale -> default pt-BR).
3. **Fase 3**: Criar [config-service.test.ts](file:///D:/projetos/11Tech%20-%20Projetos/Engernharia%20de%20software/mede-cli/src/application/services/config-service.test.ts) usando diretório temporário real para validar o método `apply`.
4. **Fase 4**: Criar [init-service.test.ts](file:///D:/projetos/11Tech%20-%20Projetos/Engernharia%20de%20software/mede-cli/src/application/services/init-service.test.ts) cobrindo criação de pastas/arquivos, inserção de prompt info, transição empty/non-empty e retorno de status.
5. **Fase 5**: Criar [status-service.test.ts](file:///D:/projetos/11Tech%20-%20Projetos/Engernharia%20de%20software/mede-cli/src/application/services/status-service.test.ts) validando a cobertura de textos/estados e a preservação do idioma do projeto.
6. **Fase 6**: Executar a suíte de testes e validação com linter.

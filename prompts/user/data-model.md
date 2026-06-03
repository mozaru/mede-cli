
Crie ou revise o documento de modelo de dados com base no contexto desta fase.

Prioridades desta geração:
1. consolidar claramente as entidades e relacionamentos principais;
2. registrar regras de persistência, unicidade e integridade;
3. separar entidades operacionais, domínio, auditoria e staging;
4. preservar coerência com requisitos, ADRs, ESMs e entendimento inicial;
5. manter o documento claro, técnico e útil para implementação.

Ao produzir a proposta, avalie principalmente:
- quais entidades são realmente necessárias;
- quais campos mínimos precisam existir;
- quais relacionamentos precisam ser documentados;
- quais tabelas de domínio precisam existir;
- quais regras de unicidade e integridade precisam ser registradas;
- quais fluxos de importação, sincronização e auditoria impactam o modelo;
- quais pontos ainda dependem de validaação futura.

Use o modelo estrutural padrão de modelo de dados.

Produza somente o unified git diff do documento atual.
Se nenhuma alteração for necessária, responda exatamente com:
NO_CHANGES

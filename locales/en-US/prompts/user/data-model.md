Create or revise the data model document based on the context of this phase.

Priorities of this generation:
1. clearly consolidate the main entities and relationships;
2. record persistence, uniqueness, and integrity rules;
3. separate operational, domain, auditing, and staging entities;
4. preserve coherence with requirements, ADRs, ESMs, and initial understanding;
5. keep the document clear, technical, and useful for implementation.

When producing the proposal, evaluate mainly:
- which entities are actually necessary;
- which minimum fields need to exist;
- which relationships need to be documented;
- which domain tables need to exist;
- which uniqueness and integrity rules need to be recorded;
- which import, synchronization, and auditing flows impact the model;
- which points still depend on future validation.

Use the standard structural model for data model.

Produce only the unified git diff of the current document.
If no changes are required, respond exactly with:
NO_CHANGES

---
title: "The 11-Step Causal Cycle"
order: 3
description: "The 11 sequential transactional steps in a MEDE cycle"
---

The evolution of documentation in the MEDE methodology does not occur randomly or in an ad-hoc manner. It is governed by a **causal transactional cycle**, structured in up to 11 consecutive logical phases.

## The Execution Flow

Each phase has a unique responsibility and generates the context needed for the next phase to be generated dynamically and assisted by AI.

1. **MIN (Meeting Minutes):** The starting point of any evolution. It registers raw context, discussions, and decisions made.
2. **ADR (Architectural Decision Record):** Derived from the Minutes, it formalizes crucial architectural decisions under a technical and immutable standard.
3. **ESM (System Maintenance Specification):** Derived from the Minutes, it specifies low-level technical maintenance tasks to be performed on the solution.
4. **LEG (Delivery Log):** Consolidation of changes in relation to the minutes and maintenance specifications.
5. **Functional Requirements:** Updating or creating live functional requirements derived from the Minutes and ADRs.
6. **Non-Functional Requirements:** Updating non-functional requirements (performance, security, scalability) based on the ADRs.
7. **Data Model:** Updating tables, schemas, and relationships derived from the Minutes, ADRs, and new Functional Requirements.
8. **Timeline (Timeline):** Physical delivery estimates based on the technical scope generated in the previous phases.
9. **Scope and Vision:** Consolidation of business alignment and system boundaries.
10. **README:** Updating the introductory document and execution instructions of the user's project.
11. **Current State:** The main historical reference and traceability document describing the consolidated state of the solution at the end of the cycle.

## Causal Integrity

The sequential order of these phases is not arbitrary. It reflects logical engineering dependencies:

> **Why is the Minutes the first phase?** Because meetings or business decisions are the **primary cause** of any engineering changes.
>
> **Why is the Data Model the 7th phase?** Because you cannot define database persistence without first deciding the architecture (ADR - Phase 2) and business scope (Functional Requirements - Phase 5).

## The Cycle in the Terminal

Each cycle acts as an atomic transaction managed by the CLI tool. The developer starts the cycle, advances phase by phase reviewing AI proposals, applies change chunks, and finalizes the cycle, consolidating the new technical truth of the system.

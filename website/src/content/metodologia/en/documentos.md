---
title: "Live vs. Historical Documents"
order: 2
description: "The difference between live documents and historical artifacts in MEDE"
---

To organize system knowledge in a didactical and sustainable manner, the MEDE methodology divides documentation into two distinct groups with completely different lifecycles: **Live Documents** and **Historical Artifacts**.

## 1. Live Documents

Represent the **consolidated and current truth of the system** at any given point in time. They change, get rewritten, and evolve continuously with each cycle. If a new developer reads these files today, they will understand exactly how the system behaves right now.

### List of MEDE Live Documents:
* **`readme.md`:** The project gateway and operational execution instructions.
* **`current-state.md`:** The detailed description and general architectural map of the system at the present moment.
* **`scope-and-vision.md`:** Business objectives alignment, system boundaries, and limits.
* **`functional-requirements.md`:** The inventory of rules and capabilities the system executes.
* **`non-functional-requirements.md`:** Quality attributes (performance, security, portability).
* **`data-model.md`:** The logical modeling of database tables and persistence flows.
* **`timeline.md`:** The planning of estimated physical deliveries.

## 2. Historical Artifacts

Represent the **logbook or journal** of the project. They are **static and immutable**: once created and signed off in a cycle, they must never be altered. They record the story of why the system changed.

### List of MEDE Historical Artifacts:
* **`min-*.md` (Meeting Minutes):** Records what was discussed on a specific date.
* **`adr-*.md` (Architectural Decision Records):** Records which technical pattern was chosen and which alternatives were rejected in a given cycle.
* **`esm-*.md` (System Maintenance Specification):** Records the scope of the low-level maintenance specified for the cycle.
* **`leg-*.md` (Delivery Log):** Formally records what was built and validated in relation to the initial specification.

## The Dynamics of Evolution

In a MEDE evolution cycle, the historical artifacts of the current cycle (the new Minutes, ADR, and ESM) are used as **causal context**. The AI analyzes these immutable records and proposes changes (effects) on the corresponding Live Documents.

> **Example:** If a new **Meeting Minute** decides to include two-factor authentication, these minutes (historical) will trigger modifications in the live **Functional Requirements** and **Data Model** files.

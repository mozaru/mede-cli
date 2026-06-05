---
title: "Document Motivation & Purpose"
order: 4
description: "The communication gaps and operational motivations covered by each MEDE document type"
---

In the MEDE methodology, no document exists "just for bureaucracy". Every file targets a specific communication gap or knowledge loss in the software lifecycle.

## 1. Historical Artifacts (The Cause)

### Meeting Minutes (`min-*.md`)
* **Motivation:** Avoid lost discussions in Slack, emails, or informal conversations.
* **Gap it covers:** Memory decay about the original context of decision-making. Ensures agreements with stakeholders are physically recorded.

### Architectural Decisions (`adr-*.md`)
* **Motivation:** Record the engineering behind a decision. Why did we choose PostgreSQL over MongoDB?
* **Gap it covers:** Endless re-discussion of the same technical choices. The ADR serves as an architectural shield: to alter a decision, a new cycle must explicitly overwrite the previous ADR.

### System Maintenance Specification (`esm-*.md`)
* **Motivation:** Map out low-level technical changes before writing code.
* **Gap it covers:** The gap between "business requirements" and "source code". The ESM describes exactly which components, functions, or database columns will be modified.

### Delivery Log (`leg-*.md`)
* **Motivation:** Closure of the maintenance cycle compared to the ESM.
* **Gap it covers:** Uncertainty about what was actually delivered and tested against the initial scope agreed upon in the maintenance specification.

## 2. Live Documents (The Effect / The Consolidated State)

### Current State (`current-state.md`)
* **Motivation:** Serve as the ultimate map of the system's architecture in the present moment.
* **Gap it covers:** The lack of a single, reliable diagram or description of the system's topology, replacing scattered and obsolete Wiki pages.

### Functional & Non-Functional Requirements (`*.md`)
* **Motivation:** Keep the specifications of business rules and technical constraints alive.
* **Gap it covers:** Prevents business rules from becoming hidden inside complex source code (known only to the developers who wrote them).

### Data Model (`data-model.md`)
* **Motivation:** Keep the logical and physical schema of the database accurate.
* **Gap it covers:** Decay of database design diagrams in relation to the actual physical schema running in production.

## Conclusion: The Cumulative Gain

By maintaining this set of live documents and historical logs through MEDE, the project accumulates a **true, auditable knowledge base**.

This allows you to track the historical evolution of the system, assess the exact impact of any technical scope change, and renders the software immune to catastrophic human intelligence losses when key team members leave the company.

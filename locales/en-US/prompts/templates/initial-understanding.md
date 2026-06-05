# Initial Project Understanding

<SYSTEM OR PROJECT NAME>

Client: <name, if there is evidence>
Supplier: <name, if there is evidence>

Period of understanding formation: <period, if there is evidence>
Planned milestone for start of operational deliveries: <date, if there is evidence>

---

## 1. Document Objective

Text explaining:

* purpose of the document;
* what it consolidates;
* what it does not replace;
* that it represents the project's frozen initial baseline.

## 2. General Project Context

General overview text of the problem, system purpose, operational context, pain points, and initial objectives.

## 3. Initial Vision and Scope Delimitation

### 3.1 General System Objective

Description of the system's main purpose.

### 3.2 Main User Profiles

Main profiles, responsibilities, and initial roles.

### 3.3 Initially Included Features

List of the main features initially planned.

### 3.4 Out of Scope Items

Items explicitly excluded from the initial scope.

### 3.5 Initial Assumptions and Constraints

Operational, contractual, technical, or organizational constraints.

## 4. Fundamental Technical Assumptions

### 4.1 Technological Architecture

Technologies, architectural style, and initial justification.

### 4.2 Authentication and Connectivity Model

Assumptions of authentication, connectivity, synchronization, and operation.

### 4.3 Persistence and Data Strategy

Initial database, storage, and integrity assumptions.

### 4.4 Initial Integration Strategy

Planned integrations, external dependencies, and limitations.

### 4.5 Infrastructure and Deploy Assumptions

Environments, hosting, observability, and initial deploy strategy.

## 5. Initial Operational Model

Description of operational entities, roles, links, responsibilities, and macro flow.

## 6. Registration Model / Central Functioning

Description of the core domain logic.
E.g.: records, events, operational cycles, traceability, and relevant states.

## 7. Security and Observability

Assumptions on security, auditing, logs, telemetry, compliance, and traceability.

## 8. Identification Convention and Initial Counters

This section records the formal identification convention and the initial reference snapshot of the project counters.
It does not replace the operational documents that will maintain the current state of these identifiers throughout the evolution.

### 8.1 Formal Identification Pattern

```text
<DOC>-<YYYYMMDD>-<NAT>-<TIP>-<NNNN>
```

Examples:

```text
DEI-20260201-RF-BLI-0001
ESM-20260301-RF-COR-0001
ESM-20260301-UX-AJU-0003
ESM-20260301-AR-EVO-0002
LEG-20260310-OP-COR-0002
SAT-20260315-AR-EVO-0001
```

### 8.2 Conventions

Nature:

* RF = functional requirement
* NF = non-functional requirement
* RN = business rule
* UX = interface / experience
* OP = operation
* AR = architecture / integration / data

Type:

* BLI = initial backlog
* COR = fix
* AJU = adjustment
* EVO = evolution

Possible auxiliary tags:

* HOT
* PERF
* SEC
* MIG

Possible statuses:

* Pending
* Cancelled
* Completed
* Clarified
* Awaiting

### 8.3 Initial Reference Counters

| Type | Initial Reference Value |
| ---- | --------------------------- |
| BLI  | <value or 0>                |
| COR  | <value or 0>                |
| AJU  | <value or 0>                |
| EVO  | <value or 0>                |

## 9. Initial Planning and Backlog

Short context text.

Note:

* preferably use items of type BLI for the initial backlog;
* only record definitive identifiers when there is a sufficient basis;
* avoid inventing artificial numbering or granularity;
* COR, AJU, and EVO items tend to emerge in subsequent evolutionary documents.

| ID | Nature | Type | Description | Tags | Origin | Initial Status |
| -- | -------- | ---- | --------- | ---- | ------ | -------------- |

## 10. Initial Deliveries Planning

### 10.1 Forecasted Total Duration

Description of the forecasted duration.

### 10.2 General Phase Strategy

Macro view of incremental organization.

### 10.3 Summarized Initial Timeline

| Delivery | Period | Objective | Main Items | Initial Acceptance Criteria | Dependencies / Observations |
| ------- | ------- | -------- | ---------------- | -------------------------- | -------------------------- |

### 10.4 Detailed Deliveries

Subsections per delivery or initial milestone containing:

* period;
* included scope;
* initial acceptance criteria;
* relevant dependencies;
* important observations or constraints.

## 11. Planned Start of Operational Evolution

Milestone from which deliveries, decisions, and evolution start to be recorded in specific artifacts of the documentary cycle.

## 12. Final Considerations

Closing of the document as a frozen initial reference of the project, useful for future comparison with the actual evolution of the solution.

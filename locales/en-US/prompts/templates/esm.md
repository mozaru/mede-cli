# ESM-<YYYY-MM-DD> — System Maintenance Specification

**Project:** <PROJECT NAME>
**Reference period:** <DATE OR CYCLE>
**Origin:** <MINUTES, REPORT, INCIDENT, HOMOLOGATION, TICKET, OPERATION>
**Status:** <Under analysis | Approved | In progress | Completed>

---

## 1. Objective

Describe:
- why this ESM was created;
- which problems, fixes, adjustments, or evolutions motivated its creation;
- what expected behavior is desired after implementation.

---

## 2. Context

Describe:
- current system situation;
- origin of requests;
- perceived impacts;
- relationship with minutes, ADRs, homologations, field operation, or previous backlog;
- relevant constraints.

---

## 3. References

List, when they exist:
- minutes;
- ADRs;
- requirements;
- reports;
- tickets;
- homologations;
- previous backlog;
- current state;
- technical documents.

---

## 4. Intervention Backlog

##TABELA_INTERVENCAO##

---

## 5. Maintenance Items

Each item must have a formal and immutable identifier.

Mandatory identifier format:

<DOC>-<YYYYMMDD>-<NAT>-<TIP>-<NNNN>

Mandatory counter rule:

The <NNNN> suffix is sequential per <DOC> + <NAT> + <TIP> combination, not global within the document.
Example: after ESM-20260301-AR-EVO-0003, the first ESM-20260301-OP-AJU must be 0001.

Examples:

- ESM-20260301-RF-COR-0001
- ESM-20260301-UX-AJU-0002
- ESM-20260301-AR-EVO-0003

---

### <IDENTIFIER>

**Title:** <SHORT AND OBJECTIVE TITLE>  
**Type:** <BLI | COR | AJU | EVO>  
**Nature:** <RF | NF | RN | UX | OP | AR>  
**Tags:** <HOT | PERF | SEC | MIG | empty>  
**Status:** <Pending | Awaiting | Completed | Cancelled | Clarified>  
**Origin:** <Minutes, homologation, incident, operation, ADR, ticket>  
**Module:** <IMPACTED AREA, MODULE OR COMPONENT>  

#### Context

Describe:
- how the problem or need was identified;
- observed symptoms;
- who is impacted;
- when it occurs;
- perceived impacts.

#### Current Problem

Clearly describe:
- which behavior is incorrect, missing, or insufficient;
- which current rules are failing;
- what limitations exist.

#### Expected Behavior

Describe:
- how the system should work after the intervention;
- operational rules;
- validations;
- constraints;
- messages;
- offline behavior;
- synchronization;
- persistence;
- permissions;
- exceptions.

#### Technical Impacts

Indicate impact on:
- frontend;
- backend;
- database;
- synchronization;
- integration;
- observability;
- logs;
- security;
- performance;
- infrastructure;
- documentation;
- testing.

#### Acceptance Criteria

- ...
- ...
- ...

#### Dependencies

List:
- dependency on another item;
- dependency on ADR;
- dependency on requirement;
- dependency on homologation;
- dependency on data model;
- dependency on deploy;
- dependency on client validation.

---

## 6. Observations

Record:
- limits of this ESM;
- out of scope items;
- items still exploratory;
- contractual dependencies;
- need for new ESMs;
- need for complementary ADR;
- pending risks.

import { describe, it, expect } from "vitest";
import { ConsistencyCheckerService } from "./consistency-checker-service.js";

const service = new ConsistencyCheckerService();

function makeCurrentState(items: Array<{ id: string; status: string }>): string {
  const rows = items
    .map((i) => `| ${i.id} | Descrição | - | - | Src | - | ${i.status} |`)
    .join("\n");
  return [
    "# Situação Atual",
    "<!-- BEGIN-TABELA_SITUACAO_ATUAL -->",
    "| ID | Descrição | Tags | Ata | Origem | Entrega | Status |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    rows || "| — | — | — | — | — | — | — |",
    "<!-- END-TABELA_SITUACAO_ATUAL -->",
  ].join("\n");
}

describe("ConsistencyCheckerService.check", () => {
  it("returns ok=true when replay matches current state exactly", () => {
    const replayedState = new Map([
      ["SAT-20260611-001-RF-BLI-0001", "Concluído"],
      ["SAT-20260611-001-RF-BLI-0002", "Pendente"],
    ]);
    const currentContent = makeCurrentState([
      { id: "SAT-20260611-001-RF-BLI-0001", status: "Concluído" },
      { id: "SAT-20260611-001-RF-BLI-0002", status: "Pendente" },
    ]);

    const result = service.check(replayedState, currentContent);

    expect(result.ok).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("reports issue when item is in replay but absent from current state", () => {
    const replayedState = new Map([
      ["SAT-20260611-001-RF-BLI-0001", "Pendente"],
      ["SAT-20260611-001-RF-BLI-0002", "Pendente"],
    ]);
    const currentContent = makeCurrentState([
      { id: "SAT-20260611-001-RF-BLI-0001", status: "Pendente" },
    ]);

    const result = service.check(replayedState, currentContent);

    expect(result.ok).toBe(false);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]).toContain("SAT-20260611-001-RF-BLI-0002");
    expect(result.issues[0]).toContain("ausente em situacao-atual.md");
  });

  it("reports issue when item is in current state but absent from replay", () => {
    const replayedState = new Map([["SAT-20260611-001-RF-BLI-0001", "Pendente"]]);
    const currentContent = makeCurrentState([
      { id: "SAT-20260611-001-RF-BLI-0001", status: "Pendente" },
      { id: "SAT-20260611-001-RF-BLI-0002", status: "Pendente" },
    ]);

    const result = service.check(replayedState, currentContent);

    expect(result.ok).toBe(false);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]).toContain("SAT-20260611-001-RF-BLI-0002");
    expect(result.issues[0]).toContain("ausente no replay");
  });

  it("reports issue when statuses differ", () => {
    const replayedState = new Map([["SAT-20260611-001-RF-BLI-0001", "Concluído"]]);
    const currentContent = makeCurrentState([
      { id: "SAT-20260611-001-RF-BLI-0001", status: "Pendente" },
    ]);

    const result = service.check(replayedState, currentContent);

    expect(result.ok).toBe(false);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]).toContain("SAT-20260611-001-RF-BLI-0001");
    expect(result.issues[0]).toContain("Concluído");
    expect(result.issues[0]).toContain("Pendente");
  });

  it("returns ok=true with empty state when TABELA_SITUACAO_ATUAL block is missing and replay is empty", () => {
    const result = service.check(new Map(), "# Situação Atual\n\nSem tabela.");
    expect(result.ok).toBe(true);
  });
});

describe("ConsistencyCheckerService.diff", () => {
  it("returns empty string when states match", () => {
    const replayedState = new Map([["SAT-20260611-001-RF-BLI-0001", "Pendente"]]);
    const currentContent = makeCurrentState([
      { id: "SAT-20260611-001-RF-BLI-0001", status: "Pendente" },
    ]);

    expect(service.diff(replayedState, currentContent)).toBe("");
  });

  it("shows + prefix for items in replay not in current state", () => {
    const replayedState = new Map([["SAT-20260611-001-RF-BLI-0001", "Pendente"]]);
    const currentContent = makeCurrentState([]);

    const result = service.diff(replayedState, currentContent);
    expect(result).toContain("+ SAT-20260611-001-RF-BLI-0001");
  });

  it("shows - prefix for items in current state not in replay", () => {
    const currentContent = makeCurrentState([
      { id: "SAT-20260611-001-RF-BLI-0001", status: "Pendente" },
    ]);

    const result = service.diff(new Map(), currentContent);
    expect(result).toContain("- SAT-20260611-001-RF-BLI-0001");
  });

  it("shows ~ prefix for items with status mismatch", () => {
    const replayedState = new Map([["SAT-20260611-001-RF-BLI-0001", "Concluído"]]);
    const currentContent = makeCurrentState([
      { id: "SAT-20260611-001-RF-BLI-0001", status: "Pendente" },
    ]);

    const result = service.diff(replayedState, currentContent);
    expect(result).toContain("~ SAT-20260611-001-RF-BLI-0001");
    expect(result).toContain("Concluído");
    expect(result).toContain("Pendente");
  });
});

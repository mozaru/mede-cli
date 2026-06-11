import { describe, it, expect } from "vitest";
import { BacklogReplayService } from "./backlog-replay-service.js";

const service = new BacklogReplayService();

function makeInitial(items: Array<{ id: string; status?: string }>): string {
  const rows = items
    .map((i) => `| ${i.id} | RF | Item | Src | ${i.status ?? "Pendente"} |`)
    .join("\n");
  return [
    "<!-- BEGIN-TABELA_BACKLOG_INICIAL -->",
    "| ID | Tipo | Nome | Origem | Status |",
    "| --- | --- | --- | --- | --- |",
    rows || "| — | — | — | — | — |",
    "<!-- END-TABELA_BACKLOG_INICIAL -->",
  ].join("\n");
}

function makeLeg(opts: {
  deliveredIds?: string[];
  newItems?: Array<{ id: string; status?: string }>;
  stats?: { totalEntregues?: number; totalPendentes?: number; entreguesCiclo?: number; novosCiclo?: number };
}): string {
  const { deliveredIds = [], newItems = [], stats } = opts;

  const entreguesRows = deliveredIds
    .map((id) => `| ${id} | RF/BLI | Item | Src | leg-001 | - |`)
    .join("\n");

  const novosRows = newItems
    .map((i) => `| ${i.id} | RF/BLI | Item | Src | ${i.status ?? "Pendente"} |`)
    .join("\n");

  const entreguesTable = [
    "<!-- BEGIN-TABELA_ENTREGUES -->",
    "| ID | Tipo | Nome | Origem | Ciclo de Entrega | Observação |",
    "| --- | --- | --- | --- | --- | --- |",
    ...(entreguesRows ? [entreguesRows] : ["| — | — | — | — | — | — |"]),
    "<!-- END-TABELA_ENTREGUES -->",
  ].join("\n");

  const novosTable = [
    "<!-- BEGIN-TABELA_NOVOS_CICLO -->",
    "| ID | Tipo | Nome | Origem | Status |",
    "| --- | --- | --- | --- | --- |",
    ...(novosRows ? [novosRows] : ["| — | — | — | — | — |"]),
    "<!-- END-TABELA_NOVOS_CICLO -->",
  ].join("\n");

  const statBlocks = stats
    ? [
        `<!-- BEGIN-TOTAL_ENTREGUES -->${stats.totalEntregues ?? ""}<!-- END-TOTAL_ENTREGUES -->`,
        `<!-- BEGIN-TOTAL_PENDENTES -->${stats.totalPendentes ?? ""}<!-- END-TOTAL_PENDENTES -->`,
        `<!-- BEGIN-TOTAL_ENTREGUES_CICLO -->${stats.entreguesCiclo ?? ""}<!-- END-TOTAL_ENTREGUES_CICLO -->`,
        `<!-- BEGIN-NOVOS_CICLO -->${stats.novosCiclo ?? ""}<!-- END-NOVOS_CICLO -->`,
      ].join("\n")
    : "";

  return [entreguesTable, novosTable, statBlocks].filter(Boolean).join("\n\n");
}

describe("BacklogReplayService.replayFromContent", () => {
  it("replay with 0 LEGs returns initial state unchanged", () => {
    const initial = makeInitial([
      { id: "SAT-20260611-001-RF-BLI-0001" },
      { id: "SAT-20260611-001-RF-BLI-0002" },
    ]);

    const { state, legResults } = service.replayFromContent(initial, []);

    expect(state.size).toBe(2);
    expect(state.get("SAT-20260611-001-RF-BLI-0001")).toBe("Pendente");
    expect(state.get("SAT-20260611-001-RF-BLI-0002")).toBe("Pendente");
    expect(legResults).toHaveLength(0);
  });

  it("replay with 1 LEG marks delivered items as Concluído and adds new items", () => {
    const initial = makeInitial([
      { id: "SAT-20260611-001-RF-BLI-0001" },
      { id: "SAT-20260611-001-RF-BLI-0002" },
    ]);
    const leg = makeLeg({
      deliveredIds: ["SAT-20260611-001-RF-BLI-0001"],
      newItems: [{ id: "SAT-20260611-002-NF-BLI-0001", status: "Pendente" }],
    });

    const { state } = service.replayFromContent(initial, [{ name: "leg-001.md", content: leg }]);

    expect(state.get("SAT-20260611-001-RF-BLI-0001")).toBe("Concluído");
    expect(state.get("SAT-20260611-001-RF-BLI-0002")).toBe("Pendente");
    expect(state.get("SAT-20260611-002-NF-BLI-0001")).toBe("Pendente");
    expect(state.size).toBe(3);
  });

  it("unknown ID in TABELA_ENTREGUES is silently ignored (not added to state)", () => {
    const initial = makeInitial([{ id: "SAT-20260611-001-RF-BLI-0001" }]);
    const leg = makeLeg({ deliveredIds: ["SAT-UNKNOWN-ID"] });

    const { state } = service.replayFromContent(initial, [{ name: "leg-001.md", content: leg }]);

    expect(state.has("SAT-UNKNOWN-ID")).toBe(false);
    expect(state.get("SAT-20260611-001-RF-BLI-0001")).toBe("Pendente");
  });

  it("multiple LEGs are applied in order", () => {
    const initial = makeInitial([
      { id: "SAT-20260611-001-RF-BLI-0001" },
      { id: "SAT-20260611-001-RF-BLI-0002" },
    ]);
    const leg1 = makeLeg({ deliveredIds: ["SAT-20260611-001-RF-BLI-0001"] });
    const leg2 = makeLeg({
      deliveredIds: ["SAT-20260611-001-RF-BLI-0002"],
      newItems: [{ id: "SAT-20260611-002-NF-BLI-0001" }],
    });

    const { state } = service.replayFromContent(initial, [
      { name: "leg-20260611-001.md", content: leg1 },
      { name: "leg-20260611-002.md", content: leg2 },
    ]);

    expect(state.get("SAT-20260611-001-RF-BLI-0001")).toBe("Concluído");
    expect(state.get("SAT-20260611-001-RF-BLI-0002")).toBe("Concluído");
    expect(state.get("SAT-20260611-002-NF-BLI-0001")).toBe("Pendente");
  });

  it("returns empty state when TABELA_BACKLOG_INICIAL block is missing", () => {
    const { state } = service.replayFromContent("# Entendimento\n\nSem bloco.", []);
    expect(state.size).toBe(0);
  });
});

describe("BacklogReplayService.validateLegStats", () => {
  it("reports no issues when all stats match", () => {
    const initial = makeInitial([
      { id: "SAT-20260611-001-RF-BLI-0001" },
      { id: "SAT-20260611-001-RF-BLI-0002" },
    ]);
    const { state } = service.replayFromContent(initial, []);

    const stateAfterLeg = new Map(state);
    stateAfterLeg.set("SAT-20260611-001-RF-BLI-0001", "Concluído");

    const leg = makeLeg({
      deliveredIds: ["SAT-20260611-001-RF-BLI-0001"],
      stats: { totalEntregues: 1, totalPendentes: 1, entreguesCiclo: 1, novosCiclo: 0 },
    });

    const issues = service.validateLegStats(leg, stateAfterLeg, 1, 0);
    expect(issues).toHaveLength(0);
  });

  it("reports stat issue with exact name, expected and found when TOTAL_ENTREGUES is wrong", () => {
    const stateAfterLeg = new Map([
      ["SAT-20260611-001-RF-BLI-0001", "Concluído"],
      ["SAT-20260611-001-RF-BLI-0002", "Pendente"],
    ]);

    const leg = makeLeg({
      deliveredIds: ["SAT-20260611-001-RF-BLI-0001"],
      stats: { totalEntregues: 99, totalPendentes: 1, entreguesCiclo: 1, novosCiclo: 0 },
    });

    const issues = service.validateLegStats(leg, stateAfterLeg, 1, 0);

    expect(issues).toHaveLength(1);
    expect(issues[0].stat).toBe("TOTAL_ENTREGUES");
    expect(issues[0].expected).toBe(1);
    expect(issues[0].found).toBe(99);
  });

  it("skips stat blocks that are empty (not populated)", () => {
    const stateAfterLeg = new Map([["SAT-20260611-001-RF-BLI-0001", "Pendente"]]);
    const leg = [
      "<!-- BEGIN-TABELA_ENTREGUES --><!-- END-TABELA_ENTREGUES -->",
      "<!-- BEGIN-TABELA_NOVOS_CICLO --><!-- END-TABELA_NOVOS_CICLO -->",
      "<!-- BEGIN-TOTAL_ENTREGUES --><!-- END-TOTAL_ENTREGUES -->",
    ].join("\n");

    const issues = service.validateLegStats(leg, stateAfterLeg, 0, 0);
    expect(issues).toHaveLength(0);
  });
});

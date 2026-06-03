import { describe, it, expect } from "vitest";
import { CurrentStateParser } from "./current-state-parser.js";
import type { IFileSystemRepository } from "../repositories/interfaces/file-system-repository-interface.js";

// The parser only reads file content; a minimal fake feeds Markdown directly,
// keeping these tests free of any real filesystem access.
function parserWith(content: string): CurrentStateParser {
  const fakeFs = { readFile: () => content } as unknown as IFileSystemRepository;
  return new CurrentStateParser(fakeFs);
}

const SITUACAO_ATUAL = `# Situação Atual

**Sistema:** MEDE-CLI
**Data de referência:** 2026-01-15
**Origem da consolidação:** consolidação manual

## Backlog

| ID | Descrição | Tags | Ata | Origem | Entrega | Status |
| --- | --- | --- | --- | --- | --- | --- |
| DEI-20260115-RF-BLI-0001 | Cadastro de usuário | SEC | min-001 | reunião | leg-001 | Concluído |
| DEI-20260115-RF-BLI-0002 | Login do usuário | | min-001 | reunião | | Pendente |
`;

describe("CurrentStateParser.parse", () => {
  it("extracts the backlog items from the Markdown table", () => {
    const result = parserWith(SITUACAO_ATUAL).parse("situacao-atual.md");

    expect(result.backlogItems).toHaveLength(2);

    const first = result.backlogItems[0];
    expect(first.immutableId).toBe("DEI-20260115-RF-BLI-0001");
    expect(first.documentType).toBe("DEI");
    expect(first.nature).toBe("RF");
    expect(first.interventionType).toBe("BLI");
    expect(first.sequence).toBe(1);
    expect(first.referenceDate).toBe("20260115");
    expect(first.description).toBe("Cadastro de usuário");
    expect(first.tags).toEqual(["SEC"]);
    expect(first.status).toBe("Concluído");
  });

  it("parses metadata labels from the document header", () => {
    const result = parserWith(SITUACAO_ATUAL).parse("situacao-atual.md");

    expect(result.metadata.systemName).toBe("MEDE-CLI");
    expect(result.metadata.referenceDate).toBe("2026-01-15");
    expect(result.metadata.sourceDescription).toBe("consolidação manual");
    expect(result.metadata.totalParsedItems).toBe(2);
    expect(result.metadata.totalFormalBacklogItems).toBe(2);
  });

  it("builds classification counters with the highest sequence per key", () => {
    const result = parserWith(SITUACAO_ATUAL).parse("situacao-atual.md");

    expect(result.metadata.classificationCounters).toEqual([
      { key: "DEI-RF-BLI", lastSequenceNumber: 2 },
    ]);
  });

  it("drops unknown tags, keeping only the allowed set", () => {
    const content = SITUACAO_ATUAL.replace("| SEC |", "| SEC, BOGUS, MIG |");
    const result = parserWith(content).parse("situacao-atual.md");

    expect(result.backlogItems[0].tags).toEqual(["SEC", "MIG"]);
  });

  it("returns no items when the document has no backlog table", () => {
    const result = parserWith("# Empty\n\nNo table here.").parse("situacao-atual.md");

    expect(result.backlogItems).toHaveLength(0);
    expect(result.metadata.totalParsedItems).toBe(0);
    expect(result.metadata.classificationCounters).toHaveLength(0);
  });
});

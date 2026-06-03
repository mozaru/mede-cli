import { describe, it, expect } from "vitest";
import { InitialUnderstandingParser } from "./initial-understanding-parser.js";
import type { IFileSystemRepository } from "../domain/interfaces/repositories/file-system-repository-interface.js";

function parserWith(content: string): InitialUnderstandingParser {
  const fakeFs = { readFile: () => content } as unknown as IFileSystemRepository;
  return new InitialUnderstandingParser(fakeFs);
}

const ENTENDIMENTO_INICIAL = `# Entendimento Inicial - Sistema de Teste

**Sistema:** MeuSistema
**Objetivo:** Facilitar testes automatizados da metodologia.

## Resumo Analítico

Este projeto serve para garantir a qualidade de parsing do entendimento inicial.

## Backlog Inicial

| ID | Tipo | Nome | Origem | Status Inicial |
| --- | --- | --- | --- | --- |
| DEI-0001 | BLI | Criar banco de dados | Requisito 1 | Pendente |
| DEI-0002 | EVO | Implementar login social | Requisito 2 | Concluído |
`;

describe("InitialUnderstandingParser.parse", () => {
  it("extracts system name, objective, and summary", () => {
    const result = parserWith(ENTENDIMENTO_INICIAL).parse("entendimento-inicial.md");

    expect(result.metadata.systemName).toBe("MeuSistema");
    expect(result.metadata.objective).toBe("Facilitar testes automatizados da metodologia.");
    expect(result.metadata.summary).toBe("Este projeto serve para garantir a qualidade de parsing do entendimento inicial.");
    expect(result.metadata.totalParsedItems).toBe(2);
  });

  it("extracts backlog items with sequence derived from ID", () => {
    const result = parserWith(ENTENDIMENTO_INICIAL).parse("entendimento-inicial.md");

    expect(result.backlogItems).toHaveLength(2);

    const first = result.backlogItems[0];
    expect(first.immutableId).toBe("DEI-0001");
    expect(first.interventionType).toBe("BLI");
    expect(first.sequence).toBe(1);
    expect(first.description).toBe("Criar banco de dados");
    expect(first.source).toBe("Requisito 1");
    expect(first.status).toBe("Pendente");
    expect(first.nature).toBe("INITIAL_UNDERSTANDING");
    expect(first.documentType).toBe("entendimento-inicial.md");

    const second = result.backlogItems[1];
    expect(second.immutableId).toBe("DEI-0002");
    expect(second.interventionType).toBe("EVO");
    expect(second.sequence).toBe(2);
    expect(second.status).toBe("Concluído");
  });

  it("returns no items if table header has missing fields", () => {
    const content = `# Entendimento Inicial
**Sistema:** Teste

| ID | Tipo | Nome |
| --- | --- | --- |
| DEI-0001 | BLI | Criar banco |
`;
    const result = parserWith(content).parse("entendimento-inicial.md");
    expect(result.backlogItems).toHaveLength(0);
  });
});

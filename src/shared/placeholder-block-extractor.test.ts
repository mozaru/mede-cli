import { describe, it, expect } from "vitest";
import { extractPlaceholderBlocks, compressDocument } from "./placeholder-block-extractor.js";

describe("extractPlaceholderBlocks", () => {
  it("returns empty array for document without blocks", () => {
    const content = "# Título\n\nParágrafo simples.\n";
    expect(extractPlaceholderBlocks(content)).toEqual([]);
  });

  it("extracts a block at the beginning of the document", () => {
    const content = "<!-- BEGIN-TABELA_A -->\nconteudo\n<!-- END-TABELA_A -->\nTexto após.";
    const blocks = extractPlaceholderBlocks(content);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].name).toBe("TABELA_A");
    expect(blocks[0].startLine).toBe(0);
    expect(blocks[0].endLine).toBe(2);
    expect(blocks[0].innerContent).toBe("conteudo");
    expect(blocks[0].innerLineCount).toBe(1);
  });

  it("extracts a block in the middle of the document", () => {
    const content = "Antes\n<!-- BEGIN-BLOCO_X -->\nlinha1\nlinha2\n<!-- END-BLOCO_X -->\nDepois";
    const blocks = extractPlaceholderBlocks(content);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].name).toBe("BLOCO_X");
    expect(blocks[0].startLine).toBe(1);
    expect(blocks[0].endLine).toBe(4);
    expect(blocks[0].innerContent).toBe("linha1\nlinha2");
    expect(blocks[0].innerLineCount).toBe(2);
  });

  it("extracts a block at the end of the document", () => {
    const content = "Início\n<!-- BEGIN-FINAL -->\nconteudo final\n<!-- END-FINAL -->";
    const blocks = extractPlaceholderBlocks(content);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].name).toBe("FINAL");
    expect(blocks[0].startLine).toBe(1);
    expect(blocks[0].endLine).toBe(3);
  });

  it("extracts multiple blocks in distinct positions", () => {
    const content = [
      "<!-- BEGIN-A -->",
      "conteudo A",
      "<!-- END-A -->",
      "Meio",
      "<!-- BEGIN-B -->",
      "conteudo B",
      "<!-- END-B -->",
    ].join("\n");

    const blocks = extractPlaceholderBlocks(content);
    expect(blocks).toHaveLength(2);
    expect(blocks[0].name).toBe("A");
    expect(blocks[1].name).toBe("B");
  });

  it("extracts a block with empty inner content", () => {
    const content2 = "<!-- BEGIN-VAZIO -->\n<!-- END-VAZIO -->";
    const blocks = extractPlaceholderBlocks(content2);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].innerContent).toBe("");
    expect(blocks[0].innerLineCount).toBe(0);
  });

  it("throws on BEGIN without END", () => {
    const content = "<!-- BEGIN-ORPHAN -->\nconteudo sem fim";
    expect(() => extractPlaceholderBlocks(content)).toThrow(/BEGIN-ORPHAN/);
  });

  it("extracts blocks with different names coexisting", () => {
    const content = [
      "<!-- BEGIN-TABELA_ENTREGUES -->",
      "| ID | Nome |",
      "<!-- END-TABELA_ENTREGUES -->",
      "Texto",
      "<!-- BEGIN-TABELA_PENDENTES -->",
      "| ID | Status |",
      "<!-- END-TABELA_PENDENTES -->",
    ].join("\n");

    const blocks = extractPlaceholderBlocks(content);
    expect(blocks.map((b) => b.name)).toEqual(["TABELA_ENTREGUES", "TABELA_PENDENTES"]);
  });

  it("extracts block whose inner content has blank lines and markdown tables", () => {
    const content = [
      "<!-- BEGIN-DADOS -->",
      "",
      "| Col1 | Col2 |",
      "| --- | --- |",
      "| A | B |",
      "",
      "<!-- END-DADOS -->",
    ].join("\n");

    const blocks = extractPlaceholderBlocks(content);
    expect(blocks[0].innerLineCount).toBe(5);
    expect(blocks[0].innerContent).toContain("| A | B |");
  });
});

describe("compressDocument", () => {
  it("returns content unchanged when there are no blocks", () => {
    const content = "Sem blocos aqui.";
    const { compressedContent, blocks } = compressDocument(content);
    expect(compressedContent).toBe(content);
    expect(blocks).toHaveLength(0);
  });

  it("compresses a single block to a placeholder line", () => {
    const content = ["<!-- BEGIN-TABELA_A -->", "linha1", "linha2", "<!-- END-TABELA_A -->"].join(
      "\n",
    );

    const { compressedContent } = compressDocument(content);

    expect(compressedContent).toBe(
      ["<!-- BEGIN-TABELA_A -->", "##TABELA_A##", "<!-- END-TABELA_A -->"].join("\n"),
    );
  });

  it("preserves text before and after the block", () => {
    const content = [
      "Antes do bloco",
      "<!-- BEGIN-X -->",
      "inner",
      "<!-- END-X -->",
      "Depois do bloco",
    ].join("\n");

    const { compressedContent } = compressDocument(content);

    expect(compressedContent).toBe(
      ["Antes do bloco", "<!-- BEGIN-X -->", "##X##", "<!-- END-X -->", "Depois do bloco"].join(
        "\n",
      ),
    );
  });

  it("compresses multiple blocks without corrupting line positions", () => {
    const content = [
      "<!-- BEGIN-A -->",
      "a1",
      "a2",
      "<!-- END-A -->",
      "Meio",
      "<!-- BEGIN-B -->",
      "b1",
      "<!-- END-B -->",
    ].join("\n");

    const { compressedContent } = compressDocument(content);

    expect(compressedContent).toBe(
      [
        "<!-- BEGIN-A -->",
        "##A##",
        "<!-- END-A -->",
        "Meio",
        "<!-- BEGIN-B -->",
        "##B##",
        "<!-- END-B -->",
      ].join("\n"),
    );
  });

  it("compresses a block with empty inner content to a placeholder line", () => {
    const content = ["<!-- BEGIN-VAZIO -->", "<!-- END-VAZIO -->"].join("\n");
    const { compressedContent } = compressDocument(content);
    expect(compressedContent).toBe(
      ["<!-- BEGIN-VAZIO -->", "##VAZIO##", "<!-- END-VAZIO -->"].join("\n"),
    );
  });

  it("returns original PlaceholderBlock positions (in original document)", () => {
    const content = ["Linha 0", "<!-- BEGIN-A -->", "inner A", "<!-- END-A -->", "Linha 4"].join(
      "\n",
    );

    const { blocks } = compressDocument(content);
    expect(blocks[0].startLine).toBe(1);
    expect(blocks[0].endLine).toBe(3);
    expect(blocks[0].innerLineCount).toBe(1);
  });
});

import { describe, expect, it } from "vitest";
import { collapseDuplicateRootDocumentAppend } from "./markdown-document-normalizer.js";

describe("collapseDuplicateRootDocumentAppend", () => {
  it("keeps a normal document unchanged", () => {
    const content = ["# Modelo de Dados", "", "## 1. Visão Geral", "Texto."].join("\n");

    expect(collapseDuplicateRootDocumentAppend(content)).toBe(content);
  });

  it("keeps the appended complete document when the root H1 is duplicated", () => {
    const oldDoc = [
      "# Modelo de Dados",
      "",
      "## 1. Visão Geral",
      "Antigo",
      "",
      "## 2. Entidades",
      "Antigas",
      "",
      "## 3. Relações",
      "Antigas",
      "",
      "## 4. Final",
      "Antigo",
    ].join("\n");
    const newDoc = [
      "# Modelo de Dados",
      "",
      "## 1. Visão Geral",
      "Novo",
      "",
      "## 2. Entidades",
      "Novas",
      "",
      "## 3. Relações",
      "Novas",
      "",
      "## 4. Final",
      "Novo",
      "",
      "## 5. Auditoria",
      "Nova",
      "",
      "## 6. Consideração",
      "Nova",
      "",
      "## 7. Apêndice",
      "Novo",
    ].join("\n");

    const result = collapseDuplicateRootDocumentAppend(`${oldDoc}\n\n${newDoc}`);

    expect(result).toBe(newDoc);
  });
});

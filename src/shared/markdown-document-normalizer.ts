export function collapseDuplicateRootDocumentAppend(content: string): string {
  const lines = content.split(/\r?\n/);
  const firstHeadingIndex = lines.findIndex((line) => /^#\s+\S/.test(line.trim()));

  if (firstHeadingIndex === -1) {
    return content;
  }

  const rootHeading = lines[firstHeadingIndex].trim();
  const duplicateHeadingIndex = lines.findIndex(
    (line, index) => index > firstHeadingIndex && line.trim() === rootHeading,
  );

  if (duplicateHeadingIndex === -1) {
    return content;
  }

  const appendedDocumentLines = lines.slice(duplicateHeadingIndex);
  const numberedSections = appendedDocumentLines.filter((line) =>
    /^##\s+\d+\./.test(line.trim()),
  ).length;

  if (appendedDocumentLines.length < 15 || numberedSections < 2) {
    return content;
  }

  return appendedDocumentLines.join("\n").trimEnd() + (content.endsWith("\n") ? "\n" : "");
}

import path from "node:path";

// Defensive path helpers. The MEDE-CLI writes files whose locations are derived
// from configuration (docsRoot + configured names), but a malformed config, a
// crafted attachment path or a future bug could try to escape the intended tree
// (classic "../../etc/passwd" traversal). These helpers make containment an
// explicit, testable check instead of an assumption.

// NUL bytes terminate paths in most OS syscalls and are never valid in a
// legitimate document path; reject them outright.
function assertNoNullByte(candidate: string): void {
  if (candidate.includes("\0")) {
    throw new Error("Invalid path: contains a NUL byte.");
  }
}

// True when `candidate` resolves to `root` itself or to something inside it.
// Both sides are resolved to absolute, normalized paths first, so `..` segments
// are collapsed before comparison.
export function isPathWithin(root: string, candidate: string): boolean {
  if (root.includes("\0") || candidate.includes("\0")) {
    return false;
  }

  const resolvedRoot = path.resolve(root);
  const resolvedCandidate = path.resolve(resolvedRoot, candidate);

  if (resolvedCandidate === resolvedRoot) {
    return true;
  }

  const rootWithSep = resolvedRoot.endsWith(path.sep) ? resolvedRoot : resolvedRoot + path.sep;

  // On case-insensitive filesystems (Windows/macOS default) compare loosely so
  // "C:\\Docs" contains "c:\\docs\\x".
  if (process.platform === "win32") {
    return resolvedCandidate.toLowerCase().startsWith(rootWithSep.toLowerCase());
  }

  return resolvedCandidate.startsWith(rootWithSep);
}

// Throws a descriptive error when `candidate` would escape `root`.
export function assertPathWithin(root: string, candidate: string, label = "path"): void {
  assertNoNullByte(root);
  assertNoNullByte(candidate);

  if (!isPathWithin(root, candidate)) {
    throw new Error(
      `Unsafe ${label}: "${candidate}" resolves outside the allowed directory "${root}".`,
    );
  }
}

export { assertNoNullByte };

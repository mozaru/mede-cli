import { describe, expect, it, vi } from "vitest";
import { FilesService } from "./files-service.js";

const project = {
  id: 10,
  name: "Demo",
  rootProjectPath: "/root",
  docsRootPath: "/root/docs",
  documentationLanguage: "pt-BR",
};

const config = { id: 20, projectId: project.id, content: "{}" };
const cycle = { id: 30, projectId: project.id, status: "OPEN" };

function makeService(overrides: {
  projects?: unknown;
  projectConfigs?: unknown;
  cycles?: unknown;
  artifacts?: unknown[];
  diffFunction?: FilesService extends never ? never : any;
} = {}): FilesService {
  const projectRepository =
    overrides.projects ??
    {
      getCurrent: vi.fn(() => project),
      list: vi.fn(() => [project]),
    };

  const projectConfigRepository =
    overrides.projectConfigs ??
    {
      get: vi.fn(() => config),
      getCurrent: vi.fn(() => config),
    };

  const cycleRepository =
    overrides.cycles ??
    {
      getCurrent: vi.fn(() => cycle),
    };

  const cycleArtifactRepository = {
    list: vi.fn(() => overrides.artifacts ?? []),
  };

  return new FilesService(
    projectRepository as any,
    projectConfigRepository as any,
    cycleRepository as any,
    cycleArtifactRepository as any,
    overrides.diffFunction ?? null,
  );
}

describe("FilesService", () => {
  it("lists changed files and snapshot files separately", () => {
    const service = makeService({
      artifacts: [
        { artifactPath: "docs/a.md", backupContent: "old", currentContent: "new" },
        { artifactPath: "docs/b.md", backupContent: "same", currentContent: "same" },
        { artifactPath: "docs/c.md", backupContent: "", currentContent: "created" },
      ],
    });

    expect(service.files(false)).toBe("docs/a.md\ndocs/c.md\n");
    expect(service.files(true)).toBe("docs/a.md\ndocs/b.md\n");
  });

  it("returns a generated diff for a changed artifact", () => {
    const diffFunction = vi.fn(() => [
      { index: 1, location: "@@ -1 +1 @@", content: "-old\n+new" },
      { index: 2, location: "@@ -3 +3 @@", content: "+extra" },
    ]);
    const service = makeService({
      artifacts: [{ artifactPath: "docs/a.md", backupContent: "old", currentContent: "new" }],
      diffFunction,
    });

    expect(service.diff("docs/a.md")).toBe("@@ -1 +1 @@\n-old\n+new\n\n@@ -3 +3 @@\n+extra");
    expect(diffFunction).toHaveBeenCalledWith("old", "new");
  });

  it("reports no diff when content is unchanged or diff generation is empty", () => {
    const unchanged = makeService({
      artifacts: [{ artifactPath: "docs/a.md", backupContent: "same", currentContent: "same" }],
    });
    expect(unchanged.diff("docs/a.md")).toBe("No diffs found");

    const emptyDiff = makeService({
      artifacts: [{ artifactPath: "docs/a.md", backupContent: "old", currentContent: "new" }],
      diffFunction: vi.fn(() => []),
    });
    expect(emptyDiff.diff("docs/a.md")).toBe("No diffs found");
  });

  it("cats current and backup contents, including files created during the cycle", () => {
    const service = makeService({
      artifacts: [
        { artifactPath: "docs/a.md", backupContent: "old", currentContent: "new" },
        { artifactPath: "docs/new.md", backupContent: "", currentContent: "created" },
      ],
    });

    expect(service.cat("docs/a.md", false)).toBe("new");
    expect(service.cat("docs/a.md", true)).toBe("old");
    expect(service.cat("docs/new.md", true)).toBe("O arquivo não existia no snapshot inicial");
  });

  it("throws when project, config, cycle, or file are missing", () => {
    expect(() => makeService({ projects: { getCurrent: () => null, list: () => [] } }).files(false))
      .toThrow(/Projeto/);

    expect(() =>
      makeService({ projectConfigs: { get: () => null, getCurrent: () => null } }).files(false),
    ).toThrow(/Config/);

    expect(() => makeService({ cycles: { getCurrent: () => null } }).files(false)).toThrow(
      /Nenhum ciclo/,
    );

    expect(() => makeService({ artifacts: [] }).cat("missing.md", false)).toThrow(
      /arquivo não encontrado/,
    );
  });

  it("falls back to list/getCurrent repositories when getCurrent/get are not implemented", () => {
    const service = makeService({
      projects: { list: () => [{ ...project, id: 1 }, { ...project, id: 2 }] },
      projectConfigs: { getCurrent: vi.fn(() => config) },
      cycles: { getCurrent: vi.fn(() => ({ ...cycle, id: 99 })) },
      artifacts: [{ artifactPath: "docs/a.md", backupContent: "old", currentContent: "new" }],
    });

    expect(service.files(false)).toBe("docs/a.md\n");
  });
});

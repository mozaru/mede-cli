/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { StatusService } from "./status-service.js";
import { ProjectEntity } from "../../domain/entities/project-entity.js";
import { CycleEntity } from "../../domain/entities/cycle-entity.js";
import { PhaseEntity } from "../../domain/entities/phase-entity.js";
import { ChangeSetEntity } from "../../domain/entities/change-set-entity.js";
import { I18n } from "../../shared/i18n.js";

describe("StatusService unit tests", () => {
  it("formats and generates project status report correctly based on project, cycle and phase state in pt-BR", () => {
    const originalLanguage = I18n.language;
    I18n.setLanguage("pt-BR");

    try {
      // 1. Mocks
      const project = new ProjectEntity();
      project.name = "DemoProj";
      project.rootProjectPath = "/app";
      project.docsRootPath = "/app/docs";
      project.documentationLanguage = "pt-BR";

      const cycle = new CycleEntity();
      cycle.id = 1;
      cycle.status = "OPEN";
      cycle.currentPhaseIndex = 2;
      cycle.phaseCount = 12;
      cycle.autoMode = "APPROVE_ALL";

      const phase = new PhaseEntity();
      phase.id = 2;
      phase.name = "GENERATE_ADR";
      phase.status = "AWAITING_APPROVAL";
      phase.proposalState = "NON_EMPTY";

      const changeSet = new ChangeSetEntity();
      changeSet.fileName = "adr-001.md";
      changeSet.currentChangeChunkIndex = 1;
      changeSet.changeChunkCount = 3;

      // Repos
      const projectRepository = {} as any;
      const cycleRepository = {} as any;
      const changeSetRepository = {
        list: vi.fn().mockReturnValue([{}, {}]), // 2 refinements
      } as any;
      const cycleArtifactRepository = {
        list: vi.fn().mockReturnValue([
          { backupContent: "old", currentContent: "new" }, // changed file
          { backupContent: "", currentContent: "created" }, // created file
          { backupContent: "same", currentContent: "same" }, // unchanged
        ]),
      } as any;
      const phaseRepository = {} as any;

      const statusService = new StatusService(
        projectRepository,
        cycleRepository,
        changeSetRepository,
        cycleArtifactRepository,
        phaseRepository
      );

      // 2. Test status labels mapping
      expect(statusService.phaseStateText(phase)).toBe("aguardando approve/reject");
      expect(statusService.proposalStateText(phase)).toBe("não vazia");
      expect(statusService.autoModeText(cycle)).toBe("approve-all");
      expect(statusService.countRefinements(phase)).toBe(2);
      expect(statusService.countChangedFiles(cycle)).toBe(1);
      expect(statusService.countCreatedFiles(cycle)).toBe(1);

      // Test actions text
      const actions = statusService.availableActions(cycle, phase);
      expect(actions).toContain("refine");
      expect(actions).toContain("approve <all>");
      expect(actions).toContain("reject <all>");

      // 3. Act & Assert generate status
      const output = statusService.generate(project, cycle, phase, changeSet);
      expect(output).toContain("Projeto : DemoProj");
      expect(output).toContain("Idioma     : pt-BR");
      expect(output).toContain("Estado        : aguardando approve/reject");
      expect(output).toContain("Proposta     : não vazia");
      expect(output).toContain("Refinamentos  : 2");
      expect(output).toContain("Arquivos modificados: 1");
      expect(output).toContain("Arquivos criados: 1");
      expect(output).toContain("Modo automático    : approve-all");
      expect(output).toContain("ChangeSet    : 1/3");
    } finally {
      I18n.setLanguage(originalLanguage);
    }
  });

  it("formats and generates project status report dynamically in en-US", () => {
    const originalLanguage = I18n.language;
    I18n.setLanguage("pt-BR"); // Set global lang to something else

    try {
      const project = new ProjectEntity();
      project.name = "DemoProj";
      project.rootProjectPath = "/app";
      project.docsRootPath = "/app/docs";
      project.documentationLanguage = "en-US"; // Project forces en-US status

      const cycle = new CycleEntity();
      cycle.id = 1;
      cycle.status = "OPEN";
      cycle.currentPhaseIndex = 2;
      cycle.phaseCount = 12;
      cycle.autoMode = "APPROVE_ALL";

      const phase = new PhaseEntity();
      phase.id = 2;
      phase.name = "GENERATE_ADR";
      phase.status = "AWAITING_APPROVAL";
      phase.proposalState = "NON_EMPTY";

      const changeSet = new ChangeSetEntity();
      changeSet.fileName = "adr-001.md";
      changeSet.currentChangeChunkIndex = 1;
      changeSet.changeChunkCount = 3;

      const statusService = new StatusService(
        {} as any,
        {} as any,
        { list: vi.fn().mockReturnValue([]) } as any,
        { list: vi.fn().mockReturnValue([]) } as any,
        {} as any
      );

      const output = statusService.generate(project, cycle, phase, changeSet);
      // Verify translated keys in English
      expect(output).toContain("Project : DemoProj");
      expect(output).toContain("Language     : en-US");
      expect(output).toContain("State        : awaiting approve/reject");
      expect(output).toContain("Proposal     : non-empty");
      expect(output).toContain("Refinements  : 0");
      expect(output).toContain("Changed files: 0");
      expect(output).toContain("Created files: 0");
      expect(output).toContain("Auto-mode    : approve-all");
      expect(output).toContain("ChangeSet    : 1/3");
    } finally {
      I18n.setLanguage(originalLanguage);
    }
  });

  it("successCommit and successRollback output formatting", () => {
    const project = new ProjectEntity();
    project.name = "Proj";
    project.rootProjectPath = "/root";
    project.docsRootPath = "/root/docs";
    project.documentationLanguage = "en-US";

    const cycle = new CycleEntity();
    cycle.status = "COMMITTED";

    const statusService = new StatusService({} as any, {} as any, {} as any, {} as any, {} as any);

    const commitOutput = statusService.successCommit(project, cycle);
    expect(commitOutput).toContain("Commit successful");
    expect(commitOutput).toContain("Language     : en-US");

    const rollbackOutput = statusService.successRollback(project, cycle);
    expect(rollbackOutput).toContain("Rollback successful");
  });
});

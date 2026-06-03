import { ProjectEntity } from "../entities/project-entity.js";

export interface ProjectReconstructionServiceResult {
  configCreated: boolean;
  configPath: string;

  project: ProjectEntity;
  projectCreated: boolean;
  projectUpdated: boolean;

  readmeFound: boolean;
  initialUnderstandingFound: boolean;
  currentStateFound: boolean;

  backlogItemsRebuilt: number;
  backlogSequenceCountersRebuilt: number;
  snapshotCreated: boolean;
  projectNameSource: "readme" | "initial-understanding" | "current-state" | "unknown";

  sources: {
    readmePath: string;
    initialUnderstandingPath: string;
    currentStatePath: string;
  };
}

import { ProjectReconstructionServiceResult } from "../../models/project-reconstruction-result-model.js";

export interface IProjectReconstructionService {
    reconstruct(): ProjectReconstructionServiceResult; 
}

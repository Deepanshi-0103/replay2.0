import { applyFix } from "../services/file.service.js";

export const fixerAgent = async (repoPath, analysis) => {
  applyFix(repoPath, analysis.file, analysis.fixedCode);
  return true;
};

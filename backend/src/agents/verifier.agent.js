import { runTests } from "../services/test.service.js";

export const verifierAgent = (repoPath) => {
  return runTests(repoPath);
};

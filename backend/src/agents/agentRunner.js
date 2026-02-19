import {
  cloneRepo,
  createBranch,
  commitAndPush,
} from "../services/git.service.js";
import { runTests } from "../services/test.service.js";
import { analyzerAgent } from "./analyzer.agent.js";
import { fixerAgent } from "./fixer.agent.js";
import { verifierAgent } from "./verifier.agent.js";
import { generateBranchName } from "../utils/branchName.js";
import fs from "fs";

export const runAgent = async ({ repoUrl, teamName, leaderName }) => {
  const repoPath = `sandbox/repo`;
  const branch = generateBranchName(teamName, leaderName);

  await cloneRepo(repoUrl, repoPath);
  await createBranch(repoPath, branch);

  const results = {
    fixes: [],
    iterations: [],
  };

  for (let i = 1; i <= 5; i++) {
    const test = runTests(repoPath);
    results.iterations.push({ iteration: i, success: test.success });

    if (test.success) break;

    const analysis = await analyzerAgent(test.output);
    await fixerAgent(repoPath, analysis);
    await commitAndPush(repoPath, analysis.fixExplanation, branch);

    results.fixes.push(analysis);
  }

  fs.writeFileSync("results.json", JSON.stringify(results, null, 2));
  return results;
};

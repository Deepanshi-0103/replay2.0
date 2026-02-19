import simpleGit from "simple-git";
import fs from "fs-extra";
import { log } from "../utils/logger.js";

export const cloneRepo = async (repoUrl, path) => {
  await fs.remove(path);
  log("GIT", "Cloning repository...");
  await simpleGit().clone(repoUrl, path);
};

export const createBranch = async (repoPath, branchName) => {
  const git = simpleGit(repoPath);
  await git.checkoutLocalBranch(branchName);
};

export const commitAndPush = async (repoPath, message, branch) => {
  const git = simpleGit(repoPath);
  await git.add(".");
  await git.commit(`[AI-AGENT] ${message}`);
  await git.push("origin", branch);
};

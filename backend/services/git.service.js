import simpleGit from "simple-git";
import fs from "fs-extra";

export async function cloneRepo(repoUrl, path) {
  await fs.remove(path);
  await simpleGit().clone(repoUrl, path);
}

export async function createBranch(repoPath, branch) {
  const git = simpleGit(repoPath);
  await git.checkoutLocalBranch(branch);
}

export async function commitChanges(repoPath, message) {
  const git = simpleGit(repoPath);
  await git.add(".");
  await git.commit(`[AI-AGENT] ${message}`);
}

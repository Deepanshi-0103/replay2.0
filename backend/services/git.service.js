import simpleGit from "simple-git";
import fs from "fs-extra";

/**
 * Clone repository using user-provided GitHub token
 */
export async function cloneRepo(repoUrl, repoPath, githubToken) {
  await fs.remove(repoPath);


  if (!githubToken) {
    throw new Error("GitHub token is required to push fixes");
  }

  const authRepoUrl = repoUrl.replace("https://", `https://${githubToken}@`);

  await simpleGit().clone(authRepoUrl, repoPath);
}

/**
 * Create and checkout required branch
 */
export async function createBranch(repoPath, branch) {
  const git = simpleGit(repoPath);
  await git.checkoutLocalBranch(branch);
}

/**
 * Commit and push changes to remote branch
 */
export async function commitChanges(repoPath, message, branch) {
  const git = simpleGit(repoPath);

  await git.add(".");
  await git.commit(`[AI-AGENT] ${message}`);

  // First push: set upstream
  await git.push(["--set-upstream", "origin", branch]);
}

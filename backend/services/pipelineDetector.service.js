import fs from "fs";

export function detectPipeline(repoPath) {
  if (fs.existsSync(`${repoPath}/.github/workflows`)) {
    return "GITHUB_ACTIONS";
  }
  return "NONE";
}

import fs from "fs";

export const applyFix = (repoPath, file, newCode) => {
  fs.writeFileSync(`${repoPath}/${file}`, newCode, "utf-8");
};

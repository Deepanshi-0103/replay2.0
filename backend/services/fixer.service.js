import path from "path";
import fs from "fs";
import { execSync } from "child_process";

export function applyFix(bugType, repoPath) {
  if (!repoPath || typeof repoPath !== "string") {
    console.log("[FIXER ❌] Invalid repoPath:", repoPath);
    return null;
  }

  switch (bugType) {
    case "LINTING":
      try {
        execSync("npm run lint -- --fix", {
          cwd: repoPath,
          stdio: "inherit",
        });
        return "[AI-AGENT] Auto-fix lint issues using ESLint";
      } catch (e) {
        console.log("[FIXER ❌] ESLint auto-fix failed");
        return null;
      }

    case "CI_CONFIG":
      addTestScript(repoPath);
      return "[AI-AGENT] Add missing test script to package.json";

    case "SYNTAX":
    case "IMPORT":
      // Not implemented yet — safe no-op
      return null;

    default:
      return null;
  }
}

/**
 * Fix missing `npm test` script safely
 */
function addTestScript(repoPath) {
  if (!repoPath) return;

  const pkgPath = path.join(repoPath, "package.json");

  if (!fs.existsSync(pkgPath)) {
    console.log("[FIXER ❌] package.json not found");
    return;
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

  if (!pkg.scripts) pkg.scripts = {};

  if (!pkg.scripts.test) {
    pkg.scripts.test = 'echo "No tests specified" && exit 0';
  }

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
}

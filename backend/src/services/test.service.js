import { execSync } from "child_process";
import { log } from "../utils/logger.js";

export const runTests = (repoPath) => {
  try {
    log("TEST", "Running tests...");
    const output = execSync("pytest", {
      cwd: repoPath,
      stdio: "pipe",
    }).toString();
    return { success: true, output };
  } catch (err) {
    return {
      success: false,
      output: err.stdout?.toString() || err.message,
    };
  }
};

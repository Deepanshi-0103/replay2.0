export function analyzeFailure(error, failedCommand = "") {
  if (!error) return "UNKNOWN";

  if (
    error.includes('Missing script: "test"') ||
    error.includes("missing script: test")
  ) {
    return "CI_CONFIG";
  }

  if (failedCommand === "npm test") {
    return "CI_CONFIG";
  }

  if (error.includes("eslint")) return "LINTING";
  if (error.includes("SyntaxError")) return "SYNTAX";
  if (error.includes("TypeError")) return "TYPE_ERROR";
  if (error.includes("Module not found")) return "IMPORT";

  return "UNKNOWN";
}

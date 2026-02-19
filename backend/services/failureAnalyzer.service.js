export function analyzeFailure(error, failedCommand = "") {
  if (!error) return "UNKNOWN";

  if (failedCommand.includes("test.sh")) {
    return "LOGIC";
  }

  if (error.includes("SyntaxError")) return "SYNTAX";
  if (error.includes("TypeError")) return "TYPE_ERROR";
  if (error.includes("eslint")) return "LINTING";
  if (error.includes("Module not found")) return "IMPORT";
  if (error.includes("docker")) return "INFRA";

  return "UNKNOWN";
}

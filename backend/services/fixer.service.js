export function applyFix(bugType) {
  if (bugType === "LINTING") {
    return "fix linting issues";
  }
  if (bugType === "SYNTAX") {
    return "fix syntax error";
  }
  if (bugType === "IMPORT") {
    return "add missing dependency";
  }

  return null;
}

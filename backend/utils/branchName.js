export function generateBranchName(team, leader) {
  return `${team}_${leader}_AI_Fix`
    .toUpperCase()
    .replace(/\s+/g, "_");
}

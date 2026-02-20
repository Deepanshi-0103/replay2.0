import fs from "fs";
import { buildAgentGraph } from "./langGraphRunner.js";
import { cleanup } from "../services/cleanup.service.js";

import Project from "../models/project.model.js";

export async function runAgent(input) {
  const graph = buildAgentGraph();
  const { projectId } = input;
  console.error(
    `[DEBUG-ERROR] runAgent input keys: ${Object.keys(input).join(",")}`,
  );

  try {
    const finalState = await graph.invoke({
      ...input,
      repoPath: "sandbox/repo",
      iteration: 1,
      timeline: [],
      startTime: Date.now(),
    });
    const endTime = Date.now();
    const durationMs = endTime - finalState.startTime;
    const durationSeconds = Math.floor(durationMs / 1000);

    // 🔥 Score Calculation
    let baseScore = 100;
    let speedBonus = durationMs < 5 * 60 * 1000 ? 10 : 0;
    let commitCount = finalState.iteration - 1;
    let efficiencyPenalty = commitCount > 20 ? (commitCount - 20) * 2 : 0;

    let finalScore = baseScore + speedBonus - efficiencyPenalty;

    const results = {
      repoUrl: finalState.repoUrl,
      branch: finalState.branch,
      retryUsed: `${finalState.iteration - 1}/5`,
      timeline: finalState.timeline,
      score: {
        base: baseScore,
        speedBonus,
        efficiencyPenalty,
        final: finalScore,
      },
      totalTimeSeconds: durationSeconds,
      status: finalState.execution?.success ? "PASSED" : "FAILED",
    };

    // Update Project in DB with final results
    await Project.findOneAndUpdate(
      { projectId },
      {
        status: results.status,
        totalDurationSeconds: durationSeconds,
        generatedBranchName: finalState.branch,
        $push: {
          logs: {
            timestamp: new Date().toISOString(),
            level: "INFO",
            message: `Agent finished with status: ${results.status}`,
          },
        },
      },
    );

    // fs.writeFileSync("results.json", JSON.stringify(results, null, 2)); // Optional: disable or remove if not needed
    return results;
  } catch (error) {
    console.error("Agent execution failed:", error);
    await Project.findOneAndUpdate(
      { projectId },
      {
        status: "ERROR",
        $push: {
          logs: {
            timestamp: new Date().toISOString(),
            level: "ERROR",
            message: `Agent execution crashed: ${error.message}`,
          },
        },
      },
    );
    throw error;
  } finally {
    await cleanup("sandbox/repo");
    console.log("[CLEANUP] Sandbox removed");
  }
}

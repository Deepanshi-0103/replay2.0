import fs from "fs";
import {
  cloneRepo,
  createBranch,
  commitChanges,
} from "../services/git.service.js";

import { detectPipeline } from "../services/pipelineDetector.service.js";
import { extractPipelineCommands } from "../services/pipelineParser.service.js";
import { executePipeline } from "../services/pipelineExecutor.service.js";
import { analyzeFailure } from "../services/failureAnalyzer.service.js";
import { applyFix } from "../services/fixer.service.js";
import { cleanup } from "../services/cleanup.service.js";
import { generateBranchName } from "../utils/branchName.js";
import Project from "../models/project.model.js";

async function logToDB(projectId, level, message) {
  console.log(`[${level}] ${message}`);
  await Project.findOneAndUpdate(
    { projectId },
    {
      $push: {
        logs: {
          timestamp: new Date().toISOString(),
          level,
          message,
        },
      },
    },
  );
}

async function updateStep(projectId, stepId, status, duration = null) {
  const updateQuery = {
    "steps.id": stepId,
  };
  const updateAction = {
    $set: {
      "steps.$.status": status,
    },
  };
  if (duration) {
    updateAction.$set["steps.$.duration"] = duration;
  }

  // If step doesn't exist, push it (this is a simplification, might need better logic)
  const project = await Project.findOne({ projectId });
  const stepExists = project.steps.some((s) => s.id === stepId);

  if (!stepExists) {
    await Project.findOneAndUpdate(
      { projectId },
      {
        $push: {
          steps: {
            id: stepId,
            name: stepId, // specific name map can be added
            status,
            duration,
          },
        },
      },
    );
  } else {
    await Project.findOneAndUpdate(
      { projectId, "steps.id": stepId },
      updateAction,
    );
  }
}

export async function runAgent({ repoUrl, teamName, leaderName, projectId }) {
  const repoPath = `sandbox/repo-${projectId}`; // Unique path per project
  const branch = generateBranchName(teamName, leaderName);

  await Project.findOneAndUpdate(
    { projectId },
    { status: "RUNNING", generatedBranchName: branch },
  );
  await logToDB(projectId, "INFO", "Starting execution run...");

  const startTime = Date.now();

  try {
    // 1. Clone
    await logToDB(projectId, "INFO", "Cloning repository...");
    // await updateStep(projectId, "1", "ACTIVE"); // assuming step 1 is Clone
    const cloneStart = Date.now();
    await cloneRepo(repoUrl, repoPath);
    // await updateStep(projectId, "1", "SUCCESS", `${(Date.now() - cloneStart)/1000}s`);

    await createBranch(repoPath, branch);

    // 2. Detect Pipeline
    await logToDB(projectId, "INFO", "Detecting CI pipeline...");
    const pipelineType = detectPipeline(repoPath);

    if (pipelineType === "NONE") {
      await logToDB(projectId, "ERROR", "No CI/CD pipeline found");
      await Project.findOneAndUpdate({ projectId }, { status: "FAILED" });
      return;
    }

    // 3. Extract Commands
    await logToDB(projectId, "INFO", "Extracting pipeline commands...");
    const commands = extractPipelineCommands(repoPath);

    for (let i = 1; i <= 5; i++) {
      await logToDB(projectId, "INFO", `[ITERATION ${i}] Running pipeline`);

      const execution = executePipeline(commands, repoPath);

      if (execution.skipped?.length) {
        // Log skipped steps if needed
      }

      if (execution.success) {
        await logToDB(projectId, "INFO", "Pipeline execution passed!");
        await Project.findOneAndUpdate({ projectId }, { status: "PASSED" });
        break;
      }

      await logToDB(projectId, "ERROR", `Pipeline failed: ${execution.error}`);

      const bugType = analyzeFailure(execution.error, execution.failedCommand);

      await Project.findOneAndUpdate(
        { projectId },
        {
          $push: {
            failures: {
              filePath: "unknown", // Need to parse from error
              lineNumber: 0,
              bugType,
              rawErrorMessage: execution.error,
              classifiedCategory: bugType,
            },
            iterations: {
              iterationNumber: i,
              failuresCount: 1,
              fixesApplied: 0, // Will update
              ciStatus: "FAILED",
              timestamp: new Date().toISOString(),
            },
          },
        },
      );

      // Fix
      await logToDB(projectId, "INFO", `Generating fix for ${bugType}...`);
      const fixMessage = applyFix(bugType);

      if (!fixMessage) {
        await logToDB(projectId, "ERROR", "Could not generate a fix.");
        break;
      }

      await commitChanges(repoPath, fixMessage);

      await Project.findOneAndUpdate(
        { projectId },
        {
          $push: {
            fixes: {
              fileModified: "unknown",
              commitMessage: fixMessage,
              status: "APPLIED",
            },
          },
        },
      );
    }

    const totalDuration = (Date.now() - startTime) / 1000;
    await Project.findOneAndUpdate(
      { projectId },
      { totalDurationSeconds: totalDuration },
    );

    // Update final status if not passed
    const finalProject = await Project.findOne({ projectId });
    if (finalProject.status === "RUNNING") {
      await Project.findOneAndUpdate({ projectId }, { status: "FAILED" });
    }
  } catch (error) {
    await logToDB(projectId, "ERROR", `Agent runtime error: ${error.message}`);
    await Project.findOneAndUpdate({ projectId }, { status: "ERROR" });
  } finally {
    await cleanup(repoPath);
    await logToDB(projectId, "INFO", "[CLEANUP] Sandbox removed");
  }
}

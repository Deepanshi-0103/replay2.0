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
import { generateBranchName } from "../utils/branchName.js";
import Project from "../models/project.model.js";
import { v4 as uuidv4 } from "uuid";

// Helper to update specific step status
const updateStepStatus = async (projectId, stepId, status) => {
  await Project.findOneAndUpdate(
    { projectId, "steps.id": stepId },
    {
      $set: {
        "steps.$.status": status,
        "steps.$.duration": status === "SUCCESS" ? "2s" : undefined, // Mock duration for now
      },
      $push: {
        logs: {
          timestamp: new Date().toISOString(),
          level: "INFO",
          message: `Step ${stepId} status: ${status}`,
        },
      },
    },
  );
};

// Helper to log a message
const logMessage = async (projectId, level, message) => {
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
};

/**
 * 🧠 Repo Agent
 */
export const repoAgent = async (state) => {
  const { projectId, teamName, leaderName, repoUrl, repoPath, githubToken } =
    state;

  // 1. Start "Cloning Repository"
  await updateStepStatus(projectId, "1", "ACTIVE");
  await logMessage(projectId, "INFO", `Cloning repository: ${repoUrl}`);
  console.log(
    `[DEBUG] repoAgent State Token: ${githubToken ? "Present (Starts with " + githubToken.substring(0, 4) + ")" : "MISSING"}`,
  );

  state.branch = generateBranchName(teamName, leaderName);

  await cloneRepo(repoUrl, repoPath, githubToken);

  // 1. Success "Cloning Repository"
  await updateStepStatus(projectId, "1", "SUCCESS");

  // 2. Start "Setting Up Sandbox"
  await updateStepStatus(projectId, "2", "ACTIVE");
  await createBranch(repoPath, state.branch);

  // 2. Success "Setting Up Sandbox"
  await updateStepStatus(projectId, "2", "SUCCESS");

  return state;
};

/**
 * 🔍 Pipeline Detection Agent
 */
export const pipelineAgent = async (state) => {
  const { projectId, repoPath } = state;
  // This could map to "Parsing Failures" or be a hidden step
  await logMessage(projectId, "INFO", "Detecting CI/CD pipeline...");

  const type = detectPipeline(repoPath);
  if (type === "NONE") {
    const errorMsg = "No CI/CD pipeline found";
    await logMessage(projectId, "ERROR", errorMsg);
    throw new Error(errorMsg);
  }

  state.commands = extractPipelineCommands(repoPath);
  await logMessage(
    projectId,
    "INFO",
    `Pipeline detected: ${type}. Commands: ${state.commands.map((c) => c.command).join(", ")}`,
  );

  return state;
};

/**
 * ▶️ Executor Agent (records timeline)
 */
export const executorAgent = async (state) => {
  const { projectId, commands, repoPath } = state;
  const now = new Date().toISOString();

  // 3. Start "Running Test Suite" (Monitoring CI)
  // Step 7 "Monitoring CI" is probably more appropriate for the full loop,
  // but let's use Step 3 "Running Test Suite" for the local execution phase.
  await updateStepStatus(projectId, "3", "ACTIVE");
  // Also Step 7 "Monitoring CI" could be active
  await updateStepStatus(projectId, "7", "ACTIVE");

  await logMessage(projectId, "INFO", "Executing pipeline commands...");

  state.execution = executePipeline(commands, repoPath);

  if (!state.timeline) state.timeline = [];

  state.timeline.push({
    iteration: state.iteration,
    status: state.execution.success ? "PASSED" : "FAILED",
    timestamp: now,
  });

  const iterationData = {
    iterationNumber: state.iteration,
    failuresCount: state.execution.success ? 0 : 1, // Simplified
    fixesApplied: 0, // Will update later?
    ciStatus: state.execution.success ? "PASSED" : "FAILED",
    duration: "10s", // Mock
    timestamp: now,
  };

  await Project.findOneAndUpdate(
    { projectId },
    {
      $push: {
        iterations: iterationData,
      },
    },
  );

  if (state.execution.success) {
    await updateStepStatus(projectId, "3", "SUCCESS");
    await updateStepStatus(projectId, "7", "SUCCESS");
    await logMessage(projectId, "INFO", "Pipeline execution PASSED");
  } else {
    // Pipeline failed, but the agent step itself completed successfully (it ran the tests)
    await updateStepStatus(projectId, "3", "SUCCESS"); // The "Running" is done
    await updateStepStatus(projectId, "7", "ACTIVE"); // Still monitoring/fixing
    await logMessage(
      projectId,
      "ERROR",
      `Pipeline execution FAILED: ${state.execution.error || "Unknown error"}`,
    );
  }

  return state;
};

/**
 * 🧪 Analyzer Agent
 */
export const analyzerAgent = async (state) => {
  const { projectId } = state;

  if (state.execution.success) return state;

  // 4. Start "Parsing Failures"
  await updateStepStatus(projectId, "4", "ACTIVE");

  state.bugType = analyzeFailure(
    state.execution.error,
    state.execution.failedCommand,
  );

  // const failureId = uuidv4(); // Let Mongoose generate _id
  const failureData = {
    // _id: failureId,
    filePath: "unknown", // Analyzer should ideally return this
    lineNumber: 0,
    bugType: state.bugType || "UNKNOWN",
    rawErrorMessage: state.execution.error?.slice(0, 200),
    classifiedCategory: state.bugType,
  };

  await Project.findOneAndUpdate(
    { projectId },
    {
      $push: {
        failures: failureData,
      },
    },
  );

  await logMessage(
    projectId,
    "INFO",
    `Analyzed failure. Type: ${state.bugType}`,
  );
  await updateStepStatus(projectId, "4", "SUCCESS");

  return state;
};

/**
 * 🔧 Fixer Agent
 */
export const fixerAgent = async (state) => {
  const { projectId } = state;
  if (!state.bugType) return state;

  // 5. Start "Generating Fixes"
  await updateStepStatus(projectId, "5", "ACTIVE");

  const fixMessage = applyFix(state.bugType, state.repoPath);

  if (!fixMessage) {
    await logMessage(projectId, "WARNING", "No fix generated.");
    return state;
  }

  state.fixMessage = fixMessage;

  const fixData = {
    fileModified: "unknown", // Fixer should return this
    commitMessage: fixMessage,
    status: "GENERATED",
  };

  await Project.findOneAndUpdate(
    { projectId },
    {
      $push: {
        fixes: fixData,
      },
    },
  );

  await logMessage(projectId, "INFO", `Generated fix: ${fixMessage}`);
  await updateStepStatus(projectId, "5", "SUCCESS");

  return state;
};

/**
 * 🧾 GitOps Agent
 */
export const gitAgent = async (state) => {
  const { projectId } = state;
  if (!state.fixMessage) return state;

  // 6. Start "Applying Patch"
  await updateStepStatus(projectId, "6", "ACTIVE");

  await commitChanges(state.repoPath, state.fixMessage, state.branch);

  // increment iteration after each fix
  state.iteration = (state.iteration || 1) + 1;

  await logMessage(
    projectId,
    "INFO",
    `Applied patch and committed to ${state.branch}`,
  );
  await updateStepStatus(projectId, "6", "SUCCESS");

  return state;
};

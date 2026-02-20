import mongoose from "mongoose";
import Project from "../models/project.model.js";
import { runAgent } from "../agent/runAgent.js";
import "dotenv/config";

// Mock the heavy lifting services to avoid real git/network operations during verification
// We process-exit after a short time or on completion

const projectId = "test-project-" + Date.now();
const mockInput = {
  repoUrl: "https://github.com/test/repo",
  teamName: "Test Team",
  leaderName: "Tester",
  projectId,
};

async function verify() {
  console.log("Connecting to DB...");
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("Connected.");

  // Create initial project
  await new Project({
    projectId,
    repoUrl: mockInput.repoUrl,
    status: "QUEUED",
    steps: [
      { id: "1", name: "Cloning Repository", status: "PENDING" },
      { id: "2", name: "Setting Up Sandbox", status: "PENDING" },
      { id: "3", name: "Running Test Suite", status: "PENDING" },
      { id: "4", name: "Parsing Failures", status: "PENDING" },
      { id: "5", name: "Generating Fixes", status: "PENDING" },
      { id: "6", name: "Applying Patch", status: "PENDING" },
      { id: "7", name: "Monitoring CI", status: "PENDING" },
      { id: "8", name: "Final Validation", status: "PENDING" },
    ],
    logs: [],
  }).save();

  console.log(`Created test project: ${projectId}`);

  // We are NOT going to actually run the full agent because it requires real git repos and Docker/Pipelines.
  // Instead, we will simulate the CALL to runAgent and expect it to fail (because of missing repo)
  // OR we can rely on the user to run the real thing.
  //
  // However, to verify our wiring, we should at least check if runAgent accepts the projectId.
  // Since we modified runAgent to take projectId, let's try to call it.
  // It will likely fail at "cloneRepo", but it should log "Cloning repository..." to DB first!

  console.log("Starting agent run...");

  try {
    // We expect this to eventually fail because we didn't mock the services deeply enough in this script
    // (monkey patching ESM modules is hard without a loader).
    // But we can check if it updates the DB before failing.
    runAgent(mockInput).catch((err) =>
      console.log("Agent promise rejected (expected):", err.message),
    );
  } catch (err) {
    console.log("Agent failed synchronously:", err.message);
  }

  console.log("Waiting for DB updates...");

  // Poll DB for 10 seconds
  let checks = 0;
  const interval = setInterval(async () => {
    checks++;
    const p = await Project.findOne({ projectId });
    if (p) {
      console.log(`[${checks}] Status: ${p.status}, Logs: ${p.logs.length}`);
      if (p.logs.length > 0) {
        console.log("Last log:", p.logs[p.logs.length - 1].message);
      }

      // If we see "Cloning repository" in logs, our wiring is working!
      const hasCloneLog = p.logs.some((l) =>
        l.message.includes("Cloning repository"),
      );
      if (hasCloneLog) {
        console.log("SUCCESS: Found 'Cloning repository' log in DB!");
        clearInterval(interval);
        mongoose.disconnect();
        process.exit(0);
      }
    }

    if (checks > 10) {
      console.log("TIMEOUT: Did not find expected logs.");
      clearInterval(interval);
      mongoose.disconnect();
      process.exit(1);
    }
  }, 1000);
}

verify().catch(console.error);

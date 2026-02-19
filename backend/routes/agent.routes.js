import express from "express";
import { runAgent } from "../agent/runAgent.js";
import Project from "../models/project.model.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

router.post("/run-agent", async (req, res) => {
  const { repoUrl, teamName, leaderName } = req.body;
  const projectId = uuidv4();

  try {
    const newProject = new Project({
      projectId,
      repoUrl,
      status: "QUEUED",
      logs: [],
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
      failures: [],
      fixes: [],
      iterations: [],
    });

    await newProject.save();

    // Fire and forget - async execution
    runAgent({ repoUrl, teamName, leaderName, projectId }).catch((err) => {
      console.error(
        `Background agent run failed for project ${projectId}:`,
        err,
      );
    });

    res.json({ success: true, projectId });
  } catch (error) {
    console.error("Error starting agent:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/project/:id", async (req, res) => {
  try {
    const project = await Project.findOne({ projectId: req.params.id });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

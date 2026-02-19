import express from "express";
import { runAgent } from "../agent/agentRunner.js";

const router = express.Router();

router.post("/run", async (req, res) => {
  const result = await runAgent(req.body);
  res.json(result);
});

export default router;

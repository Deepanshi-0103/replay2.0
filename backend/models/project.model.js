import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  projectId: {
    type: String, // Ensure this is unique if generating manually, or rely on _id
    required: true,
    unique: true,
  },
  repoUrl: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["QUEUED", "RUNNING", "PASSED", "FAILED", "ERROR"],
    default: "QUEUED",
  },
  logs: [
    {
      timestamp: String,
      level: String,
      message: String,
    },
  ],
  steps: [
    {
      id: String,
      name: String,
      status: String, // PENDING, ACTIVE, SUCCESS, ERROR
      duration: String,
    },
  ],
  failures: [
    {
      _id: String, // Explicitly define as String to allow UUIDs
      filePath: String,
      lineNumber: Number,
      bugType: String,
      rawErrorMessage: String,
      classifiedCategory: String,
    },
  ],
  fixes: [
    {
      fileModified: String,
      commitMessage: String,
      status: String,
    },
  ],
  iterations: [
    {
      iterationNumber: Number,
      failuresCount: Number,
      fixesApplied: Number,
      ciStatus: String,
      duration: String,
      timestamp: String,
    },
  ],
  generatedBranchName: String,
  totalDurationSeconds: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Project = mongoose.model("Project", projectSchema);

export default Project;

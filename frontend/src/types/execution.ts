export type RunStatus =
  | "PENDING"
  | "INITIALIZING"
  | "RUNNING"
  | "WAITING_FOR_CI"
  | "PASSED"
  | "FAILED"
  | "TERMINATED"
  | "ERROR";

export type StepStatus = "PENDING" | "ACTIVE" | "SUCCESS" | "ERROR";

export type FixStatus = "GENERATED" | "APPLIED" | "VALIDATED" | "FAILED";

export enum BugType {
  LINTING = "LINTING",
  SYNTAX = "SYNTAX",
  LOGIC = "LOGIC",
  TYPE_ERROR = "TYPE_ERROR",
  IMPORT = "IMPORT",
  INDENTATION = "INDENTATION",
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "INFO" | "ERROR" | "WARNING";
  message: string;
}

export interface Failure {
  id: string;
  filePath: string;
  lineNumber: number;
  bugType: BugType;
  rawErrorMessage: string;
  classifiedCategory: string;
}

export interface FixAttempt {
  id: string;
  fileModified: string;
  patchPreview?: string; // Unified diff or similar
  commitMessage: string;
  status: FixStatus;
  validationResult?: string;
}

export interface Iteration {
  id: string;
  iterationNumber: number;
  failuresCount: number;
  fixesApplied: number;
  ciStatus: "PASSED" | "FAILED" | "PENDING";
  duration: string;
  timestamp: string;
}

export interface ExecutionStep {
  id: string;
  name: string;
  status: StepStatus;
  startTime?: string;
  endTime?: string;
  duration?: string;
}

export interface RunData {
  runId: string;
  projectId: string;
  status: RunStatus;
  repositoryUrl: string;
  baseBranch: string;
  generatedBranchName: string;
  createdAt: string; // Changed from startedAt to match backend
  completedAt?: string;
  totalDurationSeconds: number;
  iterationCount: number;
  currentStep: string;
  totalFailuresDetected: number;
  totalFixesApplied: number;
  finalCiStatus?: "PASSED" | "FAILED";

  // Arrays for data
  logs: LogEntry[];
  steps: ExecutionStep[];
  failures: Failure[];
  fixes: FixAttempt[];
  iterations: Iteration[];

  // Optional Premium Fields
  resourceUsage?: {
    cpu: string;
    memory: string;
  };
  testCoverage?: number;
  estimatedCost?: string;
  fixConfidenceScore?: number;
}

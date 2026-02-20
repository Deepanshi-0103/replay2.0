import { StateGraph, Annotation } from "@langchain/langgraph";
import {
  repoAgent,
  pipelineAgent,
  executorAgent,
  analyzerAgent,
  fixerAgent,
  gitAgent,
} from "./agents.js";

const AgentState = Annotation.Root({
  repoUrl: Annotation(),
  teamName: Annotation(),
  leaderName: Annotation(),
  leaderName: Annotation(),
  githubToken: Annotation(),
  projectId: Annotation(),

  repoPath: Annotation(),
  branch: Annotation(),

  commands: Annotation(),
  execution: Annotation(),

  bugType: Annotation(),
  fixMessage: Annotation(),

  iteration: Annotation(),
  timeline: Annotation(),
  startTime: Annotation(),
});

export function buildAgentGraph() {
  const graph = new StateGraph(AgentState);

  graph.addNode("repo", repoAgent);
  graph.addNode("pipeline", pipelineAgent);
  graph.addNode("execute", executorAgent);
  graph.addNode("analyze", analyzerAgent);
  graph.addNode("fix", fixerAgent);
  graph.addNode("git", gitAgent);

  graph.setEntryPoint("repo");

  graph.addEdge("repo", "pipeline");
  graph.addEdge("pipeline", "execute");
  graph.addEdge("execute", "analyze");
  graph.addEdge("analyze", "fix");
  graph.addEdge("fix", "git");

  // Loop until pipeline passes
  graph.addConditionalEdges("git", (state) => {
    if (state.execution?.success) return "__end__";
    return "execute";
  });

  return graph.compile();
}

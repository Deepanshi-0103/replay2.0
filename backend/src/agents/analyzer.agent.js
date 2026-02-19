import { analyzeFailure } from "../services/openai.service.js";

export const analyzerAgent = async (testOutput) => {
  return await analyzeFailure(testOutput);
};

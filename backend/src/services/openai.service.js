import OpenAI from "openai";
import { log } from "../utils/logger.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const analyzeFailure = async (errorLog) => {
  log("AI", "Analyzing failure with OpenAI...");

  const prompt = `
You are an Autonomous DevOps AI Agent.

Analyze the following CI/CD failure and return STRICT JSON:

Fields:
- file
- line
- bugType (LINTING, SYNTAX, LOGIC, TYPE_ERROR, IMPORT, INDENTATION)
- fixExplanation
- fixedCode

Failure Log:
${errorLog}

Respond ONLY in JSON.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
  });

  return JSON.parse(response.choices[0].message.content);
};

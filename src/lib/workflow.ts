import { Client } from "@upstash/workflow";
import { validatedEnv } from "./env";

export const workflowClient = new Client({
  baseUrl: validatedEnv.UPSTASH_WORKFLOW_URL || "https://qstash.upstash.io",
  token: validatedEnv.QSTASH_TOKEN || "",
});

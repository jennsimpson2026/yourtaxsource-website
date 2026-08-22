import { validatedEnv } from "./src/lib/env";
console.log("OPENAI_API_KEY in process.env:", !!process.env.OPENAI_API_KEY);
console.log("TAVILY_API_KEY in process.env:", !!process.env.TAVILY_API_KEY);
console.log("OPENAI_API_KEY in validatedEnv:", !!(validatedEnv as any).OPENAI_API_KEY);

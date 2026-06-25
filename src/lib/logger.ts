import { Logger } from "next-axiom";

const axiomLogger = new Logger();

export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data || "");
    axiomLogger.info(message, data);
  },
  error: (message: string, data?: any) => {
    console.error(`[ERROR] ${message}`, data || "");
    axiomLogger.error(message, data);
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data || "");
    axiomLogger.warn(message, data);
  },
  flush: async () => {
    await axiomLogger.flush();
  }
};

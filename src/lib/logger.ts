import { Logger } from "next-axiom";

const axiomLogger = new Logger();

const PII_KEYS = [
  "email",
  "phone",
  "phoneNumber",
  "ssn",
  "tin",
  "ein",
  "password",
  "secret",
  "token",
  "address",
  "street",
  "city",
  "state",
  "zip",
  "zipCode",
  "birthDate",
  "dob",
];

function maskValue(value: any): any {
  if (typeof value === "string") {
    if (value.length <= 4) return "****";
    return value.substring(0, 2) + "****" + value.substring(value.length - 2);
  }
  return "****";
}

function maskPII(data: any): any {
  if (!data || typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map(maskPII);
  }

  const maskedData = { ...data };
  for (const key in maskedData) {
    const lowerKey = key.toLowerCase();
    if (PII_KEYS.some((piiKey) => lowerKey.includes(piiKey))) {
      maskedData[key] = maskValue(maskedData[key]);
    } else if (typeof maskedData[key] === "object") {
      maskedData[key] = maskPII(maskedData[key]);
    }
  }
  return maskedData;
}

export const logger = {
  info: (message: string, data?: any) => {
    const maskedData = data ? maskPII(data) : undefined;
    console.log(`[INFO] ${message}`, maskedData || "");
    axiomLogger.info(message, maskedData);
  },
  error: (message: string, data?: any) => {
    const maskedData = data ? maskPII(data) : undefined;
    console.error(`[ERROR] ${message}`, maskedData || "");
    axiomLogger.error(message, maskedData);
  },
  warn: (message: string, data?: any) => {
    const maskedData = data ? maskPII(data) : undefined;
    console.warn(`[WARN] ${message}`, maskedData || "");
    axiomLogger.warn(message, maskedData);
  },
  flush: async () => {
    await axiomLogger.flush();
  },
};

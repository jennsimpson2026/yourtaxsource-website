import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter, that allows X requests per duration
export const createRatelimiter = (requests = 10, duration: "10s" | "60s" | "1h" | "1d" = "10s") => {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn("Upstash Redis not configured. Rate limiting is disabled.");
    // If not configured, return a dummy limiter that always allows
    return {
      limit: async () => ({ success: true, limit: requests, remaining: requests, reset: 0 }),
    };
  }

  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(requests, duration),
    analytics: true,
    prefix: "@upstash/ratelimit",
  });
};

// Common limiters
export const loginLimiter = createRatelimiter(5, "60s"); // 5 attempts per minute
export const contactFormLimiter = createRatelimiter(3, "60s"); // 3 messages per minute
export const intakeLimiter = createRatelimiter(10, "1h"); // 10 intake starts per hour
export const forgotPasswordLimiter = createRatelimiter(3, "1h"); // 3 password resets per hour
export const saveLimiter = createRatelimiter(60, "1h"); // 60 saves per hour

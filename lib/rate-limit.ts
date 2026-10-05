import { RateLimiterMemory } from "rate-limiter-flexible";

export const bookingLimiter = new RateLimiterMemory({
  points: 5, // 5 requests
  duration: 3600, // per 1 hour
});

export const apiLimiter = new RateLimiterMemory({
  points: 60, // 60 requests
  duration: 60, // per minute
});

import rateLimit from "express-rate-limit";

const rateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 Minutes
  max: 50, // 50 Max Requests / 5 Minutes
  message: "Too Many Requests! Wait Before Making Further Requests!",
});

export default rateLimiter;
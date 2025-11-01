import type { NextFunction, Request, Response } from "express";
import { RateLimitError } from "./error.middleware";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequest?: boolean;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

export class RateLimitMiddleware {
  private static memoryStore: RateLimitStore = {};
  private static cleanupInterval: NodeJS.Timeout;

  /**
   * Initializes the cleanup interval for expired entries.
   */
  static initialize() {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      Object.keys(this.memoryStore).forEach((key) => {
        if (!this.memoryStore[key]) return;

        if (this.memoryStore[key].resetTime <= now) {
          delete this.memoryStore[key];
        }
      });
    }, 60000);
  }

  /**
   * Stops the cleanup interval and cleans up resources.
   */
  static cleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  /**
   * Memory-based rate limiting middleware for Express.
   *
   * @param config - Rate limit configuration
   * @returns Express middleware function
   */
  static memoryRateLimit(config: RateLimitConfig) {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = this.getClientIdentifier(req);
      const now = Date.now();
      const windowStart = now - config.windowMs;

      if (
        !this.memoryStore[key] ||
        this.memoryStore[key].resetTime <= windowStart
      ) {
        this.memoryStore[key] = {
          count: 0,
          resetTime: now + config.windowMs,
        };
      }

      if (this.memoryStore[key].count >= config.maxRequests) {
        const resetTime = this.memoryStore[key].resetTime;
        const retryAfter = Math.ceil((resetTime - now) / 1000);

        res.setHeader("X-RateLimit-Limit", config.maxRequests.toString());
        res.setHeader("X-RateLimit-Remaining", "0");
        res.setHeader("X-RateLimit-Reset", resetTime.toString());
        res.setHeader("Retry-After", retryAfter.toString());

        throw new RateLimitError(
          config.message ||
            `Rate limit exceeded. Try again in ${retryAfter} seconds.`
        );
      }

      this.memoryStore[key].count++;

      const remaining = Math.max(
        0,
        config.maxRequests - this.memoryStore[key].count
      );
      const resetTime = this.memoryStore[key].resetTime;

      res.setHeader("X-RateLimit-Limit", config.maxRequests.toString());
      res.setHeader("X-RateLimit-Remaining", remaining.toString());
      res.setHeader("X-RateLimit-Reset", resetTime.toString());

      if (config.skipSuccessfulRequest) {
        const originalSend = res.end;
        res.send = function (body) {
          if (res.statusCode < 400) {
            if (RateLimitMiddleware.memoryStore[key]) {
              RateLimitMiddleware.memoryStore[key].count--;
            }
          }
          return originalSend(body);
        };
      }

      next();
    };
  }

  /**
   * User-based rate limiting middleware for authenticated users.
   *
   * @param config - Rate limit configuration
   * @returns Express middleware function
   */
  static userRateLimit(config: RateLimitConfig) {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = (req as any).user;
      if (!user) {
        return next();
      }

      const key = `user:${user.id}`;
      const now = Date.now();
      const windowStart = now - config.windowMs;

      if (
        !this.memoryStore[key] ||
        this.memoryStore[key].resetTime <= windowStart
      ) {
        this.memoryStore[key] = {
          count: 0,
          resetTime: now + config.windowMs,
        };
      }

      if (this.memoryStore[key].count >= config.maxRequests) {
        const resetTime = this.memoryStore[key].resetTime;
        const retryAfter = Math.ceil((resetTime - now) / 1000);

        res.setHeader("X-RateLimit-Limit", config.maxRequests.toString());
        res.setHeader("X-RateLimit-Remaining", "0");
        res.setHeader("X-RateLimit-Reset", resetTime.toString());
        res.setHeader("Retry-After", retryAfter.toString());

        throw new RateLimitError(
          config.message ||
            `Rate limit exceeded. Try again in ${retryAfter} seconds.`
        );
      }

      this.memoryStore[key].count++;

      const remaining = Math.max(
        0,
        config.maxRequests - this.memoryStore[key].count
      );
      const resetTime = this.memoryStore[key].resetTime;

      res.setHeader("X-RateLimit-Limit", config.maxRequests.toString());
      res.setHeader("X-RateLimit-Remaining", remaining.toString());
      res.setHeader("X-RateLimit-Reset", resetTime.toString());

      next();
    };
  }

  /**
   * Endpoint-specific rate limiting middleware.
   *
   * @param endpoint - Endpoint identifier for rate limiting
   * @param config - Rate limit configuration
   * @returns Express middleware function
   */
  static endpointRateLimit(endpoint: string, config: RateLimitConfig) {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = (req as any).user;
      const key = user
        ? `endpoint:${endpoint}:user:${user.id}`
        : `endpoint:${endpoint}:ip:${this.getClientIdentifier(req)}`;
      const now = Date.now();
      const windowStart = now - config.windowMs;

      if (
        !this.memoryStore[key] ||
        this.memoryStore[key].resetTime <= windowStart
      ) {
        this.memoryStore[key] = {
          count: 0,
          resetTime: now + config.windowMs,
        };
      }

      if (this.memoryStore[key].count >= config.maxRequests) {
        const resetTime = this.memoryStore[key].resetTime;
        const retryAfter = Math.ceil((resetTime - now) / 1000);

        throw new RateLimitError(
          config.message ||
            `Rate limit exceeded for ${endpoint}. Try again in ${retryAfter} seconds.`
        );
      }

      this.memoryStore[key].count++;
      next();
    };
  }

  /**
   * Extracts and formats client IP address for rate limiting.
   *
   * @param req - Express request object
   * @returns Formatted client IP address
   */
  private static getClientIdentifier(req: Request): string {
    const ip =
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      "unknown";

    return ip.replace(/^::ffff:/, "");
  }
}

/**
 * Pre-configured rate limiters for common use cases.
 *
 * @example
 * // Apply general rate limiting
 * app.use(rateLimit.general);
 *
 * // Apply auth-specific rate limiting
 * app.use('/auth', rateLimit.auth);
 *
 * // Apply user-specific rate limiting
 * app.use('/api', rateLimit.user);
 *
 * // Create endpoint-specific limiter
 * const loginLimiter = rateLimit.createEndpointLimiter('login', 5, 5);
 * app.post('/login', loginLimiter, authController.login);
 */
export const rateLimit = {
  general: RateLimitMiddleware.memoryRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 request per window
    message: "Too many request from this IP, please try again later.",
  }),

  auth: RateLimitMiddleware.memoryRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000, // 1000 request per window
    message: "Too many authentication attempts, please try again later.",
  }),

  user: RateLimitMiddleware.userRateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 request per minute per user
    message: "Too many requests, please slow down.",
  }),

  createEndpointLimiter: (
    endpoint: string,
    max: number,
    windowMinutes: number = 1
  ) =>
    RateLimitMiddleware.endpointRateLimit(endpoint, {
      windowMs: windowMinutes * 60 * 1000,
      maxRequests: max,
      message: `Too many requests to ${endpoint}, please try again later.`,
    }),
};

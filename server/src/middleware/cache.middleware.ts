import type { NextFunction, Request, Response } from "express";
import { RateLimitMiddleware } from "./rateLimit.middleware";

interface CacheConfig {
  ttl: number; // time to live calculated in ms
  varyByUser?: boolean;
  varyByQuery?: boolean;
  skipCache?: (req: Request) => boolean;
  shouldCache?: (res: Response) => boolean;
}

interface CacheStore {
  [key: string]: {
    data: any;
    expiry: number;
    headers: any;
  };
}

export class CacheMiddleware {
  private static cacheStore: CacheStore = {};
  private static cleanupInterval: NodeJS.Timeout;

  static initialize() {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      Object.keys(this.cacheStore).forEach((key) => {
        if (!this.cacheStore[key]) return;

        if (this.cacheStore[key]?.expiry <= now) {
          delete this.cacheStore[key];
        }
      });
    }, 60000); // Clean every minute
  }

  static cleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  static cache(config: CacheConfig) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (req.method != "GET") {
        return next();
      }

      if (config.skipCache && config.skipCache(req)) {
        return next();
      }

      const cacheKey = this.generateCacheKey(req, config);

      const cached = this.cacheStore[cacheKey];
      const now = Date.now();

      if (cached && cached.expiry > now) {
        res.set(cached.headers);
        return res.json(cached.data);
      }

      const originalJson = res.json;
      res.json = function (body) {
        if (config.shouldCache && !config.shouldCache(res)) {
          return originalJson.call(this, body);
        }

        if (res.statusCode >= 200 && res.statusCode <= 300) {
          const cacheData = {
            data: body,
            expiry: now + config.ttl,
            headers: {
              "X-Cache": "HIT",
              "Cache-Control": `public, max-age-${Math.floor(
                config.ttl / 1000
              )}`,
              ...res.getHeaders(),
            },
          };

          CacheMiddleware.cacheStore[cacheKey] = cacheData;
        }

        return originalJson.call(this, body);
      };

      next();
    };
  }

  static clearCache(pattern?: string) {
    if (!pattern) {
      this.cacheStore = {};
      return;
    }

    Object.keys(this.cacheStore).forEach((key) => {
      if (key.includes(pattern)) {
        delete this.cacheStore[key];
      }
    });
  }

  static getStats() {
    const keys = Object.keys(this.cacheStore);
    const now = Date.now();
    const expired = keys.filter(
      (key) => this.cacheStore[key] && this.cacheStore[key]?.expiry <= now
    );

    return {
      total: keys.length,
      expired: expired.length,
      active: keys.length - expired.length,
    };
  }

  private static generateCacheKey(req: Request, config: CacheConfig): string {
    const parts = [req.originalUrl];

    if (config.varyByUser) {
      const user = (req as any).user;
      parts.push(user ? `user:${user.id}` : "user:anonymous");
    }

    if (config.varyByQuery) {
      const queryString = JSON.stringify(req.query);
      parts.push(`query:${queryString}`);
    }

    return parts.join("|");
  }
}

export const cache = {
  short: CacheMiddleware.cache({
    ttl: 30 * 1000, // 30 seconds
    varyByUser: true,
    shouldCache: (res) => res.statusCode === 200,
  }),

  medium: CacheMiddleware.cache({
    ttl: 5 * 60 * 1000, // 5 minutes
    varyByUser: true,
    shouldCache: (res) => res.statusCode === 200,
  }),

  long: CacheMiddleware.cache({
    ttl: 60 * 60 * 1000, // 1 hour
    varyByUser: false,
    shouldCache: (res) => res.statusCode === 200,
  }),

  user: CacheMiddleware.cache({
    ttl: 2 * 60 * 1000, // 2 minutes
    varyByUser: true,
    varyByQuery: true,
    shouldCache: (res) => res.statusCode == 200,
  }),

  skip: (req: Request) => {
    return (
      req.query.noCache === "true" ||
      req.headers["cache-control"] === "no-cache"
    );
  },
};

RateLimitMiddleware.initialize();
CacheMiddleware.initialize();

process.on("SIGINT", () => {
  RateLimitMiddleware.cleanup();
  CacheMiddleware.cleanup();
  process.exit(0);
});

process.on("SIGTERM", () => {
  RateLimitMiddleware.cleanup();
  CacheMiddleware.cleanup();
  process.exit(0);
});

import type { Request, Response, NextFunction } from "express";

interface CorsOptions {
  origins: string[];
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
  preflightContinue?: boolean;
}

export class CorsMiddleware {
  private static defaultOptions: CorsOptions = {
    origins: [],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "X-API-Key",
      "X-Device-Id",
      "X-Platform",
      "X-App-Version",
    ],
    exposedHeaders: [
      "X-RateLimit-Limit",
      "X-RateLimit-Remaining",
      "X-RateLimit-Reset",
      "X-Powered-By",
    ],
    credentials: true,
    maxAge: 86400, // 24 hours
    preflightContinue: false,
  };

  /**
   * Configures and returns CORS middleware with custom options.
   *
   * @param options - Partial CORS configuration options
   * @returns Express middleware function
   */
  static configure(options: Partial<CorsOptions> = {}) {
    const config = { ...this.defaultOptions, ...options };

    this.initializeFromEnv(config);

    return (req: Request, res: Response, next: NextFunction) => {
      try {
        if (req.method === "OPTIONS") {
          this.handlePreflight(req, res, config);
          if (!config.preflightContinue) {
            return res.status(204).end();
          }
        }
        this.handleCorsHeaders(req, res, config);
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Handles CORS preflight (OPTIONS) requests.
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param config - CORS configuration options
   */
  private static handlePreflight(
    req: Request,
    res: Response,
    config: CorsOptions
  ) {
    const origin = this.getValidOrigin(req, config);

    if (!origin && config.origins.length > 0) {
      res.status(403).json({
        success: false,
        error: {
          code: "CORS_ORIGIN_NOT_ALLOWED",
          message: "Origin not found",
        },
      });
      return;
    }

    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.setHeader("Access-Control-Allow-Methods", config.methods!.join(", "));

    const requestedHeaders = req.headers["access-control-request-headers"];
    const allowedHeaders = requestedHeaders
      ? `${config.allowedHeaders!.join(", ")}, ${requestedHeaders}`
      : config.allowedHeaders!.join(", ");

    res.setHeader("Access-Control-Allow-Headers", allowedHeaders);

    if (config.exposedHeaders && config.exposedHeaders.length > 0) {
      res.setHeader(
        "Access-Control-Expose-Headers",
        config.exposedHeaders.join(", ")
      );
    }

    if (config.credentials) {
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    if (config.maxAge && config.maxAge > 0) {
      res.setHeader("Access-Control-Max-Age", config.maxAge.toString());
    }

    res.setHeader("X-CORS-Enabled", "true");
    if (origin) {
      res.setHeader("X-CORS-Origin", origin);
    }
  }

  /**
   * Handles CORS headers for regular requests.
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param config - CORS configuration options
   */
  private static handleCorsHeaders(
    req: Request,
    res: Response,
    config: CorsOptions
  ) {
    const origin = this.getValidOrigin(req, config);

    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }

    if (config.exposedHeaders && config.exposedHeaders.length > 0) {
      res.setHeader(
        "Access-Control-Expose-Headers",
        config.exposedHeaders.join(", ")
      );
    }

    if (config.credentials) {
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    res.setHeader("Vary", "Origin");
    this.setSecurityHeaders(res);
  }

  /**
   * Validates and returns allowed origin for CORS requests.
   *
   * @param req - Express request object
   * @param config - CORS configuration options
   * @returns Allowed origin string or null if not allowed
   */
  private static getValidOrigin(
    req: Request,
    config: CorsOptions
  ): string | null {
    const requestOrigin = req.headers.origin as string;

    if (config.origins.length === 0) {
      return requestOrigin || "*";
    }

    if (requestOrigin && this.isOriginAllowed(requestOrigin, config.origins)) {
      return requestOrigin;
    }

    return null;
  }

  /**
   * Checks if an origin is allowed based on CORS configuration.
   *
   * @param origin - Request origin to check
   * @param allowedOrigins - Array of allowed origin patterns
   * @returns True if origin is allowed
   */
  private static isOriginAllowed(
    origin: string,
    allowedOrigins: string[]
  ): boolean {
    return allowedOrigins.some((allowedOrigin) => {
      if (allowedOrigin === "*") return true;
      if (allowedOrigin === origin) return true;

      if (allowedOrigin.includes("*")) {
        const regex = new RegExp(
          "^" + allowedOrigin.replace(/\*/g, ".*") + "$"
        );
        return regex.test(origin);
      }

      return false;
    });
  }

  /**
   * Sets security headers for HTTP responses.
   *
   * @param res - Express response object
   */
  private static setSecurityHeaders(res: Response) {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");

    res.removeHeader("X-Powered-By");
  }

  /**
   * Initializes CORS configuration from environment variables.
   *
   * @param config - CORS configuration object to populate
   */
  private static initializeFromEnv(config: CorsOptions) {
    if (process.env.CORS_ORIGINS) {
      config.origins = process.env.CORS_ORIGINS.split(",").map((origin) =>
        origin.trim()
      );
    }

    if (config.origins.length === 0) {
      config.origins = this.getDefaultOrigins();
    }

    if (process.env.CORS_METHODS) {
      config.methods = process.env.CORS_METHODS.split(",").map((method) =>
        method.trim()
      );
    }

    if (process.env.CORS_CREDENTIALS) {
      config.credentials = process.env.CORS_CREDENTIALS === "true";
    }
  }

  /**
   * Gets default allowed origins based on environment.
   *
   * @returns Array of default origin URLs
   */
  private static getDefaultOrigins(): string[] {
    const defaults = [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:3000",
      "capacitor://localhost",
      "ionic://localhost",
    ];

    if (process.env.NODE_ENV === "production" && process.env.FRONTEND_URL) {
      defaults.push(process.env.FRONTEND_URL);
    }

    return defaults;
  }

  /**
   * Pre-configured CORS environments for common use cases.
   *
   * @example
   * // Development environment
   * app.use(CorsMiddleware.environments.development);
   *
   * // Production environment
   * app.use(CorsMiddleware.environments.production);
   *
   * // Mobile app environment
   * app.use(CorsMiddleware.environments.mobile);
   *
   * // Public API environment
   * app.use(CorsMiddleware.environments.publicApi);
   */
  static environments = {
    development: this.configure({
      origins: [],
      credentials: true,
    }),

    production: this.configure({
      origins: process.env.CORS_ORIGINS?.split(",") || [],
      credentials: true,
    }),

    mobile: this.configure({
      origins: [
        "capacitor://localhost",
        "ionic://localhost",
        "http://localhost",
        ...(process.env.MOBILE_APP_ORIGINS?.split(",") || []),
      ],
      credentials: true,
    }),

    publicApi: this.configure({
      origins: ["*"],
      credentials: false,
      exposedHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining"],
    }),
  };

  /**
   * Dynamic CORS middleware that applies different configurations based on request path.
   *
   * @example
   * // Apply dynamic CORS based on route patterns
   * app.use(CorsMiddleware.dynamic);
   */
  static dynamic = (req: Request, res: Response, next: NextFunction) => {
    const path = req.path;

    if (path.startsWith("/api/")) {
      return this.environments.production(req, res, next);
    }

    if (path.startsWith("/webhook/")) {
      return next();
    }
    return this.environments.development(req, res, next);
  };
}

export const cors = {
  development: CorsMiddleware.environments.development,
  production: CorsMiddleware.environments.production,
  mobile: CorsMiddleware.environments.mobile,

  dynamic: CorsMiddleware.dynamic,

  configure: CorsMiddleware.configure,
};

export default CorsMiddleware.environments.development;

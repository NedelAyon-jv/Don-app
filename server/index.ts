import express, {
  type Application,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { firebaseAdmin } from "./src/services";
import helmet from "helmet";
import {
  CorsMiddleware,
  errorHandler,
  notFoundHandler,
  rateLimit,
} from "./src/middleware";
import compression from "compression";
import morgan from "morgan";

import userRoutes from "./src/routes/user/user.router";
import authRoutes from "./src/routes/user/auth.router";
import publicationRoutes from "./src/routes/publications/publications.router";

class BackendServer {
  public app: Application;
  public port: string | number;

  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;

    this.initializeConfiguration();
    this.initializeFirebase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeHealthChecks();
  }

  private initializeConfiguration(): void {
    // Validate required environment variables
    const requiredEnvVars = [
      "FIREBASE_PROJECT_ID",
      "FIREBASE_CLIENT_EMAIL",
      "FIREBASE_PRIVATE_KEY",
      "JWT_ACCESS_SECRET",
      "JWT_REFRESH_SECRET",
    ];

    const missingEnvVars = requiredEnvVars.filter(
      (envVar) => !process.env[envVar]
    );

    if (missingEnvVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingEnvVars.join(", ")}`
      );
    }

    console.log("✅ Environment configuration validated");
  }

  private async initializeFirebase(): Promise<void> {
    try {
      const health = await firebaseAdmin.healthCheck();
      const services =
        Object.entries(health.services)
          .filter(([, available]) => available)
          .map(([name]) => name)
          .join(", ") || "none";
      console.log(`✅ Firebase Admin SDK initialized - Services: ${services}`);
    } catch (error) {
      console.error("❌ Firebase Admin SDK initialization failed:", error);
      // Don't crash the app if Firebase fails
    }
  }

  private initializeMiddlewares(): void {
    this.app.use(
      helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
      })
    );

    this.app.use(CorsMiddleware.dynamic);

    this.app.use(compression());

    this.app.use(
      express.json({
        limit: "10mb",
        verify: (req: any, res, buf) => {
          req.rawBody = buf;
        },
      })
    );

    this.app.use(
      express.urlencoded({
        extended: true,
        limit: "10mb",
      })
    );

    this.app.use(
      morgan("combined", {
        skip: (req) => req.url === "/health",
      })
    );

    this.app.use((req: Request, res: Response, next: NextFunction) => {
      console.log(`📥 ${req.method} ${req.url}`, {
        query: req.query,
        params: req.params,
        userAgent: req.get("User-Agent"),
        ip: req.ip,
        user: (req as any).user?.id || "anonymous",
      });
      next();
    });

    this.app.use(rateLimit.general);

    console.log("✅ Middlewares initialized");
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use("/api/users", userRoutes);
    this.app.use("/api/auth", authRoutes);
    this.app.use("/api/publications", publicationRoutes);

    // Root endpoint
    this.app.get("/", (req: Request, res: Response) => {
      res.json({
        message: "DON-APP Backend API",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        endpoints: {
          auth: "/api/auth",
          users: "/api/users",
          health: "/health",
        },
      });
    });

    console.log("✅ Routes initialized");
  }

  private initializeErrorHandling(): void {
    // 404 handler - must be after all routes
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);

    // Unhandled rejection handler
    process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
      console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
    });

    // Uncaught exception handler
    process.on("uncaughtException", (error: Error) => {
      console.error("❌ Uncaught Exception:", error);
      process.exit(1);
    });

    console.log("✅ Error handling initialized");
  }

  private initializeHealthChecks(): void {
    // Basic health check
    this.app.get("/health", async (req: Request, res: Response) => {
      const firebaseHealth = await firebaseAdmin.healthCheck();

      const healthCheck = {
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        services: {
          firebase: firebaseHealth,
          database: "firestore",
        },
        memory: process.memoryUsage(),
      };

      res.json(healthCheck);
    });

    // Detailed health check
    this.app.get("/health/detailed", async (req: Request, res: Response) => {
      try {
        const [firebaseHealth] = await Promise.all([
          firebaseAdmin.healthCheck(),
          // firestoreService.healthCheck(),
          // cache.getStats(),
        ]);

        const healthDetails = {
          status: "OK",
          timestamp: new Date().toISOString(),
          checks: {
            firebase: firebaseHealth,
            firestore: { status: "healthy" },
            cache: { status: "healthy" },
            memory: this.getMemoryHealth(),
          },
        };

        res.json(healthDetails);
      } catch (error) {
        res.status(503).json({
          status: "SERVICE_UNAVAILABLE",
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    console.log("✅ Health checks initialized");
  }

  private getMemoryHealth(): { status: string; usage: any } {
    const memoryUsage = process.memoryUsage();
    const usedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const totalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const usagePercent = (usedMB / totalMB) * 100;

    return {
      status: usagePercent > 90 ? "WARNING" : "HEALTHY",
      usage: {
        used: `${usedMB} MB`,
        total: `${totalMB} MB`,
        percentage: `${Math.round(usagePercent)}%`,
      },
    };
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`
🚀 Marketplace Backend API Server Started!

📍 Environment: ${process.env.NODE_ENV || "development"}
🌐 Server running on port: ${this.port}
📊 API Documentation: http://localhost:${this.port}/
❤️  Health Check: http://localhost:${this.port}/health
🔍 Detailed Health: http://localhost:${this.port}/health/detailed

⏰ Started at: ${new Date().toISOString()}
      `);
    });
  }
}

const server = new BackendServer();
server.start();

export default server.app;

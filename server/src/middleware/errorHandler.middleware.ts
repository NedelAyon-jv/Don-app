import type { NextFunction, Request, Response } from "express";
import { AppError, ValidationError } from "./error.middleware";
import { serviceErrorMap } from "../models/errors/errors";

/**
 * Global error handling middleware for Express applications.
 * 
 * Handles various error types and returns structured JSON responses.
 * 
 * @param error - The error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * 
 * @example
 * // In your Express app:
 * app.use(errorHandler);
 */
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error occurred:", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    user: (req as any).user?.id,
    timestamp: new Date().toISOString(),
  });

  /**
   * APP ERRORS
   */
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.errorCode,
        message: error.message,
        ...(error instanceof ValidationError && { details: error.details }),
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * TOKENS ERRORS
   */
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid authentication token",
      },
      timestamp: new Date().toISOString(),
    });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      error: {
        code: "TOKEN_EXPIRED",
        message: "Authentication token expired",
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * VALIDATIONS ERRORS
   */
  if (error.message.startsWith("VALIDATION_ERROR:")) {
    try {
      const details = JSON.parse(
        error.message.replace("VALIDATION_ERROR: ", "")
      );
      return res.status(422).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          details,
        },
        timestamp: new Date().toISOString(),
      });
    } catch {
      // fall back
    }
  }

  /**
   * SERVICES ERRORS
   */
  const serviceError = serviceErrorMap[error.message];
  if (serviceError) {
    return res.status(serviceError.status).json({
      success: false,
      error: {
        error: serviceError.code,
        message: error.message,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * DEFAULT SERVER ERRORS
   */
  const statusCode = (error as any).statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : error.message;

      res.status(statusCode).json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
        },
        timestamp: new Date().toISOString()
      });
};

/**
 * 404 handler middleware for undefined routes.
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export const notFoundHandler = (req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'ENDPOINT_NOT_FOUND',
            message: `Route ${req.method} ${req.url} not found`,
        },
        timestamp: new Date().toISOString(),
    })
}

/**
 * Wraps async route handlers to automatically catch errors and pass to error middleware.
 * 
 * @param fn - Async route handler function
 * @returns Wrapped route handler that catches async errors
 */
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    }
}

/**
 * Global handler for unhandled promise rejections.
 */
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
})

/**
 * Global handler for uncaught promise exceptions.
 */
process.on('uncaughtException', (error: Error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
})
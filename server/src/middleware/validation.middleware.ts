import type { NextFunction, Request, Response } from "express";
import {
  safeParse,
  type BaseSchema,
  type InferOutput,
} from "valibot";
import { ValidationError } from "./error.middleware";

export class ValidationMiddleware {
  /**
   * Express middleware for request body validation using a schema.
   *
   * @param schema - Validation schema to validate against
   * @returns Express middleware function
   */
  static validateBody<T extends BaseSchema<any, any, any>>(schema: T) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = safeParse(schema, req.body);

        if (!result.success) {
          const errors = this.formatValidationErrors(result.issues);
          throw new ValidationError("Request body validation failed", errors);
        }

        req.body = result.output as InferOutput<T>;
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Express middleware for query parameters validation using a schema.
   *
   * @param schema - Validation schema to validate against
   * @returns Express middleware function
   */
  static validateQuery<T extends BaseSchema<any, any, any>>(schema: T) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = safeParse(schema, req.query);

        if (!result.success) {
          const errors = this.formatValidationErrors(result.issues);
          throw new ValidationError(
            "Query parameters validation failed",
            errors
          );
        }

        req.query = result.output as any;
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Express middleware for URL parameters validation using a schema.
   *
   * @param schema - Validation schema to validate against
   * @returns Express middleware function
   */
  static validateParams<T extends BaseSchema<any, any, any>>(schema: T) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = safeParse(schema, req.params);

        if (!result.success) {
          const errors = this.formatValidationErrors(result.issues);
          throw new ValidationError("URL parameters validation failed", errors);
        }

        req.params = result.output as any;
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Express middleware for request headers validation using a schema.
   *
   * @param schema - Validation schema to validate against
   * @returns Express middleware function
   */
  static validateHeaders<T extends BaseSchema<any, any, any>>(schema: T) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = safeParse(schema, req.headers);

        if (!result.success) {
          const errors = this.formatValidationErrors(result.issues);
          throw new ValidationError(
            "Request headers validation failed",
            errors
          );
        }

        req.headers = { ...req.headers, ...result.output };
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Express middleware for comprehensive request validation across body, query, params, and headers.
   *
   * @param schemas - Object containing schemas for different request parts
   * @returns Express middleware function
   */
  static validateRequest<
    T extends {
      body?: BaseSchema<any, any, any>;
      query?: BaseSchema<any, any, any>;
      params?: BaseSchema<any, any, any>;
      headers?: BaseSchema<any, any, any>;
    }
  >(schemas: T) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const errors: any[] = [];

        if (schemas.body) {
          const result = safeParse(schemas.body, req.body);
          if (!result.success) {
            errors.push(...this.formatValidationErrors(result.issues, "body"));
          } else {
            req.body = result.output;
          }
        }

        if (schemas.query) {
          const result = safeParse(schemas.query, req.query);
          if (!result.success) {
            errors.push(...this.formatValidationErrors(result.issues, "query"));
          } else {
            req.query = result.output as any;
          }
        }

        if (schemas.params) {
          const result = safeParse(schemas.params, req.params);
          if (!result.success) {
            errors.push(
              ...this.formatValidationErrors(result.issues, "params")
            );
          } else {
            req.params = result.output as any;
          }
        }

        if (schemas.headers) {
          const result = safeParse(schemas.headers, req.headers);
          if (!result.success) {
            errors.push(
              ...this.formatValidationErrors(result.issues, "headers")
            );
          } else {
            req.headers = { ...req.headers, ...result.output };
          }
        }

        if (errors.length > 0) {
          throw new ValidationError("Request validation failed", errors);
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Express middleware for file upload validation.
   *
   * @param options - File validation options
   * @returns Express middleware function
   */
  static validateFiles(options: {
    maxCount?: number;
    maxSize?: number;
    allowedMimeTypes?: string[];
    required?: boolean;
  }) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const files = (req as Request & { files?: any[] }).files;

        if (options.required && (!files || files.length === 0)) {
          throw new ValidationError("File are required", [
            {
              field: "files",
              message: "At least one file is required",
            },
          ]);
        }

        if (files && options.maxCount && files.length > options.maxCount) {
          throw new ValidationError("Too many files", [
            {
              field: "files",
              message: `Maximum allowed is ${options.maxCount}`,
            },
          ]);
        }

        if (files && options.maxSize) {
          const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0);
          if (totalSize > options.maxSize) {
            throw new ValidationError("File too large", [
              {
                field: "files",
                message: `Files exceed maximum size of ${this.formatFileSize(
                  options.maxSize
                )}`,
              },
            ]);
          }
        }

        if (
          files &&
          options.allowedMimeTypes &&
          options.allowedMimeTypes.length > 0
        ) {
          const invalid = files.find(
            (f) => !options.allowedMimeTypes!.includes(f.mimetype)
          );
          if (invalid) {
            throw new ValidationError("Invalid file type", [
              {
                field: "files",
                message: `File type must be one of: ${options.allowedMimeTypes.join(
                  ", "
                )}`,
              },
            ]);
          }
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Express middleware for conditional validation based on request conditions.
   *
   * @param condition - Function that determines if validation should occur
   * @param schema - Validation schema to apply if condition is met
   * @param part - Request part to validate (default: "body")
   * @returns Express middleware function
   */
  static validateIf<T extends BaseSchema<any, any, any>>(
    condition: (req: Request) => boolean,
    schema: T,
    part: "body" | "query" | "params" = "body"
  ) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        if (condition(req)) {
          const result = safeParse(schema, req[part]);

          if (!result.success) {
            const errors = this.formatValidationErrors(result.issues, part);
            throw new ValidationError(`${part} validation failed`, errors);
          }

          req[part] = result.output as any;
        }
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Express middleware for input sanitization to prevent XSS attacks.
   *
   * @param fields - Specific fields to sanitize or "all" for entire request
   * @returns Express middleware function
   */
  static sanitizeInput(fields: string[] | "all" = "all") {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const sanitize = (obj: any): any => {
          if (typeof obj === "string") {
            return obj
              .replace(
                /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
                ""
              )
              .replace(/on\w+="[^"]*"/g, "")
              .replace(/on\w+='[^']*'/g, "")
              .trim();
          }

          if (Array.isArray(obj)) {
            return obj.map(sanitize);
          }

          if (obj && typeof obj === "object") {
            const sanitized: any = {};
            for (const [key, value] of Object.entries(obj)) {
              sanitized[key] = sanitize(value);
            }
            return sanitized;
          }

          return obj;
        };

        if (fields === "all") {
          req.body = sanitize(req.body);
          req.query = sanitize(req.query);
        } else {
          fields.forEach((filed) => {
            if (req.body[filed]) {
              req.body[filed] = sanitize(req.body[filed]);
            }
          });
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Formats validation errors into a standardized structure.
   *
   * @param issues - Raw validation issues from schema parser
   * @param source - Source of the validation (body, query, params, headers)
   * @returns Formatted validation errors array
   */
  private static formatValidationErrors(
    issues: any[],
    source: string = "body"
  ) {
    return issues.map((issue) => ({
      field: issue.path?.map((p: any) => p.key).join(".") || source,
      message: issue.message,
      code: issue.type,
      value: issue.input,
    }));
  }

  /**
   * Formats file size in bytes to human-readable string.
   *
   * @param bytes - File size in bytes
   * @returns Formatted file size string (e.g., "2.5 MB")
   */
  private static formatFileSize(bytes: number): string {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  }
}

export const validate = {
  // Body validation
  body: ValidationMiddleware.validateBody,

  // Query validation
  query: ValidationMiddleware.validateQuery,

  // Params validation
  params: ValidationMiddleware.validateParams,

  // Headers validation
  headers: ValidationMiddleware.validateHeaders,

  // Multi-part validation
  request: ValidationMiddleware.validateRequest,

  // Filed validation
  files: ValidationMiddleware.validateFiles,

  // Conditional validation
  if: ValidationMiddleware.validateIf,

  // Sanitization
  sanitize: ValidationMiddleware.sanitizeInput,
};

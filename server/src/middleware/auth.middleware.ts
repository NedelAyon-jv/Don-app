import type { NextFunction, Request } from "express";
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
} from "./error.middleware";
import { JWTService } from "../services/User/JWT.service";
import { UserService } from "../services/User/User.service";
import { AuthService } from "../services/User/Auth.service";

declare global {
  namespace Express {
    interface Request {
      user?: any;
      token?: string;
    }
  }
}

export class AuthMiddleware {
  /**
   * Express middleware for JWT authentication.
   *
   * @example
   * // Protect routes with authentication
   * router.get('/profile', AuthMiddleware.authenticate, userController.profile);
   */
  static async authenticate(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith("Bearer ")) {
        throw new AuthenticationError("Authorization token is required");
      }

      const token = authHeader.substring(7);
      const payload = JWTService.verifyToken(token, "access");

      const user = await UserService.getUserById(payload.sub);
      if (!user) {
        throw new AuthenticationError("User account not found");
      }

      req.user = {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullname,
        isVerified: user.isVerified,
        profilePicture: user.profilePicture,
        role: user.role || "user",
      };

      req.token = token;
      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Express middleware for optional authentication.
   * Populates req.user if valid token is provided, but doesn't require it.
   *
   * @example
   * // Optional authentication for public/private hybrid endpoints
   * router.get('/posts', AuthMiddleware.optionalAuth, postController.list);
   */
  static async optionalAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;

      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        const payload = JWTService.verifyToken(token, "access");

        const user = await UserService.getUserById(payload.sub);
        if (user) {
          req.user = {
            id: user.id,
            email: user.email,
            username: user.username,
            fullName: user.fullname,
            isVerified: user.isVerified,
            profilePicture: user.profilePicture,
            role: user.role || "user",
          };
          req.token = token;
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Express middleware that requires user verification.
   * Must be used after authentication middleware.
   *
   * @example
   * // Require verified users only
   * router.post('/verify-action',
   *   AuthMiddleware.authenticate,
   *   AuthMiddleware.requireVerification,
   *   userController.sensitiveAction
   * );
   */
  static requireVerification(req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
      throw new AuthenticationError("Authentication required");
    }

    next();
  }

  /**
   * Express middleware for role-based authorization.
   *
   * @param roles - Single role or array of allowed roles
   * @returns Express middleware function
   *
   * @example
   * // Require admin role
   * router.delete('/users/:id',
   *   AuthMiddleware.authenticate,
   *   AuthMiddleware.requiredRole('admin'),
   *   userController.delete
   * );
   *
   * // Require multiple roles
   * router.get('/reports',
   *   AuthMiddleware.authenticate,
   *   AuthMiddleware.requiredRole(['admin', 'moderator']),
   *   reportController.list
   * );
   */
  static requiredRole(roles: string | string[]) {
    const roleArray = Array.isArray(roles) ? roles : [roles];

    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        throw new AuthenticationError("Authentication required");
      }

      if (!roleArray.includes(req.user.role)) {
        throw new AuthorizationError(
          `Required role: ${roleArray.join(" or ")}. Your role: ${
            req.user.role
          }`
        );
      }

      next();
    };
  }

  // NOT JET IMPLEMENTED
  static requiredPermission(permissions: string | string[]) {
    const permissionsArray = Array.isArray(permissions)
      ? permissions
      : [permissions];

    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        throw new AuthenticationError("Authentication required");
      }

      const userPermissions = req.user.permissions || [];
      const hasPermissions = permissionsArray.every((permission) =>
        userPermissions.includes(permission)
      );

      if (!hasPermissions) {
        throw new AuthorizationError(
          `Required permissions: ${permissionsArray.join(", ")}`
        );
      }

      //req.permissions = permissionsArray;
      next();
    };
  }

  /**
   * Express middleware for resource ownership verification.
   *
   * @param resourceType - Type of resource being accessed
   * @param idParam - URL parameter name containing resource ID (default: "id")
   * @returns Express middleware function
   *
   * @example
   * // User can only access their own profile
   * router.get('/users/:id',
   *   AuthMiddleware.authenticate,
   *   AuthMiddleware.requireOwnership('user'),
   *   userController.get
   * );
   *
   * // Custom ID parameter
   * router.put('/publications/:pubId',
   *   AuthMiddleware.authenticate,
   *   AuthMiddleware.requireOwnership('publication', 'pubId'),
   *   publicationController.update
   * );
   */
  static requireOwnership(resourceType: string, idParam: string = "id") {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        throw new AuthenticationError("Authentication required");
      }

      const resourceId = req.params[idParam];
      if (!resourceId) {
        throw new AppError("Resource ID parameter is required", 400);
      }

      try {
        switch (resourceId) {
          case "user":
            // Users can only access their own data unless admin
            if (req.user.id !== resourceId && req.user.role !== "admin") {
              throw new AuthorizationError(
                "You can only access your own user data"
              );
            }
            break;
          case "publication":
          case "listing":
            // Check if user owns the publication/listing
            const publication = await this.getPublication(resourceId);
            if (!publication) {
              throw new AppError("Publication not found", 404);
            }
            break;

          case "message":
            // Check if user is participant in the message/chat
            const message = await this.getMessage(resourceId);
            if (!message) {
              throw new AppError("Message not found", 404);
            }

            if (
              //!message.participants.includes(req.user.id) &&
              req.user.role !== "admin"
            ) {
              throw new AuthorizationError(
                "You can only access your own messages"
              );
            }
            break;
          default:
            // Generic ownership check - resource must have userId field
            const resource = await this.getGenericResource(
              resourceType,
              resourceId
            );
            if (!resource) {
              throw new AppError(`${resourceType} not found`, 404);
            }
        }
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Express middleware that restricts actions to the authenticated user's own account.
   *
   * @param idParam - URL parameter name containing user ID (default: "id")
   * @returns Express middleware function
   *
   * @example
   * // User can only update their own profile
   * router.put('/users/:id',
   *   AuthMiddleware.authenticate,
   *   AuthMiddleware.requireSelfAction(),
   *   userController.update
   * );
   *
   * // Custom ID parameter
   * router.patch('/profile/:userId',
   *   AuthMiddleware.authenticate,
   *   AuthMiddleware.requireSelfAction('userId'),
   *   userController.updateProfile
   * );
   */
  static requireSelfAction(idParam: string = "id") {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        throw new AuthenticationError("Authentication required");
      }

      const targetUserId = req.params[idParam];
      if (!targetUserId) {
        throw new AppError("User ID parameter is required", 400);
      }

      if (req.user.id !== targetUserId && req.user.role !== "admin") {
        throw new AuthorizationError(
          "You can only perform this action on your own account"
        );
      }

      next();
    };
  }

  /**
   * Express middleware for session validation.
   * Validates the current user session and clears invalid sessions.
   *
   * @example
   * // Validate session on protected routes
   * router.get('/dashboard',
   *   AuthMiddleware.authenticate,
   *   AuthMiddleware.validateSession,
   *   dashboardController.get
   * );
   */
  static async validateSession(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (!req.user || !req.token) {
      return next();
    }

    try {
      const session = await AuthService.validateSession(req.token);

      if (!session.isValid) {
        req.user = undefined;
        req.token = undefined;

        throw new AuthenticationError("Session expired or invalid");
      }

      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Express middleware for API key authentication.
   *
   * @param apiKeys - Array of valid API keys
   * @returns Express middleware function
   *
   * @example
   * // Protect internal API endpoints
   * router.post('/webhook/internal',
   *   AuthMiddleware.apiKeyAuth(['key123', 'key456']),
   *   webhookController.handleInternal
   * );
   */
  static apiKeyAuth(apiKeys: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const apiKey = req.headers["x-api-key"] as string;

      if (!apiKey) {
        throw new AuthenticationError("API key is required");
      }

      if (!apiKeys.includes(apiKey)) {
        throw new AuthenticationError("Invalid API key");
      }

      req.user = {
        id: "api-client",
        role: "api-client",
      };

      next();
    };
  }

  /**
   * IMPLEMENT WITH THE CORRESPONDING SERVICE
   */
  private static async getPublication(publicationId: string) {
    // return await PublicationService.getPublicationById(publicationId)
    return null;
  }

  private static async getMessage(messageId: string) {
    // return await MessageService.getMessageById(messageId);
    return null;
  }

  private static async getGenericResource(
    resourceType: string,
    resourceId: string
  ) {
    // return await GenericService.getById(resourceType, resourceId);
    return null;
  }
}

export const auth = {
  // Basic authentication
  required: AuthMiddleware.authenticate,

  // Optional authentication
  optional: AuthMiddleware.optionalAuth,

  // Verified user only
  verified: [AuthMiddleware.authenticate, AuthMiddleware.requireVerification],

  // Admin user only
  admin: [AuthMiddleware.authenticate, AuthMiddleware.requiredRole("admin")],

  // Admin or moderator user only
  moderator: [
    AuthMiddleware.authenticate,
    AuthMiddleware.requiredRole(["moderator", "admin"]),
  ],

  // Self-action only
  self: [AuthMiddleware.authenticate, AuthMiddleware.requireSelfAction()],

  // API client
  api: AuthMiddleware.apiKeyAuth(process.env.API_KEYS?.split(",") || []),

  // With session validation
  secure: [AuthMiddleware.authenticate, AuthMiddleware.validateSession],
};

export const permissions = {
  user: {
    read: "user:read",
    write: "user:write",
    delete: "user:delete",
  },

  content: {
    create: "content:create",
    read: "content:read",
    update: "content:update",
    delete: "content:delete",
  },

  system: {
    config: "system:config",
    monitor: "system:monitor",
    admin: "system:admin",
  },
};

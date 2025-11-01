import { safeParse } from "valibot";
import type { AuthResponse, AuthToken } from "../../models/types/auth";
import { UserRegistrationSchema } from "../../models/schema/user";
import { UserService } from "./User.service";
import { JWTService } from "./JWT.service";
import {
  AuthResponseSchema,
  AuthTokenSchema,
  LoginSchema,
  RefreshTokenSchema,
} from "../../models/schema/auth";
import { verify } from "crypto";

export class AuthService {
  /**
   * ================================================
   *                   START SESSION
   * ================================================
   */

  /**
   * Registers a new user and returns authentication tokens.
   *
   * @param input - User registration data
   * @returns AuthResponse with user data and authentication tokens
   *
   * @throws {Error} VALIDATION_ERROR if input validation fails
   * @throws {Error} USER_CREATION_FAILED if user creation fails
   * @throws {Error} AUTH_RESPONSE_VALIDATION_FAILED if response validation fails
   */
  static async register(input: unknown): Promise<AuthResponse> {
    try {
      const result = safeParse(UserRegistrationSchema, input);

      if (!result.success) {
        const errors = result.issues.map((issue) => ({
          field: issue.path?.map((p) => p.key).join(",") || "body",
          message: issue.message,
        }));
        throw new Error(`VALIDATION_ERROR: ${JSON.stringify(errors)}`);
      }

      const validatedData = result.output;
      const userId = await UserService.createsUser(validatedData);

      const user = await UserService.getUserById(userId);

      if (!user) {
        throw new Error("USER_CREATION_FAILED");
      }

      const token = JWTService.generateAuthToken(user);

      const authResponse = {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullname: user.fullname,
        },
        token,
      };

      const responseResult = safeParse(AuthResponseSchema, authResponse);
      if (!responseResult.success) {
        throw new Error("AUTH_RESPONSE_VALIDATION_FAILED");
      }

      return responseResult.output;
    } catch (error) {
      console.error("User registration failed:", error);
      throw error;
    }
  }

  /**
   * Authenticates a user and returns authentication tokens.
   *
   * @param input - Login credentials (email and password)
   * @returns AuthResponse with user data and authentication tokens
   *
   * @throws {Error} VALIDATION_ERROR if input validation fails
   * @throws {Error} INVALID_CREDENTIALS if email or password is incorrect
   * @throws {Error} AUTH_RESPONSE_VALIDATION_FAILED if response validation fails
   */
  static async login(input: unknown) {
    try {
      const result = safeParse(LoginSchema, input);

      if (!result.success) {
        const errors = result.issues.map((issue) => ({
          field: issue.path?.map((p) => p.key).join(".") || "body",
          message: issue.message,
        }));
        throw new Error(`VALIDATION_ERROR: ${JSON.stringify(errors)}`);
      }

      const validatedData = result.output;

      const user = await UserService.getUserByEmail(validatedData.email);
      if (!user) {
        throw new Error("INVALID_CREDENTIALS");
      }

      const isValidPassword = await UserService.verifyPassword(
        validatedData.password,
        user.password
      );
      if (!isValidPassword) {
        throw new Error("INVALID_CREDENTIALS");
      }

      const token = JWTService.generateAuthToken(user);

      const authResponse = {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullname: user.fullname,
        },
        token,
      };

      const responseResult = safeParse(AuthResponseSchema, authResponse);
      if (!responseResult.success) {
        throw new Error("AUTH_RESPONSE_VALIDATION_FAILED");
      }

      return responseResult.output;
    } catch (error) {
      console.error("User login failed:", error);
      throw error;
    }
  }

  /**
   * ================================================
   *                     TOKENS
   * ================================================
   */

  /**
   * Refreshes authentication tokens using a valid refresh token.
   *
   * @param input - Refresh token data
   * @returns New AuthToken object with fresh tokens
   *
   * @throws {Error} VALIDATION_ERROR if input validation fails
   * @throws {Error} USER_NOT_FOUND if user no longer exists
   * @throws {Error} TOKEN_VALIDATION_FAILED if token validation fails
   * @throws {Error} Various JWT verification errors
   */
  static async refreshToken(input: unknown): Promise<AuthToken> {
    try {
      const result = safeParse(RefreshTokenSchema, input);

      if (!result.success) {
        const errors = result.issues.map((issue) => ({
          field: issue.path?.map((p) => p.key).join(".") || "body",
          message: issue.message,
        }));
        throw new Error(`VALIDATION_ERROR: ${JSON.stringify(errors)}`);
      }

      const validatedData = result.output;

      const payload = JWTService.verifyToken(
        validatedData.refreshToken,
        "refresh"
      );

      const user = await UserService.getUserById(payload.sub);
      if (!user) {
        throw new Error("USER_NOT_FOUND");
      }

      JWTService.revokeToken(payload.jti);

      const tokens = JWTService.generateAuthToken(user);

      const tokenResult = safeParse(AuthTokenSchema, tokens);
      if (!tokenResult.success) {
        throw new Error("TOKEN_VALIDATION_FAILED");
      }

      return tokenResult.output;
    } catch (error) {
      console.error("Token refresh failed:", error);
      throw error;
    }
  }

  /**
   * ================================================
   *                 FINISH SESSIONS
   * ================================================
   */

  /**
   * Logs out user by revoking their access token.
   *
   * @param accessToken - Valid access token to revoke
   */
  static async logout(accessToken: string): Promise<void> {
    try {
      const payload = JWTService.verifyToken(accessToken, "access");

      JWTService.revokeToken(payload.jti);
    } catch (error) {
      console.warn("Logout with invalid token:", error);
    }
  }

  /**
   * ================================================
   *                     RESETS
   * ================================================
   */

  /**
   * Verifies a user's email address.
   *
   * @param userId - User ID to verify email for
   */
  static async verifyEmail(userId: string): Promise<void> {
    try {
      await UserService.verifyEmail(userId);
    } catch (error) {
      console.error("Email verification failed:", error);
      throw error;
    }
  }

  /**
   * Changes a user's password.
   *
   * @param userId - User ID to change password for
   * @param input - Password change data (current and new password)
   */
  static async changePassword(userId: string, input: unknown): Promise<void> {
    try {
      await UserService.updatePassword(userId, input);
    } catch (error) {
      console.error("Password change failed:", error);
      throw error;
    }
  }

  /**
   * Does nothing :3
   *
   * @param email
   * @returns
   */
  static async requestPasswordReset(email: string): Promise<void> {
    try {
      const user = await UserService.getUserByEmail(email);
      if (!user) {
        return;
      }

      // I do not think your going to do any of this
      // but here it is just in case...
      // if you reed this you are gay :3
    } catch (error) {
      console.error("Password reset request failed:", error);
      throw error;
    }
  }

  /**
   * ================================================
   *                       UTILS
   * ================================================
   */

  /**
   * Validates a user session using their access token.
   *
   * @param accessToken - User's access token to validate
   * @returns Session validation result with user data if valid
   */
  static async validateSession(accessToken: string): Promise<{
    isValid: boolean;
    user?: any;
    error?: string;
  }> {
    try {
      const payload = JWTService.verifyToken(accessToken, "access");

      const user = await UserService.getUserById(payload.sub);
      if (!user) {
        return { isValid: false, error: "USER_NOT_FOUND" };
      }

      return {
        isValid: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          isVerified: user.isVerified,
        },
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : "INVALID_TOKEN",
      };
    }
  }

  /**
   * Gets authentication context from access token.
   *
   * @param accessToken - User's access token
   * @returns Auth context with user data and token, or null if invalid
   */
  static async getAuthContext(
    accessToken: string
  ): Promise<{ user: any; token: string } | null> {
    try {
      const session = await this.validateSession(accessToken);

      if (!session.isValid || !session.user) {
        return null;
      }

      return {
        user: session.user,
        token: accessToken,
      };
    } catch (error) {
      return null;
    }
  }
}

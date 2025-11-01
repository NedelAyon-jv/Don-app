import { randomBytes } from "crypto";
import type { AuthToken, JWTPayload } from "../../models/types/auth";
import { safeParse } from "valibot";
import { AuthTokenSchema, JWTPayloadSchema } from "../../models/schema/auth";
import {
  decode,
  JsonWebTokenError,
  sign,
  TokenExpiredError,
  verify,
} from "jsonwebtoken";

interface TokenConfig {
  accessToken: {
    secret: string;
    expiresIn: string;
  };
  refreshToken: {
    secret: string;
    expiresIn: string;
  };
}

// In-memory token blacklist (use Redis in production)
const tokenBlacklist = new Set<string>();

export class JWTService {
  private static config: TokenConfig = {
    accessToken: {
      secret: process.env.JWT_ACCESS_SECRET!,
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    },
    refreshToken: {
      secret: process.env.JWT_REFRESH_SECRET!,
      expiresIn: process.env.JET_REFRESH_EXPIRES_IN || "7d",
    },
  };

  /**
   * Initializes JWT service by validating required environment variables.
   *
   * @throws {Error} If required JWT environment variables are missing
   */
  static initialize(): void {
    const missingVars = [];

    if (!process.env.JWT_ACCESS_SECRET) {
      missingVars.push("JWT_ACCESS_SECRET");
    }

    if (!process.env.JWT_REFRESH_SECRET) {
      missingVars.push("JWT_REFRESH_SECRET");
    }

    if (missingVars.length > 0) {
      throw new Error(
        `Missing JWT environment variables: ${missingVars.join(", ")}`
      );
    }

    console.log("JWT Service initialized successfully");
  }

  /**
   * Generates a cryptographically secure random token ID.
   *
   * @returns Hexadecimal string representing a 16-byte random token
   * // Returns something like "a1b2c3d4e5f67890123456789abcdef0"
   */
  static generateTokenId(): string {
    return randomBytes(16).toString("hex");
  }

  /**
   * Generates a JWT access token with standard claims.
   *
   * @param payload - Token payload without automatic claims (type, iat, exp, jti)
   * @returns Signed JWT access token string
   *
   * @throws {Error} INVALID_TOKEN_PAYLOAD if payload validation fails
   */
  static generateAccessToken(
    payload: Omit<JWTPayload, "type" | "iat" | "exp" | "jti">
  ): string {
    const tokenPayload: JWTPayload = {
      ...payload,
      type: "access",
      iat: Math.floor(Date.now() / 1000),
      exp:
        Math.floor(Date.now() / 1000) +
        this.parseExpiration(this.config.accessToken.expiresIn),
      jti: this.generateTokenId(),
    };

    const validation = safeParse(JWTPayloadSchema, tokenPayload);
    if (!validation.success) {
      throw new Error("INVALID_TOKEN_PAYLOAD");
    }

    return sign(tokenPayload, this.config.accessToken.secret, {
      algorithm: "HS256",
      issuer: "don-app",
      audience: "don-app-users",
    });
  }

  /**
   * Generates a JWT refresh token with standard claims.
   *
   * @param payload - Token payload without automatic claims (type, iat, exp, jti)
   * @returns Signed JWT refresh token string
   *
   * @throws {Error} INVALID_TOKEN_PAYLOAD if payload validation fails
   */
  static generateRefreshToken(
    payload: Omit<JWTPayload, "type" | "iat" | "exp" | "jti">
  ): string {
    const tokenPayload: JWTPayload = {
      ...payload,
      type: "refresh",
      iat: Math.floor(Date.now() / 1000),
      exp:
        Math.floor(Date.now() / 1000) +
        this.parseExpiration(this.config.refreshToken.expiresIn),
      jti: this.generateTokenId(),
    };

    const validation = safeParse(JWTPayloadSchema, tokenPayload);
    if (!validation.success) {
      throw new Error("INVALID_TOKEN_PAYLOAD");
    }

    return sign(tokenPayload, this.config.refreshToken.secret, {
      algorithm: "HS256",
      issuer: "don-app",
      audience: "don-app-users",
    });
  }

  /**
   * Generates both access and refresh tokens for user authentication.
   *
   * @param user - User object containing id and email
   * @returns AuthToken object with accessToken, refreshToken, and metadata
   *
   * @throws {Error} INVALID_TOKEN_GENERATION if token validation fails
   */
  static generateAuthToken(user: { id: string; email: string }): AuthToken {
    const basePayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.generateAccessToken(basePayload);
    const refreshToken = this.generateRefreshToken(basePayload);

    const authToken = {
      accessToken,
      refreshToken,
      tokenType: "Bearer",
      expiresIn: this.parseExpiration(this.config.accessToken.expiresIn),
    };

    const validation = safeParse(AuthTokenSchema, authToken);
    if (!validation.success) {
      throw new Error("INVALID_TOKEN_GENERATION");
    }

    return validation.output;
  }

  /**
   * Verifies and validates a JWT token.
   *
   * @param token - JWT token string to verify
   * @param type - Token type ("access" | "refresh")
   * @returns Decoded and validated JWT payload
   *
   * @throws {Error} TOKEN_EXPIRED if token has expired
   * @throws {Error} INVALID_TOKEN if token is malformed or invalid
   * @throws {Error} INVALID_TOKEN_STRUCTURE if payload validation fails
   * @throws {Error} INVALID_TOKEN_TYPE if token type doesn't match
   * @throws {Error} TOKEN_REVOKED if token is blacklisted
   */
  static verifyToken(token: string, type: "access" | "refresh"): JWTPayload {
    try {
      const tokenType =
        type === "access"
          ? this.config.accessToken.secret
          : this.config.refreshToken.secret;

      const payload = verify(token, tokenType, {
        algorithms: ["HS256"],
        issuer: "don-app",
        audience: "don-app-users",
      }) as JWTPayload;

      const validation = safeParse(JWTPayloadSchema, payload);
      if (!validation.success) {
        throw new Error("INVALID_TOKEN_STRUCTURE");
      }

      const validatedPayload = validation.output;

      // Check if token is blacklisted
      if (tokenBlacklist.has(validatedPayload.jti.toString())) {
        throw new Error("TOKEN_REVOKED");
      }

      return validatedPayload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new Error("TOKEN_EXPIRED");
      }
      if (error instanceof JsonWebTokenError) {
        throw new Error("INVALID_TOKEN");
      }

      throw error;
    }
  }

  /**
   * Revokes a token by adding it to the blacklist.
   *
   * @param tokenId - The token ID (jti) to revoke
   */
  static revokeToken(tokenId: string): void {
    tokenBlacklist.add(tokenId);
  }

  /**
   * Refreshes an authentication token pair using a valid refresh token.
   *
   * @param refreshToken - Valid refresh token to exchange for new tokens
   * @returns New AuthToken object with fresh access and refresh tokens
   *
   * @throws {Error} Various token verification errors from verifyToken
   */
  static refreshToken(refreshToken: string): AuthToken {
    const payload = this.verifyToken(refreshToken, "refresh");

    // Revoke the old refresh token
    this.revokeToken(payload.jti.toString());

    return this.generateAuthToken({
      id: payload.sub,
      email: payload.email,
    });
  }

  /**
   * Parses expiration string into seconds.
   *
   * @param expireIn - Expiration string (e.g., "15m", "2h", "7d")
   * @returns Expiration time in seconds
   */
  private static parseExpiration(expireIn: string): number {
    const units: { [key: string]: number } = {
      s: 1, // second
      m: 60, // minutes
      h: 3600, // hours
      d: 86400, // days
    };

    const match = expireIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 900;
    }

    const value = parseInt(match[1] ?? "0", 10);
    const unit = match?.[2] ?? "s";
    return value * (units[unit] ?? 1);
  }

  /**
   * Extracts expiration date from a JWT token.
   *
   * @param token - JWT token string
   * @returns Date object representing token expiration
   */
  static getTokenExpiration(token: string): Date {
    const decoded = decode(token) as { exp: number };
    return new Date(decoded.exp * 1000);
  }

  /**
   * Performs health check on JWT service configuration.
   *
   * @returns Health status and configuration check results
   */
  static healthCheck(): {
    status: string;
    config: { accessToken: boolean; refreshToken: boolean };
  } {
    const config = {
      accessToken: !!this.config.accessToken.secret,
      refreshToken: !!this.config.refreshToken.secret,
    };

    return {
      status:
        config.accessToken && config.refreshToken ? "healthy" : "unhealthy",
      config,
    };
  }
}

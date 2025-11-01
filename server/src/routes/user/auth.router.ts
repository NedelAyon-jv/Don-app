import { Router } from "express";
import { asyncHandler, auth, rateLimit, validate } from "../../middleware";
import {
  EmailVerifySchema,
  PasswordChangeSchema,
  UserRegistrationSchema,
} from "../../models/schema/user";
import { AuthController } from "../../controllers/user/auth.controller";
import { LoginSchema, RefreshTokenSchema } from "../../models/schema/auth";

const router = Router();

/**
 * ================================================
 *                       POSTS
 * ================================================
 */

/**
 * Registers a new user account.
 *
 * @route POST /register
 * @rateLimit Auth-specific (5 requests per 15 minutes)
 * @body UserRegistrationSchema
 *
 * @example
 * // Request
 * POST /users/register
 * {
 *   "email": "user@example.com",
 *   "password": "securePassword123",
 *   "username": "johndoe",
 *   "fullname": "John Doe",
 *   "phone": "+1234567890"
 * }
 *
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "user": {
 *       "id": "user123",
 *       "email": "user@example.com",
 *       "username": "johndoe",
 *       "fullname": "John Doe",
 *       "isVerified": false
 *     },
 *     "token": {
 *       "accessToken": "eyJ...",
 *       "refreshToken": "eyJ...",
 *       "tokenType": "Bearer",
 *       "expiresIn": 900
 *     }
 *   }
 * }
 */
router.post(
  "/register",
  rateLimit.auth,
  validate.body(UserRegistrationSchema),
  asyncHandler(AuthController.register)
);

/**
 * Registers a new admin user account.
 *
 * @route POST /register/admin
 * @rateLimit Auth-specific (5 requests per 15 minutes)
 * @body UserRegistrationSchema
 *
 * @example
 * // Request
 * POST /users/register/admin
 * {
 *   "email": "admin@example.com",
 *   "password": "secureAdminPassword123",
 *   "username": "adminuser",
 *   "fullname": "Admin User",
 *   "phone": "+1234567890"
 * }
 *
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "user": {
 *       "id": "admin123",
 *       "email": "admin@example.com",
 *       "username": "adminuser",
 *       "fullname": "Admin User",
 *       "isVerified": true,
 *       "role": "admin"
 *     },
 *     "token": {
 *       "accessToken": "eyJ...",
 *       "refreshToken": "eyJ...",
 *       "tokenType": "Bearer",
 *       "expiresIn": 900
 *     }
 *   },
 *   "message": "Admin user registered successfully"
 * }
 */
router.post(
  "/register/admin",
  rateLimit.auth,
  auth.admin,
  validate.body(UserRegistrationSchema),
  asyncHandler(AuthController.registerAdmin)
);

/**
 * Authenticates a user and returns access tokens.
 *
 * @route POST /login
 * @rateLimit Auth-specific (5 requests per 15 minutes)
 * @body LoginSchema
 *
 * @example
 * // Request
 * POST /users/login
 * {
 *   "email": "user@example.com",
 *   "password": "securePassword123"
 * }
 *
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "user": {
 *       "id": "user123",
 *       "email": "user@example.com",
 *       "username": "johndoe",
 *       "fullname": "John Doe",
 *       "isVerified": true
 *     },
 *     "token": {
 *       "accessToken": "eyJ...",
 *       "refreshToken": "eyJ...",
 *       "tokenType": "Bearer",
 *       "expiresIn": 900
 *     }
 *   }
 * }
 */
router.post(
  "/login",
  rateLimit.auth,
  validate.body(LoginSchema),
  asyncHandler(AuthController.login)
);

/**
 * Refreshes authentication tokens using a valid refresh token.
 *
 * @route POST /refresh-token
 * @authentication Required (uses refresh token from body)
 *
 * @example
 * // Request
 * POST /auth/refresh-token
 * {
 *   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 *
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *     "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *     "tokenType": "Bearer",
 *     "expiresIn": 900
 *   },
 *   "message": "Tokens refreshed successfully"
 * }
 */
router.post(
  "/refresh-token",
  rateLimit.general,
  validate.body(RefreshTokenSchema),
  asyncHandler(AuthController.refreshToken)
);

/**
 * Logs out the authenticated user by revoking their access token.
 *
 * @route POST /logout
 * @authentication Required
 *
 * @example
 * // Request
 * POST /users/logout
 * Authorization: Bearer <token>
 *
 * // Response
 * {
 *   "success": true,
 *   "message": "Successfully logged out"
 * }
 */
router.post("/logout", auth.required, asyncHandler(AuthController.logout));

/**
 * Verifies the authenticated user's email address.
 *
 * @route POST /verify-email
 * @authentication Required
 *
 * @example
 * // Request
 * POST /users/verify-email
 * Authorization: Bearer <token>
 *
 * // Response
 * {
 *   "success": true,
 *   "message": "Email verified successfully"
 * }
 */
router.post(
  "/verify-email",
  auth.admin,
  validate.body(EmailVerifySchema),
  asyncHandler(AuthController.verifyEmail)
);

/**
 * Gets the current authenticated user's information.
 *
 * @route POST /me
 * @authentication Required
 *
 * @example
 * // Request
 * POST /users/me
 * Authorization: Bearer <token>
 *
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "id": "user123",
 *     "email": "user@example.com",
 *     "username": "johndoe",
 *     "fullname": "John Doe",
 *     "phone": "+1234567890",
 *     "isVerified": true,
 *     "profilePicture": "https://example.com/avatar.jpg",
 *     "role": "user"
 *   }
 * }
 */
router.post("/me", auth.required, asyncHandler(AuthController.getCurrentUser));

/**
 * Changes the authenticated user's password.
 *
 * @route POST /change-password
 * @rateLimit Auth-specific (5 requests per 15 minutes)
 * @body PasswordChangeSchema
 *
 * @example
 * // Request
 * POST /users/change-password
 * Authorization: Bearer <token>
 * {
 *   "currentPassword": "oldPassword123",
 *   "newPassword": "newSecurePassword456"
 * }
 *
 * // Response
 * {
 *   "success": true,
 *   "message": "Password changed successfully"
 * }
 */
router.post(
  "/change-password",
  rateLimit.general,
  auth.required,
  validate.body(PasswordChangeSchema),
  asyncHandler(AuthController.resetPassword)
);

/**
 * Initiates password reset process by sending a reset email.
 *
 * @route POST /forgot-password
 * @rateLimit Auth-specific (5 requests per 15 minutes)
 * @body ForgotPasswordSchema
 *
 * @example
 * // Request
 * POST /users/forgot-password
 * {
 *   "email": "user@example.com"
 * }
 *
 * // Response
 * {
 *   "success": true,
 *   "message": "Password reset instructions sent to your email"
 * }
 */
router.post(
  "/forgot-password",
  rateLimit.auth,
  validate.body(PasswordChangeSchema),
  asyncHandler(AuthController.forgotPassword)
);

export default router;

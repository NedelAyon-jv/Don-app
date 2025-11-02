import type { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../../middleware";
import { AuthService } from "../../services/User/Auth.service";
import { UserService } from "../../services/User/User.service";

export class AuthController {
  /**
   * Handles user registration request.
   * Creates a new user account and returns authentication tokens.
   *
   * @route POST /register
   * @returns AuthResponse with user data and tokens
   */
  static register = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const authResponse = await AuthService.register(req.body);

      res.status(201).json({
        success: true,
        data: authResponse,
        message: "User registered successfully",
      });
    }
  );

  /**
   * Handles admin user registration request.
   * Creates a new admin user account with elevated privileges.
   *
   * @route POST /admin/register
   * @returns AuthResponse with admin user data and tokens
   */
  static registerAdmin = asyncHandler(async (req: Request, res: Response) => {
    const authResponse = await UserService.createsAdmin(req.body);

    res.status(201).json({
      success: true,
      data: authResponse,
      message: "Admin user registered successfully",
    });
  });

  /**
   * Handles user authentication request.
   * Verifies credentials and returns authentication tokens.
   *
   * @route POST /login
   * @returns AuthResponse with user data and tokens
   */
  static login = asyncHandler(async (req: Request, res: Response) => {
    const authResponse = await AuthService.login(req.body);

    res.json({
      success: true,
      data: authResponse,
      message: "Login successful",
    });
  });

  /**
   * Handles token refresh request.
   * Issues new access and refresh tokens using a valid refresh token.
   *
   * @route POST /refresh-token
   * @returns New AuthToken object
   */
  static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const tokens = await AuthService.refreshToken(req.body);

    res.json({
      success: true,
      data: tokens,
      message: "Tokens refreshed successfully",
    });
  });

  /**
   * Handles user logout request.
   * Revokes the current access token to prevent further use.
   *
   * @route POST /logout
   * @returns Success message
   */
  static logout = asyncHandler(async (req: Request, res: Response) => {
    const token = req.token!;

    await AuthService.logout(token);

    res.json({
      success: true,
      message: "Logout successful",
    });
  });

  /**
   * Handles email verification request.
   * Marks the authenticated user's email as verified.
   *
   * @route POST /verify-email
   * @returns Success message
   */
  static verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    await AuthService.verifyEmail(req.body!.userId);

    res.json({
      success: true,
      message: "Email verified successfully",
    });
  });

  /**
   * Gets the current authenticated user's complete profile.
   *
   * @route POST /me
   * @returns Complete user profile data
   */
  static getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const user = await UserService.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullname: user.fullname,
          phone: user.phone,
          bio: user.bio,
          profilePicture: user.profilePicture,
          location: user.location,
          rating: user.rating,
          isVerified: user.isVerified,
        },
      },
    });
  });

  /**
   * Handles password reset request for authenticated users.
   * Changes the user's password after validating current password.
   *
   * @route POST /change-password
   * @returns Success message
   */
  static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    await AuthService.changePassword(userId, req.body);

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  });

  /**
   * Validates the current user session.
   * Checks if the access token is still valid and not revoked.
   *
   * @route POST /validate-session
   * @returns Session validation result
   */
  static validateSession = asyncHandler(async (req: Request, res: Response) => {
    const token = req.token!;

    const session = await AuthService.validateSession(token);

    res.json({
      success: true,
      data: session,
    });
  });

  /**
   * Handles forgot password request.
   * Initiates password reset process by sending reset instructions to email.
   *
   * @route POST /forgot-password
   * @returns Success message
   * NOT IMPLEMENTED YET, BUT GOOD TO HAVE
   */
  static forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    await AuthService.requestPasswordReset(email);

    res.json({
      success: true,
      message: "A password reset link has been sent.",
    });
  });
}

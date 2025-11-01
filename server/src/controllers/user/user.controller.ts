import type { Request, Response } from "express";
import { asyncHandler } from "../../middleware";
import { UserService } from "../../services/User/User.service";
import { AuthService } from "../../services/User/Auth.service";

export class UserController {
  static getProfile = asyncHandler(async (req: Request, res: Response) => {
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

  static updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const updates = req.body;

    await UserService.updateUser(userId, updates);

    const updatedUser = await UserService.getUserById(userId);

    res.json({
      success: true,
      data: {
        user: {
          id: updatedUser!.id,
          email: updatedUser!.email,
          username: updatedUser!.username,
          fullName: updatedUser!.fullname,
          phone: updatedUser!.phone,
          bio: updatedUser!.bio,
          profilePicture: updatedUser!.profilePicture,
          location: updatedUser!.location,
        },
      },
      message: "Profile updated successfully",
    });
  });

  static changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const passwordData = req.body;

    await AuthService.changePassword(userId, passwordData);

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  });

  static getUserStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const user = await UserService.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          MESSAGE: "User not found",
        },
      });
    }

    res.json({
      success: true,
      data: {
        rating: user.rating || {
          average: 0,
          count: 0,
        },
      },
    });
  });

  static getPublicProfile = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.params.id || "";

      const publicProfile = await UserService.getPublicProfile(userId);
      if (!publicProfile) {
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
          user: publicProfile,
        },
      });
    }
  );

  static searchUser = asyncHandler(async (req: Request, res: Response) => {
    const { q, limit = 20 } = (req as any).validatedQuery;

    const users = await UserService.searchUser(q as string, Number(limit));

    res.json({
      success: true,
      data: {
        users,
        total: users.length,
        query: q,
      },
    });
  });

  static getNearbyUsers = asyncHandler(async (req: Request, res: Response) => {
    const { latitude, longitude, radius = 10, limit = 50 } = req.query;

    const users = await UserService.getUserNearLocation(
      Number(latitude),
      Number(longitude),
      Number(radius),
      Number(limit)
    );

    res.json({
      success: true,
      data: {
        users,
        total: users.length,
        location: {
          latitude: Number(latitude),
          longitude: Number(longitude),
          radius: Number(radius),
        },
      },
    });
  });
}

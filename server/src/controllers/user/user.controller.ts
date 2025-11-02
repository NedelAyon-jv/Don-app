import type { Request, Response } from "express";
import { asyncHandler } from "../../middleware";
import { UserService } from "../../services/User/User.service";
import { AuthService } from "../../services/User/Auth.service";
import { s3Service } from "../../services/AWS/s3.service";

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
    const file = req.file; // The uploaded image file

    let imageUrl = updates.imageUrl; // Existing image URL if provided

    // If a new file was uploaded, process it
    if (file) {
      try {
        // Upload to S3
        const uploadResult = await s3Service.uploadFile(
          file.buffer,
          userId,
          file.originalname,
          file.mimetype,
          "profile-pictures"
        );

        imageUrl = uploadResult.url;
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: {
            code: "IMAGE_UPLOAD_FAILED",
            message: "Failed to upload image",
          },
        });
      }
    }

    // Prepare updates for Firebase
    const firebaseUpdates: any = { ...updates };

    // Remove the image file from updates (it's not a Firebase field)
    delete firebaseUpdates.image;

    // Add the image URL if we have one (either existing or new upload)
    if (imageUrl) {
      firebaseUpdates.profilePicture = imageUrl;
    }

    await UserService.updateUser(userId, firebaseUpdates);

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

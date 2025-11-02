import type { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../../middleware";
import type { UploadedFile } from "../../middleware/upload.middleware";
import { s3Service } from "../../services/AWS/s3.service";
import { PublicationService } from "../../services/Publication/publication.service";

export class PublicationController {
  /**
   * Handles publication creation request with image uploads.
   *
   * @route POST /publications
   * @body CreatePublicationInput with optional image files
   * @returns Created publication data
   *
   * @example
   * // Request with images
   * POST /publications
   * Content-Type: multipart/form-data
   * {
   *   "type": "donation_offer",
   *   "title": "Clothing donation",
   *   "description": "Gently used clothing",
   *   "category": "clothing",
   *   "condition": "good",
   *   "quantity": 5
   * }
   * // Files: image1.jpg, image2.jpg
   *
   * // Response
   * {
   *   "success": true,
   *   "data": {
   *     "publication": {
   *       "id": "pub123",
   *       "title": "Clothing donation",
   *       "images": ["https://.../image1.jpg", "https://.../image2.jpg"]
   *       // ... other publication fields
   *     }
   *   },
   *   "message": "Publication created successfully"
   * }
   */
  static createPublication = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.user!.id;
      const publicationData = req.body;
      const files = (req as any).files as UploadedFile[] | undefined;

      const imageUrls: string[] = [];

      if (files && files.length > 0) {
        for (const file of files) {
          try {
            const uploadResult = await s3Service.uploadFile(
              file.buffer,
              userId,
              file.originalname,
              file.mimetype,
              "publication"
            );
            imageUrls.push(uploadResult.url);
          } catch (error) {
            console.error("Failed to upload image:", error);
            return res.status(400).json({
              success: false,
              error: {
                code: "IMAGE_UPLOAD_FAILED",
                message: "Failed to upload one or more images",
              },
            });
          }
        }
      }

      const publicationWithImages = {
        ...publicationData,
        images: imageUrls,
      };

      const publicationId = await PublicationService.createPublication(
        publicationWithImages,
        userId
      );

      const publication = await PublicationService.getPublicationById(
        publicationId
      );
      res.status(201).json({
        success: true,
        data: {
          publication,
        },
        message: "Publication created successfully",
      });
    }
  );

  /**
   * Handles publication update request with optional image uploads.
   *
   * @route PUT /publications/:id
   * @body UpdatePublicationInput with optional image files
   * @returns Updated publication data
   *
   * @example
   * // Request with new images
   * PUT /publications/pub123
   * Content-Type: multipart/form-data
   * {
   *   "title": "Updated title",
   *   "description": "Updated description"
   * }
   * // Files: new-image.jpg
   *
   * // Response
   * {
   *   "success": true,
   *   "data": {
   *     "publication": {
   *       "id": "pub123",
   *       "title": "Updated title",
   *       "images": ["https://.../old-image.jpg", "https://.../new-image.jpg"]
   *       // ... other updated fields
   *     }
   *   },
   *   "message": "Publication updated successfully"
   * }
   */
  static updatePublication = asyncHandler(
    async (req: Request, res: Response) => {
      const publicationId = req.params!.id || "";
      const userId = req.user!.id;
      const updates = req.body;
      const files = (req as any).files as UploadedFile[] | undefined;

      let imageUrls = updates.images || [];

      if (files && files.length > 0) {
        for (const file of files) {
          try {
            const uploadResult = await s3Service.uploadFile(
              file.buffer,
              userId,
              file.originalname,
              file.mimetype,
              "publications"
            );
            imageUrls.push(uploadResult.url);
          } catch (error) {
            console.error("Failed to upload image:", error);
            return res.status(400).json({
              success: false,
              error: {
                code: "IMAGE_UPLOAD_FAILED",
                message: "Failed to upload one or more images",
              },
            });
          }
        }
      }

      const publicationUpdates = {
        ...updates,
        images: imageUrls.least > 0 ? imageUrls : undefined,
      };

      delete publicationUpdates.image;

      await PublicationService.updatePublication(
        publicationId,
        publicationUpdates,
        userId
      );

      const updatedPublication = await PublicationService.getPublicationById(
        publicationId
      );

      res.json({
        success: true,
        data: {
          publication: updatedPublication,
        },
        message: "Publication updated successfully",
      });
    }
  );

  /**
   * Handles donation quantity update for donation request publications.
   *
   * @route PATCH /publications/:id/quantity
   * @body { additionalQuantity: number }
   * @returns Updated publication data
   *
   * @example
   * // Request
   * PATCH /publications/pub123/quantity
   * {
   *   "additionalQuantity": 5
   * }
   *
   * // Response
   * {
   *   "success": true,
   *   "data": {
   *     "publication": {
   *       "id": "pub123",
   *       "title": "Food donations needed",
   *       "type": "donation_request",
   *       "targetQuantity": 100,
   *       "currentQuantity": 25, // Updated from 20
   *       // ... other publication fields
   *     }
   *   },
   *   "message": "Donation quantity updated successfully"
   * }
   */
  static updateDonationQuantity = asyncHandler(
    async (req: Request, res: Response) => {
      const publicationId = req.params.id || "";
      const { additionalQuantity } = req.body;

      if (!additionalQuantity || additionalQuantity <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_QUANTITY",
            message: "Additional quantity must be a positive number",
          },
        });
      }

      await PublicationService.updateDonationQuantity(
        publicationId,
        additionalQuantity
      );

      const updatedPublication = await PublicationService.getPublicationById(
        publicationId
      );

      res.json({
        success: true,
        data: {
          publication: updatedPublication,
        },
        message: "Donation quantity updated successfully",
      });
    }
  );

  /**
   * Handles publication deletion (soft delete) request.
   *
   * @route DELETE /publications/:id
   * @returns Success message
   *
   * @example
   * // Request
   * DELETE /publications/pub123
   *
   * // Response
   * {
   *   "success": true,
   *   "message": "Publication deleted successfully"
   * }
   */
  static deletePublication = asyncHandler(
    async (req: Request, res: Response) => {
      const publicationId = req.params.id || "";
      const userId = req.user!.id;

      await PublicationService.deletePublication(publicationId, userId);

      res.json({
        success: true,
        message: "Publication deleted successfully",
      });
    }
  );

  /**
   * Handles publication retrieval by ID.
   *
   * @route GET /publications/:id
   * @returns Publication data
   *
   * @example
   * // Request
   * GET /publications/pub123
   *
   * // Response
   * {
   *   "success": true,
   *   "data": {
   *     "publication": {
   *       "id": "pub123",
   *       "title": "Clothing donation",
   *       "type": "donation_offer",
   *       // ... other publication fields
   *     }
   *   }
   * }
   */
  static getPublication = asyncHandler(async (req: Request, res: Response) => {
    const publicationId = req.params.id || "";

    const publication = await PublicationService.getPublicationById(
      publicationId
    );

    if (!publication) {
      return res.status(404).json({
        success: false,
        error: {
          code: "PUBLICATION_NOT_FOUND",
          message: "Publication not found",
        },
      });
    }

    res.json({
      success: true,
      data: {
        publication,
      },
    });
  });

  /**
   * Handles publications listing with filtering, sorting, and pagination.
   *
   * @route GET /publications
   * @query Various filter, pagination, and sorting parameters
   * @returns Paginated publications with metadata
   *
   * @example
   * // Get active donation requests near a location
   * GET /publications?type=donation_request&category=food&latitude=40.7128&longitude=-74.0060&radius=5&page=1&limit=20&sortBy=priority&sortOrder=desc
   *
   * // Get user's publications
   * GET /publications?userId=user123&isActive=true
   *
   * // Search publications
   * GET /publications?q=urgent%20food&category=food
   *
   * // Response
   * {
   *   "success": true,
   *   "data": {
   *     "publications": [...],
   *     "pagination": {
   *       "page": 1,
   *       "limit": 20,
   *       "total": 45,
   *       "totalPages": 3
   *     },
   *     "filters": {
   *       "type": "donation_request",
   *       "category": "food",
   *       "isActive": true
   *     }
   *   }
   * }
   */
  static getPublications = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      type: req.query.type as string,
      category: req.query.category as string,
      userId: req.query.userId as string,
      centerId: req.query.centerId as string,
      isActive:
        req.query.isActive !== undefined ? req.query.isActive === "true" : true,
      priority: req.query.priority as string,
      searchQuery: req.query.q as string,
      ...(req.query.latitude &&
        req.query.longitude && {
          location: {
            latitude: parseFloat(req.query.latitude as string),
            longitude: parseFloat(req.query.longitude as string),
            radius: parseFloat(req.query.radius as string) || 10,
          },
        }),
    };

    const pagination = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      sortBy: (req.query.sortBy as "priority" | "another think") || "priority",
      sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
    };

    const { publications, total } = await PublicationService.getPublications(
      filters,
      pagination
    );

    res.json({
      success: true,
      data: {
        publications,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages: Math.ceil(total / pagination.limit),
        },
        filters,
      },
    });
  });

  /**
   * Handles retrieval of publications for a specific user.
   * Can be used to get current user's publications or another user's publications.
   *
   * @route GET /users/:userId/publications
   * @route GET /publications/user/me (if using req.user.id)
   * @returns User's publications
   *
   * @example
   * // Get current user's publications
   * GET /publications/user/me
   *
   * // Get specific user's publications
   * GET /users/user123/publications
   *
   * // Response
   * {
   *   "success": true,
   *   "data": {
   *     "publications": [
   *       {
   *         "id": "pub123",
   *         "title": "Clothing donation",
   *         "type": "donation_offer",
   *         // ... other publication fields
   *       }
   *     ],
   *     "total": 5
   *   }
   * }
   */
  static getUserPublications = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.params.userId || req.user!.id;

      const publications = await PublicationService.getUserPublications(userId);

      res.json({
        success: true,
        data: {
          publications,
          total: publications.length,
        },
      });
    }
  );

  /**
   * Handles retrieval of donation request publications for a specific donation center.
   *
   * @route GET /centers/:centerId/publications
   * @returns Donation center's active donation requests
   *
   * @example
   * // Get center's publications
   * GET /centers/center123/publications
   *
   * // Response
   * {
   *   "success": true,
   *   "data": {
   *     "publications": [
   *       {
   *         "id": "pub123",
   *         "title": "Urgent food donations needed",
   *         "type": "donation_request",
   *         "priority": "urgent",
   *         "targetQuantity": 100,
   *         "currentQuantity": 25
   *         // ... other publication fields
   *       }
   *     ],
   *     "total": 3
   *   }
   * }
   */
  static getCenterPublications = asyncHandler(
    async (req: Request, res: Response) => {
      const centerId = req.params.centerId || "";

      const publications = await PublicationService.getCenterPublications(
        centerId
      );

      res.json({
        success: true,
        data: {
          publications,
          total: publications.length,
        },
      });
    }
  );

  /**
   * Handles search for publications within a geographic radius.
   *
   * @route GET /publications/nearby
   * @query latitude, longitude, radius, type, category, q (search query)
   * @returns Publications within the specified radius
   *
   * @example
   * // Search for food donations within 5km
   * GET /publications/nearby?latitude=40.7128&longitude=-74.0060&radius=5&type=donation_offer&category=food&q=urgent
   *
   * // Response
   * {
   *   "success": true,
   *   "data": {
   *     "publications": [
   *       {
   *         "id": "pub123",
   *         "title": "Food donation nearby",
   *         "type": "donation_offer",
   *         "location": {
   *           "latitude": 40.7129,
   *           "longitude": -74.0061,
   *           "address": "123 Main St"
   *         }
   *         // ... other publication fields
   *       }
   *     ],
   *     "total": 3,
   *     "location": {
   *       "latitude": 40.7128,
   *       "longitude": -74.0060,
   *       "radius": 5
   *     }
   *   }
   * }
   */
  static searchPublicationsNearby = asyncHandler(
    async (req: Request, res: Response) => {
      const { latitude, longitude, radius = 10 } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          error: {
            code: "LOCATION_REQUIRED",
            message: "Latitude and longitude are required",
          },
        });
      }

      const filters = {
        type: req.query.type as string,
        category: req.query.category as string,
        searchQuery: req.query.q as string,
      };

      const publications = await PublicationService.searchPublicationsNearby(
        parseFloat(latitude as string),
        parseFloat(longitude as string),
        parseFloat(radius as string),
        filters
      );

      res.json({
        success: true,
        data: {
          publications,
          total: publications.length,
          location: {
            latitude: parseFloat(latitude as string),
            longitude: parseFloat(longitude as string),
            radius: parseFloat(radius as string),
          },
        },
      });
    }
  );

  /**
   * Handles expressing interest in a publication (placeholder implementation).
   * In a full implementation, this would typically create a conversation or message thread.
   *
   * @route POST /publications/:id/interest
   * @body { message: string } (optional message to the publication owner)
   * @returns Success confirmation
   *
   * @example
   * // Request
   * POST /publications/pub123/interest
   * {
   *   "message": "I'm interested in donating to your request. When can I drop off items?"
   * }
   *
   * // Response
   * {
   *   "success": true,
   *   "message": "Interest expressed successfully",
   *   "data": {
   *     "publicationId": "pub123",
   *     "userId": "user456",
   *     "message": "I'm interested in donating to your request. When can I drop off items?"
   *   }
   * }
   */
  static expressInterest = asyncHandler(async (req: Request, res: Response) => {
    const publicationId = req.params.id;
    const userId = req.user!.id;
    const { message } = req.body;

    // This would typically create a conversation/message, for the moment it return a success

    res.json({
      success: true,
      message: "Interest expressed successfully",
      data: {
        publicationId,
        userId,
        message,
      },
    });
  });

  /**
   * Handles removing interest from a publication (placeholder implementation).
   * In a full implementation, this would typically remove a conversation or cancel a pending request.
   *
   * @route DELETE /publications/:id/interest
   * @returns Success confirmation
   *
   * @example
   * // Request
   * DELETE /publications/pub123/interest
   *
   * // Response
   * {
   *   "success": true,
   *   "message": "Interest removed successfully",
   *   "data": {
   *     "publicationId": "pub123",
   *     "userId": "user456"
   *   }
   * }
   */
  static removeInterest = asyncHandler(async (req: Request, res: Response) => {
    const publicationId = req.params.id;
    const userId = req.user!.id;

    res.json({
      success: true,
      message: "Interest removed successfully",
      data: {
        publicationId,
        userId,
      },
    });
  });

  /**
   * Handles marking a publication as completed by its owner.
   *
   * @route POST /publications/:id/complete
   * @returns Success confirmation
   *
   * @example
   * // Request
   * POST /publications/pub123/complete
   *
   * // Response
   * {
   *   "success": true,
   *   "message": "Publication marked as completed"
   * }
   */
  static completePublication = asyncHandler(
    async (req: Request, res: Response) => {
      const publicationId = req.params.id || "";
      const userId = req.user!.id;

      const publication = await PublicationService.getPublicationById(
        publicationId
      );
      if (!publication || publication.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: {
            code: "NOT_AUTHORIZED",
            message: "You can only complete your own publications",
          },
        });
      }

      await PublicationService.updatePublication(
        publicationId,
        { isActive: false },
        userId
      );

      res.json({
        success: true,
        message: "Publication marked as completed",
      });
    }
  );
}

import type { Request, Response, NextFunction } from "express";
import { ValidationError } from "./error.middleware";

// Define our own file interface since we're not using Multer directly
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
}

interface FileValidationOptions {
  maxSize?: number;
  allowedMimeTypes?: string[];
  maxCount?: number;
  required?: boolean;
}

export class UploadMiddleware {
  /**
   * Express middleware for file upload validation.
   *
   * @param options - File validation options
   * @returns Express middleware function
   *
   * @example
   * // Basic file validation
   * router.post('/upload',
   *   FileMiddleware.validateFiles(),
   *   uploadController.handleUpload
   * );
   *
   * // Custom validation
   * router.post('/documents',
   *   FileMiddleware.validateFiles({
   *     maxSize: 10 * 1024 * 1024, // 10MB
   *     allowedMimeTypes: ['application/pdf', 'application/msword'],
   *     maxCount: 5
   *   }),
   *   documentController.upload
   * );
   */
  static validateFiles(options: FileValidationOptions = {}) {
    const {
      maxSize = 5 * 1024 * 1024,
      allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
      maxCount = 1,
      required = false,
    } = options;

    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const files = (req as any).files as UploadedFile[] | undefined;

        if (required && (!files || files.length === 0)) {
          throw new ValidationError("Files are required", [
            {
              field: "files",
              message: "At least one file is required",
            },
          ]);
        }

        if (!files || files.length === 0) {
          return next();
        }

        if (files.length > maxCount) {
          throw new ValidationError("Too many files", [
            {
              field: "files",
              message: `Maximum ${maxCount} files allowed`,
            },
          ]);
        }

        const errors: any[] = [];

        files.forEach((file, index) => {
          const fieldName = files.length === 1 ? "file" : `files[${index}]`;

          if (file.size > maxSize) {
            errors.push({
              field: fieldName,
              message: `File size must be less than ${this.formatFileSize(
                maxSize
              )}`,
              code: "FILE_TOO_LARGE",
            });
          }

          if (!allowedMimeTypes.includes(file.mimetype)) {
            errors.push({
              field: fieldName,
              message: `File type must be one of: ${allowedMimeTypes.join(
                ", "
              )}`,
              code: "INVALID_FILE_TYPE",
            });
          }

          if (!this.isSafeFilename(file.originalname)) {
            errors.push({
              field: fieldName,
              message: "Filename contains invalid characters",
              code: "INVALID_FILENAME",
            });
          }
        });

        if (errors.length > 0) {
          throw new ValidationError("File validation failed", errors);
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Express middleware for marking image files for processing.
   * Note: This middleware only marks files for processing - actual processing should be handled separately.
   *
   * @param options - Image processing options
   * @returns Express middleware function
   *
   * @example
   * // Mark images for processing
   * router.post('/upload',
   *   FileMiddleware.validateFiles(),
   *   FileMiddleware.processImages({
   *     maxWidth: 800,
   *     maxHeight: 600,
   *     quality: 80
   *   }),
   *   uploadController.handleUpload // Controller should handle actual processing
   * );
   */
  static processImages(
    options: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
    } = {}
  ) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const files = (req as any).files as UploadedFile[] | undefined;

        if (!files || files.length === 0) {
          return next();
        }

        files.forEach((file) => {
          if (file.mimetype.startsWith("image/")) {
            (file as any).processed = true;
            (file as any).processingOptions = options;
          }
        });

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Express middleware for sanitizing uploaded file names.
   * Removes special characters and ensures safe filenames.
   *
   * @example
   * router.post('/upload',
   *   FileMiddleware.sanitizeFilenames,
   *   FileMiddleware.validateFiles(),
   *   uploadController.handleUpload
   * );
   */
  static sanitizeFilenames = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const files = (req as any).files as UploadedFile[] | undefined;

      if (files && files.length > 0) {
        files.forEach((file) => {
          file.originalname = this.sanitizeFilename(file.originalname);
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Formats file size in bytes to human-readable string.
   *
   * @param bytes - File size in bytes
   * @returns Formatted file size string (e.g., "2.5 MB")
   *
   * @example
   * const size = FileMiddleware.formatFileSize(2548765);
   * // Returns: "2.43 MB"
   */
  private static formatFileSize(bytes: number): string {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  }

  /**
   * Checks if a filename is safe by checking for dangerous patterns.
   *
   * @param filename - Filename to check
   * @returns True if filename is safe, false if it contains dangerous patterns
   *
   * @example
   * const isSafe = FileMiddleware.isSafeFilename("profile..jpg"); // false
   * const isSafe = FileMiddleware.isSafeFilename("profile.jpg"); // true
   */
  private static isSafeFilename(filename: string): boolean {
    const dangerousPatterns = [
      /\.\./,
      /[<>:"|?*]/,
      /^\./,
      /\.(exe|bat|cmd|sh|php|js|html|htm)$/i,
    ];
    return !dangerousPatterns.some((pattern) => pattern.test(filename));
  }

  /**
   * Sanitizes a filename by removing path components and replacing unsafe characters.
   *
   * @param filename - Original filename to sanitize
   * @returns Sanitized filename with unsafe characters replaced by underscores
   *
   * @example
   * const safeName = FileMiddleware.sanitizeFilename("../../profile image(1).jpg");
   * // Returns: "profile_image_1_.jpg"
   */
  private static sanitizeFilename(filename: string): string {
    const basename = filename.split(/[\\/]/).pop() || filename;
    return basename.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(0, 100);
  }
}

/**
 * Pre-configured file upload middleware for common use cases.
 *
 * @example
 * // Profile picture upload
 * router.post('/profile/picture',
 *   upload.profilePicture,
 *   upload.sanitizeFilenames,
 *   upload.optimizeImages,
 *   userController.uploadProfilePicture
 * );
 *
 * // Listing images upload
 * router.post('/listings/:id/images',
 *   upload.listingImages,
 *   upload.sanitizeFilenames,
 *   upload.optimizeImages,
 *   listingController.uploadImages
 * );
 */
export const upload = {
  profilePicture: UploadMiddleware.validateFiles({
    maxSize: 2 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    maxCount: 1,
  }),

  listingImages: UploadMiddleware.validateFiles({
    maxSize: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    maxCount: 10,
  }),

  optimizeImages: UploadMiddleware.processImages({
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 80,
  }),

  sanitizeFilenames: UploadMiddleware.sanitizeFilenames,
};

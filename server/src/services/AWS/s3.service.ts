import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomBytes } from "crypto";

export interface UploadResult {
  url: string;
  key: string;
  filename: string;
  size: number;
  mimetype: string;
}

export interface PresignedUrlResult {
  url: string;
  key: string;
  fields?: Record<string, string>;
}

export class S3Service {
  private static instance: S3Service;
  private s3Client: S3Client;
  private bucket: string;

  private constructor() {
    this.bucket = process.env.AWS_S3_BUCKET!;

    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    this.validateConfig();
  }

  /**
   * Gets the singleton instance of S3Service.
   *
   * @returns Singleton instance of S3Service
   *
   * @example
   * const s3Service = S3Service.getInstance();
   */
  public static getInstance(): S3Service {
    if (!S3Service.instance) {
      S3Service.instance = new S3Service();
    }
    return S3Service.instance;
  }

  /**
   * Validates that all required S3 configuration environment variables are present.
   *
   * @throws {Error} If any required environment variables are missing
   */
  private validateConfig(): void {
    const required = [
      "AWS_ACCESS_KEY_ID",
      "AWS_SECRET_ACCESS_KEY",
      "AWS_S3_BUCKET",
    ];
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(`Missing S3 configuration: ${missing.join(", ")}`);
    }
  }

  /**
   * Generates a unique file key for S3 storage.
   *
   * @param userId - User ID to associate with the file
   * @param originalFilename - Original filename for extension and sanitization
   * @param folder - Base folder path (default: "users")
   * @returns Unique file key path for S3 storage
   *
   * @example
   * const key = generateFileKey("user123", "profile-picture.jpg", "avatars");
   * // Returns: "avatars/user123/1635784300000-a1b2c3d4-profile-picture.jpg"
   */
  private generateFileKey(
    userId: string,
    originalFilename: string,
    folder: string = "users"
  ): string {
    const timestamp = Date.now();
    const randomString = randomBytes(8).toString("hex");
    const extension = originalFilename.split(".").pop() || "jpg";
    const sanitizedFilename = originalFilename
      .split(".")[0]
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .slice(0, 50);

    return `${folder}/${userId}/${timestamp}-${randomString}-${sanitizedFilename}.${extension}`;
  }

  /**
   * Uploads a file to AWS S3 storage.
   *
   * @param fileBuffer - File content as Buffer
   * @param userId - User ID uploading the file
   * @param originalFilename - Original filename
   * @param mimetype - File MIME type
   * @param folder - S3 folder path (optional)
   * @returns Upload result with URL, key, and file metadata
   *
   * @throws {Error} FILE_UPLOAD_FAILED if upload fails
   *
   * @example
   * const result = await s3Service.uploadFile(
   *   fileBuffer,
   *   "user123",
   *   "profile.jpg",
   *   "image/jpeg",
   *   "avatars"
   * );
   */
  async uploadFile(
    fileBuffer: Buffer,
    userId: string,
    originalFilename: string,
    mimetype: string,
    folder?: string
  ): Promise<UploadResult> {
    try {
      const key = this.generateFileKey(userId, originalFilename, folder);

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: mimetype,
        Metadata: {
          uploadBy: userId,
          originalFilename,
          uploadedAt: new Date().toISOString(),
        },
      });

      await this.s3Client.send(command);

      const url = `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
      return {
        url,
        key,
        filename: originalFilename,
        size: fileBuffer.length,
        mimetype,
      };
    } catch (error) {
      console.error("S3 upload error:", error);
      throw new Error("FILE_UPLOAD_FAILED");
    }
  }

  /**
   * Generates a presigned URL for direct client-side uploads to S3.
   *
   * @param userId - User ID uploading the file
   * @param originalFilename - Original filename
   * @param mimetype - File MIME type
   * @param folder - S3 folder path (optional)
   * @param expiresIn - URL expiration time in seconds (default: 300)
   * @returns Presigned URL and file key
   *
   * @throws {Error} PRESIGNED_URL_GENERATION_FAILED if URL generation fails
   *
   * @example
   * const result = await s3Service.generatePresignedUrl(
   *   "user123",
   *   "document.pdf",
   *   "application/pdf",
   *   "documents",
   *   600 // 10 minutes
   * );
   */
  async generatePresignedUrl(
    userId: string,
    originalFilename: string,
    mimetype: string,
    folder?: string,
    expiresIn: number = 300
  ): Promise<PresignedUrlResult> {
    try {
      const key = this.generateFileKey(userId, originalFilename, folder);

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: mimetype,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });

      return {
        url,
        key,
      };
    } catch (error) {
      console.error("S3 presigned URL error:", error);
      throw new Error("PRESIGNED_URL_GENERATION_FAILED");
    }
  }

  /**
   * Generates a presigned URL for secure file downloads from S3.
   *
   * @param key - S3 file key to generate URL for
   * @param expiresIn - URL expiration time in seconds (default: 300)
   * @returns Presigned URL for file download
   *
   * @throws {Error} PRESIGNED_GET_URL_GENERATION_FAILED if URL generation fails
   *
   * @example
   * const downloadUrl = await s3Service.generatePresignedGetUrl(
   *   "avatars/user123/1635784300000-a1b2c3d4-profile.jpg",
   *   600 // 10 minutes
   * );
   */
  async generatePresignedGetUrl(
    key: string,
    expiresIn: number = 300
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      console.error("S3 presigned GET URL error:", error);
      throw new Error("PRESIGNED_GET_URL_GENERATION_FAILED");
    }
  }

  /**
   * Deletes a file from AWS S3 storage.
   *
   * @param key - S3 file key to delete
   * @throws {Error} FILE_DELETION_FAILED if deletion fails
   *
   * @example
   * await s3Service.deleteFile("avatars/user123/1635784300000-a1b2c3d4-profile.jpg");
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error("S3 delete error:", error);
      throw new Error("FILE_DELETION_FAILED");
    }
  }

  extractKeyFromUrl(url: string): string | null {
    const pattern = `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
    if (url.startsWith(pattern)) {
      return url.replace(pattern, "");
    }
    return null;
  }

  /**
   * Checks if a file exists in AWS S3 storage.
   *
   * @param key - S3 file key to check
   * @returns True if file exists, false otherwise
   *
   * @example
   * const exists = await s3Service.fileExists("avatars/user123/profile.jpg");
   * if (exists) {
   *   console.log("File exists in S3");
   * }
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      // Try to generate a presigned URL - if it fails, file doesn't exist
      await this.generatePresignedGetUrl(key, 60);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generates a public URL for accessing S3 files (if bucket is public).
   *
   * @param key - S3 file key
   * @returns Public URL for the file
   *
   * @example
   * const publicUrl = s3Service.getPublicUrl("avatars/user123/profile.jpg");
   * // Returns: "https://my-bucket.s3.us-east-1.amazonaws.com/avatars/user123/profile.jpg"
   */
  getPublicUrl(key: string): string {
    return `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }

  /**
   * Performs a health check on the S3 service and bucket connectivity.
   *
   * @returns Health status and bucket information
   *
   * @example
   * const health = await s3Service.healthCheck();
   * console.log(`S3 Status: ${health.status}, Bucket: ${health.bucket}`);
   */
  async healthCheck(): Promise<{ status: string; bucket: string }> {
    try {
      // Simple check - try to list objects (limited to 1)
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        MaxKeys: 1,
      });

      await this.s3Client.send(command);

      return {
        status: "healthy",
        bucket: this.bucket,
      };
    } catch (error) {
      console.error("S3 health check failed:", error);
      return {
        status: "unhealthy",
        bucket: this.bucket,
      };
    }
  }
}

export const s3Service = S3Service.getInstance();

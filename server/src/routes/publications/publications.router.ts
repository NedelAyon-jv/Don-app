import { Router } from "express";
import { asyncHandler, auth, rateLimit, validate } from "../../middleware";
import { PublicationController } from "../../controllers/publication/publication.controller";
import { multerConfig } from "../../config/multer.config";
import { upload } from "../../middleware/upload.middleware";
import {
  CreatePublicationSchema,
  UpdatePublicationSchema,
} from "../../models/schema/publication";
import {
  minValue,
  number,
  pipe,
  object,
  optional,
  string,
  maxLength,
} from "valibot";

const router = Router();

/**
 * Creates a new publication with image uploads.
 *
 * @route POST /publications
 * @authentication Required
 * @rateLimit User-based (30 requests per minute)
 * @body CreatePublicationSchema with multipart image files
 * @returns Created publication data
 *
 * @middleware
 * - auth.required: User must be authenticated
 * - rateLimit.user: User rate limiting
 * - multerConfig.array("images", 5): Handle up to 5 image files
 * - upload.sanitizeFilenames: Sanitize uploaded filenames
 * - upload.publicationImages: Validate publication images
 * - upload.optimizeImages: Optimize image size and quality
 * - validate.body(CreatePublicationSchema): Validate publication data
 */
router.post(
  "/",
  auth.required,
  rateLimit.user,
  multerConfig.array("images", 5),
  upload.sanitizeFilenames,
  upload.publicationImages,
  upload.optimizeImages,
  validate.body(CreatePublicationSchema),
  asyncHandler(PublicationController.createPublication)
);

/**
 * Expresses interest in a publication.
 *
 * @route POST /publications/:id/interest
 * @authentication Required
 * @rateLimit User-based (30 requests per minute)
 * @body Optional message (max 500 characters)
 * @returns Success confirmation
 *
 * @middleware
 * - auth.required: User must be authenticated
 * - rateLimit.user: User rate limiting
 * - validate.body: Validate message length
 */
router.post(
  "/:id/interest",
  auth.required,
  rateLimit.user,
  validate.body(
    object({
      message: optional(pipe(string(), maxLength(500))),
    })
  )
);

/**
 * Marks a publication as completed by its owner.
 *
 * @route POST /publications/:id/complete
 * @authentication Required
 * @rateLimit User-based (30 requests per minute)
 * @returns Success confirmation
 *
 * @middleware
 * - auth.required: User must be authenticated and own the publication
 * - rateLimit.user: User rate limiting
 */
router.post(
  "/:id/complete",
  auth.required,
  rateLimit.user,
  asyncHandler(PublicationController.completePublication)
);

/**
 * Updates an existing publication with optional new images.
 *
 * @route PUT /publications/:id
 * @authentication Required (must own the publication)
 * @rateLimit User-based (30 requests per minute)
 * @body UpdatePublicationSchema with optional multipart image files
 * @returns Updated publication data
 *
 * @middleware
 * - auth.required: User must be authenticated and own the publication
 * - rateLimit.user: User rate limiting
 * - multerConfig.array("images", 5): Handle up to 5 new image files
 * - upload.sanitizeFilenames: Sanitize uploaded filenames
 * - upload.publicationImages: Validate publication images
 * - upload.optimizeImages: Optimize image size and quality
 * - validate.body(UpdatePublicationSchema): Validate publication update data
 */
router.put(
  "/update/:id",
  auth.required,
  rateLimit.user,
  multerConfig.array("images", 5),
  upload.sanitizeFilenames,
  upload.publicationImages,
  upload.optimizeImages,
  validate.body(UpdatePublicationSchema),
  asyncHandler(PublicationController.updatePublication)
);

/**
 * Updates the current quantity of a donation request publication.
 *
 * @route PATCH /publications/:id/quantity
 * @authentication Required
 * @rateLimit User-based (30 requests per minute)
 * @body { additionalQuantity: number } (must be at least 1)
 * @returns Updated publication data
 *
 * @middleware
 * - auth.required: User must be authenticated
 * - rateLimit.user: User rate limiting
 * - validate.body: Validate additionalQuantity is a positive number
 */
router.patch(
  "/:id/quantity",
  auth.required,
  rateLimit.user,
  validate.body(
    object({
      additionalQuantity: pipe(number(), minValue(1)),
    })
  ),
  asyncHandler(PublicationController.updateDonationQuantity)
);

/**
 * Soft deletes a publication by marking it as inactive.
 *
 * @route DELETE /publications/:id
 * @authentication Required (must own the publication)
 * @rateLimit User-based (30 requests per minute)
 * @returns Success confirmation
 *
 * @middleware
 * - auth.required: User must be authenticated and own the publication
 * - rateLimit.user: User rate limiting
 */
router.delete(
  "/delete/:id",
  auth.required,
  rateLimit.user,
  asyncHandler(PublicationController.deletePublication)
);

/**
 * Removes interest from a publication.
 *
 * @route DELETE /publications/:id/interest
 * @authentication Required
 * @rateLimit User-based (30 requests per minute)
 * @returns Success confirmation
 *
 * @middleware
 * - auth.required: User must be authenticated
 * - rateLimit.user: User rate limiting
 */
router.delete(
  "/:id/interest",
  auth.required,
  rateLimit.user,
  asyncHandler(PublicationController.removeInterest)
);

/**
 * Retrieves publications with filtering, sorting, and pagination.
 *
 * @route GET /publications
 * @rateLimit General (100 requests per 15 minutes)
 * @query Various filter, pagination, and sorting parameters
 * @returns Paginated publications with metadata
 *
 * @middleware
 * - rateLimit.general: General rate limiting
 *
 * @queryparams
 * - type: Publication type (donation_offer, donation_request, exchange)
 * - category: Publication category (clothing, furniture, electronics, etc.)
 * - userId: Filter by user ID
 * - centerId: Filter by donation center ID
 * - isActive: Filter by active status (default: true)
 * - priority: Filter by priority (for donation requests)
 * - q: Search query (searches title, description, and tags)
 * - latitude, longitude, radius: Location-based filtering
 * - page: Page number (default: 1)
 * - limit: Results per page (default: 20)
 * - sortBy: Field to sort by (default: "priority")
 * - sortOrder: Sort direction (asc/desc, default: "desc")
 */
router.get(
  "/",
  rateLimit.general,
  asyncHandler(PublicationController.getPublications)
);

/**
 * Retrieves a specific publication by ID.
 *
 * @route GET /publications/:id
 * @rateLimit General (100 requests per 15 minutes)
 * @returns Publication data
 *
 * @middleware
 * - rateLimit.general: General rate limiting
 */
router.get(
  "/get/:id",
  rateLimit.general,
  asyncHandler(PublicationController.getPublication)
);

/**
 * Searches for publications within a geographic radius.
 *
 * @route GET /publications/nearby
 * @rateLimit General (100 requests per 15 minutes)
 * @query latitude, longitude, radius, type, category, q (search query)
 * @returns Publications within the specified radius
 *
 * @middleware
 * - rateLimit.general: General rate limiting
 *
 * @queryparams
 * - latitude: Center point latitude (required)
 * - longitude: Center point longitude (required)
 * - radius: Search radius in kilometers (default: 10)
 * - type: Filter by publication type
 * - category: Filter by category
 * - q: Search query (searches title, description, and tags)
 */
router.get(
  "nearby",
  rateLimit.general,
  asyncHandler(PublicationController.searchPublicationsNearby)
);

/**
 * Retrieves publications for a specific user or the current authenticated user.
 *
 * @route GET /publications/user/:userId?
 * @authentication Optional
 * @rateLimit General (100 requests per 15 minutes)
 * @returns User's publications
 *
 * @middleware
 * - auth.optional: Authentication is optional - if authenticated, can use own ID
 * - rateLimit.general: General rate limiting
 */
router.get(
  "/user/:userId?",
  auth.optional,
  rateLimit.general,
  asyncHandler(PublicationController.getUserPublications)
);

/**
 * Retrieves donation request publications for a specific donation center.
 *
 * @route GET /publications/center/:centerId
 * @rateLimit General (100 requests per 15 minutes)
 * @returns Donation center's active donation requests
 *
 * @middleware
 * - rateLimit.general: General rate limiting
 */
router.get(
  "/center/:centerId",
  rateLimit.general,
  asyncHandler(PublicationController.getCenterPublications)
);

export default router;

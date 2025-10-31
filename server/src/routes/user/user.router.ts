import { Router } from "express";
import {
  asyncHandler,
  auth,
  cache,
  rateLimit,
  validate,
} from "../../middleware";
import { UserController } from "../../controllers/user/user.controller";
import {
  PasswordChangeSchema,
  UserUpdateSchema,
} from "../../models/schema/user";
import {
  string,
  object,
  optional,
  number,
  pipe,
  minLength,
  minValue,
  maxValue,
  transform,
} from "valibot";

const router = Router();

/**
 * ================================================
 *                       UPDATE
 * ================================================
 */

/**
 * Updates the authenticated user's profile.
 *
 * @route PUT /profile
 * @authentication Required
 * @rateLimit User-based (30 requests per minute)
 * @body UserUpdateSchema
 *
 * @example
 * // Request
 * PUT /profile
 * Authorization: Bearer <token>
 * {
 *   "username": "newusername",
 *   "fullname": "New Name",
 *   "phone": "+1234567890"
 * }
 *
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "id": "user123",
 *     "username": "newusername",
 *     "fullname": "New Name",
 *     "email": "user@example.com"
 *   }
 * }
 */
router.put(
  "/profile",
  auth.required,
  rateLimit.user,
  validate.body(UserUpdateSchema),
  asyncHandler(UserController.updateProfile)
);

/**
 * Changes the authenticated user's password.
 *
 * @route PATCH /profile/password
 * @authentication Required
 * @rateLimit Auth-specific (5 requests per 15 minutes)
 * @body PasswordChangeSchema
 *
 * @example
 * // Request
 * PATCH /profile/password
 * Authorization: Bearer <token>
 * {
 *   "currentPassword": "oldPassword123",
 *   "newPassword": "newSecurePassword456"
 * }
 *
 * // Response
 * {
 *   "success": true,
 *   "message": "Password updated successfully"
 * }
 */
router.patch(
  "/profile/password",
  auth.required,
  rateLimit.auth,
  validate.body(PasswordChangeSchema),
  asyncHandler(UserController.changePassword)
);

/**
 * ================================================
 *                       GETS
 * ================================================
 */

/**
 * Gets the authenticated user's profile information.
 *
 * @route GET /profile
 * @authentication Required
 *
 * @example
 * // Request
 * GET /profile
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
 *     "profilePicture": "https://example.com/avatar.jpg"
 *   }
 * }
 */
router.get("/profile", auth.required, asyncHandler(UserController.getProfile));

/**
 * Gets the authenticated user's statistics and activity metrics.
 *
 * @route GET /profile/stats
 * @authentication Required
 * @cache Short-term (30 seconds, user-specific)
 *
 * @example
 * // Request
 * GET /profile/stats
 * Authorization: Bearer <token>
 *
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "totalListings": 15,
 *     "activeListings": 8,
 *     "totalRatings": 42,
 *     "averageRating": 4.7,
 *     "responseRate": 95.2,
 *     "memberSince": "2023-01-15T00:00:00.000Z"
 *   }
 * }
 */
router.get(
  "/profile/stats",
  auth.required,
  cache.short,
  asyncHandler(UserController.getUserStats)
);

/**
 * Gets a user's public profile by ID.
 *
 * @route GET /:id
 * @authentication Optional
 * @cache Medium-term (5 minutes)
 * @params User ID
 *
 * @example
 * // Request
 * GET /users/user123
 *
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "id": "user123",
 *     "username": "johndoe",
 *     "fullname": "John Doe",
 *     "profilePicture": "https://example.com/avatar.jpg",
 *     "rating": {
 *       "average": 4.7,
 *       "count": 42
 *     },
 *     "memberSince": "2023-01-15T00:00:00.000Z"
 *   }
 * }
 */
router.get(
  "/:id",
  auth.optional,
  cache.medium,
  validate.params(object({ id: string() })),
  asyncHandler(UserController.getPublicProfile)
);

/**
 * Searches for users by username or name.
 *
 * @route GET /search
 * @authentication Optional
 * @rateLimit General (100 requests per 15 minutes)
 * @cache Short-term (30 seconds)
 * @query Search parameters
 *
 * @example
 * // Request
 * GET /users/search?q=john&limit=10
 *
 * // Response
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "user123",
 *       "username": "johndoe",
 *       "fullname": "John Doe",
 *       "profilePicture": "https://example.com/avatar.jpg",
 *       "rating": {
 *         "average": 4.7,
 *         "count": 42
 *       }
 *     }
 *   ],
 *   "meta": {
 *     "total": 1,
 *     "limit": 10,
 *     "query": "john"
 *   }
 * }
 */
router.get(
  "/search",
  auth.optional,
  rateLimit.general,
  cache.short,
  validate.query(
    object({
      q: pipe(string(), minLength(1)),
      limit: optional(pipe(number(), minValue(1), maxValue(50))),
    })
  ),
  asyncHandler(UserController.searchUser)
);

/**
 * Gets users near a specific geographic location.
 *
 * @route GET /nearby
 * @authentication Optional
 * @rateLimit General (100 requests per 15 minutes)
 * @query Location parameters
 *
 * @example
 * // Request
 * GET /users/nearby?latitude=40.7128&longitude=-74.0060&radius=5&limit=20
 *
 * // Response
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "user123",
 *       "username": "johndoe",
 *       "fullname": "John Doe",
 *       "profilePicture": "https://example.com/avatar.jpg",
 *       "rating": {
 *         "average": 4.7,
 *         "count": 42
 *       },
 *       "distance": 2.3
 *     }
 *   ],
 *   "meta": {
 *     "total": 15,
 *     "center": {
 *       "latitude": 40.7128,
 *       "longitude": -74.0060
 *     },
 *     "radius": 5,
 *     "limit": 20
 *   }
 * }
 */
router.get(
  "/nearby",
  auth.optional,
  rateLimit.general,
  validate.query(
    object({
      latitude: pipe(
        string(),
        transform((val) => parseFloat(val))
      ),
      longitude: pipe(
        string(),
        transform((val) => parseFloat(val))
      ),
      radius: optional(
        pipe(
          string(),
          transform((val) => parseFloat(val))
        )
      ),
      limit: optional(
        pipe(
          string(),
          transform((val) => parseInt(val))
        )
      ),
    })
  ),
  asyncHandler(UserController.getNearbyUsers)
);

export default router;

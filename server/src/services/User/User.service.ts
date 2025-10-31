import { safeParse } from "valibot";
import {
  BaseUserSchema,
  MinimalUserSchema,
  PasswordChangeSchema,
  PublicUserSchema,
  UserRegistrationSchema,
  UserUpdateSchema,
} from "../../models/schema/user";
import { firestoreService } from "../Firebase/firebase.service";
import type { MinimalUser, PublicUser, User } from "../../models/types/user";
import { compare, hash } from "bcrypt";

export class UserService {
  // FIRE BASE COLLECTION REFERENCE
  private static readonly COLLECTION_NAME = "users";

  /**
   * ================================================
   *                     CREATIONS
   * ================================================
   */

  /**
   * Creates a new user with validated registration data.
   *
   * @param input - Raw user registration data to validate
   * @returns Promise resolving to the created user's ID
   *
   * @throws {Error} VALIDATION_ERROR with field details if input validation fails
   * @throws {Error} If user with same email/username exists or database operation fails
   */
  static async createsUser(input: unknown): Promise<string> {
    try {
      const result = safeParse(UserRegistrationSchema, input);

      if (!result.success) {
        const errors = result.issues.map((issue) => ({
          filed: issue.path?.map((p) => p.key).join(".") || "body",
          message: issue.message,
        }));

        throw new Error(`VALIDATION_ERROR: ${JSON.stringify(errors)}`);
      }

      const validatedData = result.output;

      await this.checkExitingUser(validatedData.email, validatedData.username);
      const hashedPassword = await hash(validatedData.password, 12);

      const userData = {
        email: validatedData.email,
        password: hashedPassword,
        username: validatedData.username,
        fullname: validatedData.fullname,
        phone: validatedData.phone,
        bio: "",
        profilePicture: "",
        rating: {
          average: 0,
          count: 0,
        },
        location: {
          latitude: 0,
          longitude: 0,
        },
        role: "user",
        isVerified: false,
      };

      return await firestoreService.create<User>(
        this.COLLECTION_NAME,
        userData
      );
    } catch (error) {
      console.error("User creation failed:", error);
      throw error;
    }
  }

  /**
   * ================================================
   *                       UPDATE
   * ================================================
   */

  /**
   * Updates an existing user's information.
   *
   * @param id - The user's ID to update
   * @param update - Partial user data to update (validated against UserUpdateSchema)
   * @returns Promise that resolves when update is complete
   *
   * @throws {Error} VALIDATION_ERROR with field details if input validation fails
   * @throws {Error} If username is not unique or database operation fails
   */
  static async updateUser(id: string, update: unknown): Promise<void> {
    try {
      const result = safeParse(UserUpdateSchema, update);

      if (!result.success) {
        const errors = result.issues.map((issue) => ({
          field: issue.path?.map((p) => p.key).join(".") || "body",
          message: issue.message,
        }));

        throw new Error(`VALIDATION_ERROR: ${JSON.stringify(errors)}`);
      }

      const validateUpdate = result.output;

      if (validateUpdate.username) {
        await this.checkUsernameUnique(validateUpdate.username, id);
      }

      await firestoreService.update<User>(
        this.COLLECTION_NAME,
        id,
        validateUpdate
      );
    } catch (error) {
      console.error(`Failed to update user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Updates a user's password after validating current password.
   *
   * @param userId - The user's ID
   * @param input - Password change data (currentPassword, newPassword)
   * @returns Promise that resolves when password is updated
   *
   * @throws {Error} VALIDATION_ERROR if input validation fails
   * @throws {Error} USER_NOT_FOUND if user doesn't exist
   * @throws {Error} INVALID_CURRENT_PASSWORD if current password doesn't match
   */
  static async updatePassword(userId: string, input: unknown): Promise<void> {
    try {
      const result = safeParse(PasswordChangeSchema, input);

      if (!result.success) {
        const errors = result.issues.map((issue) => ({
          field: issue.path?.map((p) => p.key).join(".") || "body",
          message: issue.message,
        }));

        throw new Error(`VALIDATION_ERROR: ${JSON.stringify(errors)}`);
      }

      const validatedData = result.output;

      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error("USER_NOT_FOUND");
      }

      const isCurrentPasswordValid = await compare(
        validatedData.currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        throw new Error("INVALID_CURRENT_PASSWORD");
      }

      const hashedPassword = await hash(validatedData.newPassword, 12);

      await firestoreService.update<User>(this.COLLECTION_NAME, userId, {
        password: hashedPassword,
      });
    } catch (error) {
      console.error(`Failed to update password for user ${userId}:`, error);
      throw error;
    }
  }

  /**
 * Updates a user's rating by adding a new rating and recalculating average.
 * 
 * @param userId - The user's ID
 * @param newRating - The new rating value to add
 * @returns Promise that resolves when rating is updated
 * 
 * @throws {Error} USER_NOT_FOUND if user doesn't exist

 */
  static async updateUserRating(
    userId: string,
    newRating: number
  ): Promise<void> {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error("USER_NOT_FOUND");
      }

      const currentRating = user.rating || { average: 0, count: 0 };
      const totalScore =
        currentRating.average * currentRating.count + newRating;
      const newCount = currentRating.count + 1;
      const newAverage = totalScore / newCount;

      await firestoreService.update<User>(this.COLLECTION_NAME, userId, {
        rating: {
          average: Math.round(newAverage * 100) / 100,
          count: newCount,
        },
      });
    } catch (error) {
      console.error(`Failed to update rating for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Marks a user's email as verified.
   *
   * @param userId - The user's document ID to verify
   * @returns Promise that resolves when verification is complete
   */
  static async verifyEmail(userId: string): Promise<void> {
    try {
      await firestoreService.update<User>(this.COLLECTION_NAME, userId, {
        isVerified: true,
      });
    } catch (error) {
      console.error(`Failed to verify email for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * ================================================
   *                         GETS
   * ================================================
   */

  /**
   * Retrieves a user by their document ID.
   *
   * @param id - The user's document ID
   * @returns Promise resolving to User object or null if not found
   *
   * @throws {Error} INVALID_USER_DATA if user data fails schema validation
   */
  static async getUserById(id: string): Promise<User | null> {
    try {
      const user = await firestoreService.getById<User>(
        this.COLLECTION_NAME,
        id
      );

      if (!user) return null;

      const result = safeParse(BaseUserSchema, user);
      if (!result.success) {
        console.error("User data schema validation failed:", result.issues);
        throw new Error("INVALID_USER_DATA");
      }

      return result.output;
    } catch (error) {
      console.error(`Failed to get user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Retrieves a user by their email address.
   *
   * @param email - The email address to search for
   * @returns Promise resolving to User object or null if not found
   *
   * @throws {Error} INVALID_USER_DATA if user data fails schema validation
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const users = await firestoreService.query<User>(this.COLLECTION_NAME, {
        where: ["email", "==", email.toLocaleLowerCase().trim()],
        limit: 1,
      });

      if (users.length === 0) return null;

      const result = safeParse(BaseUserSchema, users[0]);
      if (!result.success) {
        console.error("User data schema validation failed:", result.issues);
        throw new Error("INVALID_USER_DATA");
      }

      return result.output;
    } catch (error) {
      console.error(`Failed to get user by email ${email}:`, error);
      throw error;
    }
  }

  /**
   * Retrieves a user by their username.
   *
   * @param username - The username to search for
   * @returns Promise resolving to User object or null if not found
   *
   * @throws {Error} INVALID_USER_DATA if user data fails schema validation
   *
   * @example
   * const user = await UserService.getUserByUsername("johndoe");
   */
  static async getUserByUsername(username: string): Promise<User | null> {
    try {
      const users = await firestoreService.query<User>(this.COLLECTION_NAME, {
        where: ["username", "==", username.trim()],
        limit: 1,
      });

      if (users.length === 0) return null;

      const result = safeParse(BaseUserSchema, users[0]);
      if (!result.success) {
        console.error("User data schema validation failed:", result.issues);
        throw new Error("INVALID_USER_DATA");
      }

      return result.output;
    } catch (error) {
      console.error(`Failed to get user by username ${username}:`, error);
      throw error;
    }
  }

  /**
   * Retrieves a user's public profile information.
   *
   * @param userId - The user's document ID
   * @returns Promise resolving to PublicUser object or null if not found
   *
   * @throws {Error} INVALID_USER_DATA if user data fails public schema validation
   */
  static async getPublicProfile(userId: string): Promise<PublicUser | null> {
    try {
      const user = await this.getUserById(userId);

      if (!user) return null;

      const result = safeParse(PublicUserSchema, user);
      if (!result.success) {
        console.error(
          "Public user data schema validation failed:",
          result.issues
        );
        throw new Error("INVALID_USER_DATA");
      }

      return result.output;
    } catch (error) {
      console.error(`Failed to get public user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Retrieves minimal user information.
   *
   * @param userId - The user's document ID
   * @returns Promise resolving to MinimalUser object or null if not found
   *
   * @throws {Error} INVALID_USER_DATA if user data fails minimal schema validation
   */
  static async getMinimalUser(userId: string): Promise<MinimalUser | null> {
    try {
      const user = await this.getUserById(userId);

      if (!user) return null;

      const result = safeParse(MinimalUserSchema, user);
      if (!result.success) {
        console.error(
          "Minimal user data schema validation failed:",
          result.issues
        );
        throw new Error("INVALID_USER_DATA");
      }

      return result.output;
    } catch (error) {
      console.error(`Failed to get minimal user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Gets users within a specified radius of a geographic location.
   * Note: This performs client-side filtering after fetching from Firestore.
   *
   * @param latitude - Center point latitude
   * @param longitude - Center point longitude
   * @param radiusKm - Search radius in kilometers (default: 10)
   * @param limit - Maximum number of users to return (default: 50)
   * @returns Array of PublicUser objects within the specified radius
   */
  static async getUserNearLocation(
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
    limit: number = 50
  ): Promise<PublicUser[]> {
    try {
      // THIS IS FROM CHAT GPT I'NOT SURE THIS IS GOING TO WORK
      const earthRadiusKm = 6371;
      const latDelta = (radiusKm / earthRadiusKm) * (180 / Math.PI);
      const lonDelta =
        ((radiusKm / earthRadiusKm) * (180 / Math.PI)) /
        Math.cos((latitude * Math.PI) / 180);

      const minLat = latitude - latDelta;
      const maxLat = latitude + latDelta;
      const minLon = longitude - lonDelta;
      const maxLon = longitude + lonDelta;

      const users = await firestoreService.query<User>(this.COLLECTION_NAME, {
        where: ["location", "!=", null],
        limit: limit * 2,
      });

      const nearbyUsers = users
        .filter((user) => {
          if (!user.location) return false;

          const distance = this.calculateHaversineDistance(
            latitude,
            longitude,
            user.location.latitude,
            user.location.longitude
          );

          return distance <= radiusKm;
        })
        .slice(0, limit);

      const publicUsers: PublicUser[] = [];
      for (const user of nearbyUsers) {
        const result = safeParse(PublicUserSchema, user);
        if (result.success) {
          publicUsers.push(result.output);
        }
      }

      return publicUsers;
    } catch (error) {
      console.error("Failed to get users near location: ", error);
      throw error;
    }
  }

  /**
   * Searches for users by username or full name.
   *
   * @param query - Search query string
   * @param limit - Maximum number of results (default: 20)
   * @returns Promise resolving to array of PublicUser objects
   */
  static async searchUser(
    query: string,
    limit: number = 20
  ): Promise<PublicUser[]> {
    try {
      const usernameResult = await firestoreService.query<User>(
        this.COLLECTION_NAME,
        {
          where: ["username", ">=", query],
          limit: Math.floor(limit / 2),
          orderBy: { field: "username", direction: "asc" },
        }
      );

      const fullNameResult = await firestoreService.query<User>(
        this.COLLECTION_NAME,
        {
          where: ["username", ">=", query],
          limit: Math.floor(limit / 2),
          orderBy: { field: "username", direction: "asc" },
        }
      );

      const allResults = [...usernameResult, ...fullNameResult];
      const uniquerResult = allResults.filter(
        (user, index, self) => index === self.findIndex((u) => u.id === user.id)
      );

      const publicUsers: PublicUser[] = [];
      for (const user of uniquerResult.slice(0, limit)) {
        const result = safeParse(PublicUserSchema, user);
        if (result.success) {
          publicUsers.push(result.output);
        }
      }

      return publicUsers;
    } catch (error) {
      console.error(`Failed search failed for query ${query}: `, error);
      throw error;
    }
  }

  /**
   * ================================================
   *                       UTILS
   * ================================================
   */

  /**
   * Verifies a plain password against a hashed password.
   *
   * @param plainPassword - Plain text password to verify
   * @param hashedPassword - Hashed password to compare against
   * @returns Promise resolving to true if passwords match
   */
  static async verifyPassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return compare(plainPassword, hashedPassword);
  }

  /**
   * ================================================
   *                     PRIVATE
   * ================================================
   */

  /**
   * Checks if a user with the given email or username already exists.
   *
   * @param email - Email to check
   * @param username - Username to check
   * @throws {Error} EMAIL_ALREADY_EXISTS if email is taken
   * @throws {Error} USERNAME_ALREADY_EXISTS if username is taken
   */
  private static async checkExitingUser(
    email: string,
    username: string
  ): Promise<void> {
    const [existingEmail, exitingUsername] = await Promise.all([
      this.getUserByEmail(email),
      this.getUserByUsername(username),
    ]);

    if (existingEmail) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    if (exitingUsername) {
      throw new Error("USERNAME_ALREADY_EXISTS");
    }
  }

  /**
   * Checks if a username is unique, excluding a specific user.
   *
   * @param username - Username to check
   * @param excludeUserId - User ID to exclude from the check
   * @throws {Error} USERNAME_ALREADY_EXISTS if username is taken by another user
   */
  private static async checkUsernameUnique(
    username: string,
    excludeUserId: string
  ): Promise<void> {
    const existingUser = await this.getUserByUsername(username);
    if (existingUser && existingUser.id !== excludeUserId) {
      throw new Error("USERNAME_ALREADY_EXISTS");
    }
  }

  /**
   * Calculates distance between two geographic points using Haversine formula.
   *
   * @param lat1 - First point latitude
   * @param lon1 - First point longitude
   * @param lat2 - Second point latitude
   * @param lon2 - Second point longitude
   * @returns Distance in kilometers
   */
  private static calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers

    return distance;
  }

  /**
   * Converts degrees to radians.
   *
   * @param deg - Angle in degrees
   * @returns Angle in radians
   */
  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

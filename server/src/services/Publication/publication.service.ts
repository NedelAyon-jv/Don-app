import { safeParse } from "valibot";
import {
  CreatePublicationSchema,
  PUBLICATION_TYPES,
  PublicationResponseSchema,
  UpdatePublicationSchema,
} from "../../models/schema/publication";
import type {
  CreatePublicationInput,
  DonationRequest,
  Publication,
  PublicationResponse,
  UpdatePublicationInput,
} from "../../models/types/publication";
import { firestoreService } from "../Firebase/firebase.service";

export interface PublicationFilters {
  type?: string;
  category?: string;
  userId?: string;
  centerId?: string;
  isActive?: boolean;
  priority?: string;
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  searchQuery?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: "priority" | 'another think';
  sortOrder?: "asc" | "desc";
}

export class PublicationService {
  private static readonly COLLECTION_NAME = "publication";

  /**
   * ================================================
   *                     CREATIONS
   * ================================================
   */

  /**
   * Creates a new publication in the system.
   *
   * @param input - Publication creation data
   * @param userId - ID of the user creating the publication
   * @returns Promise resolving to the created publication's document ID
   *
   * @throws {Error} VALIDATION_ERROR if input validation fails
   * @throws {Error} Various validation errors from validatePublicationCreation
   */
  static async createPublication(
    input: CreatePublicationInput,
    userId: string
  ): Promise<string> {
    try {
      const result = safeParse(CreatePublicationSchema, input);
      if (!result.success) {
        const errors = result.issues.map((issue) => ({
          field: issue.path?.map((p) => p.key).join(".") || "body",
          message: issue.message,
        }));
        throw new Error(`VALIDATION_ERROR: ${JSON.stringify(errors)}`);
      }

      const validateData = result.output;

      await this.validatePublicationCreation(validateData, userId);

      const publicationData = {
        ...validateData,
        tags: validateData.tags || [],
        userId,
        isActive: true,
        createAt: new Date(),
        updatedAt: new Date(),
        ...(validateData.type === PUBLICATION_TYPES.DONATION_REQUEST && {
          currentQuantity: 0,
          centerId: userId,
        }),
      };

      return await firestoreService.create<PublicationResponse>(
        this.COLLECTION_NAME,
        publicationData
      );
    } catch (error) {
      console.error("Publication creation failed:", error);
      throw error;
    }
  }

  /**
   * ================================================
   *                     UPDATES
   * ================================================
   */

  /**
   * Updates an existing publication.
   *
   * @param id - Publication ID to update
   * @param updates - Partial publication data to update
   * @param userId - ID of the user attempting the update
   * @returns Promise that resolves when update is complete
   *
   * @throws {Error} VALIDATION_ERROR if input validation fails
   * @throws {Error} If user doesn't own the publication
   */
  static async updatePublication(
    id: string,
    updates: UpdatePublicationInput,
    userId: string
  ): Promise<void> {
    try {
      const result = safeParse(UpdatePublicationSchema, updates);
      if (!result.success) {
        const errors = result.issues.map((issue) => ({
          field: issue.path?.map((p) => p.key).join(".") || "body",
          message: issue.message,
        }));
        throw new Error(`VALIDATION_ERROR: ${JSON.stringify(errors)}`);
      }

      const validateData = result.output;

      await this.verifyPublicationOwnership(id, userId);

      await firestoreService.update<Publication>(this.COLLECTION_NAME, id, {
        ...validateData,
      });
    } catch (error) {
      console.log(`Failed to update publication ${id}:`, error);
      throw error;
    }
  }

  /**
   * Updates the current quantity of a donation request publication.
   *
   * @param publicationId - ID of the donation request publication
   * @param additionalQuantity - Quantity to add to current quantity
   * @returns Promise that resolves when quantity is updated
   *
   * @throws {Error} PUBLICATION_NOT_FOUND_OR_INVALID_TYPE if publication doesn't exist or is not a donation request
   */
  static async updateDonationQuantity(
    publicationId: string,
    additionalQuantity: number
  ): Promise<void> {
    try {
      const publication = await this.getPublicationById(publicationId);

      if (!publication || !this.isDonationRequest(publication)) {
        throw new Error("PUBLICATION_NOT_FOUND_OR_INVALID_TYPE");
      }

      const newQuantity = publication.currentQuantity + additionalQuantity;

      await firestoreService.update<DonationRequest>(
        this.COLLECTION_NAME,
        publicationId,
        {
          currentQuantity: newQuantity,
        }
      );
    } catch (error) {
      console.error(
        `Failed to update donation quantity for ${publicationId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * ================================================
   *                      DELETE
   * ================================================
   */

  /**
   * Soft deletes a publication by marking it as inactive.
   *
   * @param id - Publication ID to delete
   * @param userId - ID of the user attempting deletion
   * @returns Promise that resolves when publication is marked inactive
   *
   * @throws {Error} If user doesn't own the publication
   *
   * @example
   * await PublicationService.deletePublication("publication123", "user123");
   */
  static async deletePublication(id: string, userId: string): Promise<void> {
    try {
      await this.verifyPublicationOwnership(id, userId);

      await firestoreService.update<PublicationResponse>(
        this.COLLECTION_NAME,
        id,
        {
          isActive: false,
        }
      );
    } catch (error) {
      console.error(`Failed to delete publication ${id}:`, error);
      throw error;
    }
  }

  /**
   * ================================================
   *                      GETS
   * ================================================
   */

  /**
   * Retrieves publications with filtering, sorting, and pagination.
   *
   * @param filters - Filter criteria for publications
   * @param pagination - Pagination and sorting options
   * @returns Object containing publications array and total count
   */
  static async getPublications(
    filters: PublicationFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<{ publications: Publication[]; total: number }> {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = "priority",
        sortOrder = "desc",
      } = pagination;

      let queryOptions: any = {};
      const whereClauses = [];

      if (filters.type) {
        whereClauses.push(["type", "==", filters.type]);
      }

      if (filters.category) {
        whereClauses.push(["category", "==", filters.category]);
      }

      if (filters.userId) {
        whereClauses.push(["userId", "==", filters.userId]);
      }

      if (filters.centerId) {
        whereClauses.push(["centerId", "==", filters.centerId]);
      }

      if (filters.isActive !== undefined) {
        whereClauses.push(["isActive", "==", filters.isActive]);
      } else {
        whereClauses.push(["isActive", "==", true]);
      }

      if (filters.priority) {
        whereClauses.push(["priority", "==", filters.priority]);
      }

      if (whereClauses.length > 0) {
        queryOptions.where = whereClauses[0];
      }

      queryOptions.orderBy = {
        field: sortBy,
        direction: sortOrder,
      };

      const publications = await firestoreService.query<Publication>(
        this.COLLECTION_NAME,
        queryOptions
      );

      let filteredPublications = publications;
      if (filters.location) {
        filteredPublications = publications.filter((pub) =>
          this.isWithinRadius(
            pub.location.latitude,
            pub.location.longitude,
            filters.location!.latitude,
            filters.location!.longitude,
            filters.location!.radius
          )
        );
      }

      if (filters.searchQuery) {
        filteredPublications = filteredPublications.filter(
          (pub) =>
            pub.title
              .toLocaleLowerCase()
              .includes(filters.searchQuery!.toLocaleLowerCase()) ||
            pub.description
              .toLocaleLowerCase()
              .includes(filters.searchQuery!.toLocaleLowerCase()) ||
            pub.tags.some((tag) =>
              tag
                .toLocaleLowerCase()
                .includes(filters.searchQuery!.toLocaleLowerCase())
            )
        );
      }

      const startIndex = (page - 1) * limit;
      const paginatePublication = filteredPublications.slice(
        startIndex,
        startIndex + limit
      );

      const validatedPublications: PublicationResponse[] = [];
      for (const pub of paginatePublication) {
        const result = safeParse(PublicationResponseSchema, pub);
        if (result.success) {
          validatedPublications.push(result.output);
        }
      }

      return {
        publications: validatedPublications,
        total: filteredPublications.length,
      };
    } catch (error) {
      console.error("Failed to get publications:", error);
      throw error;
    }
  }

  /**
   * Retrieves all active publications for a specific user.
   *
   * @param userId - User ID to get publications for
   * @returns Array of user's active publications
   */
  static async getUserPublications(userId: string): Promise<Publication[]> {
    try {
      const { publications } = await this.getPublications({
        userId,
        isActive: true,
      });

      return publications;
    } catch (error) {
      console.error(`Failed to get publication for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Retrieves active donation request publications for a specific donation center.
   *
   * @param centerId - Donation center user ID
   * @returns Array of donation center's active donation requests
   */
  static async getCenterPublications(centerId: string): Promise<Publication[]> {
    try {
      const { publications } = await this.getPublications({
        centerId,
        type: PUBLICATION_TYPES.DONATION_REQUEST,
        isActive: true,
      });

      return publications;
    } catch (error) {
      console.error(
        `Failed to get publications for center ${centerId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Retrieves a publication by its ID.
   *
   * @param id - Publication ID
   * @returns Publication object or null if not found
   *
   * @throws {Error} INVALID_PUBLICATION_DATA if publication data fails schema validation
   */
  static async getPublicationById(
    id: string
  ): Promise<PublicationResponse | null> {
    try {
      const publication = await firestoreService.getById<PublicationResponse>(
        this.COLLECTION_NAME,
        id
      );

      if (!publication) return null;

      const result = safeParse(PublicationResponseSchema, publication);
      if (!result.success) {
        console.error(
          "Publication data schema validation failed:",
          result.issues
        );
        throw new Error("INVALID_PUBLICATION_DATA");
      }

      return result.output;
    } catch (error) {
      console.error(`Failed to get publication ${id}:`, error);
      throw error;
    }
  }

  /**
   * Searches for publications within a specified geographic radius.
   *
   * @param latitude - Center point latitude
   * @param longitude - Center point longitude
   * @param radius - Search radius in kilometers (default: 10)
   * @param filters - Additional publication filters (excluding location)
   * @returns Array of publications within the specified radius
   */
  static async searchPublicationsNearby(
    latitude: number,
    longitude: number,
    radius: number = 10,
    filters: Omit<PublicationFilters, "location"> = {}
  ): Promise<Publication[]> {
    try {
      const { publications } = await this.getPublications({
        ...filters,
        location: { latitude, longitude, radius },
      });

      return publications;
    } catch (error) {
      console.error("Failed to search publications nearby:", error);
      throw error;
    }
  }

  /**
   * ================================================
   *                      UTILS
   * ================================================
   */

  /**
   * Type guard to check if a publication is a DonationRequest.
   *
   * @param publication - Publication to check
   * @returns True if publication is a DonationRequest
   */
  private static isDonationRequest(
    publication: PublicationResponse
  ): publication is DonationRequest {
    return publication.type === PUBLICATION_TYPES.DONATION_REQUEST;
  }

  /**
   * Validates publication creation data based on publication type requirements.
   *
   * @param data - Publication creation data to validate
   * @param userId - User ID creating the publication
   * @throws {Error} If publication data doesn't meet type-specific requirements
   */
  private static async validatePublicationCreation(
    data: CreatePublicationInput,
    userId: string
  ): Promise<void> {
    if (data.type === PUBLICATION_TYPES.DONATION_REQUEST) {
      // Verify user is a donation center, does nothing for the moment
    }

    if (data.type === PUBLICATION_TYPES.DONATION_OFFER) {
      if (!data.condition || !data.quantity) {
        throw new Error("DONATION_OFFER_REQUIRES_CONDITION_AND_QUANTITY");
      }
    }

    if (data.type === PUBLICATION_TYPES.DONATION_REQUEST) {
      if (!data.priority || !data.targetQuantity) {
        throw new Error(
          "DONATION_REQUEST_REQUIRES_PRIORITY_AND_TARGET_QUANTITY"
        );
      }
    }

    if (data.type === PUBLICATION_TYPES.EXCHANGE) {
      if (!data.condition || !data.seeking || data.seeking.length === 0) {
        throw new Error("EXCHANGE_REQUIRES_CONDITION_AND_SEEKING_ITEMS");
      }
    }
  }

  /**
   * Verifies that a user owns a specific publication.
   *
   * @param publicationId - Publication ID to verify ownership of
   * @param userId - User ID to verify ownership for
   * @throws {Error} PUBLICATION_NOT_FOUND if publication doesn't exist
   * @throws {Error} NOT_PUBLICATION_OWNER if user doesn't own the publication
   */
  private static async verifyPublicationOwnership(
    publicationId: string,
    userId: string
  ): Promise<void> {
    const publication = await this.getPublicationById(publicationId);

    if (!publication) {
      throw new Error("PUBLICATION_NOT_FOUND");
    }

    if (publication.userId !== userId) {
      throw new Error("NOT_PUBLICATION_OWNER");
    }
  }

  /**
   * Checks if two geographic points are within a specified radius using Haversine formula.
   *
   * @param lat1 - First point latitude
   * @param lon1 - First point longitude
   * @param lat2 - Second point latitude
   * @param lon2 - Second point longitude
   * @param radiusKm - Radius in kilometers to check within
   * @returns True if points are within the specified radius
   */
  private static isWithinRadius(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    radiusKm: number
  ): boolean {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance <= radiusKm;
  }

  /**
   * Converts degrees to radians.
   *
   * @param deg - Angle in degrees
   * @returns Angle in radians
   *
   * @example
   * const radians = PublicationService.deg2rad(180); // Returns: 3.14159...
   */
  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

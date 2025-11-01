import {
  array,
  boolean,
  literal,
  maxLength,
  maxValue,
  minLength,
  minValue,
  number,
  object,
  optional,
  pipe,
  string,
  transform,
  union,
} from "valibot";

export const PUBLICATION_TYPES = {
  DONATION_OFFER: "donation_offer",
  DONATION_REQUEST: "donation_request",
  EXCHANGE: "exchange",
} as const;

export const CATEGORIES = {
  CLOTHING: "clothing",
  FURNITURE: "furniture",
  ELECTRONICS: "electronics",
  BOOKS: "books",
  TOYS: "toys",
  FOOD: "food",
  SPORTS: "sports_equipment",
  OTHER: "other",
} as const;

export const CONDITIONS = {
  NEW: "new",
  LIKE_NEW: "like_new",
  GOOD: "good",
  FAIR: "fair",
  USED: "used",
} as const;

export const PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export const MEETING = {
  PORCH_PICKUP: "porch_pickup",
  PUBLIC_LOCATION: "public_location",
  DELIVERY: "delivery",
  FLEXIBLE: "flexible",
};

export const BasePublicationSchema = object({
  id: string(),
  type: union([
    literal(PUBLICATION_TYPES.DONATION_OFFER),
    literal(PUBLICATION_TYPES.DONATION_REQUEST),
    literal(PUBLICATION_TYPES.EXCHANGE),
  ]),
  title: pipe(string(), minLength(5), maxLength(100)),
  description: pipe(string(), minLength(10), maxLength(1000)),
  category: union([
    literal(CATEGORIES.CLOTHING),
    literal(CATEGORIES.FURNITURE),
    literal(CATEGORIES.ELECTRONICS),
    literal(CATEGORIES.BOOKS),
    literal(CATEGORIES.TOYS),
    literal(CATEGORIES.FOOD),
    literal(CATEGORIES.SPORTS),
    literal(CATEGORIES.OTHER),
  ]),
  image: array(string()),
  location: object({
    latitude: pipe(number(), minValue(-90), maxValue(90)),
    longitude: pipe(number(), minValue(-180), maxValue(180)),
    address: optional(string()),
  }),
  tags: array(string()),
  isActive: boolean(),
  userId: string(),
});

export const DonationOfferSchema = object({
  ...BasePublicationSchema.entries,
  type: literal(PUBLICATION_TYPES.DONATION_OFFER),
  condition: union([
    literal(CONDITIONS.NEW),
    literal(CONDITIONS.LIKE_NEW),
    literal(CONDITIONS.GOOD),
    literal(CONDITIONS.FAIR),
    literal(CONDITIONS.USED),
  ]),
  quantity: number(),
  pickupRequirements: optional(string()),
  availability: string(),
});

export const DonationRequestSchema = object({
  ...BasePublicationSchema.entries,
  type: literal(PUBLICATION_TYPES.DONATION_REQUEST),
  priority: union([
    literal(PRIORITIES.LOW),
    literal(PRIORITIES.MEDIUM),
    literal(PRIORITIES.HIGH),
    literal(PRIORITIES.URGENT),
  ]),
  targetQuantity: number(),
  currentQuantity: number(),
  deadline: optional(string()), // ISO date
  impactDescription: optional(string()),
  acceptedItem: array(string()),
  restriction: optional(string()),
  centerId: string(), // a user id of type donationCenter
});

export const ExchangeSchema = object({
  ...BasePublicationSchema.entries,
  type: literal(PUBLICATION_TYPES.EXCHANGE),
  conditions: union([
    literal(CONDITIONS.NEW),
    literal(CONDITIONS.LIKE_NEW),
    literal(CONDITIONS.GOOD),
    literal(CONDITIONS.FAIR),
    literal(CONDITIONS.USED),
  ]),
  seeking: array(string()),
  preferredItems: optional(string()),
  meetingPreference: union([
    literal(MEETING.PORCH_PICKUP),
    literal(MEETING.PUBLIC_LOCATION),
    literal(MEETING.DELIVERY),
    literal(MEETING.FLEXIBLE),
  ]),
});

export const CreatePublicationSchema = object({
  type: union([
    literal(PUBLICATION_TYPES.DONATION_OFFER),
    literal(PUBLICATION_TYPES.DONATION_REQUEST),
    literal(PUBLICATION_TYPES.EXCHANGE),
  ]),
  title: pipe(
    string(),
    minLength(5, "Title must be at least 5 characters"),
    maxLength(100, "Title cannot exceed 100 characters"),
    transform((title) => title.trim())
  ),
  description: pipe(
    string(),
    minLength(10, "Description must be at least 10 characters"),
    maxLength(1000, "Description cannot exceed 1000 characters"),
    transform((desc) => desc.trim())
  ),
  category: union([
    literal(CATEGORIES.CLOTHING),
    literal(CATEGORIES.FURNITURE),
    literal(CATEGORIES.ELECTRONICS),
    literal(CATEGORIES.BOOKS),
    literal(CATEGORIES.TOYS),
    literal(CATEGORIES.FOOD),
    literal(CATEGORIES.SPORTS),
    literal(CATEGORIES.OTHER),
  ]),
  images: optional(array(string())),
  location: object({
    latitude: pipe(number(), minValue(-90), maxValue(90)),
    longitude: pipe(number(), minValue(-180), maxValue(180)),
    address: optional(string()),
  }),
  tags: optional(array(pipe(string(), maxLength(20)))),

  // Donation Offer specific
  condition: optional(
    union([
      literal(CONDITIONS.NEW),
      literal(CONDITIONS.LIKE_NEW),
      literal(CONDITIONS.GOOD),
      literal(CONDITIONS.FAIR),
      literal(CONDITIONS.USED),
    ])
  ),
  quantity: optional(pipe(number(), minValue(1))),
  pickupRequirements: optional(pipe(string(), maxLength(200))),
  availability: optional(pipe(string(), maxLength(100))),

  // Donation Request specific
  priority: optional(
    union([
      literal(PRIORITIES.LOW),
      literal(PRIORITIES.MEDIUM),
      literal(PRIORITIES.HIGH),
      literal(PRIORITIES.URGENT),
    ])
  ),
  targetQuantity: optional(pipe(number(), minValue(1))),
  deadline: optional(string()),
  impactDescription: optional(pipe(string(), maxLength(200))),
  acceptedItems: optional(array(string())),
  restrictions: optional(pipe(string(), maxLength(200))),

  // Exchange specific
  seeking: optional(array(pipe(string(), maxLength(50)))),
  preferredItems: optional(pipe(string(), maxLength(200))),
  meetingPreference: optional(
    union([
      literal(MEETING.PORCH_PICKUP),
      literal(MEETING.PUBLIC_LOCATION),
      literal(MEETING.DELIVERY),
      literal(MEETING.FLEXIBLE),
    ])
  ),
});

export const UpdatePublicationSchema = object({
  title: optional(
    pipe(
      string(),
      minLength(5, "Title must be at least 5 characters"),
      maxLength(100, "Title cannot exceed 100 characters"),
      transform((title) => title.trim())
    )
  ),
  description: optional(
    pipe(
      string(),
      minLength(10, "Description must be at least 10 characters"),
      maxLength(1000, "Description cannot exceed 1000 characters"),
      transform((desc) => desc.trim())
    )
  ),
  images: optional(array(string())),
  isActive: optional(boolean()),

  // Donation Offer updates
  condition: optional(
    union([
      literal(CONDITIONS.NEW),
      literal(CONDITIONS.LIKE_NEW),
      literal(CONDITIONS.GOOD),
      literal(CONDITIONS.FAIR),
      literal(CONDITIONS.USED),
    ])
  ),
  quantity: optional(pipe(number(), minValue(1))),
  pickupRequirements: optional(pipe(string(), maxLength(200))),
  availability: optional(pipe(string(), maxLength(100))),

  // Donation Request updates
  priority: optional(
    union([
      literal(PRIORITIES.LOW),
      literal(PRIORITIES.MEDIUM),
      literal(PRIORITIES.HIGH),
      literal(PRIORITIES.URGENT),
    ])
  ),
  targetQuantity: optional(pipe(number(), minValue(1))),
  currentQuantity: optional(pipe(number(), minValue(0))),
  deadline: optional(string()),

  // Exchange updates
  seeking: optional(array(pipe(string(), maxLength(50)))),
  preferredItems: optional(pipe(string(), maxLength(200))),
  meetingPreference: optional(
    union([
      literal(MEETING.PORCH_PICKUP),
      literal(MEETING.PUBLIC_LOCATION),
      literal(MEETING.DELIVERY),
      literal(MEETING.FLEXIBLE),
    ])
  ),
});

export const PublicationResponseSchema = union([
  DonationOfferSchema,
  DonationRequestSchema,
  ExchangeSchema,
]);

export const PublicationListResponseSchema = array(PublicationResponseSchema);

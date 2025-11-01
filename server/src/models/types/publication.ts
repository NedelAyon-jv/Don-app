import type { InferInput, InferOutput } from "valibot";
import type {
  BasePublicationSchema,
  CATEGORIES,
  CONDITIONS,
  CreatePublicationSchema,
  DonationOfferSchema,
  DonationRequestSchema,
  ExchangeSchema,
  PRIORITIES,
  PUBLICATION_TYPES,
  UpdatePublicationSchema,
} from "../schema/publication";

export type PublicationType =
  (typeof PUBLICATION_TYPES)[keyof typeof PUBLICATION_TYPES];
export type CategoryType = (typeof CATEGORIES)[keyof typeof CATEGORIES];
export type ConditionType = (typeof CONDITIONS)[keyof typeof CONDITIONS];
export type PriorityType = (typeof PRIORITIES)[keyof typeof PRIORITIES];

export type BasePublication = InferOutput<typeof BasePublicationSchema>;
export type DonationOffer = InferOutput<typeof DonationOfferSchema>;
export type DonationRequest = InferOutput<typeof DonationRequestSchema>;
export type Exchange = InferOutput<typeof ExchangeSchema>;
export type Publication = DonationOffer | DonationRequest | Exchange;

export type CreatePublicationInput = InferInput<typeof CreatePublicationSchema>;
export type UpdatePublicationInput = InferInput<typeof UpdatePublicationSchema>;

import type { InferInput } from "valibot";
import type {
  CreateConversationSchema,
  CreateMessageSchema,
  MarkAsReadSchema,
} from "../schema/chat";

export type CreateMessageInput = InferInput<typeof CreateMessageSchema>;
export type CreateConversationInput = InferInput<
  typeof CreateConversationSchema
>;
export type MarkAsRead = InferInput<typeof MarkAsReadSchema>;

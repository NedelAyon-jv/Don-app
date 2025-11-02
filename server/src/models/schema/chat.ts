import { array, literal, object, optional, string, union } from "valibot";

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: "text" | "image" | "file" | "system";
  metadata?: Record<string, any>;
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantDetails?: ParticipantDetail[];
  lastMessage?: ChatMessage;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
  type: "direct" | "group";
  name?: string;
  description?: string;
  adminId?: string;
  isActive?: boolean;
}

export interface ParticipantDetail {
  userId: string;
  joinedAt: Date;
  role: "admin" | "member";
  lastReadMessageId?: string;
}

export interface ConversationSummary {
  id: string;
  participantDetails: ParticipantDetail[];
  lastMessage?: ChatMessage;
  unreadCount: number;
}

export const CreateMessageSchema = object({
  conversationId: string(),
  content: string(),
  messageType: union([
    literal("text"),
    literal("image"),
    literal("file"),
    literal("system"),
  ]),
  metadata: optional(object({})),
});

export const CreateConversationSchema = object({
  participants: array(string()),
  type: union([literal("direct"), literal("group")]),
  name: optional(string()),
  description: optional(string()),
});

export const MarkAsReadSchema = object({
    messageId: string(),
    conversationId: string(),
});

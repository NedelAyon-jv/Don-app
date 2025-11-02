import type {
  ChatMessage,
  Conversation,
  ConversationSummary,
  ParticipantDetail,
} from "../../models/schema/chat";
import { firestoreService } from "../Firebase/firebase.service";

export class ChatService {
  private readonly MESSAGE_COLLECTION = "chat_message";
  private readonly CONVERSATIONS_COLLECTION = "conversations";
  private readonly USER_COLLECTION = "users"; // CAN BE USE TO VERIFY USER EXISTENCE BEFORE RETURNING CONVERSATION, NOT IMPLEMENTED

  /**
   * ================================================
   *                  CONVERSATION
   * ================================================
   */
  /**
   * Creates a new conversation or returns existing direct conversation.
   *
   * @param creatorId - ID of the user creating the conversation
   * @param participants - Array of participant user IDs
   * @param type - Conversation type: "direct" or "group" (default: "direct")
   * @param name - Optional name for group conversations
   * @param description - Optional description for group conversations
   * @returns Conversation ID (new or existing)
   *
   * @throws {Error} NUMBER_OF_MEMBERS_EXCEED_LIMIT if direct conversation has more than 2 participants
   */
  async createConversation(
    creatorId: string,
    participants: string[],
    type: "direct" | "group" = "direct",
    name?: string,
    description?: string
  ): Promise<string> {
    if (type === "direct" && participants.length !== 2) {
      throw new Error("NUMBER_OF_MEMBERS_EXCEED_LIMIT");
    }

    if (
      type === "direct" &&
      participants.length >= 2 &&
      participants[0] &&
      participants[1]
    ) {
      const existingConversation = await this.findDirectConversation(
        participants[0],
        participants[1]
      );
      if (existingConversation) {
        return existingConversation.id;
      }
    }

    const participantDetails: ParticipantDetail[] = participants.map(
      (userId) => ({
        userId,
        joinedAt: new Date(),
        role: userId === creatorId ? "admin" : "member",
      })
    );

    const conversationData: Omit<Conversation, "id"> = {
      participants,
      participantDetails,
      type,
      name: type === "group" ? name : undefined,
      description: type === "group" ? description : undefined,
      adminId: type === "group" ? creatorId : undefined,
      lastMessageAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    return await firestoreService.create<Conversation>(
      this.CONVERSATIONS_COLLECTION,
      conversationData
    );
  }

  /**
   * Retrieves a conversation by its ID.
   *
   * @param conversationId - ID of the conversation to retrieve
   * @returns Conversation object or null if not found
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
    return await firestoreService.getById<Conversation>(
      this.CONVERSATIONS_COLLECTION,
      conversationId
    );
  }

  /**
   * Retrieves all conversations for a user with summary information.
   *
   * @param userId - User ID to get conversations for
   * @returns Array of conversation summaries with unread counts and last messages
   */
  async getUserConversations(userId: string): Promise<ConversationSummary[]> {
    const conversations = await firestoreService.query<Conversation>(
      this.CONVERSATIONS_COLLECTION,
      {
        where: ["participants", "array-contains", userId],
        orderBy: { field: "lastMessageAt", direction: "desc" },
      }
    );

    const summaries: ConversationSummary[] = [];

    for (const conversation of conversations) {
      const unreadCount = await this.getUnreadCount(conversation.id, userId);
      const lastMessage = await this.getLastMessage(conversation.id);

      summaries.push({
        id: conversation.id,
        participantDetails: conversation.participantDetails || [],
        lastMessage: lastMessage || undefined,
        unreadCount,
      });
    }

    return summaries;
  }

  /**
   * ================================================
   *                    MESSAGE
   * ================================================
   */

  /**
   * Sends a message in a conversation.
   *
   * @param conversationId - ID of the conversation to send message in
   * @param senderId - ID of the user sending the message
   * @param content - Message content (text, image URL, file URL, etc.)
   * @param messageType - Type of message (default: "text")
   * @param metadata - Optional additional message metadata
   * @returns ID of the created message
   *
   * @throws {Error} CONVERSATION_NOT_FOUND_OR_USER_NOT_AUTHORIZED if conversation doesn't exist or user is not a participant
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    messageType: "text" | "image" | "file" | "system" = "text",
    metadata?: Record<string, any>
  ): Promise<string> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation || !conversation.participants.includes(senderId)) {
      throw new Error("CONVERSATION_NOT_FOUND_OR_USER_NOT_AUTHORIZED");
    }

    const messageData: Omit<ChatMessage, "id"> = {
      conversationId,
      senderId,
      content,
      messageType,
      metadata,
      readBy: [senderId],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const messageId = await firestoreService.create<ChatMessage>(
      this.MESSAGE_COLLECTION,
      messageData
    );

    await firestoreService.update<Conversation>(
      this.CONVERSATIONS_COLLECTION,
      conversationId,
      {
        lastMessageAt: new Date(),
      }
    );

    return messageId;
  }

  /**
   * Retrieves messages from a conversation with pagination.
   *
   * @param conversationId - ID of the conversation to get messages from
   * @param limit - Maximum number of messages to return (default: 50)
   * @param startAfter - Cursor for pagination (last message ID from previous page)
   * @returns Array of chat messages, ordered by creation date (newest first)
   */
  async getConversationMessages(
    conversationId: string,
    limit: number = 50,
    startAfter?: any
  ): Promise<ChatMessage[]> {
    let options: any = {
      where: ["conversationId", "==", conversationId],
      orderBy: { field: "createdAt", direction: "desc" },
      limit,
    };

    if (startAfter) {
      options.startAfter = startAfter;
    }

    return await firestoreService.query<ChatMessage>(
      this.MESSAGE_COLLECTION,
      options
    );
  }

  /**
   * Marks a specific message as read by a user.
   *
   * @param conversationId - ID of the conversation containing the message
   * @param messageId - ID of the message to mark as read
   * @param userId - ID of the user marking the message as read
   * @returns Promise that resolves when message is updated
   *
   * @throws {Error} MESSAGE_NOT_FOUND if message doesn't exist or doesn't belong to the conversation
   */
  async markMessageAsRead(
    conversationId: string,
    messageId: string,
    userId: string
  ): Promise<void> {
    const message = await firestoreService.getById<ChatMessage>(
      this.MESSAGE_COLLECTION,
      messageId
    );

    if (!message || message.conversationId !== conversationId) {
      throw new Error("MESSAGE_NOT_FOUND");
    }

    if (!message.readBy.includes(userId)) {
      await firestoreService.update<ChatMessage>(
        this.MESSAGE_COLLECTION,
        messageId,
        {
          readBy: [...message.readBy, userId],
        }
      );
    }
  }

  /**
   * Marks all messages in a conversation as read for a specific user.
   *
   * @param conversationId - ID of the conversation to mark messages as read
   * @param userId - ID of the user marking messages as read
   * @returns Promise that resolves when all messages are updated
   *
   * @example
   * await chatService.markAllAsRead("conv123", "user123");
   */
  async markAllAsRead(conversationId: string, userId: string): Promise<void> {
    const allMessages = await firestoreService.query<ChatMessage>(
      this.MESSAGE_COLLECTION,
      {
        where: ["conversationId", "==", conversationId],
      }
    );

    const unreadMessages = allMessages.filter(
      (message) => !message.readBy?.includes(userId)
    );

    for (const message of unreadMessages) {
      const updatedReadBy = [...(message.readBy || []), userId];
      await firestoreService.update<ChatMessage>(
        this.MESSAGE_COLLECTION,
        message.id,
        { readBy: updatedReadBy }
      );
    }
  }

  /**
   * ================================================
   *                      UTILS
   * ================================================
   */

  /**
   * Finds an existing direct conversation between two users.
   *
   * @param user1Id - First user ID
   * @param user2Id - Second user ID
   * @returns Existing direct conversation or null if not found
   */
  private async findDirectConversation(
    user1Id: string,
    user2Id: string
  ): Promise<Conversation | null> {
    const conversations = await firestoreService.query<Conversation>(
      this.CONVERSATIONS_COLLECTION,
      {
        where: ["participants", "array-contains", user1Id],
      }
    );

    return (
      conversations.find(
        (conv) =>
          conv.type === "direct" &&
          conv.participants.includes(user2Id) &&
          conv.participants.length === 2
      ) || null
    );
  }

  /**
   * Gets the count of unread messages for a user in a conversation.
   *
   * @param conversationId - ID of the conversation
   * @param userId - ID of the user to check unread count for
   * @returns Number of unread messages
   */
  private async getUnreadCount(
    conversationId: string,
    userId: string
  ): Promise<number> {
    const allMessages = await firestoreService.query<ChatMessage>(
      this.MESSAGE_COLLECTION,
      {
        where: ["conversationId", "==", conversationId],
      }
    );

    const unreadMessages = allMessages.filter(
      (message) => !message.readBy?.includes(userId)
    );

    return unreadMessages.length;
  }

  /**
   * Gets the most recent message from a conversation.
   *
   * @param conversationId - ID of the conversation
   * @returns Most recent chat message or null if no messages exist
   */
  private async getLastMessage(
    conversationId: string
  ): Promise<ChatMessage | null> {
    const message = await firestoreService.query<ChatMessage>(
      this.MESSAGE_COLLECTION,
      {
        where: ["conversationId", "==", conversationId],
        orderBy: { field: "createdAt", direction: "desc" },
        limit: 1,
      }
    );

    return message[0] || null;
  }

  /**
   * ================================================
   *                   REAL-TIME
   * ================================================
   */

  /**
   * Subscribes to real-time updates for a conversation's messages.
   *
   * @param conversationId - ID of the conversation to subscribe to
   * @param callback - Function called whenever messages are updated
   * @returns Unsubscribe function to stop listening
   */
  subscribeToConversation(
    conversationId: string,
    callback: (messages: ChatMessage[]) => void
  ): () => void {
    return firestoreService.subscribeToCollection<ChatMessage>(
      this.MESSAGE_COLLECTION,
      (message) => {
        const conversationMessages = message
          .filter((msg) => msg.conversationId === conversationId)
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

        callback(conversationMessages);
      },
      (error) => {
        console.error("CONVERSATION_SUBSCRIPTION_ERROR:", error);
      }
    );
  }

  /**
   * Subscribes to real-time updates for all conversations of a specific user.
   *
   * @param userId - ID of the user to subscribe to conversations for
   * @param callback - Function called whenever user's conversations are updated
   * @returns Unsubscribe function to stop listening
   */
  subscribeToUserConversations(
    userId: string,
    callback: (conversations: Conversation[]) => void
  ): () => void {
    return firestoreService.subscribeToCollection<Conversation>(
      this.CONVERSATIONS_COLLECTION,
      (conversations) => {
        const userConversations = conversations
          .filter((conv) => conv.participants.includes(userId))
          .sort(
            (a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
          );

        callback(userConversations);
      },
      (error) => {
        console.error("User conversations subscription error:", error);
      }
    );
  }
}

export const chatService = new ChatService();

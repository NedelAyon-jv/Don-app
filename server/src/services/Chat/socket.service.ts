import { Server as SocketIOServer, Socket } from "socket.io";
import type { Server as HTTPServer } from "http";
import { chatService } from "./chat.service";
import { message } from "valibot";
import { chatAuthMiddleware } from "../../middleware/chat.middleware";

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export class SocketService {
  private io: SocketIOServer | null = null;
  private userSockets: Map<string, string[]> = new Map();

  initialize(server: HTTPServer): void {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || [
      "http://localhost:3000",
      "http://localhost:5173",
      "capacitor://localhost",
      "ionic://localhost",
    ];

    this.io = new SocketIOServer(server, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  /**
   * Sets up Socket.IO middleware for authentication and user session management.
   */
  private setupMiddleware(): void {
    if (!this.io) return;

    this.io.use(chatAuthMiddleware);

    this.io.use((socket: AuthenticatedSocket, next) => {
      const userId = socket.userId;
      if (!userId) {
        return next(new Error("CHAT_AUTHENTICATION_ERROR"));
      }

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, []);
      }
      this.userSockets.get(userId)?.push(socket.id);

      next();
    });
  }

  /**
   * Sets up Socket.IO event handlers for real-time chat functionality.
   * Handles connection, messaging, typing indicators, and conversation management.
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on("connection", (socket: AuthenticatedSocket) => {
      const userId = socket.userId;
      console.log(`User ${userId} connected with socket ${socket.id}`);

      if (userId) {
        socket.join(`user:${userId}`);

        this.joinUserConversation(socket, userId);
      }

      socket.on("send_message", async (data) => {
        try {
          const {
            conversationId,
            content,
            messageType = "text",
            metadata,
          } = data;

          const messageId = await chatService.sendMessage(
            conversationId,
            userId!,
            content,
            messageType,
            metadata
          );

          const message = await chatService.getConversationMessages(
            conversationId,
            1
          );
          const newMessage = message[0];

          // Send message to all user un conversation
          this.io?.to(`conversation:${conversationId}`).emit("new_message", {
            conversationId,
            message: newMessage,
          });

          // send notification about new message to all users
          this.io
            ?.to(`conversation:${conversationId}`)
            .emit("conversation_update", {
              conversationId,
              lastMessage: newMessage,
            });
        } catch (error: any) {
          socket.emit("MESSAGE_ERROR", { error: error.message });
        }
      });

      socket.on("mark_as_read", async (data) => {
        try {
          const { conversationId, messageId } = data;
          await chatService.markMessageAsRead(
            conversationId,
            messageId,
            userId!
          );

          // Notification that the message was read
          socket.to(`conversation:${conversationId}`).emit("message_read", {
            conversationId,
            messageId,
            readBy: userId,
          });
        } catch (error: any) {
          socket.emit("READ_ERROR", { error: error.message });
        }
      });

      socket.on("join_conversation", (conversationId) => {
        socket.join(`conversation:${conversationId}`);
        console.log(`User ${userId} joined conversation: ${conversationId}`);
      });

      socket.on("leave_conversation", (conversationId) => {
        socket.leave(`conversation:${conversationId}`);
        console.log(`User ${userId} left conversation: ${conversationId}`);
      });

      socket.on("typing_start", (data) => {
        const { conversationId } = data;
        socket.to(`conversation:${conversationId}`).emit("user_typing", {
          conversationId,
          userId,
          typing: true,
        });
      });

      socket.on("typing_stop", (data) => {
        const { conversationId } = data;
        socket.to(`conversation:${conversationId}`).emit("user_typing", {
          conversationId,
          userId,
          typing: false,
        });
      });

      socket.on("disconnect", () => {
        if (userId) {
          const userSockets = this.userSockets.get(userId);
          if (userSockets) {
            const updatedSockets = userSockets.filter((id) => id !== socket.id);
            if (updatedSockets.length === 0) {
              this.userSockets.delete(userId);
            } else {
              this.userSockets.set(userId, updatedSockets);
            }
          }
        }
        console.log(`User ${userId} disconnected`);
      });
    });
  }

  /**
   * Automatically joins a user to all their conversations upon socket connection.
   *
   * @param socket - Authenticated socket instance
   * @param userId - ID of the user to join to conversations
   */
  private async joinUserConversation(
    socket: AuthenticatedSocket,
    userId: string
  ): Promise<void> {
    try {
      const conversations = await chatService.getUserConversations(userId);

      conversations.forEach((conversation) => {
        socket.join(`conversation:${conversation.id}`);
      });
    } catch (error) {
      console.error("ERROR_JOINING_USER_CONVERSATION", error);
    }
  }

  /**
   * Emits an event to a specific user across all their connected sockets.
   *
   * @param userId - ID of the user to emit the event to
   * @param event - Event name to emit
   * @param data - Data to send with the event
   *
   * @example
   * // Notify user of new notification
   * socketService.emitToUser("user123", "new_notification", {
   *   type: "message",
   *   content: "You have a new message"
   * });
   *
   * // Notify user their profile was updated
   * socketService.emitToUser("user123", "profile_updated", {
   *   message: "Your profile has been updated successfully"
   * });
   */
  emitToUser(userId: string, event: string, data: any): void {
    this.io?.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Emits an event to all users in a specific conversation.
   *
   * @param conversationId - ID of the conversation to emit the event to
   * @param event - Event name to emit
   * @param data - Data to send with the event
   *
   * @example
   * // Notify all conversation participants of an update
   * socketService.emitToConversation("conv123", "conversation_updated", {
   *   type: "member_added",
   *   newMember: "user456"
   * });
   *
   * // Send system message to conversation
   * socketService.emitToConversation("conv123", "system_message", {
   *   content: "The conversation settings have been updated"
   * });
   */
  emitToConversation(conversationId: string, event: string, data: any): void {
    this.io?.to(`conversation:${conversationId}`).emit(event, data);
  }

  /**
   * Gets the Socket.IO server instance.
   *
   * @returns Socket.IO server instance or null if not initialized
   *
   * @example
   * const io = socketService.getIO();
   * if (io) {
   *   io.emit("global_event", { message: "Hello everyone!" });
   * }
   */
  getIO(): SocketIOServer | null {
    return this.io;
  }
}

export const socketService = new SocketService();

import type { Request, Response } from "express";
import {
  CreateConversationSchema,
  CreateMessageSchema,
} from "../../models/schema/chat";
import { parse } from "valibot";
import { chatService } from "../../services/Chat/chat.service";

export class ChatController {
  /**
   * Handles conversation creation request.
   *
   * @route POST /conversations
   * @body CreateConversationSchema
   * @returns Created conversation ID
   */
  async createConversation(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const validateData = parse(CreateConversationSchema, req.body);

      const conversationId = await chatService.createConversation(
        userId!,
        validateData.participants,
        validateData.type as "direct" | "group",
        validateData.name,
        validateData.description
      );

      res.status(201).json({
        success: true,
        data: {
          conversationId,
        },
        message: "Conversation created successfully",
      });
    } catch (error: any) {
      console.error("Create conversation error:", error);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Retrieves all conversations for the authenticated user.
   *
   * @route GET /conversations
   * @param {string} req.userId - The authenticated user's ID (from middleware)
   * @returns {Object} Response object containing conversations array
   * @returns {boolean} success - Indicates if the request was successful
   * @returns {Array} data - Array of user's conversation objects
   * @throws {500} Internal server error if conversation retrieval fails
   */
  async getUserConversations(req: Request, res: Response) {
    try {
      const userId = req.userId;

      if (userId) {
        const conversations = await chatService.getUserConversations(userId);

        res.json({
          success: true,
          data: conversations,
        });
      }
    } catch (error: any) {
      console.error("Get conversation error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Retrieves a specific conversation by its ID.
   *
   * @route GET /conversations/:conversationId
   * @param {string} req.params.conversationId - The ID of the conversation to retrieve
   * @returns {Object} Response object containing conversation data
   * @returns {boolean} success - Indicates if the request was successful
   * @returns {Object} data - The conversation object
   * @throws {400} Bad request if conversation ID is missing or conversation not found
   * @throws {500} Internal server error if conversation retrieval fails
   */
  async getConversation(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;

      if (!conversationId) {
        return res.status(400).json({
          success: false,
          error: "Conversation ID is required",
        });
      }
      const conversation = await chatService.getConversation(conversationId);

      if (!conversation) {
        return res.status(400).json({
          success: false,
          error: "Conversation not found",
        });
      }

      res.json({
        success: true,
        data: conversation,
      });
    } catch (error: any) {
      console.error("Get conversation error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Sends a new message in a conversation.
   *
   * @route POST /messages
   * @body CreateMessageSchema
   * @param {string} req.userId - The authenticated user's ID (from middleware)
   * @returns {Object} Response object containing created message ID
   * @returns {boolean} success - Indicates if the request was successful
   * @returns {Object} data - Object containing the created message ID
   * @returns {string} data.messageId - The ID of the newly created message
   * @returns {string} message - Success message
   * @throws {400} Bad request if validation fails or message sending fails
   */
  async sendMessage(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const validateData = parse(CreateMessageSchema, req.body);

      const messageId = await chatService.sendMessage(
        validateData.conversationId,
        userId!,
        validateData.content,
        validateData.messageType as any,
        validateData.metadata
      );

      res.status(200).json({
        success: true,
        data: { messageId },
        message: "Message sent Successfully",
      });
    } catch (error: any) {
      console.error("Send message error:", error);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Retrieves messages from a specific conversation with pagination support.
   *
   * @route GET /conversations/:conversationId/messages
   * @param {string} req.params.conversationId - The ID of the conversation to retrieve messages from
   * @param {number} [req.query.limit=50] - Maximum number of messages to return (default: 50)
   * @param {string} [req.query.startAfter] - Cursor for pagination (start after this message ID)
   * @returns {Object} Response object containing messages array
   * @returns {boolean} success - Indicates if the request was successful
   * @returns {Array} data - Array of message objects from the conversation
   * @throws {400} Bad request if conversation ID is not provided
   * @throws {500} Internal server error if message retrieval fails
   */
  async getMessages(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const { limit = 50, startAfter } = req.query;

      if (!conversationId)
        return res.status(400).json({
          success: false,
          error: "Not conversation provided",
        });

      const messages = await chatService.getConversationMessages(
        conversationId,
        Number(limit),
        startAfter as any
      );

      res.json({
        success: true,
        data: messages,
      });
    } catch (error: any) {
      console.error("Get messages error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Marks a specific message as read for the authenticated user.
   *
   * @route POST /messages/read
   * @param {string} req.userId - The authenticated user's ID (from middleware)
   * @param {string} req.body.conversationId - The ID of the conversation containing the message
   * @param {string} req.body.messageId - The ID of the message to mark as read
   * @returns {Object} Response object confirming the operation
   * @returns {boolean} success - Indicates if the request was successful
   * @returns {string} message - Success confirmation message
   * @throws {400} Bad request if marking as read fails
   */
  async markAsRead(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const { conversationId, messageId } = req.body;

      await chatService.markMessageAsRead(conversationId, messageId, userId!);

      res.json({
        success: true,
        message: "Message marked as read",
      });
    } catch (error: any) {
      console.error("Mark as read error:", error);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Marks all messages in a conversation as read for the authenticated user.
   *
   * @route POST /conversations/:conversationId/read-all
   * @param {string} req.userId - The authenticated user's ID (from middleware)
   * @param {string} req.params.conversationId - The ID of the conversation to mark all messages as read
   * @returns {Object} Response object confirming the operation
   * @returns {boolean} success - Indicates if the request was successful
   * @returns {string} message - Success confirmation message
   * @throws {400} Bad request if marking messages as read fails
   */
  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const { conversationId } = req.params;

      if (!conversationId) {
        return res.status(400).json({
          success: false,
          error: "Conversation ID is required",
        });
      }

      await chatService.markAllAsRead(conversationId!, userId!);

      res.json({
        success: true,
        message: "All messages marked as read",
      });
    } catch (error: any) {
      console.error("Mark all as read error:", error);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async subscribeToConversation(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const userId = req.userId;

      const conversation = await chatService.getConversation(conversationId!);
      if (!conversation || !conversation.participants.includes(userId!)) {
        return res.status(403).json({
          success: false,
          error: "Access denied to conversation",
        });
      }

      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
      });

      const unsubscribe = chatService.subscribeToConversation(
        conversationId!,
        (messages) => {
          res.write(
            `data: ${JSON.stringify({ type: "messages", data: messages })}\n\n`
          );
        }
      );

      req.on("close", () => {
        unsubscribe();
        res.end();
      });
    } catch (error) {}
  }
}

export const chatController = new ChatController();

import { Router } from "express";
import { chatAuthenticateFirebaseUser } from "../../middleware/chat.middleware";
import { chatController } from "../../controllers/chat/chat.controller";

const router = Router();

router.use(chatAuthenticateFirebaseUser);

/**
 * ================================================
 *                  CONVERSATIONS
 * ================================================
 */

router.post(
  "/conversations",
  chatController.createConversation.bind(chatController)
);
router.get(
  "/conversations",
  chatController.getUserConversations.bind(chatController)
);
router.get(
  "/conversations/:conversationId",
  chatController.getConversation.bind(chatController)
);

/**
 * ================================================
 *                     MESSAGE
 * ================================================
 */

router.post("/messages", chatController.sendMessage.bind(chatController));
router.get(
  "/conversations/:conversationId/messages",
  chatController.getMessages.bind(chatController)
);
router.post(
  "/messages/mark-read",
  chatController.markAsRead.bind(chatController)
);
router.post(
  "/conversations/:conversationId/mark-all-read",
  chatController.markAllAsRead.bind(chatController)
);

/**
 * ================================================
 *                   SUBSCRIPTION
 * ================================================
 */
router.get(
  "/conversations/:conversationId/subscribe",
  chatController.subscribeToConversation.bind(chatController)
);


export default router;
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "../API.services";

// ✅ Obtener conversaciones del usuario
export const getUserConversations = async () => {
  try {
    const response: any = await apiClient.get("/chat/conversations");
    console.log("✅ Conversaciones obtenidas:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error al obtener conversaciones:", error);
    throw error;
  }
};

// ✅ Obtener conversación por ID
export const getConversationById = async (conversationId: string) => {
  try {
    if (!conversationId) throw new Error("conversationId es requerido");

    const response: any = await apiClient.get(
      `/chat/conversations/${conversationId}`
    );

    console.log("✅ Conversación obtenida:", response.data);
    return response.data;

  } catch (error) {
    console.error("❌ Error al obtener la conversación:", error);
    throw error;
  }
};

// ✅ Obtener mensajes del chat con límite opcional
export const getChatMessages = async (chatId: string, limit: number = 10) => {
  try {
    if (!chatId) throw new Error("chatId es requerido");

    const response: any = await apiClient.get(
      `/chat/conversations/${chatId}/messages?limit=${limit}`
    );

    console.log("✅ Mensajes obtenidos:", response.data);
    return response.data;

  } catch (error) {
    console.error("❌ Error obteniendo mensajes del chat:", error);
    throw error;
  }
};

// ✅ Suscribirse a una conversación
export const subscribeToConversation = async (conversationId: string) => {
  try {
    if (!conversationId) throw new Error("conversationId es requerido");

    const response: any = await apiClient.get(
      `/chat/conversations/${conversationId}/subscribe`
    );

    console.log("✅ Suscripción exitosa:", response.data);
    return response.data;

  } catch (error) {
    console.error("❌ Error al suscribirse a la conversación:", error);
    throw error;
  }
};

// ✅ Crear conversación
export const createConversation = async (
  participants: string[],
  type: "direct" | "group" = "direct"
) => {
  try {
    if (!participants || participants.length < 2) {
      throw new Error("Se requieren al menos 2 participantes");
    }

    const response: any = await apiClient.post(
      `/chat/conversations`,
      { participants, type },
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("✅ Conversación creada:", response.data);
    return response.data;

  } catch (error) {
    console.error("❌ Error al crear la conversación:", error);
    throw error;
  }
};

// ✅ Enviar mensaje
export const sendMessage = async (
  conversationId: string,
  content: string,
  messageType: "text" | "image" = "text"
) => {
  try {
    if (!conversationId) throw new Error("conversationId es requerido");
    if (!content) throw new Error("content es requerido");

    const response: any = await apiClient.post(
      `/chat/conversations/${conversationId}/messages`,
      { content, messageType },
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("✅ Mensaje enviado:", response.data);
    return response.data;

  } catch (error) {
    console.error("❌ Error al enviar el mensaje:", error);
    throw error;
  }
};
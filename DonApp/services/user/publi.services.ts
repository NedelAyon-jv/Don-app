import { apiClient } from '../API.services'; // Asumiendo la ruta de tu APIClient

// 1. Definimos la interfaz de lo que esperamos de la API
// Basado en el PDF (PublicaionData)
export interface ApiPublication {
  id: string; // La API debe devolver un ID
  title: string;
  description: string;
  type: 'donation_offer' | 'donation_request' | 'trade_offer'; // Tipos de la API
  category: string;
  condition: string;
  quantity: number;
  availability: string;
  pickupRequirements: string;
  location: {
    latitude: number;
    longitude: number;
    address: string; // Usaremos esta
  };
  images: string[]; // Esperamos un array de URLs de imagen
  tags: string[];
  createdAt: string; // La API suele incluir esto
}

/**
 * Obtiene todas las publicaciones del feed.
 */
export const getAllPublications = async (): Promise<ApiPublication[]> => {
  try {
    // Asumimos que el endpoint es '/publications' como en tus otros servicios
    
    // --- LÍNEA CORREGIDA ---
    // Le decimos a apiClient que esperamos un objeto que CONTIENE 'data'
    // (basado en cómo se ven las otras respuestas de tu API en el PDF)
    const response = await apiClient.get<{ success: boolean, data: ApiPublication[] }>('/publications');
    
    // El PDF es inconsistente, pero lo más probable es que la API
    // devuelva un objeto { success: true, data: [...] }
    // Así que solo debemos devolver la propiedad 'data'
    
    // --- LÍNEA CORREGIDA (38) ---
    // Si la respuesta de la API es correcta, response.data.data será el array
    return response.data.data; 

  } catch (error) {
    console.error("❌ Error al obtener publicaciones:", error);
    throw new Error("No se pudieron cargar las publicaciones.");
  }
};
import { apiClient } from '../API.services';

export interface ApiPublication {
  id: string;
  title: string;
  description: string;
  type: 'donation_offer' | 'donation_request' | 'trade_offer';
  category: string;
  condition: string;
  quantity: number;
  availability: string;
  pickupRequirements: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  // Soportamos ambos nombres para evitar errores
  images?: string[]; 
  iamges?: string[]; 
  tags: string[];
  createdAt: string;
}

/**
 * Función auxiliar para FormData
 */
const createFormData = (data: any, images: string[]) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    const value = data[key];
    if (typeof value === 'object' && value !== null) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });
  images.forEach((imageUri, index) => {
    const filename = imageUri.split('/').pop() || `image_${index}.jpg`;
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;
    // @ts-ignore
    formData.append('iamges', { // Mantenemos el error de dedo para el POST si así lo pide el back
      uri: imageUri,
      name: filename,
      type,
    });
  });
  return formData;
};

export const createDonation = async (data: any, images: string[]) => {
  try {
    const payload = { publicationData: data };
    const formData = createFormData(payload, images);
    const response = await apiClient.post('/publications', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error en createDonation:", error);
    throw error;
  }
};

export const createPublication = async (data: any, images: string[]) => {
  try {
    const payload = { publicationData: data };
    const formData = createFormData(payload, images);
    const response = await apiClient.post('/publications', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error en createPublication:", error);
    throw error;
  }
};

/**
 * Obtiene todas las publicaciones (VERSIÓN DEFINITIVA)
 */
export const getAllPublications = async (): Promise<ApiPublication[]> => {
  try {
    const response = await apiClient.get<any>('/publications');

    console.log("📦 Check Estructura:", Object.keys(response.data || {}));

    // --- CORRECCIÓN BASADA EN TU LOG ---
    // Estructura detectada: { success: true, data: { publications: [...] } }
    if (response.data && Array.isArray(response.data.publications)) {
       console.log("✅ Array encontrado en: response.data.publications");
       return response.data.publications;
    }

    // Fallbacks (por si acaso cambia)
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.data)) return response.data.data;
    if (Array.isArray(response)) return response;

    console.warn("⚠️ No se encontró el array 'publications'. Estructura recibida:", response.data);
    return []; 

  } catch (error) {
    console.error("❌ Error al obtener publicaciones:", error);
    throw new Error("No se pudieron cargar las publicaciones.");
  }
};

/**
 * Obtiene una publicación específica por su ID.
 * (Usamos el método de filtrar la lista completa para asegurar que funcione en tu demo)
 */
export const getPublicationById = async (id: string): Promise<ApiPublication | null> => {
  try {
    const allPubs = await getAllPublications();
    const found = allPubs.find(p => p.id === id);
    return found || null;
  } catch (error) {
    console.error("❌ Error al buscar publicación por ID:", error);
    return null;
  }
};
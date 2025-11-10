// publi.services.ts (LA VERSIÓN FINAL CON PRUEBA DE LOG)
import { apiClient } from "../API.services";
import { AxiosResponse } from "axios";

// ✅ Crear publicación con imágenes (Trueque / Donación / Venta)
export const createPublication = async (publicationData: any, imagesArray: string[]) => {
  
  // --- PRUEBA DE FUEGO ---
  console.log("--- DENTRO DE createPublication (publi.services.ts) ---");
  console.log("Datos recibidos por el servicio:");
  console.log(JSON.stringify(publicationData, null, 2));
  // --- FIN DE PRUEBA ---
  
  try {
    const formData = new FormData();

    // --- Agregar JSON de la publicación ---
    formData.append("publicationData", JSON.stringify(publicationData));

    // --- Agregar imágenes ---
    imagesArray.forEach((uri, index) => {
      formData.append("images", {
        uri,
        type: "image/jpeg",
        name: `image_${index}.jpg`,
      } as any);
    });

    const response: AxiosResponse<any> = await apiClient.post("/publications", formData);
    return response.data;
  } catch (error: any) {
    console.log("❌ Error en createPublication:", error);
    throw error;
  }
};

// ✅ Crear donación
export const createDonation = async (donationData: any, imagesUri: string[]) => {
  return createPublication({ ...donationData, type: "donation_offer" }, imagesUri);
};

//
// --- EL RESTO DE FUNCIONES NO CAMBIAN ---
//

// ✅ Actualizar publicación
export const updatePublication = async (
  publicationId: string,
  updatedData: any,
  imagesUri: string[] = []
) => {
  try {
    const formData = new FormData();
    formData.append("publicationData", JSON.stringify(updatedData));

    imagesUri.forEach((uri, index) => {
      formData.append("images", {
        uri,
        name: `updated_${index}.jpg`,
        type: "image/jpeg",
      } as any);
    });

    return await apiClient.put(`/publications/update/${publicationId}`, formData);
  } catch (error: any) {
    console.log("❌ Error actualizando publicación:", error);
    throw error;
  }
};

// ✅ Obtener publicaciones
export const getPublications = async (filters?: { type?: string; category?: string; limit?: number }) => {
  try {
    return await apiClient.get("/publications", filters ? { params: filters } : undefined);
  } catch (error: any) {
    console.error("❌ Error obteniendo publicaciones:", error);
    throw error;
  }
};

// ✅ Publicaciones cercanas
export const getNearbyPublications = async ({
  latitude,
  longitude,
  radius,
  type,
}: {
  latitude: number;
  longitude: number;
  radius: number;
  type?: string;
}) => {
  try {
    const params: any = { latitude, longitude, radius };
    if (type) params.type = type;
    return await apiClient.get("/publications/nearby", { params });
  } catch (error: any) {
    console.error("❌ Error obteniendo publicaciones cercanas:", error);
    throw error;
  }
};

// ✅ Mis publicaciones
export const getMyPublications = async () => {
  try {
    return await apiClient.get("/publications/user/me");
  } catch (error: any) {
    console.log("❌ Error obteniendo mis publicaciones:", error);
    throw error;
  }
};

// ✅ Publicaciones de un usuario específico
export const getUserPublications = async (userId: string) => {
  try {
    return await apiClient.get(`/publications/user/${userId}`);
  } catch (error: any) {
    console.log("❌ Error obteniendo publicaciones del usuario:", error);
    throw error;
  }
};
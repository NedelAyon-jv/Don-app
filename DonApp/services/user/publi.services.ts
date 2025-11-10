import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "../API.services";
import { AxiosResponse } from "axios";

export interface PublicationData {
  title: string;
  description: string;
  type: string;
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
  tags: string[];
}

// ✅ Crear publicación con imágenes
export const createPublication = async (
  publicationData: PublicationData,
  imagesUri: string[]
) => {
  try {
    const formData = new FormData();
    formData.append("publicationData", JSON.stringify(publicationData));

    imagesUri.forEach((uri, index) => {
      formData.append("images", {
        uri,
        name: `img_${index}.jpg`,
        type: "image/jpeg",
      } as any);
    });

    return await apiClient.post("/publications/", formData);
  } catch (error) {
    console.log("❌ Error creando publicación:", error);
    throw error;
  }
};

// ✅ Crear donación
export const createDonation = async (donationData: any, imagesUri: string[]) => {
  try {
    const formData = new FormData();

    formData.append(
      "publicationData",
      JSON.stringify({
        ...donationData,
        type: "donation_request",
      })
    );

    imagesUri.forEach((uri, index) => {
      formData.append("images", {
        uri,
        name: `donation_${index}.jpg`,
        type: "image/jpeg",
      } as any);
    });

    return await apiClient.post("/publications/", formData);
  } catch (error) {
    console.log("❌ Error creando donación:", error);
    throw error;
  }
};

// ✅ Update publication
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
  } catch (error) {
    console.log("❌ Error actualizando publicación:", error);
    throw error;
  }
};

// ✅ Get publicaciones
export const getPublications = async (filters?: {
  type?: string;
  category?: string;
  limit?: number;
}) => {
  try {
    return await apiClient.get("/publications", filters ? { params: filters } : undefined);
  } catch (error) {
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
  } catch (error) {
    console.error("❌ Error obteniendo publicaciones cercanas:", error);
    throw error;
  }
};

// ✅ Mis publicaciones
export const getMyPublications = async () => {
  try {
    return await apiClient.get("/publications/user/me");
  } catch (error) {
    console.log("❌ Error obteniendo mis publicaciones:", error);
    throw error;
  }
};

// ✅ Publicaciones de un usuario específico
export const getUserPublications = async (userId: string) => {
  try {
    return await apiClient.get(`/publications/user/${userId}`);
  } catch (error) {
    console.log("❌ Error obteniendo publicaciones del usuario:", error);
    throw error;
  }
};

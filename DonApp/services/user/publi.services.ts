import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "../API.services";

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

export const createPublication = async (
  publicationData: PublicationData,
  imagesUri: string[]
) => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) throw new Error("No hay token guardado");

    const formData = new FormData();
    formData.append("publicationData", JSON.stringify(publicationData));

    // Adjuntar imágenes
    imagesUri.forEach((uri, index) => {
      formData.append("images", {
        uri,
        name: `image_${index}.jpg`,
        type: "image/jpeg",
      } as any);
    });

    const response: any = await apiClient.post("/publications/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("✅ Publicación creada correctamente:", response);
    return response;

  } catch (error) {
    console.error("❌ Error al crear la publicación:", error);
    throw error;
  }
};
    
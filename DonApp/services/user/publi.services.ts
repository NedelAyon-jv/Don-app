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
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) throw new Error("No hay token guardado");

    const formData = new FormData();
    formData.append("publicationData", JSON.stringify(publicationData));

    imagesUri.forEach((uri, index) => {
      formData.append("images", {
        uri,
        name: `img_${index}.jpg`,
        type: "image/jpeg",
      } as any);
    });

    // ✅ ya no mandamos headers aquí
    const response = await apiClient.post("/publications/", formData);

    return response; // ya es response.data

  } catch (error) {
    console.error("❌ Error al crear publicación:", error);
    throw error;
  }
};
export const createDonation = async (
  donationData: {
    title: string;
    description: string;
    category: string;
    priority: string;
    targetQuantity: number;
    deadline: string;
    acceptedItems: string[];
    restrictions: string;
    location: {
      latitude: number;
      longitude: number;
      address: string;
    };
    tags: string[];
  },
  imagesUri: string[]
) => {
  try {
    const formData = new FormData();

    // ✅ el backend lo pide dentro de publicationData y con type: donation_request
    formData.append(
      "publicationData",
      JSON.stringify({
        ...donationData,
        type: "donation_request",
      })
    );

    // ✅ agregar imágenes a "images"
    imagesUri.forEach((uri, index) => {
      formData.append("images", {
        uri,
        name: `donation_${index}.jpg`,
        type: "image/jpeg",
      } as any);
    });
    const response = await apiClient.post("/publications/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }) as AxiosResponse;

    return response.data;
  } catch (error) {
    console.log("❌ Error creando donación:", error);
    throw error;
  }
};


//Update publication

export const updatePublication = async (
  publicationId: string,
  updatedData: any,
  imagesUri: string[] = []
) => {
  try {
    const formData = new FormData();

    // ✅ publicationData obligatorio
    formData.append("publicationData", JSON.stringify(updatedData));

    // ✅ si mandas imágenes nuevas
    imagesUri.forEach((uri, index) => {
      formData.append("images", {
        uri,
        name: `updated_${index}.jpg`,
        type: "image/jpeg",
      } as any);
    });

    const response = await apiClient.put(
      `/publications/update/${publicationId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    ) as AxiosResponse;

    return response.data;
  } catch (error) {
    console.log("❌ Error actualizando publicación:", error);
    throw error;
  }
};




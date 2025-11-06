import AsyncStorage from "@react-native-async-storage/async-storage";
import FormData from "form-data";
import { apiClient } from "../API.services";

export interface PublicationLocation {
  latitude: number;
  longitude: number;
  address: string;
}

export interface PublicationData {
  title: string;
  description: string;
  type: "donation_offer" | "donation_request";
  category: string;
  condition?: string;
  quantity?: number;
  availability?: string;
  pickupRequirements?: string;
  location: PublicationLocation;
  tags?: string[];
}

export const createPublication = async (
  publicationData: PublicationData,
  imageUris: string[]
) => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) throw new Error("No hay token guardado");

    const formData = new FormData();

    // ✅ Mandamos el objeto convertido a string
    formData.append("publicationData", JSON.stringify(publicationData));

    // ✅ Agregar imágenes
    imageUris.forEach((uri: string) => {
      formData.append("images", {
        uri,
        type: "image/jpeg", // o image/png, depende de la extensión
        name: uri.split("/").pop() || "image.jpg",
      } as any);
    });



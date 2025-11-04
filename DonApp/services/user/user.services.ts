import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "../API.services";

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  fullname: string;
  phone: string;
}

export const registerUser = async (data: RegisterData) => {
  try {
    const response: any = await apiClient.post("/auth/register", data);

    const token = response?.data?.token?.accessToken;
    if (token) {
      await AsyncStorage.setItem("accessToken", token);
      console.log("🔑 Token guardado en AsyncStorage");
    }

    console.log("✅ Usuario registrado:", response.data.user);
    return response.data;
  } catch (error) {
    console.error("❌ Error al registrar usuario:", error);
    throw error;
  }
};

// ADMIN
export interface AdminRegisterData {
  email: string;
  password: string;
  username: string;
  fullname: string;
  phone: string;
}

export const registerAdmin = async (data: AdminRegisterData) => {
  try {
    const response: any = await apiClient.post("/auth/register/admin", data);

    // Guardar token en AsyncStorage si se devuelve uno
    const token = response?.data?.token?.accessToken;
    if (token) {
      await AsyncStorage.setItem("accessToken", token);
      console.log("🔑 Token de admin guardado en AsyncStorage");
    }

    console.log("✅ Admin registrado:", response.data.user);
    return response.data;
  } catch (error) {
    console.error("❌ Error al registrar admin:", error);
    throw error;
  }
};

//get current user


export interface AuthMeData {
  email: string;
  password: string;
  username: string;
  fullname: string;
  phone: string;
}

/**
 * POST /auth/me
 * Envía los datos del usuario y requiere token Bearer
 */
export const authMe = async (data: AuthMeData) => {
  try {
    const response = await apiClient.post("/auth/me", data);
    console.log("✅ Respuesta de /auth/me:", response);
    return response;
  } catch (error) {
    console.error("❌ Error en /auth/me:", error);
    throw error;
  }
};


await AsyncStorage.setItem(
  "accessToken",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJpT09qd1BPdzF1dmRRbkRwUDBSUCIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzYxOTU5MzUwLCJleHAiOjE3NjE5NjAyNTAsImp0aSI6ImY2OTJiNGEwNTg0MDQwODQ4NzQ4MWQ5ODNlNDFhY2Q0IiwiYXVkIjoiZG9uLWFwcC11c2VycyIsImlzcyI6ImRvbi1hcHAifQ.Gp7llNrSPm-gQWYn7x3gGYtvv77-E8cGcylfOo0Jvjk"
);

export const verifyEmail = async (userId: string) => {
  try {
    const response = await apiClient.post("/auth/verify-email", { userId });
    console.log("✅ Correo verificado:", response);
    return response;
  } catch (error) {
    console.error("❌ Error al verificar correo:", error);
    throw error;
  }
};

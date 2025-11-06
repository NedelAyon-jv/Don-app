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
    // `apiClient.post` ya devuelve `response.data`, así que `response` es el body
    const token = response?.token?.accessToken;
    if (token) {
      await AsyncStorage.setItem("accessToken", token);
      console.log("🔑 Token guardado en AsyncStorage");
    }

    console.log("✅ Usuario registrado:", response.user);
    return response;
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
    const token = response?.token?.accessToken;
    if (token) {
      await AsyncStorage.setItem("accessToken", token);
      console.log("🔑 Token de admin guardado en AsyncStorage");
    }

    console.log("✅ Admin registrado:", response.user);
    return response;
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
    const response: any = await apiClient.post("/auth/me", data);
    console.log("✅ Respuesta de /auth/me:", response);
    return response;
  } catch (error) {
    console.error("❌ Error en /auth/me:", error);
    throw error;
  }
};


export const verifyEmail = async (userId: string) => {
  try {
    const response: any = await apiClient.post("/auth/verify-email", { userId });
    console.log("✅ Correo verificado:", response);
    return response;
  } catch (error) {
    console.error("❌ Error al verificar correo:", error);
    throw error;
  }
};

//Ge current user profile 
export const getUserProfile = async () => {
  try {
    const response: any = await apiClient.get("/users/profile");
    console.log("✅ Perfil obtenido:", response);
    return response;
  } catch (error) {
    console.error("❌ Error al obtener perfil:", error);
    throw error;
  }
};

//Get user by id
export const getUserById = async (userId: string) => {
  try {
    const response: any = await apiClient.get(`/users/${userId}`);
    console.log("✅ Usuario obtenido por ID:", response);
    return response;
  } catch (error) {
    console.error("❌ Error al obtener usuario por ID:", error);
    throw error;
  }
};


//user by id Copy
export const getUserByIdCopy = async (userId: string) => {
  try {
    const response: any = await apiClient.get(`/users/${userId}`); // Cambio aquí
    console.log("✅ Usuario obtenido por ID:", response);
    return response;
  } catch (error) {
    console.error("❌ Error al obtener usuario por ID:", error);
    throw error;
  }
};

//PUT update user profile
export const updateUserProfile = async (data: Partial<AuthMeData>) => {
  try {
    const response: any = await apiClient.put("/users/profile", data); // Cambio aquí para actualizar el perfil
    console.log("✅ Perfil actualizado:", response);
    return response;
  } catch (error) {
    console.error("❌ Error al actualizar perfil:", error);
    throw error;
  }
};  

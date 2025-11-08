import { apiClient } from "../API.services";

// Interfaz para los datos del perfil (puedes moverla a 'interfaces.ts' si quieres)
export interface UserProfileData {
  email?: string;
  username?: string;
  fullname?: string;
  phone?: string;
  // Agrega cualquier otro campo que se pueda actualizar
}

/**
 * (MOVIDO AQUÍ) Obtiene el perfil del usuario autenticado
 * Requiere que el 'apiClient' envíe el token automáticamente
 */
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

/**
 * (MOVIDO AQUÍ) Obtiene un usuario por su ID
 */
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

/**
 * (MOVIDO AQUÍ) Actualiza el perfil del usuario autenticado
 */
export const updateUserProfile = async (data: Partial<UserProfileData>) => {
  try {
    const response: any = await apiClient.put("/users/profile", data);
    console.log("✅ Perfil actualizado:", response);
    return response;
  } catch (error) {
    console.error("❌ Error al actualizar perfil:", error);
    throw error;
  }
};

/**
 * (MOVIDO AQUÍ) POST /auth/me - Verifica la sesión con el token
 * (Tu archivo 'user.services.ts' original tenía esto)
 */
export const authMe = async () => {
  try {
    // Generalmente /auth/me es un GET, pero sigo tu implementación
    // Si es un POST sin body, envía un objeto vacío
    const response: any = await apiClient.post("/auth/me", {}); 
    console.log("✅ Respuesta de /auth/me:", response);
    return response;
  } catch (error) {
    console.error("❌ Error en /auth/me:", error);
    throw error;
  }
};
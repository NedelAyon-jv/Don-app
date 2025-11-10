import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "../API.services"; // Asumo que API.services está un nivel arriba

// ==============================================
// ==== INTERFACES DE AUTENTICACIÓN ====
// ==============================================

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  fullname: string;
  phone: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// ==============================================
// ==== FUNCIONES DE SESIÓN (TOKEN Y USUARIO) ====
// ==============================================

/**
 * Guarda el token y el usuario en AsyncStorage
 */
export const saveSession = async (accessToken: string, refreshToken: string, user: any) => {
  try {
    await AsyncStorage.setItem("accessToken", accessToken);
    await AsyncStorage.setItem("refreshToken", refreshToken); // <-- AÑADE ESTA LÍNEA
    await AsyncStorage.setItem("user", JSON.stringify(user));
    console.log("🔑✅ Sesión guardada (accessToken, refreshToken y usuario)");
  } catch (error) {
    console.error("❌ Error al guardar la sesión:", error);
  }
};

/**
 * Obtiene el token guardado
 */
export const gettoken = async () => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    return token;
  } catch (error) {
    console.error("❌ Error al obtener el token:", error);
    return null;
  }
};

/**
 * Obtiene el usuario guardado
 */
export const getCurrentUser = async () => {
  try {
    const userString = await AsyncStorage.getItem("user");
    return userString ? JSON.parse(userString) : null;
  } catch (error) {
    console.error("❌ Error al obtener el usuario:", error);
    return null;
  }
};

/**
 * Limpia la sesión (token y usuario)
 */
export const logout = async () => {
  try {
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken"); // <-- AÑADE ESTA LÍNEA
    await AsyncStorage.removeItem("user");
    console.log("🚪 Sesión cerrada (tokens y usuario eliminados)");
  } catch (error) {
    console.error("❌ Error al cerrar sesión:", error);
    throw error;
  }
};

// ==============================================
// ==== FUNCIONES DE AUTENTICACIÓN (API) ====
// ==============================================

/**
 * (MEJORADO) Inicia sesión y guarda la sesión si tiene éxito
 */
// ==============================================
// ==== FUNCIONES DE AUTENTICACIÓN (API) ====
// ==============================================

/**
 * (MEJORADO) Inicia sesión y guarda la sesión si tiene éxito
 */
export const login = async (data: LoginData) => {
  try {
    // Usamos apiClient en lugar de fetch
    const response: any = await apiClient.post("/auth/login", data);

    // 'response' es el objeto COMPLETO que vimos en el log
    console.log("✅ Login exitoso (Respuesta API completa):", response);

    // ==============================================
    // ==== ¡ESTA ES LA CORRECCIÓN! ====
    // Accedemos a la data anidada que viste en el log
    // ==============================================
    const accessToken = response?.data?.token?.accessToken;
    const refreshToken = response?.data?.token?.refreshToken;
    const user = response?.data?.user;

    if (accessToken && user && refreshToken) {
      // Guardamos la sesión completa
      await saveSession(accessToken, refreshToken, user);
    } else {
      // Si esto vuelve a salir, es que la API cambió su respuesta
      console.warn("⚠️ Login exitoso pero no se encontró accessToken, refreshToken o usuario en la respuesta anidada");
    }

    // ==============================================
    // ¡IMPORTANTE! Devolvemos 'response.data'
    // para que el 'index.tsx' pueda usar 'res.token' y 'res.user'
    // ==============================================
    return response.data; 

  } catch (error) {
    console.error("❌ Error en login:", error);
    throw error;
  }
};

/**
 * (MOVIDO AQUÍ) Registra un nuevo usuario
 */
// ... (el resto de tu archivo auth.services.ts) ...

/**
 * (MOVIDO AQUÍ Y CORREGIDO) Registra un nuevo usuario
 */
export const registerUser = async (data: RegisterData) => {
  try {
    const response: any = await apiClient.post("/auth/register", data);

    // ==============================================
    // ==== ¡CORRECCIÓN! ====
    // Leemos la misma estructura que en el login
    // ==============================================
    const accessToken = response?.data?.token?.accessToken;
    const refreshToken = response?.data?.token?.refreshToken;
    const user = response?.data?.user;

    if (accessToken && refreshToken && user) {
      // Guardamos la sesión automáticamente al registrarse
      // Ahora con los 3 argumentos correctos
      await saveSession(accessToken, refreshToken, user);
    } else {
      console.warn("⚠️ Registro exitoso pero no se encontró accessToken, refreshToken o usuario en la respuesta");
    }
    // ==============================================

    console.log("✅ Usuario registrado:", response.data?.user || response);
    
    // Devolvemos .data, igual que en el login
    return response.data; 
  } catch (error) {
    console.error("❌ Error al registrar usuario:", error);
    console.log((error as Error).message);
    throw error;
  }
};

/**
 * (MOVIDO AQUÍ Y CORREGIDO) Registra un nuevo admin
 */
export const registerAdmin = async (data: RegisterData) => {
  try {
    const response: any = await apiClient.post("/auth/register/admin", data);

    // ==============================================
    // ==== ¡CORRECCIÓN! ====
    // Leemos la misma estructura que en el login
    // ==============================================
    const accessToken = response?.data?.token?.accessToken;
    const refreshToken = response?.data?.token?.refreshToken;
    const user = response?.data?.user;

    if (accessToken && refreshToken && user) {
      // Guardamos la sesión automáticamente al registrarse
      // Ahora con los 3 argumentos correctos
      await saveSession(accessToken, refreshToken, user);
      console.log("🔑 Token de admin guardado en AsyncStorage");
    } else {
       console.warn("⚠️ Registro de admin exitoso pero no se encontró accessToken, refreshToken o usuario");
    }
    // ==============================================

    console.log("✅ Admin registrado:", response.data?.user || response);
    
    // Devolvemos .data, igual que en el login
    return response.data;
  } catch (error) {
    console.error("❌ Error al registrar admin:", error);
    throw error;
  }
};

// ... (el resto de tus funciones: refreshToken, changePassword, etc.) ...

/**
 * (Se mantiene) Refresca el token
 */
export const refreshToken = async () => {
  try {
    // NOTA: Deberías considerar guardar también el 'refreshToken' durante el login
    const refreshToken = await AsyncStorage.getItem("refreshToken"); 

    if (!refreshToken) {
      throw new Error("No hay refresh token guardado");
    }

    const response: any = await apiClient.post("/auth/refresh-token", {
      refreshToken,
    });

    console.log("✅ Nuevo token generado:", response);

    const newAccessToken = response?.accessToken; // Ajusta según tu API
    if (newAccessToken) {
      await AsyncStorage.setItem("accessToken", newAccessToken);
    }
    
    // Si tu API devuelve un nuevo refresh token, guárdalo también
    const newRefreshToken = response?.refreshToken;
    if (newRefreshToken) {
      await AsyncStorage.setItem("refreshToken", newRefreshToken);
    }

    return response;
  } catch (error) {
    console.error("❌ Error al refrescar token:", error);
    throw error;
  }
};

/**
 * (Se mantiene) Cambia la contraseña
 */
export const changePassword = async (data: ChangePasswordData) => {
  try {
    const response: any = await apiClient.post("/auth/change-password", data);
    console.log("✅ Contraseña cambiada:", response);
    return response;
  } catch (error) {
    console.error("❌ Error al cambiar la contraseña:", error);
    throw error;
  }
};

/**
 * (MOVIDO AQUÍ) Verifica el email
 */
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
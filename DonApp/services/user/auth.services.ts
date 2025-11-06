import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "../API.services";

export interface LoginData {
  email: string;
  password: string;
}
//Login
export const login = async (data: LoginData) => {
  try {
    const response: any = await apiClient.post("/auth/login", {
      email: data.email,
      password: data.password,
    });

    console.log("✅ Login exitoso:", response);

    const maybeToken =
      response?.access_token || response?.accessToken || response?.token || response?.token?.accessToken || response?.token?.access_token;

    let tokenToStore: string | undefined;
    if (typeof maybeToken === "string") {
      tokenToStore = maybeToken;
    } else if (maybeToken && typeof maybeToken === "object") {
      tokenToStore = maybeToken.accessToken || maybeToken.access_token;
    }

    if (tokenToStore) {
      await AsyncStorage.setItem("accessToken", tokenToStore);
      console.log("🔑 Token guardado en AsyncStorage");
    }

    return response;
  } catch (error) {
    console.error("❌ Error en login:", error);
    throw error;
  }
};

//Refresh token
export const refreshToken = async () => {
   try {
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    if (!refreshToken) {
      throw new Error("No hay refresh token guardado");
    }

    const response: any = await apiClient.post("/auth/refresh-token", {
      refreshToken, // cuerpo del POST
    });

    console.log("✅ Nuevo token generado:", response);

    // Guardar tokens nuevos (manejar varias formas de respuesta)
    const accessFromRoot = response?.access_token || response?.accessToken;
    const refreshFromRoot = response?.refresh_token || response?.refreshToken;

    if (accessFromRoot) {
      await AsyncStorage.setItem("accessToken", accessFromRoot);
    } else if (response?.token) {
      const tokenObj = response.token as any;
      const maybeAccess = tokenObj?.accessToken || tokenObj?.access_token;
      if (maybeAccess) await AsyncStorage.setItem("accessToken", maybeAccess);
    }

    if (refreshFromRoot) {
      await AsyncStorage.setItem("refreshToken", refreshFromRoot);
    } else if (response?.token) {
      const tokenObj = response.token as any;
      const maybeRefresh = tokenObj?.refreshToken || tokenObj?.refresh_token;
      if (maybeRefresh) await AsyncStorage.setItem("refreshToken", maybeRefresh);
    }

    return response;
  } catch (error) {
    console.error("❌ Error al refrescar token:", error);
    throw error;
  }
};

// Logout
export const logout = async () => {
  try {
    await AsyncStorage.removeItem("accessToken");
    console.log("🚪 Sesión cerrada");
  } catch (error) {
    console.error("❌ Error al cerrar sesión:", error);
    throw error;
  }
};   

// change password
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const changePassword = async (data: ChangePasswordData) => {
  try {
    const accessToken = await AsyncStorage.getItem("accessToken");

    if (!accessToken) {
      throw new Error("No hay token de sesión guardado");
    }

    const response: any = await apiClient.post("/auth/change-password", data);

    console.log("✅ Contraseña cambiada:", response.data);
    return response.data;

  } catch (error) {
    console.error("❌ Error al cambiar la contraseña:", error);
    throw error;
  }
};

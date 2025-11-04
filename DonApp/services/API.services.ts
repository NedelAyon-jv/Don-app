import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: "https://don-app.onrender.com/api",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Interceptor de solicitud
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem("accessToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        console.log(
          `🚀 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
        );
        return config;
      },
      (error: AxiosError) => {
        console.error("❌ Error en la solicitud:", error.message);
        return Promise.reject(error);
      }
    );

    // Interceptor de respuesta
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`✅ Respuesta OK [${response.status}]`, response.config.url);
        return response;
      },
      (error: AxiosError) => {
        if (error.response) {
          console.error(
            `⚠️ Error [${error.response.status}]:`,
            error.response.data || error.message
          );
        } else {
          console.error("🚨 Error de red o servidor:", error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }
}

export const apiClient = new APIClient();

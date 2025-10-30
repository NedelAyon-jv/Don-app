import { useCallback, useState } from "react";
import * as SecureStore from "expo-secure-store";

export const useGetUserToken = () => {
    const [state, setState] = useState<{
        token: string | null;
        isLoading: boolean;
        error: string | null;
        isSuccess: boolean;
    }>({
        token: null,
        isLoading: false,
        error: null,
        isSuccess: false,
    });

    const reset = useCallback(() => {
        setState({
            token: null,
            isLoading: false,
            error: null,
            isSuccess: false,
        });
    }, []);

    // ✅ checkToken AHORA es async y lee el JWT desde SecureStore
    const checkToken = useCallback(async () => {
        reset();

        try {
            setState((prev) => ({
                ...prev,
                isLoading: true,
                error: null,
            }));

            const token = await SecureStore.getItemAsync("userToken");

            if (!token) {
                setState({
                    token: null,
                    isLoading: false,
                    error: "No hay token guardado",
                    isSuccess: false,
                });
                return;
            }

            // ✅ Token encontrado: se guarda en el estado
            setState({
                token,
                isLoading: false,
                error: null,
                isSuccess: true,
            });

        } catch (error) {
            setState({
                token: null,
                isLoading: false,
                error: "Error obteniendo el token",
                isSuccess: false,
            });
        }
    }, [reset]);

    return {
        ...state,
        checkToken,
        reset,
    };
};

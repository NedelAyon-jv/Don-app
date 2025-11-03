import { Colors } from '@/constants/theme'; // <-- Importamos nuestro tema
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native'; // <-- Asegúrate de que sea el de react-native
import 'react-native-reanimated';

// Borramos el 'unstable_settings', no lo necesitamos.

export default function RootLayout() {
  // Usamos el hook de react-native, no uno personalizado
  const colorScheme = useColorScheme() ?? 'light'; 
  const theme = Colors[colorScheme];

  return (
    // Quitamos el ThemeProvider, ya que usaremos nuestro tema 'theme'
    // en cada pantalla (como en index.tsx del feed)
    <>
      <Stack
        screenOptions={{
          // Aplicamos el color de fondo de nuestro tema al Stack
          contentStyle: { backgroundColor: theme.background }
        }}
      >
        {/* 1. Corregido: de 'login' a 'index' */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        
        {/* 2. Añadido: la pantalla 'signup' */}
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        
        {/* Esta es tu app principal, está perfecta */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        <Stack.Screen 
          name="articulo" // Coincide con el archivo app/details.tsx
          options={{ 
            headerShown: true,
            title: 'Detalles del Artículo',
          }} 
        />
        
        {/* --- PANTALLA NUEVA AÑADIDA AQUÍ --- */}
        <Stack.Screen 
          name="chat/[id]" // Coincide con app/chat/[id].tsx
          options={{ 
            headerShown: true,
            title: 'Chat', // Este título se cambiará desde la propia pantalla
          }} 
        />
        
        {/* Dejamos tu pantalla modal, está bien */}
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}
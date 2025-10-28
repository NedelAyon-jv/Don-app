import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab'; // Tu componente personalizado (¡se queda!)
import { Colors } from '@/constants/theme'; // Tu importación de colores
import { useColorScheme } from '@/hooks/use-color-scheme'; // Tu hook (¡perfecto!)
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light'; // Detectas 'light' o 'dark'
  const theme = Colors[colorScheme];             // Cargas nuestra paleta (light o dark)

  return (
    <Tabs
      screenOptions={{
        // --- 1. Ajustes de Color (Estos son los cambios) ---
        
        // Color del ícono y texto del tab activo (nuestro verde/teal)
        tabBarActiveTintColor: theme.primary, 
        
        // Color del ícono y texto del tab inactivo (nuestro verde oscuro/beige)
        tabBarInactiveTintColor: theme.text, 

        // Estilo del Header (barra de título)
        headerStyle: {
          backgroundColor: theme.background, // Fondo del header
        },
        // Estilo del texto del Header
        headerTitleStyle: {
          color: theme.text, // Color del texto del título
        },

        // Estilo de la Barra de Tabs (la barra inferior)
        tabBarStyle: {
          backgroundColor: theme.background, // Fondo de la barra
          borderTopColor: theme.border,      // Color del borde superior
        },


        // --- 2. Tus configuraciones (Se quedan igual) ---
        headerShown: true,
        tabBarButton: HapticTab, // Mantenemos tu HapticTab
      }}>
      
      {/* --- Tus Pantallas (No necesitan cambios) --- */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          headerTitle: 'Inicio', // <-- Ajustado para que coincida con la imagen
          tabBarIcon: ({ color }) => <Ionicons size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="centros"
        options={{
          title: 'Centros',
          headerTitle: 'Centros de Donación',
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="location" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="publicar"
        options={{
          title: 'Publicar',
          headerTitle: 'Publicar Artículo', // <-- Añadido para consistencia
          tabBarIcon: ({ color }) => <Ionicons size={28} name="add-circle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          headerTitle: 'Mensajes',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="chatbubbles" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          headerTitle: 'Mi Perfil DonApp',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}
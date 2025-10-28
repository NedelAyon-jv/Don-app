import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="centros" // Este es el archivo app/(tabs)/centros.tsx
        options={{
          title: 'Centros', // Título para el botón del tab
          headerTitle: 'Centros de Donación', // ¡ESTA ES LA LÍNEA QUE BUSCAS!
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="location" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="publicar"
        options={{
          title: 'Publicar',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="add-circle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chats" // Corresponde al nuevo archivo app/(tabs)/chats.tsx
        options={{
          title: 'Chats',
          headerTitle: 'Mensajes',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="chatbubbles" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile" // Corresponde al archivo app/(tabs)/profile.tsx
        options={{
          title: 'Perfil',
          headerTitle: 'Mi Perfil DonApp', // Título en la parte de arriba
          tabBarIcon: ({ color }) => <Ionicons size={28} name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}

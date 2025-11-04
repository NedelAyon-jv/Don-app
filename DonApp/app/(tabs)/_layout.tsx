import { Tabs } from 'expo-router';
import React from 'react';
// --- 1. IMPORTAMOS COMPONENTES PARA EL HEADER ---
import { Image, Text, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab'; // Tu componente personalizado (¡se queda!)
import { Colors } from '@/constants/theme'; // Tu importación de colores
import { useColorScheme } from '@/hooks/use-color-scheme'; // Tu hook (¡perfecto!)
import { Ionicons } from '@expo/vector-icons';

// --- 2. CREAMOS EL COMPONENTE DE HEADER PERSONALIZADO ---
function CustomHeaderTitle(props: { tintColor?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Image
        // --- ¡OJO! CAMBIA ESTA RUTA POR LA DE TU LOGO ---
        // (Asegúrate de que esta ruta sea correcta)
        source={require('@/assets/images/logo5.png')} 
        style={{ width: 28, height: 28, marginRight: 10 }}
      />
      <Text style={{ 
        fontSize: 22, 
        fontWeight: 'bold', 
        color: props.tintColor // Usa el color del tema pasado por 'tintColor'
      }}>
        DonApp
      </Text>
    </View>
  );
}


export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light'; // Detectas 'light' o 'dark'
  const theme = Colors[colorScheme];           // Cargas nuestra paleta (light o dark)

  return (
    <Tabs
      screenOptions={{
        // --- 1. Ajustes de Color ---
        tabBarActiveTintColor: theme.primary, 
        tabBarInactiveTintColor: theme.text, 

        // Estilo del Header (barra de título)
        headerStyle: {
          backgroundColor: theme.background, // Fondo del header
        },

        // --- 3. AJUSTE IMPORTANTE ---
        // Usamos 'headerTintColor' para pasar el color del texto
        // al 'props.tintColor' de nuestro componente personalizado
        headerTintColor: theme.text, 
        
        // (Tu 'headerTitleStyle' original también funciona, pero 
        // 'headerTintColor' es la prop estándar para esto)
        
        // Estilo de la Barra de Tabs (la barra inferior)
        tabBarStyle: {
          backgroundColor: theme.background, // Fondo de la barra
          borderTopColor: theme.border,      // Color del borde superior
        },
        
        // --- 2. Tus configuraciones (Se quedan igual) ---
        headerShown: true,
        tabBarButton: HapticTab, // Mantenemos tu HapticTab
      }}>
      
      {/* --- 4. PANTALLA "INDEX" MODIFICADA --- */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio', // <-- Esta es la etiqueta de la PESTAÑA (abajo)
          
          // --- ¡AQUÍ ESTÁ EL CAMBIO! ---
          // Usamos 'headerTitle' para poner nuestro componente
          headerTitle: (props) => <CustomHeaderTitle {...props} />, 
          
          tabBarIcon: ({ color }) => <Ionicons size={28} name="home" color={color} />,
        }}
      />
      
      {/* --- Tus Otras Pantallas (Quedan igual) --- */}
      <Tabs.Screen
        name="centros"
        options={{
          title: 'Centros',
          headerTitle: (props) => <CustomHeaderTitle {...props} />, 
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="location" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="publicar"
        options={{
          title: 'Publicar',
          headerTitle: (props) => <CustomHeaderTitle {...props} />,  
          tabBarIcon: ({ color }) => <Ionicons size={28} name="add-circle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          headerTitle: (props) => <CustomHeaderTitle {...props} />, 
          tabBarIcon: ({ color }) => <Ionicons size={28} name="chatbubbles" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          headerTitle: (props) => <CustomHeaderTitle {...props} />, 
          tabBarIcon: ({ color }) => <Ionicons size={28} name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}
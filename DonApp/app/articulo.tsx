import { Colors } from '@/constants/theme';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router'; // <-- Asegúrate que useRouter está importado
import React, { useMemo } from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- SIMULACIÓN DE DATOS (con rating) ---
const MOCK_DATA: { [key: string]: any } = {
  '1': {
    id: '1',
    title: 'Silla de oficina ergonómica',
    type: 'Trueque',
    imageUrl: 'https://placehold.co/600x400/90D1CA/096B68?text=Silla',
    location: 'Colonia Centro',
    description: 'Silla de oficina usada pero en excelente estado. Ruedas y pistón de gas funcionan perfectamente. Ideal para home office. La cambio por un monitor o algo de mi interés.',
    user: {
      name: 'Carlos Adrian',
      avatar: 'https://placehold.co/100x100/FFFBDE/4E342E?text=CA',
      rating: 4.8,
    },
  },
  '3': {
    id: '3',
    title: 'Despensa básica',
    type: 'Donación',
    imageUrl: 'https://placehold.co/600x400/90D1CA/096B68?text=Alimentos',
    location: 'Santa Fe',
    description: 'Paquete de alimentos no perecederos. Incluye arroz, frijoles, atún y pasta. Disponible para quien realmente lo necesite. No es necesario intercambiar.',
    user: {
      name: 'Nedel Enrique',
      avatar: 'https://placehold.co/100x100/FFFBDE/4E342E?text=NE',
      rating: 4.5,
    },
  },
};
// ------------------------------

export default function ItemDetailsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter(); // <-- 1. INICIALIZAR ROUTER

  const { id } = useLocalSearchParams();
  const item = MOCK_DATA[id as string] || MOCK_DATA['1'];

  // --- 2. AQUÍ ESTÁ LA MODIFICACIÓN ---
  const handleStartChat = () => {
    console.log('Iniciando chat para item ID:', item.id);
    // Navega a la pantalla de chat, pasando el 'id' del artículo
    // (que estamos usando como 'id' de chat simulado)
    router.push(`/chat/${item.id}`);
  };
  // ---------------------------------

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ScrollView>
        {/* --- Imagen Principal --- */}
        <Image source={{ uri: item.imageUrl }} style={styles.image} />

        <View style={styles.content}>
          {/* --- Título y Tipo --- */}
          <View style={styles.header}>
            <Text style={styles.title}>{item.title}</Text>
            <View
              style={[
                styles.badge,
                item.type === 'Donación' ? styles.badgeDonation : styles.badgeTrade,
              ]}>
              <Text style={styles.badgeText}>{item.type}</Text>
            </View>
          </View>

          {/* --- Info del Usuario --- */}
          <View style={styles.userSection}>
            <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.user.name}</Text>
              <Text style={styles.userLocation}>
                <Ionicons name="location-sharp" size={14} color={theme.text} /> {item.location}
              </Text>
              <Text style={styles.userRating}>
                <FontAwesome name="star" size={14} color="#FFD700" /> {item.user.rating}
              </Text>
            </View>
          </View>

          {/* --- Descripción --- */}
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </ScrollView>

      {/* --- Botón Flotante de Chat --- */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.chatButton} onPress={handleStartChat}>
          <MaterialCommunityIcons name="chat-processing-outline" size={24} color={theme.card} />
          <Text style={styles.chatButtonText}>Iniciar Chat</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// --- Estilos ---
const createStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    image: {
      width: '100%',
      height: 300,
      backgroundColor: theme.border,
    },
    content: {
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    title: {
      flex: 1,
      fontSize: 26,
      fontWeight: 'bold',
      color: theme.text,
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      marginLeft: 10,
    },
    badgeDonation: { backgroundColor: '#d4edda' },
    badgeTrade: { backgroundColor: '#cce5ff' },
    badgeText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#0056b3',
    },
    // --- Info de Usuario ---
    userSection: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 20,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 12,
      backgroundColor: theme.border,
    },
    userInfo: {
      flex: 1,
      justifyContent: 'center',
    },
    userName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
    },
    userLocation: {
      fontSize: 14,
      color: theme.text,
      opacity: 0.8,
      marginTop: 2,
    },
    userRating: {
      fontSize: 14,
      color: theme.text,
      opacity: 0.9,
      marginTop: 2,
    },
    // ------------------------
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
    },
    description: {
      fontSize: 16,
      color: theme.text,
      opacity: 0.9,
      lineHeight: 24,
    },
    footer: {
      padding: 20,
      backgroundColor: theme.background,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    chatButton: {
      flexDirection: 'row',
      backgroundColor: theme.primary,
      padding: 16,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
    },
    chatButtonText: {
      color: theme.card,
      fontSize: 18,
      fontWeight: 'bold',
      marginLeft: 10,
    },
  });


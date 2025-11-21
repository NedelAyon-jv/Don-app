import { Colors } from '@/constants/theme';
import { ApiPublication, getPublicationById } from '@/services/user/publi.services'; // Importamos el servicio
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ItemDetailsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();

  // 1. Obtener el ID de la URL
  const { id } = useLocalSearchParams();
  
  // 2. Estado para guardar los datos reales
  const [item, setItem] = useState<ApiPublication | null>(null);
  const [loading, setLoading] = useState(true);

  // 3. Cargar datos al entrar a la pantalla
  useEffect(() => {
    const fetchItem = async () => {
      if (!id || typeof id !== 'string') return;
      
      setLoading(true);
      const data = await getPublicationById(id);
      
      if (data) {
        setItem(data);
      } else {
        Alert.alert("Error", "No se encontró la publicación.");
        router.back(); // Regresar si no existe
      }
      setLoading(false);
    };

    fetchItem();
  }, [id]);

  const handleStartChat = () => {
    if (!item) return;
    console.log('Iniciando chat para item ID:', item.id);
    // Aquí rediriges al chat real cuando lo tengas listo
    Alert.alert("Próximamente", "El chat estará disponible en la siguiente versión.");
  };

  // --- Mapeo de Tipos para mostrar bonito ---
  const displayType = (type: string) => {
    return (type === 'donation_offer' || type === 'donation_request') ? 'Donación' : 'Trueque';
  };

  // --- Renderizado de Carga ---
  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.text, marginTop: 10 }}>Cargando detalles...</Text>
      </SafeAreaView>
    );
  }

  // --- Validación si no hay item ---
  if (!item) return null;

  // --- Lógica de Imágenes (Soporte para error de dedo 'iamges') ---
  // Forzamos 'any' para leer 'iamges' si 'images' falla
  const rawItem = item as any;
  const imageList = item.images && item.images.length > 0 ? item.images : (rawItem.iamges || []);
  const mainImage = imageList.length > 0 ? imageList[0] : 'https://placehold.co/600x400/eeeeee/aaaaaa?text=Sin+Imagen';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ScrollView>
        {/* --- Imagen Principal --- */}
        <Image 
          source={{ uri: mainImage }} 
          style={styles.image} 
          resizeMode="cover"
        />

        <View style={styles.content}>
          {/* --- Título y Tipo --- */}
          <View style={styles.header}>
            <Text style={styles.title}>{item.title}</Text>
            <View
              style={[
                styles.badge,
                displayType(item.type) === 'Donación' ? styles.badgeDonation : styles.badgeTrade,
              ]}>
              <Text style={styles.badgeText}>{displayType(item.type)}</Text>
            </View>
          </View>

          {/* --- Info del Usuario (GENÉRICO POR AHORA) --- */}
          {/* Como la API de publicaciones no trae nombre de usuario, ponemos uno genérico para que se vea bien */}
          <View style={styles.userSection}>
            <Image source={{ uri: 'https://placehold.co/100x100/FFFBDE/4E342E?text=User' }} style={styles.avatar} />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>Usuario de DonApp</Text>
              <Text style={styles.userLocation}>
                <Ionicons name="location-sharp" size={14} color={theme.text} /> {item.location?.address || "Ubicación no especificada"}
              </Text>
              <Text style={styles.userRating}>
                <FontAwesome name="star" size={14} color="#FFD700" /> 5.0
              </Text>
            </View>
          </View>

          {/* --- Descripción --- */}
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{item.description}</Text>

          {/* --- Detalles Extra (Condición / Cantidad) --- */}
          <View style={styles.detailsContainer}>
             <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, {color: theme.text}]}>Condición:</Text>
                <Text style={[styles.detailValue, {color: theme.text}]}>{item.condition || 'No especificada'}</Text>
             </View>
             <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, {color: theme.text}]}>Categoría:</Text>
                <Text style={[styles.detailValue, {color: theme.text}]}>{item.category || 'Varios'}</Text>
             </View>
          </View>

        </View>
      </ScrollView>

      {/* --- Botón Flotante de Chat --- */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.chatButton} onPress={handleStartChat}>
          <MaterialCommunityIcons name="chat-processing-outline" size={24} color={theme.card} />
          <Text style={styles.chatButtonText}>Contactar / Chat</Text>
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
      marginRight: 10,
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      marginLeft: 0,
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
    detailsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: theme.border
    },
    detailItem: {
        alignItems: 'flex-start'
    },
    detailLabel: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 4,
        opacity: 0.7
    },
    detailValue: {
        fontSize: 16
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
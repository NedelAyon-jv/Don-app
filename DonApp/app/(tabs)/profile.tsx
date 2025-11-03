import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router'; // <-- 1. IMPORTAR
import React, { useMemo } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter(); // <-- 2. INICIALIZAR

  // Simulación de datos del usuario.
  const user = {
    name: 'Andrey Julian Gutierrez',
    location: 'La Paz, BCS',
    profilePic: 'https://placehold.co/150',
    rating: 4.8,
    totalDonations: 5,
    totalTrades: 3,
  };

  const handleLogout = () => {
    console.log('Cerrando sesión y redirigiendo a /index...');
    
    // --- 3. LA LLAMADA CORRECTA ---
    // Esto le dice al router: "Ve al archivo 'index.tsx' 
    // que está en la raíz (app/index.tsx), NO al 
    // 'index.tsx' que está dentro de '(tabs)'"
    router.replace('../index');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      
      {/* (Todo el JSX de tu perfil: Header, Stats, etc.) */}
      <View style={styles.header}>
        <Image source={{ uri: user.profilePic }} style={styles.profileImage} />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.location}>{user.location}</Text>
      </View>

      <View style={styles.statsContainer}>
        {/* ... (stats) ... */}
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{user.rating} ★</Text>
          <Text style={styles.statLabel}>Calificación</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{user.totalDonations}</Text>
          <Text style={styles.statLabel}>Donaciones</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{user.totalTrades}</Text>
          <Text style={styles.statLabel}>Trueques</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Historial de Intercambios</Text>
        <Text style={styles.placeholderText}>- Donación de "Silla de oficina" (10/Oct/2025)</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuración</Text>
        <TouchableOpacity style={styles.button} onPress={() => { /* ... */ }}>
          <Text style={styles.buttonText}>Editar Datos Personales</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => { /* ... */ }}>
          <Text style={styles.buttonText}>Mis Preferencias de Categorías</Text>
        </TouchableOpacity>
      </View>
      
      {/* Botón de Cerrar Sesión */}
      <View style={styles.logoutButtonContainer}>
        {/* 4. CONECTAR EL onPress */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.buttonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// (Todos tus estilos, sin cambios)
const createStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      backgroundColor: theme.card,
      padding: 24,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      marginBottom: 12,
      backgroundColor: theme.border,
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
    },
    location: {
      fontSize: 16,
      color: theme.text,
      opacity: 0.8,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: theme.card,
      paddingVertical: 20,
      marginTop: 10,
    },
    statBox: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.primary,
    },
    statLabel: {
      fontSize: 14,
      color: theme.text,
      marginTop: 4,
      opacity: 0.8,
    },
    section: {
      backgroundColor: theme.card,
      marginTop: 10,
      padding: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
      color: theme.text,
    },
    placeholderText: {
      fontSize: 15,
      color: theme.text,
      lineHeight: 22,
      opacity: 0.9,
    },
    button: {
      backgroundColor: theme.primary,
      padding: 14,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 10,
    },
    buttonText: {
      color: theme.card, // Asumiendo que el fondo del botón es oscuro
      fontSize: 16,
      fontWeight: 'bold',
    },
    logoutButtonContainer: {
      margin: 20,
    },
    logoutButton: {
      backgroundColor: theme.error, // Color de error para logout
      padding: 14,
      borderRadius: 8,
      alignItems: 'center',
    },
  });


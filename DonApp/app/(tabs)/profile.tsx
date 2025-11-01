import { Colors } from '@/constants/theme'; // <-- 1. Importar Colores
import React, { useMemo } from 'react'; // <-- 2. Importar useMemo
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity, // <-- 3. Usar TouchableOpacity
  View,
  useColorScheme, // <-- 4. Importar useColorScheme
} from 'react-native';

export default function ProfileScreen() {
  // --- 5. Configuración del Tema ---
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const styles = useMemo(() => createStyles(theme), [theme]); // 6. Estilos dinámicos

  // Simulación de datos del usuario.
  const user = {
    name: 'Andrey Julian Gutierrez',
    location: 'La Paz, BCS',
    profilePic: 'https://via.placeholder.com/150',
    rating: 4.8,
    totalDonations: 5,
    totalTrades: 3,
  };

  return (
    // 7. Aplicar color de fondo
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      
      {/* Sección de datos personales */}
      <View style={styles.header}>
        <Image 
          source={{ uri: user.profilePic }} 
          style={styles.profileImage} 
        />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.location}>{user.location}</Text>
      </View>

      {/* Sección de calificación e historial */}
      <View style={styles.statsContainer}>
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

      {/* Historial de intercambios */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Historial de Intercambios</Text>
        <Text style={styles.placeholderText}>- Donación de "Silla de oficina" (10/Oct/2025)</Text>
        <Text style={styles.placeholderText}>- Trueque de "Libros" (05/Oct/2025)</Text>
      </View>

      {/* Opciones de perfil (Botones reemplazados) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuración</Text>
        
        <TouchableOpacity style={styles.button} onPress={() => { /* Navegar a editar perfil */ }}>
          <Text style={styles.buttonText}>Editar Datos Personales</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={() => { /* Navegar a preferencias */ }}>
          <Text style={styles.buttonText}>Mis Preferencias de Categorías</Text>
        </TouchableOpacity>
      </View>
      
      {/* Botón de Cerrar Sesión (Reemplazado) */}
      <View style={styles.logoutButtonContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={() => { /* Lógica de logout */ }}>
          <Text style={styles.buttonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// 8. Estilos dinámicos
const createStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      // backgroundColor: theme.background, // <-- Aplicado arriba
    },
    header: {
      backgroundColor: theme.card, // <-- Color de tema
      padding: 24,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: theme.border, // <-- Color de tema
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      marginBottom: 12,
      backgroundColor: theme.border, // <-- Color de tema
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text, // <-- Color de tema
    },
    location: {
      fontSize: 16,
      color: theme.text, // <-- Color de tema
      opacity: 0.8,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: theme.card, // <-- Color de tema
      paddingVertical: 20,
      marginTop: 10,
    },
    statBox: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.primary, // <-- Color de tema
    },
    statLabel: {
      fontSize: 14,
      color: theme.text, // <-- Color de tema
      marginTop: 4,
      opacity: 0.8,
    },
    section: {
      backgroundColor: theme.card, // <-- Color de tema
      marginTop: 10,
      padding: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
      color: theme.text, // <-- Color de tema
    },
    placeholderText: {
      fontSize: 15,
      color: theme.text, // <-- Color de tema
      lineHeight: 22,
      opacity: 0.9,
    },
    // --- Nuevos estilos para los botones ---
    button: {
      backgroundColor: theme.primary,
      padding: 14,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 10,
    },
    buttonText: {
      color: theme.card, // Texto blanco (o color de tarjeta)
      fontSize: 16,
      fontWeight: 'bold',
    },
    logoutButtonContainer: {
      margin: 20,
    },
    logoutButton: {
      backgroundColor: theme.error, // <-- Color de tema (funcional)
      padding: 14,
      borderRadius: 8,
      alignItems: 'center',
    },
  });

import React from 'react';
import { Button, Image, ScrollView, StyleSheet, Text, View } from 'react-native';

// [cite: 151] "Gestión de Perfiles"
export default function ProfileScreen() {

  // Simulación de datos del usuario.
  // Más adelante, estos datos vendrán de tu API o base de datos.
  const user = {
    name: 'Andrey Julian Gutierrez', // [cite: 11]
    location: 'La Paz, BCS', // [cite: 99]
    profilePic: 'https://via.placeholder.com/150', // Imagen de marcador de posición
    rating: 4.8, // [cite: 154]
    totalDonations: 5,
    totalTrades: 3,
  };

  return (
    <ScrollView style={styles.container}>
      {/* [cite: 152] Sección de datos personales */}
      <View style={styles.header}>
        <Image source={{ uri: user.profilePic }} style={styles.profileImage} />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.location}>{user.location}</Text>
      </View>

      {/* [cite: 154] Sección de calificación e historial */}
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

      {/* [cite: 154] Historial de intercambios */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Historial de Intercambios</Text>
        {/* Aquí puedes mapear una lista de transacciones pasadas */}
        <Text style={styles.placeholderText}>- Donación de "Silla de oficina" (10/Oct/2025)</Text>
        <Text style={styles.placeholderText}>- Trueque de "Libros" (05/Oct/2025)</Text>
      </View>

      {/* [cite: 153] Opciones de perfil */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuración</Text>
        <Button title="Editar Datos Personales" onPress={() => { /* Navegar a editar perfil */ }} />
        <View style={{ marginVertical: 5 }} />
        <Button title="Mis Preferencias de Categorías" onPress={() => { /* Navegar a preferencias */ }} />
      </View>
      
      <View style={styles.logoutButton}>
        <Button title="Cerrar Sesión" color="#e74c3c" onPress={() => { /* Lógica de logout */ }} />
      </View>
    </ScrollView>
  );
}

// Estilos para la pantalla de perfil
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f8',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  location: {
    fontSize: 16,
    color: 'gray',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 20,
    marginTop: 10,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
  },
  statLabel: {
    fontSize: 14,
    color: 'gray',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  logoutButton: {
    margin: 20,
  },
});
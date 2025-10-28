import { FontAwesome, Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- 1. Datos Estáticos (Maqueta del Feed) ---
const mockFeedData = [
  {
    id: '1',
    title: 'Silla de oficina ergonómica',
    type: 'Trueque',
    imageUrl: 'https://via.placeholder.com/300x300.png?text=Silla',
    location: 'Colonia Centro',
  },
  {
    id: '2',
    title: 'Monitor 24" Full HD',
    type: 'Donación',
    imageUrl: 'https://via.placeholder.com/300x300.png?text=Monitor',
    location: 'Camino Real',
  },
  {
    id: '3',
    title: 'Set de libros de programación',
    type: 'Donación',
    imageUrl: 'https://via.placeholder.com/300x300.png?text=Libros',
    location: 'Santa Fe',
  },
  {
    id: '4',
    title: 'Bicicleta de montaña R26',
    type: 'Trueque',
    imageUrl: 'https://via.placeholder.com/300x300.png?text=Bici',
    location: 'Indeco',
  },
  {
    id: '5',
    title: 'Teclado mecánico',
    type: 'Trueque',
    imageUrl: 'https://via.placeholder.com/300x300.png?text=Teclado',
    location: 'Centro',
  },
  {
    id: '6',
    title: 'Lámpara de escritorio',
    type: 'Donación',
    imageUrl: 'https://via.placeholder.com/300x300.png?text=Lampara',
    location: 'Camino Real',
  },
];

// --- 2. Interface de TypeScript para el Artículo ---
interface ArticleProps {
  title: string;
  type: 'Donación' | 'Trueque';
  imageUrl: string;
  location: string;
}

// Calculamos el ancho de la tarjeta
const { width } = Dimensions.get('window');
const cardWidth = (width - 24) / 2 - 8; // (Ancho total - padding) / 2 columnas - gap

// --- 3. Componente para la Tarjeta de Artículo ---
const ArticleCard: React.FC<ArticleProps> = ({ title, type, imageUrl, location }) => {
  const isDonation = type === 'Donación';
  return (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: imageUrl }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>{title}</Text>
        <Text style={styles.cardLocation}>
          <Ionicons name="location-sharp" size={14} color="#555" /> {location}
        </Text>
      </View>
      <View style={[styles.badge, isDonation ? styles.badgeDonation : styles.badgeTrade]}>
        <Text style={styles.badgeText}>{type}</Text>
      </View>
    </TouchableOpacity>
  );
};

// --- 4. Componente Principal (Pantalla de Inicio) ---
export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* --- Barra de Búsqueda (Maqueta) --- */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <FontAwesome name="search" size={18} color="gray" style={styles.searchIcon} />
          <TextInput
            placeholder="Buscar artículos..."
            style={styles.searchInput}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* --- Feed de Artículos --- */}
      <FlatList
        data={mockFeedData}
        renderItem={({ item }) => <ArticleCard {...item} />}
        keyExtractor={(item) => item.id}
        numColumns={2} // La clave para el grid
        columnWrapperStyle={styles.row} // Estilo para el contenedor de la fila
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <Text style={styles.feedTitle}>Artículos Recientes</Text>
        }
      />
    </SafeAreaView>
  );
}

// --- 5. Estilos ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // --- Header y Búsqueda ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f8',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 15,
  },
  filterButton: {
    marginLeft: 10,
    padding: 8,
  },
  // --- Título del Feed ---
  feedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 12,
    paddingHorizontal: 12, // Alineado con el contenedor
  },
  // --- Grid / Lista ---
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  // --- Tarjeta de Artículo ---
  card: {
    width: cardWidth,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#e0e0e0',
  },
  cardContent: {
    padding: 10,
    height: 80, // Altura fija para alinear tarjetas
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  cardLocation: {
    fontSize: 13,
    color: '#555',
    marginTop: 6,
  },
  // --- Badges (Etiquetas de tipo) ---
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeDonation: {
    backgroundColor: '#d4edda', // Verde (Donación)
  },
  badgeTrade: {
    backgroundColor: '#cce5ff', // Azul (Trueque)
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0056b3', // Azul oscuro (para Trueque)
  },
});
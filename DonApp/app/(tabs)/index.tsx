import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react'; // Importar useState
import {
  Dimensions,
  FlatList,
  Image,
  Modal, // Importar Modal
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- 1. Datos Estáticos (Maqueta) ---
// (Mismos datos de antes)
const mockFeedData = [
  { id: '1', title: 'Silla de oficina', type: 'Trueque', imageUrl: 'https...Silla', location: 'Centro', category: 'Muebles' },
  { id: '2', title: 'Monitor 24"', type: 'Donación', imageUrl: 'https...Monitor', location: 'Camino Real', category: 'Electrónica' },
  { id: '3', title: 'Despensa básica', type: 'Donación', imageUrl: 'https...Alimentos', location: 'Santa Fe', category: 'Alimentos' },
  { id: '4', title: 'Bicicleta R26', type: 'Trueque', imageUrl: 'https...Bici', location: 'Indeco', category: 'Otros' },
  { id: '5', title: 'Chamarras (lote)', type: 'Donación', imageUrl: 'https...Ropa', location: 'Centro', category: 'Ropa' },
  { id: '6', title: 'Lámpara de escritorio', type: 'Donación', imageUrl: 'https...Lampara', location: 'Camino Real', category: 'Muebles' },
];

// --- 2. Interface y Dimensiones ---
// (Mismos de antes)
interface ArticleProps { title: string; type: 'Donación' | 'Trueque'; imageUrl: string; location: string; }
const { width } = Dimensions.get('window');
const cardWidth = (width - 24) / 2 - 8;

// --- 3. Definición de Categorías (¡Nuevo!) ---
const CATEGORIES = [
  { id: '1', name: 'Alimentos', icon: 'food-apple' },
  { id: '2', name: 'Ropa y Calzado', icon: 'tshirt-crew' },
  { id: '3', name: 'Muebles', icon: 'sofa' },
  { id: '4', name: 'Electrónica', icon: 'laptop' },
  { id: '5', name: 'Herramientas', icon: 'tools' },
  { id: '6', name: 'Libros y Juguetes', icon: 'book-open-variant' },
  { id: '7', name: 'Otros', icon: 'dots-horizontal' },
];

// --- 4. Componente de Tarjeta ---
// (Mismo componente ArticleCard de antes)
const ArticleCard: React.FC<ArticleProps> = ({ title, type, imageUrl, location }) => (
  <TouchableOpacity style={styles.card}>
    <Image source={{ uri: imageUrl }} style={styles.cardImage} />
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle} numberOfLines={2}>{title}</Text>
      <Text style={styles.cardLocation}>
        <Ionicons name="location-sharp" size={14} color="#555" /> {location}
      </Text>
    </View>
    <View style={[styles.badge, type === 'Donación' ? styles.badgeDonation : styles.badgeTrade]}>
      <Text style={styles.badgeText}>{type}</Text>
    </View>
  </TouchableOpacity>
);


// --- 5. Componente Principal (HomeScreen) ---
export default function HomeScreen() {
  // --- Estados para el Modal y Filtro (¡Nuevo!) ---
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Lógica de simulación de filtro
  const handleSelectCategory = (category: string | null) => {
    setSelectedCategory(category);
    setModalVisible(false);
    console.log('Filtrando por:', category ?? 'Todos');
    // Aquí, en el futuro, harías un fetch de los datos filtrados
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* --- Barra de Búsqueda --- */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <FontAwesome name="search" size={18} color="gray" style={styles.searchIcon} />
          <TextInput placeholder="Buscar artículos..." style={styles.searchInput} />
        </View>
        
        {/* Botón de Filtro (actualizado) */}
        <TouchableOpacity style={styles.filterButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="filter" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* --- Feed de Artículos --- */}
      <FlatList
        data={mockFeedData} // En el futuro, filtrarías esta data
        renderItem={({ item }) => <ArticleCard {...item} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          // Título dinámico (actualizado)
          <Text style={styles.feedTitle}>
            {selectedCategory ? `Viendo en "${selectedCategory}"` : 'Artículos Recientes'}
          </Text>
        }
      />

      {/* --- MODAL DE CATEGORÍAS (¡Nuevo!) --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Filtrar por Categoría</Text>
            
            {/* Botón para "Todos" */}
            <TouchableOpacity
              style={styles.categoryItem}
              onPress={() => handleSelectCategory(null)}>
              <FontAwesome name="th-large" size={20} color="#333" />
              <Text style={styles.categoryText}>Mostrar Todos</Text>
            </TouchableOpacity>

            {/* Lista de Categorías */}
            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={() => handleSelectCategory(item.name)}>
                  {/* Usamos MaterialCommunityIcons aquí, ¡asegúrate de importarlo! */}
                  <MaterialCommunityIcons name={item.icon} size={22} color="#333" />
                  <Text style={styles.categoryText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
}

// --- 6. Estilos ---
const styles = StyleSheet.create({
  // ... (Estilos de antes: container, header, searchBar, etc.)
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f4f4f8', borderRadius: 10, paddingHorizontal: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 40, fontSize: 15 },
  filterButton: { marginLeft: 10, padding: 8 },
  feedTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginVertical: 12, paddingHorizontal: 12 },
  listContainer: { paddingHorizontal: 12, paddingBottom: 16 },
  row: { justifyContent: 'space-between' },
  card: { width: cardWidth, backgroundColor: '#f9f9f9', borderRadius: 8, borderWidth: 1, borderColor: '#eee', marginBottom: 16, overflow: 'hidden' },
  cardImage: { width: '100%', height: 120, backgroundColor: '#e0e0e0' },
  cardContent: { padding: 10, height: 80 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  cardLocation: { fontSize: 13, color: '#555', marginTop: 6 },
  badge: { position: 'absolute', top: 8, right: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeDonation: { backgroundColor: '#d4edda' },
  badgeTrade: { backgroundColor: '#cce5ff' },
  badgeText: { fontSize: 12, fontWeight: 'bold', color: '#0056b3' },
  
  // --- Estilos del Modal (¡Nuevos!) ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    height: '60%', // Ocupa el 60% de la pantalla
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryText: {
    fontSize: 17,
    marginLeft: 15,
  },
});
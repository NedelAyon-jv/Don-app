import { Colors } from '@/constants/theme'; // Tu importación del tema
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- 1. Datos Estáticos (Maqueta) ---
// (Sin cambios)
const mockFeedData = [
  { id: '1', title: 'Silla de oficina', type: 'Trueque', imageUrl: 'https...Silla', location: 'Centro', category: 'Muebles' },
  { id: '2', title: 'Monitor 24"', type: 'Donación', imageUrl: 'https...Monitor', location: 'Camino Real', category: 'Electrónica' },
  { id: '3', title: 'Despensa básica', type: 'Donación', imageUrl: 'https...Alimentos', location: 'Santa Fe', category: 'Alimentos' },
  { id: '4', title: 'Bicicleta R26', type: 'Trueque', imageUrl: 'https...Bici', location: 'Indeco', category: 'Otros' },
  { id: '5', title: 'Chamarras (lote)', type: 'Donación', imageUrl: 'https...Ropa', location: 'Centro', category: 'Ropa' },
  { id: '6', title: 'Lámpara de escritorio', type: 'Donación', imageUrl: 'https...Lampara', location: 'Camino Real', category: 'Muebles' },
];

// --- 2. Interface y Dimensiones ---
// (Añadimos 'theme' a la interface)
interface ArticleProps { 
  title: string; 
  type: 'Donación' | 'Trueque'; 
  imageUrl: string; 
  location: string;
  theme: typeof Colors.light; // <-- Prop para pasar el tema
}
const { width } = Dimensions.get('window');
const cardWidth = (width - 24) / 2 - 8;

// --- 3. Definición de Categorías ---
// (Sin cambios)
const CATEGORIES = [
  { id: '1', name: 'Alimentos', icon: 'food-apple' },
  { id: '2', name: 'Ropa y Calzado', icon: 'tshirt-crew' },
  { id: '3', name: 'Muebles', icon: 'sofa' },
  { id: '4', name: 'Electrónica', icon: 'laptop' },
  { id: '5', name: 'Herramientas', icon: 'tools' },
  { id: '6', name: 'Libros y Juguetes', icon: 'book-open-variant' },
  { id: '7', name: 'Otros', icon: 'dots-horizontal' },
];

// --- 4. Componente de Tarjeta (Actualizado) ---
// (Ahora recibe 'theme' y aplica colores dinámicamente)
const ArticleCard: React.FC<ArticleProps> = ({ title, type, imageUrl, location, theme }) => (
  <TouchableOpacity style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}> {/* <-- Colores de tema */}
    <Image source={{ uri: imageUrl }} style={[styles.cardImage, { backgroundColor: theme.border }]} /> {/* <-- Colores de tema */}
    <View style={styles.cardContent}>
      <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={2}>{title}</Text> {/* <-- Colores de tema */}
      <Text style={[styles.cardLocation, { color: theme.text }]}> {/* <-- Colores de tema */}
        <Ionicons name="location-sharp" size={14} color={theme.text} /> {location} {/* <-- Colores de tema */}
      </Text>
    </View>
    {/* Dejamos los badges con sus colores fijos, ya que son funcionales (verde/azul) */}
    <View style={[styles.badge, type === 'Donación' ? styles.badgeDonation : styles.badgeTrade]}>
      <Text style={styles.badgeText}>{type}</Text>
    </View>
  </TouchableOpacity>
);


// --- 5. Componente Principal (HomeScreen) ---
export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme]; // Tu objeto de tema (light o dark)

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSelectCategory = (category: string | null) => {
    setSelectedCategory(category);
    setModalVisible(false);
    console.log('Filtrando por:', category ?? 'Todos');
  };

  return (
    // Aplicas el color de fondo principal
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      
      {/* Barra de Búsqueda */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}> {/* <-- Color de tema */}
        <View style={[styles.searchBar, { backgroundColor: theme.card }]}> {/* <-- Color de tema */}
          <FontAwesome name="search" size={18} color={theme.text} style={styles.searchIcon} /> {/* <-- Color de tema */}
          <TextInput 
            placeholder="Buscar artículos..."
            style={[styles.searchInput, { color: theme.text }]}
            placeholderTextColor={theme.text} // <-- Color de tema
          />
        </View>
        
        {/* Botón de Filtro */}
        <TouchableOpacity style={styles.filterButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="filter" size={24} color={theme.primary} /> {/* <-- Color de tema (usamos 'primary' por ser interactivo) */}
        </TouchableOpacity>
      </View>

      {/* --- Feed de Artículos --- */}
      <FlatList
        data={mockFeedData}
        renderItem={({ item }) => (
          // Pasamos el 'theme' como prop a la tarjeta
          <ArticleCard {...item} theme={theme} /> // <-- Prop de tema
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          // Título dinámico
          <Text style={[styles.feedTitle, { color: theme.text }]}> {/* <-- Color de tema */}
            {selectedCategory ? `Viendo en "${selectedCategory}"` : 'Artículos Recientes'}
          </Text>
        }
      />

      {/* --- MODAL DE CATEGORÍAS --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          {/* Usamos theme.card para el fondo del modal */}
          <View style={[styles.modalContainer, { backgroundColor: theme.card }]}> {/* <-- Color de tema */}
            <Text style={[styles.modalTitle, { color: theme.text }]}>Filtrar por Categoría</Text> {/* <-- Color de tema */}
            
            <TouchableOpacity
              style={[styles.categoryItem, { borderBottomColor: theme.border }]} // <-- Color de tema
              onPress={() => handleSelectCategory(null)}>
              <FontAwesome name="th-large" size={20} color={theme.text} /> {/* <-- Color de tema */}
              <Text style={[styles.categoryText, { color: theme.text }]}>Mostrar Todos</Text> {/* <-- Color de tema */}
            </TouchableOpacity>

            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.categoryItem, { borderBottomColor: theme.border }]} // <-- Color de tema
                  onPress={() => handleSelectCategory(item.name)}>
                  <MaterialCommunityIcons name={item.icon} size={22} color={theme.text} /> {/* <-- Color de tema */}
                  <Text style={[styles.categoryText, { color: theme.text }]}>{item.name}</Text> {/* <-- Color de tema */}
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
}

// --- 6. Estilos (Limpios de Colores) ---
// Ahora el StyleSheet solo define ESTRUCTURA, no colores.
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    // quitamos backgroundColor
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    borderBottomWidth: 1, 
    // quitamos borderBottomColor
  },
  searchBar: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 10, 
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    // quitamos backgroundColor
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
  feedTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginVertical: 12, 
    paddingHorizontal: 12,
    // quitamos color
  },
  listContainer: { 
    paddingHorizontal: 12, 
    paddingBottom: 16,
  },
  row: { 
    justifyContent: 'space-between',
  },
  card: { 
    width: cardWidth, 
    borderRadius: 8, 
    borderWidth: 1, 
    marginBottom: 16, 
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    // quitamos backgroundColor y borderColor
  },
  cardImage: { 
    width: '100%', 
    height: 120,
    // quitamos backgroundColor
  },
  cardContent: { 
    padding: 10, 
    height: 80,
  },
  cardTitle: { 
    fontSize: 15, 
    fontWeight: '600',
    // quitamos color
  },
  cardLocation: { 
    fontSize: 13, 
    marginTop: 6,
    // quitamos color
  },
  
  // --- Estilos de Badges (Se quedan igual) ---
  badge: { 
    position: 'absolute', 
    top: 8, 
    right: 8, 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6,
  },
  badgeDonation: { 
    backgroundColor: '#d4edda', // Verde claro funcional
  },
  badgeTrade: { 
    backgroundColor: '#cce5ff', // Azul claro funcional
  },
  badgeText: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    color: '#0056b3',
  },
  
  // --- Estilos del Modal (Limpios de Colores) ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // El overlay oscuro se queda
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    height: '60%',
    // quitamos backgroundColor
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
    // quitamos borderBottomColor
  },
  categoryText: {
    fontSize: 17,
    marginLeft: 15,
  },
});
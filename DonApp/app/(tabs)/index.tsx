import { Colors } from '@/constants/theme'; // Tu importación del tema
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // <-- 1. IMPORTAR ROUTER
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
interface ArticleProps { 
  title: string; 
  type: 'Donación' | 'Trueque'; 
  imageUrl: string; 
  location: string;
  theme: typeof Colors.light;
  onPress: () => void; // <-- 3. AÑADIR onPress A LA INTERFACE
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
const ArticleCard: React.FC<ArticleProps> = ({ title, type, imageUrl, location, theme, onPress }) => ( // <-- Recibe onPress
  <TouchableOpacity 
    style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
    onPress={onPress} // <-- 4. APLICAR onPress AL BOTÓN
  >
    <Image source={{ uri: imageUrl }} style={[styles.cardImage, { backgroundColor: theme.border }]} />
    <View style={styles.cardContent}>
      <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={2}>{title}</Text>
      <Text style={[styles.cardLocation, { color: theme.text }]}>
        <Ionicons name="location-sharp" size={14} color={theme.text} /> {location}
      </Text>
    </View>
    <View style={[styles.badge, type === 'Donación' ? styles.badgeDonation : styles.badgeTrade]}>
      <Text style={styles.badgeText}>{type}</Text>
    </View>
  </TouchableOpacity>
);


// --- 5. Componente Principal (HomeScreen) ---
export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const router = useRouter(); // <-- 2. INICIALIZAR ROUTER

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSelectCategory = (category: string | null) => {
    setSelectedCategory(category);
    setModalVisible(false);
    console.log('Filtrando por:', category ?? 'Todos');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      
      {/* Barra de Búsqueda */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={[styles.searchBar, { backgroundColor: theme.card }]}>
          <FontAwesome name="search" size={18} color={theme.text} style={styles.searchIcon} />
          <TextInput 
            placeholder="Buscar artículos..."
            style={[styles.searchInput, { color: theme.text }]}
            placeholderTextColor={theme.text}
          />
        </View>
        
        <TouchableOpacity style={styles.filterButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="filter" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {/* --- Feed de Artículos --- */}
      <FlatList
        data={mockFeedData}
        renderItem={({ item }) => (
          <ArticleCard 
            {...item} 
            theme={theme} 
            // 5. AQUÍ ESTÁ LA NAVEGACIÓN
            onPress={() => router.push(`./articulo?id=${item.id}`)} 
          />
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <Text style={[styles.feedTitle, { color: theme.text }]}>
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
          <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Filtrar por Categoría</Text>
            
            <TouchableOpacity
              style={[styles.categoryItem, { borderBottomColor: theme.border }]}
              onPress={() => handleSelectCategory(null)}>
              <FontAwesome name="th-large" size={20} color={theme.text} />
              <Text style={[styles.categoryText, { color: theme.text }]}>Mostrar Todos</Text>
            </TouchableOpacity>

            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.categoryItem, { borderBottomColor: theme.border }]}
                  onPress={() => handleSelectCategory(item.name)}>
                  <MaterialCommunityIcons name={item.icon} size={22} color={theme.text} />
                  <Text style={[styles.categoryText, { color: theme.text }]}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
}

// --- 6. Estilos (Sin cambios) ---
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    borderBottomWidth: 1, 
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
  },
  cardImage: { 
    width: '100%', 
    height: 120,
  },
  cardContent: { 
    padding: 10, 
    height: 80,
  },
  cardTitle: { 
    fontSize: 15, 
    fontWeight: '600',
  },
  cardLocation: { 
    fontSize: 13, 
    marginTop: 6,
  },
  badge: { 
    position: 'absolute', 
    top: 8, 
    right: 8, 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6,
  },
  badgeDonation: { 
    backgroundColor: '#d4edda', 
  },
  badgeTrade: { 
    backgroundColor: '#cce5ff', 
  },
  badgeText: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    color: '#0056b3',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    height: '60%',
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
  },
  categoryText: {
    fontSize: 17,
    marginLeft: 15,
  },
});


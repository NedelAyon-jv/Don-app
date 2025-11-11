import { Colors } from '@/constants/theme';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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

// --- 1. Importar el servicio y las interfaces ---
import { ApiPublication, getAllPublications } from '@/services/user/publi.services';

// ##################################################################
// #           MODO DEMO PARA PRESENTACIÓN DE CLASE                 #
// ##################################################################
const MODO_DEMO = true;
// ##################################################################


// --- Datos Estáticos (Maqueta) ---
// (Corregido: 'imageUrls' se renombró a 'images' para coincidir con la interfaz)
const mockApiData: ApiPublication[] = [
  { id: '1', title: 'Silla de oficina', type: 'trade_offer', images: ['https://iseating.com.mx/cdn/shop/files/Silla_de_oficina_Ejecutiva_Caselli_C.jpg?v=1739427495&width=2048'], location: { address: 'Centro', latitude: 0, longitude: 0 }, category: 'Muebles', description: '', condition: 'good', quantity: 1, availability: '', pickupRequirements: '', tags: [], createdAt: '' },
  { id: '2', title: 'Monitor 24"', type: 'donation_offer', images: ['https://i5.walmartimages.com/asr/34ea678d-b9ac-42bf-a983-f35076f79bde.6e32e9fe3ce59b318fca816bae8f8180.jpeg'], location: { address: 'Camino Real', latitude: 0, longitude: 0 }, category: 'Electrónica', description: '', condition: 'good', quantity: 1, availability: '', pickupRequirements: '', tags: [], createdAt: '' },
  { id: '3', title: 'Despensa básica', type: 'donation_request', images: ['https://i5.walmartimages.com/asr/ccdff1ec-0ff0-46a7-a76c-5ed3d4d7df62.f06021d80c694b4c7d38ad5760e71213.jpeg'], location: { address: 'Santa Fe', latitude: 0, longitude: 0 }, category: 'Alimentos', description: '', condition: 'good', quantity: 1, availability: '', pickupRequirements: '', tags: [], createdAt: '' },
  { id: '4', title: 'Bicicleta R26', type: 'trade_offer', images: ['https://www.costco.com.mx/medias/sys_master/products/hdf/h38/204420032593950.jpg'], location: { address: 'Indeco', latitude: 0, longitude: 0 }, category: 'Otros', description: '', condition: 'good', quantity: 1, availability: '', pickupRequirements: '', tags: [], createdAt: '' },
  { id: '5', title: 'Chamarras (lote)', type: 'donation_offer', images: ['https://exportfastproduct.com/885-large_default/lote-de-chamarras-mixtas-de-marca.jpg'], location: { address: 'Centro', latitude: 0, longitude: 0 }, category: 'Ropa y Calzado', description: '', condition: 'good', quantity: 1, availability: '', pickupRequirements: '', tags: [], createdAt: '' },
  { id: '6', title: 'Lámpara de escritorio', type: 'donation_offer', images: ['https://resources.claroshop.com/medios-plazavip/t1/171434354861S8i6Z8imLACSX569jpg'], location: { address: 'Camino Real', latitude: 0, longitude: 0 }, category: 'Muebles', description: '', condition: 'good', quantity: 1, availability: '', pickupRequirements: '', tags: [], createdAt: '' },
];


// --- Interfaz para las props del ArticleCard (sin cambios) ---
type ArticleData = {
  id: string;
  title: string;
  type: 'Donación' | 'Trueque';
  imageUrl: string;
  location: string;
  category: string;
};

// --- Dimensiones y Categorías (sin cambios) ---
const { width } = Dimensions.get('window');
const cardWidth = (width - 24) / 2 - 8;
const CATEGORIES = [
  { id: '1', name: 'Alimentos', icon: 'food-apple' },
  { id: '2', name: 'Ropa y Calzado', icon: 'tshirt-crew' },
  { id: '3', name: 'Muebles', icon: 'sofa' },
  { id: '4', name: 'Electrónica', icon: 'laptop' },
  { id: '5', name: 'Herramientas', icon: 'tools' },
  { id: '6', name: 'Libros y Juguetes', icon: 'book-open-variant' },
  { id: '7', name: 'Otros', icon: 'dots-horizontal' },
];

// --- Componente de Tarjeta (sin cambios) ---
interface ArticleProps extends ArticleData {
  theme: typeof Colors.light;
  onPress: () => void;
}

const ArticleCard: React.FC<ArticleProps> = ({ title, type, imageUrl, location, theme, onPress }) => (
  <TouchableOpacity
    style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
    onPress={onPress}
  >
    <Image 
      source={{ uri: imageUrl }} 
      style={[styles.cardImage, { backgroundColor: theme.border }]} 
      onError={(e) => console.log("Error al cargar imagen", e.nativeEvent.error)}
    />
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


// --- Componente Principal (HomeScreen) ---
export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [publications, setPublications] = useState<ApiPublication[]>([]); 
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null); 

  useEffect(() => {
    const loadPublications = async () => {
      if (MODO_DEMO) {
        // --- MODO DEMO ---
        console.log("----- MODO DEMO ACTIVADO -----");
        setTimeout(() => {
          setPublications(mockApiData);
          setIsLoading(false);
        }, 800);
      } else {
        // --- MODO REAL ---
        try {
          setIsLoading(true);
          setError(null);
          const data = await getAllPublications();
          setPublications(data);
        } catch (err: any) {
          setError(err.message || "Error al cargar datos.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadPublications();
  }, []); 

  const mapApiTypeToDisplay = (apiType: ApiPublication['type']): 'Donación' | 'Trueque' => {
    if (apiType === 'donation_offer' || apiType === 'donation_request') {
      return 'Donación';
    }
    return 'Trueque';
  };

  const feedData: ArticleData[] = useMemo(() => {
    const filteredPublications = selectedCategory
      ? publications.filter(pub => pub.category.toLowerCase() === selectedCategory.toLowerCase())
      : publications;

    return filteredPublications.map(pub => ({
      id: pub.id,
      title: pub.title,
      type: mapApiTypeToDisplay(pub.type),
      // --- LÓGICA SIMPLIFICADA ---
      // Ahora 'images' existe tanto en la API como en la maqueta
      imageUrl: (pub.images && pub.images[0]) || 'https://placehold.co/600x400/eeeeee/aaaaaa?text=Sin+Imagen',
      location: pub.location?.address || 'Ubicación no disponible',
      category: pub.category,
    }));
  }, [publications, selectedCategory]); 


  const handleSelectCategory = (category: string | null) => {
    setSelectedCategory(category);
    setModalVisible(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.feedTitle, { color: theme.text }]}>Cargando publicaciones...</Text>
      </SafeAreaView>
    );
  }

  if (error && !MODO_DEMO) {
    return (
      <SafeAreaView style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <MaterialCommunityIcons name="alert-circle-outline" size={50} color={theme.error} />
        <Text style={[styles.feedTitle, { color: theme.error, textAlign: 'center' }]}>
          Error: {error}
        </Text>
        <Text style={{ color: theme.text }}>(No se pudo conectar al servidor)</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>

      {/* Barra de Búsqueda (sin cambios) */}
      <View style={[styles.containerTop]}>
        <Text style={[styles.title, { color: theme.text }]}>
          Inicio
        </Text>
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
      </View>

      {/* --- Feed de Artículos --- */}
      <FlatList
        data={feedData} 
        renderItem={({ item }) => (
          <ArticleCard
            {...item}
            theme={theme}
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
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={[styles.feedTitle, { color: theme.text, opacity: 0.7, fontSize: 16 }]}>
              {selectedCategory ? 'No hay artículos en esta categoría.' : 'No hay publicaciones por ahora.'}
            </Text>
          </View>
        }
      />

      {/* --- MODAL DE CATEGORÍAS (sin cambios) --- */}
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
  center: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  containerTop: {
    top: -40,
    marginBottom: -30
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
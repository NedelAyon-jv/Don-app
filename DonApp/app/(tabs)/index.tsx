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

// --- Importar servicio ---
import { ApiPublication, getAllPublications } from '@/services/user/publi.services';

const MODO_DEMO = false;

// --- Datos Estáticos (Backup) ---
const mockApiData: any[] = [];

// --- Interfaces ---
type ArticleData = {
  id: string;
  title: string;
  type: 'Donación' | 'Trueque';
  imageUrl: string;
  location: string;
  category: string;
};

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

// --- Componente Tarjeta ---
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
      resizeMode="cover"
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

// --- HomeScreen ---
export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [publications, setPublications] = useState<ApiPublication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar publicaciones
  useEffect(() => {
    const loadPublications = async () => {
      if (MODO_DEMO) {
        setPublications(mockApiData);
        setIsLoading(false);
      } else {
        try {
          setIsLoading(true);
          setError(null);
          const data = await getAllPublications();

          if (Array.isArray(data)) {
            setPublications(data);
          } else {
            setPublications([]);
          }
        } catch (err: any) {
          console.error("Error cargando:", err);
          setError("Error de conexión");
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadPublications();
  }, []);

  const mapApiTypeToDisplay = (apiType: string): 'Donación' | 'Trueque' => {
    return (apiType === 'donation_offer' || apiType === 'donation_request') ? 'Donación' : 'Trueque';
  };

  // --- Procesar datos para la vista ---
  const feedData: ArticleData[] = useMemo(() => {
    const safePublications = Array.isArray(publications) ? publications : [];

    const filteredPublications = selectedCategory
      ? safePublications.filter(pub => pub.category && pub.category.toLowerCase() === selectedCategory.toLowerCase())
      : safePublications;

    return filteredPublications.map(pub => {
      // LÓGICA DE IMÁGENES MEJORADA:
      // El log mostró que vienen como "images", pero mantenemos soporte a "iamges"
      const imgList = pub.images && pub.images.length > 0 ? pub.images : (pub.iamges || []);
      const mainImage = imgList.length > 0 ? imgList[0] : 'https://placehold.co/600x400/eeeeee/aaaaaa?text=Sin+Imagen';

      // Ubicación segura
      const loc = pub.location
        ? (typeof pub.location.address === 'string' ? pub.location.address : 'Ver mapa')
        : 'Ubicación no disponible';

      return {
        id: pub.id,
        title: pub.title || 'Sin título',
        type: mapApiTypeToDisplay(pub.type),
        imageUrl: mainImage,
        location: loc,
        category: pub.category || 'Varios',
      };
    });
  }, [publications, selectedCategory]);

  const handleSelectCategory = (category: string | null) => {
    setSelectedCategory(category);
    setModalVisible(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.feedTitle, { color: theme.text }]}>Cargando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>

      {/* Header y Buscador */}
      <View style={[styles.containerTop]}>
        <Text style={[styles.title, { color: theme.text }]}>Inicio</Text>
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

      {/* Lista de Publicaciones */}
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
            {selectedCategory ? `Categoría: ${selectedCategory}` : 'Artículos Recientes'}
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ color: theme.text, marginTop: 20 }}>No hay publicaciones.</Text>
          </View>
        }
      />

      {/* Modal Filtros */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Filtrar por Categoría</Text>
            <TouchableOpacity style={styles.categoryItem} onPress={() => handleSelectCategory(null)}>
              <FontAwesome name="th-large" size={20} color={theme.text} />
              <Text style={[styles.categoryText, { color: theme.text }]}>Mostrar Todos</Text>
            </TouchableOpacity>
            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.categoryItem} onPress={() => handleSelectCategory(item.name)}>
                  <MaterialCommunityIcons name={item.icon as any} size={22} color={theme.text} />
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  title: { fontSize: 30, fontWeight: 'bold', paddingHorizontal: 12, paddingVertical: 10 },
  containerTop: { top: -40, marginBottom: -30 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 12, elevation: 3 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 40, fontSize: 15 },
  filterButton: { marginLeft: 10, padding: 8 },
  feedTitle: { fontSize: 20, fontWeight: 'bold', marginVertical: 12, paddingHorizontal: 12 },
  listContainer: { paddingHorizontal: 12, paddingBottom: 16 },
  row: { justifyContent: 'space-between' },
  card: { width: cardWidth, borderRadius: 8, borderWidth: 1, marginBottom: 16, overflow: 'hidden', elevation: 3 },
  cardImage: { width: '100%', height: 120 },
  cardContent: { padding: 10, height: 80 },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardLocation: { fontSize: 13, marginTop: 6 },
  badge: { position: 'absolute', top: 8, right: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeDonation: { backgroundColor: '#d4edda' },
  badgeTrade: { backgroundColor: '#cce5ff' },
  badgeText: { fontSize: 12, fontWeight: 'bold', color: '#0056b3' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContainer: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, height: '60%' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  categoryItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  categoryText: { fontSize: 17, marginLeft: 15 },
});
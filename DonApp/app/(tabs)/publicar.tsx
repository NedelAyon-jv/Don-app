import { Colors } from '@/constants/theme'; // <-- 1. Importar Colores
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useMemo, useState } from 'react'; // <-- 2. Importar useMemo
import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme, // <-- 3. Importar useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Definimos los tipos para el estado y el tipo de publicación
type PostType = 'Donación' | 'Trueque';
type PostStatus = 'Disponible' | 'No Disponible';

export default function PublishScreen() {
  // --- 4. Configuración del Tema ---
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  // 5. Generar estilos dinámicamente
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [postType, setPostType] = useState<PostType>('Donación');
  const [status, setStatus] = useState<PostStatus>('Disponible');

  // --- Lógica de Imágenes (sin cambios) ---
  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Límite alcanzado', 'Solo puedes subir un máximo de 5 imágenes.');
      return;
    }
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permiso requerido', 'Necesitas dar acceso a tu galería para subir imágenes.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (uriToRemove: string) => {
    setImages(images.filter((imgUri) => imgUri !== uriToRemove));
  };

  // --- Lógica de Publicación (sin cambios) ---
  const handleSubmit = () => {
    if (images.length === 0) {
      Alert.alert('Error', 'Debes subir al menos 1 imagen.');
      return;
    }
    if (!title || !description) {
      Alert.alert('Error', 'El título y la descripción son obligatorios.');
      return;
    }
    console.log('Publicando...', { title, description, postType, status, images });
    Alert.alert('Éxito (Maqueta)', 'Artículo listo para publicar.');
  };

  // --- Renderizado de la UI (con colores de tema) ---
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.header, { color: theme.text }]}>Publicar</Text>

        {/* Título */}
        <Text style={styles.label}>Título</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Silla de oficina en buen estado"
          placeholderTextColor={theme.text} // <-- Color de tema
          value={title}
          onChangeText={setTitle}
        />

        {/* Descripción */}
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={styles.inputMultiline}
          placeholder="Describe tu artículo, detalles, condiciones, etc."
          placeholderTextColor={theme.text} // <-- Color de tema
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        {/* Selector de Imágenes */}
        <Text style={styles.label}>Imágenes ({images.length} / 5)</Text>
        <View style={styles.imagePickerContainer}>
          <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
            <FontAwesome name="camera" size={24} color={theme.primary} /> {/* <-- Color de tema */}
            <Text style={styles.imagePickerText}>Añadir Foto</Text>
          </TouchableOpacity>
        </View>

        {/* Vista previa de imágenes */}
        <FlatList
          data={images}
          horizontal
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: item }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(item)}>
                {/* Usamos el color de error del tema */}
                <FontAwesome name="times-circle" size={24} color={theme.error} /> {/* <-- Color de tema */}
              </TouchableOpacity>
            </View>
          )}
          style={styles.imagePreviewList}
        />

        {/* Tipo: Donación o Trueque */}
        <Text style={styles.label}>Tipo de Publicación</Text>
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[styles.segmentButton, postType === 'Donación' && styles.segmentButtonActive]}
            onPress={() => setPostType('Donación')}>
            <Text style={[styles.segmentText, postType === 'Donación' && styles.segmentTextActive]}>Donación</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentButton, postType === 'Trueque' && styles.segmentButtonActive]}
            onPress={() => setPostType('Trueque')}>
            <Text style={[styles.segmentText, postType === 'Trueque' && styles.segmentTextActive]}>Trueque</Text>
          </TouchableOpacity>
        </View>

        {/* Estado: Disponible o No Disponible */}
        {/* <Text style={styles.label}>Estado</Text>
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[styles.segmentButton, status === 'Disponible' && styles.segmentButtonActive]}
            onPress={() => setStatus('Disponible')}>
            <Text style={[styles.segmentText, status === 'Disponible' && styles.segmentTextActive]}>Disponible</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentButton, status === 'No Disponible' && styles.segmentButtonActive]}
            onPress={() => setStatus('No Disponible')}>
            <Text style={[styles.segmentText, status === 'No Disponible' && styles.segmentTextActive]}>No Disponible</Text>
          </TouchableOpacity>
        </View> */}

        {/* Botón de Publicar */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Publicar Artículo</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- 6. Estilos dinámicos ---
// (Creamos una función que recibe el tema)
const createStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      // backgroundColor: theme.background, // <-- Color de tema
      marginTop: -20
    },
    scrollContainer: {
      padding: 16,
    },
    header: {
      fontSize: 30,
      fontWeight: 'bold',
      // margin: 10,
      // padding: 10,
      marginBottom: 10,
      marginTop: -25,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 1,
      paddingVertical: 1,
    },
    label: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text, // <-- Color de tema
      marginBottom: 8,
      marginTop: 16,
    },
    input: {
      backgroundColor: theme.card, // <-- Color de tema
      borderWidth: 1,
      borderColor: theme.border, // <-- Color de tema
      borderRadius: 8,
      padding: 12,
      fontSize: 15,
      color: theme.text, // <-- Color de tema
    },
    inputMultiline: {
      backgroundColor: theme.card, // <-- Color de tema
      borderWidth: 1,
      borderColor: theme.border, // <-- Color de tema
      borderRadius: 8,
      padding: 12,
      fontSize: 15,
      height: 100,
      textAlignVertical: 'top',
      color: theme.text, // <-- Color de tema
    },
    // --- Estilos de Imágenes ---
    imagePickerContainer: {
      alignItems: 'center',
      marginBottom: 10,
    },
    imagePickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card, // <-- Color de tema
      borderWidth: 1,
      borderColor: theme.primary, // <-- Color de tema
      padding: 12,
      borderRadius: 8,
    },
    imagePickerText: {
      marginLeft: 10,
      fontSize: 16,
      color: theme.primary, // <-- Color de tema
      fontWeight: 'bold',
    },
    imagePreviewList: {
      marginBottom: 10,
    },
    imagePreviewContainer: {
      position: 'relative',
      marginRight: 10,
    },
    imagePreview: {
      width: 100,
      height: 100,
      borderRadius: 8,
      backgroundColor: theme.border, // <-- Color de tema
    },
    removeImageButton: {
      position: 'absolute',
      top: -5,
      right: -5,
      backgroundColor: theme.card, // <-- Color de tema
      borderRadius: 12,
    },
    // --- Estilos de Segmentos (Selectores) ---
    segmentContainer: {
      flexDirection: 'row',
      width: '100%',
      backgroundColor: theme.border, // <-- Color de tema
      borderRadius: 8,
      overflow: 'hidden',
    },
    segmentButton: {
      flex: 1,
      padding: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    segmentButtonActive: {
      backgroundColor: theme.primary, // <-- Color de tema
    },
    segmentText: {
      fontSize: 15,
      color: theme.text, // <-- Color de tema
      fontWeight: '600',
      opacity: 0.7,
    },
    segmentTextActive: {
      color: theme.background, // <-- Color de tema
      opacity: 1,
    },
    // --- Botón de Publicar ---
    submitButton: {
      backgroundColor: theme.success, // <-- Color de tema (funcional)
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
      marginTop: 32,
      marginBottom: 16,
    },
    submitButtonText: {
      color: theme.card, // <-- Color de tema
      fontSize: 18,
      fontWeight: 'bold',
    },
  });

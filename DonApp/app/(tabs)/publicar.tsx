import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Definimos los tipos para el estado y el tipo de publicación
type PostType = 'Donación' | 'Trueque';
type PostStatus = 'Disponible' | 'No Disponible';

export default function PublishScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]); // Almacenará las URIs de las imágenes
  const [postType, setPostType] = useState<PostType>('Donación');
  const [status, setStatus] = useState<PostStatus>('Disponible');

  // --- Lógica de Imágenes ---

  const pickImage = async () => {
    // 1. Validar máximo de imágenes
    if (images.length >= 5) {
      Alert.alert('Límite alcanzado', 'Solo puedes subir un máximo de 5 imágenes.');
      return;
    }

    // 2. Pedir permiso
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permiso requerido', 'Necesitas dar acceso a tu galería para subir imágenes.');
      return;
    }

    // 3. Abrir la galería
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    // 4. Añadir imagen al estado
    if (!result.canceled && result.assets) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (uriToRemove: string) => {
    setImages(images.filter((imgUri) => imgUri !== uriToRemove));
  };

  // --- Lógica de Publicación ---

  const handleSubmit = () => {
    // Validar mínimo de 1 imagen
    if (images.length === 0) {
      Alert.alert('Error', 'Debes subir al menos 1 imagen.');
      return;
    }

    if (!title || !description) {
      Alert.alert('Error', 'El título y la descripción son obligatorios.');
      return;
    }

    // Por ahora, solo mostramos los datos en consola
    console.log('Publicando...');
    console.log('Título:', title);
    console.log('Descripción:', description);
    console.log('Tipo:', postType);
    console.log('Estado:', status);
    console.log('Imágenes:', images);

    Alert.alert('Éxito (Maqueta)', 'Artículo listo para publicar.');
    // Aquí, en el futuro, llamarías a tu API/backend
  };

  // --- Renderizado de la UI ---

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Título */}
        <Text style={styles.label}>Título</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Silla de oficina en buen estado"
          value={title}
          onChangeText={setTitle}
        />

        {/* Descripción */}
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={styles.inputMultiline}
          placeholder="Describe tu artículo, detalles, condiciones, etc."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        {/* Selector de Imágenes */}
        <Text style={styles.label}>Imágenes ({images.length} / 5)</Text>
        <View style={styles.imagePickerContainer}>
          <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
            <FontAwesome name="camera" size={24} color="#007bff" />
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
                <FontAwesome name="times-circle" size={24} color="#e74c3c" />
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
        <Text style={styles.label}>Estado</Text>
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
        </View>

        {/* Botón de Publicar */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Publicar Artículo</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContainer: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  inputMultiline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    height: 100,
    textAlignVertical: 'top',
  },
  // --- Estilos de Imágenes ---
  imagePickerContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaf4ff',
    borderWidth: 1,
    borderColor: '#007bff',
    padding: 12,
    borderRadius: 8,
  },
  imagePickerText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#007bff',
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
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  // --- Estilos de Segmentos (Selectores) ---
  segmentContainer: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#eee',
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
    backgroundColor: '#007bff',
  },
  segmentText: {
    fontSize: 15,
    color: '#555',
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#fff',
  },
  // --- Botón de Publicar ---
  submitButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
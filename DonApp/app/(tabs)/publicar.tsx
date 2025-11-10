import { Colors } from '@/constants/theme'; // <-- Import original de tu proyecto
import { FontAwesome } from '@expo/vector-icons'; // <-- Import original de tu proyecto
import * as ImagePicker from 'expo-image-picker'; // <-- Import original de tu proyecto
import React, { useMemo, useState } from 'react';
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
  useColorScheme
} from 'react-native'; // <-- Import original de tu proyecto
import { SafeAreaView } from 'react-native-safe-area-context'; // <-- Import original de tu proyecto
// import { createDonation, createPublication } from '../services/publi.services'; // <-- Descomentar cuando el servicio esté listo

// Definimos los tipos para el estado y el tipo de publicación
type PostType = 'Donación' | 'Trueque';
type PostPriority = 'low' | 'medium' | 'high';

export default function PublishScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const styles = useMemo(() => createStyles(theme), [theme]);

  // --- Estados del Formulario Base ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]); // Almacena URIs de las imágenes
  const [postType, setPostType] = useState<PostType>('Donación');

  // --- Nuevos Estados (Solo para Donación) ---
  const [priority, setPriority] = useState<PostPriority>('medium');
  const [targetQuantity, setTargetQuantity] = useState('1'); // Usar string para TextInput
  const [acceptedItems, setAcceptedItems] = useState(''); // Se convertirán en array
  const [restrictions, setRestrictions] = useState('');
  const [deadline, setDeadline] = useState(''); // Formato YYYY-MM-DD

  // --- Lógica de Imágenes (Original de RN) ---
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

  // --- Lógica de Publicación (Actualizada) ---
  const handleSubmit = async () => {
    // Validación base
    if (images.length === 0) {
      Alert.alert('Error', 'Debes subir al menos 1 imagen.');
      return;
    }
    if (!title || !description) {
      Alert.alert('Error', 'El título y la descripción son obligatorios.');
      return;
    }

    // --- Preparar datos y validar según el tipo ---
    if (postType === 'Donación') {
      // Validación de campos de donación
      if (!targetQuantity || !acceptedItems || !deadline) {
        Alert.alert('Error', 'Para donaciones, la cantidad, artículos aceptados y fecha límite son obligatorios.');
        return;
      }

      // Convertir estados a los tipos requeridos por el backend
      const donationData = {
        title,
        description,
        priority,
        targetQuantity: parseInt(targetQuantity, 10), // Convertir a número
        acceptedItems: acceptedItems.split(',').map(item => item.trim()), // Convertir string a array
        restrictions: restrictions || 'ninguna', // Opcional
        deadline,
        // --- ADVERTENCIA: FALTAN DATOS ---
        // El servicio createDonation también requiere:
        // - category
        // - location (latitude, longitude, address)
        // - tags
        // Estos campos deben agregarse al formulario para que la API funcione.
      };

      console.log('Publicando Donación...', donationData);
      
      // try {
      //   // NOTA: Esta llamada fallará hasta que se agreguen 'category', 'location' y 'tags' al formulario.
      //   // const response = await createDonation(donationData, images);
      //   // Alert.alert('Éxito', 'Donación publicada correctamente.');
      //   Alert.alert('Éxito (Maqueta)', 'Donación lista para publicar. Revisa la consola para ver los datos.');
      // } catch (error) {
      //   console.error(error);
      //   Alert.alert('Error', 'No se pudo publicar la donación.');
      // }
       Alert.alert('Éxito (Maqueta)', `Donación lista. Datos: ${JSON.stringify(donationData)}`);


    } else { // Si es Trueque
      const publicationData = {
        title,
        description,
        type: 'trade', // O el tipo que espere tu backend para trueque
        // --- ADVERTENCIA: FALTAN DATOS ---
        // El servicio createPublication también requiere:
        // - category
        // - condition
        // - quantity
        // - availability
        // - pickupRequirements
        // - location
        // - tags
      };

      console.log('Publicando Trueque...', publicationData);
      
      // try {
      //   // NOTA: Esta llamada fallará hasta que se agreguen los campos faltantes.
      //   // const response = await createPublication(publicationData, images);
      //   // Alert.alert('Éxito', 'Trueque publicado correctamente.');
      //   Alert.alert('Éxito (Maqueta)', 'Trueque listo para publicar. Revisa la consola para ver los datos.');
      // } catch (error) {
      //   console.error(error);
      //   Alert.alert('Error', 'No se pudo publicar el trueque.');
      // }
      Alert.alert('Éxito (Maqueta)', `Trueque listo. Datos: ${JSON.stringify(publicationData)}`);
    }
  };

  // --- Componente de campos de donación (RN) ---
  const renderDonationFields = () => (
    <>
      {/* Prioridad */}
      <Text style={styles.label}>Prioridad</Text>
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentButton, priority === 'low' && styles.segmentButtonActive]}
          onPress={() => setPriority('low')}>
          <Text style={[styles.segmentText, priority === 'low' && styles.segmentTextActive]}>Baja</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentButton, priority === 'medium' && styles.segmentButtonActive]}
          onPress={() => setPriority('medium')}>
          <Text style={[styles.segmentText, priority === 'medium' && styles.segmentTextActive]}>Media</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentButton, priority === 'high' && styles.segmentButtonActive]}
          onPress={() => setPriority('high')}>
          <Text style={[styles.segmentText, priority === 'high' && styles.segmentTextActive]}>Alta</Text>
        </TouchableOpacity>
      </View>

      {/* Cantidad Requerida */}
      <Text style={styles.label}>Cantidad Requerida</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 5"
        placeholderTextColor={theme.text}
        value={targetQuantity}
        onChangeText={setTargetQuantity}
        keyboardType="number-pad"
      />

      {/* Artículos Aceptados */}
      <Text style={styles.label}>Artículos Aceptados (separados por coma)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Ropa de invierno, juguetes, comida no perecedera"
        placeholderTextColor={theme.text}
        value={acceptedItems}
        onChangeText={setAcceptedItems}
      />

      {/* Restricciones */}
      <Text style={styles.label}>Restricciones (Opcional)</Text>
      <TextInput
        style={styles.inputMultiline}
        placeholder="Ej: Solo ropa de adulto, no se aceptan vidrios"
        placeholderTextColor={theme.text}
        value={restrictions}
        onChangeText={setRestrictions}
        multiline
        numberOfLines={3}
      />

      {/* Fecha Límite */}
      <Text style={styles.label}>Fecha Límite (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 2025-12-31"
        placeholderTextColor={theme.text}
        value={deadline}
        onChangeText={setDeadline}
        // Para una mejor UX, aquí se debería usar un DatePicker
        // como @react-native-community/datetimepicker
      />
    </>
  );

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
          placeholderTextColor={theme.text}
          value={title}
          onChangeText={setTitle}
        />

        {/* Descripción */}
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={styles.inputMultiline}
          placeholder="Describe tu artículo, detalles, condiciones, etc."
          placeholderTextColor={theme.text}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        {/* Selector de Imágenes */}
        <Text style={styles.label}>Imágenes ({images.length} / 5)</Text>
        <View style={styles.imagePickerContainer}>
          <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
            <FontAwesome name="camera" size={24} color={theme.primary} />
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
                <FontAwesome name="times-circle" size={24} color={theme.error} />
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

        {/* --- AQUI SE MUESTRAN LOS CAMPOS NUEVOS --- */}
        {postType === 'Donación' && renderDonationFields()}
        
        {/* Botón de Publicar */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Publicar Artículo</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- Estilos dinámicos (Sin cambios, son los originales) ---
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
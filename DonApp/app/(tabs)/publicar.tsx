import { Colors } from '@/constants/theme';
import { createDonation, createPublication } from '@/services/user/publi.services';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PostType = 'Donación' | 'Trueque';
type PostPriority = 'low' | 'medium' | 'high';

export default function PublishScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // --- CORRECCIÓN 1: Variable renombrada correctamente a 'images' ---
  const [images, setImages] = useState<string[]>([]);
  const [postType, setPostType] = useState<PostType>('Donación');

  const [priority, setPriority] = useState<PostPriority>('medium');
  const [targetQuantity, setTargetQuantity] = useState('1');
  const [acceptedItems, setAcceptedItems] = useState('');
  const [restrictions, setRestrictions] = useState('');
  const [deadline, setDeadline] = useState('');

  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Límite alcanzado', 'Solo puedes subir un máximo de 5 imágenes.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
    });

    if (!result.canceled && result.assets?.length) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (uri: string) => {
    setImages(images.filter(img => img !== uri));
  };

  const handleSubmit = async () => {
    if (!title || !description) {
      Alert.alert("Error", "El título y la descripción son obligatorios.");
      return;
    }

    if (images.length === 0) {
      Alert.alert("Error", "Debes subir al menos 1 imagen.");
      return;
    }

    try {
      if (postType === "Donación") {
        
        const donationData = {
          title,
          description,
          type: "donation_offer",
          priority,
          targetQuantity: parseInt(targetQuantity, 10),
          acceptedItems: acceptedItems.split(',').map(item => item.trim()),
          restrictions: restrictions || "Ninguna",
          deadline,
          category: "other",
          condition: "good",
          quantity: parseInt(targetQuantity, 10),
          availability: "available",
          pickupRequirements: "Ninguna",
          tags: ["donación"],
          location: {
            latitude: 19.4326,
            longitude: -99.1332,
            address: "Ubicación no especificada",
          }
        };
        
        console.log("--- ENVIANDO DONACIÓN ---");
        console.log(JSON.stringify(donationData, null, 2));

        await createDonation(donationData, images);
        Alert.alert("Éxito", "Donación publicada correctamente.");
        
      } else {
        
        const publicationData = {
          title,
          description,
          // --- CORRECCIÓN 2: Usar 'trade_offer' para coincidir con la API ---
          type: "trade_offer", 
          category: "other",
          quantity: 1,
          availability: "available",
          pickupRequirements: "ninguno",
          location: {
            latitude: 19.4326,
            longitude: -99.1332,
            address: "Ubicación no especificada",
          },
          tags: ["trueque"],
          condition: "good", 
          seekingItems: ["ropa", "libros", "juguetes"], // Puedes conectar esto a un input si quieres
        };

        console.log("--- ENVIANDO TRUEQUE ---");
        console.log(JSON.stringify(publicationData, null, 2));
        
        await createPublication(publicationData, images);
        Alert.alert("Éxito", "Trueque publicado correctamente.");
      }

      // Limpiar campos
      setTitle('');
      setDescription('');
      setImages([]);
      setTargetQuantity('1');
      setAcceptedItems('');
      setRestrictions('');
      setDeadline('');
      setPriority('medium');

    } catch (error: any) {
      console.log("❌ Error en createPublication:", error);
      // Agregamos el log detallado por si vuelve a fallar la validación
      if (error.response?.data) {
        console.log("⚠️ DETALLE ERROR:", JSON.stringify(error.response.data, null, 2));
      }
      Alert.alert("Error", "No se pudo publicar el artículo.");
    }
  };

  const renderDonationFields = () => (
    <>
      <Text style={styles.label}>Prioridad</Text>
      <View style={styles.segmentContainer}>
        <TouchableOpacity style={[styles.segmentButton, priority === 'low' && styles.segmentButtonActive]}
          onPress={() => setPriority('low')}>
          <Text style={[styles.segmentText, priority === 'low' && styles.segmentTextActive]}>Baja</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.segmentButton, priority === 'medium' && styles.segmentButtonActive]}
          onPress={() => setPriority('medium')}>
          <Text style={[styles.segmentText, priority === 'medium' && styles.segmentTextActive]}>Media</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.segmentButton, priority === 'high' && styles.segmentButtonActive]}
          onPress={() => setPriority('high')}>
          <Text style={[styles.segmentText, priority === 'high' && styles.segmentTextActive]}>Alta</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Cantidad Requerida</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 5"
        placeholderTextColor={theme.text}
        value={targetQuantity}
        onChangeText={setTargetQuantity}
        keyboardType="number-pad"
      />

      <Text style={styles.label}>Artículos Aceptados (separados por coma)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Ropa de invierno, juguetes"
        placeholderTextColor={theme.text}
        value={acceptedItems}
        onChangeText={setAcceptedItems}
      />

      <Text style={styles.label}>Restricciones (Opcional)</Text>
      <TextInput
        style={styles.inputMultiline}
        placeholder="Ej: Solo ropa de adulto, no vidrio"
        placeholderTextColor={theme.text}
        value={restrictions}
        onChangeText={setRestrictions}
        multiline
      />

      <Text style={styles.label}>Fecha Límite (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 2025-12-31"
        placeholderTextColor={theme.text}
        value={deadline}
        onChangeText={setDeadline}
      />
    </>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.header, { color: theme.text }]}>Publicar</Text>

        <Text style={styles.label}>Título</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Silla de oficina en buen estado"
          placeholderTextColor={theme.text}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={styles.inputMultiline}
          placeholder="Describe tu artículo"
          placeholderTextColor={theme.text}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={styles.label}>Imágenes ({images.length} / 5)</Text>
        <View style={styles.imagePickerContainer}>
          <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
            <FontAwesome name="camera" size={24} color={theme.primary} />
            <Text style={styles.imagePickerText}>Añadir Foto</Text>
          </TouchableOpacity>
        </View>

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

        {postType === 'Donación' && renderDonationFields()}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Publicar Artículo</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
// --- Estilos (sin cambios) ---
const createStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      marginTop: -20
    },
    scrollContainer: {
      padding: 16,
    },
    header: {
      fontSize: 30,
      fontWeight: 'bold',
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
      color: theme.text,
      marginBottom: 8,
      marginTop: 16,
    },
    input: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 15,
      color: theme.text,
    },
    inputMultiline: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 15,
      height: 100,
      textAlignVertical: 'top',
      color: theme.text,
    },
    imagePickerContainer: { alignItems: 'center', marginBottom: 10 },
    imagePickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.primary,
      padding: 12,
      borderRadius: 8,
    },
    imagePickerText: {
      marginLeft: 10,
      fontSize: 16,
      color: theme.primary,
      fontWeight: 'bold',
    },
    imagePreviewList: { marginBottom: 10 },
    imagePreviewContainer: { position: 'relative', marginRight: 10 },
    imagePreview: {
      width: 100,
      height: 100,
      borderRadius: 8,
      backgroundColor: theme.border,
    },
    removeImageButton: {
      position: 'absolute',
      top: -5,
      right: -5,
      backgroundColor: theme.card,
      borderRadius: 12,
    },
    segmentContainer: {
      flexDirection: 'row',
      width: '100%',
      backgroundColor: theme.border,
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
      backgroundColor: theme.primary,
    },
    segmentText: {
      fontSize: 15,
      color: theme.text,
      fontWeight: '600',
      opacity: 0.7,
    },
    segmentTextActive: {
      color: theme.background,
      opacity: 1,
    },
    submitButton: {
      backgroundColor: theme.success,
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
      marginTop: 32,
      marginBottom: 16,
    },
    submitButtonText: {
      color: theme.card,
      fontSize: 18,
      fontWeight: 'bold',
    },
  });
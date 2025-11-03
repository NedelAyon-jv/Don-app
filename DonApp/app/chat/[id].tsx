import { Colors } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- SIMULACIÓN DE DATOS ---
const MOCK_MESSAGES: { [key: string]: any[] } = {
  '1': [ // Simula el chat del Artículo 1
    { id: 'm1', text: '¡Hola! Todavía te interesa la silla de oficina?', sender: 'other' },
    { id: 'm2', text: 'Hola, sí! Aún está disponible?', sender: 'me' },
    { id: 'm3', text: 'Sip, sin problema. ¿Puedes pasar por ella hoy?', sender: 'other' },
  ],
  '3': [ // Simula el chat del Artículo 3
    { id: 'm4', text: 'Hola, vi tu donación de despensa. ¿Dónde podría recogerla?', sender: 'me' },
  ],
};
const MOCK_USERS: { [key: string]: string } = {
  '1': 'Carlos Adrian',
  '3': 'Nedel Enrique',
};
// ------------------------------

export default function ChatScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation();

  // 1. Obtener el ID del chat de la URL
  const { id } = useLocalSearchParams();
  const chatPartnerName = MOCK_USERS[id as string] || 'Chat';

  // 2. Cargar mensajes (simulado)
  const [messages, setMessages] = useState(MOCK_MESSAGES[id as string] || []);
  const [newMessage, setNewMessage] = useState('');

  // 3. Actualizar el título del header con el nombre del usuario
  useEffect(() => {
    navigation.setOptions({ title: chatPartnerName });
  }, [navigation, chatPartnerName]);

  const handleSend = () => {
    if (newMessage.trim() === '') return;
    const newMsg = {
      id: `m${Math.random()}`,
      text: newMessage,
      sender: 'me',
    };
    setMessages((prevMessages) => [...prevMessages, newMsg]);
    setNewMessage('');
  };

  // Renderiza cada burbuja de chat
  const renderMessage = ({ item }: { item: { text: string; sender: string } }) => {
    const isMyMessage = item.sender === 'me';
    return (
      <View
        style={[
          styles.messageRow,
          isMyMessage ? styles.myMessageRow : styles.otherMessageRow,
        ]}>
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
          ]}>
          <Text style={isMyMessage ? styles.myMessageText : styles.otherMessageText}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // Ajusta esto si el header es de altura diferente
      >
        {/* Lista de Mensajes */}
        <FlatList
          style={styles.messageList}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          inverted // Empieza desde abajo
        />

        {/* Caja de Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={theme.text}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <MaterialIcons name="send" size={24} color={theme.card} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- Estilos ---
const createStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      flex: 1,
    },
    messageList: {
      flex: 1,
      paddingHorizontal: 10,
    },
    // --- Estilos de Burbujas ---
    messageRow: {
      flexDirection: 'row',
      marginVertical: 4,
    },
    myMessageRow: {
      justifyContent: 'flex-end',
    },
    otherMessageRow: {
      justifyContent: 'flex-start',
    },
    messageBubble: {
      padding: 12,
      borderRadius: 18,
      maxWidth: '75%',
    },
    myMessageBubble: {
      backgroundColor: theme.primary, // Mi burbuja (verde)
    },
    otherMessageBubble: {
      backgroundColor: theme.card, // Burbuja del otro (blanco/gris)
      borderWidth: 1,
      borderColor: theme.border,
    },
    myMessageText: {
      color: theme.card, // Texto blanco
      fontSize: 16,
    },
    otherMessageText: {
      color: theme.text, // Texto oscuro
      fontSize: 16,
    },
    // --- Caja de Input ---
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      backgroundColor: theme.card,
    },
    input: {
      flex: 1,
      backgroundColor: theme.background,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingVertical: 10,
      fontSize: 16,
      color: theme.text,
      maxHeight: 100, // Límite para el multiline
    },
    sendButton: {
      marginLeft: 10,
      backgroundColor: theme.primary,
      borderRadius: 25,
      width: 50,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router'; // <-- 1. IMPORTAR ROUTER
import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Datos estáticos (Asegúrate que los IDs coincidan con los de MOCK_DATA)
const chatConversations = [
  {
    id: '1', // Coincide con el 'id' del artículo de Carlos
    userName: 'Carlos Adrian',
    lastMessage: '¡Hola! Todavía te interesa la silla de oficina?',
    timestamp: '10:30 AM',
    avatarUrl: 'https://placehold.co/100x100/FFFBDE/4E342E?text=CA',
  },
  {
    id: '3', // Coincide con el 'id' del artículo de Nedel
    userName: 'Nedel Enrique',
    lastMessage: 'Gracias por la donación, que tengas buen día.',
    timestamp: '23/Oct',
    avatarUrl: 'https://placehold.co/100x100/FFFBDE/4E342E?text=NE',
  },
];

// 1. Define la "interface" para los props del item
interface ChatItemProps {
  userName: string;
  lastMessage: string;
  timestamp: string;
  avatarUrl: string;
  onPress: () => void;
  theme: typeof Colors.light;
}

// 2. Componente para renderizar cada item de chat
const ChatItem: React.FC<ChatItemProps> = ({ userName, lastMessage, timestamp, avatarUrl, onPress, theme }) => (
  <TouchableOpacity 
    style={[styles.chatCard, { backgroundColor: theme.card, borderBottomColor: theme.border }]} 
    onPress={onPress} // <-- El onPress se recibe aquí
  >
    <Image 
      source={{ uri: avatarUrl }} 
      style={[styles.avatar, { backgroundColor: theme.border }]} 
    />
    <View style={styles.chatContent}>
      <Text style={[styles.userName, { color: theme.text }]}>{userName}</Text>
      <Text style={[styles.lastMessage, { color: theme.text }]} numberOfLines={1}>{lastMessage}</Text>
    </View>
    <Text style={[styles.timestamp, { color: theme.text }]}>{timestamp}</Text>
  </TouchableOpacity>
);

export default function ChatsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const router = useRouter(); // <-- 2. INICIALIZAR ROUTER

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={chatConversations}
        renderItem={({ item }) => (
          <ChatItem
            {...item}
            theme={theme}
            // --- 3. AQUÍ ESTÁ LA MODIFICACIÓN ---
            // Cambiamos el console.log por la navegación real
            onPress={() => router.push(`/chat/${item.id}`)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

// 9. Estilos (sin cambios)
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingTop: 8,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  chatContent: {
    flex: 1,
    marginRight: 10,
  },
  userName: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  lastMessage: {
    fontSize: 15,
    marginTop: 2,
    opacity: 0.8,
  },
  timestamp: {
    fontSize: 13,
    alignSelf: 'flex-start',
    paddingTop: 2,
    opacity: 0.8,
  },
});


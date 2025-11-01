import { Colors } from '@/constants/theme'; // <-- 1. Importar Colores
import React from 'react'; // Asegúrate de importar React
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme, // <-- 2. Importar useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Datos estáticos de los chats (maquetado)
const chatConversations = [
  {
    id: '1',
    userName: 'Carlos Adrian',
    lastMessage: '¡Hola! Todavía te interesa la silla de oficina?',
    timestamp: '10:30 AM',
    avatarUrl: 'https://via.placeholder.com/100?text=CA',
  },
  {
    id: '2',
    userName: 'Nedel Enrique',
    lastMessage: 'Perfecto, ¿nos vemos a las 5 en el centro?',
    timestamp: 'Ayer',
    avatarUrl: 'https://via.placeholder.com/100?text=NE',
  },
  {
    id: '3',
    userName: 'Jose Eduardo',
    lastMessage: 'Gracias por la donación, que tengas buen día.',
    timestamp: '23/Oct',
    avatarUrl: 'https://via.placeholder.com/100?text=JE',
  },
];

// 1. Define la "interface" para los props del item
interface ChatItemProps {
  userName: string;
  lastMessage: string;
  timestamp: string;
  avatarUrl: string;
  onPress: () => void;
  theme: typeof Colors.light; // <-- 3. AÑADIMOS EL TEMA A LOS PROPS
}

// 2. Componente para renderizar cada item de chat
const ChatItem: React.FC<ChatItemProps> = ({ userName, lastMessage, timestamp, avatarUrl, onPress, theme }) => (
  // 4. Aplicamos colores del tema a la tarjeta
  <TouchableOpacity 
    style={[styles.chatCard, { backgroundColor: theme.card, borderBottomColor: theme.border }]} 
    onPress={onPress}
  >
    <Image 
      source={{ uri: avatarUrl }} 
      style={[styles.avatar, { backgroundColor: theme.border }]} // <-- Color de fondo de tema
    />
    <View style={styles.chatContent}>
      {/* 5. Aplicamos color de texto del tema */}
      <Text style={[styles.userName, { color: theme.text }]}>{userName}</Text>
      <Text style={[styles.lastMessage, { color: theme.text }]} numberOfLines={1}>{lastMessage}</Text>
    </View>
    <Text style={[styles.timestamp, { color: theme.text }]}>{timestamp}</Text>
  </TouchableOpacity>
);

export default function ChatsScreen() {
  // 6. Obtenemos el tema
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    // 7. Aplicamos el color de fondo principal
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={chatConversations}
        renderItem={({ item }) => (
          <ChatItem
            {...item}
            theme={theme} // <-- 8. Pasamos el tema a cada item
            onPress={() => {
              // Aquí irá la lógica para navegar a la pantalla de chat individual
              console.log('Abriendo chat con:', item.userName);
            }}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

// 9. Limpiamos los colores fijos del StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#f9f9f9', // <-- Quitado
  },
  listContainer: {
    paddingTop: 8,
  },
  chatCard: {
    // backgroundColor: '#fff', // <-- Quitado
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    // borderBottomColor: '#eee', // <-- Quitado
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  chatContent: {
    flex: 1, // Ocupa el espacio disponible
    marginRight: 10,
  },
  userName: {
    fontSize: 17,
    fontWeight: 'bold',
    // color: '#333', // <-- Quitado
  },
  lastMessage: {
    fontSize: 15,
    // color: 'gray', // <-- Quitado
    marginTop: 2,
    opacity: 0.8, // <-- Añadido para jerarquía
  },
  timestamp: {
    fontSize: 13,
    // color: 'gray', // <-- Quitado
    alignSelf: 'flex-start', // Se alinea arriba
    paddingTop: 2,
    opacity: 0.8, // <-- Añadido para jerarquía
  },
});

import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
}

// 2. Componente para renderizar cada item de chat
const ChatItem: React.FC<ChatItemProps> = ({ userName, lastMessage, timestamp, avatarUrl, onPress }) => (
  <TouchableOpacity style={styles.chatCard} onPress={onPress}>
    <Image source={{ uri: avatarUrl }} style={styles.avatar} />
    <View style={styles.chatContent}>
      <Text style={styles.userName}>{userName}</Text>
      <Text style={styles.lastMessage} numberOfLines={1}>{lastMessage}</Text>
    </View>
    <Text style={styles.timestamp}>{timestamp}</Text>
  </TouchableOpacity>
);

export default function ChatsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={chatConversations}
        renderItem={({ item }) => (
          <ChatItem
            {...item}
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

// Estilos para la pantalla de chats
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9', // Un fondo ligeramente diferente
  },
  listContainer: {
    paddingTop: 8,
  },
  chatCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
    color: '#333',
  },
  lastMessage: {
    fontSize: 15,
    color: 'gray',
    marginTop: 2,
  },
  timestamp: {
    fontSize: 13,
    color: 'gray',
    alignSelf: 'flex-start', // Se alinea arriba
    paddingTop: 2,
  },
});
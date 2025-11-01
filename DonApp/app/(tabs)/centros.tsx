import { Colors } from '@/constants/theme'; // Importa tus colores
import { FontAwesome } from '@expo/vector-icons';
import React from 'react'; // Asegúrate de importar React
import { FlatList, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Datos estáticos de los centros de donación
const donationCenters = [
  {
    id: '1',
    name: 'Centro Comunitario Camino Real',
    colonia: 'Camino Real',
    status: 'Abierto',
    horario: 'L-V 9:00 AM - 5:00 PM',
  },
  {
    id: '2',
    name: 'Punto de Acopio Santa Fe',
    colonia: 'Santa Fe',
    status: 'Cerrado',
    horario: 'S 10:00 AM - 2:00 PM',
  },
  {
    id: '3',
    name: 'Oficina Central DonApp (Centro)',
    colonia: 'Centro',
    status: 'Abierto',
    horario: 'L-S 8:00 AM - 6:00 PM',
  },
  {
    id: '4',
    name: 'Bodega Solidaria Indeco',
    colonia: 'Indeco',
    status: 'Abierto',
    horario: 'L-V 10:00 AM - 4:00 PM',
  },
];


// 1. Define un "interface" para los props
interface CenterItemProps {
  name: string;
  colonia: string;
  status: string;
  horario: string;
  theme: typeof Colors.light; // <-- 1. AÑADIMOS EL TEMA A LOS PROPS
}

// 2. Aplica el tipo a tus props y recibe 'theme'
const CenterItem: React.FC<CenterItemProps> = ({ name, colonia, status, horario, theme }) => (
  // 3. Aplicamos los colores del tema a la tarjeta
  <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
    <View style={styles.iconContainer}>
      {/* 4. Usamos el color primario del tema */}
      <FontAwesome name="building" size={24} color={theme.primary} />
    </View>
    <View style={styles.cardContent}>
      {/* 5. Usamos el color de texto del tema */}
      <Text style={[styles.cardTitle, { color: theme.text }]}>{name}</Text>
      <Text style={[styles.cardColonia, { color: theme.text }]}>{colonia}</Text>
      <Text style={[styles.cardHours, { color: theme.text }]}>{horario}</Text>
    </View>
    <View style={styles.statusContainer}>
      <Text style={[
        styles.statusText,
        // Los colores de estado (Abierto/Cerrado) son funcionales,
        // así que está bien dejarlos como están.
        status === 'Abierto' ? styles.statusOpen : styles.statusClosed
      ]}>
        {status}
      </Text>
    </View>
  </View>
);


export default function DonationCentersScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    // 6. Aplicamos el color de fondo principal
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={donationCenters}
        renderItem={({ item }) => (
          // 7. Pasamos el tema como prop a cada item
          <CenterItem {...item} theme={theme} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

// 8. Limpiamos los colores fijos del StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#f4f4f8', // <-- Quitado
  },
  listContainer: {
    padding: 16,
  },
  card: {
    // backgroundColor: '#fff', // <-- Quitado
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1, // <-- Añadido para consistencia
  },
  iconContainer: {
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    // color: '#333', // <-- Quitado
  },
  cardColonia: {
    fontSize: 15,
    // color: 'gray', // <-- Quitado
    marginTop: 2,
    opacity: 0.8, // <-- Añadido para jerarquía
  },
  cardHours: {
    fontSize: 14,
    // color: '#555', // <-- Quitado
    marginTop: 4,
    opacity: 0.9, // <-- Añadido para jerarquía
  },
  statusContainer: {
    marginLeft: 10,
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  // Estilos funcionales (verde/rojo) - se quedan
  statusOpen: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  statusClosed: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
});

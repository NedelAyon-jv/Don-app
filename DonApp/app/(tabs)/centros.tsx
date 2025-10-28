import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
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

// ============== INICIO DE LA CORRECCIÓN ==============

// 1. Define un "interface" para los props
interface CenterItemProps {
  name: string;
  colonia: string;
  status: string; // O 'Abierto' | 'Cerrado' para ser más estricto
  horario: string;
}

// 2. Aplica el tipo a tus props
//    Asegúrate de importar 'React'
const CenterItem: React.FC<CenterItemProps> = ({ name, colonia, status, horario }) => (
  <View style={styles.card}>
    <View style={styles.iconContainer}>
      <FontAwesome name="building" size={24} color="#007bff" />
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{name}</Text>
      <Text style={styles.cardColonia}>{colonia}</Text>
      <Text style={styles.cardHours}>{horario}</Text>
    </View>
    <View style={styles.statusContainer}>
      <Text style={[
        styles.statusText,
        status === 'Abierto' ? styles.statusOpen : styles.statusClosed
      ]}>
        {status}
      </Text>
    </View>
  </View>
);

// ============== FIN DE LA CORRECCIÓN ==============

export default function DonationCentersScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={donationCenters}
        // TypeScript ahora sabe qué 'item' contiene y no hay error
        renderItem={({ item }) => <CenterItem {...item} />} 
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

// ... (El resto de tus estilos)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f8',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
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
    color: '#333',
  },
  cardColonia: {
    fontSize: 15,
    color: 'gray',
    marginTop: 2,
  },
  cardHours: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
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
  statusOpen: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  statusClosed: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
});
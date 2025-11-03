import { Colors } from '@/constants/theme';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
// --- 1. IMPORTAR COMPONENTES DE MAPS ---
import MapView, { Callout, Marker } from 'react-native-maps';

// --- 2. DATOS CON COORDENADAS ---
// (Añadí 'coordinate' a cada centro)
const donationCenters = [
  {
    id: '1',
    name: 'Centro Comunitario Camino Real',
    colonia: 'Camino Real',
    status: 'Abierto',
    horario: 'L-V 9:00 AM - 5:00 PM',
    coordinate: { latitude: 24.118, longitude: -110.325 },
  },
  {
    id: '2',
    name: 'Punto de Acopio Santa Fe',
    colonia: 'Santa Fe',
    status: 'Cerrado',
    horario: 'S 10:00 AM - 2:00 PM',
    coordinate: { latitude: 24.110, longitude: -110.334 },
  },
  {
    id: '3',
    name: 'Oficina Central DonApp (Centro)',
    colonia: 'Centro',
    status: 'Abierto',
    horario: 'L-S 8:00 AM - 6:00 PM',
    coordinate: { latitude: 24.163, longitude: -110.316 },
  },
  {
    id: '4',
    name: 'Bodega Solidaria Indeco',
    colonia: 'Indeco',
    status: 'Abierto',
    horario: 'L-V 10:00 AM - 4:00 PM',
    coordinate: { latitude: 24.116, longitude: -110.338 },
  },
];

// --- 3. REGIÓN INICIAL (Centrado en La Paz) ---
const laPazRegion = {
  latitude: 24.135,
  longitude: -110.325,
  latitudeDelta: 0.09,
  longitudeDelta: 0.04,
};

export default function DonationCentersScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    // 4. ELIMINAMOS SafeAreaView y FlatList
    // El mapa necesita un View simple con flex: 1
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={laPazRegion}
      >
        {/* 5. Mapeamos los centros como "Marcadores" (Pins) */}
        {donationCenters.map((center) => (
          <Marker
            key={center.id}
            coordinate={center.coordinate}
            title={center.name}
            description={center.colonia}
            pinColor={theme.primary} // Usamos tu color primario para el pin
          >
            {/* 6. CALLOUT: La "burbuja" que sale al hacer clic */}
            <Callout>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{center.name}</Text>
                <Text style={styles.calloutText}>{center.horario}</Text>
                <Text style={[
                  styles.statusText,
                  center.status === 'Abierto' ? styles.statusOpen : styles.statusClosed
                ]}>
                  {center.status}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

// 7. ESTILOS ACTUALIZADOS
const createStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    // El mapa DEBE tener este estilo para llenar la pantalla
    map: {
      ...StyleSheet.absoluteFillObject,
    },
    // --- Estilos para la burbuja (Callout) ---
    calloutContainer: {
      width: 220, // Ancho de la burbuja
      padding: 5,
    },
    calloutTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 4,
    },
    calloutText: {
      fontSize: 14,
      color: theme.text,
      opacity: 0.8,
      marginBottom: 6,
    },
    statusText: {
      fontSize: 14,
      fontWeight: 'bold',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      overflow: 'hidden',
      textAlign: 'center',
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


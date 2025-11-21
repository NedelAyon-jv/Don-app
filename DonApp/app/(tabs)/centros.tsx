import { Colors } from '@/constants/theme';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
// --- 1. IMPORTAR COMPONENTES DE MAPS ---
import MapView, { Callout, Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- 2. DATOS CON COORDENADAS ---
// (Añadí 'coordinate' a cada centro)
const donationCenters = [
  {
    id: '1',
    name: 'Centro Donaciones Camino Real',
    colonia: 'Camino Real',
    status: 'Abierto',
    horario: 'L-V 9:00 AM - 5:00 PM',
    coordinate: { latitude: 24.05644711189269, longitude: -110.29847197234919 },
  },
  {
    id: '2',
    name: 'Centro Donaciones Santa Fe',
    colonia: 'Santa Fe',
    status: 'Cerrado',
    horario: 'S 10:00 AM - 2:00 PM',
    coordinate: { latitude: 24.092945449503386, longitude: -110.32447867009112 },
  },
  {
    id: '3',
    name: 'Centro Donaciones Centro',
    colonia: 'Centro',
    status: 'Abierto',
    horario: 'L-S 8:00 AM - 6:00 PM',
    coordinate: { latitude: 24.152421525195038, longitude: -110.3122907112721 },
  },
  {
    id: '4',
    name: 'Centro Donaciones Indeco',
    colonia: 'Indeco',
    status: 'Abierto',
    horario: 'L-V 10:00 AM - 4:00 PM',
    coordinate: { latitude: 24.122461728767377, longitude: -110.32482199170396 },
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>Centros de Donaciones</Text>
        <MapView
          style={styles.map}
          initialRegion={laPazRegion}
        >
          {/* 5. Mapeamos los centros como "Marcadores" (Pins) */}
          {donationCenters.map((center) => (
            // ... (dentro de tu return)
            <Marker
              key={center.id}
              coordinate={center.coordinate}
              title={center.name}
              description={center.colonia}
              pinColor={theme.primary}
            >
              {/* 6. CALLOUT: La "burbuja" que sale al hacer clic */}

              {/* --- ✨ ¡AÑADE ESTO! --- */}
              <Callout tooltip={true}>
                {/* --------------------- */}

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

    </SafeAreaView>
  );
}

// 7. ESTILOS ACTUALIZADOS
// 7. ESTILOS ACTUALIZADOS
const createStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      marginBottom: -10
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      margin: 10,
      // padding: 10,
      marginTop: -45,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      // paddingHorizontal: 10,
      // paddingVertical: 1,
      textAlign: 'center'
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },

    calloutContainer: {
      width: 220,
      padding: 15,

      // --- ✨ ESTA ES LA CORRECCIÓN MEJORADA ---
      // Le damos el color de 'card' del tema.
      backgroundColor: theme.card,

      // --- ✨ MEJORA ADICIONAL ---
      // Añadimos borderRadius para que tu View se vea
      // bien dentro de la burbuja nativa redondeada.
      borderRadius: 8,
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

    // --- Estilos de Status (Ahora leen del tema) ---
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
      // ✨ ¡ACTUALIZADO!
      backgroundColor: theme.successBg,
      color: theme.successText,
    },
    statusClosed: {
      // ✨ ¡ACTUALIZADO!
      backgroundColor: theme.errorBg,
      color: theme.errorText,
    },
  });


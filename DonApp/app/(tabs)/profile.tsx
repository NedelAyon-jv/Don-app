import { Colors } from '@/constants/theme';
import { getCurrentUser, logout } from '@/services/user/auth.services';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // <-- Asegúrate de que esta importación exista
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Interfaz para el usuario
interface User {
  id: string;
  fullname: string;
  username: string;
  email: string;
  phone?: string;
}

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const styles = useMemo(() => createStyles(theme), [theme]); // 'styles' se crea aquí
  const router = useRouter(); 

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      const userData = await getCurrentUser(); 
      if (userData) {
        setUser(userData);
        console.log("✅ Datos de usuario cargados en perfil:", userData);
      } else {
        console.warn("⚠️ No se encontró usuario en AsyncStorage");
      }
    };

    loadUserData();
  }, []); 

  const handleLogout = async () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que deseas cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, cerrar sesión",
          style: "destructive",
          onPress: async () => {
            await logout(); 
            router.replace('/'); 
          }
        }
      ]
    );
  };

  // ==============================================
  // ==== ¡AQUÍ ESTÁ LA CORRECCIÓN! ====
  // Movemos los componentes auxiliares DENTRO de ProfileScreen
  // para que puedan acceder a la variable 'styles'
  // ==============================================

  // Componente auxiliar para filas de información
  // Ya no necesita 'theme' como prop, porque 'styles' ya tiene el tema.
  const InfoRow = ({ icon, text }: { icon: any, text: string }) => (
    <View style={styles.infoRow}> {/* <-- Ahora 'styles' SÍ existe aquí */}
      <MaterialCommunityIcons name={icon} size={22} color={theme.text} style={styles.infoIcon} />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );

  // Componente auxiliar para botones de opción
  // Ya no necesita 'theme' como prop.
  const OptionButton = ({ icon, text, onPress }: { icon: any, text: string, onPress: () => void }) => (
    <TouchableOpacity style={styles.optionButton} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={22} color={theme.text} style={styles.infoIcon} />
      <Text style={styles.infoText}>{text}</Text>
      <MaterialCommunityIcons name="chevron-right" size={22} color={theme.text} />
    </TouchableOpacity>
  );
  // ==============================================
  // ==== FIN DE LA CORRECCIÓN ====
  // ==============================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <View style={styles.container}>
          
          {/* --- Cabecera del Perfil --- */}
          <View style={styles.header}>
            <Image
              source={require('@/assets/images/default-avatar.png')} 
              style={styles.profileImage}
            />
            <Text style={styles.name}>{user?.fullname || 'Nombre de Usuario'}</Text>
            <Text style={styles.username}>{user?.username ? `@${user.username}` : '@usuario'}</Text>
          </View>

          {/* --- Información de Contacto --- */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Información de Contacto</Text>
            
            {/* Ahora solo pasamos las props necesarias */}
            <InfoRow 
              icon="email-outline" 
              text={user?.email || 'email@example.com'} 
            />
            <InfoRow 
              icon="phone-outline" 
              text={user?.phone || 'Sin número de teléfono'} 
            />
          </View>

          {/* --- Opciones --- */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Opciones</Text>
            
            <OptionButton
              icon="account-edit-outline"
              text="Editar Perfil"
              onPress={() => { /* Lógica para editar perfil */ }}
            />
            <OptionButton
              icon="lock-reset"
              text="Cambiar Contraseña"
              onPress={() => { /* Lógica para cambiar contraseña */ }}
            />
            <OptionButton
              icon="cog-outline"
              text="Configuración"
              onPress={() => { /* Lógica para configuración */ }}
            />
          </View>

          {/* --- Botón de Cerrar Sesión --- */}
          {/* Este ya funcionaba porque estaba dentro del return */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={22} color={theme.error} />
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Los estilos se quedan aquí fuera, como estaban
const createStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      flex: 1,
      padding: 20,
    },
    header: {
      alignItems: 'center',
      marginBottom: 30,
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      marginBottom: 15,
      borderWidth: 3,
      borderColor: theme.primary,
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
    },
    username: {
      fontSize: 16,
      color: theme.text,
      opacity: 0.7,
    },
    infoSection: {
      marginBottom: 25,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 15,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
    },
    infoIcon: {
      marginRight: 15,
    },
    infoText: {
      fontSize: 16,
      color: theme.text,
      flex: 1, // Para que el icono de chevron se vaya al final
    },
    optionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.card,
      padding: 15,
      borderRadius: 10,
      marginTop: 20,
    },
    logoutButtonText: {
      fontSize: 16,
      color: theme.error,
      fontWeight: 'bold',
      marginLeft: 10,
    }
  });
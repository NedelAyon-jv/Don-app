import { Colors } from '@/constants/theme'; // Importa tus colores
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // <-- 1. IMPORTAR ROUTER
import React, { useMemo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter(); // <-- 2. INICIALIZAR ROUTER

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // --- VALIDACIÓN DESACTIVADA PARA PRUEBAS DE NAVEGACIÓN ---
    /*
    if (!email || !password) {
      Alert.alert('Campos incompletos', 'Por favor, ingresa correo y contraseña.');
      return;
    }
    console.log('Login con:', email, password);
    */

    // Si es exitoso (o para pruebas), redirige a los tabs
    console.log('Navegando a /Tabs...');
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>

        <View style={styles.content}>
          {/* <FontAwesome name="gift" size={60} color={theme.primary} style={styles.logo} /> */}
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
          />

          <Text style={styles.title}>DonApp</Text>
          <Text style={styles.subtitle}>Inicia sesión</Text>

          {/* ... (Inputs de email y contraseña) ... */}
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="email-outline" size={22} color={theme.text} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor={theme.text}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="lock-outline" size={22} color={theme.text} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor={theme.text}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity>
            <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {/* Botón de Login */}
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          {/* ... (Separador y botones sociales) ... */}
          {/* <Text style={styles.separator}>O inicia sesión con</Text>
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <FontAwesome name="google" size={24} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <FontAwesome name="apple" size={26} color={theme.text} />
            </TouchableOpacity>
          </View> */}
        </View>

        {/* ============================================== */}
        {/* ==== BOTÓN PARA IR A SIGNUP ==== */}
        {/* ============================================== */}
        <TouchableOpacity
          style={styles.signupContainer}
          onPress={() => router.push('/signup')} // <-- Navega a 'signup.tsx'
        >
          <Text style={styles.signupText}>
            ¿No tienes cuenta?{' '}
            <Text style={styles.signupLink}>Regístrate aquí</Text>
          </Text>
        </TouchableOpacity>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// (Todos los estilos... 'createStyles')
const createStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      flex: 1,
      padding: 24,
    },
    content: {
      flex: 2, // <-- Dale más espacio abajo
      justifyContent: 'flex-start', // <-- Alineado arriba
      alignItems: 'center',
    },
    logoContainer: {
      flex: 1.2, // <-- Dale más espacio arriba
      justifyContent: 'center', // Centrado
      alignItems: 'center',
    },
    logo: {
      width: 200,
      height: 200,
      resizeMode: 'contain',
      marginBottom: 20
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 30,
    },
    subtitle: {
      fontSize: 16,
      color: theme.text,
      marginBottom: 30,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 15,
      marginBottom: 15,
      width: '100%',
    },
    inputIcon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      height: 50,
      fontSize: 16,
      color: theme.text,
    },
    forgotPassword: {
      fontSize: 14,
      color: theme.primary,
      alignSelf: 'flex-end',
      marginBottom: 20,
    },
    button: {
      backgroundColor: theme.primary,
      paddingVertical: 15,
      borderRadius: 12,
      alignItems: 'center',
      width: '100%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      top: 25,
    },
    buttonText: {
      color: theme.background, // Usa el color de fondo para el texto
      fontSize: 18,
      fontWeight: 'bold',
    },
    separator: {
      fontSize: 14,
      color: theme.text,
      marginVertical: 25,
    },
    // socialContainer: {
    //   flexDirection: 'row',
    //   justifyContent: 'center',
    //   gap: 20,
    // },
    // socialButton: {
    //   width: 60,
    //   height: 60,
    //   borderRadius: 30,
    //   justifyContent: 'center',
    //   alignItems: 'center',
    //   borderColor: theme.border,
    //   borderWidth: 1,
    // },
    signupContainer: {
      padding: 10,
      alignItems: 'center',
      top: -45,
    },
    signupText: {
      fontSize: 15,
      color: theme.text,
    },
    signupLink: {
      color: theme.primary,
      fontWeight: 'bold',
    },
  });


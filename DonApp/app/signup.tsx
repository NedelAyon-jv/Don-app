import { Colors } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image, // <--- Importar Alert
  KeyboardAvoidingView,
  Platform,
  ScrollView, // <--- Importar ScrollView
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUpScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();

  // --- 1. ESTADOS ACTUALIZADOS ---
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState(''); // Renombrado de 'name'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  // ---------------------------------

  // --- 2. LÓGICA DE REGISTRO ACTUALIZADA ---
  const handleSignUp = () => {
    // Validación de campos vacíos
    if (!username || !fullName || !email || !password || !confirmPassword || !phone) {
      Alert.alert('Campos incompletos', 'Por favor, completa todos los campos.');
      return;
    }
    // Validación de contraseñas
    if (password !== confirmPassword) {
      Alert.alert('Las contraseñas no coinciden', 'Por favor, verifica tu contraseña.');
      return;
    }

    console.log('Registrando a:', { username, fullName: fullName, email, phone });
    // Si es exitoso, redirige a los tabs
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>

        {/* 3. CAMBIADO DE VIEW A SCROLLVIEW para un formulario largo */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* <FontAwesome name="leaf" size={60} color={theme.primary} style={styles.logo} /> */}
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/logo5.png')}
              style={styles.logo}
            />
            <Text style={styles.logoTitle}>DonApp</Text>
          </View>

          <Text style={styles.title}>Registrarse</Text>
          <Text style={styles.subtitle}>Forma parte de la comunidad DonApp.</Text>

          {/* --- 4. NUEVOS INPUTS AÑADIDOS --- */}

          {/* Input Usuario */}
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="at" size={22} color={theme.text} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Usuario (ej: @username)"
              placeholderTextColor={theme.text}
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          {/* Input Nombre(s) */}
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="account-outline" size={22} color={theme.text} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nombre(s)"
              placeholderTextColor={theme.text}
              autoCapitalize="words"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* Input Email */}
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

          {/* Input Contraseña */}
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

          {/* Input Confirmar Contraseña */}
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="lock-check-outline" size={22} color={theme.text} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirmar contraseña"
              placeholderTextColor={theme.text}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          {/* Input Teléfono */}
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="phone-outline" size={22} color={theme.text} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Teléfono (10 dígitos)"
              placeholderTextColor={theme.text}
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          {/* Botón de Registrarse */}
          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Crear Cuenta</Text>
          </TouchableOpacity>
        </ScrollView>
        {/* --- Fin del ScrollView --- */}

        {/* Link a Login */}
        <TouchableOpacity style={styles.footerContainer} onPress={() => router.back()}>
          <Text style={styles.footerText}>
            ¿Ya tienes cuenta?{' '}
            <Text style={styles.footerLink}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// 5. ESTILOS AJUSTADOS PARA SCROLLVIEW
const createStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      flex: 1,
    },
    // Contenedor del Scroll
    scrollContent: {
      padding: 24,
      alignItems: 'center', // Centra el logo, título y subtítulo
    },
    logoContainer: {
      flex: 1.2,
      flexDirection: 'row',    // <--- 1. PONE LOS ITEMS LADO A LADO
      justifyContent: 'center', // 2. CENTRA EL "PAR" (LOGO + TÍTULO)
      alignItems: 'center',     // 3. ALINEA EL LOGO Y EL TÍTULO VERTICALMENTE
      marginBottom: 20,         // 4. AÑADE ESPACIO ABAJO, ANTES DEL FORMULARIO
    },
    logo: {
      width: 55,
      height: 55,
      resizeMode: 'contain',
      marginRight: 10,          // <--- 5. AÑADE ESPACIO ENTRE EL LOGO Y EL TÍTULO
    },
    logoTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.text,
      // (Quitamos el marginBottom de aquí, ya lo tiene el contenedor)
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 10,
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
      marginTop: 20,
    },
    buttonText: {
      color: theme.background,
      fontSize: 18,
      fontWeight: 'bold',
    },
    footerContainer: {
      padding: 10,
      alignItems: 'center',
    },
    footerText: {
      fontSize: 15,
      color: theme.text,
    },
    footerLink: {
      color: theme.primary,
      fontWeight: 'bold',
    },
  });


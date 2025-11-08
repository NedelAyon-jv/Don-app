import { Colors } from '@/constants/theme';
// ==============================================
// ==== 1. IMPORTAR EL SERVICIO DE REGISTRO ====
// ==============================================
import { registerUser } from '@/services/user/auth.services';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

  // --- Estados (Están perfectos como los tenías) ---
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  // ---------------------------------

  // ==============================================
  // ==== 2. LÓGICA DE REGISTRO ACTUALIZADA ====
  // ==============================================
  const handleSignUp = async () => {
    // Validación de campos vacíos (¡Esto está perfecto!)
    if (!username || !fullName || !email || !password || !confirmPassword || !phone) {
      Alert.alert('Campos incompletos', 'Por favor, completa todos los campos.');
      return;
    }
    // Validación de contraseñas (¡Perfecto!)
    if (password !== confirmPassword) {
      Alert.alert('Las contraseñas no coinciden', 'Por favor, verifica tu contraseña.');
      return;
    }

    // --- Inicio de la lógica de API ---
    try {
      // 1. Preparamos los datos para la API
      // Nota: tu estado 'fullName' se mapea a 'fullname' en la API
      const data = {
        username: username,
        fullname: fullName, 
        email: email,
        password: password,
        phone: phone
      };

      console.log('Enviando datos de registro a la API...', data);

      // 2. Llamamos al servicio
      // Recuerda: 'registerUser' ya guarda la sesión (token y user)
      // en AsyncStorage si el registro es exitoso.
      await registerUser(data);

      // 3. Si todo salió bien, mostramos éxito y navegamos
      Alert.alert(
        '¡Bienvenido!',
        'Tu cuenta ha sido creada exitosamente.'
      );
      router.replace('/(tabs)'); // Redirige al home

    } catch (error: any) {
      // 4. Si la API devuelve un error (ej: email ya existe, error 500)
      console.error('❌ Error en handleSignUp (Registro):', error);
      Alert.alert(
        'Error al registrar',
        error.message || 'No se pudo crear la cuenta. Verifica tus datos e intenta de nuevo.'
      );
    }
  };
  // --- Fin de la lógica de API ---

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>

        {/* El resto de tu JSX está perfecto, no necesita cambios */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/logo5.png')}
              style={styles.logo}
            />
            <Text style={styles.logoTitle}>DonApp</Text>
          </View>

          <Text style={styles.title}>Registrarse</Text>
          <Text style={styles.subtitle}>Forma parte de la comunidad DonApp.</Text>

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

// (Tus estilos están perfectos, no se tocan)
const createStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      flex: 1,
    },
    scrollContent: {
      padding: 24,
      alignItems: 'center', 
    },
    logoContainer: {
      flex: 1.2,
      flexDirection: 'row',    
      justifyContent: 'center', 
      alignItems: 'center',     
      marginBottom: 20,         
    },
    logo: {
      width: 55,
      height: 55,
      resizeMode: 'contain',
      marginRight: 10,          
    },
    logoTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.text,
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
import { Colors } from '@/constants/theme';
import { login } from "@/services/user/auth.services";
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

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter(); 

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

 const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert("Campos incompletos", "Ingresa tu email y contraseña");
    return;
  }

  try {
    const res = await login({ email, password });

    if (res.error || !res.token) {
      Alert.alert("Credenciales incorrectas", res.message || "Email o contraseña incorrectos");
      return;
    }

    console.log("TOKEN:", res.token);
    console.log("Usuario:", res.user);

    Alert.alert("Bienvenido", "Inicio de sesión exitoso");

    router.replace("/(tabs)");

  } catch (error: any) {
    console.error("Error en handleLogin:", error);
    Alert.alert("Error", error.message || "Email o contraseña incorrectos");
  }
};


  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>

        <ScrollView 
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={require('@/assets/images/logo5.png')}
            style={styles.logo}
          />

          <Text style={styles.title}>DonApp</Text>
          <Text style={styles.subtitle}>Inicia sesión</Text>

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
        </ScrollView>

        </KeyboardAvoidingView>

        <TouchableOpacity
          style={styles.signupContainer}
          onPress={() => router.push('/signup')}
        >
          <Text style={styles.signupText}>
            ¿No tienes cuenta?{' '}
            <Text style={styles.signupLink}>Regístrate aquí</Text>
          </Text>
        </TouchableOpacity>
    </SafeAreaView>
  );
}

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
      flex: 2,
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    logoContainer: {
      flex: 1.2,
      justifyContent: 'center',
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
      color: theme.background,
      fontSize: 18,
      fontWeight: 'bold',
    },
    separator: {
      fontSize: 14,
      color: theme.text,
      marginVertical: 25,
    },
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
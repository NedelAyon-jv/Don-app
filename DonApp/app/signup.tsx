import { Colors } from '@/constants/theme'; // Importa tus colores
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUpScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const styles = useMemo(() => createStyles(theme), [theme]); // Estilos dinámicos
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    // Lógica de registro (simulada)
    if (!name || !email || !password) {
      Alert.alert('Campos incompletos', 'Por favor, completa todos los campos.');
      return;
    }
    console.log('Registrando a:', name, email);
    // Si es exitoso, redirige a los tabs
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        
        <View style={styles.content}>
          {/* Usamos un ícono diferente para 'registrar' */}
          <FontAwesome name="leaf" size={60} color={theme.primary} style={styles.logo} />

          <Text style={styles.title}>Crea tu cuenta</Text>
          <Text style={styles.subtitle}>Forma parte de la comunidad DonApp.</Text>

          {/* Input Nombre */}
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="account-outline" size={22} color={theme.text} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              placeholderTextColor={theme.text}
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
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

          {/* Botón de Registrarse */}
          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Crear Cuenta</Text>
          </TouchableOpacity>
        </View>

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

// (Usamos los mismos nombres de estilos que en Login para consistencia)
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
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logo: {
      marginBottom: 20,
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
      marginTop: 20, // Espacio extra arriba del botón
    },
    buttonText: {
      color: theme.background, // Usa el color de fondo para el texto
      fontSize: 18,
      fontWeight: 'bold',
    },
    footerContainer: { // Renombrado de 'signupContainer' a 'footerContainer'
      padding: 10,
      alignItems: 'center',
    },
    footerText: { // Renombrado de 'signupText' a 'footerText'
      fontSize: 15,
      color: theme.text,
    },
    footerLink: { // Renombrado de 'signupLink' a 'footerLink'
      color: theme.primary,
      fontWeight: 'bold',
    },
  });


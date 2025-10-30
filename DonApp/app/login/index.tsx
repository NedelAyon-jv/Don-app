import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function LoginTab() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log('Login con:', email, password);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>

      {/* Título */}
      <Text style={[styles.title, { color: theme.text }]}>
        Bienvenido
      </Text>

      {/* Subtítulo */}
      <Text style={[styles.subtitle, { color: theme.text }]}>
        Inicia sesión para continuar
      </Text>

      {/* Input Email */}
      <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Ionicons name="mail-outline" size={20} color={theme.text} style={styles.inputIcon} />
        <TextInput
          placeholder="Correo electrónico"
          placeholderTextColor={theme.text}
          style={[styles.input, { color: theme.text }]}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Input Password */}
      <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Ionicons name="lock-closed-outline" size={20} color={theme.text} style={styles.inputIcon} />
        <TextInput
          placeholder="Contraseña"
          placeholderTextColor={theme.text}
          style={[styles.input, { color: theme.text }]}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      {/* Botón Login */}
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: theme.primary }]}
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>Ingresar</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

// --- Estilos (solo estructura, colores dinámicos desde theme) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 6,
    marginBottom: 30,
    textAlign: 'center',
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

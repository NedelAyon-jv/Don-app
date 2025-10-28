import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// --- PALETA 4: "Minimalista y Enfocada" (Coral) ---
const palette = {
  // Primario
  coral: '#FF6B6B',

  // Neutrales
  white: '#FFFFFF',
  darkGrayText: '#4A4A4A',
  lightGrayBorder: '#F0F0F0',
  
  // Colores base
  black: '#000000',
  darkGray: '#1A1A1A',
  
  // Funcionales
  success: '#28a745',
  error: '#e74c3c',
};

// --- TEMA CLARO ---
export const lightColors = {
  primary: palette.coral,
  secondary: palette.coral,
  background: palette.white,
  text: palette.darkGrayText,
  card: palette.white,
  border: palette.lightGrayBorder,
  success: palette.success,
  error: palette.error,
};

// --- TEMA OSCURO ---
export const darkColors = {
  primary: palette.coral,
  secondary: palette.coral,
  background: palette.darkGray,
  text: palette.white,
  card: '#333333',
  border: palette.darkGrayText,
  success: palette.success,
  error: palette.error,
};

// --- Exportación unificada ---
export const Colors = {
  light: lightColors,
  dark: darkColors,
};

export const AppDimensions = {
  width,
  height,
};

import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// --- TU NUEVA PALETA DE COLORES (Basada en la imagen) ---
const palette = {
  // Verdes (Colores Principales)
  primary: '#35C078',     // Color / Primary
  secondary: '#156A40',   // Color / Secondary
  accent: '#16B161',      // Color / Accent
  highlight: '#95EABF',    // Color / Highlight
  
  // Tema Oscuro (Grises/Azules Oscuros)
  darkBg: '#0E141B',        // Bg / Main
  darkCard: '#1E2329',      // Bg / Highlight
  darkBorder: '#313843',    // Bg / Hover
  darkText: '#F3F3F3',      // Text / Main
  darkTextDim: '#8C98A3',   // Text / Dim
  
  // Tema Claro (Grises/Blancos)
  lightBg: '#F4FBF8',       // Bg / White (un blanco con tinte verde)
  lightCard: '#FFFFFF',     // Blanco puro para tarjetas
  lightText: '#0E141B',      // Text / White Bg
  lightTextDim: '#4B5563',  // Text / Dim White Bg
  lightBorder: '#F0F0F0',   // Un borde neutral claro

  // Colores Funcionales (Acentos)
  red: '#D64545',
  yellow: '#E3C75F',
  blue: '#3FC3E8',
  purple: '#7D5FFF',
};

// --- TEMA CLARO ---
// --- TEMA CLARO ---
export const lightColors = {
  primary: palette.primary,
  secondary: palette.secondary,
  background: palette.lightBg,
  text: palette.lightText,
  card: palette.lightCard,
  border: palette.lightBorder,
  
  // Colores funcionales
  success: palette.primary, 
  error: palette.red,
  warning: palette.yellow,
  info: palette.blue,
  accent: palette.purple,

  // --- ✨ AÑADE ESTO (Colores de Estado) ---
  successBg: '#d4edda',   // Verde pálido (el que tenías)
  successText: '#155724', // Verde oscuro (el que tenías)
  errorBg: '#f8d7da',     // Rojo pálido (el que tenías)
  errorText: '#721c24',   // Rojo oscuro (el que tenías)
};

// --- TEMA OSCURO ---
export const darkColors = {
  primary: palette.primary,   
  secondary: palette.accent,  
  background: palette.darkBg,   
  text: palette.darkText,     
  card: palette.darkCard,     
  border: palette.darkBorder,   
  
  // Colores funcionales
  success: palette.primary,
  error: palette.red,
  warning: palette.yellow,
  info: palette.blue,
  accent: palette.purple,

  // --- ✨ AÑADE ESTO (Colores de Estado) ---
  successBg: palette.secondary, // '#156A40' (Tu verde oscuro de paleta)
  successText: palette.highlight, // '#95EABF' (Tu verde claro de paleta)
  errorBg: '#4a1e1e',         // Un rojo muy oscuro
  errorText: palette.red,       // '#D64545' (Tu rojo brillante de paleta)
};

// ... (El resto de tu archivo 'export const Colors' sigue igual)

// --- Exportación unificada ---
export const Colors = {
  light: lightColors,
  dark: darkColors,
};

export const AppDimensions = {
  width,
  height,
};

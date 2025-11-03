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
export const lightColors = {
  primary: palette.primary,
  secondary: palette.secondary,
  background: palette.lightBg,
  text: palette.lightText,
  card: palette.lightCard,
  border: palette.lightBorder,
  
  // Colores funcionales
  success: palette.primary, // El verde primario es perfecto para 'success'
  error: palette.red,
  warning: palette.yellow,
  info: palette.blue,
  accent: palette.purple,
};

// --- TEMA OSCURO ---
export const darkColors = {
  primary: palette.primary,       // El verde primario resalta bien
  secondary: palette.accent,      // Usamos el 'accent' más brillante
  background: palette.darkBg,     // Fondo principal oscuro
  text: palette.darkText,         // Texto principal claro
  card: palette.darkCard,         // Tarjetas un poco más claras que el fondo
  border: palette.darkBorder,     // Bordes sutiles
  
  // Colores funcionales
  success: palette.primary,
  error: palette.red,
  warning: palette.yellow,
  info: palette.blue,
  accent: palette.purple,
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

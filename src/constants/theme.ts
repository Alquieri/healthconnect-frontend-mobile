import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

export const COLORS = {
  // --- Cores Principais ---
  primary: '#A41856', // A sua cor principal
  secondary: '#4A90E2', // Exemplo de cor secundária para botões ou links

  // --- Cores de Feedback ---
  success: '#2E7D32', // Verde para sucesso
  error: '#B71C1C',   // Vermelho para erro
  warning: '#FBC02D', // Amarelo para aviso

  // --- Cores de Texto ---
  text: '#333333',
  textSecondary: '#666666',

  // --- Cores Neutras ---
  white: '#FFFFFF',
  black: '#000000',
  background: '#FFF5F5', // A sua cor de fundo
  
  // --- Outras ---
  border: '#DDDDDD',
  placeholder: '#A9A9A9',
};

export const SIZES = {
  // --- Tamanhos Globais ---
  base: 8,
  font: 16,     // O seu tamanho de fonte base
  radius: 8,    // O seu raio de borda
  padding: 15,  // O seu padding base

  // --- Escala de Espaçamento e Layout ---
  small: 8,
  medium: 16,
  large: 24,
  xLarge: 32,
  xxLarge: 48,

  // --- Escala Tipográfica (Tamanhos de Fonte) ---
  h1: 30,
  h2: 22,
  h3: 18,
  h4: 16,
  body1: 30,
  body2: 22,
  body3: 18,
  body4: 16,
  body5: 14,

  // --- Dimensões da Tela ---
  width,
  height,
};

export const FONTS = {
  h1: { fontFamily: 'System', fontSize: SIZES.h1, lineHeight: 36 },
  h2: { fontFamily: 'System', fontSize: SIZES.h2, lineHeight: 30 },
  h3: { fontFamily: 'System', fontSize: SIZES.h3, lineHeight: 22 },
  h4: { fontFamily: 'System', fontSize: SIZES.h4, lineHeight: 22 },
  body1: { fontFamily: 'System', fontSize: SIZES.body1, lineHeight: 36 },
  body2: { fontFamily: 'System', fontSize: SIZES.body2, lineHeight: 30 },
  body3: { fontFamily: 'System', fontSize: SIZES.body3, lineHeight: 22 },
  body4: { fontFamily: 'System', fontSize: SIZES.body4, lineHeight: 22 },
  body5: { fontFamily: 'System', fontSize: SIZES.body5, lineHeight: 22 },
};

const appTheme = { COLORS, SIZES, FONTS };

export default appTheme;
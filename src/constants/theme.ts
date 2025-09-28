import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  primary: '#A41856',
  background: '#FFF5F5',
  
  white: '#FFFFFF',
  
  text: '#333333',
  textSecondary: '#666666',
  placeholder: '#A9A9A9',
  
  border: '#DDDDDD',
  error: '#B71C1C',
};

export const SIZES = {
  // Dimensões da tela
  width,
  height,
  
  // Tamanhos base responsivos
  base: 8,
  radius: 8,
  padding: width * 0.04, // 4% da largura da tela
  
  // Fontes responsivas
  xSmall: width * 0.03,
  small: width * 0.035,
  font: width * 0.04,
  medium: width * 0.045,
  large: width * 0.05,
  xLarge: width * 0.06,
  xxLarge: width * 0.08,
  
  // Espaçamentos responsivos
  tiny: width * 0.015,
  small: width * 0.03,
  medium: width * 0.04,
  large: width * 0.06,
  xLarge: width * 0.08,
  
  // Larguras padrão - AGORA MAIS ESPECÍFICAS
  inputWidth: width * 0.85, // ✅ 85% da largura da tela (valor absoluto)
  buttonWidth: width * 0.85, // ✅ 85% da largura da tela (valor absoluto)
  containerPadding: width * 0.05,
  
  // Alturas padrão para consistência
  inputHeight: 50,
  buttonHeight: 50,
};

// Utilitário para criar estilos responsivos
export const createResponsiveStyle = (baseSize: number) => {
  if (width < 350) return baseSize * 0.9; // Telas pequenas
  if (width > 400) return baseSize * 1.1; // Telas grandes
  return baseSize;
};
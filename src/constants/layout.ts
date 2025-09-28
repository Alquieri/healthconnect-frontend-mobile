import { SIZES } from './theme';

// ✅ Constantes de layout padronizadas baseadas no HomeHeader
export const HEADER_CONSTANTS = {
  paddingTop: 50,           // Distância da câmera/status bar
  paddingHorizontal: SIZES.containerPadding, // 20px
  paddingBottom: SIZES.medium,
  minHeight: 100,           // Altura mínima do header
  titleFontSize: SIZES.large,
  titleFontWeight: '700' as const,
};

// Função para criar header padronizado
export const createStandardHeader = () => ({
  paddingTop: HEADER_CONSTANTS.paddingTop,
  paddingHorizontal: HEADER_CONSTANTS.paddingHorizontal, 
  paddingBottom: HEADER_CONSTANTS.paddingBottom,
  minHeight: HEADER_CONSTANTS.minHeight,
});
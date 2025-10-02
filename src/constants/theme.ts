import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

const BASE_COLORS = {
  success: '#28A745',
  warning: '#FFC107',
  error: '#B71C1C',
  info: '#17A2B8',
  
  text: '#333333',
  textSecondary: '#666666',
  placeholder: '#A9A9A9',
  
  background: '#FFF5F5',
  white: '#FFFFFF',
  light: '#F8F9FA',
  dark: '#343A40',
  
  border: '#DDDDDD',
  
  gray100: '#F8F9FA',
  gray200: '#E9ECEF',
  gray300: '#DEE2E6',
  gray400: '#CED4DA',
  gray500: '#ADB5BD',
  gray600: '#6C757D',
  gray700: '#495057',
  gray800: '#343A40',
  gray900: '#212529',
};

const DEFAULT_THEME = {
  ...BASE_COLORS,
  primary: '#A41856',
  secondary: '#666666',
  primaryLight: '#A4185620',
  primaryDark: '#7d1344',
};

const DOCTOR_THEME = {
  ...BASE_COLORS,
  primary: '#0D9488',
  secondary: '#666666',
  primaryLight: '#32968dff',
  primaryDark: '#045c54ff',
};

export const getTheme = (userType: 'patient' | 'doctor' | 'default' = 'default') => {
  switch (userType) {
    case 'doctor':
      return DOCTOR_THEME;
    case 'patient':
    case 'default':
    default:
      return DEFAULT_THEME;
  }
};

export const COLORS = DEFAULT_THEME;

export const SIZES = {
  width,
  height,
  
  base: 8,
  radius: 8,
  padding: width * 0.04,
  
  tiny: width * 0.015,
  xSmall: width * 0.03,
  small: width * 0.035,
  font: width * 0.04,
  medium: width * 0.045,
  large: width * 0.05,
  xLarge: width * 0.06,
  xxLarge: width * 0.08,
  
  inputWidth: width * 0.85,
  buttonWidth: width * 0.85,
  containerPadding: width * 0.05,
  
  inputHeight: 50,
  buttonHeight: 50,
};

export const createResponsiveStyle = (baseSize: number) => {
  if (width < 350) return baseSize * 0.9;
  if (width > 400) return baseSize * 1.1;
  return baseSize;
};

import React, { useState } from 'react';
import { 
  TextInput, 
  StyleSheet, 
  TextInputProps, 
  View, 
  Text, 
  TouchableOpacity,
  KeyboardTypeOptions // ✅ Adicionar esta importação
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, createResponsiveStyle } from '../constants/theme';

interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: any;
  showPasswordToggle?: boolean;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions; // ✅ Agora deve funcionar
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  style?: any;
}

export function CustomInput({ 
  label, 
  error, 
  containerStyle, 
  style,
  showPasswordToggle = false,
  secureTextEntry,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  ...props 
}: CustomInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Determinar se deve mostrar a senha baseado no showPasswordToggle e isPasswordVisible
  const shouldSecureText = showPasswordToggle ? !isPasswordVisible : secureTextEntry;

  // ✅ Handler para garantir que o maxLength é respeitado
  const handleTextChange = (text: string) => {
    console.log('🔍 [CustomInput] Texto recebido:', `"${text}"`, 'Length:', text.length);
    
    let processedText = text;
    
    // Se maxLength estiver definido, cortar o texto
    if (maxLength && text.length > maxLength) {
      processedText = text.substring(0, maxLength);
      console.log('⚠️ [CustomInput] Texto cortado de', text.length, 'para', maxLength, 'caracteres');
    }
    
    // ✅ Garantir que não há caracteres invisíveis em campos numéricos
    if (keyboardType === 'numeric' || keyboardType === 'number-pad') {
      processedText = processedText.replace(/[^\d]/g, '');
      console.log('🔢 [CustomInput] Apenas números:', `"${processedText}"`, 'Length:', processedText.length);
    }
    
    console.log('🔍 [CustomInput] Texto final:', `"${processedText}"`, 'Length:', processedText.length);
    onChangeText(processedText);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input, 
            error && styles.inputError,
            showPasswordToggle && styles.inputWithIcon,
            style
          ]}
          secureTextEntry={shouldSecureText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.placeholder}
          value={value}
          onChangeText={handleTextChange} // ✅ Usar o handler que garante maxLength
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength} // ✅ Aplicar também no TextInput nativo
          {...props}
        />
        
        {showPasswordToggle && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={togglePasswordVisibility}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZES.inputWidth,
    marginBottom: SIZES.medium,
    alignSelf: 'center',
  },
  label: {
    fontSize: SIZES.small,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SIZES.tiny,
  },
  
  inputContainer: {
    position: 'relative',
    width: '100%',
  },
  
  input: {
    width: '100%',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingVertical: createResponsiveStyle(14),
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: SIZES.font,
    color: COLORS.text,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  
  inputWithIcon: {
    paddingRight: SIZES.padding + 30,
  },
  
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 1.5,
  },
  
  eyeButton: {
    position: 'absolute',
    right: SIZES.padding,
    top: '50%',
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },
  
  error: {
    fontSize: SIZES.xSmall,
    color: COLORS.error,
    marginTop: SIZES.tiny,
    marginLeft: SIZES.tiny,
  },
});
import React, { useState } from 'react';
import { TextInput, StyleSheet, TextInputProps, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, createResponsiveStyle } from '../constants/theme';

interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: any;
  showPasswordToggle?: boolean; // ✅ Nova prop para mostrar o toggle de senha
}

export function CustomInput({ 
  label, 
  error, 
  containerStyle, 
  style,
  showPasswordToggle = false, // ✅ Default false
  secureTextEntry,
  ...props 
}: CustomInputProps) {
  // ✅ Estado para controlar a visualização da senha
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  // ✅ Determinar se deve mostrar a senha ou não
  const shouldSecureText = showPasswordToggle ? !isPasswordVisible : secureTextEntry;
  
  // ✅ Função para alternar visualização da senha
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input, 
            error && styles.inputError,
            showPasswordToggle && styles.inputWithIcon, // ✅ Espaço para o ícone
            style
          ]}
          secureTextEntry={shouldSecureText}
          placeholderTextColor={COLORS.placeholder}
          {...props}
        />
        
        {/* ✅ Botão do olhinho apenas se showPasswordToggle for true */}
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
    width: SIZES.inputWidth, // ✅ Força a largura sempre
    marginBottom: SIZES.medium,
    alignSelf: 'center', // ✅ Centraliza o container
  },
  label: {
    fontSize: SIZES.small,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SIZES.tiny,
  },
  
  // ✅ Container para o input e o ícone
  inputContainer: {
    position: 'relative',
    width: '100%',
  },
  
  input: {
    width: '100%', // ✅ Força 100% da largura do container
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
  
  // ✅ Input com espaço para o ícone do olhinho
  inputWithIcon: {
    paddingRight: SIZES.padding + 30, // Espaço extra para o ícone
  },
  
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 1.5,
  },
  
  // ✅ Estilo do botão do olhinho
  eyeButton: {
    position: 'absolute',
    right: SIZES.padding,
    top: '50%',
    transform: [{ translateY: -10 }], // Centraliza verticalmente
    zIndex: 1,
  },
  
  error: {
    fontSize: SIZES.xSmall,
    color: COLORS.error,
    marginTop: SIZES.tiny,
    marginLeft: SIZES.tiny,
  },
});
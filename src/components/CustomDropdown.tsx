// src/components/CustomDropdown.tsx
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import { Ionicons } from '@expo/vector-icons';
import { SIZES, getTheme } from '../constants/theme';

type Option = {
  label: string;
  value: string;
};

type CustomDropdownProps = {
  label: string;
  options: Option[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder: string;
};

export const CustomDropdown = ({ label, options, selectedValue, onValueChange, placeholder }: CustomDropdownProps) => {
  const COLORS = getTheme('doctor');
  const dropdownRef = useRef<ModalDropdown>(null);

  const selectedOption = options.find(option => option.value === selectedValue);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <ModalDropdown
        ref={dropdownRef}
        options={options.map(o => o.label)}
        onSelect={(index, value) => {
          onValueChange(options[index].value);
        }}
        style={styles.dropdown}
        textStyle={selectedOption ? styles.dropdownText : styles.placeholderText}
        dropdownStyle={styles.dropdownOptionsContainer}
        renderRow={(option, index, isSelected) => (
          <View style={[styles.dropdownRow, isSelected && styles.dropdownRowSelected]}>
            <Text style={[styles.dropdownRowText, isSelected && styles.dropdownRowTextSelected]}>
              {option}
            </Text>
          </View>
        )}
      >
        {/* Este é o botão que o usuário vê e toca */}
        <View style={styles.dropdownButton}>
          <Text style={selectedOption ? styles.dropdownText : styles.placeholderText}>
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
          <Ionicons name="chevron-down" size={20} color={COLORS.gray} />
        </View>
      </ModalDropdown>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SIZES.inputWidth,
    marginBottom: SIZES.medium,
    alignSelf: 'center',
  },
  label: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: '#333333',
    marginBottom: SIZES.small,
    alignSelf: 'flex-start',
  },
  dropdown: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    height: 50,
  },
  dropdownText: {
    fontSize: SIZES.font,
    color: '#333333',
  },
  placeholderText: {
    fontSize: SIZES.font,
    color: '#999999',
  },
  dropdownOptionsContainer: {
    width: SIZES.inputWidth - 2, // Ajustar para a borda
    marginTop: 10,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  dropdownRow: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.medium,
  },
  dropdownRowSelected: {
    backgroundColor: '#00A651',
  },
  dropdownRowText: {
    fontSize: SIZES.font,
    color: '#333333',
  },
  dropdownRowTextSelected: {
    color: '#FFFFFF',
  },
});
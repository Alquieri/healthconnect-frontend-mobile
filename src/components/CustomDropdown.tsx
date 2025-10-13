// ✅ PASSO 1: Importe 'Dispatch' e 'SetStateAction' do React
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SIZES, getTheme, COLORS } from '../constants/theme';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

export interface DropdownItem {
  label: string;
  value: string;
  disabled?: boolean;
}

interface CustomDropdownProps {
  label?: string;
  placeholder: string;
  items: DropdownItem[];
  value: string | null;
  onSelect: (value: string | null) => void;
  disabled?: boolean;
  error?: string;
  searchable?: boolean;
  maxHeight?: number;
  userType?: 'patient' | 'doctor' | 'default';
  containerStyle?: any;
  required?: boolean;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  placeholder,
  items,
  value,
  onSelect,
  disabled = false,
  error,
  searchable = false,
  maxHeight = 250,
  userType = 'default',
  containerStyle,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredItems, setFilteredItems] = useState<DropdownItem[]>(items);
  const [dropdownLayout, setDropdownLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  const triggerRef = useRef<View>(null);
  const THEME_COLORS = getTheme(userType);

  // ✅ Atualizar itens filtrados
  useEffect(() => {
    if (searchable && searchText.trim()) {
      const filtered = items.filter(item =>
        item.label.toLowerCase().includes(searchText.toLowerCase().trim())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  }, [items, searchText, searchable]);

  // ✅ Medir posição do trigger quando abrir
  const measureTrigger = () => {
    if (triggerRef.current) {
      triggerRef.current.measureInWindow((x, y, width, height) => {
        setDropdownLayout({ x, y, width, height });
      });
    }
  };

  const toggleDropdown = () => {
    if (!disabled) {
      if (!isOpen) {
        measureTrigger();
        setSearchText('');
      }
      setIsOpen(!isOpen);
    }
  };

  const selectItem = (item: DropdownItem) => {
    if (!item.disabled) {
      onSelect(item.value);
      setIsOpen(false);
      setSearchText('');
    }
  };

  const clearSelection = () => {
    onSelect(null);
  };

  const getSelectedLabel = () => {
    const selectedItem = items.find(item => item.value === value);
    return selectedItem ? selectedItem.label : '';
  };

  const renderDropdownItem = ({ item, index }: { item: DropdownItem; index: number }) => {
    const isSelected = value === item.value;
    const isLastItem = index === filteredItems.length - 1;

    return (
      <TouchableOpacity
        style={[
          styles.dropdownItem,
          isSelected && { backgroundColor: THEME_COLORS.primary + '15' },
          item.disabled && styles.disabledItem,
          isLastItem && { borderBottomWidth: 0 },
        ]}
        onPress={() => selectItem(item)}
        disabled={item.disabled}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.dropdownItemText,
            isSelected && { color: THEME_COLORS.primary, fontWeight: '600' },
            item.disabled && { color: COLORS.textSecondary, opacity: 0.5 },
          ]}
          numberOfLines={2}
        >
          {item.label}
        </Text>
        {isSelected && (
          <Ionicons 
            name="checkmark" 
            size={18} 
            color={THEME_COLORS.primary} 
          />
        )}
      </TouchableOpacity>
    );
  };

  // ✅ Calcular altura e posição do dropdown
  const calculateDropdownPosition = () => {
    const searchHeight = searchable ? 50 : 0;
    const itemHeight = 48;
    const maxItems = Math.floor((maxHeight - searchHeight) / itemHeight);
    const actualHeight = Math.min(filteredItems.length * itemHeight + searchHeight + 10, maxHeight);
    
    const spaceBelow = screenHeight - (dropdownLayout.y + dropdownLayout.height);
    const spaceAbove = dropdownLayout.y;
    
    let dropdownY = dropdownLayout.y + dropdownLayout.height;
    let showAbove = false;
    
    if (spaceBelow < actualHeight && spaceAbove > actualHeight) {
      dropdownY = dropdownLayout.y - actualHeight;
      showAbove = true;
    }
    
    return {
      top: Math.max(10, dropdownY),
      left: dropdownLayout.x,
      width: dropdownLayout.width,
      height: Math.min(actualHeight, showAbove ? spaceAbove - 10 : spaceBelow - 10),
    };
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      {/* Dropdown Trigger */}
      <View ref={triggerRef}>
        <TouchableOpacity
          style={[
            styles.trigger,
            error && styles.triggerError,
            disabled && styles.triggerDisabled,
            isOpen && { borderColor: THEME_COLORS.primary, borderWidth: 2 },
          ]}
          onPress={toggleDropdown}
          disabled={disabled}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.triggerText,
              !value && styles.placeholderText,
              disabled && styles.disabledText,
            ]}
            numberOfLines={1}
          >
            {value ? getSelectedLabel() : placeholder}
          </Text>
          
          <View style={styles.triggerIcons}>
            {value && !disabled && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
                style={styles.clearButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            )}
            
            <Animated.View
              style={{
                transform: [{
                  rotate: isOpen ? '180deg' : '0deg'
                }]
              }}
            >
              <Ionicons
                name="chevron-down"
                size={20}
                color={disabled ? COLORS.textSecondary : THEME_COLORS.primary}
              />
            </Animated.View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {/* Modal Dropdown List */}
      {isOpen && (
        <Modal
          transparent
          visible={isOpen}
          onRequestClose={() => setIsOpen(false)}
          animationType="fade"
          statusBarTranslucent
        >
          {/* Overlay */}
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setIsOpen(false)}
          >
            {/* Dropdown Content */}
            <View
              style={[
                styles.dropdownContainer,
                calculateDropdownPosition(),
              ]}
              onStartShouldSetResponder={() => true}
            >
              {/* Search Input */}
              {searchable && (
                <View style={styles.searchContainer}>
                  <Ionicons name="search" size={16} color={COLORS.textSecondary} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar..."
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholderTextColor={COLORS.textSecondary}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {searchText.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setSearchText('')}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="close" size={16} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Items List */}
              {filteredItems.length > 0 ? (
                <FlatList
                  data={filteredItems}
                  renderItem={renderDropdownItem}
                  keyExtractor={(item, index) => `${item.value}-${index}`}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                  keyboardShouldPersistTaps="handled"
                  bounces={false}
                  style={{ flexGrow: 1 }}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {searchText ? 'Nenhum item encontrado' : 'Nenhuma opção disponível'}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: SIZES.medium,
    zIndex: 1,
  },
  
  label: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.tiny,
  },
  
  required: {
    color: COLORS.error,
  },

  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.small + 2,
    minHeight: 50,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  triggerError: {
    borderColor: COLORS.error,
    borderWidth: 2,
  },

  triggerDisabled: {
    backgroundColor: COLORS.gray100,
    opacity: 0.7,
  },

  triggerText: {
    flex: 1,
    fontSize: SIZES.font,
    color: COLORS.text,
    marginRight: SIZES.small,
  },

  placeholderText: {
    color: COLORS.textSecondary,
  },

  disabledText: {
    color: COLORS.textSecondary,
  },

  triggerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.tiny,
  },

  clearButton: {
    padding: 2,
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },

  dropdownContainer: {
    position: 'absolute',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.small,
    paddingVertical: SIZES.tiny,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.gray100,
    minHeight: 40,
  },

  searchInput: {
    flex: 1,
    marginLeft: SIZES.tiny,
    fontSize: SIZES.small,
    color: COLORS.text,
    paddingVertical: SIZES.tiny,
  },

  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.small,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    minHeight: 48,
  },

  disabledItem: {
    opacity: 0.5,
  },

  dropdownItemText: {
    flex: 1,
    fontSize: SIZES.font,
    color: COLORS.text,
    lineHeight: 20,
  },

  emptyContainer: {
    padding: SIZES.large,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },

  emptyText: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  errorText: {
    fontSize: SIZES.xSmall,
    color: COLORS.error,
    marginTop: SIZES.tiny,
    marginLeft: SIZES.tiny,
  },
});

export default CustomDropdown;
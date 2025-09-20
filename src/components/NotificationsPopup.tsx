import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../constants/theme';

export type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
  type?: 'default' | 'doctor';
};

interface NotificationsPopupProps {
  visible: boolean;
  onClose: () => void;
  notifications: Notification[];
}

export function NotificationsPopup({ visible, onClose, notifications }: NotificationsPopupProps) {
  const router = useRouter();

  const handleNotificationPress = (item: Notification) => {
    onClose();
    if (item.link) {
      router.push(item.link as `http${string}` | `/${string}`);
    }
  };

  const NotificationItem = ({ item }: { item: Notification }) => {
    const isDoctorNotification = item.type === 'doctor';
    const accentColor = isDoctorNotification ? '#27ae60' : COLORS.primary;

    return (
      <TouchableOpacity 
        onPress={() => handleNotificationPress(item)} 
        disabled={!item.link} 
        style={styles.itemTouchable}
      >
        <View style={styles.itemContainer}>
          <View style={[styles.accentBorder, { backgroundColor: accentColor }]} />
          
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemMessage}>{item.message}</Text>
            <Text style={styles.itemTime}>{item.time}</Text>
          </View>
          {item.link && <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.centeredView} activeOpacity={1} onPressOut={onClose}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Ionicons name="notifications" size={22} color={COLORS.primary} />
              <Text style={styles.modalTitle}>Notificações</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={notifications}
            renderItem={({ item }) => <NotificationItem item={item} />}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingTop: 80,
  },
  modalView: {
    width: '90%',
    maxHeight: '70%',
    alignSelf: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 8,
  },
  closeButton: {
    backgroundColor: COLORS.border,
    padding: 6,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTouchable: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accentBorder: {
    width: 6,
    height: '100%',
  },
  itemContent: {
    flex: 1,
    padding: 16,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  itemMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  itemTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'right',
  },
});


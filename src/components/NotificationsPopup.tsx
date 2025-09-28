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
      // ✅ Tratar links especiais
      if (item.link === '/doctor-portal' || item.link === '/registerDoctor') {
        router.push('/registerDoctor');
      } else if (item.link.startsWith('/')) {
        router.push(item.link as `/${string}`);
      } else if (item.link.startsWith('http')) {
        router.push(item.link as `http${string}`);
      }
    }
  };

  const NotificationItem = ({ item }: { item: Notification }) => {
    const isDoctorNotification = item.type === 'doctor';
    const accentColor = isDoctorNotification ? '#00A651' : COLORS.primary; // ✅ Verde médico

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
          
          {!item.read && <View style={styles.unreadIndicator} />}
          
          {item.link && (
            <Ionicons 
              name="chevron-forward" 
              size={16} 
              color={COLORS.textSecondary} 
              style={styles.chevron} 
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Notificações</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={notifications}
            renderItem={({ item }) => <NotificationItem item={item} />}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            style={styles.notificationsList}
          />
        </View>
      </View>
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
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  notificationsList: {
    maxHeight: 400,
  },
  itemTouchable: {
    marginBottom: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    position: 'relative',
  },
  accentBorder: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
    paddingRight: 8,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  itemMessage: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  itemTime: {
    fontSize: 11,
    color: COLORS.placeholder,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  chevron: {
    alignSelf: 'center',
    marginLeft: 4,
  },
});


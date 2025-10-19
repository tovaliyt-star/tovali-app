import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useUserData } from '../context/UserDataContext';

export default function AddressesScreen() {
  const navigation = useNavigation<any>();
  const { userData, addAddress, updateUserData } = useUserData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    title: '',
    address: '',
    city: '',
    zipCode: '',
  });

  const handleAddAddress = () => {
    if (!newAddress.title.trim() || !newAddress.address.trim()) {
      Alert.alert('שגיאה', 'כותרת וכתובת הם שדות חובה');
      return;
    }

    const addressData = {
      id: Date.now().toString(),
      title: newAddress.title.trim(),
      address: newAddress.address.trim(),
      city: newAddress.city.trim(),
      zipCode: newAddress.zipCode.trim(),
      isDefault: (userData?.addresses?.length || 0) === 0,
    };

    addAddress(addressData);
    setNewAddress({ title: '', address: '', city: '', zipCode: '' });
    setShowAddForm(false);
  };

  const handleDeleteAddress = (id: string) => {
    Alert.alert(
      'מחיקת כתובת',
      'האם אתה בטוח שברצונך למחוק כתובת זו?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: () => {
            const updatedAddresses = (userData?.addresses || []).filter(addr => addr.id !== id);
            updateUserData({ addresses: updatedAddresses });
          },
        },
      ]
    );
  };

  const handleSetDefault = (id: string) => {
    const updatedAddresses = (userData?.addresses || []).map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    })) || [];
    updateUserData({ addresses: updatedAddresses });
  };

  return (
    <LinearGradient
      colors={['#fdf2f8', '#fed7d3', '#fce7f3']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#6366F1" />
            <Text style={styles.backButtonText}>חזור</Text>
          </TouchableOpacity>
          <Text style={styles.title}>כתובות</Text>
        </View>

        {/* Add New Address Button */}
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>
            {showAddForm ? 'ביטול' : 'הוסף כתובת חדשה'}
          </Text>
        </TouchableOpacity>

        {/* Add Address Form */}
        {showAddForm && (
          <View style={styles.addForm}>
            <TextInput
              style={styles.input}
              placeholder="כותרת (למשל: בית, עבודה)"
              value={newAddress.title}
              onChangeText={(text) => setNewAddress(prev => ({ ...prev, title: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="כתובת מלאה"
              value={newAddress.address}
              onChangeText={(text) => setNewAddress(prev => ({ ...prev, address: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="עיר"
              value={newAddress.city}
              onChangeText={(text) => setNewAddress(prev => ({ ...prev, city: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="מיקוד"
              value={newAddress.zipCode}
              onChangeText={(text) => setNewAddress(prev => ({ ...prev, zipCode: text }))}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleAddAddress}>
              <Text style={styles.saveButtonText}>שמור כתובת</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Addresses List */}
        <View style={styles.addressesContainer}>
                     {(userData?.addresses?.length || 0) === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="location-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>אין לך כתובות שמורות</Text>
              <Text style={styles.emptySubtitle}>
                הוסף כתובת ראשונה כדי להתחיל
              </Text>
            </View>
          ) : (
                         (userData?.addresses || []).map((address) => (
              <View key={address.id} style={styles.addressItem}>
                <View style={styles.addressContent}>
                  <View style={styles.addressHeader}>
                    <Text style={styles.addressTitle}>{address.title}</Text>
                    {address.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>ברירת מחדל</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.addressText}>{address.address}</Text>
                  {address.city && (
                    <Text style={styles.addressText}>{address.city}</Text>
                  )}
                  {address.zipCode && (
                    <Text style={styles.addressText}>{address.zipCode}</Text>
                  )}
                </View>
                <View style={styles.addressActions}>
                  {!address.isDefault && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleSetDefault(address.id)}
                    >
                      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                      <Text style={styles.actionText}>הגדר כברירת מחדל</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteAddress(address.id)}
                  >
                    <Ionicons name="trash" size={20} color="#EF4444" />
                    <Text style={[styles.actionText, styles.deleteText]}>מחק</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6366F1',
    marginLeft: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  addForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addressesContainer: {
    paddingHorizontal: 20,
  },
  addressItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addressContent: {
    marginBottom: 12,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  defaultText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  actionText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 4,
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  deleteText: {
    color: '#EF4444',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

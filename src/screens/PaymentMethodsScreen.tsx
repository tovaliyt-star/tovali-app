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

export default function PaymentMethodsScreen() {
  const navigation = useNavigation<any>();
  const { userData, addPaymentMethod, updateUserData } = useUserData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'card',
    name: '',
    last4: '',
    expiry: '',
    cvv: '',
  });

  const handleAddPaymentMethod = () => {
    if (!newPaymentMethod.name.trim() || !newPaymentMethod.last4.trim()) {
      Alert.alert('שגיאה', 'שם הכרטיס ומספר הכרטיס הם שדות חובה');
      return;
    }

    const paymentData = {
      id: Date.now().toString(),
      type: newPaymentMethod.type,
      name: newPaymentMethod.name.trim(),
      last4: newPaymentMethod.last4.trim(),
      expiry: newPaymentMethod.expiry.trim(),
      isDefault: (userData?.paymentMethods?.length || 0) === 0,
    };

    addPaymentMethod(paymentData);
    setNewPaymentMethod({ type: 'card', name: '', last4: '', expiry: '', cvv: '' });
    setShowAddForm(false);
  };

  const handleSetDefaultPayment = (id: string) => {
    const updatedMethods = (userData?.paymentMethods || []).map(pm => ({
      ...pm,
      isDefault: pm.id === id,
    })) || [];
    updateUserData({ paymentMethods: updatedMethods });
  };

  const handleDeletePayment = (id: string) => {
    Alert.alert(
      'מחיקת אמצעי תשלום',
      'האם אתה בטוח שברצונך למחוק אמצעי תשלום זה?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: () => {
            const updatedMethods = (userData?.paymentMethods || []).filter(pm => pm.id !== id);
            updateUserData({ paymentMethods: updatedMethods });
          },
        },
      ]
    );
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'card':
        return 'card-outline';
      case 'paypal':
        return 'logo-paypal';
      default:
        return 'card-outline';
    }
  };

  const getPaymentColor = (type: string) => {
    switch (type) {
      case 'card':
        return '#3B82F6';
      case 'paypal':
        return '#00457C';
      default:
        return '#6B7280';
    }
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
          <Text style={styles.title}>אמצעי תשלום</Text>
        </View>

        {/* Add New Payment Method Button */}
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>
            {showAddForm ? 'ביטול' : 'הוסף אמצעי תשלום חדש'}
          </Text>
        </TouchableOpacity>

        {/* Add Payment Method Form */}
        {showAddForm && (
          <View style={styles.addForm}>
            <TextInput
              style={styles.input}
              placeholder="שם הכרטיס (למשל: כרטיס אשראי)"
              value={newPaymentMethod.name}
              onChangeText={(text) => setNewPaymentMethod(prev => ({ ...prev, name: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="4 ספרות אחרונות"
              value={newPaymentMethod.last4}
              onChangeText={(text) => setNewPaymentMethod(prev => ({ ...prev, last4: text }))}
              keyboardType="numeric"
              maxLength={4}
            />
            <TextInput
              style={styles.input}
              placeholder="תוקף (MM/YY)"
              value={newPaymentMethod.expiry}
              onChangeText={(text) => setNewPaymentMethod(prev => ({ ...prev, expiry: text }))}
              maxLength={5}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleAddPaymentMethod}>
              <Text style={styles.saveButtonText}>שמור אמצעי תשלום</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Payment Methods List */}
        <View style={styles.paymentMethodsContainer}>
                     {(userData?.paymentMethods?.length || 0) === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="card-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>אין לך אמצעי תשלום שמורים</Text>
              <Text style={styles.emptySubtitle}>
                הוסף אמצעי תשלום ראשון כדי להתחיל
              </Text>
            </View>
          ) : (
                         (userData?.paymentMethods || []).map((method) => (
              <View key={method.id} style={styles.paymentMethodItem}>
                <View style={styles.paymentMethodContent}>
                  <View style={styles.paymentMethodHeader}>
                    <View style={styles.paymentMethodInfo}>
                      <Ionicons 
                        name={getPaymentIcon(method.type) as any} 
                        size={24} 
                        color={getPaymentColor(method.type)} 
                      />
                      <View style={styles.paymentMethodDetails}>
                        <Text style={styles.paymentMethodName}>{method.name}</Text>
                        <Text style={styles.paymentMethodNumber}>
                          **** **** **** {method.last4}
                        </Text>
                        {method.expiry && (
                          <Text style={styles.paymentMethodExpiry}>
                            תקף עד: {method.expiry}
                          </Text>
                        )}
                      </View>
                    </View>
                    {method.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>ברירת מחדל</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.paymentMethodActions}>
                  {!method.isDefault && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleSetDefaultPayment(method.id)}
                    >
                      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                      <Text style={styles.actionText}>הגדר כברירת מחדל</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeletePayment(method.id)}
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
  paymentMethodsContainer: {
    paddingHorizontal: 20,
  },
  paymentMethodItem: {
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
  paymentMethodContent: {
    marginBottom: 12,
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodDetails: {
    marginLeft: 12,
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  paymentMethodNumber: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  paymentMethodExpiry: {
    fontSize: 14,
    color: '#9CA3AF',
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
  paymentMethodActions: {
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

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserData } from '../context/UserDataContext';

// Mock data for orders
const mockOrders = [
  {
    id: '1',
    serviceTitle: 'הובלת רהיטים',
    providerName: 'יוסי הובלות',
    status: 'in_progress',
    totalPrice: 150,
    scheduledDate: '2024-01-15T10:00:00',
    notes: 'ניקיון יסודי של 3 חדרים',
    createdAt: '2024-01-10T09:00:00',
  },
  {
    id: '2',
    serviceTitle: 'ניקוי דירה',
    providerName: 'שירותי ניקוי מקצועי',
    status: 'completed',
    totalPrice: 200,
    scheduledDate: '2024-01-05T14:00:00',
    notes: 'תיקון ברז במטבח',
    createdAt: '2024-01-03T11:00:00',
  },
  {
    id: '3',
    serviceTitle: 'עיצוב גינה',
    providerName: 'גינון מקצועי',
    status: 'pending',
    totalPrice: 300,
    scheduledDate: '2024-01-20T09:00:00',
    notes: 'עיצוב גינה קטנה',
    createdAt: '2024-01-12T14:00:00',
  },
];

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return 'ממתין לאישור';
    case 'accepted': return 'אושר';
    case 'in_progress': return 'בביצוע';
    case 'completed': return 'הושלם';
    case 'cancelled': return 'בוטל';
    default: return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return '#FFA500';
    case 'accepted': return '#007AFF';
    case 'in_progress': return '#32CD32';
    case 'completed': return '#28A745';
    case 'cancelled': return '#DC3545';
    default: return '#666';
  }
};

export default function OrdersScreen() {
  const navigation = useNavigation<any>();
  const { userData } = useUserData();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  
  // השתמש בנתונים מה-UserDataContext או בנתונים לדוגמה
  const orders = userData?.orders || mockOrders;

  const activeOrders = orders.filter(order => 
    ['pending', 'accepted', 'in_progress'].includes(order.status)
  );
  
  const historyOrders = orders.filter(order => 
    ['completed', 'cancelled'].includes(order.status)
  );

  const handleCancelOrder = (orderId: string) => {
    Alert.alert(
      'ביטול הזמנה',
      'האם אתה בטוח שברצונך לבטל הזמנה זו?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'בטל הזמנה',
          style: 'destructive',
          onPress: () => {
            // כאן תהיה לוגיקת ביטול הזמנה
            Alert.alert('הצלחה!', 'הזמנה בוטלה בהצלחה');
          },
        },
      ]
    );
  };

  const renderOrderItem = ({ item }: { item: any }) => (
    <View style={styles.orderItem}>
      <View style={styles.orderHeader}>
        <Text style={styles.serviceTitle}>{item.serviceTitle}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <Text style={styles.providerName}>{item.providerName}</Text>
      <Text style={styles.orderNotes}>{item.notes}</Text>
      
      <View style={styles.orderFooter}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderDate}>
            תאריך: {new Date(item.scheduledDate).toLocaleDateString('he-IL')}
          </Text>
          <Text style={styles.orderPrice}>{item.totalPrice}₪</Text>
        </View>
        
        {item.status === 'pending' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelOrder(item.id)}
          >
            <Text style={styles.cancelButtonText}>בטל הזמנה</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

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
          <Text style={styles.title}>הזמנות</Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'active' && styles.activeTabButton]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
              פעילות ({activeOrders.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'history' && styles.activeTabButton]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
              היסטוריה ({historyOrders.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Orders List */}
        <View style={styles.ordersContainer}>
          {activeTab === 'active' ? (
            activeOrders.length > 0 ? (
              activeOrders.map((order) => (
                <View key={order.id}>
                  {renderOrderItem({ item: order })}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={64} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>אין הזמנות פעילות</Text>
                <Text style={styles.emptySubtitle}>
                  התחל לחפש שירותים ויצור הזמנות חדשות
                </Text>
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={() => navigation.navigate('Home' as any)}
                >
                  <Text style={styles.searchButtonText}>חפש שירותים</Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            historyOrders.length > 0 ? (
              historyOrders.map((order) => (
                <View key={order.id}>
                  {renderOrderItem({ item: order })}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={64} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>אין היסטוריית הזמנות</Text>
                <Text style={styles.emptySubtitle}>
                  הזמנות שהושלמו יופיעו כאן
                </Text>
              </View>
            )
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#6366F1',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  ordersContainer: {
    paddingHorizontal: 20,
  },
  orderItem: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  providerName: {
    fontSize: 16,
    color: '#6366F1',
    marginBottom: 8,
  },
  orderNotes: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderInfo: {
    flex: 1,
  },
  orderDate: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  cancelButton: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  searchButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

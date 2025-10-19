import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Task } from '../entities/Task';
import { useUserData } from '../context/UserDataContext';

type ProviderEarningsNavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

interface EarningsData {
  totalEarnings: number;
  thisMonthEarnings: number;
  lastMonthEarnings: number;
  completedTasks: number;
  averageEarningPerTask: number;
  topCategory: string;
  earningsByMonth: Array<{
    month: string;
    amount: number;
    tasks: number;
  }>;
  recentEarnings: Array<{
    id: string;
    taskTitle: string;
    amount: number;
    date: string;
    clientName: string;
  }>;
}

export default function ProviderEarningsScreen() {
  const navigation = useNavigation<ProviderEarningsNavigationProp>();
  const { userData } = useUserData();
  const [refreshing, setRefreshing] = useState(false);
  const [earningsData, setEarningsData] = useState<EarningsData>({
    totalEarnings: 0,
    thisMonthEarnings: 0,
    lastMonthEarnings: 0,
    completedTasks: 0,
    averageEarningPerTask: 0,
    topCategory: '',
    earningsByMonth: [],
    recentEarnings: [],
  });

  useEffect(() => {
    loadEarningsData();
  }, []);

  const loadEarningsData = async () => {
    try {
      if (!userData?.id) return;

      // קבלת כל המשימות של נותן השירות
      const allTasks = await Task.getByProviderId(userData.id);
      const completedTasks = allTasks.filter(task => 
        task.status === 'הושלם'
      );

      // חישוב נתונים בסיסיים
      const totalEarnings = completedTasks.reduce((sum, task) => sum + parseInt(task.price), 0);
      const completedTasksCount = completedTasks.length;
      const averageEarningPerTask = completedTasksCount > 0 ? totalEarnings / completedTasksCount : 0;

      // חישוב הכנסות החודש הנוכחי
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const thisMonthTasks = completedTasks.filter(task => {
        const taskDate = new Date(task.updated_at || task.created_at || '');
        return taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear;
      });
      const thisMonthEarnings = thisMonthTasks.reduce((sum, task) => sum + parseInt(task.price), 0);

      // חישוב הכנסות החודש הקודם
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const lastMonthTasks = completedTasks.filter(task => {
        const taskDate = new Date(task.updated_at || task.created_at || '');
        return taskDate.getMonth() === lastMonth && taskDate.getFullYear() === lastMonthYear;
      });
      const lastMonthEarnings = lastMonthTasks.reduce((sum, task) => sum + parseInt(task.price), 0);

      // חישוב הקטגוריה הפופולרית ביותר
      const categoryCount: { [key: string]: number } = {};
      completedTasks.forEach(task => {
        categoryCount[task.category] = (categoryCount[task.category] || 0) + 1;
      });
      const topCategory = Object.keys(categoryCount).reduce((a, b) => 
        categoryCount[a] > categoryCount[b] ? a : b, '');

      // הכנת נתונים לחודשים האחרונים
      const earningsByMonth = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthTasks = completedTasks.filter(task => {
          const taskDate = new Date(task.updated_at || task.created_at || '');
          return taskDate.getMonth() === date.getMonth() && 
                 taskDate.getFullYear() === date.getFullYear();
        });
        const monthEarnings = monthTasks.reduce((sum, task) => sum + parseInt(task.price), 0);
        
        earningsByMonth.push({
          month: date.toLocaleDateString('he-IL', { month: 'short', year: '2-digit' }),
          amount: monthEarnings,
          tasks: monthTasks.length,
        });
      }

      // הכנת רשימת הכנסות אחרונות
      const recentEarnings = completedTasks
        .sort((a, b) => new Date(b.updated_at || b.created_at || '').getTime() - 
                        new Date(a.updated_at || a.created_at || '').getTime())
        .slice(0, 10)
        .map(task => ({
          id: task.id || '',
          taskTitle: task.description,
          amount: parseInt(task.price),
          date: new Date(task.updated_at || task.created_at || '').toLocaleDateString('he-IL'),
          clientName: `לקוח ${task.client_id}`,
        }));

      setEarningsData({
        totalEarnings,
        thisMonthEarnings,
        lastMonthEarnings,
        completedTasks: completedTasksCount,
        averageEarningPerTask,
        topCategory,
        earningsByMonth,
        recentEarnings,
      });
    } catch (error) {
      console.error('שגיאה בטעינת נתוני הכנסות:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEarningsData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return `₪${amount.toLocaleString('he-IL')}`;
  };

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <View style={styles.statHeader}>
          <Ionicons name="cash" size={24} color="#10B981" />
          <Text style={styles.statTitle}>הכנסות כוללות</Text>
        </View>
        <Text style={styles.statValue}>{formatCurrency(earningsData.totalEarnings)}</Text>
        <Text style={styles.statSubtext}>{earningsData.completedTasks} משימות הושלמו</Text>
      </View>

      <View style={styles.statCard}>
        <View style={styles.statHeader}>
          <Ionicons name="calendar" size={24} color="#3B82F6" />
          <Text style={styles.statTitle}>החודש</Text>
        </View>
        <Text style={styles.statValue}>{formatCurrency(earningsData.thisMonthEarnings)}</Text>
        <Text style={styles.statSubtext}>
          {earningsData.lastMonthEarnings > 0 ? 
            `${((earningsData.thisMonthEarnings - earningsData.lastMonthEarnings) / earningsData.lastMonthEarnings * 100).toFixed(1)}% מהחודש הקודם` : 
            'אין נתונים מהחודש הקודם'
          }
        </Text>
      </View>

      <View style={styles.statCard}>
        <View style={styles.statHeader}>
          <Ionicons name="trending-up" size={24} color="#F59E0B" />
          <Text style={styles.statTitle}>ממוצע למשימה</Text>
        </View>
        <Text style={styles.statValue}>{formatCurrency(Math.round(earningsData.averageEarningPerTask))}</Text>
        <Text style={styles.statSubtext}>קטגוריה פופולרית: {earningsData.topCategory}</Text>
      </View>
    </View>
  );

  const renderMonthlyChart = () => (
    <View style={styles.chartCard}>
      <Text style={styles.sectionTitle}>הכנסות לפי חודשים</Text>
      <View style={styles.chartContainer}>
        {earningsData.earningsByMonth.map((month, index) => {
          const maxAmount = Math.max(...earningsData.earningsByMonth.map(m => m.amount));
          const height = maxAmount > 0 ? (month.amount / maxAmount) * 120 : 0;
          
          return (
            <View key={index} style={styles.chartBar}>
              <View style={[styles.bar, { height: height }]} />
              <Text style={styles.barLabel}>{month.month}</Text>
              <Text style={styles.barValue}>{formatCurrency(month.amount)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderRecentEarnings = () => (
    <View style={styles.recentCard}>
      <Text style={styles.sectionTitle}>הכנסות אחרונות</Text>
      <View style={styles.earningsList}>
        {earningsData.recentEarnings.map((earning, index) => (
          <View key={earning.id} style={styles.earningItem}>
            <View style={styles.earningIcon}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </View>
            <View style={styles.earningContent}>
              <Text style={styles.earningTitle}>{earning.taskTitle}</Text>
              <Text style={styles.earningClient}>{earning.clientName}</Text>
              <Text style={styles.earningDate}>{earning.date}</Text>
            </View>
            <Text style={styles.earningAmount}>{formatCurrency(earning.amount)}</Text>
          </View>
        ))}
        {earningsData.recentEarnings.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="cash-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>אין הכנסות עדיין</Text>
            <Text style={styles.emptySubtext}>התחל לעבוד כדי לראות הכנסות כאן</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>הכנסות שלי</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Stats Cards */}
        {renderStatsCards()}

        {/* Monthly Chart */}
        {renderMonthlyChart()}

        {/* Recent Earnings */}
        {renderRecentEarnings()}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingTop: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 8,
    textAlign: 'right',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'right',
  },
  statSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'right',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  bar: {
    width: 20,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  barValue: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  recentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  earningsList: {
    gap: 12,
  },
  earningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  earningIcon: {
    marginRight: 12,
  },
  earningContent: {
    flex: 1,
  },
  earningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
    textAlign: 'right',
  },
  earningClient: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
    textAlign: 'right',
  },
  earningDate: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  earningAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
    marginLeft: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 20,
  },
});




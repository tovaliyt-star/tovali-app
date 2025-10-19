import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Task } from '../entities/Task';
import { useUserData } from '../context/UserDataContext';

type ProviderMyWorkNavigationProp = StackNavigationProp<RootStackParamList>;

interface MyTask {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  time: string;
  price: string;
  status: string;
  clientName: string;
  estimatedDuration: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProviderMyWorkScreen() {
  const navigation = useNavigation<ProviderMyWorkNavigationProp>();
  const { userData } = useUserData();
  const [refreshing, setRefreshing] = useState(false);
  const [myTasks, setMyTasks] = useState<MyTask[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'מוקצה' | 'בביצוע' | 'הושלם'>('all');

  useEffect(() => {
    loadMyTasks();
  }, [filterStatus]);

  const loadMyTasks = async () => {
    try {
      if (!userData?.id) return;

      // קבלת כל המשימות של נותן השירות
      const allTasks = await Task.getByProviderId(userData.id);
      
      // המרה לפורמט נדרש
      const formattedTasks: MyTask[] = allTasks.map(task => ({
        id: task.id || '',
        title: task.description,
        description: task.description,
        category: task.category,
        location: task.location,
        date: task.date.toISOString().split('T')[0],
        time: task.time,
        price: task.price,
        status: task.status,
        clientName: `לקוח ${task.client_id}`,
        estimatedDuration: task.estimated_duration,
        createdAt: task.created_at?.toISOString() || '',
        updatedAt: task.updated_at?.toISOString() || '',
      }));

      // סינון לפי סטטוס
      const filteredTasks = filterStatus === 'all' 
        ? formattedTasks 
        : formattedTasks.filter(task => task.status === filterStatus);

      // מיון לפי תאריך עדכון (החדשים ביותר ראשון)
      filteredTasks.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      setMyTasks(filteredTasks);
    } catch (error) {
      console.error('שגיאה בטעינת המשימות שלי:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMyTasks();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'פתוח':
        return '#6B7280';
      case 'מוקצה':
        return '#3B82F6';
      case 'בביצוע':
        return '#F59E0B';
      case 'הושלם':
        return '#10B981';
      case 'בוטל':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'פתוח':
        return 'פתוח';
      case 'מוקצה':
        return 'מתוזמן';
      case 'בביצוע':
        return 'בביצוע';
      case 'הושלם':
        return 'הושלם';
      case 'בוטל':
        return 'בוטל';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'פתוח':
        return 'time-outline';
      case 'מוקצה':
        return 'calendar-outline';
      case 'בביצוע':
        return 'play-circle-outline';
      case 'הושלם':
        return 'checkmark-circle-outline';
      case 'בוטל':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const handleTaskPress = (task: MyTask) => {
    navigation.navigate('TaskDetail', {
      taskId: task.id,
      task: task,
      isMyTask: true,
    });
  };

  const handleStartTask = async (taskId: string) => {
    try {
      await Task.update(taskId, { status: 'בביצוע' });
      await loadMyTasks();
      Alert.alert('הצלחה', 'התחלת לעבוד על המשימה');
    } catch (error) {
      Alert.alert('שגיאה', 'לא ניתן להתחיל את המשימה');
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await Task.update(taskId, { status: 'הושלם' });
      await loadMyTasks();
      Alert.alert('הצלחה', 'המשימה הושלמה בהצלחה');
    } catch (error) {
      Alert.alert('שגיאה', 'לא ניתן להשלים את המשימה');
    }
  };

  const handleCancelTask = async (taskId: string) => {
    Alert.alert(
      'ביטול משימה',
      'האם אתה בטוח שברצונך לבטל את המשימה?',
      [
        { text: 'לא', style: 'cancel' },
        { 
          text: 'כן, בטל', 
          style: 'destructive',
          onPress: async () => {
            try {
              await Task.update(taskId, { status: 'בוטל' });
              await loadMyTasks();
              Alert.alert('הצלחה', 'המשימה בוטלה');
            } catch (error) {
              Alert.alert('שגיאה', 'לא ניתן לבטל את המשימה');
            }
          }
        }
      ]
    );
  };

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterButtons}>
          <TouchableOpacity 
            style={[styles.filterButton, filterStatus === 'all' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('all')}
          >
            <Text style={[styles.filterText, filterStatus === 'all' && styles.filterTextActive]}>
              הכל
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, filterStatus === 'מוקצה' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('מוקצה')}
          >
            <Text style={[styles.filterText, filterStatus === 'מוקצה' && styles.filterTextActive]}>
              מתוזמן
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, filterStatus === 'בביצוע' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('בביצוע')}
          >
            <Text style={[styles.filterText, filterStatus === 'בביצוע' && styles.filterTextActive]}>
              בביצוע
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, filterStatus === 'הושלם' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('הושלם')}
          >
            <Text style={[styles.filterText, filterStatus === 'הושלם' && styles.filterTextActive]}>
              הושלם
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderTaskCard = (task: MyTask) => (
    <TouchableOpacity 
      key={task.id} 
      style={styles.taskCard}
      onPress={() => handleTaskPress(task)}
    >
      <View style={styles.taskHeader}>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskCategory}>{task.category}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
          <Ionicons name={getStatusIcon(task.status) as any} size={16} color="#FFFFFF" />
          <Text style={styles.statusText}>{getStatusText(task.status)}</Text>
        </View>
      </View>

      <View style={styles.taskDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#6B7280" />
          <Text style={styles.detailText}>{task.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text style={styles.detailText}>{formatDate(task.date)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <Text style={styles.detailText}>{task.time} • {task.estimatedDuration} שעות</Text>
        </View>
      </View>

      <View style={styles.taskFooter}>
        <Text style={styles.taskPrice}>₪{task.price}</Text>
        <View style={styles.taskActions}>
          {task.status === 'מוקצה' && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleStartTask(task.id)}
            >
              <Ionicons name="play" size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>התחל</Text>
            </TouchableOpacity>
          )}
          {task.status === 'בביצוע' && (
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#10B981' }]}
              onPress={() => handleCompleteTask(task.id)}
            >
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>השלם</Text>
            </TouchableOpacity>
          )}
          {(task.status === 'מוקצה' || task.status === 'בביצוע') && (
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
              onPress={() => handleCancelTask(task.id)}
            >
              <Ionicons name="close" size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>בטל</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="briefcase-outline" size={64} color="#9CA3AF" />
      <Text style={styles.emptyText}>
        {filterStatus === 'all' ? 'אין משימות עדיין' : `אין משימות בסטטוס "${getStatusText(filterStatus)}"`}
      </Text>
      <Text style={styles.emptySubtext}>
        {filterStatus === 'all' 
          ? 'חפש משימות חדשות כדי להתחיל לעבוד' 
          : 'בדוק סטטוסים אחרים או חפש משימות חדשות'
        }
      </Text>
      <TouchableOpacity 
        style={styles.findTasksButton}
        onPress={() => navigation.navigate('ProviderTasks')}
      >
        <Ionicons name="search" size={20} color="#FFFFFF" />
        <Text style={styles.findTasksButtonText}>חפש משימות</Text>
      </TouchableOpacity>
    </View>
  );

  const getStatsForFilter = () => {
    const totalTasks = myTasks.length;
    const completedTasks = myTasks.filter(task => task.status === 'הושלם').length;
    const activeTasks = myTasks.filter(task => task.status === 'בביצוע').length;
    const scheduledTasks = myTasks.filter(task => task.status === 'מוקצה').length;

    return { totalTasks, completedTasks, activeTasks, scheduledTasks };
  };

  const renderStats = () => {
    const stats = getStatsForFilter();
    
    return (
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.totalTasks}</Text>
          <Text style={styles.statLabel}>סה"כ משימות</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.completedTasks}</Text>
          <Text style={styles.statLabel}>הושלמו</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.activeTasks}</Text>
          <Text style={styles.statLabel}>בביצוע</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.scheduledTasks}</Text>
          <Text style={styles.statLabel}>מתוזמנות</Text>
        </View>
      </View>
    );
  };

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
          <Text style={styles.headerTitle}>העבודה שלי</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('ProviderTasks')}
          >
            <Ionicons name="search" size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        {renderStats()}

        {/* Filter Buttons */}
        {renderFilterButtons()}

        {/* Tasks List */}
        {myTasks.length > 0 ? (
          <View style={styles.tasksList}>
            {myTasks.map(renderTaskCard)}
          </View>
        ) : (
          renderEmptyState()
        )}

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
  addButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  tasksList: {
    gap: 12,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'right',
  },
  taskCategory: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  taskDetails: {
    marginBottom: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    textAlign: 'right',
    flex: 1,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  taskActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
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
    marginBottom: 24,
  },
  findTasksButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  findTasksButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 20,
  },
});













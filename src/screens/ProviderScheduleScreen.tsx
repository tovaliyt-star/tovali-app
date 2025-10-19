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

type ProviderScheduleNavigationProp = StackNavigationProp<RootStackParamList>;

interface ScheduledTask {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  price: string;
  status: string;
  clientName: string;
  category: string;
}

export default function ProviderScheduleScreen() {
  const navigation = useNavigation<ProviderScheduleNavigationProp>();
  const { userData } = useUserData();
  const [refreshing, setRefreshing] = useState(false);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    loadScheduledTasks();
  }, [selectedDate, viewMode]);

  const loadScheduledTasks = async () => {
    try {
      if (!userData?.id) return;

      // קבלת כל המשימות של נותן השירות
      const allTasks = await Task.getByProviderId(userData.id);
      
      // סינון משימות מתוזמנות (מוקצות או בביצוע)
      const scheduledTasks = allTasks.filter(task => 
        task.status === 'active' || task.status === 'in_progress' || 
        task.status === 'מוקצה' || task.status === 'בביצוע' ||
        task.status === 'פתוח'
      );

      // המרה לפורמט נדרש
      const formattedTasks: ScheduledTask[] = scheduledTasks.map(task => ({
        id: task.id || '',
        title: task.description,
        description: task.description,
        date: task.date.toISOString().split('T')[0],
        time: task.time,
        location: task.location,
        price: task.price,
        status: task.status,
        clientName: `לקוח ${task.client_id}`,
        category: task.category,
      }));

      setScheduledTasks(formattedTasks);
    } catch (error) {
      console.error('שגיאה בטעינת משימות מתוזמנות:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadScheduledTasks();
    setRefreshing(false);
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return scheduledTasks.filter(task => task.date === dateStr);
  };

  const getTasksForWeek = (startDate: Date) => {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    return scheduledTasks.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate >= startDate && taskDate <= endDate;
    });
  };

  const getTasksForMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    return scheduledTasks.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate.getFullYear() === year && taskDate.getMonth() === month;
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('he-IL', {
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
      case 'active':
        return '#3B82F6';
      case 'in_progress':
        return '#F59E0B';
      case 'מוקצה':
        return '#3B82F6';
      case 'בביצוע':
        return '#F59E0B';
      case 'פתוח':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'מתוזמן';
      case 'in_progress':
        return 'בביצוע';
      case 'מוקצה':
        return 'מתוזמן';
      case 'בביצוע':
        return 'בביצוע';
      case 'פתוח':
        return 'פתוח';
      default:
        return status;
    }
  };

  const handleTaskPress = (task: ScheduledTask) => {
    Alert.alert(
      task.title,
      `תאריך: ${formatDate(new Date(task.date))}\nשעה: ${task.time}\nמיקום: ${task.location}\nמחיר: ₪${task.price}`,
      [
        { text: 'סגור', style: 'cancel' },
        { text: 'פרטים נוספים', onPress: () => {
          // TODO: ניווט למסך פרטי המשימה
          console.log('פתיחת פרטי משימה:', task.id);
        }}
      ]
    );
  };

  const handleStartTask = async (taskId: string) => {
    try {
      await Task.update(taskId, { status: 'in_progress' });
      await loadScheduledTasks();
      Alert.alert('הצלחה', 'התחלת לעבוד על המשימה');
    } catch (error) {
      Alert.alert('שגיאה', 'לא ניתן להתחיל את המשימה');
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await Task.update(taskId, { status: 'completed' });
      await loadScheduledTasks();
      Alert.alert('הצלחה', 'המשימה הושלמה בהצלחה! ההכנסה נוספה לחשבון שלך');
    } catch (error) {
      Alert.alert('שגיאה', 'לא ניתן להשלים את המשימה');
    }
  };

  const renderDateHeader = () => (
    <View style={styles.dateHeader}>
      <TouchableOpacity 
        style={styles.dateButton}
        onPress={() => {
          const newDate = new Date(selectedDate);
          newDate.setDate(newDate.getDate() - 1);
          setSelectedDate(newDate);
        }}
      >
        <Ionicons name="chevron-back" size={20} color="#3B82F6" />
      </TouchableOpacity>
      
      <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
      
      <TouchableOpacity 
        style={styles.dateButton}
        onPress={() => {
          const newDate = new Date(selectedDate);
          newDate.setDate(newDate.getDate() + 1);
          setSelectedDate(newDate);
        }}
      >
        <Ionicons name="chevron-forward" size={20} color="#3B82F6" />
      </TouchableOpacity>
    </View>
  );

  const renderViewModeSelector = () => (
    <View style={styles.viewModeSelector}>
      <TouchableOpacity 
        style={[styles.viewModeButton, viewMode === 'day' && styles.viewModeButtonActive]}
        onPress={() => setViewMode('day')}
      >
        <Text style={[styles.viewModeText, viewMode === 'day' && styles.viewModeTextActive]}>
          יום
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.viewModeButton, viewMode === 'week' && styles.viewModeButtonActive]}
        onPress={() => setViewMode('week')}
      >
        <Text style={[styles.viewModeText, viewMode === 'week' && styles.viewModeTextActive]}>
          שבוע
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.viewModeButton, viewMode === 'month' && styles.viewModeButtonActive]}
        onPress={() => setViewMode('month')}
      >
        <Text style={[styles.viewModeText, viewMode === 'month' && styles.viewModeTextActive]}>
          חודש
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderDayView = () => {
    const dayTasks = getTasksForDate(selectedDate);
    
    return (
      <View style={styles.dayView}>
        <Text style={styles.sectionTitle}>משימות ליום</Text>
        {dayTasks.length > 0 ? (
          <View style={styles.tasksList}>
            {dayTasks.map((task) => (
              <TouchableOpacity 
                key={task.id} 
                style={styles.taskCard}
                onPress={() => handleTaskPress(task)}
              >
                <View style={styles.taskHeader}>
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskTime}>{task.time}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(task.status)}</Text>
                  </View>
                </View>
                <View style={styles.taskDetails}>
                  <Text style={styles.taskLocation}>{task.location}</Text>
                  <Text style={styles.taskPrice}>₪{task.price}</Text>
                </View>
                <View style={styles.taskActions}>
                  {(task.status === 'active' || task.status === 'פתוח') && (
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleStartTask(task.id)}
                    >
                      <Ionicons name="play" size={16} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>התחל</Text>
                    </TouchableOpacity>
                  )}
                  {task.status === 'in_progress' && (
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: '#10B981' }]}
                      onPress={() => handleCompleteTask(task.id)}
                    >
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>השלם</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>אין משימות מתוזמנות ליום זה</Text>
            <Text style={styles.emptySubtext}>בדוק תאריכים אחרים או חפש משימות חדשות</Text>
          </View>
        )}
      </View>
    );
  };

  const renderWeekView = () => {
    const weekTasks = getTasksForWeek(selectedDate);
    
    return (
      <View style={styles.weekView}>
        <Text style={styles.sectionTitle}>משימות לשבוע</Text>
        {weekTasks.length > 0 ? (
          <View style={styles.tasksList}>
            {weekTasks.map((task) => (
              <TouchableOpacity 
                key={task.id} 
                style={styles.taskCard}
                onPress={() => handleTaskPress(task)}
              >
                <View style={styles.taskHeader}>
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskDate}>{formatDate(new Date(task.date))}</Text>
                    <Text style={styles.taskTime}>{task.time}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(task.status)}</Text>
                  </View>
                </View>
                <View style={styles.taskDetails}>
                  <Text style={styles.taskLocation}>{task.location}</Text>
                  <Text style={styles.taskPrice}>₪{task.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>אין משימות מתוזמנות לשבוע זה</Text>
            <Text style={styles.emptySubtext}>בדוק שבועות אחרים או חפש משימות חדשות</Text>
          </View>
        )}
      </View>
    );
  };

  const renderMonthView = () => {
    const monthTasks = getTasksForMonth(selectedDate);
    
    return (
      <View style={styles.monthView}>
        <Text style={styles.sectionTitle}>משימות לחודש</Text>
        {monthTasks.length > 0 ? (
          <View style={styles.tasksList}>
            {monthTasks.map((task) => (
              <TouchableOpacity 
                key={task.id} 
                style={styles.taskCard}
                onPress={() => handleTaskPress(task)}
              >
                <View style={styles.taskHeader}>
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskDate}>{formatDate(new Date(task.date))}</Text>
                    <Text style={styles.taskTime}>{task.time}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(task.status)}</Text>
                  </View>
                </View>
                <View style={styles.taskDetails}>
                  <Text style={styles.taskLocation}>{task.location}</Text>
                  <Text style={styles.taskPrice}>₪{task.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>אין משימות מתוזמנות לחודש זה</Text>
            <Text style={styles.emptySubtext}>בדוק חודשים אחרים או חפש משימות חדשות</Text>
          </View>
        )}
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
          <Text style={styles.headerTitle}>לוח זמנים</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('ProviderTasks')}
          >
            <Ionicons name="add" size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        {/* Date Header */}
        {renderDateHeader()}

        {/* View Mode Selector */}
        {renderViewModeSelector()}

        {/* Content based on view mode */}
        {viewMode === 'day' && renderDayView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'month' && renderMonthView()}

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
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dateButton: {
    padding: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  viewModeSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  viewModeButtonActive: {
    backgroundColor: '#3B82F6',
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  viewModeTextActive: {
    color: '#FFFFFF',
  },
  dayView: {
    marginBottom: 20,
  },
  weekView: {
    marginBottom: 20,
  },
  monthView: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'right',
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
  taskDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
    textAlign: 'right',
  },
  taskTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  taskDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskLocation: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
    flex: 1,
  },
  taskPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
    marginLeft: 12,
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
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




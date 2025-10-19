import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Task, TaskData } from '../entities/Task';
import { TaskApplication } from '../entities/TaskApplication';
import { useUserData } from '../context/UserDataContext';
import { useUserMode } from '../context/UserModeContext';
import { loadTasksByRequester, loadActiveTasksForProvider, getPendingApplicationsCount, saveTaskApplication, deleteTask, loadUserData, loadAllApplications } from '../utils';
import { Chat } from '../entities/Chat';

type Props = BottomTabScreenProps<TabParamList, 'Tasks'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

export default function TasksScreen({ navigation }: Props) {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const { userData } = useUserData();
  const { userMode } = useUserMode();
  const stackNavigation = useNavigation<NavigationProp>();

  useEffect(() => {
    loadTasks();
  }, [userMode, userData]);

  const loadTasks = async () => {
    try {
      if (!userData?.id) return;

      let tasksList: TaskData[] = [];
      
      if (userMode === 'customer') {
        tasksList = await loadTasksByRequester(userData.id);
      } else if (userMode === 'provider') {
        tasksList = await loadActiveTasksForProvider();
        const count = await getPendingApplicationsCount(userData.id);
        setPendingCount(count);
      }
      
      setTasks(tasksList);
    } catch (error) {
      console.error('Error loading tasks:', error);
      Alert.alert('שגיאה', 'אירעה שגיאה בטעינת המשימות. אנא נסה שוב.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const handleTaskPress = (task: TaskData) => {
    if (userMode === 'customer') {
      // מעבר למסך עריכת משימה עם כל הנתונים
      stackNavigation.navigate('CreateTask', { 
        taskData: {
          id: task.id,
          description: task.description,
          category: task.category,
          location: task.location,
          date: task.date,
          endDate: (task as any).endDate,
          isDateRange: (task as any).isDateRange,
          proposedPayment: (task as any).proposedPayment,
          estimatedDuration: (task as any).estimatedDuration,
          images: (task as any).images,
          status: task.status,
          client_id: task.client_id,
          requesterId: (task as any).requesterId,
          requesterName: (task as any).requesterName,
        },
        editMode: true,
      });
    } else {
      Alert.alert(
        'פרטי המשימה',
        `כותרת: ${task.description}\nקטגוריה: ${task.category}\nמיקום: ${task.location || 'לא צוין'}\nתאריך: ${task.date ? new Date(task.date).toLocaleDateString('he-IL') : 'לא צוין'}\nתשלום: ₪${(task as any).proposedPayment || 'לא צוין'}`,
        [{ text: 'סגור', style: 'default' }]
      );
    }
  };

  const handleViewInterestedProviders = async (task: TaskData) => {
    try {
      // מעבר למסך המעוניינים
      (stackNavigation as any).navigate('InterestedProviders', {
        taskId: task.id || '',
        taskTitle: task.description || 'משימה',
        taskDescription: task.description || 'משימה',
      });
    } catch (error) {
      console.error('Error navigating to interested providers:', error);
      Alert.alert('שגיאה', 'אירעה שגיאה בפתיחת מסך המעוניינים. אנא נסה שוב.');
    }
  };

  const handleInterestedInTask = async (task: TaskData) => {
    try {
      if (!userData?.id) {
        Alert.alert('שגיאה', 'לא ניתן לטעון פרטי משתמש');
        return;
      }

      const application = {
        taskId: task.id || '',
        providerId: userData.id,
        providerName: userData.name || 'נותן שירות',
        providerRating: 4.5,
        providerExperience: 'מנוסה',
        applicationMessage: 'אני מעוניין לבצע את המשימה הזו',
        status: 'pending' as const,
        createdAt: new Date(),
      };

      await saveTaskApplication(application);

      Alert.alert(
        'הצלחה!',
        'הבעת עניין במשימה בהצלחה! מחפש השירות יוכל לראות את הפרטים שלך ולבחור בך לביצוע המשימה.',
        [{ text: 'אישור', style: 'default' }]
      );

      await loadTasks();

    } catch (error) {
      console.error('Error applying for task:', error);
      Alert.alert('שגיאה', 'אירעה שגיאה בשליחת הבקשה. אנא נסה שוב.');
    }
  };

  const handleChatWithProvider = async (task: TaskData) => {
    try {
      if (!userData?.id) {
        Alert.alert('שגיאה', 'לא ניתן לטעון פרטי משתמש');
        return;
      }

      const applications = await TaskApplication.getByTaskId(task.id || '');
      const interestedProvider = applications.find(app => app.status === 'pending' || app.status === 'accepted');
      
      if (!interestedProvider) {
        Alert.alert('אין נותן שירות', 'עדיין אין נותן שירות שהביע עניין במשימה זו כמחפש שירות');
        return;
      }

      const providerUser = await loadUserData();
      if (!providerUser) {
        Alert.alert('שגיאה', 'לא ניתן לטעון פרטי נותן השירות');
        return;
      }

      const chat = await Chat.createOrGetForTask(
        task.id || '',
        userData.id,
        interestedProvider.providerId,
        {
          title: task.description || 'משימה',
          category: task.category || 'כללי',
          clientName: userData.name || 'מחפש שירות',
          providerName: interestedProvider.providerName || 'נותן שירות',
        }
      );

      stackNavigation.navigate('ChatDetail' as any, {
        chatId: chat.id,
        chatName: interestedProvider.providerName || 'נותן שירות',
        chatService: task.description || 'משימה',
        chatStatus: 'offline',
        otherParticipantId: interestedProvider.providerId,
      });

    } catch (error) {
      console.error('Error creating chat:', error);
      Alert.alert('שגיאה', 'אירעה שגיאה ביצירת הצ\'אט. אנא נסה שוב.');
    }
  };

  const handleChatWithClient = async (task: TaskData) => {
    try {
      if (!userData?.id) {
        Alert.alert('שגיאה', 'לא ניתן לטעון פרטי משתמש');
        return;
      }

      const chat = await Chat.createOrGetForTask(
        task.id || '',
        task.client_id || (task as any).requesterId || '',
        userData.id,
        {
          title: task.description || 'משימה',
          category: task.category || 'כללי',
          clientName: (task as any).requesterName || 'מחפש שירות',
          providerName: userData.name || 'נותן שירות',
        }
      );

      stackNavigation.navigate('ChatDetail' as any, {
        chatId: chat.id,
        chatName: (task as any).requesterName || 'מחפש שירות',
        chatService: task.description || 'משימה',
        chatStatus: 'offline',
        otherParticipantId: task.client_id || (task as any).requesterId || '',
      });

    } catch (error) {
      console.error('Error creating chat:', error);
      Alert.alert('שגיאה', 'אירעה שגיאה ביצירת הצ\'אט. אנא נסה שוב.');
    }
  };

  const handleDeleteTask = async (task: TaskData) => {
    Alert.alert(
      'מחיקת משימה',
      `האם אתה בטוח שברצונך למחוק את המשימה "${task.description}"?\n\nפעולה זו לא ניתנת לביטול והמשימה תימחק לחלוטין מהמערכת.`,
      [
        {
          text: 'ביטול',
          style: 'cancel',
        },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!task.id) {
                Alert.alert('שגיאה', 'לא ניתן למחוק משימה ללא מזהה');
                return;
              }

              await deleteTask(task.id);
              
              Alert.alert(
                'הצלחה!',
                'המשימה נמחקה בהצלחה מהמערכת.',
                [{ text: 'אישור', style: 'default' }]
              );
              
              await loadTasks();
              
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('שגיאה', 'אירעה שגיאה במחיקת המשימה. אנא נסה שוב.');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'completed': return '#3B82F6';
      case 'pending': return '#F59E0B';
      case 'in_progress': return '#8B5CF6';
      case 'פתוח': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'פעיל';
      case 'completed': return 'הושלם';
      case 'pending': return 'ממתין';
      case 'in_progress': return 'בביצוע';
      case 'פתוח': return 'פתוח';
      default: return status;
    }
  };

  const formatDateTime = (dateString: string, endDateString?: string, isDateRange?: boolean) => {
    if (!dateString) return 'לא צוין תאריך';
    
    try {
      const date = new Date(dateString);
      const dateStr = date.toLocaleDateString('he-IL');
      
      if (isDateRange && endDateString) {
        const endDate = new Date(endDateString);
        const endDateStr = endDate.toLocaleDateString('he-IL');
        return `${dateStr} - ${endDateStr}`;
      }
      
      return dateStr;
    } catch (error) {
      return 'תאריך לא תקין';
    }
  };

  const filteredTasks = tasks.filter(task =>
    task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getModeTitle = () => {
    return userMode === 'provider' ? 'משימות זמינות - נותן שירות' : 'המשימות שלי - מחפש שירות';
  };

  const getModeSubtitle = () => {
    return userMode === 'provider' 
      ? 'משימות שאתה יכול לבצע כותן שירות' 
      : 'נהל את המשימות שלך כמחפש שירות';
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{getModeTitle()}</Text>
          <Text style={styles.headerSubtitle}>{getModeSubtitle()}</Text>
          {userMode === 'provider' && pendingCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>{pendingCount} בקשות חדשות</Text>
            </View>
          )}
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="חיפוש משימות..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.tasksContainer}>
          <Text style={styles.sectionTitle}>
            {userMode === 'provider' ? 'משימות פתוחות לנותן שירות' : 'המשימות שלי כמחפש שירות'}
          </Text>
          {userMode === 'customer' && (
            <Text style={styles.editHint}>
              💡 לחץ על המשימה לעריכה
            </Text>
          )}
          
          {filteredTasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskCard}
              onPress={() => {
                if (userMode === 'customer') {
                  // מעבר למסך עריכת משימה עם כל הנתונים
                  stackNavigation.navigate('CreateTask', { 
        taskData: {
          id: task.id,
          description: task.description,
          category: task.category,
          location: task.location,
          date: task.date,
          endDate: (task as any).endDate,
          isDateRange: (task as any).isDateRange,
          proposedPayment: (task as any).proposedPayment,
          estimatedDuration: (task as any).estimatedDuration,
          images: (task as any).images,
          status: task.status,
          client_id: task.client_id,
          requesterId: (task as any).requesterId,
          requesterName: (task as any).requesterName,
        },
        editMode: true,
                  });
                } else {
                  Alert.alert(
                    'פרטי המשימה',
                    `כותרת: ${task.description}\nקטגוריה: ${task.category}\nמיקום: ${task.location || 'לא צוין'}\nתאריך: ${task.date ? new Date(task.date).toLocaleDateString('he-IL') : 'לא צוין'}\nתשלום: ₪${(task as any).proposedPayment || 'לא צוין'}`,
                    [{ text: 'סגור', style: 'default' }]
                  );
                }
              }}
            >
              <View style={styles.taskHeader}>
                <View style={styles.taskTitleContainer}>
                  <Text style={styles.taskTitle}>{task.description}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status || 'פתוח') }]}>
                    <Text style={styles.statusText}>{getStatusText(task.status || 'פתוח')}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.taskDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="pricetag" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>{task.category}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons name="location" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>{task.location || 'לא צוין מיקום'}</Text>
                </View>
                
                {task.region && (
                  <View style={styles.detailRow}>
                    <Ionicons name="map" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>{task.region}</Text>
                  </View>
                )}
                
                <View style={styles.detailRow}>
                  <Ionicons name="time" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>{(task as any).time || (task as any).timeSlot || 'לא צוין זמן'}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons name="calendar" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>
                    {formatDateTime(task.date?.toString() || '', (task as any).endDate, (task as any).isDateRange)}
                  </Text>
                </View>
                
                {(task as any).proposedPayment && (
                  <View style={styles.detailRow}>
                    <Ionicons name="card" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>₪{(task as any).proposedPayment}</Text>
                  </View>
                )}
              </View>

              <View style={styles.actionContainer}>
                {userMode === 'provider' && (
                  <TouchableOpacity 
                    style={styles.interestedButton}
                    onPress={() => handleInterestedInTask(task)}
                  >
                    <Ionicons name="heart" size={16} color="#FFFFFF" />
                    <Text style={styles.interestedButtonText}>
                      מעוניין במשימה
                    </Text>
                  </TouchableOpacity>
                )}
                
                <View style={styles.actionButtonsRow}>
                  {userMode === 'customer' && (
                    <>
                      <TouchableOpacity 
                        style={styles.interestedProvidersButton}
                        onPress={() => handleViewInterestedProviders(task)}
                      >
                        <Ionicons name="people" size={16} color="#FFFFFF" />
                        <Text style={styles.interestedProvidersButtonText}>מעוניינים</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.chatButton}
                        onPress={() => handleChatWithProvider(task)}
                      >
                        <Ionicons name="chatbubble" size={16} color="#FFFFFF" />
                        <Text style={styles.chatButtonText}>צ'אט</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => handleDeleteTask(task)}
                      >
                        <Ionicons name="trash" size={16} color="#FFFFFF" />
                        <Text style={styles.deleteButtonText}>מחק</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  
                  {userMode === 'provider' && (
                    <>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleTaskPress(task)}
                      >
                        <Text style={styles.actionButtonText}>צפה בפרטים</Text>
                        <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.chatButton}
                        onPress={() => handleChatWithClient(task)}
                      >
                        <Ionicons name="chatbubble" size={16} color="#FFFFFF" />
                        <Text style={styles.chatButtonText}>צ'אט</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredTasks.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>אין משימות</Text>
            <Text style={styles.emptyStateSubtitle}>
              {searchQuery 
                ? 'לא נמצאו משימות לחיפוש שלך' 
                : userMode === 'provider' 
                  ? 'אין משימות זמינות כרגע לנותן שירות' 
                  : 'עדיין לא יצרת משימות כמחפש שירות'
              }
            </Text>
            {userMode === 'customer' && !searchQuery && (
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={onRefresh}
              >
                <Ionicons name="refresh" size={20} color="#FFFFFF" />
                <Text style={styles.refreshButtonText}>רענן משימות</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'right',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'right',
  },
  notificationBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'right',
    fontWeight: '500',
  },
  tasksContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'right',
  },
  editHint: {
    fontSize: 14,
    color: '#3B82F6',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  taskCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  taskHeader: {
    marginBottom: 12,
  },
  taskTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 12,
    textAlign: 'right',
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
  taskDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'flex-end',
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
    textAlign: 'right',
  },
  actionContainer: {
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
  },
  interestedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    gap: 8,
  },
  interestedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  interestedProvidersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  interestedProvidersButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  chatButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    gap: 8,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  refreshButtonText: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 16,
  },
});

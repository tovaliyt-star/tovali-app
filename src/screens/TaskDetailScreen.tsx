import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Chat } from '../entities/Chat';
import { Review } from '../entities/Review';
import { useUserData } from '../context/UserDataContext';
import { useUserMode } from '../context/UserModeContext';

type TaskDetailRouteProp = RouteProp<RootStackParamList, 'TaskDetail'>;
type TaskDetailNavigationProp = StackNavigationProp<RootStackParamList>;

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'active' | 'completed' | 'pending' | 'in_progress' | 'cancelled';
  price: string;
  location: string;
  region: string;
  date: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  estimatedDuration: string;
  providerId?: string;
  providerName?: string;
  requesterId: string;
  requesterName: string;
  createdAt: string;
  updatedAt: string;
}

export default function TaskDetailScreen() {
  const navigation = useNavigation<TaskDetailNavigationProp>();
  const route = useRoute<TaskDetailRouteProp>();
  const { task, isMyTask } = route.params;
  const { userData } = useUserData();
  const { userMode } = useUserMode();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'completed': return '#3B82F6';
      case 'pending': return '#F59E0B';
      case 'in_progress': return '#8B5CF6';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'פעיל';
      case 'completed': return 'הושלם';
      case 'pending': return 'ממתין';
      case 'in_progress': return 'בביצוע';
      case 'cancelled': return 'בוטל';
      default: return 'לא ידוע';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'גבוה';
      case 'medium': return 'בינוני';
      case 'low': return 'נמוך';
      default: return 'לא ידוע';
    }
  };

  // פונקציה לפרסור תאריך ושעה
  const formatDateTime = (dateString: string, timeString: string) => {
    try {
      // אם התאריך הוא ISO string, נמיר אותו
      if (dateString.includes('T') || dateString.includes('Z')) {
        const date = new Date(dateString);
        const formattedDate = date.toLocaleDateString('he-IL', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        return `${formattedDate}, ${timeString}`;
      }
      // אם התאריך כבר בפורמט קריא, נחזיר אותו כמו שהוא
      return `${dateString}, ${timeString}`;
    } catch (error) {
      // אם יש שגיאה בפרסור, נחזיר את הערכים המקוריים
      return `${dateString}, ${timeString}`;
    }
  };

  // פונקציה נפרדת לתאריך
  const formatDateOnly = (dateString: string) => {
    try {
      if (dateString.includes('T') || dateString.includes('Z')) {
        const date = new Date(dateString);
        return date.toLocaleDateString('he-IL', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      return dateString;
    } catch (error) {
      return dateString;
    }
  };

  const handleEditTask = () => {
    // נפתח מסך עריכה עם הנתונים הקיימים
    navigation.navigate('CreateTask', {
      editMode: true,
      taskData: task
    });
  };

  const handleCallCustomer = () => {
    // הצגת אפשרויות התקשרות
    Alert.alert(
      'התקשרות ללקוח',
      `בחר איך להתקשר עם ${task.requesterName}`,
      [
        { text: 'ביטול', style: 'cancel' },
        { 
          text: 'התקשר עכשיו', 
          onPress: () => {
            // כאן נוכל להוסיף לוגיקה להתקשרות אמיתית
            Alert.alert(
              'התקשרות',
              'התקשרות ללקוח תתבצע בקרוב...',
              [{ text: 'אישור', style: 'default' }]
            );
          }
        },
        { 
          text: 'שלח הודעה', 
          onPress: () => {
            // מעבר לצ'אט
            handleOpenChat();
          }
        }
      ]
    );
  };

  const handleOpenChat = async () => {
    try {
      if (!userData?.id) {
        Alert.alert('שגיאה', 'לא ניתן לפתוח צ\'אט - משתמש לא מזוהה');
        return;
      }

      // Determine if current user is client or provider
      const isClient = userData.id === task.requesterId;
      const clientId = isClient ? userData.id : task.requesterId;
      const providerId = isClient ? task.providerId || 'temp_provider' : userData.id;

      // Create or get existing chat for this task
      const chat = await Chat.createOrGetForTask(task.id, clientId, providerId);
      
      // Navigate to chat detail
      navigation.navigate('ChatDetail' as any, {
        chatId: chat.id,
        chatName: isClient ? (task.providerName || 'נותן שירות') : task.requesterName,
        chatService: task.title,
        chatStatus: 'online',
        otherParticipantId: isClient ? providerId : clientId,
      });
      
    } catch (error) {
      console.error('שגיאה בפתיחת צ\'אט:', error);
      Alert.alert('שגיאה', 'לא ניתן לפתוח צ\'אט כרגע');
    }
  };

  const handleCreateReview = async () => {
    if (!userData?.id) {
      Alert.alert('שגיאה', 'לא ניתן ליצור ביקורת - משתמש לא מזוהה');
      return;
    }

    try {
      // Determine who to review
      const isClient = userData.id === task.requesterId;
      const reviewedUserId = isClient ? (task.providerId || '') : task.requesterId;
      const reviewedUserName = isClient ? (task.providerName || 'נותן שירות') : task.requesterName;

      if (!reviewedUserId) {
        Alert.alert('שגיאה', 'לא ניתן ליצור ביקורת - מידע חסר');
        return;
      }

      // Check if user can review
      const canReview = await Review.canUserReview(userData.id, reviewedUserId, task.id);
      if (!canReview) {
        Alert.alert('שגיאה', 'לא ניתן לכתוב ביקורת עבור משימה זו');
        return;
      }

      // Navigate to create review screen
      navigation.navigate('CreateReview' as any, {
        taskId: task.id,
        reviewedUserId,
        reviewedUserName,
        reviewedUserAvatar: undefined, // We can add this later if needed
        serviceTitle: task.title,
        serviceCategory: task.category,
      });
    } catch (error) {
      console.error('Error creating review:', error);
      Alert.alert('שגיאה', 'אירעה שגיאה ביצירת הביקורת');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#3B82F6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>פרטי משימה</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Task Card */}
        <View style={styles.taskCard}>
          {/* Title and Status */}
          <View style={styles.titleSection}>
            <Text style={styles.taskTitle} numberOfLines={2}>
              {task.title}
            </Text>
            <View style={styles.badgesContainer}>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
                <Text style={styles.priorityText}>
                  {getPriorityText(task.priority)}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
                <Text style={styles.statusText}>{getStatusText(task.status)}</Text>
              </View>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>מחיר</Text>
            <Text style={styles.priceText}>{task.price}</Text>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionLabel}>תיאור המשימה</Text>
            <Text style={styles.descriptionText}>{task.description}</Text>
          </View>

          {/* Task Details Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Ionicons name="location" size={20} color="#6B7280" />
              <Text style={styles.detailLabel}>מיקום</Text>
              <Text style={styles.detailValue}>{task.location}</Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="time" size={20} color="#6B7280" />
              <Text style={styles.detailLabel}>תאריך ושעה</Text>
              <View style={styles.dateTimeContainer}>
                <Text style={styles.dateText}>{formatDateOnly(task.date)}</Text>
                <Text style={styles.timeText}>{task.time}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="hourglass" size={20} color="#6B7280" />
              <Text style={styles.detailLabel}>משך משוער</Text>
              <Text style={styles.detailValue}>{task.estimatedDuration}</Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="pricetag" size={20} color="#6B7280" />
              <Text style={styles.detailLabel}>קטגוריה</Text>
              <Text style={styles.detailValue}>{task.category}</Text>
            </View>
          </View>

          {/* Additional Info */}
          {isMyTask && task.providerName && task.status === 'in_progress' && (
            <View style={styles.providerSection}>
              <Text style={styles.sectionLabel}>נותן שירות</Text>
              <View style={styles.providerInfo}>
                <Ionicons name="briefcase" size={20} color="#3B82F6" />
                <Text style={styles.providerText}>{task.providerName}</Text>
              </View>
            </View>
          )}

          {!isMyTask && task.requesterName && (
            <View style={styles.requesterSection}>
              <Text style={styles.sectionLabel}>מזמין השירות</Text>
              <View style={styles.requesterInfo}>
                <Ionicons name="person" size={20} color="#3B82F6" />
                <Text style={styles.requesterText}>{task.requesterName}</Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {isMyTask && (
              <TouchableOpacity style={styles.editButton} onPress={handleEditTask}>
                <Ionicons name="create" size={20} color="#FFFFFF" />
                <Text style={styles.editButtonText}>ערוך משימה</Text>
              </TouchableOpacity>
            )}
            
            {!isMyTask && (
              <>
                <TouchableOpacity style={styles.callButton} onPress={handleCallCustomer}>
                  <Ionicons name="call" size={20} color="#FFFFFF" />
                  <Text style={styles.callButtonText}>התקשר ללקוח</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.chatButton} onPress={handleOpenChat}>
                  <Ionicons name="chatbubble" size={20} color="#FFFFFF" />
                  <Text style={styles.chatButtonText}>פתח צ'אט</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Review Button - Show for completed tasks */}
            {task.status === 'completed' && (
              <TouchableOpacity style={styles.reviewButton} onPress={handleCreateReview}>
                <Ionicons name="star" size={20} color="#FFFFFF" />
                <Text style={styles.reviewButtonText}>כתב ביקורת</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.closeButton} onPress={handleBack}>
              <Text style={styles.closeButtonText}>סגור</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  titleSection: {
    marginBottom: 24,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 14,
    textAlign: 'right',
    lineHeight: 28,
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  priceSection: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: '#E0E7FF',
    borderRadius: 18,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 8,
  },
  priceText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E40AF',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'right',
  },
  descriptionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    textAlign: 'right',
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
    justifyContent: 'center',
  },
  detailItem: {
    width: (width - 96) / 2,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 80,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 4,
  },
     detailValue: {
     fontSize: 14,
     fontWeight: '700',
     color: '#1F2937',
     textAlign: 'center',
   },
   dateTimeContainer: {
     alignItems: 'center',
     justifyContent: 'center',
     minHeight: 40,
   },
   dateText: {
     fontSize: 13,
     fontWeight: '700',
     color: '#1F2937',
     textAlign: 'center',
     marginBottom: 4,
     lineHeight: 16,
   },
   timeText: {
     fontSize: 12,
     fontWeight: '600',
     color: '#6B7280',
     textAlign: 'center',
     lineHeight: 14,
   },
  providerSection: {
    marginBottom: 24,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  providerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginLeft: 12,
  },
  requesterSection: {
    marginBottom: 24,
  },
  requesterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  requesterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginLeft: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    flex: 1,
    minWidth: '48%',
    maxWidth: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    paddingVertical: 16,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  callButton: {
    flex: 1,
    minWidth: '48%',
    maxWidth: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 20,
    paddingVertical: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  callButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  chatButton: {
    flex: 1,
    minWidth: '48%',
    maxWidth: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    paddingVertical: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  reviewButton: {
    flex: 1,
    minWidth: '48%',
    maxWidth: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    borderRadius: 20,
    paddingVertical: 16,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  reviewButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  closeButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 16,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
});

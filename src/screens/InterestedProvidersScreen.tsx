import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { loadAllApplications } from '../utils';
import { Chat } from '../entities/Chat';
import { Task } from '../entities/Task';
import { TaskApplication } from '../entities/TaskApplication';
import { useUserData } from '../context/UserDataContext';

type RootStackParamList = {
  InterestedProviders: {
    taskId: string;
    taskTitle: string;
    taskDescription: string;
  };
};

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'InterestedProviders'>;
  route: RouteProp<RootStackParamList, 'InterestedProviders'>;
};

const { width } = Dimensions.get('window');

interface ProviderApplication {
  id: string;
  taskId: string;
  providerId: string;
  providerName: string;
  providerPhone?: string;
  providerEmail?: string;
  providerRating?: number;
  providerExperience?: string;
  applicationMessage?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  appliedAt: string;
}

export default function InterestedProvidersScreen({ navigation, route }: Props) {
  const { taskId, taskTitle, taskDescription } = route.params;
  const { userData } = useUserData();
  const [applications, setApplications] = useState<ProviderApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadApplications = async () => {
    try {
      const allApplications = await loadAllApplications();
      const taskApplications = allApplications.filter(app => app.taskId === taskId);
      setApplications(taskApplications);
    } catch (error) {
      console.error('Error loading applications:', error);
      Alert.alert('שגיאה', 'אירעה שגיאה בטעינת המעוניינים. אנא נסה שוב.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [taskId]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadApplications();
  };

  const handleChatWithProvider = async (application: ProviderApplication) => {
    try {
      if (!userData?.id) {
        Alert.alert('שגיאה', 'לא ניתן לטעון פרטי משתמש');
        return;
      }

      const chat = await Chat.createOrGetForTask(
        taskId,
        application.providerId,
        userData.id,
        {
          title: taskDescription || 'משימה',
          category: 'כללי',
          clientName: userData.name || 'לקוח',
          providerName: application.providerName || 'נותן שירות',
        }
      );

      navigation.navigate('ChatDetail' as any, {
        chatId: chat.id,
        chatName: application.providerName || 'נותן שירות',
        chatService: taskDescription || 'משימה',
        chatStatus: 'offline',
        otherParticipantId: application.providerId,
      });
    } catch (error) {
      console.error('Error creating chat:', error);
      Alert.alert('שגיאה', 'אירעה שגיאה ביצירת הצ\'אט. אנא נסה שוב.');
    }
  };

  const handleCallProvider = (application: ProviderApplication) => {
    if (application.providerPhone) {
      Alert.alert(
        'יצירת קשר טלפוני',
        `האם ברצונך להתקשר ל-${application.providerName}?\nטלפון: ${application.providerPhone}`,
        [
          { text: 'ביטול', style: 'cancel' },
          { 
            text: 'התקשר', 
            style: 'default',
            onPress: () => {
              // כאן אפשר להוסיף פונקציונליות להתקשרות
              Alert.alert('התקשרות', 'הפונקציה תהיה זמינה בקרוב');
            }
          }
        ]
      );
    } else {
      Alert.alert('אין מספר טלפון', 'לנותן השירות הזה אין מספר טלפון זמין');
    }
  };

  const handleAcceptProvider = async (application: ProviderApplication) => {
    Alert.alert(
      'קבלת נותן שירות',
      `האם ברצונך לבחור ב-${application.providerName} לביצוע המשימה?`,
      [
        { text: 'ביטול', style: 'cancel' },
        { 
          text: 'בחר', 
          style: 'default',
          onPress: async () => {
            try {
              // עדכון סטטוס הבקשה למאושר
              await TaskApplication.accept(application.id);
              
              // עדכון סטטוס המשימה למוקצה לנותן השירות
              await Task.update(taskId, { 
                status: 'active',
                provider_id: application.providerId 
              });
              
              Alert.alert('הצלחה!', `${application.providerName} נבחר לביצוע המשימה והמשימה נוספה ללוח הזמנים שלו`);
              
              // רענון הרשימה
              await loadApplications();
            } catch (error) {
              console.error('Error accepting provider:', error);
              Alert.alert('שגיאה', 'אירעה שגיאה בבחירת נותן השירות. אנא נסה שוב.');
            }
          }
        }
      ]
    );
  };

  const renderProviderCard = (application: ProviderApplication) => (
    <View key={application.id} style={styles.providerCard}>
      <View style={styles.providerHeader}>
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{application.providerName}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text style={styles.ratingText}>
              {application.providerRating || 4.5}
            </Text>
            <Text style={styles.experienceText}>
              {application.providerExperience || 'מנוסה'}
            </Text>
          </View>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {application.status === 'pending' ? 'ממתין' : 
             application.status === 'accepted' ? 'מאושר' : 
             application.status === 'rejected' ? 'נדחה' : 'נסוג'}
          </Text>
        </View>
      </View>

      {application.applicationMessage && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageLabel}>הודעה:</Text>
          <Text style={styles.messageText}>{application.applicationMessage}</Text>
        </View>
      )}

      <View style={styles.contactInfo}>
        {application.providerPhone && (
          <View style={styles.contactItem}>
            <Ionicons name="call" size={16} color="#6B7280" />
            <Text style={styles.contactText}>{application.providerPhone}</Text>
          </View>
        )}
        {application.providerEmail && (
          <View style={styles.contactItem}>
            <Ionicons name="mail" size={16} color="#6B7280" />
            <Text style={styles.contactText}>{application.providerEmail}</Text>
          </View>
        )}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.chatButton}
          onPress={() => handleChatWithProvider(application)}
        >
          <Ionicons name="chatbubble" size={16} color="#FFFFFF" />
          <Text style={styles.buttonText}>צ'אט</Text>
        </TouchableOpacity>

        {application.providerPhone && (
          <TouchableOpacity 
            style={styles.callButton}
            onPress={() => handleCallProvider(application)}
          >
            <Ionicons name="call" size={16} color="#FFFFFF" />
            <Text style={styles.buttonText}>התקשר</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.acceptButton}
          onPress={() => handleAcceptProvider(application)}
        >
          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          <Text style={styles.buttonText}>בחר</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>טוען מעוניינים...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>מעוניינים במשימה</Text>
          <Text style={styles.headerSubtitle} numberOfLines={2}>
            {taskTitle}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#667eea']}
            tintColor="#667eea"
          />
        }
      >
        {applications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>אין מעוניינים</Text>
            <Text style={styles.emptySubtitle}>
              עדיין אין נותני שירות שהביעו עניין במשימה הזו
            </Text>
          </View>
        ) : (
          <View style={styles.providersList}>
            <Text style={styles.countText}>
              {applications.length} נותני שירות הביעו עניין
            </Text>
            {applications.map(renderProviderCard)}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'right',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E5E7EB',
    textAlign: 'right',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  providersList: {
    flex: 1,
  },
  countText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'right',
  },
  providerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  providerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'right',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#F59E0B',
    marginLeft: 4,
    fontWeight: '600',
  },
  experienceText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
  },
  statusBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  messageContainer: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
    textAlign: 'right',
  },
  messageText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
    textAlign: 'right',
  },
  contactInfo: {
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
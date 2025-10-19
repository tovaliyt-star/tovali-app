import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { loadActiveTasksForProvider, loadUserData, saveTaskApplication } from '../utils';
import { Chat } from '../entities/Chat';

type Props = {
  navigation: StackNavigationProp<any>;
  route: any;
};

const { width } = Dimensions.get('window');

// משימות דמו לנותן השירות
const MOCK_TASKS = [
  {
    id: '1',
    title: 'עזרה בהעברת ספה קטנה',
    description: 'צריך עזרה בהעברת ספה קטנה מדירה לדירה בתל אביב',
    category: 'הובלות קטנות',
    location: 'תל אביב, רחוב הרצל 123',
    suggestedPayment: 150,
    estimatedDuration: '2 שעות',
    date: '25/08/2025',
    timeSlot: '10:00-12:00',
    customer: {
      name: 'דוד כהן',
      rating: 4.8,
      reviewCount: 15,
    },
    images: [],
    urgent: true,
  },
  {
    id: '2',
    title: 'שליחות קניות בסופר',
    description: 'צריך עזרה בקניות בסופר מרקט הקרוב לבית',
    category: 'שליחויות וסידורים',
    location: 'ירושלים, רחוב יפו 45',
    suggestedPayment: 80,
    estimatedDuration: '1.5 שעות',
    date: '26/08/2025',
    timeSlot: '14:00-16:00',
    customer: {
      name: 'שרה לוי',
      rating: 4.9,
      reviewCount: 23,
    },
    images: [],
    urgent: false,
  },
  {
    id: '3',
    title: 'שטיפת רכב בסיסית',
    description: 'צריך עזרה בשטיפה בסיסית של רכב פרטי',
    category: 'טיפול בסיסי ברכב',
    location: 'חיפה, רחוב הרצל 78',
    suggestedPayment: 120,
    estimatedDuration: '1 שעה',
    date: '27/08/2025',
    timeSlot: '09:00-10:00',
    customer: {
      name: 'משה דוד',
      rating: 4.7,
      reviewCount: 8,
    },
    images: [],
    urgent: false,
  },
  {
    id: '4',
    title: 'טיפול בחיית מחמד',
    description: 'צריך עזרה בטיפול בסיסי בכלב קטן למשך יום אחד',
    category: 'שירותי חיות מחמד',
    location: 'באר שבע, רחוב ויצמן 12',
    suggestedPayment: 200,
    estimatedDuration: '8 שעות',
    date: '28/08/2025',
    timeSlot: '08:00-16:00',
    customer: {
      name: 'רחל אברהם',
      rating: 4.6,
      reviewCount: 12,
    },
    images: [],
    urgent: true,
  },
  {
    id: '5',
    title: 'עזרה טכנית בסיסית',
    description: 'צריך עזרה בהתקנת מדפסת חדשה למחשב',
    category: 'עזרה טכנית בסיסית',
    location: 'אשדוד, רחוב הנביאים 34',
    suggestedPayment: 100,
    estimatedDuration: '1.5 שעות',
    date: '29/08/2025',
    timeSlot: '16:00-18:00',
    customer: {
      name: 'יוסי כהן',
      rating: 4.5,
      reviewCount: 6,
    },
    images: [],
    urgent: false,
  },
];

export default function ProviderTasksScreen({ navigation, route }: Props) {
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [filteredTasks, setFilteredTasks] = useState(MOCK_TASKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('כל הקטגוריות');
  const [sortBy, setSortBy] = useState<'date' | 'payment' | 'urgent'>('date');
  const [refreshing, setRefreshing] = useState(false);

  const categories = ['כל הקטגוריות', ...Array.from(new Set((tasks || []).map(task => task.category)))];

  useEffect(() => {
    loadRealTasks();
  }, []);

  useEffect(() => {
    filterAndSortTasks();
  }, [searchQuery, selectedCategory, sortBy, tasks]);

  const loadRealTasks = async () => {
    try {
      const realTasks = await loadActiveTasksForProvider();
      console.log('Loaded real tasks:', realTasks);
      
      if (realTasks.length > 0) {
        // המרת המשימות האמיתיות לפורמט המתאים
        const formattedTasks = realTasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          category: task.category,
          location: task.location,
          region: task.region || task.area,
          suggestedPayment: task.price,
          estimatedDuration: task.estimated_duration || task.estimatedDuration,
          date: formatDateForDisplay(task.date, task.endDate, task.isDateRange),
          timeSlot: task.time || task.timeSlot,
          customer: {
            name: task.requesterName || 'מזמין לא ידוע',
            rating: 4.5, // ברירת מחדל
            reviewCount: 0,
          },
          images: task.images || [],
          urgent: task.priority === 'high',
        }));
        console.log('Formatted tasks:', formattedTasks);
        setTasks(formattedTasks);
      } else {
        console.log('No real tasks found, using mock tasks');
        setTasks(MOCK_TASKS);
      }
    } catch (error) {
      console.error('Error loading real tasks:', error);
      setTasks(MOCK_TASKS);
    }
  };

  // פונקציה לפרסור תאריך לתצוגה
  const formatDateForDisplay = (dateString: string, endDateString?: string, isDateRange?: boolean) => {
    try {
      const date = new Date(dateString);
      const formattedDate = date.toLocaleDateString('he-IL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (isDateRange && endDateString) {
        const endDate = new Date(endDateString);
        const formattedEndDate = endDate.toLocaleDateString('he-IL', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        return `${formattedDate} - ${formattedEndDate}`;
      }
      
      return formattedDate;
    } catch (error) {
      return dateString;
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRealTasks();
    setRefreshing(false);
  };

  const filterAndSortTasks = () => {
    let filtered = tasks || [];

    // סינון לפי חיפוש
    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // סינון לפי קטגוריה
    if (selectedCategory !== 'כל הקטגוריות') {
      filtered = filtered.filter(task => task.category === selectedCategory);
    }

    // מיון
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date.split('/').reverse().join('-')).getTime() - 
                 new Date(b.date.split('/').reverse().join('-')).getTime();
        case 'payment':
          return b.suggestedPayment - a.suggestedPayment;
        case 'urgent':
          return (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0);
        default:
          return 0;
      }
    });

    setFilteredTasks(filtered);
  };

  const handleTaskPress = (task: any) => {
    // כאן נוכל להוסיף ניווט למסך פרטי המשימה
    navigation.navigate('ServiceDetail' as any, { service: task });
  };

  const handleChatWithClient = async (task: any) => {
    try {
      const currentUser = await loadUserData();
      if (!currentUser) {
        Alert.alert('שגיאה', 'לא ניתן לטעון פרטי משתמש');
        return;
      }

      const chat = await Chat.createOrGetForTask(
        task.id || '',
        task.client_id || task.requesterId || '',
        currentUser.id,
        {
          title: task.description || 'משימה',
          category: task.category || 'כללי',
          clientName: task.requesterName || 'לקוח',
          providerName: currentUser.name || 'נותן שירות',
        }
      );

      navigation.navigate('ChatDetail' as any, {
        chatId: chat.id,
        chatName: task.requesterName || 'לקוח',
        chatService: task.description || 'משימה',
        chatStatus: 'offline',
        otherParticipantId: task.client_id || task.requesterId || '',
      });

    } catch (error) {
      console.error('Error creating chat:', error);
      Alert.alert('שגיאה', 'אירעה שגיאה ביצירת הצ\'אט. אנא נסה שוב.');
    }
  };

  const handleInterestedInTask = async (task: any) => {
    try {
      // טעינת פרטי המשתמש הנוכחי
      const currentUser = await loadUserData();
      if (!currentUser) {
        Alert.alert('שגיאה', 'לא ניתן לטעון פרטי משתמש');
        return;
      }

      // יצירת בקשה חדשה למשימה
      const application = {
        taskId: task.id,
        providerId: currentUser.id,
        providerName: currentUser.name,
        providerPhone: currentUser.phone,
        providerEmail: currentUser.email,
        providerRating: 4.5, // ברירת מחדל
        providerExperience: 'מנוסה',
        applicationMessage: 'אני מעוניין לתת שירות עבור המשימה הזו',
        status: 'pending' as const,
      };

      // שמירת הבקשה
      await saveTaskApplication(application);
      
      Alert.alert(
        'הצלחה!',
        'הביעת עניין במשימה בהצלחה! הלקוח יקבל הודעה ויוכל ליצור איתך קשר.',
        [{ text: 'אישור', style: 'default' }]
      );
      
    } catch (error) {
      console.error('Error applying for task:', error);
      Alert.alert('שגיאה', 'אירעה שגיאה בהבעת עניין במשימה. אנא נסה שוב.');
    }
  };

  const handleCategoryFilter = () => {
    Alert.alert(
      'בחירת קטגוריה',
      'הפונקציה תהיה זמינה בקרוב. בינתיים, השתמש בחיפוש הטקסטואלי לסינון המשימות.',
      [{ text: 'אישור' }]
    );
  };

  const handleSortFilter = () => {
    Alert.alert(
      'בחירת מיון',
      'הפונקציה תהיה זמינה בקרוב. בינתיים, המשימות ממוינות אוטומטית לפי תאריך.',
      [{ text: 'אישור' }]
    );
  };

  const renderTask = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.taskCard} onPress={() => handleTaskPress(item)}>
      {/* כותרת וקטגוריה */}
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleContainer}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          {item.urgent && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>דחוף</Text>
            </View>
          )}
        </View>
        <Text style={styles.taskCategory}>{item.category}</Text>
      </View>

      {/* תיאור */}
      <Text style={styles.taskDescription} numberOfLines={2}>
        {item.description}
      </Text>

      {/* פרטי המשימה */}
      <View style={styles.taskDetails}>
        <View style={styles.taskDetail}>
          <Ionicons name="location" size={16} color="#6B7280" />
          <Text style={styles.taskDetailText}>{item.location}</Text>
        </View>
        {item.region && (
          <View style={styles.taskDetail}>
            <Ionicons name="map" size={16} color="#6B7280" />
            <Text style={styles.taskDetailText}>{item.region}</Text>
          </View>
        )}
        <View style={styles.taskDetail}>
          <Ionicons name="calendar" size={16} color="#6B7280" />
          <Text style={styles.taskDetailText}>{item.date} - {item.timeSlot}</Text>
        </View>
        <View style={styles.taskDetail}>
          <Ionicons name="time" size={16} color="#6B7280" />
          <Text style={styles.taskDetailText}>{item.estimatedDuration}</Text>
        </View>
      </View>

      {/* תשלום מוצע */}
      <View style={styles.paymentContainer}>
        <Text style={styles.paymentLabel}>תשלום מוצע:</Text>
        <Text style={styles.paymentAmount}>₪{item.suggestedPayment}</Text>
      </View>

      {/* פרטי הלקוח */}
      <View style={styles.customerContainer}>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{item.customer.name}</Text>
          <View style={styles.customerRating}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.customerRatingText}>{item.customer.rating}</Text>
            <Text style={styles.customerReviewCount}>({item.customer.reviewCount} ביקורות)</Text>
          </View>
        </View>
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity 
            style={styles.interestedButton}
            onPress={() => handleInterestedInTask(item)}
          >
            <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
            <Text style={styles.interestedButtonText}>מעוניין לתת שירות</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.chatButton}
            onPress={() => handleChatWithClient(item)}
          >
            <Ionicons name="chatbubble" size={16} color="#FFFFFF" />
            <Text style={styles.chatButtonText}>צ'אט</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#fdf2f8', '#fed7d3', '#fce7f3']}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#6366F1" />
            <Text style={styles.backButtonText}>חזור</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              <View style={styles.titleIcon}>
                <Ionicons name="briefcase" size={24} color="#ffffff" />
              </View>
              <Text style={styles.title}>משימות זמינות</Text>
            </View>
            <Text style={styles.subtitle}>
              מצא משימות מתאימות ושלח הצעות
            </Text>
          </View>
        </View>

        {/* חיפוש וסינון */}
        <View style={styles.filtersContainer}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="חיפוש במשימות..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.filterRow}>
            {/* סינון לפי קטגוריה */}
            <View style={styles.filterContainer}>
              <Text style={styles.filterLabel}>קטגוריה:</Text>
              <TouchableOpacity style={styles.filterDropdown} onPress={handleCategoryFilter}>
                <Text style={styles.filterDropdownText}>{selectedCategory}</Text>
                <Ionicons name="chevron-down" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* מיון */}
            <View style={styles.filterContainer}>
              <Text style={styles.filterLabel}>מיון לפי:</Text>
              <TouchableOpacity style={styles.filterDropdown} onPress={handleSortFilter}>
                <Text style={styles.filterDropdownText}>
                  {sortBy === 'date' ? 'תאריך' : 
                   sortBy === 'payment' ? 'תשלום' : 'דחיפות'}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* רשימת המשימות */}
        <View style={styles.tasksContainer}>
          <Text style={styles.tasksCount}>
            נמצאו {filteredTasks.length} משימות
          </Text>
          
          <FlatList
            data={filteredTasks}
            renderItem={renderTask}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
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
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6366F1',
    marginLeft: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
    textAlign: 'right',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  filterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterDropdownText: {
    fontSize: 14,
    color: '#374151',
  },
  tasksContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tasksCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  taskCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  urgentBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  urgentText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  taskCategory: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  taskDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  taskDetails: {
    marginBottom: 16,
  },
  taskDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskDetailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  paymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#0369A1',
    fontWeight: '600',
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0369A1',
  },
  customerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  customerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerRatingText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  customerReviewCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
    marginTop: 16,
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
  interestedButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  interestedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { loadUserData } from '../utils';
import { useUserMode } from '../context/UserModeContext';
import { Task } from '../entities/Task';
import { Review } from '../entities/Review';
import { useUserData } from '../context/UserDataContext';

type ProviderHomeNavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

interface ProviderStats {
  completedTasks: number;
  totalEarnings: number;
  rating: number;
  activeTasks: number;
}

export default function ProviderHomeScreen() {
  const navigation = useNavigation<ProviderHomeNavigationProp>();
  const [userData, setUserData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { setUserMode } = useUserMode();
  const { userData: contextUserData } = useUserData();
  const [stats, setStats] = useState<ProviderStats>({
    completedTasks: 0,
    totalEarnings: 0,
    rating: 4.8,
    activeTasks: 0,
  });

  useEffect(() => {
    loadUserDataFromStorage();
    loadProviderStats();
  }, []);

  const loadUserDataFromStorage = async () => {
    try {
      const data = await loadUserData();
      if (data) {
        setUserData(data);
      }
    } catch (error) {
      console.error('שגיאה בטעינת פרטי משתמש:', error);
    }
  };

  const loadProviderStats = async () => {
    try {
      if (!contextUserData?.id) return;

      // קבלת כל המשימות של נותן השירות
      const allTasks = await Task.getByProviderId(contextUserData.id);
      
      // חישוב סטטיסטיקות
      const completedTasks = allTasks.filter(task => task.status === 'הושלם');
      const activeTasks = allTasks.filter(task => task.status === 'בביצוע' || task.status === 'מוקצה');
      const totalEarnings = completedTasks.reduce((sum, task) => sum + parseInt(task.price), 0);

      // קבלת הדירוג הממוצע האמיתי מהביקורות
      const averageRating = await Review.getAverageRating(contextUserData.id);

      setStats({
        completedTasks: completedTasks.length,
        totalEarnings,
        rating: averageRating || 0, // דירוג אמיתי מהביקורות
        activeTasks: activeTasks.length,
      });
    } catch (error) {
      console.error('שגיאה בטעינת סטטיסטיקות:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserDataFromStorage();
    await loadProviderStats();
    setRefreshing(false);
  };

  const handleFindTasks = () => {
    navigation.navigate('Main' as any, { screen: 'Tasks' });
  };

  const handleMyWork = () => {
    navigation.navigate('ProviderMyWork');
  };

  const handleEarnings = () => {
    navigation.navigate('ProviderEarnings');
  };

  const handleSchedule = () => {
    navigation.navigate('ProviderSchedule');
  };

  const handleProfile = () => {
    navigation.navigate('Profile');
  };

  const handleSwitchToCustomer = async () => {
    try {
      // שמירת המצב החדש
      await setUserMode('customer');
      console.log('שמרתי מעבר למצב מחפש שירות');
      // מעבר למסך הבית
      navigation.navigate('Main' as any);
    } catch (error) {
      console.error('שגיאה בהחלפת מצב:', error);
    }
  };

  const renderStatsCard = () => (
    <View style={styles.statsCard}>
      <Text style={styles.statsTitle}>הסטטיסטיקות שלי</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          <Text style={styles.statNumber}>{stats.completedTasks}</Text>
          <Text style={styles.statLabel}>משימות הושלמו</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="cash" size={24} color="#F59E0B" />
          <Text style={styles.statNumber}>₪{stats.totalEarnings}</Text>
          <Text style={styles.statLabel}>הכנסות כוללות</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="star" size={24} color="#8B5CF6" />
          <Text style={styles.statNumber}>
            {stats.rating > 0 ? stats.rating : 'אין דירוג'}
          </Text>
          <Text style={styles.statLabel}>דירוג ממוצע</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="play-circle" size={24} color="#3B82F6" />
          <Text style={styles.statNumber}>{stats.activeTasks}</Text>
          <Text style={styles.statLabel}>משימות פעילות</Text>
        </View>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsCard}>
      <Text style={styles.sectionTitle}>פעולות מהירות</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.actionButton} onPress={handleFindTasks}>
          <View style={[styles.actionIcon, { backgroundColor: '#3B82F6' }]}>
            <Ionicons name="search" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.actionText}>חפש משימות</Text>
          <Text style={styles.actionSubtext}>מצא עבודה חדשה</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleMyWork}>
          <View style={[styles.actionIcon, { backgroundColor: '#10B981' }]}>
            <Ionicons name="briefcase" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.actionText}>העבודה שלי</Text>
          <Text style={styles.actionSubtext}>נהל משימות פעילות</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleEarnings}>
          <View style={[styles.actionIcon, { backgroundColor: '#F59E0B' }]}>
            <Ionicons name="trending-up" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.actionText}>הכנסות</Text>
          <Text style={styles.actionSubtext}>מעקב אחרי רווחים</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleSchedule}>
          <View style={[styles.actionIcon, { backgroundColor: '#8B5CF6' }]}>
            <Ionicons name="calendar" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.actionText}>לוח זמנים</Text>
          <Text style={styles.actionSubtext}>תזמן עבודות</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRecentActivity = () => {
    const recentTasks = stats.activeTasks > 0 ? [
      {
        id: '1',
        title: 'משימה פעילה',
        subtitle: 'יש לך משימות פעילות',
        time: 'עכשיו',
        icon: 'play-circle' as const,
        color: '#3B82F6',
      },
      {
        id: '2',
        title: 'הכנסות החודש',
        subtitle: `₪${stats.totalEarnings} הכנסות כוללות`,
        time: 'החודש',
        icon: 'cash' as const,
        color: '#10B981',
      },
      {
        id: '3',
        title: 'משימות הושלמו',
        subtitle: `${stats.completedTasks} משימות הושלמו`,
        time: 'סה"כ',
        icon: 'checkmark-circle' as const,
        color: '#10B981',
      },
    ] : [
      {
        id: '1',
        title: 'אין משימות פעילות',
        subtitle: 'חפש משימות חדשות כדי להתחיל לעבוד',
        time: 'עכשיו',
        icon: 'search' as const,
        color: '#6B7280',
      },
    ];

    return (
      <View style={styles.recentActivityCard}>
        <Text style={styles.sectionTitle}>פעילות אחרונה</Text>
        <View style={styles.activityList}>
          {recentTasks.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name={activity.icon} size={20} color={activity.color} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
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
          {/* לוגו */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/Tovali LOGO_C6.png')} 
              style={styles.logo} 
              resizeMode="contain"
            />
          </View>
          
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>
              שלום, {contextUserData?.name || userData?.name || 'משתמש'}! 👋
            </Text>
            <Text style={styles.subtitleText}>
              מוכן לעבודה? בואו נמצא לך משימות חדשות
            </Text>
          </View>
          
          {/* כפתור החלפה למחפש שירות */}
          <TouchableOpacity style={styles.switchModeButton} onPress={handleSwitchToCustomer}>
            <Ionicons name="search" size={20} color="#FFFFFF" />
            <Text style={styles.switchModeText}>
              עבור למחפש שירות
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        {renderStatsCard()}

        {/* Quick Actions */}
        {renderQuickActions()}

        {/* Recent Activity */}
        {renderRecentActivity()}

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
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    height: 200,
    width: 500,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'right',
  },
  subtitleText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
    lineHeight: 20,
  },
  profileButton: {
    padding: 8,
  },
  switchModeButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  switchModeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    textAlign: 'center',
  },
  statsCard: {
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
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  quickActionsCard: {
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
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtext: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 14,
  },
  recentActivityCard: {
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
  activityList: {
    gap: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'right',
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
    textAlign: 'right',
  },
  activityTime: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  bottomSpacing: {
    height: 20,
  },
});

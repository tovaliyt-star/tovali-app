import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../navigation/AppNavigator';
import { User } from '../types';
import { useUserMode } from '../context/UserModeContext';
import { useUserData } from '../context/UserDataContext';
import ProviderHomeScreen from './ProviderHomeScreen';

type Props = BottomTabScreenProps<TabParamList, 'Home'>;

const { width, height } = Dimensions.get('window');

// מערך קטגוריות השירותים
const SERVICE_CATEGORIES = [
  {
    id: '1',
    title: 'הובלות קטנות',
    subtitle: 'הובלת רהיטים וחפצים',
    icon: 'car-outline',
    color: '#3B82F6',
    additionalFields: [
      {
        name: 'pickupAddress',
        label: 'כתובת איסוף *',
        type: 'text',
        placeholder: 'רחוב, מספר בית, עיר',
        required: true
      },
      {
        name: 'pickupFloor',
        label: 'קומה לאיסוף',
        type: 'dropdown',
        placeholder: 'בחר קומה',
        options: ['קומת קרקע', 'קומה 1', 'קומה 2', 'קומה 3', 'קומה 4', 'קומה 5+']
      },
      {
        name: 'pickupElevator',
        label: 'יש מעלית והפריט נכנס אליה',
        type: 'checkbox'
      },
      {
        name: 'pickupAssembly',
        label: 'נדרש פירוק והרכבה',
        type: 'checkbox'
      },
      {
        name: 'dropoffAddress',
        label: 'כתובת פריקה *',
        type: 'text',
        placeholder: 'רחוב, מספר בית, עיר',
        required: true
      },
      {
        name: 'dropoffFloor',
        label: 'קומה לפריקה',
        type: 'dropdown',
        placeholder: 'בחר קומה',
        options: ['קומת קרקע', 'קומה 1', 'קומה 2', 'קומה 3', 'קומה 4', 'קומה 5+']
      },
      {
        name: 'dropoffElevator',
        label: 'יש מעלית והפריט נכנס אליה',
        type: 'checkbox'
      },
      {
        name: 'dropoffAssembly',
        label: 'נדרש הרכבה',
        type: 'checkbox'
      }
    ]
  },
  {
    id: '2',
    title: 'שליחויות וסידורים',
    subtitle: 'קניות ושליחויות',
    icon: 'bag-outline',
    color: '#10B981'
  },
  {
    id: '3',
    title: 'טיפול בסיסי ברכב',
    subtitle: 'שטיפה ותחזוקה קלה',
    icon: 'car-sport-outline',
    color: '#F59E0B'
  },
  {
    id: '4',
    title: 'שירותי חיות מחמד',
    subtitle: 'טיפול וטיול עם חיות',
    icon: 'paw-outline',
    color: '#8B5CF6'
  },
  {
    id: '5',
    title: 'עזרה טכנית בסיסית',
    subtitle: 'תמיכה טכנית פשוטה',
    icon: 'laptop-outline',
    color: '#6366F1'
  },
  {
    id: '6',
    title: 'עזרה בבית',
    subtitle: 'ניקיון וארגון',
    icon: 'home-outline',
    color: '#F59E0B'
  },
  {
    id: '9',
    title: 'אחר',
    subtitle: 'שירותים נוספים',
    icon: 'ellipsis-horizontal-outline',
    color: '#6B7280'
  },
  {
    id: '8',
    title: 'ליווי ועזרה לקשישים',
    subtitle: 'תמיכה וסיוע לקשישים',
    icon: 'heart-outline',
    color: '#EF4444'
  },
  {
    id: '7',
    title: 'צילום וסושיאל',
    subtitle: 'צילום ועריכת תמונות',
    icon: 'camera-outline',
    color: '#EC4899'
  }
];

export default function HomeScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const { userMode, toggleUserMode } = useUserMode();
  const { userData } = useUserData();

  useEffect(() => {
    // לא צריך לטעון נתונים - userData כבר נטען ב-UserDataContext
  }, []);

  const handleCategorySelect = (category: any) => {
    if (userMode === 'customer') {
      navigation.navigate('CreateTask' as any, { category: category });
    } else {
      // אם המשתמש הוא נותן שירות, ננווט למסך חיפוש משימות
      navigation.navigate('ProviderTasks' as any);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>טוען...</Text>
      </View>
    );
  }

  // אם זה נותן שירות, נציג מסך שונה לחלוטין
  if (userMode === 'provider') {
    return <ProviderHomeScreen />;
  }

  return (
    <LinearGradient
      colors={['#fdf2f8', '#fed7d3', '#fce7f3']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
          
          {/* כותרת וטקסט */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>
              שלום {userData?.name || 'משתמש דמו'}! 👋
            </Text>
            <Text style={styles.subtitleText}>
              {userMode === 'customer' 
                ? 'מה אתה צריך היום?' 
                : 'איזה שירותים אתה מציע היום?'}
            </Text>
          </View>
          
          {/* כפתור החלפה - ללא רקע כחול */}
          <TouchableOpacity style={styles.switchModeButton} onPress={toggleUserMode}>
            <Ionicons 
              name={userMode === 'customer' ? 'briefcase' : 'search'} 
              size={20} 
              color="#FFFFFF" 
            />
            <Text style={styles.switchModeText}>
              {userMode === 'customer' ? 'עבור לנותן שירות' : 'עבור למחפש שירות'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* תוכן המסך בהתאם למצב המשתמש */}
        {userMode === 'customer' && (
          // מסך מחפש שירות - קטגוריות שירותים
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>בחר קטגוריית שירות</Text>
            <Text style={styles.sectionSubtitle}>
              בחר את סוג השירות שאתה צריך וקבל הצעות מנותני שירות
            </Text>
            
            {/* קטגוריה: שירותי הובלה ושליחויות */}
            <View style={styles.categorySection}>
              <Text style={styles.categorySectionTitle}>הובלה ושליחויות</Text>
              <View style={styles.categoriesRow}>
                {SERVICE_CATEGORIES.slice(0, 3).map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryCardSmall}
                    onPress={() => handleCategorySelect(category)}
                  >
                    <View style={[styles.categoryIconSmall, { backgroundColor: category.color }]}>
                      <Ionicons name={category.icon as any} size={20} color="#FFFFFF" />
                    </View>
                    <Text style={styles.categoryTitleSmall}>{category.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* קטגוריה: שירותי בית וטיפול */}
            <View style={styles.categorySection}>
              <Text style={styles.categorySectionTitle}>בית וטיפול</Text>
              <View style={styles.categoriesRow}>
                {SERVICE_CATEGORIES.slice(3, 6).map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryCardSmall}
                    onPress={() => handleCategorySelect(category)}
                  >
                    <View style={[styles.categoryIconSmall, { backgroundColor: category.color }]}>
                      <Ionicons name={category.icon as any} size={20} color="#FFFFFF" />
                    </View>
                    <Text style={styles.categoryTitleSmall}>{category.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* קטגוריה: שירותים נוספים */}
            <View style={styles.categorySection}>
              <Text style={styles.categorySectionTitle}>שירותים מיוחדים</Text>
              <View style={styles.categoriesRow}>
                {SERVICE_CATEGORIES.slice(6, 9).map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryCardSmall}
                    onPress={() => handleCategorySelect(category)}
                  >
                    <View style={[styles.categoryIconSmall, { backgroundColor: category.color }]}>
                      <Ionicons name={category.icon as any} size={20} color="#FFFFFF" />
                    </View>
                    <Text style={styles.categoryTitleSmall}>{category.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
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
    justifyContent: 'center',
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
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
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  switchModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  switchModeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'right',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'right',
    lineHeight: 24,
    marginBottom: 32,
  },
  categorySection: {
    marginBottom: 24,
  },
  categorySectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'right',
  },
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryCardSmall: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  categoryIconSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryTitleSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 16,
  },
});

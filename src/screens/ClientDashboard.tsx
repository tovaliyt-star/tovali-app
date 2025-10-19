import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../entities/User';
import { Task } from '../entities/Task';

type Props = StackScreenProps<RootStackParamList, 'ClientDashboard'>;

export default function ClientDashboard({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    estimated_duration: '',
    location: '',
    region: '',
    date: new Date(),
    time: '09:00',
    price: '',
  });

  const CATEGORIES = [
    'הובלות קטנות',
    'שליחויות וסידורים',
    'טיפול בסיסי ברכב',
    'שירותי חיות מחמד',
    'עזרה טכנית בסיסית',
    'צילום וסושיאל',
    'עזרה בבית',
    'ליווי ועזרה לקשישים',
  ];

  const REGIONS = [
    'תל אביב והסביבה',
    'גוש דן',
    'אזור השרון',
    'הרצליה והסביבה',
    'חיפה והקריות',
    'גליל עליון',
    'אזור ירושלים',
    'באר שבע והסביבה',
    'אילת',
    'אחר',
  ];

  const HOURS = Array.from({ length: 24 }, (_, i) => 
    `${String(i).padStart(2, '0')}:00`
  );

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      if (userData?.location) {
        setFormData(prev => ({
          ...prev,
          location: userData.location,
          region: userData.region || '',
        }));
      }
    } catch (error) {
      console.error('שגיאה בטעינת פרטי משתמש:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatDate = (date: Date) => {
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  };

  const handleSubmit = async () => {
    if (!formData.category || !formData.description || !formData.estimated_duration || 
        !formData.location || !formData.region || !formData.price) {
      Alert.alert('שגיאה', 'אנא מלא את כל השדות הנדרשים');
      return;
    }

    setSubmitting(true);

    try {
      await Task.create({
        ...formData,
        status: 'פתוח',
        client_id: user.id,
      });

      // ניקוי הטופס
      setFormData({
        category: '',
        description: '',
        estimated_duration: '',
        location: formData.location, // שומר את המיקום הנוכחי
        region: formData.region, // שומר את האזור הנוכחי
        date: new Date(),
        time: '09:00',
        price: '',
      });

      Alert.alert('הצלחה', 'העבודה נוצרה בהצלחה!');
    } catch (error) {
      console.error('שגיאה ביצירת העבודה:', error);
      Alert.alert('שגיאה', 'אירעה שגיאה ביצירת העבודה. אנא נסה שוב.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>טוען...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Main')}
        >
          <Ionicons name="arrow-back" size={24} color="#6366F1" />
          <Text style={styles.backButtonText}>חזור</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>הזמנת שירות חדש</Text>
      </View>
      
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>הזמנת שירות חדש</Text>
        </View>
        
        <View style={styles.cardContent}>
          {/* קטגוריה */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>קטגוריה</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
              {CATEGORIES.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    formData.category === category && styles.categoryButtonSelected
                  ]}
                  onPress={() => handleChange('category', category)}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    formData.category === category && styles.categoryButtonTextSelected
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.helpText}>בחר את הקטגוריה המתאימה ביותר לסוג העבודה הנדרש</Text>
          </View>

          {/* תיאור העבודה */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>תיאור העבודה</Text>
            <TextInput
              style={styles.textArea}
              placeholder="תאר את העבודה הנדרשת..."
              value={formData.description}
              onChangeText={(text) => handleChange('description', text)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Text style={styles.helpText}>תאר בפירוט מה העבודה כוללת, דגשים חשובים וכל מידע רלוונטי אחר</Text>
          </View>

          {/* משך זמן משוער */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>משך זמן משוער (בשעות)</Text>
            <TextInput
              style={styles.input}
              placeholder="למשל: 2.5"
              value={formData.estimated_duration}
              onChangeText={(text) => handleChange('estimated_duration', text)}
              keyboardType="numeric"
            />
            <Text style={styles.helpText}>ניתן להזין גם חצאי שעות (למשל: 1.5)</Text>
          </View>

          {/* מיקום */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>מיקום העבודה</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={styles.inputWithIconText}
                placeholder="הכנס כתובת מדויקת"
                value={formData.location}
                onChangeText={(text) => handleChange('location', text)}
              />
              <Ionicons name="location-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
            </View>
            <Text style={styles.helpText}>יש לציין עיר, רחוב ומספר בית</Text>
          </View>

          {/* אזור */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>אזור בישראל</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.regionsScroll}>
              {REGIONS.map(region => (
                <TouchableOpacity
                  key={region}
                  style={[
                    styles.regionButton,
                    formData.region === region && styles.regionButtonSelected
                  ]}
                  onPress={() => handleChange('region', region)}
                >
                  <Text style={[
                    styles.regionButtonText,
                    formData.region === region && styles.regionButtonTextSelected
                  ]}>
                    {region}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.helpText}>בחר את האזור הכללי בו תתבצע העבודה</Text>
          </View>

          {/* תאריך */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>תאריך</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#6366F1" />
              <Text style={styles.dateButtonText}>{formatDate(formData.date)}</Text>
            </TouchableOpacity>
          </View>

          {/* שעה */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>שעה</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hoursScroll}>
              {HOURS.map(hour => (
                <TouchableOpacity
                  key={hour}
                  style={[
                    styles.hourButton,
                    formData.time === hour && styles.hourButtonSelected
                  ]}
                  onPress={() => handleChange('time', hour)}
                >
                  <Text style={[
                    styles.hourButtonText,
                    formData.time === hour && styles.hourButtonTextSelected
                  ]}>
                    {hour}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* מחיר */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>תשלום מוצע (ש"ח)</Text>
            <TextInput
              style={styles.input}
              placeholder="הכנס סכום בש״ח"
              value={formData.price}
              onChangeText={(text) => handleChange('price', text)}
              keyboardType="numeric"
            />
          </View>

          {/* כפתור שליחה */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <View style={styles.submitButtonContent}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.submitButtonText}>שולח...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>פרסם עבודה</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>בחר תאריך</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                handleChange('date', new Date());
                setShowDatePicker(false);
              }}
            >
              <Text style={styles.modalButtonText}>היום</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                handleChange('date', tomorrow);
                setShowDatePicker(false);
              }}
            >
              <Text style={styles.modalButtonText}>מחר</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.modalCloseButtonText}>סגור</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginRight: 40, // כדי לאזן את הכפתור השמאלי
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6366F1',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  cardContent: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    height: 100,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  inputWithIconText: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  inputIcon: {
    paddingRight: 12,
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  categoriesScroll: {
    marginBottom: 8,
  },
  categoryButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoryButtonSelected: {
    backgroundColor: '#6366F1',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  categoryButtonTextSelected: {
    color: '#FFFFFF',
  },
  regionsScroll: {
    marginBottom: 8,
  },
  regionButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  regionButtonSelected: {
    backgroundColor: '#6366F1',
  },
  regionButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  regionButtonTextSelected: {
    color: '#FFFFFF',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 8,
  },
  hoursScroll: {
    marginBottom: 8,
  },
  hourButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  hourButtonSelected: {
    backgroundColor: '#6366F1',
  },
  hourButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  hourButtonTextSelected: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1F2937',
  },
  modalButton: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 12,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalCloseButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 8,
  },
  modalCloseButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
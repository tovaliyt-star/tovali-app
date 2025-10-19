import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
// import DateTimePicker from '@react-native-community/datetimepicker';
import { loadUserData, saveTask, updateTask } from '../utils';

type Props = {
  navigation: StackNavigationProp<any>;
  route: any;
};

const { width } = Dimensions.get('window');

// מערך אזורים בישראל
const ISRAEL_REGIONS = [
  'תל אביב והמרכז',
  'ירושלים והסביבה',
  'חיפה והצפון',
  'באר שבע והדרום',
  'אשדוד והשפלה',
  'אילת והערבה',
  'השרון',
  'השפלה',
  'הרי יהודה',
  'הנגב',
  'הגליל',
  'הגולן',
  'הכרמל',
  'הרי ירושלים',
  'הרי חברון',
  'הרי השומרון',
  'עמק יזרעאל',
  'עמק בית שאן',
  'עמק הירדן',
  'עמק החולה',
];

// מערך שעות זמינות
const TIME_SLOTS = [
  '06:00-08:00',
  '08:00-10:00',
  '10:00-12:00',
  '12:00-14:00',
  '14:00-16:00',
  '16:00-18:00',
  '18:00-20:00',
  '20:00-22:00',
  '22:00-00:00',
  '00:00-02:00',
  '02:00-04:00',
  '04:00-06:00',
];

// מערך קומות לבחירה
const FLOOR_OPTIONS = [
  'קומת קרקע',
  'קומה 1',
  'קומה 2',
  'קומה 3',
  'קומה 4',
  'קומה 5+'
];

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
    id: '7',
    title: 'צילום וסושיאל',
    subtitle: 'צילום ועריכת תמונות',
    icon: 'camera-outline',
    color: '#EC4899'
  },
  {
    id: '8',
    title: 'ליווי ועזרה לקשישים',
    subtitle: 'תמיכה וסיוע לקשישים',
    icon: 'heart-outline',
    color: '#EF4444'
  },
  {
    id: '9',
    title: 'אחר',
    subtitle: 'שירותים נוספים',
    icon: 'ellipsis-horizontal-outline',
    color: '#6B7280'
  },
];

export default function CreateTaskScreen({ navigation, route }: Props) {
  const { category, editMode, taskData } = route.params || {};
  
  // לוגים לדיבוג
  console.log('CreateTaskScreen - route.params:', route.params);
  console.log('CreateTaskScreen - editMode:', editMode);
  console.log('CreateTaskScreen - taskData:', taskData);
  
  const [formData, setFormData] = useState(() => {
    const initialData = {
      title: editMode && taskData ? (taskData.title || taskData.description) : '',
      description: editMode && taskData ? (taskData.description || taskData.title) : '',
      suggestedPayment: editMode && taskData ? (taskData.proposedPayment || taskData.price) : '',
      estimatedDuration: editMode && taskData ? (taskData.estimatedDuration || taskData.estimated_duration) : '',
      location: editMode && taskData ? taskData.location : '',
      region: editMode && taskData ? (taskData.region || taskData.area || '') : '',
      timeSlot: editMode && taskData ? (taskData.time || taskData.timeSlot || '10:00-12:00') : '10:00-12:00',
      date: editMode && taskData ? (taskData.date ? new Date(taskData.date) : new Date()) : new Date(),
      endDate: editMode && taskData ? (taskData.endDate ? new Date(taskData.endDate) : null) : null,
      isDateRange: editMode && taskData ? taskData.isDateRange || false : false,
      // שדות נוספים להובלות קטנות
      pickupAddress: editMode && taskData ? taskData.pickupAddress : '',
      pickupFloor: editMode && taskData ? taskData.pickupFloor : '',
      pickupElevator: editMode && taskData ? taskData.pickupElevator : false,
      pickupAssembly: editMode && taskData ? taskData.pickupAssembly : false,
      dropoffAddress: editMode && taskData ? taskData.dropoffAddress : '',
      dropoffFloor: editMode && taskData ? taskData.dropoffFloor : '',
      dropoffElevator: editMode && taskData ? taskData.dropoffElevator : false,
      dropoffAssembly: editMode && taskData ? taskData.dropoffAssembly : false,
    };
    
    console.log('CreateTaskScreen - initial formData:', initialData);
    console.log('CreateTaskScreen - taskData received:', taskData);
    return initialData;
  });

  const [selectedImages, setSelectedImages] = useState<string[]>(() => {
    if (editMode && taskData?.images) {
      return taskData.images || [];
    }
    return [];
  });
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [currentDateField, setCurrentDateField] = useState<'start' | 'end' | null>(null);
  const [tempDate, setTempDate] = useState(new Date());
  const [showFloorModal, setShowFloorModal] = useState(false);
  const [currentFloorField, setCurrentFloorField] = useState<'pickupFloor' | 'dropoffFloor' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (editMode && taskData?.category) {
      // במצב עריכה, נטען את הקטגוריה מהמשימה הקיימת
      return SERVICE_CATEGORIES.find(cat => cat.title === taskData.category) || null;
    }
    return category || null;
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async () => {
    try {
      // בקשה להרשאות
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('הרשאה נדרשת', 'אנא אשר גישה לגלריה כדי לבחור תמונות');
        return;
      }

      // פתיחת הגלריה
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => asset.uri);
        if (selectedImages.length + newImages.length > 5) {
          Alert.alert('שגיאה', 'ניתן לבחור עד 5 תמונות בלבד');
          return;
        }
        setSelectedImages(prev => [...prev, ...newImages]);
      }
    } catch (error) {
      Alert.alert('שגיאה', 'אירעה שגיאה בבחירת התמונות');
    }
  };

  const handleCameraCapture = async () => {
    try {
      // בקשה להרשאות מצלמה
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('הרשאה נדרשת', 'אנא אשר גישה למצלמה כדי לצלם תמונה');
        return;
      }

      // פתיחת המצלמה
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets) {
        const newImage = result.assets[0].uri;
        if (selectedImages.length >= 5) {
          Alert.alert('שגיאה', 'ניתן לבחור עד 5 תמונות בלבד');
          return;
        }
        setSelectedImages(prev => [...prev, newImage]);
      }
    } catch (error) {
      Alert.alert('שגיאה', 'אירעה שגיאה בצילום התמונה');
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRegionSelect = (region: string) => {
    handleInputChange('region', region);
    setShowRegionModal(false);
  };

  const handleTimeSelect = (time: string) => {
    handleInputChange('timeSlot', time);
    setShowTimeModal(false);
  };

  const handleFloorSelect = (floor: string) => {
    if (currentFloorField) {
      handleInputChange(currentFloorField, floor);
    }
    setShowFloorModal(false);
    setCurrentFloorField(null);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (currentDateField === 'start') {
      setShowDatePicker(false);
    } else if (currentDateField === 'end') {
      setShowEndDatePicker(false);
    }
    
    if (selectedDate) {
      if (currentDateField === 'start') {
        handleInputChange('date', selectedDate);
        // אם זה טווח תאריכים ואנחנו בוחרים תאריך התחלה, נוודא שתאריך הסיום לא יהיה לפניו
        if (formData.isDateRange && formData.endDate && selectedDate > formData.endDate) {
          handleInputChange('endDate', null);
        }
      } else if (currentDateField === 'end') {
        handleInputChange('endDate', selectedDate);
      }
    }
    setCurrentDateField(null);
  };

  const handleDateConfirm = () => {
    if (currentDateField === 'start') {
      handleInputChange('date', tempDate);
      if (formData.isDateRange && formData.endDate && tempDate > formData.endDate) {
        handleInputChange('endDate', null);
      }
    } else if (currentDateField === 'end') {
      handleInputChange('endDate', tempDate);
    }
    setShowDatePicker(false);
    setShowEndDatePicker(false);
    setCurrentDateField(null);
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
    setShowEndDatePicker(false);
    setCurrentDateField(null);
  };

  const openDatePicker = (field: 'start' | 'end') => {
    setCurrentDateField(field);
    if (field === 'start') {
      setTempDate(formData.date);
      setShowDatePicker(true);
    } else {
      setTempDate(formData.endDate || formData.date);
      setShowEndDatePicker(true);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('he-IL');
  };

  const formatDateRange = () => {
    if (!formData.isDateRange) {
      return formatDate(formData.date);
    }
    
    if (formData.endDate) {
      return `${formatDate(formData.date)} - ${formatDate(formData.endDate)}`;
    }
    
    return `${formatDate(formData.date)} - בחר תאריך סיום`;
  };

  const handleSubmit = async () => {
    // בדיקת שדות חובה
    if (!formData.title || !formData.description || !formData.suggestedPayment || 
        !formData.location || !formData.region) {
      Alert.alert('שגיאה', 'אנא מלא את כל השדות החובה');
      return;
    }

    try {
      // טעינת פרטי המשתמש הנוכחי
      const currentUser = await loadUserData();
      if (!currentUser) {
        Alert.alert('שגיאה', 'לא ניתן לטעון פרטי משתמש');
        return;
      }

      // יצירת אובייקט המשימה
      const newTask = {
        // שדות בסיסיים
        title: formData.title,
        description: formData.description,
        price: formData.suggestedPayment,
        proposedPayment: formData.suggestedPayment,
        estimated_duration: formData.estimatedDuration,
        estimatedDuration: formData.estimatedDuration,
        location: formData.location,
        region: formData.region || '',
        area: formData.region || '', // גם בשם הזה
        time: formData.timeSlot || '10:00-12:00',
        timeSlot: formData.timeSlot || '10:00-12:00',
        date: formData.date.toISOString(),
        endDate: formData.endDate ? formData.endDate.toISOString() : null,
        isDateRange: formData.isDateRange,
        category: selectedCategory?.title || 'לא נבחר',
        categoryId: selectedCategory?.id || '',
        
        // שדות נוספים להובלות קטנות
        pickupAddress: formData.pickupAddress,
        pickupFloor: formData.pickupFloor,
        pickupElevator: formData.pickupElevator,
        pickupAssembly: formData.pickupAssembly,
        dropoffAddress: formData.dropoffAddress,
        dropoffFloor: formData.dropoffFloor,
        dropoffElevator: formData.dropoffElevator,
        dropoffAssembly: formData.dropoffAssembly,
        
        // פרטי המזמין
        requesterId: currentUser.id,
        requesterName: currentUser.name,
        client_id: currentUser.id,
        
        // תמונות
        images: selectedImages,
        
        // סטטוס
        status: editMode ? (taskData?.status || 'פתוח') : 'פתוח',
        priority: 'medium'
      };

      if (editMode && taskData?.id) {
        // עדכון משימה קיימת
        console.log('Updating task with ID:', taskData.id);
        console.log('Update data:', newTask);
        await updateTask(taskData.id, newTask);
        console.log('Task updated successfully');
        Alert.alert(
          'הצלחה!',
          'המשימה עודכנה בהצלחה!',
          [
            {
              text: 'אישור',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        // יצירת משימה חדשה
        await saveTask(newTask);
        Alert.alert(
          'הצלחה!',
          'המשימה שלך נשלחה בהצלחה! נותני שירות יוכלו לראות אותה ולשלוח הצעות.',
          [
            {
              text: 'אישור',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert('שגיאה', 'אירעה שגיאה בשמירת המשימה. אנא נסה שוב.');
    }
  };

  return (
    <LinearGradient
      colors={['#fdf2f8', '#fed7d3', '#fce7f3']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={32} color="#6366F1" />
            <Text style={styles.backButtonText}>חזור</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              <View style={styles.titleIcon}>
                <Ionicons name={editMode ? "create" : "add-circle"} size={24} color="#ffffff" />
              </View>
              <Text style={styles.title}>{editMode ? 'עריכת משימה' : 'יצירת משימה חדשה'}</Text>
            </View>
            <Text style={styles.subtitle}>
              {editMode ? 'ערוך את פרטי המשימה שלך' : 'ספר לנו מה אתה צריך וקבל הצעות מנותני שירות'}
            </Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* כותרת קצרה */}
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>
              כותרת קצרה <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="לדוגמה: עזרה בהעברת ספה קטנה"
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
            />
          </View>

          {/* קטגוריה */}
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>
              קטגוריה <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity 
              style={styles.categoryDisplay}
              onPress={() => setShowCategoryModal(true)}
            >
              <Ionicons name={selectedCategory?.icon || 'help-circle'} size={20} color={selectedCategory?.color || '#6B7280'} />
              <Text style={styles.categoryText}>{selectedCategory?.title || 'לא נבחר'}</Text>
              <Ionicons name="chevron-down" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* תיאור העבודה */}
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>
              תיאור העבודה <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="פרט ככל הניתן על העבודה הנדרשת, כולל דגשים מיוחדים."
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* העלאת תמונות */}
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>העלאת תמונות (עד 5, אופציונלי)</Text>
            
            {/* כפתורי העלאה */}
            <View style={styles.imageUploadButtons}>
              <TouchableOpacity style={styles.uploadButton} onPress={handleImageUpload}>
                <Ionicons name="images" size={20} color="#3B82F6" />
                <Text style={styles.uploadButtonText}>גלריה</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadButton} onPress={handleCameraCapture}>
                <Ionicons name="camera" size={20} color="#3B82F6" />
                <Text style={styles.uploadButtonText}>מצלמה</Text>
              </TouchableOpacity>
            </View>

            {/* תמונות נבחרות */}
            {selectedImages.length > 0 && (
              <View style={styles.selectedImagesContainer}>
                <Text style={styles.selectedImagesTitle}>תמונות נבחרות ({selectedImages.length}/5):</Text>
                <View style={styles.imagesGrid}>
                  {selectedImages.map((imageUri, index) => (
                    <View key={index} style={styles.imageContainer}>
                      <Image source={{ uri: imageUri }} style={styles.selectedImage} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => removeImage(index)}
                      >
                        <Ionicons name="close-circle" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* תשלום מוצע */}
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>
              תשלום מוצע (₪) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="לדוגמה: 150"
              value={formData.suggestedPayment}
              onChangeText={(value) => handleInputChange('suggestedPayment', value)}
              keyboardType="numeric"
            />
          </View>

          {/* משך זמן משוער */}
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>משך זמן משוער (שעות)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="לדוגמה: 2.5"
              value={formData.estimatedDuration}
              onChangeText={(value) => handleInputChange('estimatedDuration', value)}
              keyboardType="numeric"
            />
          </View>

          {/* מיקום מדויק */}
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>
              מיקום מדויק (עיר, רחוב, מספר) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="הכנס כתובת מלאה"
              value={formData.location}
              onChangeText={(value) => handleInputChange('location', value)}
            />
          </View>

          {/* אזור בישראל */}
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>
              אזור בישראל <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity 
              style={styles.dropdown}
              onPress={() => setShowRegionModal(true)}
            >
              <Text style={formData.region ? styles.dropdownText : styles.dropdownPlaceholder}>
                {formData.region || 'בחר אזור'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* שעה מבוקשת */}
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>
              שעה מבוקשת <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity 
              style={styles.dropdown}
              onPress={() => setShowTimeModal(true)}
            >
              <Text style={styles.dropdownText}>{formData.timeSlot}</Text>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* טווח תאריכים מבוקש */}
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>
              תאריך מבוקש <Text style={styles.required}>*</Text>
            </Text>
            
            {/* אופציה לבחירת טווח תאריכים */}
            <View style={styles.checkboxField}>
              <TouchableOpacity 
                style={styles.checkbox}
                onPress={() => handleInputChange('isDateRange', !formData.isDateRange)}
              >
                <Ionicons 
                  name={formData.isDateRange ? "checkbox" : "square-outline"} 
                  size={20} 
                  color={formData.isDateRange ? "#3B82F6" : "#6B7280"} 
                />
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>טווח תאריכים (לא יום אחד ספציפי)</Text>
            </View>

            {/* תאריך התחלה */}
            <View style={styles.dateInputContainer}>
              <TextInput
                style={[styles.textInput, styles.dateInput]}
                value={formatDate(formData.date)}
                editable={false}
                placeholder="בחר תאריך התחלה"
              />
              <TouchableOpacity 
                style={styles.calendarButton}
                onPress={() => openDatePicker('start')}
              >
                <Ionicons name="calendar" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* תאריך סיום (רק אם זה טווח תאריכים) */}
            {formData.isDateRange && (
              <View style={[styles.dateInputContainer, { marginTop: 12 }]}>
                <TextInput
                  style={[styles.textInput, styles.dateInput]}
                  value={formData.endDate ? formatDate(formData.endDate) : 'בחר תאריך סיום'}
                  editable={false}
                  placeholder="בחר תאריך סיום"
                />
                <TouchableOpacity 
                  style={styles.calendarButton}
                  onPress={() => openDatePicker('end')}
                >
                  <Ionicons name="calendar" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* שדות נוספים להובלות קטנות */}
          {selectedCategory?.id === '1' && (
            <>
              {/* פרטי איסוף */}
              <View style={styles.sectionHeader}>
                <Ionicons name="location" size={20} color="#3B82F6" />
                <Text style={styles.sectionTitle}>פרטי איסוף</Text>
              </View>
              
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  כתובת איסוף <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="רחוב, מספר בית, עיר"
                  value={formData.pickupAddress}
                  onChangeText={(value) => handleInputChange('pickupAddress', value)}
                />
              </View>

                             <View style={styles.formField}>
                 <Text style={styles.fieldLabel}>קומה לאיסוף</Text>
                 <TouchableOpacity 
                   style={styles.dropdown}
                   onPress={() => {
                     setCurrentFloorField('pickupFloor');
                     setShowFloorModal(true);
                   }}
                 >
                   <Text style={formData.pickupFloor ? styles.dropdownText : styles.dropdownPlaceholder}>
                     {formData.pickupFloor || 'בחר קומה'}
                   </Text>
                   <Ionicons name="chevron-down" size={20} color="#6B7280" />
                 </TouchableOpacity>
               </View>

              <View style={styles.checkboxField}>
                <TouchableOpacity 
                  style={styles.checkbox}
                  onPress={() => handleInputChange('pickupElevator', !formData.pickupElevator)}
                >
                  <Ionicons 
                    name={formData.pickupElevator ? "checkbox" : "square-outline"} 
                    size={20} 
                    color={formData.pickupElevator ? "#3B82F6" : "#6B7280"} 
                  />
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>יש מעלית והפריט נכנס אליה</Text>
              </View>

              <View style={styles.checkboxField}>
                <TouchableOpacity 
                  style={styles.checkbox}
                  onPress={() => handleInputChange('pickupAssembly', !formData.pickupAssembly)}
                >
                  <Ionicons 
                    name={formData.pickupAssembly ? "checkbox" : "square-outline"} 
                    size={20} 
                    color={formData.pickupAssembly ? "#3B82F6" : "#6B7280"} 
                  />
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>נדרש פירוק והרכבה</Text>
              </View>

              {/* פרטי פריקה */}
              <View style={styles.sectionHeader}>
                <Ionicons name="location" size={20} color="#10B981" />
                <Text style={styles.sectionTitle}>פרטי פריקה</Text>
              </View>
              
              <View style={styles.formField}>
                                  <Text style={styles.fieldLabel}>
                    כתובת פריקה <Text style={styles.required}>*</Text>
                  </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="רחוב, מספר בית, עיר"
                  value={formData.dropoffAddress}
                  onChangeText={(value) => handleInputChange('dropoffAddress', value)}
                />
              </View>

                             <View style={styles.formField}>
                 <Text style={styles.fieldLabel}>קומה לפריקה</Text>
                 <TouchableOpacity 
                   style={styles.dropdown}
                   onPress={() => {
                     setCurrentFloorField('dropoffFloor');
                     setShowFloorModal(true);
                   }}
                 >
                   <Text style={formData.dropoffFloor ? styles.dropdownText : styles.dropdownPlaceholder}>
                     {formData.dropoffFloor || 'בחר קומה'}
                   </Text>
                   <Ionicons name="chevron-down" size={20} color="#6B7280" />
                 </TouchableOpacity>
               </View>

              <View style={styles.checkboxField}>
                <TouchableOpacity 
                  style={styles.checkbox}
                  onPress={() => handleInputChange('dropoffElevator', !formData.dropoffElevator)}
                >
                  <Ionicons 
                    name={formData.dropoffElevator ? "checkbox" : "square-outline"} 
                    size={20} 
                    color={formData.dropoffElevator ? "#10B981" : "#6B7280"} 
                  />
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>יש מעלית והפריט נכנס אליה</Text>
              </View>

              <View style={styles.checkboxField}>
                <TouchableOpacity 
                  style={styles.checkbox}
                  onPress={() => handleInputChange('dropoffAssembly', !formData.dropoffAssembly)}
                >
                  <Ionicons 
                    name={formData.dropoffAssembly ? "checkbox" : "square-outline"} 
                    size={20} 
                    color={formData.dropoffAssembly ? "#10B981" : "#6B7280"} 
                  />
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>נדרש הרכבה</Text>
              </View>
            </>
          )}

          {/* כפתור שליחה */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>{editMode ? 'שמור שינויים' : 'שלח משימה'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal לבחירת אזור */}
      <Modal
        visible={showRegionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRegionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>בחר אזור</Text>
              <TouchableOpacity onPress={() => setShowRegionModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={ISRAEL_REGIONS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleRegionSelect(item)}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

             {/* Modal לבחירת שעה */}
       <Modal
         visible={showTimeModal}
         transparent={true}
         animationType="slide"
         onRequestClose={() => setShowTimeModal(false)}
       >
         <View style={styles.modalOverlay}>
           <View style={styles.modalContent}>
             <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>בחר שעה</Text>
               <TouchableOpacity onPress={() => setShowTimeModal(false)}>
                 <Ionicons name="close" size={24} color="#6B7280" />
               </TouchableOpacity>
             </View>
             <FlatList
               data={TIME_SLOTS}
               keyExtractor={(item) => item}
               renderItem={({ item }) => (
                 <TouchableOpacity
                   style={styles.modalItem}
                   onPress={() => handleTimeSelect(item)}
                 >
                   <Text style={styles.modalItemText}>{item}</Text>
                 </TouchableOpacity>
               )}
             />
           </View>
         </View>
       </Modal>

       {/* Modal לבחירת קומה */}
       <Modal
         visible={showFloorModal}
         transparent={true}
         animationType="slide"
         onRequestClose={() => setShowFloorModal(false)}
       >
         <View style={styles.modalOverlay}>
           <View style={styles.modalContent}>
             <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>בחר קומה</Text>
               <TouchableOpacity onPress={() => setShowFloorModal(false)}>
                 <Ionicons name="close" size={24} color="#6B7280" />
               </TouchableOpacity>
             </View>
             <FlatList
               data={FLOOR_OPTIONS}
               keyExtractor={(item) => item}
               renderItem={({ item }) => (
                 <TouchableOpacity
                   style={styles.modalItem}
                   onPress={() => handleFloorSelect(item)}
                 >
                   <Text style={styles.modalItemText}>{item}</Text>
                 </TouchableOpacity>
               )}
             />
           </View>
         </View>
       </Modal>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>בחר קטגוריה</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.categoriesList}>
              {SERVICE_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryOption,
                    selectedCategory?.id === cat.id && styles.categoryOptionSelected
                  ]}
                  onPress={() => {
                    setSelectedCategory(cat);
                    setShowCategoryModal(false);
                  }}
                >
                  <View style={styles.categoryOptionContent}>
                    <Ionicons name={cat.icon as any} size={24} color={cat.color} />
                    <View style={styles.categoryOptionText}>
                      <Text style={styles.categoryOptionTitle}>{cat.title}</Text>
                      <Text style={styles.categoryOptionSubtitle}>{cat.subtitle}</Text>
                    </View>
                  </View>
                  {selectedCategory?.id === cat.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker || showEndDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={handleDateCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {currentDateField === 'start' ? 'בחר תאריך התחלה' : 'בחר תאריך סיום'}
              </Text>
              <TouchableOpacity onPress={handleDateCancel}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.datePickerContainer}>
              <View style={styles.dateDisplay}>
                <Text style={styles.dateDisplayText}>
                  {tempDate.toLocaleDateString('he-IL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </Text>
              </View>
              
              <View style={styles.dateControls}>
                <TouchableOpacity 
                  style={styles.dateControlButton}
                  onPress={() => {
                    const newDate = new Date(tempDate);
                    newDate.setDate(newDate.getDate() - 1);
                    if (newDate >= new Date()) {
                      setTempDate(newDate);
                    }
                  }}
                >
                  <Ionicons name="chevron-back" size={24} color="#3B82F6" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.dateControlButton}
                  onPress={() => {
                    const newDate = new Date(tempDate);
                    newDate.setDate(newDate.getDate() + 1);
                    setTempDate(newDate);
                  }}
                >
                  <Ionicons name="chevron-forward" size={24} color="#3B82F6" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.dateButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={handleDateCancel}
                >
                  <Text style={styles.cancelButtonText}>ביטול</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.confirmButton}
                  onPress={handleDateConfirm}
                >
                  <Text style={styles.confirmButtonText}>אישור</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 8,
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
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'right',
    lineHeight: 22,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  formField: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'right',
  },
  required: {
    color: '#EF4444',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    textAlign: 'right',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    fontWeight: '500',
  },
  imageUploadButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 8,
  },
  selectedImagesContainer: {
    marginTop: 16,
  },
  selectedImagesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageContainer: {
    position: 'relative',
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  dropdownText: {
    fontSize: 16,
    color: '#374151',
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInput: {
    flex: 1,
    marginRight: 12,
  },
  calendarButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItemText: {
    fontSize: 16,
    color: '#374151',
  },
  // סטיילים לשדות החדשים של הובלות קטנות
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 12,
  },
  checkboxField: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  // סגנונות למודל בחירת קטגוריה
  categoriesList: {
    maxHeight: 400,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryOptionSelected: {
    backgroundColor: '#F0F9FF',
  },
  categoryOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryOptionText: {
    marginLeft: 16,
    flex: 1,
  },
  categoryOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  categoryOptionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  // סגנונות ליומן החדש
  datePickerContainer: {
    padding: 20,
    alignItems: 'center',
  },
  dateDisplay: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  dateDisplayText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  dateControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 20,
  },
  dateControlButton: {
    backgroundColor: '#E0E7FF',
    borderRadius: 50,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});



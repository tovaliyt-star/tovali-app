import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useUserData } from '../context/UserDataContext';
import { useUserMode } from '../context/UserModeContext';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const { userData, updateUserData } = useUserData();
  const { userMode } = useUserMode();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
  });

  // שדות נוספים לנותני שירות
  const [profileImage, setProfileImage] = useState<string>('');
  const [idDocument, setIdDocument] = useState<string>('');

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        city: userData.city || '',
        zipCode: userData.zipCode || '',
      });
      
      // טעינת שדות נוספים לנותני שירות
      setProfileImage(userData.profileImage || '');
      setIdDocument(userData.idDocument || '');
    }
  }, [userData]);

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      Alert.alert('שגיאה', 'שם ומייל הם שדות חובה');
      return;
    }

    try {
      await updateUserData({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        zipCode: formData.zipCode.trim(),
        profileImage: profileImage,
        idDocument: idDocument,
      });
      
      Alert.alert('הצלחה!', 'הפרופיל עודכן בהצלחה', [
        { text: 'אישור', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('שגיאה', 'אירעה שגיאה בשמירת הפרופיל');
    }
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('שגיאה', 'נדרשת הרשאה לגישה לגלריה');
      return false;
    }
    return true;
  };

  const showImagePicker = (type: 'profile' | 'document') => {
    const options = ['מצלמה', 'גלריה', 'ביטול'];
    
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 2,
          title: type === 'profile' ? 'בחר תמונת פרופיל' : 'בחר תעודה מזהה',
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            pickImage('camera', type);
          } else if (buttonIndex === 1) {
            pickImage('gallery', type);
          }
        }
      );
    } else {
      Alert.alert(
        type === 'profile' ? 'בחר תמונת פרופיל' : 'בחר תעודה מזהה',
        '',
        [
          { text: 'מצלמה', onPress: () => pickImage('camera', type) },
          { text: 'גלריה', onPress: () => pickImage('gallery', type) },
          { text: 'ביטול', style: 'cancel' },
        ]
      );
    }
  };

  const pickImage = async (source: 'camera' | 'gallery', type: 'profile' | 'document') => {
    try {
      if (source === 'gallery') {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;
      }

      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'profile' ? [1, 1] : [4, 3],
        quality: 0.8,
      };

      let result;
      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        if (type === 'profile') {
          setProfileImage(imageUri);
        } else {
          setIdDocument(imageUri);
        }
      }
    } catch (error) {
      Alert.alert('שגיאה', 'אירעה שגיאה בהעלאת התמונה');
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
            <Ionicons name="arrow-back" size={24} color="#6366F1" />
            <Text style={styles.backButtonText}>חזור</Text>
          </TouchableOpacity>
          <Text style={styles.title}>עריכת פרופיל</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>שם מלא *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="הכנס את שמך המלא"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>כתובת מייל *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              placeholder="הכנס כתובת מייל"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>מספר טלפון</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
              placeholder="הכנס מספר טלפון"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>כתובת</Text>
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
              placeholder="הכנס כתובת"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>עיר</Text>
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
              placeholder="הכנס עיר"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>מיקוד</Text>
            <TextInput
              style={styles.input}
              value={formData.zipCode}
              onChangeText={(text) => setFormData(prev => ({ ...prev, zipCode: text }))}
              placeholder="הכנס מיקוד"
              keyboardType="numeric"
            />
          </View>

          {/* שדות נוספים לנותני שירות */}
          {userMode === 'provider' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>תמונת פרופיל</Text>
                <TouchableOpacity 
                  style={styles.uploadButton}
                  onPress={() => showImagePicker('profile')}
                >
                  <Ionicons name="camera-outline" size={20} color="#666" />
                  <Text style={styles.uploadButtonText}>
                    {profileImage ? 'תמונה נבחרה' : 'העלה תמונת פרופיל'}
                  </Text>
                </TouchableOpacity>
                {profileImage && (
                  <View style={styles.imagePreview}>
                    <Text style={styles.imagePreviewText}>✓ תמונה נבחרה</Text>
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>תעודה מזהה / רישיון</Text>
                <TouchableOpacity 
                  style={styles.uploadButton}
                  onPress={() => showImagePicker('document')}
                >
                  <Ionicons name="document-outline" size={20} color="#666" />
                  <Text style={styles.uploadButtonText}>
                    {idDocument ? 'תעודה נבחרה' : 'העלה תעודה מזהה או רישיון'}
                  </Text>
                </TouchableOpacity>
                {idDocument && (
                  <View style={styles.imagePreview}>
                    <Text style={styles.imagePreviewText}>✓ תעודה נבחרה</Text>
                  </View>
                )}
              </View>
            </>
          )}

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>שמור שינויים</Text>
          </TouchableOpacity>
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
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6366F1',
    marginLeft: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 15,
    height: 50,
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  imagePreview: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  imagePreviewText: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: '500',
    textAlign: 'center',
  },
});

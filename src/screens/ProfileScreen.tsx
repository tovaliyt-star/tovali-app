import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUserMode } from '../context/UserModeContext';
import { useUserData } from '../context/UserDataContext';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { userMode, trySwitchToProvider, setUserMode, checkProviderRequirements } = useUserMode();
  const { userData, clearUserData, updateUserData } = useUserData();
  
  const [profileImage, setProfileImage] = useState<string>('');
  const [idDocument, setIdDocument] = useState<string>('');
  const [hasRequiredDocs, setHasRequiredDocs] = useState<boolean>(false);

  useEffect(() => {
    if (userData) {
      setProfileImage(userData.profileImage || userData.avatar || '');
      setIdDocument(userData.idDocument || '');
    }
    checkDocsStatus();
  }, [userData]);

  const checkDocsStatus = async () => {
    const hasDocs = await checkProviderRequirements();
    setHasRequiredDocs(hasDocs);
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
          await updateUserData({ 
            profileImage: imageUri,
            avatar: imageUri 
          });
        } else {
          setIdDocument(imageUri);
          await updateUserData({ idDocument: imageUri });
        }
        
        // בדיקה מחדש של סטטוס המסמכים
        await checkDocsStatus();
        Alert.alert('הצלחה', 'התמונה הועלתה בהצלחה!');
      }
    } catch (error) {
      Alert.alert('שגיאה', 'אירעה שגיאה בהעלאת התמונה');
    }
  };

  const handleSwitchToCustomer = async () => {
    try {
      await setUserMode('customer');
      Alert.alert('הצלחה', 'עברת למצב מחפש שירות');
    } catch (error) {
      Alert.alert('שגיאה', 'אירעה שגיאה בהחלפת המצב');
    }
  };


  const handleLogout = () => {
    Alert.alert(
      'התנתקות',
      'האם אתה בטוח שברצונך להתנתק?',
      [
        {
          text: 'ביטול',
          style: 'cancel',
        },
        {
          text: 'התנתק',
          style: 'destructive',
          onPress: async () => {
            await clearUserData();
            navigation.navigate('Welcome');
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      id: 'edit',
      title: 'עריכת פרופיל',
      icon: 'person-outline',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      id: 'favorites',
      title: 'מועדפים',
      icon: 'heart-outline',
      onPress: () => navigation.navigate('Favorites'),
    },
    {
      id: 'orders',
      title: 'הזמנות',
      icon: 'list-outline',
      onPress: () => navigation.navigate('Orders'),
    },
    {
      id: 'reviews',
      title: 'ביקורות',
      icon: 'star-outline',
      onPress: () => navigation.navigate('Reviews'),
    },
    {
      id: 'payment',
      title: 'אמצעי תשלום',
      icon: 'card-outline',
      onPress: () => navigation.navigate('PaymentMethods'),
    },
    {
      id: 'credits-gifts',
      title: 'קרדיטים ומתנות',
      icon: 'gift-outline',
      onPress: () => navigation.navigate('CreditsAndGifts'),
    },
    {
      id: 'settings',
      title: 'הגדרות',
      icon: 'settings-outline',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      id: 'help',
      title: 'עזרה ותמיכה',
      icon: 'help-circle-outline',
      onPress: () => navigation.navigate('GetHelp'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <TouchableOpacity style={styles.avatarContainer} onPress={() => showImagePicker('profile')}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#9CA3AF" />
              </View>
            )}
            <View style={styles.avatarEditIcon}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userData?.name || 'משתמש טובלי'}</Text>
            <Text style={styles.userEmail}>{userData?.email || 'user@tovali.com'}</Text>
            <View style={styles.userTypeContainer}>
              <Text style={styles.userType}>
                {userMode === 'customer' ? 'מחפש שירות' : 'נותן שירות'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuItemContent}>
              <Ionicons name={item.icon as any} size={24} color="#6366F1" />
              <Text style={styles.menuItemTitle}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Document Upload Section - רק אם המשתמש הוא לקוח */}
      {userMode === 'customer' && (
        <View style={styles.documentsSection}>
          <Text style={styles.documentsTitle}>מסמכים נדרשים למעבר לנותן שירות</Text>
          
          {/* Profile Image Upload */}
          <View style={styles.documentItem}>
            <View style={styles.documentHeader}>
              <Ionicons name="camera-outline" size={20} color="#6366F1" />
              <Text style={styles.documentLabel}>תמונת פרופיל</Text>
              {profileImage ? (
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              ) : (
                <Ionicons name="close-circle" size={20} color="#EF4444" />
              )}
            </View>
            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={() => showImagePicker('profile')}
            >
              <Text style={styles.uploadButtonText}>
                {profileImage ? 'תמונה הועלתה ✓' : 'העלה תמונת פרופיל'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ID Document Upload */}
          <View style={styles.documentItem}>
            <View style={styles.documentHeader}>
              <Ionicons name="document-outline" size={20} color="#6366F1" />
              <Text style={styles.documentLabel}>תעודה מזהה / רישיון</Text>
              {idDocument ? (
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              ) : (
                <Ionicons name="close-circle" size={20} color="#EF4444" />
              )}
            </View>
            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={() => showImagePicker('document')}
            >
              <Text style={styles.uploadButtonText}>
                {idDocument ? 'תעודה הועלתה ✓' : 'העלה תעודה מזהה'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Status Message */}
          <View style={styles.statusContainer}>
            {hasRequiredDocs ? (
              <View style={styles.statusSuccess}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.statusSuccessText}>כל המסמכים הועלו! ניתן לעבור לנותן שירות</Text>
              </View>
            ) : (
              <View style={styles.statusWarning}>
                <Ionicons name="warning" size={20} color="#F59E0B" />
                <Text style={styles.statusWarningText}>חסרים מסמכים נדרשים למעבר לנותן שירות</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Switch Mode Buttons */}
      {userMode === 'customer' ? (
        <TouchableOpacity 
          style={[
            styles.switchToProviderButton, 
            !hasRequiredDocs && styles.switchToProviderButtonDisabled
          ]} 
          onPress={trySwitchToProvider}
        >
          <Ionicons name="briefcase" size={24} color="#FFFFFF" />
          <Text style={styles.switchToProviderText}>
            {hasRequiredDocs ? 'עבור לנותן שירות' : 'העלה מסמכים למעבר לנותן שירות'}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.switchToCustomerButton} onPress={handleSwitchToCustomer}>
          <Ionicons name="person" size={24} color="#FFFFFF" />
          <Text style={styles.switchToCustomerText}>עבור למצב מחפש שירות</Text>
        </TouchableOpacity>
      )}

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#EF4444" />
        <Text style={styles.logoutText}>התנתק</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  avatarEditIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6366F1',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  userTypeContainer: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  userType: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemTitle: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  switchToProviderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  switchToProviderButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowColor: '#9CA3AF',
    opacity: 0.7,
  },
  switchToProviderText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  switchToCustomerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  switchToCustomerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  documentsSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  documentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  documentItem: {
    marginBottom: 16,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  documentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  uploadButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  statusContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
  },
  statusSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  statusSuccessText: {
    fontSize: 14,
    color: '#10B981',
    marginLeft: 8,
    fontWeight: '500',
  },
  statusWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  statusWarningText: {
    fontSize: 14,
    color: '#F59E0B',
    marginLeft: 8,
    fontWeight: '500',
  },
});

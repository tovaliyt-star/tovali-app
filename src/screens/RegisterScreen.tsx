import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useUserData } from '../context/UserDataContext';
import { useUserMode } from '../context/UserModeContext';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';

type Props = StackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { createNewUser } = useUserData();
  const { setUserMode } = useUserMode();
  
  const [userType, setUserType] = useState<'customer' | 'provider'>('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // שדות נוספים לנותני שירות
  const [profileImage, setProfileImage] = useState<string>('');
  const [idDocument, setIdDocument] = useState<string>('');
  const [licenseDocument, setLicenseDocument] = useState<string>('');

  const handleRegister = async () => {
    if (!name || !email || !phone || !password || !confirmPassword) {
      Alert.alert('שגיאה', 'אנא מלא את כל השדות');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('שגיאה', 'הסיסמאות אינן תואמות');
      return;
    }

    if (!agreeToTerms) {
      Alert.alert('שגיאה', 'יש להסכים לתנאי השימוש');
      return;
    }

    // בדיקה נוספת לנותני שירות
    if (userType === 'provider' && (!profileImage || !idDocument)) {
      Alert.alert('שגיאה', 'נותני שירות חייבים להעלות תמונת פרופיל ותעודה מזהה');
      return;
    }

    setLoading(true);
    
    try {
      // BEGIN: Supabase Auth integration
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            user_type: userType,
          },
        },
      });
      if (authError) {
        throw authError;
      }
      const userId = authData?.user?.id;
      if (!userId) {
        throw new Error('User creation failed');
      }
      // END: Supabase Auth integration

      // יצירת משתמש חדש
      await createNewUser({
        name,
        email,
        phone,
        password: '',
        userType,
        avatar: '',
        address: '',
        city: '',
        zipCode: '',
        profileImage: userType === 'provider' ? profileImage : '',
        idDocument: userType === 'provider' ? idDocument : '',
        licenseDocument: userType === 'provider' ? licenseDocument : '',
        isVerified: userType === 'provider' ? false : true,
      });

      // הגדרת מצב המשתמש
      await setUserMode(userType);

      setLoading(false);
      Alert.alert('הצלחה', 'ההרשמה הושלמה בהצלחה!', [
        {
          text: 'אישור',
          onPress: () => navigation.navigate('Main' as any),
        },
      ]);
    } catch (error: any) {
      setLoading(false);
      Alert.alert('שגיאה', error.message || 'אירעה שגיאה בהרשמה. אנא נסה שוב.');
    }
  };

  const handleSocialRegister = async (provider: string) => {
    try {
      setLoading(true);
      
      // סימולציה של הרשמה חברתית - ניתן להחליף בקוד אמיתי מאוחר יותר
      setTimeout(() => {
        setLoading(false);
        
        if (provider === 'Google') {
          // סימולציה של נתוני Google - נתונים אמיתיים
          const mockUserInfo = {
            name: 'et', // השם האמיתי שלך
            email: 'et@gmail.com', // האימייל האמיתי שלך
            picture: 'https://via.placeholder.com/150',
          };
          
          handleGoogleRegister(mockUserInfo);
        } else if (provider === 'Facebook') {
          // סימולציה של נתוני Facebook
          const mockUserInfo = {
            name: 'משתמש Facebook',
            email: 'facebook.user@facebook.com',
            picture: 'https://via.placeholder.com/150',
          };
          
          handleFacebookRegister(mockUserInfo);
        }
      }, 1500);
    } catch (error) {
      setLoading(false);
      Alert.alert('שגיאה', 'אירעה שגיאה בהרשמה');
    }
  };

  const handleGoogleRegister = async (userInfo: any) => {
    try {
      await createNewUser({
        name: userInfo.name,
        email: userInfo.email,
        phone: '',
        password: '',
        userType: userType,
        avatar: userInfo.picture || '',
        address: '',
        city: '',
        zipCode: '',
        profileImage: userType === 'provider' ? profileImage : '',
        idDocument: userType === 'provider' ? idDocument : '',
        licenseDocument: userType === 'provider' ? licenseDocument : '',
        isVerified: userType === 'provider' ? false : true,
      });
      
      await setUserMode(userType);
      Alert.alert('הצלחה', 'נרשמת בהצלחה עם Google!', [
        { text: 'אישור', onPress: () => navigation.navigate('Main' as any) },
      ]);
    } catch (error) {
      Alert.alert('שגיאה', 'אירעה שגיאה בהרשמה עם Google');
    }
  };

  const handleFacebookRegister = async (userInfo: any) => {
    try {
      await createNewUser({
        name: userInfo.name,
        email: userInfo.email,
        phone: '',
        password: '',
        userType: userType,
        avatar: userInfo.picture || '',
        address: '',
        city: '',
        zipCode: '',
        profileImage: userType === 'provider' ? profileImage : '',
        idDocument: userType === 'provider' ? idDocument : '',
        licenseDocument: userType === 'provider' ? licenseDocument : '',
        isVerified: userType === 'provider' ? false : true,
      });
      
      await setUserMode(userType);
      Alert.alert('הצלחה', 'נרשמת בהצלחה עם Facebook!', [
        { text: 'אישור', onPress: () => navigation.navigate('Main' as any) },
      ]);
    } catch (error) {
      Alert.alert('שגיאה', 'אירעה שגיאה בהרשמה עם Facebook');
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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>הצטרף אלינו!</Text>
        <Text style={styles.subtitle}>צור חשבון חדש</Text>
      </View>

      <View style={styles.form}>
        {/* User Type Selection */}
        <View style={styles.userTypeContainer}>
          <Text style={styles.inputLabel}>סוג המשתמש</Text>
          <View style={styles.userTypeButtons}>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'customer' && styles.userTypeButtonActive,
              ]}
              onPress={() => setUserType('customer')}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={userType === 'customer' ? '#007AFF' : '#666'}
              />
              <Text
                style={[
                  styles.userTypeButtonText,
                  userType === 'customer' && styles.userTypeButtonTextActive,
                ]}
              >
                מחפש שירות
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'provider' && styles.userTypeButtonActive,
              ]}
              onPress={() => setUserType('provider')}
            >
              <Ionicons
                name="construct-outline"
                size={20}
                color={userType === 'provider' ? '#007AFF' : '#666'}
              />
              <Text
                style={[
                  styles.userTypeButtonText,
                  userType === 'provider' && styles.userTypeButtonTextActive,
                ]}
              >
                נותן שירות
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>שם מלא</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="הכנס את השם המלא שלך"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>אימייל</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="הכנס את האימייל שלך"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>טלפון</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="הכנס את מספר הטלפון שלך"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>סיסמה</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="הכנס סיסמה"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>אימות סיסמה</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="הכנס שוב את הסיסמה"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* שדות נוספים לנותני שירות */}
        {userType === 'provider' && (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>תמונת פרופיל</Text>
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

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>תעודה מזהה / רישיון</Text>
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

        <View style={styles.termsContainer}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setAgreeToTerms(!agreeToTerms)}
          >
            <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
              {agreeToTerms && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={styles.termsText}>
              אני מסכים ל
              <Text 
                style={styles.termsLink}
                onPress={() => navigation.navigate('TermsOfService')}
              >
                תנאי השימוש
              </Text>
              ול
              <Text 
                style={styles.termsLink}
                onPress={() => navigation.navigate('PrivacyPolicy')}
              >
                מדיניות הפרטיות
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.registerButton, loading && styles.registerButtonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.registerButtonText}>
            {loading ? 'נרשם...' : 'הירשם'}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>או</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialButtons}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleSocialRegister('Google')}
          >
            <Ionicons name="logo-google" size={20} color="#DB4437" />
            <Text style={styles.socialButtonText}>Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleSocialRegister('Facebook')}
          >
            <Ionicons name="logo-facebook" size={20} color="#4267B2" />
            <Text style={styles.socialButtonText}>Facebook</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>כבר יש לך חשבון? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>התחבר כאן</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  userTypeContainer: {
    marginBottom: 20,
  },
  userTypeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  userTypeButtonActive: {
    backgroundColor: '#e6f3ff',
    borderColor: '#007AFF',
  },
  userTypeButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  userTypeButtonTextActive: {
    color: '#007AFF',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
  },
  passwordToggle: {
    padding: 5,
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
  termsContainer: {
    marginBottom: 30,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  termsLink: {
    color: '#007AFF',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  registerButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  registerButtonDisabled: {
    backgroundColor: '#ccc',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 14,
    color: '#666',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    height: 50,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  socialButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  footerLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
  },
});

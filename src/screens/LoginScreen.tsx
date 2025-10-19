import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useUserData } from '../context/UserDataContext';
import { useUserMode } from '../context/UserModeContext';

type Props = StackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { userData, loadUserData, createNewUser } = useUserData();
  const { setUserMode } = useUserMode();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('שגיאה', 'אנא מלא את כל השדות');
      return;
    }

    setLoading(true);
    
    try {
      // טעינת נתוני המשתמש
      await loadUserData();
      
      // בדיקה אם המשתמש קיים וסיסמתו נכונה
      if (userData && userData.email === email && userData.password === password) {
        // הגדרת מצב המשתמש
        await setUserMode(userData.userType);
        
        setLoading(false);
        Alert.alert('הצלחה', 'התחברת בהצלחה!', [
          {
            text: 'אישור',
            onPress: () => navigation.navigate('Main' as any),
          },
        ]);
      } else {
        setLoading(false);
        Alert.alert('שגיאה', 'אימייל או סיסמה שגויים');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('שגיאה', 'אירעה שגיאה בהתחברות. אנא נסה שוב.');
    }
  };

  const handleSocialLogin = async (provider: string) => {
    try {
      setLoading(true);
      
      // סימולציה של התחברות חברתית - ניתן להחליף בקוד אמיתי מאוחר יותר
      setTimeout(() => {
        setLoading(false);
        
        if (provider === 'Google') {
          // סימולציה של נתוני Google - נתונים אמיתיים
          const mockUserInfo = {
            name: 'et', // השם האמיתי שלך
            email: 'et@gmail.com', // האימייל האמיתי שלך
            picture: 'https://via.placeholder.com/150',
          };
          
          handleGoogleLogin(mockUserInfo);
        } else if (provider === 'Facebook') {
          // סימולציה של נתוני Facebook
          const mockUserInfo = {
            name: 'משתמש Facebook',
            email: 'facebook.user@facebook.com',
            picture: 'https://via.placeholder.com/150',
          };
          
          handleFacebookLogin(mockUserInfo);
        }
      }, 1500);
    } catch (error) {
      setLoading(false);
      Alert.alert('שגיאה', 'אירעה שגיאה בהתחברות');
    }
  };

  const handleGoogleLogin = async (userInfo: any) => {
    try {
      // בדיקה אם המשתמש כבר קיים
      await loadUserData();
      
      if (userData && userData.email === userInfo.email) {
        // משתמש קיים - התחברות
        await setUserMode(userData.userType);
        Alert.alert('הצלחה', 'התחברת בהצלחה עם Google!', [
          { text: 'אישור', onPress: () => navigation.navigate('Main' as any) },
        ]);
      } else {
        // אם יש משתמש אחר, נמחק אותו ונצור חדש
        if (userData) {
          await resetUserData();
        }
        
        // משתמש חדש - הרשמה
        await createNewUser({
          name: userInfo.name,
          email: userInfo.email,
          phone: '',
          password: '', // אין סיסמה בהתחברות חברתית
          userType: 'customer', // ברירת מחדל
          avatar: userInfo.picture || '',
          address: '',
          city: '',
          zipCode: '',
          profileImage: '',
          idDocument: '',
          licenseDocument: '',
          isVerified: true,
        });
        
        await setUserMode('customer');
        Alert.alert('הצלחה', 'נרשמת בהצלחה עם Google!', [
          { text: 'אישור', onPress: () => navigation.navigate('Main' as any) },
        ]);
      }
    } catch (error) {
      Alert.alert('שגיאה', 'אירעה שגיאה בהתחברות עם Google');
    }
  };

  const handleFacebookLogin = async (userInfo: any) => {
    try {
      // בדיקה אם המשתמש כבר קיים
      await loadUserData();
      
      if (userData && userData.email === userInfo.email) {
        // משתמש קיים - התחברות
        await setUserMode(userData.userType);
        Alert.alert('הצלחה', 'התחברת בהצלחה עם Facebook!', [
          { text: 'אישור', onPress: () => navigation.navigate('Main' as any) },
        ]);
      } else {
        // אם יש משתמש אחר, נמחק אותו ונצור חדש
        if (userData) {
          await resetUserData();
        }
        
        // משתמש חדש - הרשמה
        await createNewUser({
          name: userInfo.name,
          email: userInfo.email,
          phone: '',
          password: '', // אין סיסמה בהתחברות חברתית
          userType: 'customer', // ברירת מחדל
          avatar: userInfo.picture || '',
          address: '',
          city: '',
          zipCode: '',
          profileImage: '',
          idDocument: '',
          licenseDocument: '',
          isVerified: true,
        });
        
        await setUserMode('customer');
        Alert.alert('הצלחה', 'נרשמת בהצלחה עם Facebook!', [
          { text: 'אישור', onPress: () => navigation.navigate('Main' as any) },
        ]);
      }
    } catch (error) {
      Alert.alert('שגיאה', 'אירעה שגיאה בהתחברות עם Facebook');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>ברוכים השבים!</Text>
        <Text style={styles.subtitle}>התחבר לחשבון שלך</Text>
      </View>

      <View style={styles.form}>
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
          <Text style={styles.inputLabel}>סיסמה</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="הכנס את הסיסמה שלך"
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

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>שכחת את הסיסמה?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'מתחבר...' : 'התחבר'}
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
            onPress={() => handleSocialLogin('Google')}
          >
            <Ionicons name="logo-google" size={20} color="#DB4437" />
            <Text style={styles.socialButtonText}>Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleSocialLogin('Facebook')}
          >
            <Ionicons name="logo-facebook" size={20} color="#4267B2" />
            <Text style={styles.socialButtonText}>Facebook</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>אין לך חשבון? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}>הירשם כאן</Text>
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
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
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

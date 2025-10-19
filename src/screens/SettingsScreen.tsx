import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useUserData } from '../context/UserDataContext';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { userData, updateUserData, clearUserData } = useUserData();
  const [notifications, setNotifications] = useState(userData?.preferences?.notifications ?? true);
  const [emailUpdates, setEmailUpdates] = useState(userData?.preferences?.emailUpdates ?? true);
  const [pushNotifications, setPushNotifications] = useState(userData?.preferences?.pushNotifications ?? true);

  const handleToggleNotifications = async (value: boolean) => {
    setNotifications(value);
    await updateUserData({
      preferences: {
        ...userData?.preferences,
        notifications: value,
      },
    });
  };

  const handleToggleEmailUpdates = async (value: boolean) => {
    setEmailUpdates(value);
    await updateUserData({
      preferences: {
        ...userData?.preferences,
        emailUpdates: value,
      },
    });
  };

  const handleTogglePushNotifications = async (value: boolean) => {
    setPushNotifications(value);
    await updateUserData({
      preferences: {
        ...userData?.preferences,
        pushNotifications: value,
      },
    });
  };

  const handleLogout = () => {
    Alert.alert(
      'התנתקות',
      'האם אתה בטוח שברצונך להתנתק?',
      [
        { text: 'ביטול', style: 'cancel' },
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

  const handleDeleteAccount = () => {
    Alert.alert(
      'מחיקת חשבון',
      'האם אתה בטוח שברצונך למחוק את החשבון? פעולה זו אינה הפיכה.',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק חשבון',
          style: 'destructive',
          onPress: async () => {
            await clearUserData();
            navigation.navigate('Welcome');
          },
        },
      ]
    );
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
          <Text style={styles.title}>הגדרות</Text>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>העדפות</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={24} color="#6366F1" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>התראות</Text>
                <Text style={styles.settingDescription}>קבל התראות על עדכונים חשובים</Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="mail-outline" size={24} color="#6366F1" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>עדכונים במייל</Text>
                <Text style={styles.settingDescription}>קבל עדכונים בכתובת המייל שלך</Text>
              </View>
            </View>
            <Switch
              value={emailUpdates}
              onValueChange={handleToggleEmailUpdates}
              trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="phone-portrait-outline" size={24} color="#6366F1" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>התראות דחיפה</Text>
                <Text style={styles.settingDescription}>קבל התראות מיידיות במכשיר</Text>
              </View>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={handleTogglePushNotifications}
              trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>חשבון</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="shield-outline" size={24} color="#6366F1" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>פרטיות ואבטחה</Text>
                <Text style={styles.settingDescription}>נהל הגדרות פרטיות ואבטחה</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="language-outline" size={24} color="#6366F1" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>שפה</Text>
                <Text style={styles.settingDescription}>עברית</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>פעולות</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
            <View style={styles.settingInfo}>
              <Ionicons name="log-out-outline" size={24} color="#EF4444" />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, styles.dangerText]}>התנתק</Text>
                <Text style={styles.settingDescription}>התנתק מהחשבון שלך</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleDeleteAccount}>
            <View style={styles.settingInfo}>
              <Ionicons name="trash-outline" size={24} color="#EF4444" />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, styles.dangerText]}>מחק חשבון</Text>
                <Text style={styles.settingDescription}>מחק את החשבון לצמיתות</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
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
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  dangerText: {
    color: '#EF4444',
  },
});

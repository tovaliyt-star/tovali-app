import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useUserData } from '../context/UserDataContext';

export default function ReferralCreditsScreen() {
  const navigation = useNavigation<any>();
  const { userData } = useUserData();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // סימולציה של טעינת נתונים
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // בדיקה בטוחה של הנתונים
  const safeReferralCredits = userData?.referralCredits ?? 100;
  
  const referralStats = {
    totalCredits: 150,
    usedCredits: 50,
    availableCredits: safeReferralCredits,
    referralCode: 'IDAN123',
    referralsCount: 3,
  };

  const referralHistory = [
    {
      id: '1',
      name: 'יוסי כהן',
      date: '15/08/2025',
      credits: 50,
      status: 'completed',
    },
    {
      id: '2',
      name: 'שרה לוי',
      date: '10/08/2025',
      credits: 50,
      status: 'completed',
    },
    {
      id: '3',
      name: 'דוד ישראלי',
      date: '05/08/2025',
      credits: 50,
      status: 'pending',
    },
  ];

  const handleShareReferral = () => {
    Alert.alert(
      'שיתוף קוד הפניה',
      `קוד ההפניה שלך: ${referralStats.referralCode}\n\nהפונקציה תהיה זמינה בקרוב. בינתיים, העתק את הקוד ושתף אותו ידנית.`,
      [{ text: 'אישור' }]
    );
  };

  const handleCopyReferralCode = () => {
    Alert.alert(
      'העתקת קוד הפניה',
      `קוד ההפניה ${referralStats.referralCode} הועתק בהצלחה!`,
      [{ text: 'אישור' }]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>טוען...</Text>
      </View>
    );
  }

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
          <Text style={styles.title}>קרדיטים הפניה</Text>
        </View>

        {/* Credits Summary */}
        <View style={styles.creditsContainer}>
          <View style={styles.creditsHeader}>
            <Text style={styles.creditsTitle}>קרדיטים זמינים</Text>
            <Text style={styles.creditsAmount}>{referralStats.availableCredits} ₪</Text>
          </View>
          <View style={styles.creditsProgress}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(referralStats.usedCredits / referralStats.totalCredits) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {referralStats.usedCredits} ₪ מתוך {referralStats.totalCredits} ₪
            </Text>
          </View>
        </View>

        {/* Referral Code */}
        <View style={styles.referralCodeContainer}>
          <Text style={styles.referralCodeTitle}>קוד ההפניה שלך</Text>
          <View style={styles.codeDisplay}>
            <Text style={styles.codeText}>{referralStats.referralCode}</Text>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopyReferralCode}>
              <Ionicons name="copy-outline" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.shareButton} onPress={handleShareReferral}>
            <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
            <Text style={styles.shareButtonText}>שתף קוד הפניה</Text>
          </TouchableOpacity>
        </View>

        {/* Referral Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{referralStats.referralsCount}</Text>
            <Text style={styles.statLabel}>הפניות</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{referralStats.totalCredits} ₪</Text>
            <Text style={styles.statLabel}>סה"כ קרדיטים</Text>
          </View>
        </View>

        {/* Referral History */}
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>היסטוריית הפניות</Text>
          {referralHistory.map((referral) => (
            <View key={referral.id} style={styles.historyItem}>
              <View style={styles.historyContent}>
                <Text style={styles.historyName}>{referral.name}</Text>
                <Text style={styles.historyDate}>{referral.date}</Text>
              </View>
              <View style={styles.historyRight}>
                <Text style={styles.historyCredits}>+{referral.credits} ₪</Text>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: referral.status === 'completed' ? '#10B981' : '#F59E0B' }
                ]}>
                  <Text style={styles.statusText}>
                    {referral.status === 'completed' ? 'הושלם' : 'ממתין'}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* How It Works */}
        <View style={styles.howItWorksContainer}>
          <Text style={styles.howItWorksTitle}>איך זה עובד?</Text>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>1</View>
            <Text style={styles.stepText}>שתף את קוד ההפניה שלך עם חברים</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>2</View>
            <Text style={styles.stepText}>החבר נרשם ומשתמש בקוד שלך</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>3</View>
            <Text style={styles.stepText}>קבל 50 ₪ קרדיטים לכל הפניה מוצלחת</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6366F1',
    marginLeft: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  creditsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  creditsHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  creditsTitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  creditsAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  creditsProgress: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
  },
  referralCodeContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  referralCodeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  codeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  codeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 12,
    letterSpacing: 2,
  },
  copyButton: {
    padding: 8,
  },
  shareButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  historyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  historyContent: {
    flex: 1,
  },
  historyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyCredits: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  howItWorksContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  howItWorksTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
});

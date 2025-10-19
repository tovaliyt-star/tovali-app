import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useUserData } from '../context/UserDataContext';

export default function CreditsAndGiftsScreen() {
  const navigation = useNavigation<any>();
  const { userData, addGiftCard, updateUserData } = useUserData();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'credits' | 'gifts'>('credits');
  const [newGiftCardCode, setNewGiftCardCode] = useState('');
  const [localCredits, setLocalCredits] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    // עדכון קרדיטים מקומיים
    if (userData?.referralCredits !== undefined) {
      setLocalCredits(userData.referralCredits);
    }
    
    // עדכון כרטיסי מתנה
    if (userData?.giftCards) {
      setGiftCards(userData.giftCards);
    }
    
    return () => clearTimeout(timer);
  }, [userData]);
  
  const safeReferralCredits = userData?.referralCredits ?? 100;
  
  const referralStats = {
    totalCredits: 150,
    usedCredits: 50,
    availableCredits: localCredits || safeReferralCredits,
    referralCode: 'IDAN123',
    referralsCount: 3,
  };

  const referralHistory = [
    { id: '1', name: 'יוסי כהן', date: '15/08/2025', credits: 50, status: 'completed' },
    { id: '2', name: 'שרה לוי', date: '10/08/2025', credits: 50, status: 'completed' },
    { id: '3', name: 'דוד ישראלי', date: '05/08/2025', credits: 50, status: 'pending' },
  ];

  const [giftCards, setGiftCards] = useState(userData?.giftCards || [
    { id: '1', code: 'GIFT123456', amount: 100, balance: 75, expiryDate: '31/12/2025', isActive: true },
    { id: '2', code: 'GIFT789012', amount: 50, balance: 0, expiryDate: '15/06/2025', isActive: false },
  ]);

  const handleShareReferral = () => {
    Alert.alert('שיתוף קוד הפניה', `קוד ההפניה שלך: ${referralStats.referralCode}`, [{ text: 'אישור' }]);
  };

  const handleCopyReferralCode = () => {
    Alert.alert('העתקת קוד הפניה', `קוד ההפניה ${referralStats.referralCode} הועתק בהצלחה!`, [{ text: 'אישור' }]);
  };

  const handleRedeemGiftCard = () => {
    if (!newGiftCardCode.trim()) {
      Alert.alert('שגיאה', 'אנא הכנס קוד כרטיס מתנה');
      return;
    }
    const newGiftCard = { id: Date.now().toString(), code: newGiftCardCode, amount: 100, balance: 100, expiryDate: '31/12/2025', isActive: true };
    addGiftCard(newGiftCard);
    setGiftCards(prev => [...prev, newGiftCard]); // עדכון מיידי של הרשימה המקומית
    setNewGiftCardCode('');
    Alert.alert('הצלחה!', 'כרטיס המתנה נפדה בהצלחה!', [{ text: 'אישור' }]);
  };

  const handleUseGiftCard = async (card: any) => {
    Alert.alert(
      'שימוש בכרטיס מתנה',
      `האם אתה בטוח שברצונך להשתמש בכרטיס מתנה ${card.code} בסכום ${card.balance} ₪?`,
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'השתמש',
          onPress: async () => {
            try {
              // הוספת הכסף לקרדיטים
              const currentCredits = userData?.referralCredits || 0;
              const newCredits = currentCredits + card.balance;
              await updateUserData({ referralCredits: newCredits });
              
              // עדכון הקרדיטים המקומיים
              setLocalCredits(newCredits);
              
              // עדכון הכרטיס - איפוס היתרה והפיכה ללא פעיל
              const updatedCards = giftCards.map(gc => 
                gc.id === card.id ? { ...gc, balance: 0, isActive: false } : gc
              );
              setGiftCards(updatedCards);
              
              // עדכון גם ב-UserDataContext
              const currentGiftCards = userData?.giftCards || [];
              const updatedGiftCardsInContext = currentGiftCards.map((gc: any) => 
                gc.id === card.id ? { ...gc, balance: 0, isActive: false } : gc
              );
              await updateUserData({ giftCards: updatedGiftCardsInContext });
              
              Alert.alert(
                'הצלחה!',
                `השתמשת בכרטיס מתנה ${card.code} בסכום ${card.balance} ₪. הכסף נוסף לקרדיטים שלך!`,
                [{ text: 'אישור' }]
              );
            } catch (error) {
              Alert.alert('שגיאה', 'אירעה שגיאה בשימוש בכרטיס המתנה');
            }
          }
        }
      ]
    );
  };

  const handleGiftCardActions = (card: any) => {
    Alert.alert('פעולות כרטיס מתנה', 'בחר פעולה', [
      { text: 'ביטול', style: 'cancel' },
      { text: 'ערוך', onPress: () => Alert.alert('עריכת כרטיס מתנה', 'הפונקציה תהיה זמינה בקרוב', [{ text: 'אישור' }]) },
      { text: 'מחק', style: 'destructive', onPress: () => {
        Alert.alert('מחיקת כרטיס מתנה', 'האם אתה בטוח?', [
          { text: 'ביטול', style: 'cancel' },
          { text: 'מחק', style: 'destructive', onPress: () => setGiftCards(prev => prev.filter(gc => gc.id !== card.id)) },
        ]);
      }},
    ]);
  };

  const getGiftCardStatus = (card: any) => {
    if (!card.isActive) return 'שומש';
    if (card.balance === 0) return 'מרוקן';
    return 'פעיל';
  };

  const getGiftCardStatusColor = (card: any) => {
    if (!card.isActive) return '#EF4444'; // אדום לכרטיסים ששומשו
    if (card.balance === 0) return '#6B7280'; // אפור לכרטיסים מרוקנים
    return '#10B981'; // ירוק לכרטיסים פעילים
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>טוען...</Text>
      </View>
    );
  }

  const renderCreditsTab = () => (
    <>
      <View style={styles.creditsContainer}>
        <View style={styles.creditsHeader}>
          <Text style={styles.creditsTitle}>קרדיטים זמינים</Text>
          <Text style={styles.creditsAmount}>{String(referralStats.availableCredits)} ₪</Text>
        </View>
        <View style={styles.creditsProgress}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(referralStats.usedCredits / referralStats.totalCredits) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{String(referralStats.usedCredits)} ₪ מתוך {String(referralStats.totalCredits)} ₪</Text>
        </View>
      </View>

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

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{String(referralStats.referralsCount)}</Text>
          <Text style={styles.statLabel}>הפניות</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{String(referralStats.totalCredits)} ₪</Text>
          <Text style={styles.statLabel}>סה"כ קרדיטים</Text>
        </View>
      </View>

      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>היסטוריית הפניות</Text>
        {referralHistory.map((referral) => (
          <View key={referral.id} style={styles.historyItem}>
            <View style={styles.historyContent}>
              <Text style={styles.historyName}>{referral.name}</Text>
              <Text style={styles.historyDate}>{referral.date}</Text>
            </View>
            <View style={styles.historyRight}>
              <Text style={styles.historyCredits}>+{String(referral.credits)} ₪</Text>
              <View style={[styles.statusBadge, { backgroundColor: referral.status === 'completed' ? '#10B981' : '#F59E0B' }]}>
                <Text style={styles.statusText}>{referral.status === 'completed' ? 'הושלם' : 'ממתין'}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.howItWorksContainer}>
        <Text style={styles.howItWorksTitle}>איך זה עובד?</Text>
        <View style={styles.stepItem}>
          <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
          <Text style={styles.stepText}>שתף את קוד ההפניה שלך עם חברים</Text>
        </View>
        <View style={styles.stepItem}>
          <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
          <Text style={styles.stepText}>החבר נרשם ומשתמש בקוד שלך</Text>
        </View>
        <View style={styles.stepItem}>
          <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
          <Text style={styles.stepText}>קבל 50 ₪ קרדיטים לכל הפניה מוצלחת</Text>
        </View>
      </View>
    </>
  );

  const renderGiftsTab = () => (
    <>
      <View style={styles.redeemContainer}>
        <Text style={styles.redeemTitle}>פדה כרטיס מתנה חדש</Text>
        <View style={styles.redeemInputContainer}>
          <TextInput style={styles.redeemInput} placeholder="הכנס קוד כרטיס מתנה" value={newGiftCardCode} onChangeText={setNewGiftCardCode} autoCapitalize="characters" />
          <TouchableOpacity style={styles.redeemButton} onPress={handleRedeemGiftCard}>
            <Text style={styles.redeemButtonText}>פדה</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.giftCardsContainer}>
        <Text style={styles.giftCardsTitle}>כרטיסי המתנה שלך</Text>
        {giftCards.map((card) => (
          <View key={card.id} style={styles.giftCardItem}>
            <View style={styles.giftCardHeader}>
              <View style={styles.giftCardInfo}>
                <Text style={styles.giftCardCode}>{card.code}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getGiftCardStatusColor(card) }]}>
                  <Text style={styles.statusText}>{getGiftCardStatus(card)}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.moreButton} onPress={() => handleGiftCardActions(card)}>
                <Ionicons name="ellipsis-vertical" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.giftCardDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>סכום מקורי:</Text>
                <Text style={styles.detailValue}>{String(card.amount)} ₪</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>יתרה זמינה:</Text>
                <Text style={styles.detailValue}>{String(card.balance)} ₪</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>תוקף עד:</Text>
                <Text style={styles.detailValue}>{card.expiryDate}</Text>
              </View>
            </View>
            {card.balance > 0 && card.isActive && (
              <TouchableOpacity style={styles.useGiftCardButton} onPress={() => handleUseGiftCard(card)}>
                <Text style={styles.useGiftCardButtonText}>השתמש בכרטיס</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {giftCards.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="gift-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>אין לך כרטיסי מתנה עדיין</Text>
          <Text style={styles.emptySubtitle}>פדה כרטיס מתנה ראשון כדי להתחיל</Text>
        </View>
      )}

      <View style={styles.howItWorksContainer}>
        <Text style={styles.howItWorksTitle}>איך זה עובד?</Text>
        <View style={styles.stepItem}>
          <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
          <Text style={styles.stepText}>קבל כרטיס מתנה מחבר או מבן משפחה</Text>
        </View>
        <View style={styles.stepItem}>
          <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
          <Text style={styles.stepText}>פדה את הכרטיס באמצעות הקוד</Text>
        </View>
        <View style={styles.stepItem}>
          <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
          <Text style={styles.stepText}>השתמש בערך הכרטיס לשירותים</Text>
        </View>
      </View>
    </>
  );

  return (
    <LinearGradient colors={['#fdf2f8', '#fed7d3', '#fce7f3']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#6366F1" />
            <Text style={styles.backButtonText}>חזור</Text>
          </TouchableOpacity>
          <Text style={styles.title}>קרדיטים ומתנות</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tab, activeTab === 'credits' && styles.activeTab]} onPress={() => setActiveTab('credits')}>
            <Ionicons name="cash-outline" size={20} color={activeTab === 'credits' ? '#FFFFFF' : '#6366F1'} />
            <Text style={[styles.tabText, activeTab === 'credits' && styles.activeTabText]}>קרדיטים</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'gifts' && styles.activeTab]} onPress={() => setActiveTab('gifts')}>
            <Ionicons name="gift-outline" size={20} color={activeTab === 'gifts' ? '#FFFFFF' : '#6366F1'} />
            <Text style={[styles.tabText, activeTab === 'gifts' && styles.activeTabText]}>מתנות</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'credits' ? renderCreditsTab() : renderGiftsTab()}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6B7280' },
  scrollContainer: { flexGrow: 1, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingTop: 20 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  backButtonText: { fontSize: 16, color: '#6366F1', marginLeft: 8 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 4, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8 },
  activeTab: { backgroundColor: '#6366F1' },
  tabText: { fontSize: 16, fontWeight: '600', color: '#6366F1', marginLeft: 8 },
  activeTabText: { color: '#FFFFFF' },
  creditsContainer: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  creditsHeader: { alignItems: 'center', marginBottom: 20 },
  creditsTitle: { fontSize: 16, color: '#6B7280', marginBottom: 8 },
  creditsAmount: { fontSize: 36, fontWeight: 'bold', color: '#3B82F6' },
  creditsProgress: { alignItems: 'center' },
  progressBar: { width: '100%', height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: '#3B82F6', borderRadius: 4 },
  progressText: { fontSize: 14, color: '#6B7280' },
  referralCodeContainer: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  referralCodeTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 16, textAlign: 'center' },
  codeDisplay: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 16, marginBottom: 16 },
  codeText: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginRight: 12, letterSpacing: 2 },
  copyButton: { padding: 8 },
  shareButton: { backgroundColor: '#3B82F6', borderRadius: 12, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  shareButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginLeft: 8 },
  statsContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  statLabel: { fontSize: 14, color: '#6B7280' },
  statDivider: { width: 1, backgroundColor: '#E5E7EB' },
  historyContainer: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  historyTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 16 },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  historyContent: { flex: 1 },
  historyName: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  historyDate: { fontSize: 14, color: '#6B7280' },
  historyRight: { alignItems: 'flex-end' },
  historyCredits: { fontSize: 16, fontWeight: 'bold', color: '#10B981', marginBottom: 4 },
  statusBadge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  statusText: { fontSize: 12, color: '#FFFFFF', fontWeight: '600' },
  howItWorksContainer: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  howItWorksTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 16 },
  stepItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  stepNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  stepNumberText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  stepText: { fontSize: 16, color: '#374151', flex: 1 },
  redeemContainer: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  redeemTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 16, textAlign: 'center' },
  redeemInputContainer: { flexDirection: 'row', alignItems: 'center' },
  redeemInput: { flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, backgroundColor: '#F9FAFB', marginRight: 12 },
  redeemButton: { backgroundColor: '#3B82F6', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  redeemButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  giftCardsContainer: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  giftCardsTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 16 },
  giftCardItem: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 16, marginBottom: 16 },
  giftCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  giftCardInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  giftCardCode: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginRight: 12, letterSpacing: 1 },
  moreButton: { padding: 4 },
  giftCardDetails: { marginBottom: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  detailLabel: { fontSize: 14, color: '#6B7280' },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  useGiftCardButton: { backgroundColor: '#10B981', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, alignItems: 'center' },
  useGiftCardButtonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#374151', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
});

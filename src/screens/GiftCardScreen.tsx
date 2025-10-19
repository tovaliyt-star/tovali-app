import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useUserData } from '../context/UserDataContext';

export default function GiftCardScreen() {
  const navigation = useNavigation<any>();
  const { userData, addGiftCard } = useUserData();
  
  const [newGiftCardCode, setNewGiftCardCode] = useState('');
  const [giftCards, setGiftCards] = useState(userData?.giftCards || [
    {
      id: '1',
      code: 'GIFT123456',
      amount: 100,
      balance: 75,
      expiryDate: '31/12/2025',
      isActive: true,
    },
    {
      id: '2',
      code: 'GIFT789012',
      amount: 50,
      balance: 0,
      expiryDate: '15/06/2025',
      isActive: false,
    },
  ]);

  const handleRedeemGiftCard = () => {
    if (!newGiftCardCode.trim()) {
      Alert.alert('שגיאה', 'אנא הכנס קוד כרטיס מתנה');
      return;
    }

    // הוסף כרטיס מתנה חדש
    const newGiftCard = {
      id: Date.now().toString(),
      code: newGiftCardCode,
      amount: 100,
      balance: 100,
      expiryDate: '31/12/2025',
      isActive: true,
    };

    addGiftCard(newGiftCard);
    setNewGiftCardCode('');
    
    Alert.alert(
      'הצלחה!',
      'כרטיס המתנה נפדה בהצלחה!',
      [{ text: 'אישור' }]
    );
  };

  const handleUseGiftCard = (card: any) => {
    Alert.alert(
      'שימוש בכרטיס מתנה',
      `הפונקציה תהיה זמינה בקרוב. בינתיים, פנה לתמיכה לשימוש בכרטיס המתנה ${card.code}.`,
      [{ text: 'אישור' }]
    );
  };

  const handleGiftCardActions = (card: any) => {
    Alert.alert(
      'פעולות כרטיס מתנה',
      'בחר פעולה',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'ערוך',
          onPress: () => {
            Alert.alert(
              'עריכת כרטיס מתנה',
              'הפונקציה תהיה זמינה בקרוב. בינתיים, פנה לתמיכה לעריכת כרטיס מתנה.',
              [{ text: 'אישור' }]
            );
          },
        },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'מחיקת כרטיס מתנה',
              'האם אתה בטוח שברצונך למחוק כרטיס מתנה זה?',
              [
                { text: 'ביטול', style: 'cancel' },
                {
                  text: 'מחק',
                  style: 'destructive',
                  onPress: () => {
                    setGiftCards(prev => prev.filter(gc => gc.id !== card.id));
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const getGiftCardStatus = (card: any) => {
    if (!card.isActive) return 'פג תוקף';
    if (card.balance === 0) return 'מרוקן';
    return 'פעיל';
  };

  const getGiftCardStatusColor = (card: any) => {
    if (!card.isActive) return '#EF4444';
    if (card.balance === 0) return '#6B7280';
    return '#10B981';
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
          <Text style={styles.title}>כרטיס מתנה</Text>
        </View>

        {/* Redeem New Gift Card */}
        <View style={styles.redeemContainer}>
          <Text style={styles.redeemTitle}>פדה כרטיס מתנה חדש</Text>
          <View style={styles.redeemInputContainer}>
            <TextInput
              style={styles.redeemInput}
              placeholder="הכנס קוד כרטיס מתנה"
              value={newGiftCardCode}
              onChangeText={setNewGiftCardCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.redeemButton} onPress={handleRedeemGiftCard}>
              <Text style={styles.redeemButtonText}>פדה</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Gift Cards List */}
        <View style={styles.giftCardsContainer}>
          <Text style={styles.giftCardsTitle}>כרטיסי המתנה שלך</Text>
          {giftCards.map((card) => (
            <View key={card.id} style={styles.giftCardItem}>
              <View style={styles.giftCardHeader}>
                <View style={styles.giftCardInfo}>
                  <Text style={styles.giftCardCode}>{card.code}</Text>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: getGiftCardStatusColor(card) }
                  ]}>
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
                  <Text style={styles.detailValue}>{card.amount}₪</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>יתרה זמינה:</Text>
                  <Text style={styles.detailValue}>{card.balance}₪</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>תוקף עד:</Text>
                  <Text style={styles.detailValue}>{card.expiryDate}</Text>
                </View>
              </View>

              {card.balance > 0 && (
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
            <Text style={styles.emptySubtitle}>
              פדה כרטיס מתנה ראשון כדי להתחיל
            </Text>
          </View>
        )}

        {/* How It Works */}
        <View style={styles.howItWorksContainer}>
          <Text style={styles.howItWorksTitle}>איך זה עובד?</Text>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>1</View>
            <Text style={styles.stepText}>קבל כרטיס מתנה מחבר או מבן משפחה</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>2</View>
            <Text style={styles.stepText}>פדה את הכרטיס באמצעות הקוד</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>3</View>
            <Text style={styles.stepText}>השתמש בערך הכרטיס לשירותים</Text>
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
  redeemContainer: {
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
  redeemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  redeemInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  redeemInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    marginRight: 12,
  },
  redeemButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  redeemButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  giftCardsContainer: {
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
  giftCardsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  giftCardItem: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  giftCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  giftCardInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  giftCardCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 12,
    letterSpacing: 1,
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
  moreButton: {
    padding: 4,
  },
  giftCardDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  useGiftCardButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  useGiftCardButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
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

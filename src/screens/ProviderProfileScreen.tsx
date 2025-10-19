import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { Service, Review } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';

const mockServices: Service[] = [
  {
    id: '1',
    title: 'ניקיון דירה יסודי',
    description: 'שירות ניקיון מקצועי לדירות',
    category: 'ניקיון',
    subcategory: 'ניקיון בית',
    price: 150,
    priceType: 'fixed',
    providerId: '1',
    provider: {
      id: '1',
      name: 'שרה כהן',
      email: 'sarah@example.com',
      phone: '050-1234567',
      userType: 'provider',
      rating: 4.8,
      reviewCount: 45,
      createdAt: new Date(),
    },
    images: [],
    location: {
      city: 'תל אביב',
      address: 'רחוב הרצל 123',
    },
    availability: {
      days: ['ראשון', 'שני', 'שלישי'],
      hours: { start: '09:00', end: '17:00' },
    },
    rating: 4.8,
    reviewCount: 23,
    tags: ['מקצועי', 'מהיר'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockReviews: Review[] = [
  {
    id: '1',
    orderId: '1',
    reviewerId: 'customer1',
    reviewedId: 'provider1',
    rating: 5,
    comment: 'שירות מעולה! הגיעה בזמן ועבדה בצורה מקצועית מאוד.',
    createdAt: new Date('2024-01-10'),
  },
  {
    id: '2',
    orderId: '2',
    reviewerId: 'customer2',
    reviewedId: 'provider1',
    rating: 4,
    comment: 'טוב מאוד, ממליצה בחום.',
    createdAt: new Date('2024-01-08'),
  },
];

type Props = StackScreenProps<RootStackParamList, 'ProviderProfile'>;

export default function ProviderProfileScreen({ navigation, route }: Props) {
  const { provider } = route.params;
  const [activeTab, setActiveTab] = useState<'services' | 'reviews'>('services');

  const handleContactProvider = () => {
    Alert.alert(
      'צור קשר עם נותן השירות',
      `טלפון: ${provider.phone}\nאימייל: ${provider.email}\n\nהפונקציה תהיה זמינה בקרוב. בינתיים, השתמש בפרטי הקשר המוצגים.`,
      [{ text: 'אישור' }]
    );
  };

  const handleSendMessage = () => {
    Alert.alert(
      'שליחת הודעה',
      `הפונקציה תהיה זמינה בקרוב. בינתיים, צור קשר ישיר עם ${provider.name} בטלפון: ${provider.phone}`,
      [{ text: 'אישור' }]
    );
  };

  const renderService = ({ item }: { item: Service }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => navigation.navigate('ServiceDetail', { service: item })}
    >
      <Text style={styles.serviceTitle}>{item.title}</Text>
      <Text style={styles.serviceDescription}>{item.description}</Text>
      <View style={styles.serviceFooter}>
        <View style={styles.serviceRating}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        <Text style={styles.servicePrice}>₪{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderReview = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewRating}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= item.rating ? 'star' : 'star-outline'}
              size={16}
              color="#FFD700"
            />
          ))}
        </View>
        <Text style={styles.reviewDate}>
          {item.createdAt.toLocaleDateString('he-IL')}
        </Text>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Provider Header */}
      <View style={styles.providerHeader}>
        <View style={styles.providerAvatar}>
          <Ionicons name="person" size={40} color="#fff" />
        </View>
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{provider.name}</Text>
          <View style={styles.providerRating}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.ratingText}>{provider.rating}</Text>
            <Text style={styles.reviewCountText}>({provider.reviewCount} ביקורות)</Text>
          </View>
          <Text style={styles.joinDate}>
            חבר מאז {provider.createdAt.toLocaleDateString('he-IL')}
          </Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>2 שעות</Text>
          <Text style={styles.statLabel}>זמן תגובה</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>95%</Text>
          <Text style={styles.statLabel}>שיעור השלמה</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>24</Text>
          <Text style={styles.statLabel}>פרויקטים</Text>
        </View>
      </View>

      {/* About */}
      <View style={styles.aboutSection}>
        <Text style={styles.sectionTitle}>אודות</Text>
        <Text style={styles.aboutText}>
          מקצועית בתחום הניקיון עם ניסיון של מעל 5 שנים. מתמחה בניקיון יסודי של דירות ומשרדים.
          עובדת עם חומרי ניקיון איכותיים וידידותיים לסביבה.
        </Text>
      </View>

      {/* Location & Contact */}
      <View style={styles.contactSection}>
        <View style={styles.contactItem}>
          <Ionicons name="location" size={20} color="#007AFF" />
          <Text style={styles.contactText}>תל אביב והסביבה</Text>
        </View>
        <View style={styles.contactItem}>
          <Ionicons name="call" size={20} color="#007AFF" />
          <Text style={styles.contactText}>{provider.phone}</Text>
        </View>
        <View style={styles.contactItem}>
          <Ionicons name="mail" size={20} color="#007AFF" />
          <Text style={styles.contactText}>{provider.email}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'services' && styles.activeTab]}
          onPress={() => setActiveTab('services')}
        >
          <Text style={[styles.tabText, activeTab === 'services' && styles.activeTabText]}>
            שירותים
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
          onPress={() => setActiveTab('reviews')}
        >
          <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
            ביקורות
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'services' ? (
          <FlatList
            data={mockServices}
            renderItem={renderService}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            data={mockReviews}
            renderItem={renderReview}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Contact Button */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.contactButton} onPress={handleContactProvider}>
          <Ionicons name="call" size={20} color="#007AFF" />
          <Text style={styles.contactButtonText}>צור קשר</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.messageButton} onPress={handleSendMessage}>
          <Ionicons name="chatbubble" size={20} color="#fff" />
          <Text style={styles.messageButtonText}>שלח הודעה</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  providerHeader: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  providerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  providerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewCountText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  joinDate: {
    fontSize: 12,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 20,
    marginBottom: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  aboutSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  aboutText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  contactSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  contactText: {
    marginLeft: 15,
    fontSize: 14,
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  tabContent: {
    backgroundColor: '#fff',
    minHeight: 200,
  },
  serviceCard: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  reviewCard: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
  reviewComment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 15,
  },
  contactButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 15,
  },
  messageButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  bottomSpace: {
    height: 20,
  },
});

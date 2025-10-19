import React from 'react';
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

type Props = StackScreenProps<RootStackParamList, 'ServiceDetail'>;

export default function ServiceDetailScreen({ navigation, route }: Props) {
  const { service } = route.params;

  const handleContactProvider = () => {
    Alert.alert(
      'צור קשר עם נותן השירות',
      `טלפון: ${service.provider.phone}\nאימייל: ${service.provider.email}\n\nהפונקציה תהיה זמינה בקרוב. בינתיים, השתמש בפרטי הקשר המוצגים.`,
      [{ text: 'אישור' }]
    );
  };

  const handleBookService = () => {
    Alert.alert(
      'הזמנת שירות',
      `הפונקציה תהיה זמינה בקרוב. בינתיים, צור קשר ישיר עם נותן השירות ${service.provider.name}.`,
      [{ text: 'אישור' }]
    );
  };

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
      {/* Service Images */}
      <View style={styles.imageContainer}>
        <View style={styles.imagePlaceholder}>
          <Ionicons name="image-outline" size={60} color="#ccc" />
          <Text style={styles.imagePlaceholderText}>תמונות השירות</Text>
        </View>
      </View>

      {/* Service Info */}
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceTitle}>{service.title}</Text>
        <Text style={styles.serviceCategory}>{service.category} • {service.subcategory}</Text>
        
        <View style={styles.serviceRating}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.ratingText}>{service.rating}</Text>
            <Text style={styles.reviewCountText}>({service.reviewCount} ביקורות)</Text>
          </View>
          <Text style={styles.servicePrice}>
            ₪{service.price}{service.priceType === 'hourly' ? '/שעה' : ''}
          </Text>
        </View>

        <Text style={styles.serviceDescription}>{service.description}</Text>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {service.tags.map((tag: string, index: number) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Provider Info */}
      <TouchableOpacity
        style={styles.providerCard}
        onPress={() => navigation.navigate('ProviderProfile', { provider: service.provider })}
      >
        <View style={styles.providerInfo}>
          <View style={styles.providerAvatar}>
            <Ionicons name="person" size={24} color="#fff" />
          </View>
          <View style={styles.providerDetails}>
            <Text style={styles.providerName}>{service.provider.name}</Text>
            <View style={styles.providerRating}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.providerRatingText}>{service.provider.rating}</Text>
              <Text style={styles.providerReviewCount}>({service.provider.reviewCount} ביקורות)</Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>

      {/* Location */}
      <View style={styles.locationCard}>
        <View style={styles.locationHeader}>
          <Ionicons name="location" size={20} color="#007AFF" />
          <Text style={styles.locationTitle}>מיקום</Text>
        </View>
        <Text style={styles.locationText}>{service.location.city}</Text>
        <Text style={styles.locationAddress}>{service.location.address}</Text>
      </View>

      {/* Availability */}
      <View style={styles.availabilityCard}>
        <View style={styles.availabilityHeader}>
          <Ionicons name="time" size={20} color="#007AFF" />
          <Text style={styles.availabilityTitle}>זמינות</Text>
        </View>
        <Text style={styles.availabilityText}>
          {service.availability.days.join(', ')}
        </Text>
        <Text style={styles.availabilityHours}>
          {service.availability.hours.start} - {service.availability.hours.end}
        </Text>
      </View>

      {/* Reviews */}
      <View style={styles.reviewsSection}>
        <Text style={styles.reviewsTitle}>ביקורות ({mockReviews.length})</Text>
        <FlatList
          data={mockReviews}
          renderItem={renderReview}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.contactButton} onPress={handleContactProvider}>
          <Ionicons name="call" size={20} color="#007AFF" />
          <Text style={styles.contactButtonText}>צור קשר</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookService}>
          <Text style={styles.bookButtonText}>הזמן שירות</Text>
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
  imageContainer: {
    height: 200,
    backgroundColor: '#e0e0e0',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
  },
  serviceInfo: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  serviceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  serviceCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  serviceRating: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  servicePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  serviceDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 15,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  providerCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  providerDetails: {},
  providerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  providerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerRatingText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#333',
  },
  providerReviewCount: {
    marginLeft: 5,
    fontSize: 12,
    color: '#666',
  },
  locationCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationTitle: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
  },
  availabilityCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
  },
  availabilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  availabilityTitle: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  availabilityText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  availabilityHours: {
    fontSize: 14,
    color: '#666',
  },
  reviewsSection: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
  },
  reviewsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  reviewCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 15,
    marginBottom: 15,
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
  bookButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  bottomSpace: {
    height: 20,
  },
});

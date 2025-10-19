import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserData } from '../context/UserDataContext';
import { useUserMode } from '../context/UserModeContext';
import { Review } from '../entities/Review';

export default function ReviewsScreen() {
  const navigation = useNavigation<any>();
  const { userData } = useUserData();
  const { userMode } = useUserMode();
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [userData]);

  const loadReviews = async () => {
    if (!userData?.id) return;
    
    try {
      const userReviews = await Review.getByReviewedUserId(userData.id);
      const avgRating = await Review.getAverageRating(userData.id);
      const count = await Review.getReviewCount(userData.id);
      
      setReviews(userReviews);
      setAverageRating(avgRating);
      setReviewCount(count);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReviews();
    setRefreshing(false);
  };

  const renderStars = (rating: number) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Ionicons
        key={star}
        name={star <= rating ? 'star' : 'star-outline'}
        size={16}
        color={star <= rating ? '#FFD700' : '#ccc'}
      />
    ));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <LinearGradient
      colors={['#fdf2f8', '#fed7d3', '#fce7f3']}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#6366F1" />
            <Text style={styles.backButtonText}>חזור</Text>
          </TouchableOpacity>
          <Text style={styles.title}>ביקורות ודירוגים</Text>
        </View>

        {/* Overall Rating Section */}
        <View style={styles.overallRating}>
          <View style={styles.ratingStars}>
            {renderStars(Math.round(averageRating))}
          </View>
          <Text style={styles.ratingText}>
            {averageRating > 0 ? `${averageRating} מתוך 5` : 'אין דירוג עדיין'}
          </Text>
          <Text style={styles.reviewCount}>{reviewCount} ביקורות</Text>
        </View>

        {/* Reviews List */}
        <View style={styles.reviewsContainer}>
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerInfo}>
                    <View style={styles.avatarContainer}>
                      {review.reviewerAvatar ? (
                        <Image source={{ uri: review.reviewerAvatar }} style={styles.avatar} />
                      ) : (
                        <View style={styles.defaultAvatar}>
                          <Ionicons name="person" size={24} color="#6B7280" />
                        </View>
                      )}
                    </View>
                    <View style={styles.reviewerDetails}>
                      <Text style={styles.reviewerName}>{review.reviewerName}</Text>
                      <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
                    </View>
                  </View>
                  <View style={styles.ratingContainer}>
                    {renderStars(review.rating)}
                  </View>
                </View>
                
                <Text style={styles.serviceTitle}>{review.serviceTitle}</Text>
                <Text style={styles.serviceCategory}>{review.serviceCategory}</Text>
                <Text style={styles.reviewText}>{review.reviewText}</Text>
                
                <View style={styles.reviewTypeBadge}>
                  <Ionicons 
                    name={review.reviewType === 'client_to_provider' ? 'person' : 'briefcase'} 
                    size={14} 
                    color="#6366F1" 
                  />
                  <Text style={styles.reviewTypeText}>
                    {review.reviewType === 'client_to_provider' ? 'ביקורת מלקוח' : 'ביקורת מנותן שירות'}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="star-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>אין ביקורות עדיין</Text>
              <Text style={styles.emptySubtitle}>
                {userMode === 'customer' 
                  ? 'ביקורות יופיעו כאן לאחר שתקבל שירותים מנותני שירות'
                  : 'ביקורות יופיעו כאן לאחר שתספק שירותים ללקוחות'
                }
              </Text>
            </View>
          )}
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
  overallRating: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  ratingStars: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  reviewCount: {
    fontSize: 16,
    color: '#6B7280',
  },
  reviewsContainer: {
    paddingHorizontal: 20,
  },
  reviewItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  defaultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
    marginBottom: 4,
  },
  serviceCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 12,
  },
  reviewTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  reviewTypeText: {
    fontSize: 12,
    color: '#6366F1',
    marginLeft: 4,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
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
  },
});

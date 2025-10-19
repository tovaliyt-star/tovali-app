import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUserData } from '../context/UserDataContext';
import { useUserMode } from '../context/UserModeContext';
import { Review } from '../entities/Review';
import { Task } from '../entities/Task';

interface RouteParams {
  taskId: string;
  reviewedUserId: string;
  reviewedUserName: string;
  reviewedUserAvatar?: string;
  serviceTitle: string;
  serviceCategory: string;
}

export default function CreateReviewScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { userData } = useUserData();
  const { userMode } = useUserMode();
  
  const { taskId, reviewedUserId, reviewedUserName, reviewedUserAvatar, serviceTitle, serviceCategory } = route.params as RouteParams;
  
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user can review
    checkCanReview();
  }, []);

  const checkCanReview = async () => {
    if (!userData?.id) return;
    
    try {
      const canReview = await Review.canUserReview(userData.id, reviewedUserId, taskId);
      if (!canReview) {
        Alert.alert('שגיאה', 'לא ניתן לכתוב ביקורת עבור משימה זו');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error checking review eligibility:', error);
    }
  };

  const handleStarPress = (starRating: number) => {
    setRating(starRating);
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity
        key={star}
        onPress={() => handleStarPress(star)}
        style={styles.starButton}
      >
        <Ionicons
          name={star <= rating ? 'star' : 'star-outline'}
          size={32}
          color={star <= rating ? '#FFD700' : '#ccc'}
        />
      </TouchableOpacity>
    ));
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('שגיאה', 'אנא בחר דירוג');
      return;
    }

    if (reviewText.trim().length < 10) {
      Alert.alert('שגיאה', 'אנא כתב לפחות 10 תווים בביקורת');
      return;
    }

    setLoading(true);

    try {
      const reviewData = {
        taskId,
        reviewerId: userData?.id || '',
        reviewerName: userData?.name || 'משתמש',
        reviewerAvatar: userData?.avatar || userData?.profileImage,
        reviewedUserId,
        reviewedUserName,
        reviewedUserAvatar,
        rating,
        reviewText: reviewText.trim(),
        reviewType: userMode === 'customer' ? 'client_to_provider' : 'provider_to_client',
        serviceTitle,
        serviceCategory,
      };

      await Review.create(reviewData);
      
      Alert.alert(
        'הצלחה!',
        'הביקורת נשמרה בהצלחה',
        [
          {
            text: 'אישור',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating review:', error);
      Alert.alert('שגיאה', 'אירעה שגיאה בשמירת הביקורת');
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.title}>כתיבת ביקורת</Text>
        </View>

        {/* Service Info */}
        <View style={styles.serviceInfoCard}>
          <View style={styles.serviceHeader}>
            <View style={styles.avatarContainer}>
              {reviewedUserAvatar ? (
                <Image source={{ uri: reviewedUserAvatar }} style={styles.avatar} />
              ) : (
                <View style={styles.defaultAvatar}>
                  <Ionicons name="person" size={24} color="#6B7280" />
                </View>
              )}
            </View>
            <View style={styles.serviceDetails}>
              <Text style={styles.reviewedUserName}>{reviewedUserName}</Text>
              <Text style={styles.serviceTitle}>{serviceTitle}</Text>
              <Text style={styles.serviceCategory}>{serviceCategory}</Text>
            </View>
          </View>
        </View>

        {/* Rating Section */}
        <View style={styles.ratingCard}>
          <Text style={styles.sectionTitle}>דירוג השירות</Text>
          <Text style={styles.sectionSubtitle}>איך תדרג את השירות שקיבלת?</Text>
          
          <View style={styles.starsContainer}>
            {renderStars()}
          </View>
          
          {rating > 0 && (
            <Text style={styles.ratingText}>
              {rating === 1 && 'גרוע'}
              {rating === 2 && 'לא טוב'}
              {rating === 3 && 'בסדר'}
              {rating === 4 && 'טוב'}
              {rating === 5 && 'מעולה!'}
            </Text>
          )}
        </View>

        {/* Review Text Section */}
        <View style={styles.reviewTextCard}>
          <Text style={styles.sectionTitle}>ביקורת מפורטת</Text>
          <Text style={styles.sectionSubtitle}>
            שתף את החוויה שלך עם אחרים
          </Text>
          
          <TextInput
            style={styles.reviewInput}
            placeholder="כתב כאן את הביקורת שלך..."
            value={reviewText}
            onChangeText={setReviewText}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={500}
          />
          
          <Text style={styles.characterCount}>
            {reviewText.length}/500 תווים
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (rating === 0 || reviewText.trim().length < 10) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmitReview}
          disabled={loading || rating === 0 || reviewText.trim().length < 10}
        >
          {loading ? (
            <Text style={styles.submitButtonText}>שומר...</Text>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>שלח ביקורת</Text>
            </>
          )}
        </TouchableOpacity>
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
  serviceInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  defaultAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceDetails: {
    flex: 1,
  },
  reviewedUserName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
    marginBottom: 2,
  },
  serviceCategory: {
    fontSize: 14,
    color: '#6B7280',
  },
  ratingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  starButton: {
    marginHorizontal: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
  reviewTextCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reviewInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#374151',
    textAlign: 'right',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 12,
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowColor: '#9CA3AF',
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});






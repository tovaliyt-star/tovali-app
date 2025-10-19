import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useUserData } from '../context/UserDataContext';

export default function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const { userData, removeFromFavorites } = useUserData();

  // Mock data for favorites - in a real app this would come from the server
  const mockFavoritesData = [
    {
      id: '1',
      title: 'הובלת רהיטים',
      provider: 'יוסי הובלות',
      rating: 4.8,
      price: '150₪',
      category: 'הובלות קטנות',
    },
    {
      id: '2',
      title: 'ניקוי דירה',
      provider: 'שירותי ניקוי מקצועי',
      rating: 4.9,
      price: '200₪',
      category: 'עזרה בבית',
    },
  ];

  // Filter favorites based on user's favorites list
  const favorites = mockFavoritesData.filter(item => 
    userData?.favorites?.includes(item.id) || false
  );

  const handleRemoveFavorite = async (itemId: string) => {
    Alert.alert(
      'הסרת מועדף',
      'האם אתה בטוח שברצונך להסיר את השירות הזה מהמועדפים?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'הסר',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFromFavorites(itemId);
            } catch (error) {
              console.error('Error removing favorite:', error);
              Alert.alert('שגיאה', 'אירעה שגיאה בהסרת המועדף');
            }
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
          <Text style={styles.title}>מועדפים</Text>
        </View>

        {/* Favorites List */}
        <View style={styles.favoritesContainer}>
          {favorites.length > 0 ? (
            favorites.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.favoriteItem}
                onPress={() => navigation.navigate('ServiceDetail' as any, { service: item })}
              >
                <View style={styles.favoriteContent}>
                  <View style={styles.favoriteHeader}>
                    <Text style={styles.favoriteTitle}>{item.title}</Text>
                    <TouchableOpacity 
                      style={styles.heartButton}
                      onPress={() => handleRemoveFavorite(item.id)}
                    >
                      <Ionicons name="heart" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.favoriteProvider}>{item.provider}</Text>
                  <Text style={styles.favoriteCategory}>{item.category}</Text>
                  <View style={styles.favoriteFooter}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                    <Text style={styles.priceText}>{item.price}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="heart-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>אין לך מועדפים עדיין</Text>
              <Text style={styles.emptySubtitle}>
                התחל לחפש שירותים ולשמור אותם כמועדפים
              </Text>
              <TouchableOpacity
                style={styles.searchButton}
                onPress={() => navigation.navigate('Home' as any)}
              >
                <Text style={styles.searchButtonText}>חפש שירותים</Text>
              </TouchableOpacity>
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
  favoritesContainer: {
    paddingHorizontal: 20,
  },
  favoriteItem: {
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
  favoriteContent: {
    flex: 1,
  },
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  favoriteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  heartButton: {
    padding: 4,
  },
  favoriteProvider: {
    fontSize: 16,
    color: '#6366F1',
    marginBottom: 4,
  },
  favoriteCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  favoriteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 4,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
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
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  searchButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

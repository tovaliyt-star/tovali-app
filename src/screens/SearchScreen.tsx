import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Service, SearchFilters } from '../types';
import { TabParamList } from '../navigation/AppNavigator';

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
  {
    id: '2',
    title: 'תיקון אינסטלציה',
    description: 'תיקון ברזים וצנרת',
    category: 'תחזוקה',
    subcategory: 'אינסטלציה',
    price: 200,
    priceType: 'hourly',
    providerId: '2',
    provider: {
      id: '2',
      name: 'דוד לוי',
      email: 'david@example.com',
      phone: '050-7654321',
      userType: 'provider',
      rating: 4.5,
      reviewCount: 32,
      createdAt: new Date(),
    },
    images: [],
    location: {
      city: 'חיפה',
      address: 'רחוב הנביאים 456',
    },
    availability: {
      days: ['שני', 'רביעי', 'חמישי'],
      hours: { start: '08:00', end: '16:00' },
    },
    rating: 4.5,
    reviewCount: 18,
    tags: ['מהיר', 'זמין'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

type Props = BottomTabScreenProps<TabParamList, 'Home'>;

export default function SearchScreen({ navigation, route }: Props) {
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [filteredServices, setFilteredServices] = useState(mockServices);

  const renderService = ({ item }: { item: Service }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => (navigation as any).navigate('ServiceDetail', { service: item })}
    >
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceTitle}>{item.title}</Text>
        <Text style={styles.serviceDescription}>{item.description}</Text>
        <Text style={styles.serviceProvider}>על ידי: {item.provider.name}</Text>
        <View style={styles.serviceDetails}>
          <View style={styles.serviceRating}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <Text style={styles.servicePrice}>
            ₪{item.price}{item.priceType === 'hourly' ? '/שעה' : ''}
          </Text>
        </View>
        <Text style={styles.serviceLocation}>{item.location.city}</Text>
      </View>
    </TouchableOpacity>
  );

  const applyFilters = () => {
    let filtered = mockServices;
    
    if (searchText) {
      filtered = filtered.filter(service => 
        service.title.includes(searchText) || 
        service.description.includes(searchText) ||
        service.category.includes(searchText)
      );
    }
    
    if (filters.category) {
      filtered = filtered.filter(service => service.category === filters.category);
    }
    
    setFilteredServices(filtered);
    setShowFilters(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="חפש שירותים..."
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={applyFilters}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="filter" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredServices}
        renderItem={renderService}
        keyExtractor={(item) => item.id}
        style={styles.servicesList}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>סינון תוצאות</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>קטגוריה:</Text>
              <View style={styles.filterOptions}>
                {['ניקיון', 'תחזוקה', 'גינון', 'שיפוצים'].map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.filterOption,
                      filters.category === category && styles.selectedFilter,
                    ]}
                    onPress={() => setFilters({ ...filters, category })}
                  >
                    <Text style={styles.filterOptionText}>{category}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>החל סינון</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchHeader: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  filterButton: {
    padding: 10,
  },
  servicesList: {
    flex: 1,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceInfo: {
    flex: 1,
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
    marginBottom: 5,
  },
  serviceProvider: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  serviceRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  serviceLocation: {
    fontSize: 12,
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    margin: 5,
  },
  selectedFilter: {
    backgroundColor: '#007AFF',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#333',
  },
  applyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

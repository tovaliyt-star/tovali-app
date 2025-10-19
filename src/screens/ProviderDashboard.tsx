import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = StackScreenProps<RootStackParamList, 'ProviderDashboard'>;

export default function ProviderDashboard({ navigation }: Props) {
  return (
    <LinearGradient
      colors={['#d1fae5', '#a7f3d0', '#6ee7b7']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="briefcase" size={64} color="#047857" />
          <Text style={styles.title}>לוח נותני שירות</Text>
          <Text style={styles.subtitle}>ברוכים הבאים למצב נותן שירות</Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person" size={24} color="#ffffff" />
            <Text style={styles.buttonText}>הפרופיל שלי</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Orders')}
          >
            <Ionicons name="receipt" size={24} color="#ffffff" />
            <Text style={styles.buttonText}>ההזמנות שלי</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('ProviderTasks')}
          >
            <Ionicons name="search" size={24} color="#ffffff" />
            <Text style={styles.buttonText}>חפש עבודות</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Main')}
        >
          <Ionicons name="arrow-back" size={20} color="#065f46" />
          <Text style={styles.backButtonText}>חזור למסך הראשי</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#047857',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#065f46',
    marginTop: 8,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    color: '#065f46',
    fontSize: 14,
    fontWeight: '500',
  },
});

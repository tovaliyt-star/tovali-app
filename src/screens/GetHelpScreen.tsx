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

export default function GetHelpScreen() {
  const navigation = useNavigation<any>();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [message, setMessage] = useState('');

  const helpCategories = [
    {
      id: 'account',
      title: 'חשבון ופרופיל',
      icon: 'person-outline',
      description: 'בעיות בהרשמה, התחברות או עדכון פרטים',
    },
    {
      id: 'payment',
      title: 'תשלומים וחשבוניות',
      icon: 'card-outline',
      description: 'בעיות בתשלום, החזרים או חשבוניות',
    },
    {
      id: 'service',
      title: 'שירותים והזמנות',
      icon: 'briefcase-outline',
      description: 'בעיות בהזמנת שירותים או ביצוע עבודות',
    },
    {
      id: 'technical',
      title: 'תמיכה טכנית',
      icon: 'settings-outline',
      description: 'בעיות באפליקציה או באתר',
    },
    {
      id: 'other',
      title: 'אחר',
      icon: 'help-circle-outline',
      description: 'נושאים אחרים שלא מופיעים ברשימה',
    },
  ];

  const faqItems = [
    {
      question: 'איך אני יכול לבטל הזמנה?',
      answer: 'ניתן לבטל הזמנה עד 24 שעות לפני מועד הביצוע. עבור לבית ההזמנות ולחץ על "בטל הזמנה".',
    },
    {
      question: 'מה קורה אם אני לא מרוצה מהשירות?',
      answer: 'אם אינך מרוצה מהשירות, צור קשר עם התמיכה תוך 48 שעות ונוכל לעזור לך.',
    },
    {
      question: 'איך אני יכול לדווח על בעיה עם נותן שירות?',
      answer: 'בתוך 24 שעות מסיום השירות, עבור לפרופיל נותן השירות ולחץ על "דווח על בעיה".',
    },
  ];

  const handleSubmitHelp = () => {
    if (!selectedCategory || !message.trim()) {
      Alert.alert('שגיאה', 'אנא בחר קטגוריה וכתוב הודעה');
      return;
    }

    Alert.alert(
      'הצלחה!',
      'בקשת העזרה שלך נשלחה בהצלחה. נציג התמיכה יצור איתך קשר תוך 24 שעות.',
      [
        {
          text: 'אישור',
          onPress: () => {
            setSelectedCategory('');
            setMessage('');
          },
        },
      ]
    );
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = helpCategories.find(cat => cat.id === categoryId);
    return category?.icon || 'help-circle-outline';
  };

  const getCategoryTitle = (categoryId: string) => {
    const category = helpCategories.find(cat => cat.id === categoryId);
    return category?.title || 'לא נבחר';
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
          <Text style={styles.title}>קבל עזרה</Text>
        </View>

        {/* Help Categories */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>בחר קטגוריה</Text>
          {helpCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                selectedCategory === category.id && styles.selectedCategory,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <View style={styles.categoryContent}>
                <View style={styles.categoryIcon}>
                  <Ionicons name={category.icon as any} size={24} color="#3B82F6" />
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                  <Text style={styles.categoryDescription}>{category.description}</Text>
                </View>
              </View>
              {selectedCategory === category.id && (
                <View style={styles.checkIcon}>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Message Input */}
        <View style={styles.messageContainer}>
          <Text style={styles.sectionTitle}>תיאור הבעיה</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="תאר את הבעיה שלך בפירוט..."
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmitHelp}>
          <Text style={styles.submitButtonText}>שלח בקשת עזרה</Text>
        </TouchableOpacity>

        {/* FAQ Section */}
        <View style={styles.faqContainer}>
          <Text style={styles.sectionTitle}>שאלות נפוצות</Text>
          {faqItems.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>{item.question}</Text>
              <Text style={styles.faqAnswer}>{item.answer}</Text>
            </View>
          ))}
        </View>

        {/* Contact Info */}
        <View style={styles.contactContainer}>
          <Text style={styles.sectionTitle}>צור קשר ישיר</Text>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={20} color="#3B82F6" />
            <Text style={styles.contactText}>support@tovali.co.il</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="call-outline" size={20} color="#3B82F6" />
            <Text style={styles.contactText}>03-1234567</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="time-outline" size={20} color="#3B82F6" />
            <Text style={styles.contactText}>א'-ה' 9:00-18:00</Text>
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
  categoriesContainer: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedCategory: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginHorizontal: -16,
  },
  categoryContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  checkIcon: {
    marginLeft: 16,
  },
  messageContainer: {
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
  messageInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  faqContainer: {
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
  faqItem: {
    marginBottom: 20,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  contactContainer: {
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
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation<any>();

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
          <Text style={styles.title}>מדיניות פרטיות</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.lastUpdated}>עדכון אחרון: 1 בינואר 2024</Text>
          
          <Text style={styles.sectionTitle}>1. מבוא</Text>
          <Text style={styles.sectionText}>
            טובלי מחויבת להגן על פרטיותכם. מדיניות פרטיות זו מסבירה איך אנו אוספים, משתמשים ומגנים על המידע האישי שלכם 
            בעת השימוש באפליקציה שלנו.
          </Text>

          <Text style={styles.sectionTitle}>2. מידע שאנו אוספים</Text>
          <Text style={styles.sectionText}>
            אנו אוספים מידע שאתם מספקים לנו ישירות, כגון:
            {'\n'}• פרטי זהות (שם, כתובת אימייל, מספר טלפון)
            {'\n'}• מידע פרופיל (תמונה, תיאור אישי)
            {'\n'}• מידע על שירותים שביקשתם או סיפקתם
            {'\n'}• תקשורת ביניכם לבין משתמשים אחרים
          </Text>

          <Text style={styles.sectionTitle}>3. איך אנו משתמשים במידע</Text>
          <Text style={styles.sectionText}>
            אנו משתמשים במידע שלכם כדי:
            {'\n'}• לספק את השירותים שלנו
            {'\n'}• לקשר בין מחפשי שירותים לנותני שירותים
            {'\n'}• לשפר את האפליקציה והשירותים
            {'\n'}• לספק תמיכה טכנית
            {'\n'}• לשלוח עדכונים חשובים
          </Text>

          <Text style={styles.sectionTitle}>4. שיתוף מידע</Text>
          <Text style={styles.sectionText}>
            אנו לא מוכרים את המידע האישי שלכם לצדדים שלישיים. אנו עשויים לשתף מידע מוגבל עם:
            {'\n'}• נותני שירותים שאתם בוחרים לעבוד איתם
            {'\n'}• ספקי שירותים טכניים המסייעים לנו להפעיל את האפליקציה
            {'\n'}• רשויות החוק במקרים של חקירה משפטית
          </Text>

          <Text style={styles.sectionTitle}>5. אבטחת מידע</Text>
          <Text style={styles.sectionText}>
            אנו משתמשים באמצעי אבטחה מתקדמים כדי להגן על המידע שלכם, כולל:
            {'\n'}• הצפנת מידע רגיש
            {'\n'}• גישה מוגבלת למידע אישי
            {'\n'}• ניטור קבוע של המערכות
            {'\n'}• גיבויים סדירים
          </Text>

          <Text style={styles.sectionTitle}>6. זכויותיכם</Text>
          <Text style={styles.sectionText}>
            יש לכם זכות:
            {'\n'}• לגשת למידע האישי שלכם
            {'\n'}• לתקן מידע שגוי או לא מעודכן
            {'\n'}• למחוק את החשבון שלכם
            {'\n'}• לבטל הסכמה לשימוש במידע
            {'\n'}• לקבל עותק של המידע שלכם
          </Text>

          <Text style={styles.sectionTitle}>7. עוגיות וטכנולוגיות מעקב</Text>
          <Text style={styles.sectionText}>
            אנו משתמשים בעוגיות ובטכנולוגיות דומות כדי לשפר את חוויית המשתמש, לנתח את השימוש באפליקציה 
            ולספק תוכן מותאם אישית.
          </Text>

          <Text style={styles.sectionTitle}>8. שמירת מידע</Text>
          <Text style={styles.sectionText}>
            אנו שומרים את המידע שלכם כל עוד החשבון שלכם פעיל ולאחר מכן למשך תקופה מוגבלת הנדרשת למטרות חוקיות, 
            עסקיות או טכניות.
          </Text>

          <Text style={styles.sectionTitle}>9. ילדים מתחת לגיל 18</Text>
          <Text style={styles.sectionText}>
            האפליקציה שלנו מיועדת למבוגרים בלבד. אנו לא אוספים במודע מידע מילדים מתחת לגיל 18. 
            אם אתם הורים ואתם חושבים שהילד שלכם סיפק לנו מידע אישי, אנא צרו איתנו קשר.
          </Text>

          <Text style={styles.sectionTitle}>10. שינויים במדיניות</Text>
          <Text style={styles.sectionText}>
            אנו עשויים לעדכן את מדיניות הפרטיות מעת לעת. שינויים משמעותיים יובאו לידיעתכם באמצעות האפליקציה 
            או באימייל.
          </Text>

          <Text style={styles.contactTitle}>צור קשר</Text>
          <Text style={styles.contactText}>
            לשאלות או בקשות בנוגע לפרטיות, אנא צרו איתנו קשר:
            {'\n'}אימייל: privacy@tovali.co.il
            {'\n'}טלפון: 03-1234567
            {'\n'}כתובת: רחוב הרצל 123, תל אביב, ישראל
          </Text>
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
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'right',
  },
  sectionText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    textAlign: 'right',
    marginBottom: 10,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 30,
    marginBottom: 10,
    textAlign: 'right',
  },
  contactText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    textAlign: 'right',
  },
});






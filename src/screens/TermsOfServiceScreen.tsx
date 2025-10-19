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

export default function TermsOfServiceScreen() {
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
          <Text style={styles.title}>תנאי השימוש</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.lastUpdated}>עדכון אחרון: 1 בינואר 2024</Text>
          
          <Text style={styles.sectionTitle}>1. קבלת התנאים</Text>
          <Text style={styles.sectionText}>
            ברוכים הבאים לאפליקציית טובלי. על ידי שימוש באפליקציה זו, אתם מסכימים לתנאי השימוש המפורטים להלן. 
            אם אינכם מסכימים לתנאים אלה, אנא אל תשתמשו באפליקציה.
          </Text>

          <Text style={styles.sectionTitle}>2. תיאור השירות</Text>
          <Text style={styles.sectionText}>
            טובלי היא פלטפורמה המקשרת בין מחפשי שירותים לנותני שירותים. האפליקציה מאפשרת למשתמשים לפרסם בקשות לשירותים, 
            למצוא נותני שירות מתאימים ולנהל את התקשורת ביניהם.
          </Text>

          <Text style={styles.sectionTitle}>3. חשבון משתמש</Text>
          <Text style={styles.sectionText}>
            על מנת להשתמש בשירותים, עליכם ליצור חשבון משתמש. אתם אחראים לשמירה על סודיות פרטי החשבון שלכם 
            ולכל הפעילות המתרחשת בחשבון שלכם. עליכם להודיע לנו מיד על כל שימוש לא מורשה בחשבון שלכם.
          </Text>

          <Text style={styles.sectionTitle}>4. התנהגות משתמשים</Text>
          <Text style={styles.sectionText}>
            אתם מתחייבים להשתמש באפליקציה באופן חוקי ואתי בלבד. אסור להשתמש באפליקציה למטרות בלתי חוקיות, 
            להפר זכויות של אחרים, או להפריע לתפקוד התקין של האפליקציה.
          </Text>

          <Text style={styles.sectionTitle}>5. תוכן משתמשים</Text>
          <Text style={styles.sectionText}>
            כל התוכן שאתם מפרסמים באפליקציה הוא באחריותכם הבלעדית. אתם מתחייבים שהתוכן שלכם אינו מפר זכויות יוצרים, 
            אינו מכיל מידע כוזב או מטעה, ואינו פוגע באחרים.
          </Text>

          <Text style={styles.sectionTitle}>6. תשלומים ומחירים</Text>
          <Text style={styles.sectionText}>
            המחירים המוצגים באפליקציה הם המלצות בלבד. התשלום הסופי ייקבע בהסכמה בין מחפש השירות לנותן השירות. 
            טובלי אינה אחראית לתשלומים או לסכסוכים כספיים בין המשתמשים.
          </Text>

          <Text style={styles.sectionTitle}>7. ביטול וחזרה</Text>
          <Text style={styles.sectionText}>
            אתם רשאים לבטל את חשבונכם בכל עת. ביטול החשבון לא יפטור אתכם מחובות קיימים או מהתחייבויות שנוצרו לפני הביטול.
          </Text>

          <Text style={styles.sectionTitle}>8. שינויים בתנאים</Text>
          <Text style={styles.sectionText}>
            אנו שומרים לעצמנו את הזכות לשנות את תנאי השימוש בכל עת. שינויים משמעותיים יובאו לידיעתכם באמצעות האפליקציה.
          </Text>

          <Text style={styles.sectionTitle}>9. הגבלת אחריות</Text>
          <Text style={styles.sectionText}>
            השימוש באפליקציה הוא על אחריותכם הבלעדית. טובלי אינה אחראית לנזקים ישירים או עקיפים הנובעים משימוש באפליקציה.
          </Text>

          <Text style={styles.sectionTitle}>10. חוק שולט</Text>
          <Text style={styles.sectionText}>
            תנאי השימוש כפופים לחוקי מדינת ישראל. כל סכסוך ייפתר בפני בתי המשפט המוסמכים בישראל.
          </Text>

          <Text style={styles.contactTitle}>צור קשר</Text>
          <Text style={styles.contactText}>
            לשאלות או הבהרות בנוגע לתנאי השימוש, אנא צרו איתנו קשר:
            {'\n'}אימייל: support@tovali.co.il
            {'\n'}טלפון: 03-1234567
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






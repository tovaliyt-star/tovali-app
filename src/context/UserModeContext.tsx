import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

type UserMode = 'customer' | 'provider';

interface UserModeContextType {
  userMode: UserMode;
  setUserMode: (mode: UserMode) => void;
  toggleUserMode: () => void;
  checkProviderRequirements: () => Promise<boolean>;
  trySwitchToProvider: () => Promise<void>;
}

const UserModeContext = createContext<UserModeContextType | undefined>(undefined);

export const useUserMode = () => {
  const context = useContext(UserModeContext);
  if (!context) {
    throw new Error('useUserMode must be used within a UserModeProvider');
  }
  return context;
};

export const UserModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [userMode, setUserModeState] = useState<UserMode>('customer');

  useEffect(() => {
    // טעינת המצב מ-AsyncStorage בעת הפעלת האפליקציה
    loadUserMode();
  }, []);

  const loadUserMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('userMode');
      if (savedMode && (savedMode === 'customer' || savedMode === 'provider')) {
        setUserModeState(savedMode as UserMode);
        console.log('טענתי מצב מ-AsyncStorage:', savedMode);
      } else {
        // אם אין מצב שמור, נטען את המצב מ-UserData
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          if (userData.userType) {
            setUserModeState(userData.userType);
            await AsyncStorage.setItem('userMode', userData.userType);
            console.log('טענתי מצב מ-UserData:', userData.userType);
          }
        }
      }
    } catch (error) {
      console.error('שגיאה בטעינת מצב:', error);
    }
  };

  const setUserMode = async (mode: UserMode) => {
    try {
      await AsyncStorage.setItem('userMode', mode);
      setUserModeState(mode);
      console.log('שמרתי מצב חדש:', mode);
    } catch (error) {
      console.error('שגיאה בשמירת מצב:', error);
    }
  };

  const toggleUserMode = async () => {
    const newMode = userMode === 'customer' ? 'provider' : 'customer';
    
    // אם עוברים לנותן שירות, בדוק אם יש מסמכים נדרשים
    if (newMode === 'provider') {
      const hasRequiredDocs = await checkProviderRequirements();
      if (!hasRequiredDocs) {
        Alert.alert(
          'מסמכים חסרים',
          'כדי לעבור לנותן שירות, עליך להעלות:\n\n• תמונת פרופיל\n• תעודה מזהה או רישיון\n\nאנא עבור לפרופיל שלך להעלאת המסמכים הנדרשים.',
          [
            { text: 'אישור', style: 'default' }
          ]
        );
        return;
      }
    }
    
    await setUserMode(newMode);
  };

  const checkProviderRequirements = async (): Promise<boolean> => {
    try {
      // בדיקה במערכת החדשה של משתמשים מרובים
      const allUsersString = await AsyncStorage.getItem('allUsers');
      const currentUserId = await AsyncStorage.getItem('currentUserId');
      
      if (allUsersString && currentUserId) {
        const allUsers = JSON.parse(allUsersString);
        const currentUser = allUsers.find((user: any) => user.id === currentUserId);
        
        if (currentUser) {
          // בדוק אם יש תמונת פרופיל ותעודה מזהה
          const hasProfileImage = !!(currentUser.profileImage || currentUser.avatar);
          const hasIdDocument = !!currentUser.idDocument;
          
          console.log('בדיקת דרישות נותן שירות:', {
            hasProfileImage,
            hasIdDocument,
            profileImage: currentUser.profileImage,
            avatar: currentUser.avatar,
            idDocument: currentUser.idDocument
          });
          
          return hasProfileImage && hasIdDocument;
        }
      }
      
      // fallback למערכת הישנה
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        return !!(userData.profileImage && userData.idDocument);
      }
      
      return false;
    } catch (error) {
      console.error('שגיאה בבדיקת דרישות נותן שירות:', error);
      return false;
    }
  };

  const trySwitchToProvider = async (): Promise<void> => {
    const hasRequiredDocs = await checkProviderRequirements();
    if (hasRequiredDocs) {
      await setUserMode('provider');
      Alert.alert('הצלחה', 'המעבר לנותן שירות הושלם בהצלחה!');
    } else {
      Alert.alert(
        'מסמכים חסרים', 
        'כדי לעבור לנותן שירות, עליך להעלות:\n\n• תמונת פרופיל\n• תעודה מזהה או רישיון\n\nאנא עבור לפרופיל שלך להעלאת המסמכים הנדרשים.',
        [
          { text: 'אישור', style: 'default' }
        ]
      );
    }
  };

  return (
    <UserModeContext.Provider value={{ userMode, setUserMode, toggleUserMode, checkProviderRequirements, trySwitchToProvider }}>
      {children}
    </UserModeContext.Provider>
  );
};




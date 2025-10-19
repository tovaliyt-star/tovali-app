import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  userType: 'customer' | 'provider';
  avatar: string;
  address: string;
  city: string;
  zipCode: string;
  // שדות נוספים לנותני שירות
  profileImage?: string;
  idDocument?: string;
  licenseDocument?: string;
  isVerified?: boolean;
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    pushNotifications: boolean;
  };
  favorites: string[];
  orders: any[];
  reviews: any[];
  paymentMethods: any[];
  addresses: any[];
  giftCards: any[];
  referralCredits: number;
}

interface UserDataContextType {
  userData: UserData | null;
  allUsers: UserData[];
  currentUserId: string | null;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
  saveUserData: (data: UserData) => Promise<void>;
  loadUserData: () => Promise<void>;
  loadAllUsers: () => Promise<void>;
  switchUser: (userId: string) => Promise<void>;
  clearUserData: () => Promise<void>;
  resetUserData: () => Promise<void>;
  createNewUser: (userData: Omit<UserData, 'id' | 'preferences' | 'favorites' | 'orders' | 'reviews' | 'paymentMethods' | 'addresses' | 'giftCards' | 'referralCredits'>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  addToFavorites: (itemId: string) => Promise<void>;
  removeFromFavorites: (itemId: string) => Promise<void>;
  addOrder: (order: any) => Promise<void>;
  addReview: (review: any) => Promise<void>;
  addPaymentMethod: (method: any) => Promise<void>;
  addAddress: (address: any) => Promise<void>;
  addGiftCard: (card: any) => Promise<void>;
  updateReferralCredits: (amount: number) => Promise<void>;
}

const defaultUserData: UserData = {
  id: 'provider1',
  name: 'משתמש טובלי',
  email: 'user@tovali.com',
  phone: '050-1234567',
  password: '',
  userType: 'provider',
  avatar: '',
  address: 'רחוב הרצל 1',
  city: 'תל אביב',
  zipCode: '12345',
  profileImage: '',
  idDocument: '',
  licenseDocument: '',
  isVerified: false,
  preferences: {
    notifications: true,
    emailUpdates: true,
    pushNotifications: true,
  },
  favorites: ['1', '2'],
  orders: [
    {
      id: '1',
      serviceTitle: 'הובלת רהיטים',
      providerName: 'יוסי הובלות',
      status: 'in_progress',
      totalPrice: 150,
      scheduledDate: '2024-01-15T10:00:00',
      notes: 'ניקיון יסודי של 3 חדרים',
      createdAt: '2024-01-10T09:00:00',
    },
    {
      id: '2',
      serviceTitle: 'ניקוי דירה',
      providerName: 'שירותי ניקוי מקצועי',
      status: 'completed',
      totalPrice: 200,
      scheduledDate: '2024-01-05T14:00:00',
      notes: 'תיקון ברז במטבח',
      createdAt: '2024-01-03T11:00:00',
    },
  ],
  reviews: [
    {
      id: 1,
      reviewerName: 'דוד כהן',
      reviewerAvatar: null,
      rating: 5,
      date: '15 באוגוסט 2024',
      service: 'תיקון מחשב נייד',
      review: 'שירות מעולה! עבודה מקצועית ומהירה. המחשב עובד כמו חדש. ממליץ בחום!',
      workCompleted: true,
    },
    {
      id: 2,
      reviewerName: 'שרה לוי',
      reviewerAvatar: null,
      rating: 4,
      date: '10 באוגוסט 2024',
      service: 'ניקוי דירה',
      review: 'עבודה מדויקת ומקצועית. הדירה נראית מדהים! רק קצת איחר מהזמן המתוכנן.',
      workCompleted: true,
    },
  ],
  paymentMethods: [],
  addresses: [],
  giftCards: [
    {
      id: '1',
      code: 'GIFT123456',
      amount: 100,
      balance: 75,
      expiryDate: '31/12/2025',
      isActive: true,
    },
    {
      id: '2',
      code: 'GIFT789012',
      amount: 50,
      balance: 0,
      expiryDate: '15/06/2025',
      isActive: false,
    },
  ],
  referralCredits: 0,
};

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};

export const UserDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadAllUsers();
  }, []);

  const loadAllUsers = async () => {
    try {
      const savedUsers = await AsyncStorage.getItem('allUsers');
      if (savedUsers) {
        const parsedUsers = JSON.parse(savedUsers);
        setAllUsers(parsedUsers);
        console.log('טענתי את כל המשתמשים:', parsedUsers);
        
        // טעינת המשתמש הנוכחי
        const currentUserId = await AsyncStorage.getItem('currentUserId');
        if (currentUserId) {
          const currentUser = parsedUsers.find((user: UserData) => user.id === currentUserId);
          if (currentUser) {
            setUserData(currentUser);
            setCurrentUserId(currentUserId);
            console.log('טענתי משתמש נוכחי:', currentUser);
          }
        }
      } else {
        // אם אין משתמשים, נצור משתמש ברירת מחדל
        const initialUsers = [defaultUserData];
        setAllUsers(initialUsers);
        setUserData(defaultUserData);
        setCurrentUserId(defaultUserData.id);
        await AsyncStorage.setItem('allUsers', JSON.stringify(initialUsers));
        await AsyncStorage.setItem('currentUserId', defaultUserData.id);
        console.log('יצרתי משתמש ברירת מחדל:', defaultUserData);
      }
    } catch (error) {
      console.error('שגיאה בטעינת משתמשים:', error);
      setAllUsers([defaultUserData]);
      setUserData(defaultUserData);
      setCurrentUserId(defaultUserData.id);
    }
  };

  const loadUserData = async () => {
    // פונקציה זו נשארת לתאימות לאחור
    await loadAllUsers();
  };

  const saveUserData = async (data: UserData) => {
    try {
      // עדכון המשתמש ברשימת כל המשתמשים
      const updatedUsers = allUsers.map(user => 
        user.id === data.id ? data : user
      );
      
      // אם המשתמש לא קיים, נוסיף אותו
      if (!allUsers.find(user => user.id === data.id)) {
        updatedUsers.push(data);
      }
      
      setAllUsers(updatedUsers);
      setUserData(data);
      
      // שמירה ב-AsyncStorage
      await AsyncStorage.setItem('allUsers', JSON.stringify(updatedUsers));
      await AsyncStorage.setItem('currentUserId', data.id);
      
      console.log('שמרתי נתוני משתמש:', data);
    } catch (error) {
      console.error('שגיאה בשמירת נתוני משתמש:', error);
    }
  };

  const updateUserData = async (data: Partial<UserData>) => {
    if (!userData) return;
    
    const updatedData = { ...userData, ...data };
    await saveUserData(updatedData);
  };

  const clearUserData = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      setUserData(null);
      console.log('מחקתי נתוני משתמש');
    } catch (error) {
      console.error('שגיאה במחיקת נתוני משתמש:', error);
    }
  };

  const resetUserData = async () => {
    try {
      await AsyncStorage.removeItem('allUsers');
      await AsyncStorage.removeItem('currentUserId');
      await AsyncStorage.removeItem('userMode');
      setUserData(null);
      setAllUsers([]);
      setCurrentUserId(null);
      console.log('איפסתי את כל נתוני המשתמש');
    } catch (error) {
      console.error('שגיאה באיפוס נתוני משתמש:', error);
    }
  };

  const switchUser = async (userId: string) => {
    try {
      const user = allUsers.find(u => u.id === userId);
      if (user) {
        setUserData(user);
        setCurrentUserId(userId);
        await AsyncStorage.setItem('currentUserId', userId);
        console.log('החלפתי למשתמש:', user);
      }
    } catch (error) {
      console.error('שגיאה בהחלפת משתמש:', error);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const updatedUsers = allUsers.filter(user => user.id !== userId);
      setAllUsers(updatedUsers);
      await AsyncStorage.setItem('allUsers', JSON.stringify(updatedUsers));
      
      // אם מחקנו את המשתמש הנוכחי, נבחר משתמש אחר
      if (currentUserId === userId) {
        if (updatedUsers.length > 0) {
          await switchUser(updatedUsers[0].id);
        } else {
          setUserData(null);
          setCurrentUserId(null);
          await AsyncStorage.removeItem('currentUserId');
        }
      }
      
      console.log('מחקתי משתמש:', userId);
    } catch (error) {
      console.error('שגיאה במחיקת משתמש:', error);
    }
  };

  const createNewUser = async (newUserData: Omit<UserData, 'id' | 'preferences' | 'favorites' | 'orders' | 'reviews' | 'paymentMethods' | 'addresses' | 'giftCards' | 'referralCredits'>) => {
    try {
      const userData: UserData = {
        ...newUserData,
        id: Date.now().toString(),
        preferences: {
          notifications: true,
          emailUpdates: true,
          pushNotifications: true,
        },
        favorites: [],
        orders: [],
        reviews: [],
        paymentMethods: [],
        addresses: [],
        giftCards: [],
        referralCredits: 0,
      };
      
      await saveUserData(userData);
      console.log('יצרתי משתמש חדש:', userData);
    } catch (error) {
      console.error('שגיאה ביצירת משתמש חדש:', error);
      throw error;
    }
  };

  const addToFavorites = async (itemId: string) => {
    if (!userData) return;
    
    const currentFavorites = userData.favorites || [];
    const updatedFavorites = [...currentFavorites, itemId];
    await updateUserData({ favorites: updatedFavorites });
  };

  const removeFromFavorites = async (itemId: string) => {
    if (!userData) return;
    
    const currentFavorites = userData.favorites || [];
    const updatedFavorites = currentFavorites.filter(id => id !== itemId);
    await updateUserData({ favorites: updatedFavorites });
  };

  const addOrder = async (order: any) => {
    if (!userData) return;
    
    const currentOrders = userData.orders || [];
    const updatedOrders = [...currentOrders, { ...order, id: Date.now().toString() }];
    await updateUserData({ orders: updatedOrders });
  };

  const addReview = async (review: any) => {
    if (!userData) return;
    
    const currentReviews = userData.reviews || [];
    const updatedReviews = [...currentReviews, { ...review, id: Date.now().toString() }];
    await updateUserData({ reviews: updatedReviews });
  };

  const addPaymentMethod = async (method: any) => {
    if (!userData) return;
    
    const currentMethods = userData.paymentMethods || [];
    const updatedMethods = [...currentMethods, { ...method, id: Date.now().toString() }];
    await updateUserData({ paymentMethods: updatedMethods });
  };

  const addAddress = async (address: any) => {
    if (!userData) return;
    
    const currentAddresses = userData.addresses || [];
    const updatedAddresses = [...currentAddresses, { ...address, id: Date.now().toString() }];
    await updateUserData({ addresses: updatedAddresses });
  };

  const addGiftCard = async (card: any) => {
    if (!userData) return;
    
    const currentCards = userData.giftCards || [];
    const updatedCards = [...currentCards, { ...card, id: Date.now().toString() }];
    await updateUserData({ giftCards: updatedCards });
  };

  const updateReferralCredits = async (amount: number) => {
    if (!userData) return;
    
    const currentCredits = userData.referralCredits || 0;
    await updateUserData({ referralCredits: currentCredits + amount });
  };

  return (
    <UserDataContext.Provider value={{
      userData,
      allUsers,
      currentUserId,
      updateUserData,
      saveUserData,
      loadUserData,
      loadAllUsers,
      switchUser,
      clearUserData,
      resetUserData,
      createNewUser,
      deleteUser,
      addToFavorites,
      removeFromFavorites,
      addOrder,
      addReview,
      addPaymentMethod,
      addAddress,
      addGiftCard,
      updateReferralCredits,
    }}>
      {children}
    </UserDataContext.Provider>
  );
};

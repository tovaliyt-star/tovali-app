import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

// שמירת נתוני משתמש
export const saveUserData = async (userData: User): Promise<void> => {
  try {
    console.log('Saving user data:', userData);
    const userDataString = JSON.stringify(userData);
    console.log('User data string:', userDataString);
    await AsyncStorage.setItem('userData', userDataString);
    console.log('User data saved successfully');
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
};

// טעינת נתוני משתמש
export const loadUserData = async (): Promise<User | null> => {
  try {
    console.log('Loading user data...');
    const storedUser = await AsyncStorage.getItem('userData');
    console.log('Stored user data:', storedUser);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log('Parsed user data:', parsedUser);
      return parsedUser;
    }
    console.log('No stored user data found');
    return null;
  } catch (error) {
    console.error('Error loading user data:', error);
    return null;
  }
};

// מחיקת נתוני משתמש
export const clearUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('userData');
  } catch (error) {
    console.error('Error clearing user data:', error);
    throw error;
  }
};

// שמירת הגדרות
export const saveSettings = async (settings: any): Promise<void> => {
  try {
    await AsyncStorage.setItem('userSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

// טעינת הגדרות
export const loadSettings = async (): Promise<any | null> => {
  try {
    const storedSettings = await AsyncStorage.getItem('userSettings');
    if (storedSettings) {
      return JSON.parse(storedSettings);
    }
    return null;
  } catch (error) {
    console.error('Error loading settings:', error);
    return null;
  }
};

// ניקוי מטמון
export const clearCache = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      'tempData',
      'searchHistory',
      'recentSearches'
    ]);
  } catch (error) {
    console.error('Error clearing cache:', error);
    throw error;
  }
};

// יצירת משתמש ברירת מחדל
export const createDefaultUser = (): User => {
  return {
    id: '1',
    name: 'Idan',
    phone: '+971585779603',
    email: 'idan@example.com',
    userType: 'customer',
    rating: 5.0,
    reviewCount: 0,
    createdAt: new Date(),
  };
};

// יצירת הגדרות ברירת מחדל
export const createDefaultSettings = () => {
  return {
    notificationsEnabled: true,
    locationEnabled: true,
    darkModeEnabled: false,
    autoLoginEnabled: true,
  };
};

// Utility functions

// Create page URL for navigation - for React Native we'll just return the page name
export const createPageUrl = (pageName: string): string => {
  return pageName;
};

// Additional utility functions can be added here
export const formatCurrency = (amount: number): string => {
  return `₪${amount.toLocaleString()}`;
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('he-IL');
};

// ===== ניהול משימות =====

// שמירת משימה חדשה
export const saveTask = async (task: any): Promise<void> => {
  try {
    const existingTasks = await loadAllTasks();
    const newTask = {
      ...task,
      id: Date.now().toString(), // יצירת ID ייחודי
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: task.status || 'פתוח' // שמירה על הסטטוס שנשלח או ברירת מחדל
    };
    
    const updatedTasks = [...existingTasks, newTask];
    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
    console.log('Task saved successfully:', newTask.id);
  } catch (error) {
    console.error('Error saving task:', error);
    throw error;
  }
};

// טעינת כל המשימות
export const loadAllTasks = async (): Promise<any[]> => {
  try {
    const storedTasks = await AsyncStorage.getItem('tasks');
    if (storedTasks) {
      const tasks = JSON.parse(storedTasks);
      console.log('Loaded all tasks:', tasks.length, 'tasks');
      tasks.forEach((task, index) => {
        console.log(`All Task ${index + 1}:`, {
          id: task.id,
          title: task.title,
          description: task.description,
          price: task.price,
          proposedPayment: task.proposedPayment,
          estimatedDuration: task.estimatedDuration,
          estimated_duration: task.estimated_duration,
          location: task.location,
          region: task.region || task.area || '',
          time: task.time || task.timeSlot || '10:00-12:00',
          timeSlot: task.timeSlot || task.time || '10:00-12:00',
          date: task.date,
          endDate: task.endDate,
          isDateRange: task.isDateRange,
          category: task.category,
          images: task.images?.length || 0,
          status: task.status
        });
      });
      return tasks;
    }
    return [];
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
};

// טעינת משימות לפי מזמין שירות
export const loadTasksByRequester = async (requesterId: string): Promise<any[]> => {
  try {
    const allTasks = await loadAllTasks();
    const filteredTasks = allTasks.filter(task => task.requesterId === requesterId || task.client_id === requesterId);
    console.log('Loaded tasks for requester:', requesterId, filteredTasks.length, 'tasks');
    filteredTasks.forEach((task, index) => {
      console.log(`Task ${index + 1}:`, {
        id: task.id,
        title: task.title,
        description: task.description,
        price: task.price,
        proposedPayment: task.proposedPayment,
        estimatedDuration: task.estimatedDuration,
        estimated_duration: task.estimated_duration,
        location: task.location,
        region: task.region || task.area || '',
        time: task.time || task.timeSlot || '10:00-12:00',
        timeSlot: task.timeSlot || task.time || '10:00-12:00',
        date: task.date,
        endDate: task.endDate,
        isDateRange: task.isDateRange,
        category: task.category,
        images: task.images?.length || 0,
        status: task.status
      });
    });
    return filteredTasks;
  } catch (error) {
    console.error('Error loading requester tasks:', error);
    return [];
  }
};

// טעינת משימות פעילות לנותן שירות
export const loadActiveTasksForProvider = async (): Promise<any[]> => {
  try {
    const allTasks = await loadAllTasks();
    const activeTasks = allTasks.filter(task => task.status === 'פתוח' || task.status === 'active');
    console.log('Loaded active tasks for provider:', activeTasks.length, 'tasks');
    activeTasks.forEach((task, index) => {
      console.log(`Active Task ${index + 1}:`, {
        id: task.id,
        title: task.title,
        description: task.description,
        price: task.price,
        proposedPayment: task.proposedPayment,
        estimatedDuration: task.estimatedDuration,
        estimated_duration: task.estimated_duration,
        location: task.location,
        region: task.region || task.area || '',
        time: task.time || task.timeSlot || '10:00-12:00',
        timeSlot: task.timeSlot || task.time || '10:00-12:00',
        date: task.date,
        endDate: task.endDate,
        isDateRange: task.isDateRange,
        category: task.category,
        images: task.images?.length || 0,
        status: task.status
      });
    });
    return activeTasks;
  } catch (error) {
    console.error('Error loading active tasks:', error);
    return [];
  }
};

// עדכון משימה
export const updateTask = async (taskId: string, updates: any): Promise<void> => {
  try {
    const allTasks = await loadAllTasks();
    const taskIndex = allTasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
      // שמירה על הנתונים הקיימים שלא צריכים להשתנות
      const existingTask = allTasks[taskIndex];
      
      // עדכון מלא של המשימה עם כל השדות
      allTasks[taskIndex] = {
        ...existingTask,
        ...updates,
        id: existingTask.id, // שמירה על ה-ID הקיים
        createdAt: existingTask.createdAt, // שמירה על תאריך יצירה
        updatedAt: new Date().toISOString(),
        // וידוא שכל השדות החשובים נשמרים
        title: updates.title || existingTask.title,
        description: updates.description || existingTask.description,
        price: updates.price || updates.proposedPayment || existingTask.price,
        proposedPayment: updates.proposedPayment || updates.price || existingTask.proposedPayment,
        estimated_duration: updates.estimated_duration || updates.estimatedDuration || existingTask.estimated_duration,
        estimatedDuration: updates.estimatedDuration || updates.estimated_duration || existingTask.estimatedDuration,
        location: updates.location || existingTask.location,
        region: updates.region || updates.area || existingTask.region || existingTask.area || '',
        time: updates.time || updates.timeSlot || existingTask.time || '10:00-12:00',
        timeSlot: updates.timeSlot || updates.time || existingTask.timeSlot || '10:00-12:00',
        date: updates.date || existingTask.date,
        endDate: updates.endDate || existingTask.endDate,
        isDateRange: updates.isDateRange !== undefined ? updates.isDateRange : existingTask.isDateRange,
        category: updates.category || existingTask.category,
        categoryId: updates.categoryId || existingTask.categoryId,
        images: updates.images || existingTask.images,
        status: updates.status || existingTask.status,
        requesterId: updates.requesterId || existingTask.requesterId,
        requesterName: updates.requesterName || existingTask.requesterName,
        client_id: updates.client_id || existingTask.client_id,
        // שדות נוספים להובלות קטנות
        pickupAddress: updates.pickupAddress || existingTask.pickupAddress,
        pickupFloor: updates.pickupFloor || existingTask.pickupFloor,
        pickupElevator: updates.pickupElevator !== undefined ? updates.pickupElevator : existingTask.pickupElevator,
        pickupAssembly: updates.pickupAssembly !== undefined ? updates.pickupAssembly : existingTask.pickupAssembly,
        dropoffAddress: updates.dropoffAddress || existingTask.dropoffAddress,
        dropoffFloor: updates.dropoffFloor || existingTask.dropoffFloor,
        dropoffElevator: updates.dropoffElevator !== undefined ? updates.dropoffElevator : existingTask.dropoffElevator,
        dropoffAssembly: updates.dropoffAssembly !== undefined ? updates.dropoffAssembly : existingTask.dropoffAssembly,
      };
      
      await AsyncStorage.setItem('tasks', JSON.stringify(allTasks));
      console.log('Task updated successfully:', taskId);
      console.log('Updated task data:', allTasks[taskIndex]);
    } else {
      console.error('Task not found for update:', taskId);
    }
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

// מחיקת משימה
export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    const allTasks = await loadAllTasks();
    const filteredTasks = allTasks.filter(task => task.id !== taskId);
    await AsyncStorage.setItem('tasks', JSON.stringify(filteredTasks));
    
    // מחיקת כל הבקשות הקשורות למשימה
    const allApplications = await loadAllApplications();
    const filteredApplications = allApplications.filter(app => app.taskId !== taskId);
    await AsyncStorage.setItem('taskApplications', JSON.stringify(filteredApplications));
    
    console.log('Task and related applications deleted successfully:', taskId);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// ===== ניהול בקשות למשימות =====

// שמירת בקשה חדשה למשימה
export const saveTaskApplication = async (application: any): Promise<void> => {
  try {
    console.log('Saving application:', application);
    const existingApplications = await loadAllApplications();
    console.log('Existing applications:', existingApplications);
    
    const newApplication = {
      ...application,
      id: Date.now().toString(),
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending'
    };
    
    console.log('New application:', newApplication);
    
    const updatedApplications = [...existingApplications, newApplication];
    await AsyncStorage.setItem('taskApplications', JSON.stringify(updatedApplications));
    console.log('Application saved successfully:', newApplication.id);
  } catch (error) {
    console.error('Error saving application:', error);
    throw error;
  }
};

// טעינת כל הבקשות
export const loadAllApplications = async (): Promise<any[]> => {
  try {
    const storedApplications = await AsyncStorage.getItem('taskApplications');
    if (storedApplications) {
      return JSON.parse(storedApplications);
    }
    return [];
  } catch (error) {
    console.error('Error loading applications:', error);
    return [];
  }
};

// טעינת בקשות לפי ID משימה
export const loadApplicationsByTaskId = async (taskId: string): Promise<any[]> => {
  try {
    console.log('Loading applications for taskId:', taskId);
    const allApplications = await loadAllApplications();
    console.log('All applications:', allApplications);
    const filteredApplications = allApplications.filter(app => app.taskId === taskId);
    console.log('Filtered applications:', filteredApplications);
    return filteredApplications;
  } catch (error) {
    console.error('Error loading applications by task ID:', error);
    return [];
  }
};

// ספירת בקשות ממתינות לפי ID משימה
export const getPendingApplicationsCount = async (taskId: string): Promise<number> => {
  try {
    const applications = await loadApplicationsByTaskId(taskId);
    return applications.filter(app => app.status === 'pending').length;
  } catch (error) {
    console.error('Error getting pending applications count:', error);
    return 0;
  }
};

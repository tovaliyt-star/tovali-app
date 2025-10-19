import React from 'react';
import { TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Define navigation types
export type RootStackParamList = {
  Main: undefined;
  ServiceDetail: { service: any };
  ProviderProfile: { provider: any };
  Login: undefined;
  Register: undefined;
  ClientDashboard: undefined;
  ProviderDashboard: undefined;
  Welcome: undefined;
  ProviderTasks: undefined;
  ProviderHome: undefined;
  ProviderEarnings: undefined;
  ProviderSchedule: undefined;
  ProviderMyWork: undefined;
  Tasks: undefined;
  Profile: undefined;
  CreateTask: { editMode?: boolean; taskData?: any } | undefined;
  TaskDetail: { taskId: string; task: any; isMyTask: boolean };

  EditProfile: undefined;
  Favorites: undefined;
  Addresses: undefined;
  PaymentMethods: undefined;
  CreditsAndGifts: undefined;
  GetHelp: undefined;
  Settings: undefined;
  Reviews: undefined;
  Orders: undefined;
  InterestedProviders: { taskId: string; taskTitle: string; taskDescription: string };
  ChatDetail: { chatId: string; chatName: string; chatService: string; chatStatus: string; otherParticipantId?: string };
  CreateReview: { taskId: string; reviewedUserId: string; reviewedUserName: string; reviewedUserAvatar?: string; serviceTitle: string; serviceCategory: string };
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
};

export type TabParamList = {
  Home: { forceChoice?: boolean };
  Chat: undefined;
  Tasks: undefined;
  Profile: undefined;
};

// Import screens
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import TasksScreen from '../screens/TasksScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ServiceDetailScreen from '../screens/ServiceDetailScreen';
import ProviderProfileScreen from '../screens/ProviderProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ClientDashboard from '../screens/ClientDashboard';
import ProviderDashboard from '../screens/ProviderDashboard';
import Welcome from '../screens/Welcome';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import CreateTaskScreen from '../screens/CreateTaskScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import AddressesScreen from '../screens/AddressesScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import ReviewsScreen from '../screens/ReviewsScreen';
import CreditsAndGiftsScreen from '../screens/CreditsAndGiftsScreen';
import GetHelpScreen from '../screens/GetHelpScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProviderTasksScreen from '../screens/ProviderTasksScreen';
import ProviderHomeScreen from '../screens/ProviderHomeScreen';
import ProviderEarningsScreen from '../screens/ProviderEarningsScreen';
import ProviderScheduleScreen from '../screens/ProviderScheduleScreen';
import ProviderMyWorkScreen from '../screens/ProviderMyWorkScreen';
import InterestedProvidersScreen from '../screens/InterestedProvidersScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import OrdersScreen from '../screens/OrdersScreen';
import CreateReviewScreen from '../screens/CreateReviewScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Tasks') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: 10,
          paddingTop: 10,
          height: 80,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '600',
          marginTop: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: 'בית',
        }} 
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={{ 
          title: 'צ\'אט',
        }} 
      />
      <Tab.Screen 
        name="Tasks" 
        component={TasksScreen} 
        options={{ 
          title: 'משימות',
        }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          title: 'פרופיל',
          headerTitle: 'הפרופיל שלי',
        }} 
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="Welcome"
      >
        <Stack.Screen 
          name="Welcome" 
          component={Welcome} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Main" 
          component={TabNavigator} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="ServiceDetail" 
          component={ServiceDetailScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ProviderProfile" 
          component={ProviderProfileScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ClientDashboard" 
          component={ClientDashboard} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="ProviderDashboard" 
          component={ProviderDashboard} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="CreateTask" 
          component={CreateTaskScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="TaskDetail" 
          component={TaskDetailScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="EditProfile" 
          component={EditProfileScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Favorites" 
          component={FavoritesScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Addresses" 
          component={AddressesScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="PaymentMethods" 
          component={PaymentMethodsScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="CreditsAndGifts" 
          component={CreditsAndGiftsScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="GetHelp" 
          component={GetHelpScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Reviews" 
          component={ReviewsScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="ProviderTasks" 
          component={ProviderTasksScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="ProviderHome" 
          component={ProviderHomeScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="ProviderEarnings" 
          component={ProviderEarningsScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="ProviderSchedule" 
          component={ProviderScheduleScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="ProviderMyWork" 
          component={ProviderMyWorkScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="InterestedProviders" 
          component={InterestedProvidersScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="ChatDetail" 
          component={ChatDetailScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Orders" 
          component={OrdersScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="CreateReview" 
          component={CreateReviewScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="TermsOfService" 
          component={TermsOfServiceScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="PrivacyPolicy" 
          component={PrivacyPolicyScreen} 
          options={{ headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

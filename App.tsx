import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { UserModeProvider } from './src/context/UserModeContext';
import { UserDataProvider } from './src/context/UserDataContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <UserModeProvider>
        <UserDataProvider>
          <AppNavigator />
          <StatusBar style="light" />
        </UserDataProvider>
      </UserModeProvider>
    </SafeAreaProvider>
  );
}

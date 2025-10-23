import React from 'react';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { UserModeProvider, useUserMode } from './src/context/UserModeContext';
import { UserDataProvider, useUserData } from './src/context/UserDataContext';
import { supabase } from './src/lib/supabase';
import { fetchMyProfile } from './src/lib/profiles';

function AppContent() {
  const { setUserMode } = useUserMode();
  const { loadUserData, saveUserData } = useUserData();

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        // 1) Get current session (if the user is already logged in)
        const { data: sess } = await supabase.auth.getSession();
        const accessToken = sess?.session?.access_token;

        // 2) Fetch profile and reconcile local state
        const profile = await fetchMyProfile(accessToken);
        if (!mounted) return;

        if (profile) {
          // Persist minimal profile into local UserDataContext (no password)
          const current = await loadUserData();
          await saveUserData({
            ...current,
            id: profile.id,
            name: profile.name ?? current?.name ?? '',
            phone: profile.phone ?? current?.phone ?? '',
            userType: (profile.user_type as any) ?? current?.userType ?? 'customer',
            email: current?.email ?? '',
            password: '',
            avatar: profile.avatar ?? current?.avatar ?? '',
            address: profile.address ?? current?.address ?? '',
            city: profile.city ?? current?.city ?? '',
            zipCode: profile.zip_code ?? current?.zipCode ?? '',
            preferences: current?.preferences ?? { notifications: true, emailUpdates: true, pushNotifications: true },
            favorites: current?.favorites ?? [],
            orders: current?.orders ?? [],
            reviews: current?.reviews ?? [],
            paymentMethods: current?.paymentMethods ?? [],
            addresses: current?.addresses ?? [],
            giftCards: current?.giftCards ?? [],
            referralCredits: current?.referralCredits ?? 0,
          });

          // Set mode from profile (customer/provider)
          if (profile.user_type === 'provider' || profile.user_type === 'customer') {
            setUserMode(profile.user_type);
          }
        }
      } catch (e) {
        // Silent – we keep UI intact; this is a best-effort bootstrap.
        console.log('Session bootstrap skipped:', (e as any)?.message ?? e);
      }
    }

    // Run once on mount
    bootstrap();

    // 3) Subscribe to auth state changes
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'SIGNED_IN') {
          const profile = await fetchMyProfile(session?.access_token);
          if (profile) {
            const current = await loadUserData();
            await saveUserData({
              ...current,
              id: profile.id,
              name: profile.name ?? current?.name ?? '',
              phone: profile.phone ?? current?.phone ?? '',
              userType: (profile.user_type as any) ?? current?.userType ?? 'customer',
              email: current?.email ?? '',
              password: '',
            });
            if (profile.user_type === 'provider' || profile.user_type === 'customer') {
              setUserMode(profile.user_type);
            }
          }
        }
        if (event === 'SIGNED_OUT') {
          // Keep existing logout UX; we won't modify contexts here to avoid side-effects.
          console.log('User signed out');
        }
      } catch (e) {
        console.log('Auth change handler error:', (e as any)?.message ?? e);
      }
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  return (
    <>
      <AppNavigator />
      <StatusBar style="light" />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <UserModeProvider>
        <UserDataProvider>
          <AppContent />
        </UserDataProvider>
      </UserModeProvider>
    </SafeAreaProvider>
  );
}

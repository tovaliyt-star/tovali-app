import { supabase } from './supabase';

export async function getInitialSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) console.warn('getSession error:', error.message);
  return session ?? null;
}

export function subscribeAuth(callback: (session: any) => void) {
  const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => subscription.subscription.unsubscribe();
}


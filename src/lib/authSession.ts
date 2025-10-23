import { supabase } from './supabase';
import type { Session } from '@supabase/supabase-js';

export function subscribeAuth(onChange?: (s: Session | null) => void) {
  const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
    console.log('🔐 Auth state changed. Session?', !!session);
    if (onChange) onChange(session);
  });
  return () => { sub.subscription.unsubscribe(); };
}

export async function getInitialSession() {
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}


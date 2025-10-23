// src/lib/profiles.ts
import { supabase } from './supabase';

export type UserProfile = {
  id: string;           // auth.users id (uuid)
  name: string | null;
  phone: string | null;
  user_type: 'customer' | 'provider' | null;
  avatar: string | null;
  address: string | null;
  city: string | null;
  zip_code: string | null;
  created_at?: string | null;
};

export async function fetchMyProfile(accessToken?: string) {
  // Access token is optional; supabase-js uses the current session automatically.
  const { data: { user }, error: uerr } = await supabase.auth.getUser(accessToken ? { token: accessToken } : undefined);
  if (uerr) throw uerr;
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id,name,phone,user_type,avatar,address,city,zip_code,created_at')
    .eq('id', user.id)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as UserProfile | null;
}


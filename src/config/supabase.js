import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { ENV, IS_CONFIGURED } from './env';

const url = ENV.SUPABASE_URL ?? 'https://missing.supabase.co';
const key = ENV.SUPABASE_ANON_KEY ?? 'missing-key';

export const supabase = createClient(url, key, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: IS_CONFIGURED,
    persistSession: IS_CONFIGURED,
    detectSessionInUrl: false,
  },
});

export const STORAGE_BUCKET = ENV.STORAGE_BUCKET;
export { IS_CONFIGURED };

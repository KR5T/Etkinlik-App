import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Supabase API ayarlarından kopyaladığın bilgileri buraya yapıştır
const supabaseUrl = 'https://mgxpsqfkrvnrkjxrgeqe.supabase.co';
const supabaseAnonKey = 'sb_publishable_qgoqTfypt2pH9-QEv5MzZQ_wv9g-rCo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
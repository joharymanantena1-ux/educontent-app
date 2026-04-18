import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {};

function pick(key) {
  return process.env[key] ?? extra[key] ?? null;
}

export const ENV = {
  SUPABASE_URL: pick('EXPO_PUBLIC_SUPABASE_URL'),
  SUPABASE_ANON_KEY: pick('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  STORAGE_BUCKET: pick('EXPO_PUBLIC_STORAGE_BUCKET') ?? 'content-files',
};

export function assertEnv() {
  const missing = [];
  if (!ENV.SUPABASE_URL) missing.push('EXPO_PUBLIC_SUPABASE_URL');
  if (!ENV.SUPABASE_ANON_KEY) missing.push('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  if (missing.length) {
    console.warn(
      `[env] Variables manquantes : ${missing.join(', ')}. ` +
        'Renseignez-les dans .env ou dans app.json > expo.extra.'
    );
  }
}

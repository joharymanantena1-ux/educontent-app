import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {};

function clean(value) {
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

function pick(key) {
  return clean(process.env[key]) ?? clean(extra[key]);
}

export const ENV = {
  SUPABASE_URL: pick('EXPO_PUBLIC_SUPABASE_URL'),
  SUPABASE_ANON_KEY: pick('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  STORAGE_BUCKET: pick('EXPO_PUBLIC_STORAGE_BUCKET') ?? 'content-files',
};

export const IS_CONFIGURED = !!(ENV.SUPABASE_URL && ENV.SUPABASE_ANON_KEY);

if (!IS_CONFIGURED) {
  console.warn(
    '[env] Variables Supabase manquantes. ' +
      "Vérifiez .env (EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY) puis relancez avec 'npx expo start -c'."
  );
}

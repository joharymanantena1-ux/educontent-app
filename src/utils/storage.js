import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  DOWNLOADS: '@educontent/downloads',
  PUSH_TOKEN: '@educontent/push_token',
  PREFERENCES: '@educontent/preferences',
};

export async function getItem(key, fallback = null) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export async function setItem(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeItem(key) {
  await AsyncStorage.removeItem(key);
}

export function formatSize(bytes) {
  if (!bytes) return '—';
  const units = ['o', 'Ko', 'Mo', 'Go'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(1)} ${units[i]}`;
}

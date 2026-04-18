import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '../config/supabase';
import { STORAGE_KEYS, setItem } from '../utils/storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationController = {
  async registerForPush(userId) {
    if (!Device.isDevice) {
      console.warn('[Notifications] Les push nécessitent un device physique');
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Général',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
      await Notifications.setNotificationChannelAsync('new-content', {
        name: 'Nouveaux contenus',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== 'granted') return null;

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    const token = tokenResponse.data;

    await setItem(STORAGE_KEYS.PUSH_TOKEN, token);

    if (userId) {
      try {
        await supabase
          .from('profiles')
          .update({ push_token: token })
          .eq('id', userId);
      } catch {}
    }

    return token;
  },

  addListener(onReceived, onResponse) {
    const sub1 = Notifications.addNotificationReceivedListener(onReceived);
    const sub2 = Notifications.addNotificationResponseReceivedListener(onResponse);
    return () => {
      sub1.remove();
      sub2.remove();
    };
  },

  async notifyLocal(title, body, data = {}) {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data },
      trigger: null,
    });
  },

  subscribeToNewContent(onNewContent) {
    const channel = supabase
      .channel('contents-inserts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'contents' },
        (payload) => {
          onNewContent(payload.new);
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  },
};

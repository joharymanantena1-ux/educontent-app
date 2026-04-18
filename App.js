import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { NotificationController } from './src/controllers/NotificationController';
import RootNavigator from './src/navigation/RootNavigator';

function NotificationBridge() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    NotificationController.registerForPush(user.id).catch(() => {});

    const unsubListener = NotificationController.addListener(
      () => {},
      () => {}
    );

    const unsubRealtime = NotificationController.subscribeToNewContent(
      (newContent) => {
        NotificationController.notifyLocal(
          'Nouveau contenu disponible',
          newContent?.title ?? 'Un nouveau support vient d\'être publié',
          { contentId: newContent?.id }
        );
      }
    );

    return () => {
      unsubListener?.();
      unsubRealtime?.();
    };
  }, [user?.id]);

  return null;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NotificationBridge />
        <RootNavigator />
        <StatusBar style="dark" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

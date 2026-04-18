import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { NotificationController } from './src/controllers/NotificationController';
import RootNavigator from './src/navigation/RootNavigator';
import ErrorBoundary from './src/views/components/ErrorBoundary';
import MissingEnvScreen from './src/views/screens/MissingEnvScreen';
import { IS_CONFIGURED } from './src/config/supabase';

function NotificationBridge() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    NotificationController.registerForPush(user.id).catch((e) =>
      console.warn('[push] register failed', e?.message)
    );

    const unsubListener = NotificationController.addListener(
      () => {},
      () => {}
    );

    let unsubRealtime = () => {};
    try {
      unsubRealtime = NotificationController.subscribeToNewContent((newContent) => {
        NotificationController.notifyLocal(
          'Nouveau contenu disponible',
          newContent?.title ?? "Un nouveau support vient d'être publié",
          { contentId: newContent?.id }
        );
      });
    } catch (e) {
      console.warn('[realtime] subscribe failed', e?.message);
    }

    return () => {
      unsubListener?.();
      unsubRealtime?.();
    };
  }, [user?.id]);

  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        {IS_CONFIGURED ? (
          <AuthProvider>
            <NotificationBridge />
            <RootNavigator />
          </AuthProvider>
        ) : (
          <MissingEnvScreen />
        )}
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../views/screens/HomeScreen';
import ContentListScreen from '../views/screens/ContentListScreen';
import ContentDetailScreen from '../views/screens/ContentDetailScreen';
import DownloadsScreen from '../views/screens/DownloadsScreen';
import ProfileScreen from '../views/screens/ProfileScreen';
import { colors } from '../utils/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.text },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'EduContent' }}
      />
      <Stack.Screen
        name="ContentList"
        component={ContentListScreen}
        options={({ route }) => ({ title: route.params?.title ?? 'Contenus' })}
      />
      <Stack.Screen
        name="ContentDetail"
        component={ContentDetailScreen}
        options={{ title: 'Détail' }}
      />
    </Stack.Navigator>
  );
}

function DownloadsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.text },
      }}
    >
      <Stack.Screen
        name="DownloadsHome"
        component={DownloadsScreen}
        options={{ title: 'Mes téléchargements' }}
      />
      <Stack.Screen
        name="ContentDetail"
        component={ContentDetailScreen}
        options={{ title: 'Détail' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size }) => {
          const map = {
            HomeTab: 'home',
            DownloadsTab: 'cloud-download',
            ProfileTab: 'person',
          };
          return <Ionicons name={map[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ title: 'Accueil' }}
      />
      <Tab.Screen
        name="DownloadsTab"
        component={DownloadsStack}
        options={{ title: 'Hors ligne' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
    </Tab.Navigator>
  );
}

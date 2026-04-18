import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../utils/theme';

export default function MissingEnvScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Ionicons name="warning" size={56} color={colors.warning} />
        <Text style={styles.title}>Configuration Supabase requise</Text>
        <Text style={styles.subtitle}>
          Ajoutez vos clés dans le fichier <Text style={styles.code}>.env</Text> à la racine
          du projet :
        </Text>

        <View style={styles.box}>
          <Text style={styles.snippet}>
            EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co{'\n'}
            EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
          </Text>
        </View>

        <Text style={styles.step}>
          1. Créez / modifiez <Text style={styles.code}>.env</Text>
        </Text>
        <Text style={styles.step}>
          2. Arrêtez Expo (<Text style={styles.code}>Ctrl + C</Text>)
        </Text>
        <Text style={styles.step}>
          3. Relancez avec <Text style={styles.code}>npx expo start -c</Text>
        </Text>
        <Text style={styles.step}>4. Rescannez le QR code depuis Expo Go</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, gap: spacing.sm },
  title: { ...typography.h2, marginTop: spacing.md },
  subtitle: { ...typography.body, marginBottom: spacing.sm },
  box: {
    backgroundColor: '#0F172A',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  snippet: { color: '#A7F3D0', fontFamily: 'Courier', fontSize: 12 },
  step: { ...typography.body, marginTop: spacing.xs },
  code: {
    fontFamily: 'Courier',
    color: colors.primary,
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 6,
    borderRadius: 4,
  },
});

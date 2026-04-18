import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { colors, spacing, typography } from '../../utils/theme';

export default function LoginScreen({ navigation }) {
  const { signIn, signInGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Champs requis', 'Email et mot de passe obligatoires.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (e) {
      Alert.alert('Connexion échouée', e.message ?? 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    try {
      await signInGoogle();
    } catch (e) {
      Alert.alert('Google', e.message ?? 'Impossible de se connecter');
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Bonjour 👋</Text>
            <Text style={styles.subtitle}>
              Connectez-vous pour accéder à vos contenus éducatifs
            </Text>
          </View>

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="vous@exemple.com"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <Input
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <Button
            title="Se connecter"
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: spacing.sm }}
          />

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.line} />
          </View>

          <Button title="Continuer avec Google" variant="ghost" onPress={handleGoogle} />

          <Pressable
            onPress={() => navigation.navigate('Register')}
            style={styles.footer}
          >
            <Text style={styles.footerText}>
              Pas encore de compte ? <Text style={styles.link}>S'inscrire</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, flexGrow: 1, justifyContent: 'center' },
  header: { marginBottom: spacing.xl },
  title: { ...typography.h1 },
  subtitle: { ...typography.muted, marginTop: spacing.xs },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
    gap: spacing.sm,
  },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textMuted, fontSize: 12 },
  footer: { alignItems: 'center', marginTop: spacing.lg },
  footerText: { color: colors.textMuted, fontSize: 14 },
  link: { color: colors.primary, fontWeight: '600' },
});

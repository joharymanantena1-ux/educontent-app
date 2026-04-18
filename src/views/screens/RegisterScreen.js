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

export default function RegisterScreen({ navigation }) {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!fullName || !email || !password) {
      Alert.alert('Champs requis', 'Tous les champs sont obligatoires.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Mot de passe', 'Le mot de passe doit faire au moins 6 caractères.');
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, fullName);
      Alert.alert(
        'Compte créé',
        'Vérifiez votre boîte mail pour confirmer votre adresse.'
      );
      navigation.navigate('Login');
    } catch (e) {
      Alert.alert('Inscription échouée', e.message ?? 'Erreur inconnue');
    } finally {
      setLoading(false);
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
            <Text style={styles.title}>Créer un compte</Text>
            <Text style={styles.subtitle}>
              Commencez à apprendre hors ligne dès aujourd'hui
            </Text>
          </View>

          <Input
            label="Nom complet"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Jean Dupont"
          />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="vous@exemple.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            placeholder="Minimum 6 caractères"
            secureTextEntry
          />

          <Button
            title="Créer mon compte"
            onPress={handleRegister}
            loading={loading}
            style={{ marginTop: spacing.sm }}
          />

          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.footer}
          >
            <Text style={styles.footerText}>
              Déjà inscrit ? <Text style={styles.link}>Se connecter</Text>
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
  footer: { alignItems: 'center', marginTop: spacing.lg },
  footerText: { color: colors.textMuted, fontSize: 14 },
  link: { color: colors.primary, fontWeight: '600' },
});

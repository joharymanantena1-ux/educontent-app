import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { DownloadController } from '../../controllers/DownloadController';
import { NotificationController } from '../../controllers/NotificationController';
import Button from '../components/Button';
import { colors, radius, spacing, typography } from '../../utils/theme';
import { STORAGE_KEYS, getItem, setItem } from '../../utils/storage';

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const [downloadCount, setDownloadCount] = useState(0);
  const [prefs, setPrefs] = useState({ notifications: true });

  useEffect(() => {
    DownloadController.list().then((d) => setDownloadCount(d.length));
    getItem(STORAGE_KEYS.PREFERENCES, { notifications: true }).then(setPrefs);
  }, []);

  async function togglePush(value) {
    const next = { ...prefs, notifications: value };
    setPrefs(next);
    await setItem(STORAGE_KEYS.PREFERENCES, next);
    if (value && user) {
      try {
        await NotificationController.registerForPush(user.id);
      } catch (e) {
        Alert.alert('Notifications', e.message);
      }
    }
  }

  async function handleSignOut() {
    Alert.alert('Déconnexion', 'Êtes-vous sûr ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Se déconnecter',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (e) {
            Alert.alert('Erreur', e.message);
          }
        },
      },
    ]);
  }

  const initials = (profile?.full_name ?? user?.email ?? '?')
    .split(/[\s@]/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{profile?.full_name ?? 'Étudiant'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.card}>
          <Row
            icon="cloud-download"
            label="Contenus téléchargés"
            value={String(downloadCount)}
          />
        </View>

        <Text style={styles.sectionTitle}>Préférences</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="notifications" size={20} color={colors.primary} />
              <Text style={styles.rowLabel}>Notifications push</Text>
            </View>
            <Switch
              value={prefs.notifications}
              onValueChange={togglePush}
              trackColor={{ true: colors.primary, false: colors.border }}
            />
          </View>
        </View>

        <Button
          title="Se déconnecter"
          variant="danger"
          onPress={handleSignOut}
          style={{ marginTop: spacing.xl }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ icon, label, value }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={20} color={colors.primary} />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  header: { alignItems: 'center', marginBottom: spacing.lg },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  name: { ...typography.h2 },
  email: { ...typography.muted },
  sectionTitle: {
    ...typography.muted,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowLabel: { ...typography.body },
  rowValue: { ...typography.body, color: colors.textMuted },
});

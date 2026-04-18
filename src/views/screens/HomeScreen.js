import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { ContentController, LEVELS, CONTENT_TYPES } from '../../controllers/ContentController';
import { DownloadController } from '../../controllers/DownloadController';
import ContentCard from '../components/ContentCard';
import CategoryFilter from '../components/CategoryFilter';
import EmptyState from '../components/EmptyState';
import { colors, radius, spacing, typography } from '../../utils/theme';

export default function HomeScreen({ navigation }) {
  const { profile, user } = useAuth();
  const [contents, setContents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [downloadedIds, setDownloadedIds] = useState(new Set());
  const [selectedType, setSelectedType] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [items, subs, downloads] = await Promise.all([
        ContentController.fetchAll({
          type: selectedType,
          level: selectedLevel,
        }),
        ContentController.fetchSubjects(),
        DownloadController.list(),
      ]);
      setContents(items);
      setSubjects(subs);
      setDownloadedIds(new Set(downloads.map((d) => d.contentId)));
    } catch (e) {
      console.warn('[Home] load error', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedType, selectedLevel]);

  useEffect(() => {
    load();
  }, [load]);

  const typeOptions = [
    { label: 'Documents', value: CONTENT_TYPES.DOCUMENT },
    { label: 'Vidéos', value: CONTENT_TYPES.VIDEO },
  ];

  const greeting = profile?.full_name
    ? `Bonjour, ${profile.full_name.split(' ')[0]}`
    : 'Bonjour';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.subtitle}>Que voulez-vous apprendre aujourd'hui ?</Text>
        </View>
      </View>

      <View style={styles.shortcuts}>
        {typeOptions.map((opt) => (
          <Pressable
            key={opt.value}
            style={styles.shortcut}
            onPress={() =>
              navigation.navigate('ContentList', {
                type: opt.value,
                title: opt.label,
              })
            }
          >
            <Ionicons
              name={opt.value === 'video' ? 'play-circle' : 'document-text'}
              size={28}
              color={colors.primary}
            />
            <Text style={styles.shortcutText}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.filters}>
        <Text style={styles.filterLabel}>Niveau</Text>
        <CategoryFilter
          options={LEVELS}
          selected={selectedLevel}
          onSelect={setSelectedLevel}
        />
        {subjects.length > 0 ? (
          <>
            <Text style={[styles.filterLabel, { marginTop: spacing.sm }]}>Matière</Text>
            <CategoryFilter
              options={subjects}
              selected={null}
              onSelect={(s) =>
                navigation.navigate('ContentList', { subject: s, title: s })
              }
            />
          </>
        ) : null}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={contents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>Nouveautés</Text>
          }
          ListEmptyComponent={
            <EmptyState
              icon="book"
              title="Aucun contenu"
              subtitle="Revenez bientôt pour découvrir de nouveaux supports."
            />
          }
          renderItem={({ item }) => (
            <ContentCard
              content={item}
              downloaded={downloadedIds.has(item.id)}
              onPress={() =>
                navigation.navigate('ContentDetail', { contentId: item.id })
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  greeting: { ...typography.h2 },
  subtitle: { ...typography.muted, marginTop: 2 },
  shortcuts: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  shortcut: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shortcutText: { ...typography.body, fontWeight: '600' },
  filters: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  filterLabel: {
    ...typography.muted,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  list: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, flexGrow: 1 },
  sectionTitle: { ...typography.h3, marginBottom: spacing.sm },
});

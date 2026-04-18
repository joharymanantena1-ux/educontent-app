import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ContentController } from '../../controllers/ContentController';
import { DownloadController } from '../../controllers/DownloadController';
import ContentCard from '../components/ContentCard';
import EmptyState from '../components/EmptyState';
import { colors, spacing } from '../../utils/theme';

export default function ContentListScreen({ route, navigation }) {
  const { type, level, subject } = route.params ?? {};
  const [contents, setContents] = useState([]);
  const [downloadedIds, setDownloadedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [items, downloads] = await Promise.all([
        ContentController.fetchAll({ type, level, subject }),
        DownloadController.list(),
      ]);
      setContents(items);
      setDownloadedIds(new Set(downloads.map((d) => d.contentId)));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [type, level, subject]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
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
        ListEmptyComponent={
          <EmptyState
            icon="file-tray"
            title="Liste vide"
            subtitle="Aucun contenu ne correspond à ce filtre."
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, flexGrow: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

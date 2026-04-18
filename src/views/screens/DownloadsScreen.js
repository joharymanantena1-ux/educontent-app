import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { DownloadController } from '../../controllers/DownloadController';
import ContentCard from '../components/ContentCard';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import { colors, spacing } from '../../utils/theme';

export default function DownloadsScreen({ navigation }) {
  const [downloads, setDownloads] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const list = await DownloadController.list();
    setDownloads(list);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function handleClear() {
    Alert.alert('Tout supprimer', 'Supprimer tous les téléchargements ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Tout supprimer',
        style: 'destructive',
        onPress: async () => {
          await DownloadController.clearAll();
          load();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        data={downloads}
        keyExtractor={(item) => item.contentId}
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
            icon="cloud-download-outline"
            title="Aucun téléchargement"
            subtitle="Téléchargez des contenus depuis l'accueil pour les consulter hors ligne."
          />
        }
        ListFooterComponent={
          downloads.length > 0 ? (
            <View style={{ marginTop: spacing.lg }}>
              <Button title="Tout supprimer" variant="danger" onPress={handleClear} />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <ContentCard
            content={{
              id: item.contentId,
              title: item.title,
              subject: item.subject,
              level: item.level,
              type: item.type,
              size: item.size,
            }}
            downloaded
            onPress={() =>
              navigation.navigate('ContentDetail', { contentId: item.contentId })
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
});

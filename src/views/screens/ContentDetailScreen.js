import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { ContentController } from '../../controllers/ContentController';
import { DownloadController } from '../../controllers/DownloadController';
import Button from '../components/Button';
import { colors, radius, spacing, typography } from '../../utils/theme';
import { formatSize } from '../../utils/storage';

export default function ContentDetailScreen({ route }) {
  const { contentId } = route.params;
  const [content, setContent] = useState(null);
  const [localEntry, setLocalEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const c = await ContentController.fetchById(contentId);
        setContent(c);
        const entry = await DownloadController.getLocalEntry(contentId);
        setLocalEntry(entry);
        if (c?.type === 'video') {
          if (entry?.localUri) {
            setVideoUrl(entry.localUri);
          } else {
            try {
              const url = await ContentController.getStreamUrl(c);
              setVideoUrl(url);
            } catch {}
          }
        }
      } catch (e) {
        Alert.alert('Erreur', e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [contentId]);

  async function handleDownload() {
    if (!content) return;
    setDownloading(true);
    setProgress(0);
    try {
      const entry = await DownloadController.download(content, setProgress);
      setLocalEntry(entry);
      if (content.type === 'video') setVideoUrl(entry.localUri);
      Alert.alert('Téléchargé', 'Disponible hors ligne.');
    } catch (e) {
      Alert.alert('Téléchargement', e.message);
    } finally {
      setDownloading(false);
    }
  }

  async function handleRemove() {
    Alert.alert('Supprimer', 'Supprimer ce téléchargement ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await DownloadController.remove(contentId);
          setLocalEntry(null);
          if (content?.type === 'video') {
            try {
              const url = await ContentController.getStreamUrl(content);
              setVideoUrl(url);
            } catch {}
          }
        },
      },
    ]);
  }

  async function handleOpen() {
    if (!localEntry) return;
    try {
      await DownloadController.share(contentId);
    } catch (e) {
      try {
        await Linking.openURL(localEntry.localUri);
      } catch {
        Alert.alert('Ouverture', e.message);
      }
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!content) {
    return (
      <View style={styles.center}>
        <Text style={typography.body}>Contenu introuvable</Text>
      </View>
    );
  }

  const isVideo = content.type === 'video';

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {isVideo && videoUrl ? (
          <Video
            ref={videoRef}
            source={{ uri: videoUrl }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
          />
        ) : (
          <View style={styles.cover}>
            <Ionicons
              name={isVideo ? 'videocam' : 'document-text'}
              size={72}
              color={colors.primary}
            />
          </View>
        )}

        <View style={styles.body}>
          <Text style={styles.title}>{content.title}</Text>
          <View style={styles.metaRow}>
            {content.subject ? <Badge label={content.subject} /> : null}
            {content.level ? <Badge label={content.level} /> : null}
            <Badge label={formatSize(content.size)} />
          </View>

          {content.description ? (
            <Text style={styles.description}>{content.description}</Text>
          ) : null}

          {downloading ? (
            <View style={styles.progressWrap}>
              <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
              <Text style={styles.progressText}>
                {Math.round(progress * 100)} %
              </Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            {localEntry ? (
              <>
                <Button title="Ouvrir / Partager" onPress={handleOpen} />
                <Button title="Supprimer" variant="danger" onPress={handleRemove} />
              </>
            ) : (
              <Button
                title={downloading ? 'Téléchargement…' : 'Télécharger hors ligne'}
                loading={downloading}
                onPress={handleDownload}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Badge({ label }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  video: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000' },
  cover: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  body: { padding: spacing.lg, gap: spacing.md },
  title: { ...typography.h2 },
  metaRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  badge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: { fontSize: 12, color: colors.text, fontWeight: '500' },
  description: { ...typography.body, lineHeight: 22 },
  progressWrap: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: radius.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: { height: '100%', backgroundColor: colors.primary },
  progressText: {
    position: 'absolute',
    right: 0,
    top: 12,
    fontSize: 12,
    color: colors.textMuted,
  },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
});

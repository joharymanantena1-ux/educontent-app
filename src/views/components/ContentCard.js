import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../utils/theme';
import { formatSize } from '../../utils/storage';

export default function ContentCard({ content, downloaded, onPress }) {
  const isVideo = content.type === 'video';
  const iconName = isVideo ? 'play-circle' : 'document-text';
  const iconColor = isVideo ? colors.accent : colors.primary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={[styles.iconBox, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={iconName} size={28} color={iconColor} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {content.title}
        </Text>
        <View style={styles.metaRow}>
          {content.subject ? (
            <Text style={styles.metaBadge}>{content.subject}</Text>
          ) : null}
          {content.level ? (
            <Text style={styles.metaBadge}>{content.level}</Text>
          ) : null}
        </View>
        <Text style={styles.meta}>{formatSize(content.size)}</Text>
      </View>
      {downloaded ? (
        <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
      ) : (
        <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  pressed: { opacity: 0.85 },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 4 },
  title: { ...typography.body, fontWeight: '600' },
  metaRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  metaBadge: {
    fontSize: 11,
    color: colors.textMuted,
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  meta: { fontSize: 12, color: colors.textMuted },
});

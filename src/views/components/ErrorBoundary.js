import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../utils/theme';

export default class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <ScrollView contentContainerStyle={styles.wrap}>
          <Text style={styles.title}>Erreur au démarrage</Text>
          <Text style={styles.subtitle}>
            Un problème empêche l'application de s'afficher. Voici le détail :
          </Text>
          <View style={styles.box}>
            <Text style={styles.code}>
              {String(this.state.error?.message ?? this.state.error)}
            </Text>
            {this.state.error?.stack ? (
              <Text style={styles.stack}>{this.state.error.stack}</Text>
            ) : null}
          </View>
          <Text style={styles.hint}>
            Astuce : relancez Expo avec la commande{'\n'}
            <Text style={styles.codeInline}>npx expo start -c</Text>
          </Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  wrap: {
    padding: spacing.lg,
    paddingTop: 60,
    flexGrow: 1,
    backgroundColor: colors.background,
  },
  title: { ...typography.h1, color: colors.danger },
  subtitle: { ...typography.body, marginTop: spacing.sm, marginBottom: spacing.md },
  box: {
    backgroundColor: '#1E293B',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  code: { color: '#FCA5A5', fontFamily: 'Courier', fontSize: 13 },
  stack: { color: '#CBD5E1', fontFamily: 'Courier', fontSize: 11, marginTop: spacing.sm },
  codeInline: { fontFamily: 'Courier', color: colors.primary, fontWeight: '600' },
  hint: { ...typography.muted },
});

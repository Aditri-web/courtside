import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SpatialNavigationFocusableView, SpatialNavigationScrollView } from 'react-tv-space-navigation';
import { aiClient } from './aiClient';
import { RecapResult } from './types';
import { useProfile } from './ProfileContext';
import { scaledPixels } from '../hooks/useScale';

interface CatchUpTabProps {
  currentTime: number;
}

export const CatchUpTab: React.FC<CatchUpTabProps> = ({ currentTime }) => {
  const { profile, toggleSpoilers } = useProfile();
  const [recap, setRecap] = useState<RecapResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadRecap = useCallback(async () => {
    setLoading(true);
    try {
      const result = await aiClient.fetchRecap(currentTime, profile.spoilers, profile.level);
      setRecap(result);
    } catch (err) {
      console.error('[CatchUpTab] load error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentTime, profile.spoilers, profile.level]);

  useEffect(() => {
    loadRecap();
  }, [loadRecap]);

  const fontScale = profile.fontSizeScale || 1.0;

  return (
    <View style={styles.container}>
      <View style={styles.controlBar}>
        {/* Spoiler Toggle Button */}
        <SpatialNavigationFocusableView onSelect={toggleSpoilers}>
          {({ isFocused }) => (
            <View
              style={[
                styles.button,
                profile.spoilers ? styles.spoilerActiveButton : styles.spoilerInactiveButton,
                isFocused && styles.buttonFocused
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Toggle spoilers. Currently ${profile.spoilers ? 'Spoilers On' : 'Spoiler-Free Mode'}`}
            >
              <Text style={[styles.buttonText, isFocused && styles.buttonTextFocused]}>
                {profile.spoilers ? '🔓 Spoilers: ON' : '🛡️ Spoiler-Free: ON'}
              </Text>
            </View>
          )}
        </SpatialNavigationFocusableView>

        {/* Refresh Recap Button */}
        <SpatialNavigationFocusableView onSelect={loadRecap}>
          {({ isFocused }) => (
            <View
              style={[styles.button, styles.refreshButton, isFocused && styles.buttonFocused]}
              accessibilityRole="button"
              accessibilityLabel="Refresh Catch Me Up recap for current playback time"
            >
              <Text style={[styles.buttonText, isFocused && styles.buttonTextFocused]}>
                🔄 Refresh Recap
              </Text>
            </View>
          )}
        </SpatialNavigationFocusableView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00E5FF" />
          <Text style={styles.loadingText}>Synthesizing grounded match recap...</Text>
        </View>
      ) : recap ? (
        <SpatialNavigationScrollView style={styles.scrollArea}>
          <View style={styles.content}>
            <View style={styles.headlineCard}>
              <View style={styles.metaRow}>
                <Text style={styles.tagText}>
                  {recap.isSpoilerFree ? '🛡️ SPOILER-FREE RECAP' : '⚡ FULL MATCH RECAP'}
                </Text>
                <Text style={styles.clockTag}>Match timeline: {Math.floor(currentTime)}s</Text>
              </View>
              <Text style={[styles.headlineText, { fontSize: scaledPixels(20 * fontScale) }]}>
                {recap.headline}
              </Text>
            </View>

            <View style={styles.bulletsContainer}>
              {recap.bullets.map((bullet, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <View style={styles.bulletDot} />
                  <Text
                    style={[
                      styles.bulletText,
                      {
                        fontSize: scaledPixels(15 * fontScale),
                        lineHeight: scaledPixels(22 * fontScale)
                      }
                    ]}
                  >
                    {bullet}
                  </Text>
                </View>
              ))}
            </View>

            {recap.currentScore && (
              <View style={styles.scorePill}>
                <Text style={styles.scorePillText}>
                  Score at this moment: ARS {recap.currentScore.home} - {recap.currentScore.away} MCI
                </Text>
              </View>
            )}
          </View>
        </SpatialNavigationScrollView>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: scaledPixels(16)
  },
  controlBar: {
    flexDirection: 'row',
    marginBottom: scaledPixels(16),
    gap: scaledPixels(12)
  },
  button: {
    paddingVertical: scaledPixels(10),
    paddingHorizontal: scaledPixels(16),
    borderRadius: scaledPixels(8),
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center'
  },
  spoilerInactiveButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderColor: '#10B981'
  },
  spoilerActiveButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    borderColor: '#EF4444'
  },
  refreshButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    borderColor: '#3B82F6'
  },
  buttonFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: '#38BDF8',
    transform: [{ scale: 1.05 }],
    shadowColor: '#38BDF8',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: scaledPixels(13),
    fontWeight: '700'
  },
  buttonTextFocused: {
    color: '#0F172A',
    fontWeight: '900'
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scaledPixels(40)
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: scaledPixels(14),
    marginTop: scaledPixels(12),
    fontWeight: '600'
  },
  scrollArea: {
    flex: 1
  },
  content: {
    paddingBottom: scaledPixels(24)
  },
  headlineCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: scaledPixels(12),
    padding: scaledPixels(16),
    borderLeftWidth: 4,
    borderLeftColor: '#38BDF8',
    marginBottom: scaledPixels(16)
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scaledPixels(8)
  },
  tagText: {
    color: '#38BDF8',
    fontSize: scaledPixels(11),
    fontWeight: '800',
    letterSpacing: 0.5
  },
  clockTag: {
    color: '#64748B',
    fontSize: scaledPixels(11),
    fontWeight: '600'
  },
  headlineText: {
    color: '#F8FAFC',
    fontWeight: '800'
  },
  bulletsContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: scaledPixels(12),
    padding: scaledPixels(16),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: scaledPixels(14)
  },
  bulletDot: {
    width: scaledPixels(8),
    height: scaledPixels(8),
    borderRadius: scaledPixels(4),
    backgroundColor: '#00E5FF',
    marginTop: scaledPixels(6),
    marginRight: scaledPixels(12)
  },
  bulletText: {
    color: '#E2E8F0',
    flex: 1,
    fontWeight: '500'
  },
  scorePill: {
    marginTop: scaledPixels(16),
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: scaledPixels(6),
    paddingHorizontal: scaledPixels(14),
    borderRadius: scaledPixels(16)
  },
  scorePillText: {
    color: '#94A3B8',
    fontSize: scaledPixels(12),
    fontWeight: '700'
  }
});

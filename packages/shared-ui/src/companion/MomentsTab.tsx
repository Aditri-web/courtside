import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SpatialNavigationFocusableView, SpatialNavigationScrollView } from 'react-tv-space-navigation';
import { aiClient } from './aiClient';
import { MomentItem } from './types';
import { useProfile } from './ProfileContext';
import { scaledPixels } from '../hooks/useScale';

interface MomentsTabProps {
  onSeek: (tSec: number) => void;
  onSelectMoment?: (eventId: string) => void;
}

export const MomentsTab: React.FC<MomentsTabProps> = ({ onSeek, onSelectMoment }) => {
  const { profile } = useProfile();
  const [moments, setMoments] = useState<MomentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadMoments = useCallback(async () => {
    setLoading(true);
    try {
      const result = await aiClient.fetchMoments();
      setMoments(result.moments);
    } catch (err) {
      console.error('[MomentsTab] load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMoments();
  }, [loadMoments]);

  const fontScale = profile.fontSizeScale || 1.0;

  return (
    <View style={styles.container}>
      <Text style={styles.headerSubtitle}>
        🎯 Select any AI-ranked key moment to jump the video directly there:
      </Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00E5FF" />
          <Text style={styles.loadingText}>Ranking key match turning points...</Text>
        </View>
      ) : (
        <SpatialNavigationScrollView style={styles.scrollArea}>
          <View style={styles.list}>
            {moments.map((item, index) => {
              const isGoal = item.type === 'goal';
              const isVar = item.type === 'var_decision';
              const badgeColor = isGoal ? '#10B981' : isVar ? '#06B6D4' : '#F59E0B';

              return (
                <SpatialNavigationFocusableView
                  key={item.eventId}
                  onSelect={() => {
                    onSeek(item.tSec);
                    onSelectMoment?.(item.eventId);
                  }}
                >
                  {({ isFocused }) => (
                    <View
                      style={[
                        styles.card,
                        isFocused && styles.cardFocused
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Moment ${index + 1}: ${item.clock} ${item.title}. Press select to jump video.`}
                    >
                      <View style={styles.cardHeader}>
                        <View style={[styles.typeBadge, { backgroundColor: badgeColor }]}>
                          <Text style={styles.typeBadgeText}>{item.type.toUpperCase()}</Text>
                        </View>
                        <Text style={styles.clockText}>{item.clock}</Text>
                        <Text style={styles.scoreText}>
                          ARS {item.score.home} - {item.score.away} MCI
                        </Text>
                        <View style={styles.importancePill}>
                          <Text style={styles.importanceText}>
                            ★ {Math.round(item.importance * 100)}%
                          </Text>
                        </View>
                      </View>

                      <Text
                        style={[
                          styles.titleText,
                          { fontSize: scaledPixels(15 * fontScale) },
                          isFocused && styles.titleTextFocused
                        ]}
                      >
                        {item.title}
                      </Text>

                      <Text
                        style={[
                          styles.whyText,
                          { fontSize: scaledPixels(13 * fontScale) },
                          isFocused && styles.whyTextFocused
                        ]}
                        numberOfLines={2}
                      >
                        {item.why}
                      </Text>

                      {isFocused && (
                        <View style={styles.jumpHint}>
                          <Text style={styles.jumpHintText}>▶ Press [SELECT] to jump video to {item.clock}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </SpatialNavigationFocusableView>
              );
            })}
          </View>
        </SpatialNavigationScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: scaledPixels(16)
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: scaledPixels(13),
    fontWeight: '600',
    marginBottom: scaledPixels(12)
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
  list: {
    gap: scaledPixels(12),
    paddingBottom: scaledPixels(24)
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: scaledPixels(12),
    padding: scaledPixels(14),
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  cardFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: '#38BDF8',
    transform: [{ scale: 1.03 }],
    shadowColor: '#38BDF8',
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 8
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaledPixels(8)
  },
  typeBadge: {
    paddingHorizontal: scaledPixels(8),
    paddingVertical: scaledPixels(3),
    borderRadius: scaledPixels(4),
    marginRight: scaledPixels(8)
  },
  typeBadgeText: {
    color: '#000000',
    fontSize: scaledPixels(10),
    fontWeight: '900'
  },
  clockText: {
    color: '#38BDF8',
    fontSize: scaledPixels(13),
    fontWeight: '800',
    marginRight: scaledPixels(8)
  },
  scoreText: {
    color: '#E2E8F0',
    fontSize: scaledPixels(13),
    fontWeight: '700'
  },
  importancePill: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: scaledPixels(8),
    paddingVertical: scaledPixels(2),
    borderRadius: scaledPixels(10)
  },
  importanceText: {
    color: '#FBBF24',
    fontSize: scaledPixels(11),
    fontWeight: '800'
  },
  titleText: {
    color: '#F8FAFC',
    fontWeight: '700',
    marginBottom: scaledPixels(4)
  },
  titleTextFocused: {
    color: '#0F172A',
    fontWeight: '900'
  },
  whyText: {
    color: '#94A3B8',
    lineHeight: scaledPixels(18)
  },
  whyTextFocused: {
    color: '#334155'
  },
  jumpHint: {
    marginTop: scaledPixels(8),
    borderTopWidth: 1,
    borderTopColor: 'rgba(15, 23, 42, 0.15)',
    paddingTop: scaledPixels(6)
  },
  jumpHintText: {
    color: '#0284C7',
    fontSize: scaledPixels(12),
    fontWeight: '800'
  }
});

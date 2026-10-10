import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SpatialNavigationFocusableView, SpatialNavigationScrollView } from 'react-tv-space-navigation';
import { aiClient } from './aiClient';
import { ExplainResult, ExplanationLevel } from './types';
import { useProfile } from './ProfileContext';
import { scaledPixels } from '../hooks/useScale';

interface ExplainTabProps {
  currentTime: number;
  selectedEventId?: string;
}

export const ExplainTab: React.FC<ExplainTabProps> = ({ currentTime, selectedEventId }) => {
  const { profile, setLevel } = useProfile();
  const [explainData, setExplainData] = useState<ExplainResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadExplanation = useCallback(async () => {
    setLoading(true);
    try {
      const result = await aiClient.fetchExplain(selectedEventId, currentTime, profile.level);
      setExplainData(result);
    } catch (err) {
      console.error('[ExplainTab] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedEventId, currentTime, profile.level]);

  useEffect(() => {
    loadExplanation();
  }, [loadExplanation]);

  const fontScale = profile.fontSizeScale || 1.0;
  const levels: ExplanationLevel[] = ['kid', 'casual', 'expert'];

  return (
    <View style={styles.container}>
      {/* Level selector */}
      <View style={styles.levelSelectorRow}>
        {levels.map((lvl) => {
          const isSelected = profile.level === lvl;
          const label = lvl === 'kid' ? '🧒 Kid' : lvl === 'casual' ? '⚽ Casual' : '📊 Expert';
          return (
            <SpatialNavigationFocusableView key={lvl} onSelect={() => setLevel(lvl)}>
              {({ isFocused }) => (
                <View
                  style={[
                    styles.levelPill,
                    isSelected && styles.levelPillSelected,
                    isFocused && styles.levelPillFocused
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Explain level: ${lvl}. ${isSelected ? 'Selected' : ''}`}
                >
                  <Text
                    style={[
                      styles.levelPillText,
                      isSelected && styles.levelPillTextSelected,
                      isFocused && styles.levelPillTextFocused
                    ]}
                  >
                    {label}
                  </Text>
                </View>
              )}
            </SpatialNavigationFocusableView>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00E5FF" />
          <Text style={styles.loadingText}>Analyzing play mechanics...</Text>
        </View>
      ) : explainData ? (
        <SpatialNavigationScrollView style={styles.scrollArea}>
          <View style={styles.card}>
            <View style={styles.badgeRow}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>MODE: {explainData.level.toUpperCase()}</Text>
              </View>
              {explainData.keyPlayer && (
                <Text style={styles.playerTag}>Player: {explainData.keyPlayer}</Text>
              )}
            </View>

            <Text
              style={[
                styles.explanationText,
                {
                  fontSize: scaledPixels(16 * fontScale),
                  lineHeight: scaledPixels(24 * fontScale)
                }
              ]}
            >
              {explainData.explanation}
            </Text>

            {explainData.ruleSnippet && (
              <View style={styles.ruleBox}>
                <Text style={styles.ruleBoxTitle}>📋 Referee / Rule Breakdown</Text>
                <Text style={styles.ruleBoxContent}>{explainData.ruleSnippet}</Text>
              </View>
            )}

            {explainData.tacticalNote && (
              <View style={styles.tacticalBox}>
                <Text style={styles.tacticalBoxTitle}>🧠 Tactical Pundit Note</Text>
                <Text style={styles.tacticalBoxContent}>{explainData.tacticalNote}</Text>
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
  levelSelectorRow: {
    flexDirection: 'row',
    gap: scaledPixels(10),
    marginBottom: scaledPixels(16)
  },
  levelPill: {
    paddingVertical: scaledPixels(8),
    paddingHorizontal: scaledPixels(18),
    borderRadius: scaledPixels(20),
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  levelPillSelected: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8'
  },
  levelPillFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: '#38BDF8',
    transform: [{ scale: 1.06 }],
    shadowColor: '#38BDF8',
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6
  },
  levelPillText: {
    color: '#94A3B8',
    fontSize: scaledPixels(13),
    fontWeight: '700'
  },
  levelPillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800'
  },
  levelPillTextFocused: {
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
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: scaledPixels(14),
    padding: scaledPixels(18),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scaledPixels(12)
  },
  levelBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    paddingHorizontal: scaledPixels(8),
    paddingVertical: scaledPixels(4),
    borderRadius: scaledPixels(6)
  },
  levelBadgeText: {
    color: '#38BDF8',
    fontSize: scaledPixels(11),
    fontWeight: '800'
  },
  playerTag: {
    color: '#E2E8F0',
    fontSize: scaledPixels(13),
    fontWeight: '700'
  },
  explanationText: {
    color: '#F8FAFC',
    fontWeight: '500',
    marginBottom: scaledPixels(16)
  },
  ruleBox: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: scaledPixels(10),
    padding: scaledPixels(14),
    marginBottom: scaledPixels(12),
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B'
  },
  ruleBoxTitle: {
    color: '#FBBF24',
    fontSize: scaledPixels(12),
    fontWeight: '800',
    marginBottom: scaledPixels(4)
  },
  ruleBoxContent: {
    color: '#CBD5E1',
    fontSize: scaledPixels(13),
    lineHeight: scaledPixels(19)
  },
  tacticalBox: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: scaledPixels(10),
    padding: scaledPixels(14),
    borderLeftWidth: 3,
    borderLeftColor: '#10B981'
  },
  tacticalBoxTitle: {
    color: '#34D399',
    fontSize: scaledPixels(12),
    fontWeight: '800',
    marginBottom: scaledPixels(4)
  },
  tacticalBoxContent: {
    color: '#CBD5E1',
    fontSize: scaledPixels(13),
    lineHeight: scaledPixels(19)
  }
});

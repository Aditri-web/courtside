import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SpatialNavigationFocusableView, SpatialNavigationScrollView } from 'react-tv-space-navigation';
import { aiClient } from './aiClient';
import { AskResult } from './types';
import { useProfile } from './ProfileContext';
import { isSpeechAvailable, startListening } from './platform/speech';
import { scaledPixels } from '../hooks/useScale';

interface AskTabProps {
  currentTime: number;
  onSeek: (tSec: number) => void;
}

const SUGGESTED_CHIPS = [
  'Who scored the first goal?',
  'Why did Bernardo Silva get booked?',
  'What was the VAR decision on Havertz?',
  'Who scored the stoppage time winner?',
  'Who will win the Premier League title?'
];

export const AskTab: React.FC<AskTabProps> = ({ currentTime, onSeek }) => {
  const { profile } = useProfile();
  const [activeQuestion, setActiveQuestion] = useState<string>('');
  const [result, setResult] = useState<AskResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  const ask = useCallback(async (question: string) => {
    setActiveQuestion(question);
    setLoading(true);
    try {
      const res = await aiClient.askQuestion(question, currentTime, profile.level);
      setResult(res);
    } catch (err) {
      console.error('[AskTab] error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentTime, profile.level]);

  const handleVoiceInput = () => {
    if (!isSpeechAvailable()) {
      // Simulate speech question for demo if browser speech is unavailable
      ask('Who scored the first goal?');
      return;
    }

    setIsListening(true);
    const stop = startListening({
      onResult: (transcript) => {
        setIsListening(false);
        ask(transcript);
      },
      onError: (err) => {
        console.warn('Voice recognition error:', err);
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      }
    });
  };

  const fontScale = profile.fontSizeScale || 1.0;

  return (
    <View style={styles.container}>
      {/* Voice / Quick Action bar */}
      <View style={styles.voiceBar}>
        <SpatialNavigationFocusableView onSelect={handleVoiceInput}>
          {({ isFocused }) => (
            <View
              style={[
                styles.voiceButton,
                isListening && styles.voiceButtonListening,
                isFocused && styles.voiceButtonFocused
              ]}
              accessibilityRole="button"
              accessibilityLabel="Ask CourtSide with Voice"
            >
              <Text style={[styles.voiceButtonText, isFocused && styles.voiceButtonTextFocused]}>
                {isListening ? '🎙️ Listening to Voice...' : '🎤 Ask with Alexa / Voice'}
              </Text>
            </View>
          )}
        </SpatialNavigationFocusableView>
      </View>

      <Text style={styles.chipsSectionTitle}>💬 Quick Question Chips:</Text>

      {/* Suggested question chips */}
      <View style={styles.chipsRow}>
        {SUGGESTED_CHIPS.map((chip, idx) => (
          <SpatialNavigationFocusableView key={idx} onSelect={() => ask(chip)}>
            {({ isFocused }) => (
              <View
                style={[styles.chip, isFocused && styles.chipFocused]}
                accessibilityRole="button"
                accessibilityLabel={`Ask question: ${chip}`}
              >
                <Text style={[styles.chipText, isFocused && styles.chipTextFocused]}>
                  {chip}
                </Text>
              </View>
            )}
          </SpatialNavigationFocusableView>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00E5FF" />
          <Text style={styles.loadingText}>Searching grounded match data...</Text>
        </View>
      ) : result ? (
        <SpatialNavigationScrollView style={styles.scrollArea}>
          <View style={styles.answerCard}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionLabel}>QUESTION:</Text>
              <Text style={styles.questionText}>"{result.question}"</Text>
            </View>

            <View style={styles.answerBody}>
              <View style={styles.statusBadgeRow}>
                <View
                  style={[
                    styles.groundedBadge,
                    { backgroundColor: result.grounded ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }
                  ]}
                >
                  <Text
                    style={[
                      styles.groundedBadgeText,
                      { color: result.grounded ? '#10B981' : '#EF4444' }
                    ]}
                  >
                    {result.grounded ? '✓ GROUNDED IN MATCH DATA' : '⚠️ UNANSWERABLE QUERY'}
                  </Text>
                </View>

                {result.sources.length > 0 && (
                  <Text style={styles.sourcesTag}>
                    Sources: {result.sources.join(', ')}
                  </Text>
                )}
              </View>

              <Text
                style={[
                  styles.answerText,
                  {
                    fontSize: scaledPixels(16 * fontScale),
                    lineHeight: scaledPixels(24 * fontScale)
                  }
                ]}
              >
                {result.answer}
              </Text>

              {result.suggestedFollowUps && result.suggestedFollowUps.length > 0 && (
                <View style={styles.followUpContainer}>
                  <Text style={styles.followUpTitle}>Suggested Follow-Ups:</Text>
                  {result.suggestedFollowUps.map((fu, fIdx) => (
                    <SpatialNavigationFocusableView key={fIdx} onSelect={() => ask(fu)}>
                      {({ isFocused }) => (
                        <View style={[styles.followUpPill, isFocused && styles.chipFocused]}>
                          <Text style={[styles.followUpText, isFocused && styles.chipTextFocused]}>
                            👉 {fu}
                          </Text>
                        </View>
                      )}
                    </SpatialNavigationFocusableView>
                  ))}
                </View>
              )}
            </View>
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
  voiceBar: {
    marginBottom: scaledPixels(16)
  },
  voiceButton: {
    backgroundColor: 'rgba(14, 165, 233, 0.2)',
    borderColor: '#0284C7',
    borderWidth: 2,
    borderRadius: scaledPixels(10),
    paddingVertical: scaledPixels(12),
    paddingHorizontal: scaledPixels(18),
    alignItems: 'center'
  },
  voiceButtonListening: {
    backgroundColor: '#EF4444',
    borderColor: '#F87171'
  },
  voiceButtonFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: '#38BDF8',
    transform: [{ scale: 1.03 }],
    shadowColor: '#38BDF8',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8
  },
  voiceButtonText: {
    color: '#38BDF8',
    fontSize: scaledPixels(14),
    fontWeight: '800'
  },
  voiceButtonTextFocused: {
    color: '#0F172A',
    fontWeight: '900'
  },
  chipsSectionTitle: {
    color: '#94A3B8',
    fontSize: scaledPixels(12),
    fontWeight: '700',
    marginBottom: scaledPixels(8)
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scaledPixels(8),
    marginBottom: scaledPixels(16)
  },
  chip: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: scaledPixels(18),
    paddingVertical: scaledPixels(7),
    paddingHorizontal: scaledPixels(14),
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  chipFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: '#38BDF8',
    transform: [{ scale: 1.05 }],
    shadowColor: '#38BDF8',
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6
  },
  chipText: {
    color: '#CBD5E1',
    fontSize: scaledPixels(12),
    fontWeight: '600'
  },
  chipTextFocused: {
    color: '#0F172A',
    fontWeight: '800'
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
  answerCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: scaledPixels(14),
    padding: scaledPixels(16),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  questionHeader: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: scaledPixels(10),
    marginBottom: scaledPixels(12)
  },
  questionLabel: {
    color: '#64748B',
    fontSize: scaledPixels(11),
    fontWeight: '800'
  },
  questionText: {
    color: '#F8FAFC',
    fontSize: scaledPixels(15),
    fontWeight: '700',
    marginTop: scaledPixels(2)
  },
  answerBody: {},
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: scaledPixels(12)
  },
  groundedBadge: {
    paddingHorizontal: scaledPixels(8),
    paddingVertical: scaledPixels(4),
    borderRadius: scaledPixels(6)
  },
  groundedBadgeText: {
    fontSize: scaledPixels(11),
    fontWeight: '800'
  },
  sourcesTag: {
    color: '#94A3B8',
    fontSize: scaledPixels(11),
    fontWeight: '600'
  },
  answerText: {
    color: '#FFFFFF',
    fontWeight: '500'
  },
  followUpContainer: {
    marginTop: scaledPixels(16),
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: scaledPixels(12)
  },
  followUpTitle: {
    color: '#94A3B8',
    fontSize: scaledPixels(12),
    fontWeight: '700',
    marginBottom: scaledPixels(8)
  },
  followUpPill: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: scaledPixels(12),
    paddingVertical: scaledPixels(6),
    paddingHorizontal: scaledPixels(12),
    marginBottom: scaledPixels(6)
  },
  followUpText: {
    color: '#E2E8F0',
    fontSize: scaledPixels(12),
    fontWeight: '600'
  }
});

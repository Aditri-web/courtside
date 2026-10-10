import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MatchEvent } from './types';
import { SHARED_MATCH_EVENTS, CURRENT_FEATURED_MATCH } from './staticData';
import { scaledPixels } from '../hooks/useScale';

interface LiveOverlayProps {
  currentTime: number;
  onExplainEvent?: (event: MatchEvent) => void;
}

export const LiveOverlay: React.FC<LiveOverlayProps> = ({ currentTime }) => {
  const [activeEvent, setActiveEvent] = useState<MatchEvent | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const lastEventIdRef = useRef<string | null>(null);
  const dismissTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Compute live score from visible goals
  const currentScore = SHARED_MATCH_EVENTS
    .filter((ev) => ev.tSec <= currentTime && ev.type === 'goal')
    .reduce(
      (acc, ev) => {
        if (ev.team === CURRENT_FEATURED_MATCH.home.name) {
          return { home: acc.home + 1, away: acc.away };
        }
        return { home: acc.home, away: acc.away + 1 };
      },
      { home: 0, away: 0 }
    );

  // Format playback time as a match clock string
  const matchMinute = Math.floor(currentTime / 60);
  const matchClockStr =
    currentTime <= 0
      ? 'PRE'
      : matchMinute >= 90
      ? `90+${matchMinute - 90}'`
      : `${matchMinute}'`;

  useEffect(() => {
    const matched = SHARED_MATCH_EVENTS.find(
      (ev) => currentTime >= ev.tSec && currentTime <= ev.tSec + 4.5
    );

    if (matched && matched.id !== lastEventIdRef.current) {
      lastEventIdRef.current = matched.id;
      setActiveEvent(matched);

      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true })
      ]).start();

      if (dismissTimeoutRef.current) clearTimeout(dismissTimeoutRef.current);

      dismissTimeoutRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: -50, duration: 300, useNativeDriver: true })
        ]).start(() => setActiveEvent(null));
      }, 5000);
    }
  }, [currentTime, fadeAnim, slideAnim]);

  const isGoal = activeEvent?.type === 'goal';
  const isCard = activeEvent?.type === 'card';
  const isVar = activeEvent?.type === 'var_decision';
  const badgeColor = isGoal ? '#00E676' : isCard ? '#FFD600' : isVar ? '#00E5FF' : '#FF9100';
  const badgeLabel = isGoal ? '⚽ GOAL!' : isCard ? '🟨 CARD' : isVar ? '📺 VAR' : '⚡ EVENT';

  return (
    <>
      {/* ── Persistent Score Ticker — top-left, always visible ── */}
      <View
        pointerEvents="none"
        style={styles.scoreTicker}
        accessibilityRole="text"
        accessibilityLabel={`Score: ${CURRENT_FEATURED_MATCH.home.shortName} ${currentScore.home} - ${currentScore.away} ${CURRENT_FEATURED_MATCH.away.shortName}`}
      >
        <View style={styles.scoreTickerInner}>
          <Text style={styles.scoreTickerTeam}>{CURRENT_FEATURED_MATCH.home.shortName}</Text>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreBoxText}>
              {currentScore.home} — {currentScore.away}
            </Text>
          </View>
          <Text style={styles.scoreTickerTeam}>{CURRENT_FEATURED_MATCH.away.shortName}</Text>
          <View style={styles.clockPill}>
            <View style={styles.liveDot} />
            <Text style={styles.clockPillText}>{matchClockStr}</Text>
          </View>
        </View>
      </View>

      {/* ── Transient event toast — top-right, animated ── */}
      {activeEvent && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.eventToast,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
          accessibilityRole="alert"
          accessibilityLabel={`Live alert: ${activeEvent.clock} ${activeEvent.description}`}
        >
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <View style={[styles.badge, { backgroundColor: badgeColor }]}>
                <Text style={styles.badgeText}>{badgeLabel}</Text>
              </View>
              <Text style={styles.clockText}>{activeEvent.clock}</Text>
              <Text style={styles.scoreText}>
                {activeEvent.score.home} - {activeEvent.score.away}
              </Text>
            </View>

            <Text style={styles.description} numberOfLines={2}>
              {activeEvent.description}
            </Text>

            <View style={styles.footerRow}>
              <Text style={styles.hintText}>
                💡 Press Companion [Explain] for tactical breakdown
              </Text>
            </View>
          </View>
        </Animated.View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  // ── Score ticker ──────────────────────────────
  scoreTicker: {
    position: 'absolute',
    top: scaledPixels(24),
    left: scaledPixels(40),
    zIndex: 998
  },
  scoreTickerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.90)',
    borderRadius: scaledPixels(10),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: scaledPixels(14),
    paddingVertical: scaledPixels(8),
    gap: scaledPixels(10)
  },
  scoreTickerTeam: {
    color: '#CBD5E1',
    fontSize: scaledPixels(12),
    fontWeight: '800',
    letterSpacing: 0.5
  },
  scoreBox: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: scaledPixels(6),
    paddingHorizontal: scaledPixels(10),
    paddingVertical: scaledPixels(4)
  },
  scoreBoxText: {
    color: '#FFFFFF',
    fontSize: scaledPixels(14),
    fontWeight: '900',
    letterSpacing: 1
  },
  clockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: scaledPixels(8),
    gap: scaledPixels(4)
  },
  liveDot: {
    width: scaledPixels(6),
    height: scaledPixels(6),
    borderRadius: scaledPixels(3),
    backgroundColor: '#EF4444'
  },
  clockPillText: {
    color: '#94A3B8',
    fontSize: scaledPixels(11),
    fontWeight: '700'
  },
  // ── Event toast ───────────────────────────────
  eventToast: {
    position: 'absolute',
    top: scaledPixels(32),
    right: scaledPixels(40),
    zIndex: 999,
    width: scaledPixels(420)
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    borderRadius: scaledPixels(14),
    padding: scaledPixels(16),
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaledPixels(8)
  },
  badge: {
    paddingHorizontal: scaledPixels(10),
    paddingVertical: scaledPixels(4),
    borderRadius: scaledPixels(6),
    marginRight: scaledPixels(10)
  },
  badgeText: {
    color: '#000',
    fontSize: scaledPixels(12),
    fontWeight: '900',
    letterSpacing: 0.5
  },
  clockText: {
    color: '#94A3B8',
    fontSize: scaledPixels(14),
    fontWeight: '700',
    marginRight: scaledPixels(12)
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: scaledPixels(15),
    fontWeight: '800',
    marginLeft: 'auto'
  },
  description: {
    color: '#F1F5F9',
    fontSize: scaledPixels(14),
    lineHeight: scaledPixels(20),
    fontWeight: '500',
    marginBottom: scaledPixels(8)
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: scaledPixels(8)
  },
  hintText: {
    color: '#38BDF8',
    fontSize: scaledPixels(11),
    fontWeight: '600'
  }
});

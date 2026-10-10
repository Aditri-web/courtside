import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MatchEvent } from './types';
import { SHARED_MATCH_EVENTS } from './staticData';
import { scaledPixels } from '../hooks/useScale';

interface LiveOverlayProps {
  currentTime: number;
  onExplainEvent?: (event: MatchEvent) => void;
}

export const LiveOverlay: React.FC<LiveOverlayProps> = ({ currentTime, onExplainEvent }) => {
  const [activeEvent, setActiveEvent] = useState<MatchEvent | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const lastEventIdRef = useRef<string | null>(null);
  const dismissTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if currentTime is within [tSec, tSec + 3] of an event
    const matched = SHARED_MATCH_EVENTS.find(
      (ev) => currentTime >= ev.tSec && currentTime <= ev.tSec + 4.5
    );

    if (matched && matched.id !== lastEventIdRef.current) {
      lastEventIdRef.current = matched.id;
      setActiveEvent(matched);

      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true
        })
      ]).start();

      if (dismissTimeoutRef.current) {
        clearTimeout(dismissTimeoutRef.current);
      }

      // Auto dismiss after 5 seconds
      dismissTimeoutRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true
          }),
          Animated.timing(slideAnim, {
            toValue: -50,
            duration: 300,
            useNativeDriver: true
          })
        ]).start(() => {
          setActiveEvent(null);
        });
      }, 5000);
    }
  }, [currentTime]);

  if (!activeEvent) return null;

  const isGoal = activeEvent.type === 'goal';
  const isCard = activeEvent.type === 'card';
  const isVar = activeEvent.type === 'var_decision';

  const badgeColor = isGoal ? '#00E676' : isCard ? '#FFD600' : isVar ? '#00E5FF' : '#FF9100';
  const badgeLabel = isGoal ? '⚽ GOAL!' : isCard ? '🟨 CARD' : isVar ? '📺 VAR' : '⚡ EVENT';

  return (
    <Animated.View
      pointerEvents="none" // Never steals remote/D-pad focus!
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
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
          <Text style={styles.hintText}>💡 Press Companion [Explain] to see tactical breakdown</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
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

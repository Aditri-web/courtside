import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SpatialNavigationRoot, SpatialNavigationFocusableView, SpatialNavigationScrollView } from 'react-tv-space-navigation';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { HIGHLIGHTS_LIST, CURRENT_FEATURED_MATCH } from '../companion/staticData';
import { scaledPixels } from '../hooks/useScale';

type HighlightsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HighlightsScreen() {
  const navigation = useNavigation<HighlightsScreenNavigationProp>();

  return (
    <SpatialNavigationRoot>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>⚽ AI Key Highlights & Match Reels</Text>
          <Text style={styles.subtitle}>
            Instantly jump to AI-detected turning points and unforgettable moments
          </Text>
        </View>

        <SpatialNavigationScrollView style={styles.scrollArea}>
          <View style={styles.grid}>
            {HIGHLIGHTS_LIST.map((item) => (
              <SpatialNavigationFocusableView
                key={item.id}
                onSelect={() => {
                  navigation.navigate('Player', {
                    movie: CURRENT_FEATURED_MATCH.videoUrl,
                    headerImage: item.image
                  });
                }}
              >
                {({ isFocused }) => (
                  <View
                    style={[styles.card, isFocused && styles.cardFocused]}
                    accessibilityRole="button"
                    accessibilityLabel={`Highlight: ${item.title}. Duration: ${item.duration}. Press select to play.`}
                  >
                    <Image source={{ uri: item.image }} style={styles.thumbnail} />
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                    <View style={styles.durationPill}>
                      <Text style={styles.durationText}>{item.duration}</Text>
                    </View>

                    <View style={styles.cardInfo}>
                      <Text style={[styles.cardTitle, isFocused && styles.cardTitleFocused]} numberOfLines={2}>
                        {item.title}
                      </Text>
                      <Text style={styles.cardMatch}>{item.match}</Text>
                      {isFocused && (
                        <Text style={styles.playHint}>▶ Press [SELECT] to Watch Clip</Text>
                      )}
                    </View>
                  </View>
                )}
              </SpatialNavigationFocusableView>
            ))}
          </View>
        </SpatialNavigationScrollView>
      </View>
    </SpatialNavigationRoot>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: scaledPixels(32)
  },
  header: {
    marginBottom: scaledPixels(24)
  },
  title: {
    color: '#00E5FF',
    fontSize: scaledPixels(28),
    fontWeight: '900',
    letterSpacing: 0.5
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: scaledPixels(15),
    fontWeight: '500',
    marginTop: scaledPixels(6)
  },
  scrollArea: {
    flex: 1
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scaledPixels(20),
    paddingBottom: scaledPixels(40)
  },
  card: {
    width: scaledPixels(340),
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: scaledPixels(14),
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    position: 'relative'
  },
  cardFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: '#00E5FF',
    transform: [{ scale: 1.05 }],
    shadowColor: '#00E5FF',
    shadowOpacity: 0.9,
    shadowRadius: 14,
    elevation: 10
  },
  thumbnail: {
    width: '100%',
    height: scaledPixels(190),
    backgroundColor: '#1E293B'
  },
  badge: {
    position: 'absolute',
    top: scaledPixels(12),
    left: scaledPixels(12),
    backgroundColor: 'rgba(0, 229, 255, 0.9)',
    paddingHorizontal: scaledPixels(8),
    paddingVertical: scaledPixels(4),
    borderRadius: scaledPixels(4)
  },
  badgeText: {
    color: '#000000',
    fontSize: scaledPixels(10),
    fontWeight: '900'
  },
  durationPill: {
    position: 'absolute',
    top: scaledPixels(12),
    right: scaledPixels(12),
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: scaledPixels(8),
    paddingVertical: scaledPixels(4),
    borderRadius: scaledPixels(4)
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: scaledPixels(11),
    fontWeight: '700'
  },
  cardInfo: {
    padding: scaledPixels(14)
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: scaledPixels(15),
    fontWeight: '700',
    marginBottom: scaledPixels(4)
  },
  cardTitleFocused: {
    color: '#0F172A',
    fontWeight: '900'
  },
  cardMatch: {
    color: '#64748B',
    fontSize: scaledPixels(12),
    fontWeight: '600'
  },
  playHint: {
    color: '#0284C7',
    fontSize: scaledPixels(12),
    fontWeight: '800',
    marginTop: scaledPixels(6)
  }
});

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SpatialNavigationRoot, SpatialNavigationFocusableView, SpatialNavigationScrollView } from 'react-tv-space-navigation';
import { useProfile } from '../companion/ProfileContext';
import { FAMILY_PICKS } from '../companion/staticData';
import { scaledPixels } from '../hooks/useScale';

export default function FamilyScreen() {
  const { profile, setMode } = useProfile();
  const isFamily = profile.mode === 'family';

  return (
    <SpatialNavigationRoot>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>👨‍👩‍👧 Family Entertainment & Kid Mode</Text>
          <Text style={styles.subtitle}>
            Wholesome sports viewing with simplified storytelling, zero vulgarity, and larger 10-foot TV fonts
          </Text>
        </View>

        {/* Toggle Family Mode Button */}
        <View style={styles.toggleSection}>
          <SpatialNavigationFocusableView onSelect={() => setMode(isFamily ? 'standard' : 'family')}>
            {({ isFocused }) => (
              <View
                style={[
                  styles.toggleBtn,
                  isFamily ? styles.toggleBtnActive : styles.toggleBtnInactive,
                  isFocused && styles.toggleBtnFocused
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Family Mode toggle. Currently ${isFamily ? 'Enabled' : 'Disabled'}. Press to switch.`}
              >
                <Text style={[styles.toggleBtnText, isFocused && styles.toggleBtnTextFocused]}>
                  {isFamily ? '✓ Family Mode is ACTIVE (Kid-Friendly)' : '➕ Switch to Family Mode'}
                </Text>
              </View>
            )}
          </SpatialNavigationFocusableView>

          <View style={styles.statusPills}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>👶 Kid-Safe Explanations: {isFamily ? 'ON' : 'Optional'}</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>🛡️ Spoilers Protected: {isFamily ? 'ALWAYS' : 'Configurable'}</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>🔍 10-Foot Big Font Scale: {isFamily ? '+25%' : 'Standard'}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionHeader}>⭐ Curated Family Sports Picks:</Text>

        <SpatialNavigationScrollView style={styles.scrollArea}>
          <View style={styles.grid}>
            {FAMILY_PICKS.map((item) => (
              <SpatialNavigationFocusableView key={item.id} onSelect={() => {}}>
                {({ isFocused }) => (
                  <View style={[styles.card, isFocused && styles.cardFocused]}>
                    <Image source={{ uri: item.image }} style={styles.cardImage} />
                    <View style={styles.cardCategoryBadge}>
                      <Text style={styles.cardCategoryText}>{item.category}</Text>
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={[styles.cardTitle, isFocused && styles.cardTitleFocused]}>
                        {item.title}
                      </Text>
                      <Text style={styles.cardDesc}>{item.description}</Text>
                      <Text style={styles.cardDuration}>⏱️ {item.duration}</Text>
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
    marginBottom: scaledPixels(20)
  },
  title: {
    color: '#34D399',
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
  toggleSection: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: scaledPixels(14),
    padding: scaledPixels(18),
    marginBottom: scaledPixels(24),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  toggleBtn: {
    paddingVertical: scaledPixels(12),
    paddingHorizontal: scaledPixels(20),
    borderRadius: scaledPixels(8),
    borderWidth: 2,
    borderColor: 'transparent',
    alignSelf: 'flex-start',
    marginBottom: scaledPixels(14)
  },
  toggleBtnActive: {
    backgroundColor: '#10B981',
    borderColor: '#34D399'
  },
  toggleBtnInactive: {
    backgroundColor: 'rgba(51, 65, 85, 0.8)',
    borderColor: '#64748B'
  },
  toggleBtnFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: '#34D399',
    transform: [{ scale: 1.05 }],
    shadowColor: '#34D399',
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8
  },
  toggleBtnText: {
    color: '#FFFFFF',
    fontSize: scaledPixels(15),
    fontWeight: '800'
  },
  toggleBtnTextFocused: {
    color: '#0F172A',
    fontWeight: '900'
  },
  statusPills: {
    flexDirection: 'row',
    gap: scaledPixels(10),
    flexWrap: 'wrap'
  },
  pill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: scaledPixels(6),
    paddingHorizontal: scaledPixels(12),
    borderRadius: scaledPixels(12)
  },
  pillText: {
    color: '#CBD5E1',
    fontSize: scaledPixels(12),
    fontWeight: '600'
  },
  sectionHeader: {
    color: '#F8FAFC',
    fontSize: scaledPixels(18),
    fontWeight: '800',
    marginBottom: scaledPixels(14)
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
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  cardFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: '#34D399',
    transform: [{ scale: 1.05 }],
    shadowColor: '#34D399',
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 10
  },
  cardImage: {
    width: '100%',
    height: scaledPixels(180),
    backgroundColor: '#1E293B'
  },
  cardCategoryBadge: {
    position: 'absolute',
    top: scaledPixels(12),
    left: scaledPixels(12),
    backgroundColor: '#10B981',
    paddingHorizontal: scaledPixels(8),
    paddingVertical: scaledPixels(4),
    borderRadius: scaledPixels(4)
  },
  cardCategoryText: {
    color: '#000000',
    fontSize: scaledPixels(10),
    fontWeight: '900'
  },
  cardContent: {
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
  cardDesc: {
    color: '#94A3B8',
    fontSize: scaledPixels(12),
    lineHeight: scaledPixels(17),
    marginBottom: scaledPixels(8)
  },
  cardDuration: {
    color: '#34D399',
    fontSize: scaledPixels(11),
    fontWeight: '700'
  }
});

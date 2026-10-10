import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SpatialNavigationFocusableView } from 'react-tv-space-navigation';
import { CatchUpTab } from './CatchUpTab';
import { ExplainTab } from './ExplainTab';
import { MomentsTab } from './MomentsTab';
import { AskTab } from './AskTab';
import { useProfile } from './ProfileContext';
import { scaledPixels } from '../hooks/useScale';

export type CompanionTabId = 'catchup' | 'explain' | 'moments' | 'ask';

interface CompanionPanelProps {
  currentTime: number;
  onSeek: (tSec: number) => void;
  onClose?: () => void;
  initialTab?: CompanionTabId;
}

export const CompanionPanel: React.FC<CompanionPanelProps> = ({
  currentTime,
  onSeek,
  onClose,
  initialTab = 'catchup'
}) => {
  const [activeTab, setActiveTab] = useState<CompanionTabId>(initialTab);
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>();
  const { profile } = useProfile();

  const tabs: { id: CompanionTabId; label: string; icon: string; ariaLabel: string }[] = [
    { id: 'catchup', label: 'Catch Up', icon: '⚡', ariaLabel: 'Catch Me Up recap tab' },
    { id: 'explain', label: 'Explain', icon: '🧠', ariaLabel: 'Explain This play breakdown tab' },
    { id: 'moments', label: 'Moments', icon: '🎯', ariaLabel: 'Key Moments AI ranking tab' },
    { id: 'ask', label: 'Ask AI', icon: '💬', ariaLabel: 'Ask CourtSide grounded Q and A tab' }
  ];

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.brandTitle}>COURTSIDE</Text>
          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>AI COMPANION</Text>
          </View>
          {profile.mode === 'family' && (
            <View style={styles.familyBadge}>
              <Text style={styles.familyBadgeText}>FAMILY MODE</Text>
            </View>
          )}
        </View>

        {onClose && (
          <SpatialNavigationFocusableView onSelect={onClose}>
            {({ isFocused }) => (
              <View
                style={[styles.closeButton, isFocused && styles.closeButtonFocused]}
                accessibilityRole="button"
                accessibilityLabel="Close CourtSide companion and return focus to match video"
              >
                <Text style={[styles.closeButtonText, isFocused && styles.closeButtonTextFocused]}>
                  ✕ Back to Player
                </Text>
              </View>
            )}
          </SpatialNavigationFocusableView>
        )}
      </View>

      {/* Tabs navigation row */}
      <View style={styles.tabsRow}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <SpatialNavigationFocusableView key={tab.id} onSelect={() => setActiveTab(tab.id)}>
              {({ isFocused }) => (
                <View
                  style={[
                    styles.tabButton,
                    isActive && styles.tabButtonActive,
                    isFocused && styles.tabButtonFocused
                  ]}
                  accessibilityRole="tab"
                  accessibilityLabel={tab.ariaLabel}
                  accessibilityState={{ selected: isActive }}
                >
                  <Text style={styles.tabIcon}>{tab.icon}</Text>
                  <Text
                    style={[
                      styles.tabLabel,
                      isActive && styles.tabLabelActive,
                      isFocused && styles.tabLabelFocused
                    ]}
                  >
                    {tab.label}
                  </Text>
                </View>
              )}
            </SpatialNavigationFocusableView>
          );
        })}
      </View>

      {/* Tab Content Body */}
      <View style={styles.body}>
        {activeTab === 'catchup' && <CatchUpTab currentTime={currentTime} />}
        {activeTab === 'explain' && (
          <ExplainTab currentTime={currentTime} selectedEventId={selectedEventId} />
        )}
        {activeTab === 'moments' && (
          <MomentsTab
            onSeek={onSeek}
            onSelectMoment={(eventId) => {
              setSelectedEventId(eventId);
              setActiveTab('explain');
            }}
          />
        )}
        {activeTab === 'ask' && <AskTab currentTime={currentTime} onSeek={onSeek} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: scaledPixels(500),
    height: '100%',
    backgroundColor: 'rgba(10, 15, 29, 0.96)',
    borderLeftWidth: 1.5,
    borderLeftColor: 'rgba(56, 189, 248, 0.3)',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scaledPixels(18),
    paddingTop: scaledPixels(16),
    paddingBottom: scaledPixels(12),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)'
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaledPixels(8)
  },
  brandTitle: {
    color: '#00E5FF',
    fontSize: scaledPixels(18),
    fontWeight: '900',
    letterSpacing: 1.2
  },
  aiBadge: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    paddingHorizontal: scaledPixels(6),
    paddingVertical: scaledPixels(3),
    borderRadius: scaledPixels(4),
    borderWidth: 1,
    borderColor: '#00E5FF'
  },
  aiBadgeText: {
    color: '#00E5FF',
    fontSize: scaledPixels(9),
    fontWeight: '800'
  },
  familyBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: scaledPixels(6),
    paddingVertical: scaledPixels(3),
    borderRadius: scaledPixels(4)
  },
  familyBadgeText: {
    color: '#34D399',
    fontSize: scaledPixels(9),
    fontWeight: '800'
  },
  closeButton: {
    paddingVertical: scaledPixels(6),
    paddingHorizontal: scaledPixels(12),
    borderRadius: scaledPixels(6),
    backgroundColor: 'rgba(255, 255, 255, 0.06)'
  },
  closeButtonFocused: {
    backgroundColor: '#FFFFFF',
    transform: [{ scale: 1.05 }]
  },
  closeButtonText: {
    color: '#94A3B8',
    fontSize: scaledPixels(12),
    fontWeight: '700'
  },
  closeButtonTextFocused: {
    color: '#0F172A',
    fontWeight: '900'
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: scaledPixels(12),
    paddingVertical: scaledPixels(10),
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    gap: scaledPixels(8)
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scaledPixels(8),
    paddingHorizontal: scaledPixels(6),
    borderRadius: scaledPixels(8),
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: scaledPixels(4)
  },
  tabButtonActive: {
    backgroundColor: 'rgba(2, 132, 199, 0.35)',
    borderColor: '#0284C7'
  },
  tabButtonFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: '#38BDF8',
    transform: [{ scale: 1.06 }],
    shadowColor: '#38BDF8',
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6
  },
  tabIcon: {
    fontSize: scaledPixels(13)
  },
  tabLabel: {
    color: '#94A3B8',
    fontSize: scaledPixels(12),
    fontWeight: '700'
  },
  tabLabelActive: {
    color: '#38BDF8',
    fontWeight: '800'
  },
  tabLabelFocused: {
    color: '#0F172A',
    fontWeight: '900'
  },
  body: {
    flex: 1
  }
});

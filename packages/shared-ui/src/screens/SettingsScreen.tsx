import { StyleSheet, View, Text } from 'react-native';
import {
  SpatialNavigationRoot,
  SpatialNavigationNode,
  SpatialNavigationScrollView,
  DefaultFocus,
} from 'react-tv-space-navigation';
import { DrawerActions, useIsFocused, useNavigation } from '@react-navigation/native';
import { Direction } from '@bam.tech/lrud';
import { scaledPixels } from '../hooks/useScale';
import FocusablePressable from '../components/FocusablePressable';
import { useCallback, useState } from 'react';
import { useMenuContext } from '../components/MenuContext';
import { getOpenDrawerDirection } from '../utils/rtl';
import { useProfile } from '../companion/ProfileContext';

export default function SettingsScreen() {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const { isOpen: isMenuOpen, toggleMenu } = useMenuContext();
  const { profile, toggleSpoilers, setLevel, setMode, setFontScale, aiServiceUrl, setAiServiceUrl } = useProfile();
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'checking' | 'online' | 'offline'>('idle');

  const checkConnection = async (url: string) => {
    setConnectionStatus('checking');
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${url}/health`, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        setConnectionStatus('online');
      } else {
        setConnectionStatus('offline');
      }
    } catch {
      setConnectionStatus('offline');
    }
  };

  const onDirectionHandledWithoutMovement = useCallback(
    (movement: Direction) => {
      if (movement === getOpenDrawerDirection()) {
        navigation.dispatch(DrawerActions.openDrawer());
        toggleMenu(true);
      }
    },
    [toggleMenu, navigation],
  );

  return (
    <SpatialNavigationRoot
      isActive={isFocused && !isMenuOpen}
      onDirectionHandledWithoutMovement={onDirectionHandledWithoutMovement}
    >
      <View style={styles.container}>
        <View style={styles.innerContainer}>
          <Text style={styles.title}>⚙️ CourtSide Settings & Preferences</Text>
          <SpatialNavigationScrollView style={styles.scrollView}>
            <View style={styles.scrollContent}>
              {/* AI & Spoilers Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🛡️ AI & Spoilers Protection</Text>
                <SpatialNavigationNode orientation="vertical">
                  <View style={styles.optionsColumn}>
                    <DefaultFocus>
                      <FocusablePressable
                        text={`Spoilers Mode: ${profile.spoilers ? '⚠️ Unrestricted (Show Scores)' : '🛡️ Spoiler-Free (Protected)'}`}
                        onSelect={toggleSpoilers}
                        style={styles.toggleButton}
                        accessibilityLabel="Toggle spoiler protection"
                      />
                    </DefaultFocus>
                  </View>
                </SpatialNavigationNode>
              </View>

              {/* Explanation Level Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🧠 Default Explanation Level</Text>
                <SpatialNavigationNode orientation="horizontal">
                  <View style={styles.optionsRow}>
                    {(['kid', 'casual', 'expert'] as const).map((lvl) => (
                      <FocusablePressable
                        key={lvl}
                        text={`${lvl === 'kid' ? '🧒 Kid' : lvl === 'casual' ? '⚽ Casual' : '📊 Expert'} ${profile.level === lvl ? '✓' : ''}`}
                        onSelect={() => setLevel(lvl)}
                        style={[
                          styles.optionButton,
                          profile.level === lvl && styles.selectedOption,
                        ]}
                        accessibilityLabel={`Select ${lvl} level explanation`}
                      />
                    ))}
                  </View>
                </SpatialNavigationNode>
              </View>

              {/* Mode Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>👨‍👩‍👧 Profile Mode</Text>
                <SpatialNavigationNode orientation="horizontal">
                  <View style={styles.optionsRow}>
                    <FocusablePressable
                      text={`Standard Mode ${profile.mode === 'standard' ? '✓' : ''}`}
                      onSelect={() => setMode('standard')}
                      style={[
                        styles.optionButton,
                        profile.mode === 'standard' && styles.selectedOption,
                      ]}
                      accessibilityLabel="Select Standard profile mode"
                    />
                    <FocusablePressable
                      text={`Family Mode ${profile.mode === 'family' ? '✓' : ''}`}
                      onSelect={() => setMode('family')}
                      style={[
                        styles.optionButton,
                        profile.mode === 'family' && styles.selectedOption,
                      ]}
                      accessibilityLabel="Select Family profile mode"
                    />
                  </View>
                </SpatialNavigationNode>
              </View>

              {/* Font Scaling (10-Foot UI) */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📐 10-Foot TV Font Scaling</Text>
                <SpatialNavigationNode orientation="horizontal">
                  <View style={styles.optionsRow}>
                    <FocusablePressable
                      text={`Standard (1.0x) ${profile.fontSizeScale === 1.0 ? '✓' : ''}`}
                      onSelect={() => setFontScale(1.0)}
                      style={[
                        styles.optionButton,
                        profile.fontSizeScale === 1.0 && styles.selectedOption,
                      ]}
                      accessibilityLabel="Set standard font scaling"
                    />
                    <FocusablePressable
                      text={`Large (1.25x) ${profile.fontSizeScale === 1.25 ? '✓' : ''}`}
                      onSelect={() => setFontScale(1.25)}
                      style={[
                        styles.optionButton,
                        profile.fontSizeScale === 1.25 && styles.selectedOption,
                      ]}
                      accessibilityLabel="Set large font scaling for living room viewing"
                    />
                  </View>
                </SpatialNavigationNode>
              </View>

              {/* AI Service Endpoint (Fire TV / LAN Configuration) */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🌐 AI Service Endpoint (Host / LAN IP)</Text>
                <Text style={styles.sectionSubtitle}>
                  On real Fire TV hardware, select your host machine's LAN IP instead of localhost.
                </Text>
                <SpatialNavigationNode orientation="horizontal">
                  <View style={styles.optionsRow}>
                    <FocusablePressable
                      text={`Localhost (4000) ${aiServiceUrl.includes('localhost:4000') ? '✓' : ''}`}
                      onSelect={() => {
                        setAiServiceUrl('http://localhost:4000');
                        checkConnection('http://localhost:4000');
                      }}
                      style={[
                        styles.optionButton,
                        aiServiceUrl.includes('localhost:4000') && styles.selectedOption,
                      ]}
                      accessibilityLabel="Set AI service endpoint to localhost port 4000"
                    />
                    <FocusablePressable
                      text={`Emulator (10.0.2.2) ${aiServiceUrl.includes('10.0.2.2') ? '✓' : ''}`}
                      onSelect={() => {
                        setAiServiceUrl('http://10.0.2.2:4000');
                        checkConnection('http://10.0.2.2:4000');
                      }}
                      style={[
                        styles.optionButton,
                        aiServiceUrl.includes('10.0.2.2') && styles.selectedOption,
                      ]}
                      accessibilityLabel="Set AI service endpoint to Android emulator host 10.0.2.2 port 4000"
                    />
                    <FocusablePressable
                      text={`LAN Host (192.168.1.x) ${aiServiceUrl.includes('192.168.') ? '✓' : ''}`}
                      onSelect={() => {
                        setAiServiceUrl('http://192.168.1.100:4000');
                        checkConnection('http://192.168.1.100:4000');
                      }}
                      style={[
                        styles.optionButton,
                        aiServiceUrl.includes('192.168.') && styles.selectedOption,
                      ]}
                      accessibilityLabel="Set AI service endpoint to LAN IP 192.168.1.100"
                    />
                    <FocusablePressable
                      text={connectionStatus === 'checking' ? '⏳ Testing...' : '🔄 Test Connection'}
                      onSelect={() => checkConnection(aiServiceUrl)}
                      style={styles.testButton}
                      accessibilityLabel="Test connection to AI service"
                    />
                  </View>
                </SpatialNavigationNode>
                <View style={styles.statusRow}>
                  <Text style={styles.activeEndpointText}>Active: {aiServiceUrl}</Text>
                  {connectionStatus === 'online' && (
                    <Text style={styles.statusOnline}>✓ Connected (Service Healthy)</Text>
                  )}
                  {connectionStatus === 'offline' && (
                    <Text style={styles.statusOffline}>⚠️ Unreachable (Using Offline Fallback Engine)</Text>
                  )}
                </View>
              </View>

              {/* AI Service & Build Status */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>ℹ️ CourtSide Architecture Information</Text>
                <View style={styles.infoCard}>
                  <Text style={styles.infoText}>• AI Service Endpoint: {aiServiceUrl}</Text>
                  <Text style={styles.infoText}>• Amazon Devices Builder Tools: MCP Server + Agent Skills Active</Text>
                  <Text style={styles.infoText}>• Target Platforms: Fire OS / Vega OS / Universal TV Web</Text>
                  <Text style={styles.infoText}>• Alexa Voice Navigation: ARIA labels on all key controls</Text>
                  <Text style={styles.infoText}>• Offline Fallback Pack: Active (Zero-failure demo mode)</Text>
                </View>
              </View>
            </View>
          </SpatialNavigationScrollView>
        </View>
      </View>
    </SpatialNavigationRoot>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  innerContainer: {
    flex: 1,
    paddingTop: scaledPixels(40),
    paddingHorizontal: scaledPixels(48),
  },
  title: {
    fontSize: scaledPixels(32),
    fontWeight: 'bold',
    color: '#00E5FF',
    marginBottom: scaledPixels(24),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: scaledPixels(40),
  },
  section: {
    marginBottom: scaledPixels(28),
  },
  sectionTitle: {
    fontSize: scaledPixels(18),
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: scaledPixels(12),
  },
  optionsRow: {
    flexDirection: 'row',
    gap: scaledPixels(12),
  },
  optionsColumn: {
    gap: scaledPixels(12),
  },
  optionButton: {
    minWidth: scaledPixels(150),
    paddingVertical: scaledPixels(12),
    paddingHorizontal: scaledPixels(20),
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: scaledPixels(8),
  },
  selectedOption: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  toggleButton: {
    paddingVertical: scaledPixels(14),
    paddingHorizontal: scaledPixels(24),
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: scaledPixels(8),
    alignSelf: 'flex-start',
  },
  sectionSubtitle: {
    fontSize: scaledPixels(13),
    color: '#94A3B8',
    marginBottom: scaledPixels(12),
  },
  testButton: {
    minWidth: scaledPixels(150),
    paddingVertical: scaledPixels(12),
    paddingHorizontal: scaledPixels(20),
    backgroundColor: '#047857',
    borderRadius: scaledPixels(8),
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaledPixels(16),
    marginTop: scaledPixels(12),
  },
  activeEndpointText: {
    color: '#38BDF8',
    fontSize: scaledPixels(12),
    fontWeight: '600',
  },
  statusOnline: {
    color: '#34D399',
    fontSize: scaledPixels(12),
    fontWeight: '700',
  },
  statusOffline: {
    color: '#F87171',
    fontSize: scaledPixels(12),
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: scaledPixels(10),
    padding: scaledPixels(16),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoText: {
    color: '#94A3B8',
    fontSize: scaledPixels(13),
    lineHeight: scaledPixels(22),
    fontWeight: '500',
  },
});

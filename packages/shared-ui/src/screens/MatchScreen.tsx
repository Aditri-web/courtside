import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { SpatialNavigationRoot, SpatialNavigationFocusableView } from 'react-tv-space-navigation';
import { useIsFocused, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import RemoteControlManager from '../app/remote-control/RemoteControlManager';
import { SupportedKeys } from '../app/remote-control/SupportedKeys';
import VideoPlayer from '../components/player/VideoPlayer';
import VideoOverlay from '../components/player/VideoOverlay';
import { VideoRef } from 'react-native-video';
import { CompanionPanel } from '../companion/CompanionPanel';
import { LiveOverlay } from '../companion/LiveOverlay';
import { CURRENT_FEATURED_MATCH } from '../companion/staticData';
import { RootStackParamList } from '../navigation/types';
import { scaledPixels } from '../hooks/useScale';

const SHOW_NATIVE_CONTROLS = Platform.OS === 'ios';

type PlayerScreenRouteProp = RouteProp<RootStackParamList, 'Player'>;
type PlayerScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Player'>;

export default function MatchScreen() {
  const route = useRoute<PlayerScreenRouteProp>();
  const navigation = useNavigation<PlayerScreenNavigationProp>();
  const isFocused = useIsFocused();

  const movie = route.params?.movie || CURRENT_FEATURED_MATCH.videoUrl;
  const headerImage = route.params?.headerImage || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&q=80';

  const [paused, setPaused] = useState<boolean>(false);
  const [controlsVisible, setControlsVisible] = useState<boolean>(false);
  const [isVideoBuffering, setIsVideoBuffering] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [companionOpen, setCompanionOpen] = useState<boolean>(true); // Open by default for demo clarity!

  const videoRef = useRef<VideoRef>(null);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(CURRENT_FEATURED_MATCH.durationSec);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    hideControlsTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 5000);
  }, []);

  const seek = useCallback((time: number) => {
    let target = time;
    if (target < 0) target = 0;
    if (durationRef.current && target > durationRef.current) {
      target = durationRef.current;
    }
    videoRef.current?.seek(target);
    currentTimeRef.current = target;
    setCurrentTime(target);
    showControls();
  }, [showControls]);

  const togglePausePlay = useCallback(() => {
    setPaused((prev) => !prev);
    showControls();
  }, [showControls]);

  const toggleCompanion = useCallback(() => {
    setCompanionOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (SHOW_NATIVE_CONTROLS) return;

    const handleKeyDown = (key: SupportedKeys) => {
      switch (key) {
        case SupportedKeys.Right:
        case SupportedKeys.Rewind:
          seek(currentTimeRef.current + 10);
          break;
        case SupportedKeys.Left:
        case SupportedKeys.FastForward:
          seek(currentTimeRef.current - 10);
          break;
        case SupportedKeys.Back:
          if (companionOpen) {
            setCompanionOpen(false);
          } else {
            navigation.goBack();
          }
          break;
        case SupportedKeys.PlayPause:
          togglePausePlay();
          break;
        default:
          showControls();
          break;
      }
    };

    const listener = RemoteControlManager.addKeydownListener(handleKeyDown);
    return () => {
      RemoteControlManager.removeKeydownListener(listener);
    };
  }, [seek, togglePausePlay, showControls, navigation, companionOpen]);

  return (
    <SpatialNavigationRoot isActive={isFocused}>
      <View style={styles.container}>
        {/* Main Stage: Player + Side Companion */}
        <View style={styles.stage}>
          {/* Video Section */}
          <View style={[styles.playerArea, companionOpen ? styles.playerAreaWithCompanion : styles.playerAreaFull]}>
            <VideoPlayer
              ref={videoRef}
              movie={movie}
              headerImage={headerImage}
              paused={paused}
              controls={SHOW_NATIVE_CONTROLS}
              onBuffer={setIsVideoBuffering}
              onProgress={(t) => {
                currentTimeRef.current = t;
                setCurrentTime(t);
              }}
              onLoad={(d) => {
                durationRef.current = d || CURRENT_FEATURED_MATCH.durationSec;
              }}
              onEnd={() => {
                setPaused(true);
              }}
            />

            {/* Non-intrusive Live Overlay */}
            <LiveOverlay currentTime={currentTime} />

            {/* Floating Toggle Companion Button */}
            <View style={styles.floatingBar}>
              <SpatialNavigationFocusableView onSelect={toggleCompanion}>
                {({ isFocused: isBtnFocused }) => (
                  <View
                    style={[styles.companionToggleBtn, isBtnFocused && styles.companionToggleBtnFocused]}
                    accessibilityRole="button"
                    accessibilityLabel={companionOpen ? 'Collapse CourtSide companion' : 'Open CourtSide companion'}
                  >
                    <Text
                      style={[
                        styles.companionToggleBtnText,
                        isBtnFocused && styles.companionToggleBtnTextFocused
                      ]}
                    >
                      {companionOpen ? '✕ Hide Companion' : '⚡ Open CourtSide AI'}
                    </Text>
                  </View>
                )}
              </SpatialNavigationFocusableView>

              <SpatialNavigationFocusableView onSelect={() => navigation.goBack()}>
                {({ isFocused: isExitFocused }) => (
                  <View
                    style={[styles.exitBtn, isExitFocused && styles.companionToggleBtnFocused]}
                    accessibilityRole="button"
                    accessibilityLabel="Exit match"
                  >
                    <Text
                      style={[
                        styles.companionToggleBtnText,
                        isExitFocused && styles.companionToggleBtnTextFocused
                      ]}
                    >
                      ← Exit
                    </Text>
                  </View>
                )}
              </SpatialNavigationFocusableView>
            </View>

            {/* Controls overlay if not native */}
            {!SHOW_NATIVE_CONTROLS && controlsVisible && (
              <VideoOverlay
                visible={controlsVisible}
                paused={paused}
                onPlayPause={togglePausePlay}
                onExit={() => navigation.goBack()}
                currentTime={currentTime}
                duration={durationRef.current || CURRENT_FEATURED_MATCH.durationSec}
                isBuffering={isVideoBuffering}
              />
            )}
          </View>

          {/* CourtSide Companion Side Panel */}
          {companionOpen && (
            <CompanionPanel
              currentTime={currentTime}
              onSeek={seek}
              onClose={() => setCompanionOpen(false)}
            />
          )}
        </View>
      </View>
    </SpatialNavigationRoot>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000'
  },
  stage: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
    width: '100%'
  },
  playerArea: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    position: 'relative'
  },
  playerAreaFull: {
    flex: 1,
    width: '100%'
  },
  playerAreaWithCompanion: {
    flex: 1
  },
  floatingBar: {
    position: 'absolute',
    bottom: scaledPixels(24),
    left: scaledPixels(24),
    flexDirection: 'row',
    gap: scaledPixels(12),
    zIndex: 100
  },
  companionToggleBtn: {
    backgroundColor: 'rgba(2, 132, 199, 0.85)',
    borderWidth: 2,
    borderColor: '#38BDF8',
    paddingVertical: scaledPixels(10),
    paddingHorizontal: scaledPixels(18),
    borderRadius: scaledPixels(8)
  },
  exitBtn: {
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: scaledPixels(10),
    paddingHorizontal: scaledPixels(18),
    borderRadius: scaledPixels(8)
  },
  companionToggleBtnFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: '#00E5FF',
    transform: [{ scale: 1.08 }],
    shadowColor: '#00E5FF',
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 8
  },
  companionToggleBtnText: {
    color: '#FFFFFF',
    fontSize: scaledPixels(13),
    fontWeight: '800'
  },
  companionToggleBtnTextFocused: {
    color: '#0F172A',
    fontWeight: '900'
  }
});

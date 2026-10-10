import { StyleSheet, View, Image, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { DrawerActions, useIsFocused } from '@react-navigation/native';
import { useMenuContext } from '../components/MenuContext';
import {
  SpatialNavigationFocusableView,
  SpatialNavigationRoot,
  SpatialNavigationScrollView,
  SpatialNavigationNode,
  SpatialNavigationVirtualizedList,
  SpatialNavigationVirtualizedListRef,
  DefaultFocus,
} from 'react-tv-space-navigation';
import { Direction } from '@bam.tech/lrud';
import { scaledPixels } from '../hooks/useScale';
import { RootStackParamList } from '../navigation/types';
import { CardData } from '../data/moviesData';
import { colors, safeZones } from '../theme';
import PlatformLinearGradient from '../components/PlatformLinearGradient';
import { getOpenDrawerDirection } from '../utils/rtl';
import {
  SPORTS_LIVE_MATCH,
  LIVE_NOW_RAIL,
  HIGHLIGHTS_RAIL,
  FAMILY_PICKS_RAIL,
  UPCOMING_RAIL
} from '../data/sportsData';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'DrawerNavigator'>;

const SportsCardItem = React.memo(
  ({
    item,
    isFocused,
    styles,
  }: {
    item: CardData;
    isFocused: boolean;
    styles: any;
  }) => {
    const imageSource = useMemo(() => ({ uri: item.headerImage }), [item.headerImage]);

    return (
      <View style={[styles.highlightThumbnail, isFocused && styles.highlightThumbnailFocused]}>
        <Image source={imageSource} style={styles.cardImage} resizeMode="cover" />
        <View style={styles.cardCategoryBadge}>
          <Text style={styles.cardCategoryText}>{item.category || 'Sports'}</Text>
        </View>
        <View style={styles.thumbnailTextContainer}>
          <Text style={styles.thumbnailText} numberOfLines={1}>
            {item.title}
          </Text>
        </View>
      </View>
    );
  },
);

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { isOpen: isMenuOpen, toggleMenu } = useMenuContext();
  const liveRef = useRef<SpatialNavigationVirtualizedListRef>(null);
  const highlightsRef = useRef<SpatialNavigationVirtualizedListRef>(null);
  const familyRef = useRef<SpatialNavigationVirtualizedListRef>(null);
  const upcomingRef = useRef<SpatialNavigationVirtualizedListRef>(null);

  const [focusedItem, setFocusedItem] = useState<CardData>(SPORTS_LIVE_MATCH);
  const isFocused = useIsFocused();
  const isActive = isFocused && !isMenuOpen;

  const headerImageSource = useMemo(
    () => ({ uri: focusedItem.headerImage }),
    [focusedItem.headerImage],
  );

  const onDirectionHandledWithoutMovement = useCallback(
    (movement: Direction) => {
      if (movement === getOpenDrawerDirection()) {
        navigation.dispatch(DrawerActions.openDrawer());
        toggleMenu(true);
      }
    },
    [toggleMenu, navigation],
  );

  const renderHeader = useCallback(() => {
    return (
      <View style={gridStyles.header}>
        <Image style={gridStyles.headerImage} source={headerImageSource} resizeMode="cover" />
        <PlatformLinearGradient
          colors={['rgba(15,23,42,0.98)', 'rgba(15,23,42,0.85)', 'rgba(15,23,42,0.3)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={gridStyles.gradientLeft}
        />
        <View style={gridStyles.headerTextContainer}>
          <View style={gridStyles.livePill}>
            <View style={gridStyles.liveDot} />
            <Text style={gridStyles.liveText}>COURTSIDE AI COMPANION ACTIVE</Text>
          </View>
          <Text style={gridStyles.headerTitle} numberOfLines={2}>
            {focusedItem.title}
          </Text>
          <Text style={gridStyles.headerDescription} numberOfLines={3}>
            {focusedItem.description}
          </Text>

          {/* Quick Action Button to Watch with CourtSide AI */}
          <SpatialNavigationFocusableView
            onSelect={() => {
              navigation.navigate('Player', {
                movie: focusedItem.movie,
                headerImage: focusedItem.headerImage,
              });
            }}
          >
            {({ isFocused: isWatchFocused }) => (
              <View
                style={[gridStyles.watchLiveButton, isWatchFocused && gridStyles.watchLiveButtonFocused]}
                accessibilityRole="button"
                accessibilityLabel="Watch match with CourtSide AI"
              >
                <Text
                  style={[
                    gridStyles.watchLiveButtonText,
                    isWatchFocused && gridStyles.watchLiveButtonTextFocused,
                  ]}
                >
                  ▶ Watch with CourtSide AI Companion
                </Text>
              </View>
            )}
          </SpatialNavigationFocusableView>
        </View>
      </View>
    );
  }, [headerImageSource, focusedItem, navigation]);

  const createRenderItem = useCallback(
    (dataset: CardData[]) => {
      return ({ item }: { item: CardData; index: number }) => (
        <SpatialNavigationFocusableView
          onSelect={() => {
            navigation.navigate('Player', {
              movie: item.movie,
              headerImage: item.headerImage,
            });
          }}
          onFocus={() => setFocusedItem(item)}
        >
          {({ isFocused }) => (
            <SportsCardItem item={item} isFocused={isFocused} styles={gridStyles} />
          )}
        </SpatialNavigationFocusableView>
      );
    },
    [navigation],
  );

  const renderScrollableRow = useCallback(
    (title: string, data: CardData[], isFirst = false) => {
      return (
        <View style={gridStyles.highlightsContainer}>
          <Text style={gridStyles.highlightsTitle}>{title}</Text>
          <SpatialNavigationNode>
            {isFirst ? (
              <DefaultFocus>
                <SpatialNavigationVirtualizedList
                  data={data}
                  orientation="horizontal"
                  renderItem={createRenderItem(data)}
                  itemSize={scaledPixels(440)}
                />
              </DefaultFocus>
            ) : (
              <SpatialNavigationVirtualizedList
                data={data}
                orientation="horizontal"
                renderItem={createRenderItem(data)}
                itemSize={scaledPixels(440)}
              />
            )}
          </SpatialNavigationNode>
        </View>
      );
    },
    [createRenderItem],
  );

  return (
    <SpatialNavigationRoot
      isActive={isActive}
      onDirectionHandledWithoutMovement={onDirectionHandledWithoutMovement}
    >
      <View style={gridStyles.container}>
        {renderHeader()}
        <SpatialNavigationScrollView
          offsetFromStart={scaledPixels(40)}
          style={gridStyles.scrollContent}
        >
          {renderScrollableRow('🔴 Live Now & On Air', LIVE_NOW_RAIL, true)}
          {renderScrollableRow('⚽ Key Highlights & Turnarounds', HIGHLIGHTS_RAIL)}
          {renderScrollableRow('👨‍👩‍👧 Family Picks & Kid Sports', FAMILY_PICKS_RAIL)}
          {renderScrollableRow('📅 Upcoming Fixtures', UPCOMING_RAIL)}
        </SpatialNavigationScrollView>
      </View>
    </SpatialNavigationRoot>
  );
}

const gridStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    flex: 1,
    marginBottom: scaledPixels(safeZones.actionSafe.vertical),
  },
  header: {
    width: '100%',
    height: scaledPixels(460),
    position: 'relative',
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradientLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '75%',
  },
  headerTextContainer: {
    position: 'absolute',
    top: scaledPixels(48),
    left: scaledPixels(56),
    maxWidth: scaledPixels(750),
    zIndex: 10,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    borderWidth: 1,
    borderColor: '#00E5FF',
    paddingHorizontal: scaledPixels(10),
    paddingVertical: scaledPixels(4),
    borderRadius: scaledPixels(6),
    alignSelf: 'flex-start',
    marginBottom: scaledPixels(12),
  },
  liveDot: {
    width: scaledPixels(8),
    height: scaledPixels(8),
    borderRadius: scaledPixels(4),
    backgroundColor: '#00E5FF',
    marginRight: scaledPixels(6),
  },
  liveText: {
    color: '#00E5FF',
    fontSize: scaledPixels(11),
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: scaledPixels(42),
    fontWeight: '900',
    marginBottom: scaledPixels(12),
    letterSpacing: 0.3,
  },
  headerDescription: {
    color: '#CBD5E1',
    fontSize: scaledPixels(18),
    fontWeight: '500',
    lineHeight: scaledPixels(26),
    marginBottom: scaledPixels(18),
  },
  watchLiveButton: {
    backgroundColor: '#0284C7',
    paddingVertical: scaledPixels(14),
    paddingHorizontal: scaledPixels(28),
    borderRadius: scaledPixels(10),
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderColor: '#38BDF8',
  },
  watchLiveButtonFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: '#00E5FF',
    transform: [{ scale: 1.05 }],
    shadowColor: '#00E5FF',
    shadowOpacity: 0.9,
    shadowRadius: 14,
    elevation: 8,
  },
  watchLiveButtonText: {
    color: '#FFFFFF',
    fontSize: scaledPixels(16),
    fontWeight: '800',
  },
  watchLiveButtonTextFocused: {
    color: '#0F172A',
    fontWeight: '900',
  },
  highlightsContainer: {
    paddingStart: scaledPixels(safeZones.actionSafe.horizontal),
    marginBottom: scaledPixels(28),
  },
  highlightsTitle: {
    color: '#F8FAFC',
    fontSize: scaledPixels(24),
    fontWeight: '800',
    marginBottom: scaledPixels(14),
  },
  highlightThumbnail: {
    width: scaledPixels(410),
    height: scaledPixels(230),
    marginEnd: scaledPixels(24),
    borderRadius: scaledPixels(12),
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    position: 'relative',
  },
  highlightThumbnailFocused: {
    borderColor: '#00E5FF',
    borderWidth: scaledPixels(3),
    transform: [{ scale: 1.05 }],
    shadowColor: '#00E5FF',
    shadowOpacity: 0.8,
    shadowRadius: scaledPixels(14),
    elevation: 8,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardCategoryBadge: {
    position: 'absolute',
    top: scaledPixels(10),
    left: scaledPixels(10),
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: scaledPixels(8),
    paddingVertical: scaledPixels(4),
    borderRadius: scaledPixels(4),
  },
  cardCategoryText: {
    color: '#38BDF8',
    fontSize: scaledPixels(11),
    fontWeight: '800',
  },
  thumbnailTextContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    paddingHorizontal: scaledPixels(14),
    paddingVertical: scaledPixels(10),
  },
  thumbnailText: {
    color: '#FFFFFF',
    fontSize: scaledPixels(14),
    fontWeight: '700',
  },
});

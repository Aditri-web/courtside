import { useEffect, useRef } from 'react';
import { StyleSheet, View, Platform, I18nManager } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useNavigation, DrawerActions, NavigationProp } from '@react-navigation/native';
import { useMenuContext } from '../components/MenuContext';
import CustomDrawerContent from '../components/CustomDrawerContent';
import { scaledPixels } from '../hooks/useScale';
import { DrawerParamList } from './types';

// Import CourtSide screens
import HomeScreen from '../screens/HomeScreen';
import MatchScreen from '../screens/MatchScreen';
import HighlightsScreen from '../screens/HighlightsScreen';
import FamilyScreen from '../screens/FamilyScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Drawer = createDrawerNavigator<DrawerParamList>();

function DrawerSyncWrapper({ drawerNavRef }: { drawerNavRef: React.MutableRefObject<any> }) {
  const { isOpen: isMenuOpen } = useMenuContext();
  const navigation = useNavigation();

  useEffect(() => {
    drawerNavRef.current = navigation;
  }, [navigation, drawerNavRef]);

  useEffect(() => {
    if (isMenuOpen) {
      navigation.dispatch(DrawerActions.openDrawer());
    }
  }, []);

  return null;
}

export default function DrawerNavigator() {
  const styles = drawerStyles;
  const { isOpen: isMenuOpen } = useMenuContext();
  const drawerNavRef = useRef<NavigationProp<DrawerParamList> | null>(null);

  const navigationContent = (
    <Drawer.Navigator
      drawerContent={CustomDrawerContent}
      initialRouteName="Home"
      defaultStatus="open"
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: '#0284C7',
        drawerActiveTintColor: '#ffffff',
        drawerInactiveTintColor: '#94A3B8',
        drawerStyle: styles.drawerStyle,
        drawerLabelStyle: styles.drawerLabelStyle,
        drawerType: 'front',
        swipeEnabled: false,
        drawerPosition: I18nManager.isRTL ? 'right' : 'left',
      }}
    >
      <Drawer.Screen
        name="Home"
        options={{ drawerLabel: 'Home' }}
      >
        {() => (
          <>
            <DrawerSyncWrapper drawerNavRef={drawerNavRef} />
            <HomeScreen />
          </>
        )}
      </Drawer.Screen>
      <Drawer.Screen
        name="Live"
        component={MatchScreen}
        options={{
          drawerLabel: 'Live Match',
        }}
      />
      <Drawer.Screen
        name="Highlights"
        component={HighlightsScreen}
        options={{
          drawerLabel: 'Highlights',
        }}
      />
      <Drawer.Screen
        name="Family"
        component={FamilyScreen}
        options={{
          drawerLabel: 'Family Picks',
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          drawerLabel: 'Settings',
        }}
      />
    </Drawer.Navigator>
  );

  if (Platform.isTV) {
    return <View style={{ flex: 1 }}>{navigationContent}</View>;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {navigationContent}
    </GestureHandlerRootView>
  );
}

const drawerStyles = StyleSheet.create({
  drawerStyle: {
    width: scaledPixels(320),
    backgroundColor: '#0F172A',
    paddingTop: scaledPixels(0),
  },
  drawerLabelStyle: {
    fontSize: scaledPixels(18),
    fontWeight: 'bold',
    marginStart: scaledPixels(10),
  },
});

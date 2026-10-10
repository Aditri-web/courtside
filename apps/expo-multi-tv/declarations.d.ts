declare module 'react-native-pixel-perfect' {
  export function create(designResolution: { width: number; height: number }): (pixel: number) => number;
}

declare module 'react-native-keyevent' {
  export default class KeyEvent {
    static onKeyDownListener(cb: (keyEvent: { keyCode: number; action?: number }) => void): void;
    static removeKeyDownListener(): void;
  }
}

declare module 'react-native-gesture-handler' {
  import React from 'react';
  import { ViewProps } from 'react-native';
  export const GestureHandlerRootView: React.FC<ViewProps>;
}

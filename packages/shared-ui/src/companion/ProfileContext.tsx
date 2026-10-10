import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, ExplanationLevel } from './types';

interface ProfileContextType {
  profile: Profile;
  setMode: (mode: 'standard' | 'family') => void;
  toggleSpoilers: () => void;
  setLevel: (level: ExplanationLevel) => void;
  setFontScale: (scale: number) => void;
  aiServiceUrl: string;
  setAiServiceUrl: (url: string) => void;
}

const DEFAULT_PROFILE: Profile = {
  mode: 'standard',
  spoilers: false,
  level: 'casual',
  fontSizeScale: 1.0
};

const ProfileContext = createContext<ProfileContextType>({
  profile: DEFAULT_PROFILE,
  setMode: () => {},
  toggleSpoilers: () => {},
  setLevel: () => {},
  setFontScale: () => {},
  aiServiceUrl: 'http://localhost:4000',
  setAiServiceUrl: () => {}
});

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [aiServiceUrl, setAiServiceUrl] = useState<string>('http://localhost:4000');

  const setMode = (mode: 'standard' | 'family') => {
    setProfile((prev) => ({
      ...prev,
      mode,
      // Family mode defaults to kid level, larger font, and spoilers disabled
      level: mode === 'family' ? 'kid' : prev.level === 'kid' ? 'casual' : prev.level,
      spoilers: mode === 'family' ? false : prev.spoilers,
      fontSizeScale: mode === 'family' ? 1.25 : 1.0
    }));
  };

  const toggleSpoilers = () => {
    setProfile((prev) => ({
      ...prev,
      spoilers: !prev.spoilers
    }));
  };

  const setLevel = (level: ExplanationLevel) => {
    setProfile((prev) => ({
      ...prev,
      level
    }));
  };

  const setFontScale = (fontSizeScale: number) => {
    setProfile((prev) => ({
      ...prev,
      fontSizeScale
    }));
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        setMode,
        toggleSpoilers,
        setLevel,
        setFontScale,
        aiServiceUrl,
        setAiServiceUrl
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);

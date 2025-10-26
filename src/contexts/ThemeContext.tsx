import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

export type Theme = 'light' | 'dark' | 'system';

export interface Colors {
  // Background colors
  background: string;
  secondaryBackground: string;
  tertiaryBackground: string;
  groupedBackground: string;
  
  // Text colors
  label: string;
  secondaryLabel: string;
  tertiaryLabel: string;
  quaternaryLabel: string;
  
  // System colors
  systemBlue: string;
  systemGreen: string;
  systemRed: string;
  systemOrange: string;
  systemYellow: string;
  systemPink: string;
  systemPurple: string;
  systemTeal: string;
  systemIndigo: string;
  
  // Fill colors
  systemFill: string;
  secondarySystemFill: string;
  tertiarySystemFill: string;
  quaternarySystemFill: string;
  
  // Separator colors
  separator: string;
  opaqueSeparator: string;
  
  // Tab bar
  tabBarBackground: string;
  tabBarBorder: string;
}

const lightColors: Colors = {
  // Background colors
  background: '#FFFFFF',
  secondaryBackground: '#F2F2F7',
  tertiaryBackground: '#FFFFFF',
  groupedBackground: '#F2F2F7',
  
  // Text colors
  label: '#000000',
  secondaryLabel: '#3C3C43',
  tertiaryLabel: '#3C3C43',
  quaternaryLabel: '#3C3C43',
  
  // System colors
  systemBlue: '#007AFF',
  systemGreen: '#34C759',
  systemRed: '#FF3B30',
  systemOrange: '#FF9500',
  systemYellow: '#FFCC00',
  systemPink: '#FF2D92',
  systemPurple: '#AF52DE',
  systemTeal: '#5AC8FA',
  systemIndigo: '#5856D6',
  
  // Fill colors
  systemFill: '#78788033',
  secondarySystemFill: '#78788028',
  tertiarySystemFill: '#7676801E',
  quaternarySystemFill: '#74748014',
  
  // Separator colors
  separator: '#3C3C4336',
  opaqueSeparator: '#C6C6C8',
  
  // Tab bar
  tabBarBackground: '#F9F9F9',
  tabBarBorder: '#E5E5EA',
};

const darkColors: Colors = {
  // Background colors
  background: '#000000',
  secondaryBackground: '#1C1C1E',
  tertiaryBackground: '#2C2C2E',
  groupedBackground: '#000000',
  
  // Text colors
  label: '#FFFFFF',
  secondaryLabel: '#EBEBF5',
  tertiaryLabel: '#EBEBF5',
  quaternaryLabel: '#EBEBF5',
  
  // System colors
  systemBlue: '#0A84FF',
  systemGreen: '#30D158',
  systemRed: '#FF453A',
  systemOrange: '#FF9F0A',
  systemYellow: '#FFD60A',
  systemPink: '#FF375F',
  systemPurple: '#BF5AF2',
  systemTeal: '#64D2FF',
  systemIndigo: '#5E5CE6',
  
  // Fill colors
  systemFill: '#78788066',
  secondarySystemFill: '#78788052',
  tertiarySystemFill: '#7676803D',
  quaternarySystemFill: '#74748029',
  
  // Separator colors
  separator: '#54545899',
  opaqueSeparator: '#38383A',
  
  // Tab bar
  tabBarBackground: '#1C1C1E',
  tabBarBorder: '#2C2C2E',
};

interface ThemeContextType {
  theme: Theme;
  colors: Colors;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app_theme';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('system');
  const [systemColorScheme, setSystemColorScheme] = useState(Appearance.getColorScheme());

  useEffect(() => {
    loadTheme();
    
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeState(savedTheme as Theme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const isDark = theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark');
  const colors = isDark ? darkColors : lightColors;

  const value: ThemeContextType = {
    theme,
    colors,
    isDark,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
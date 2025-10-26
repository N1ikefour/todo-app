import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, colors, isDark } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  const getThemeIcon = () => {
    return theme === 'light' ? 'moon' : 'sunny';
  };

  const getThemeLabel = () => {
    return theme === 'light' ? 'Светлая' : 'Темная';
  };

  return (
    <TouchableOpacity
      style={[
        styles.iconButton,
        { backgroundColor: colors.surface }
      ]}
      onPress={toggleTheme}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={getThemeIcon() as any} 
        size={20} 
        color={theme === 'light' ? '#000' : '#fff'} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
});
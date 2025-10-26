import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface BlurViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: 'light' | 'medium' | 'heavy';
  tint?: 'light' | 'dark' | 'default';
}

export const BlurView: React.FC<BlurViewProps> = ({ 
  children, 
  style, 
  intensity = 'medium',
  tint = 'default' 
}) => {
  const { colors, isDark } = useTheme();
  
  const getBlurStyle = () => {
    const baseOpacity = {
      light: 0.7,
      medium: 0.85,
      heavy: 0.95,
    }[intensity];
    
    let backgroundColor;
    if (tint === 'default') {
      backgroundColor = isDark ? colors.secondaryBackground : colors.background;
    } else if (tint === 'light') {
      backgroundColor = 'rgba(255, 255, 255, 0.9)';
    } else {
      backgroundColor = 'rgba(0, 0, 0, 0.8)';
    }
    
    return {
      backgroundColor,
      opacity: baseOpacity,
    };
  };

  return (
    <View style={[styles.container, getBlurStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
});
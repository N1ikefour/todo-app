import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Theme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, colors, isDark } = useTheme();

  const showThemeOptions = () => {
    Alert.alert(
      'Выберите тему',
      'Выберите предпочитаемую тему для приложения',
      [
        {
          text: 'Светлая',
          onPress: () => setTheme('light'),
          style: theme === 'light' ? 'default' : 'default',
        },
        {
          text: 'Темная',
          onPress: () => setTheme('dark'),
          style: theme === 'dark' ? 'default' : 'default',
        },
        {
          text: 'Системная',
          onPress: () => setTheme('system'),
          style: theme === 'system' ? 'default' : 'default',
        },
        {
          text: 'Отмена',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return 'sunny-outline';
      case 'dark':
        return 'moon-outline';
      case 'system':
        return 'phone-portrait-outline';
      default:
        return 'sunny-outline';
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Светлая';
      case 'dark':
        return 'Темная';
      case 'system':
        return 'Системная';
      default:
        return 'Светлая';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.tertiaryBackground }]}
      onPress={showThemeOptions}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={getThemeIcon()}
          size={20}
          color={colors.systemBlue}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.label, { color: colors.label }]}>
          Тема
        </Text>
        <Text style={[styles.value, { color: colors.secondaryLabel }]}>
          {getThemeLabel()}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={16}
        color={colors.tertiaryLabel}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    fontWeight: '400',
  },
});
import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { hapticFeedback } from '../utils/haptics';

interface AddTodoInputProps {
  onAddTodo: (title: string, description?: string) => void;
}

export const AddTodoInput: React.FC<AddTodoInputProps> = ({ onAddTodo }) => {
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showDescription, setShowDescription] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const descriptionHeightAnim = useRef(new Animated.Value(0)).current;

  const handleAddTodo = () => {
    if (title.trim()) {
      hapticFeedback.light();
      
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      onAddTodo(title.trim(), description.trim() || undefined);
      setTitle('');
      setDescription('');
      setShowDescription(false);
      
      Animated.timing(descriptionHeightAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
      
      Keyboard.dismiss();
    } else {
      hapticFeedback.error();
    }
  };

  const toggleDescription = () => {
    hapticFeedback.selection();
    
    const newShowDescription = !showDescription;
    setShowDescription(newShowDescription);
    
    Animated.timing(descriptionHeightAnim, {
      toValue: newShowDescription ? 60 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.secondaryBackground }]}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.titleInput, { color: colors.label }]}
          placeholder="Добавить задачу..."
          placeholderTextColor={colors.tertiaryLabel}
          value={title}
          onChangeText={setTitle}
          multiline={false}
          returnKeyType="done"
          onSubmitEditing={handleAddTodo}
          blurOnSubmit={false}
        />
        
        <Animated.View
          style={[
            styles.descriptionContainer,
            {
              height: descriptionHeightAnim,
              opacity: descriptionHeightAnim.interpolate({
                inputRange: [0, 60],
                outputRange: [0, 1],
              }),
            },
          ]}
        >
          <TextInput
            style={[styles.descriptionInput, { color: colors.secondaryLabel }]}
            placeholder="Описание (необязательно)"
            placeholderTextColor={colors.quaternaryLabel}
            value={description}
            onChangeText={setDescription}
            multiline={true}
            numberOfLines={2}
            returnKeyType="done"
            onSubmitEditing={handleAddTodo}
          />
        </Animated.View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton, 
            { 
              backgroundColor: showDescription ? colors.systemBlue : colors.systemFill,
            }
          ]}
          onPress={toggleDescription}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="text-outline" 
            size={18} 
            color={showDescription ? '#FFFFFF' : colors.systemBlue} 
          />
        </TouchableOpacity>
        
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[
              styles.addButton,
              { 
                backgroundColor: title.trim() ? colors.systemBlue : colors.systemFill,
                opacity: title.trim() ? 1 : 0.6
              }
            ]}
            onPress={handleAddTodo}
            disabled={!title.trim()}
            activeOpacity={0.8}
          >
            <Ionicons 
              name="add" 
              size={22} 
              color={title.trim() ? '#FFFFFF' : colors.tertiaryLabel} 
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    marginBottom: 12,
  },
  titleInput: {
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 0,
    minHeight: 44,
  },
  descriptionContainer: {
    overflow: 'hidden',
    marginTop: 8,
  },
  descriptionInput: {
    fontSize: 14,
    fontWeight: '400',
    paddingVertical: 8,
    paddingHorizontal: 0,
    textAlignVertical: 'top',
    minHeight: 44,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
});
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Todo } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { hapticFeedback } from '../utils/haptics';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onDelete,
}) => {
  const { colors } = useTheme();
  const [showDelete, setShowDelete] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const deleteOpacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const swipeTranslateX = useRef(new Animated.Value(0)).current;
  const deleteButtonScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, []);

  const handleToggle = () => {
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

    onToggle(todo.id);
  };

  const handleDelete = () => {
    hapticFeedback.medium();
    
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDelete(todo.id);
    });
  };

  const toggleDeleteButton = () => {
    hapticFeedback.selection();
    
    const newShowDelete = !showDelete;
    setShowDelete(newShowDelete);
    
    Animated.timing(deleteOpacityAnim, {
      toValue: newShowDelete ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const onPanGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: swipeTranslateX } }],
    { useNativeDriver: true }
  );

  const onPanHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX, velocityX } = event.nativeEvent;
      
      // Если свайп влево больше 80px или скорость больше 500
      if (translationX < -80 || velocityX < -500) {
        // Показываем кнопку удаления
        hapticFeedback.medium();
        
        Animated.parallel([
          Animated.spring(swipeTranslateX, {
            toValue: -80,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.spring(deleteButtonScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
        ]).start();
        
        setShowDelete(true);
      } else {
        // Возвращаем в исходное положение
        Animated.parallel([
          Animated.spring(swipeTranslateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.spring(deleteButtonScale, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
        ]).start();
        
        setShowDelete(false);
      }
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={onPanGestureEvent}
      onHandlerStateChange={onPanHandlerStateChange}
      activeOffsetX={[-10, 10]}
      failOffsetY={[-5, 5]}
    >
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: colors.secondaryBackground,
            transform: [
              { scale: scaleAnim },
              { translateX: Animated.add(slideAnim, swipeTranslateX) },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.content}
          onPress={handleToggle}
          onLongPress={toggleDeleteButton}
          activeOpacity={0.7}
        >
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: todo.completed ? colors.systemGreen : colors.systemFill,
              borderColor: todo.completed ? colors.systemGreen : colors.separator,
            },
          ]}
        >
          {todo.completed && (
            <Animated.View
              style={{
                transform: [{ scale: scaleAnim }],
              }}
            >
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            </Animated.View>
          )}
        </View>

        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              {
                color: todo.completed ? colors.secondaryLabel : colors.label,
                textDecorationLine: todo.completed ? 'line-through' : 'none',
              },
            ]}
          >
            {todo.title}
          </Text>
          {todo.description && (
            <Text
              style={[
                styles.description,
                {
                  color: colors.tertiaryLabel,
                  textDecorationLine: todo.completed ? 'line-through' : 'none',
                },
              ]}
            >
              {todo.description}
            </Text>
          )}
        </View>
      </TouchableOpacity>

        {/* Кнопка удаления при свайпе */}
        <Animated.View
          style={[
            styles.swipeDeleteButton,
            {
              transform: [{ scale: deleteButtonScale }],
            },
          ]}
          pointerEvents={showDelete ? 'auto' : 'none'}
        >
          <TouchableOpacity
            style={[
              styles.swipeDeleteButtonInner,
              { backgroundColor: colors.systemRed },
            ]}
            onPress={handleDelete}
            activeOpacity={0.8}
          >
            <Ionicons name="trash" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>

        {/* Старая кнопка удаления (по долгому нажатию) */}
        <Animated.View
          style={[
            styles.deleteButton,
            {
              opacity: deleteOpacityAnim,
              transform: [
                {
                  scale: deleteOpacityAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
          pointerEvents={showDelete && !showDelete ? 'auto' : 'none'}
        >
          <TouchableOpacity
            style={[
              styles.deleteButtonInner,
              { backgroundColor: colors.systemRed },
            ]}
            onPress={handleDelete}
            activeOpacity={0.8}
          >
            <Ionicons name="trash" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    marginTop: 2,
    lineHeight: 18,
  },
  deleteButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -18,
  },
  deleteButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeDeleteButton: {
    position: 'absolute',
    right: -80,
    top: '50%',
    marginTop: -22,
    width: 80,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeDeleteButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Todo } from '../types/Todo';
import { TodoItem } from '../components/TodoItem';
import { AddTodoInput } from '../components/AddTodoInput';
import { ThemeToggle } from '../components/ThemeToggle';
import { BlurView } from '../components/BlurView';
import { saveTodos, loadTodos, saveToHistory } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';
import { hapticFeedback } from '../utils/haptics';

export const HomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadTodosFromStorage();
    
    // Анимация появления
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadTodosFromStorage = async () => {
    try {
      const loadedTodos = await loadTodos();
      setTodos(loadedTodos);
    } catch (error) {
      console.error('Error loading todos:', error);
    }
  };

  const saveTodosToStorage = async (newTodos: Todo[]) => {
    try {
      await saveTodos(newTodos);
      // Также сохраняем в историю при каждом сохранении
      await saveToHistory(newTodos);
    } catch (error) {
      console.error('Error saving todos:', error);
    }
  };

  const addTodo = async (title: string, description?: string) => {
    hapticFeedback.light();
    
    const newTodo: Todo = {
      id: Date.now().toString(),
      title,
      description,
      completed: false,
      createdAt: new Date(),
    };
    
    const newTodos = [newTodo, ...todos];
    setTodos(newTodos);
    await saveTodosToStorage(newTodos);
  };

  const toggleTodo = async (id: string) => {
    hapticFeedback.medium();
    
    const newTodos = todos.map(todo =>
      todo.id === id ? { 
        ...todo, 
        completed: !todo.completed,
        completedAt: !todo.completed ? new Date() : undefined
      } : todo
    );
    setTodos(newTodos);
    await saveTodosToStorage(newTodos);
  };

  const deleteTodo = async (id: string) => {
    hapticFeedback.heavy();
    
    const newTodos = todos.filter(todo => todo.id !== id);
    setTodos(newTodos);
    await saveTodosToStorage(newTodos);
  };

  const onRefresh = async () => {
    hapticFeedback.selection();
    setRefreshing(true);
    await loadTodosFromStorage();
    setRefreshing(false);
  };

  const activeTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);

  const renderTodo = ({ item }: { item: Todo }) => (
    <TodoItem
      todo={item}
      onToggle={toggleTodo}
      onDelete={deleteTodo}
    />
  );

  const renderHeader = () => (
    <View>
      <ThemeToggle />
      <AddTodoInput onAdd={addTodo} />
      
      {todos.length > 0 && (
        <View style={[styles.statsContainer, { backgroundColor: colors.secondaryBackground }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.systemBlue }]}>
              {activeTodos.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.secondaryLabel }]}>
              Активных
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.systemGreen }]}>
              {completedTodos.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.secondaryLabel }]}>
              Выполнено
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.label }]}>
              {todos.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.secondaryLabel }]}>
              Всего
            </Text>
          </View>
        </View>
      )}
      
      {activeTodos.length > 0 && (
        <Text style={[styles.sectionTitle, { color: colors.label }]}>
          Активные задачи
        </Text>
      )}
    </View>
  );

  const renderFooter = () => (
    <View>
      {completedTodos.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.label }]}>
            Выполненные задачи
          </Text>
          {completedTodos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          ))}
        </>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyTitle, { color: colors.label }]}>
        Нет задач
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.secondaryLabel }]}>
        Добавьте свою первую задачу выше
      </Text>
    </View>
  );

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Header with Theme Toggle */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.label }]}>
              Мои задачи
            </Text>
            <Text style={[styles.subtitle, { color: colors.secondaryLabel }]}>
              {totalCount > 0 
                ? `${completedCount} из ${totalCount} выполнено`
                : 'Добавьте первую задачу'
              }
            </Text>
          </View>
          <ThemeToggle />
        </View>

        {/* Stats Card with Blur Effect */}
        {totalCount > 0 && (
          <BlurView style={styles.statsCard} intensity="medium">
            <View style={styles.statsContent}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: colors.systemBlue }]}>
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={[styles.statNumber, { color: colors.label }]}>
                    {completedCount}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.secondaryLabel }]}>
                    Выполнено
                  </Text>
                </View>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: colors.systemOrange }]}>
                  <Ionicons name="time" size={16} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={[styles.statNumber, { color: colors.label }]}>
                    {totalCount - completedCount}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.secondaryLabel }]}>
                    Осталось
                  </Text>
                </View>
              </View>
            </View>
          </BlurView>
        )}

        {/* Add Todo Input */}
        <AddTodoInput onAddTodo={addTodo} />

        {/* Todo List */}
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 50],
                    outputRange: [0, 50 + (index * 10)],
                  }),
                }],
              }}
            >
              <TodoItem
                todo={item}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
              />
            </Animated.View>
          )}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.systemBlue}
              colors={[colors.systemBlue]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.systemFill }]}>
                <Ionicons name="checkmark-circle" size={48} color={colors.tertiaryLabel} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.secondaryLabel }]}>
                Нет задач
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.tertiaryLabel }]}>
                Добавьте новую задачу, чтобы начать
              </Text>
            </View>
          }
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    marginTop: 4,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 20,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '400',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(60, 60, 67, 0.18)',
    marginHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
  },
});
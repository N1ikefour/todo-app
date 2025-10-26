import AsyncStorage from '@react-native-async-storage/async-storage';
import { Todo, DailyTodos } from '../types';

const TODOS_KEY = 'todos';
const HISTORY_KEY = 'todos_history';

export const saveTodos = async (todos: Todo[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(TODOS_KEY, JSON.stringify(todos));
  } catch (error) {
    console.error('Error saving todos:', error);
  }
};

export const loadTodos = async (): Promise<Todo[]> => {
  try {
    const todosJson = await AsyncStorage.getItem(TODOS_KEY);
    if (todosJson) {
      const todos = JSON.parse(todosJson);
      return todos.map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        completedAt: todo.completedAt ? new Date(todo.completedAt) : undefined,
      }));
    }
    return [];
  } catch (error) {
    console.error('Error loading todos:', error);
    return [];
  }
};

export const saveToHistory = async (todos: Todo[]): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const historyJson = await AsyncStorage.getItem(HISTORY_KEY);
    let history: DailyTodos[] = historyJson ? JSON.parse(historyJson) : [];
    
    // Remove today's entry if it exists
    history = history.filter(entry => entry.date !== today);
    
    // Add today's todos if there are any
    if (todos.length > 0) {
      history.unshift({ date: today, todos });
    }
    
    // Keep only last 30 days
    history = history.slice(0, 30);
    
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving to history:', error);
  }
};

export const loadHistory = async (): Promise<DailyTodos[]> => {
  try {
    const historyJson = await AsyncStorage.getItem(HISTORY_KEY);
    if (historyJson) {
      const history = JSON.parse(historyJson);
      return history.map((entry: any) => ({
        ...entry,
        todos: entry.todos.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          completedAt: todo.completedAt ? new Date(todo.completedAt) : undefined,
        })),
      }));
    }
    return [];
  } catch (error) {
    console.error('Error loading history:', error);
    return [];
  }
};
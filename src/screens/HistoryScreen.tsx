import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DailyTodos, Todo } from '../types';
import { loadHistory } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';

interface HistoryItemProps {
  dailyTodos: DailyTodos;
  colors: any;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ dailyTodos, colors }) => {
  const [expanded, setExpanded] = useState(false);
  const completedCount = dailyTodos.todos.filter(todo => todo.completed).length;
  const totalCount = dailyTodos.todos.length;
  const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderTodo = (todo: Todo) => (
    <View key={todo.id} style={[styles.todoItem, { backgroundColor: colors.tertiaryBackground }]}>
      <View style={[
        styles.todoCheckbox,
        { 
          backgroundColor: todo.completed ? colors.systemGreen : colors.systemFill,
          borderColor: todo.completed ? colors.systemGreen : colors.separator
        }
      ]}>
        {todo.completed && (
          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
        )}
      </View>
      <View style={styles.todoTextContainer}>
        <Text
          style={[
            styles.todoTitle,
            {
              color: todo.completed ? colors.secondaryLabel : colors.label,
              textDecorationLine: todo.completed ? 'line-through' : 'none',
            },
          ]}
        >
          {todo.title}
        </Text>
        {todo.description && (
          <Text style={[styles.todoDescription, { color: colors.tertiaryLabel }]}>
            {todo.description}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.historyItem, { backgroundColor: colors.tertiaryBackground }]}>
      <TouchableOpacity
        style={styles.historyHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.historyHeaderContent}>
          <Text style={[styles.historyDate, { color: colors.label }]}>
            {formatDate(dailyTodos.date)}
          </Text>
          <Text style={[styles.historyStats, { color: colors.secondaryLabel }]}>
            {completedCount} из {totalCount} выполнено
          </Text>
        </View>
        
        <View style={styles.historyHeaderRight}>
          <View style={[styles.progressContainer, { backgroundColor: colors.systemFill }]}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${completionRate}%`,
                  backgroundColor: completionRate === 100 ? colors.systemGreen : colors.systemBlue,
                },
              ]}
            />
          </View>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.tertiaryLabel}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.historyContent}>
          {dailyTodos.todos.map(renderTodo)}
        </View>
      )}
    </View>
  );
};

export const HistoryScreen: React.FC = () => {
  const { colors } = useTheme();
  const [history, setHistory] = useState<DailyTodos[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistoryData();
  }, []);

  const loadHistoryData = async () => {
    try {
      const historyData = await loadHistory();
      // Sort by date descending (newest first)
      const sortedHistory = historyData.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setHistory(sortedHistory);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistoryData();
    setRefreshing(false);
  };

  const renderHistoryItem = ({ item }: { item: DailyTodos }) => (
    <HistoryItem dailyTodos={item} colors={colors} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={64} color={colors.tertiaryLabel} />
      <Text style={[styles.emptyTitle, { color: colors.label }]}>
        Нет истории
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.secondaryLabel }]}>
        Выполненные задачи будут отображаться здесь
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.date}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.systemBlue}
            colors={[colors.systemBlue]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  historyItem: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  historyHeader: {
    padding: 16,
  },
  historyHeaderContent: {
    marginBottom: 12,
  },
  historyDate: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  historyStats: {
    fontSize: 14,
    fontWeight: '400',
  },
  historyHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressContainer: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  historyContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
  },
  todoCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todoTextContainer: {
    flex: 1,
  },
  todoTitle: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
  },
  todoDescription: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: 2,
    lineHeight: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
  },
});
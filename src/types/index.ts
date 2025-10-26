export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface DailyTodos {
  date: string;
  todos: Todo[];
}

export type RootStackParamList = {
  Home: undefined;
  History: undefined;
};
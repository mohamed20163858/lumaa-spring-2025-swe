export interface Task {
  id: number;
  title: string;
  description?: string;
  isComplete: boolean;
}
export interface TaskCardProps {
  task: Task;
  setError: (error: string) => void;
  token: string | null;
  fetchTasks: () => void;
}

export interface TaskFormProps {
  error: string;
  setError: (error: string) => void;
  token: string | null;
  fetchTasks: () => void;
}

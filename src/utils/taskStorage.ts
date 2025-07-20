import { Task } from "@/types/Task";

const STORAGE_KEY = 'daily-task-manager-tasks';

export const loadTasks = (): Task[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading tasks from localStorage:', error);
    return [];
  }
};

export const saveTasks = (tasks: Task[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks to localStorage:', error);
  }
};

export const exportTasks = (tasks: Task[]): void => {
  const dataStr = JSON.stringify(tasks, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `tasks-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importTasks = (
  file: File, 
  onSuccess: (tasks: Task[]) => void, 
  onError: (error: string) => void
): void => {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const importedTasks = JSON.parse(content) as Task[];
      
      // Validate the imported data
      if (!Array.isArray(importedTasks)) {
        throw new Error('Invalid file format');
      }
      
      // Validate each task has required fields
      const validTasks = importedTasks.filter(task => 
        task.id && 
        task.title && 
        task.title.trim().length > 0 &&
        task.priority && 
        ['high', 'medium', 'low'].includes(task.priority) &&
        task.createdAt &&
        typeof task.completed === 'boolean'
      );
      
      if (validTasks.length === 0) {
        throw new Error('No valid tasks found in file');
      }
      
      // Sanitize task data
      const sanitizedTasks = validTasks.map(task => ({
        ...task,
        title: task.title.trim(),
        description: task.description?.trim() || '',
        dueDate: task.dueDate && task.dueDate.trim() ? task.dueDate : undefined
      }));
      
      onSuccess(sanitizedTasks);
    } catch (error) {
      onError('Invalid file format or corrupted data');
    }
  };
  
  reader.onerror = () => {
    onError('Failed to read file');
  };
  
  reader.readAsText(file);
};
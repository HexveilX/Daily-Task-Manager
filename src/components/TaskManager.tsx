
import { useState, useEffect } from "react";
import { Plus, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import TaskCard from "./TaskCard";
import AddTaskModal from "./AddTaskModal";
import TaskStats from "./TaskStats";
import { Task, TaskPriority } from "@/types/Task";
import { loadTasks, saveTasks } from "@/utils/taskStorage";

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'created'>('priority');

  useEffect(() => {
    const savedTasks = loadTasks();
    setTasks(savedTasks);
  }, []);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const addTask = (newTask: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [task, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const toggleComplete = (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const getFilteredTasks = () => {
    let filtered = tasks;
    
    switch (filter) {
      case 'pending':
        filtered = tasks.filter(task => !task.completed);
        break;
      case 'completed':
        filtered = tasks.filter(task => task.completed);
        break;
      default:
        filtered = tasks;
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      } else if (sortBy === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Daily Task Manager</h1>
        <p className="text-gray-600">Stay organized and boost your productivity</p>
      </div>

      {/* Stats */}
      <TaskStats tasks={tasks} />

      {/* Controls */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg border border-white/20">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className="gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              All Tasks
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
              className="gap-2"
            >
              <Clock className="w-4 h-4" />
              Pending
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              onClick={() => setFilter('completed')}
              className="gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Completed
            </Button>
          </div>

          <div className="flex gap-2 items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="priority">Sort by Priority</option>
              <option value="dueDate">Sort by Due Date</option>
              <option value="created">Sort by Created</option>
            </select>

            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {filter === 'completed' ? 'No completed tasks yet' : 
               filter === 'pending' ? 'No pending tasks' : 'No tasks yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {filter === 'all' ? 'Create your first task to get started!' : 
               filter === 'pending' ? 'All tasks are completed! Great job!' : 
               'Complete some tasks to see them here.'}
            </p>
            {filter === 'all' && (
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Plus className="w-4 h-4" />
                Add Your First Task
              </Button>
            )}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={toggleComplete}
              onUpdate={updateTask}
              onDelete={deleteTask}
            />
          ))
        )}
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTask={addTask}
      />
    </div>
  );
};

export default TaskManager;


import { useState, useEffect } from "react";
import { Plus, Filter, SortAsc } from "lucide-react";
import { Button } from "@/components/ui/button";
import TaskCard from "./TaskCard";
import AddTaskModal from "./AddTaskModal";
import TaskStats from "./TaskStats";
import AuthModal from "./AuthModal";
import { Task, TaskPriority } from "@/types/Task";
import { loadTasks, saveTasks } from "@/utils/taskStorage";

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'created'>('priority');
  const [user, setUser] = useState<{username: string, email: string} | null>(null);

  useEffect(() => {
    const savedTasks = loadTasks();
    const savedUser = localStorage.getItem('taskManager_user');
    setTasks(savedTasks);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const handleLogin = (userData: {username: string, email: string}) => {
    setUser(userData);
    localStorage.setItem('taskManager_user', JSON.stringify(userData));
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('taskManager_user');
  };

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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100 max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">مدير المهام اليومية</h1>
          <p className="text-gray-600 mb-6">سجل دخولك لإدارة مهامك بكفاءة</p>
          <Button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium"
          >
            تسجيل الدخول
          </Button>
        </div>
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={handleLogin}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">مدير المهام اليومية</h1>
              <p className="text-gray-600">مرحباً {user.username}</p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-gray-200 hover:bg-gray-50"
            >
              تسجيل الخروج
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <TaskStats tasks={tasks} />
        </div>

        {/* Controls */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                    : 'border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                جميع المهام
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'pending' 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                    : 'border-gray-200 hover:bg-orange-50 hover:border-orange-300'
                }`}
              >
                المهام المعلقة
              </Button>
              <Button
                variant={filter === 'completed' ? 'default' : 'outline'}
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'completed' 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'border-gray-200 hover:bg-green-50 hover:border-green-300'
                }`}
              >
                المهام المكتملة
              </Button>
            </div>

            {/* Sort and Add */}
            <div className="flex gap-3 items-center">
              <div className="flex items-center gap-2">
                <SortAsc className="w-4 h-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="priority">ترتيب حسب الأولوية</option>
                  <option value="dueDate">ترتيب حسب التاريخ</option>
                  <option value="created">ترتيب حسب الإنشاء</option>
                </select>
              </div>

              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                إضافة مهمة
              </Button>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Plus className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {filter === 'completed' ? 'لا توجد مهام مكتملة بعد' : 
                   filter === 'pending' ? 'لا توجد مهام معلقة' : 'لا توجد مهام بعد'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {filter === 'all' ? 'أنشئ مهمتك الأولى للبدء!' : 
                   filter === 'pending' ? 'جميع المهام مكتملة! عمل رائع!' : 
                   'أكمل بعض المهام لرؤيتها هنا.'}
                </p>
                {filter === 'all' && (
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    أضف مهمتك الأولى
                  </Button>
                )}
              </div>
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

        <AddTaskModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddTask={addTask}
        />
      </div>
    </div>
  );
};

export default TaskManager;

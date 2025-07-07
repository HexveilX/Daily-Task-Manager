import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Filter, SortAsc, Search, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TaskCard from "./TaskCard";
import AddTaskModal from "./AddTaskModal";
import TaskStats from "./TaskStats";
import AuthModal from "./AuthModal";
import BackgroundEffects from "./BackgroundEffects";
import { Task, TaskPriority } from "@/types/Task";
import { loadTasks, saveTasks, exportTasks, importTasks } from "@/utils/taskStorage";
import { toast } from "@/components/ui/sonner";

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'created'>('priority');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<{username: string, email: string} | null>(null);

  // Load initial data
  useEffect(() => {
    const savedTasks = loadTasks();
    const savedUser = localStorage.getItem('taskManager_user');
    setTasks(savedTasks);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Debounced save to localStorage
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveTasks(tasks);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [tasks]);

  const handleLogin = useCallback((userData: {username: string, email: string}) => {
    setUser(userData);
    localStorage.setItem('taskManager_user', JSON.stringify(userData));
    setIsAuthModalOpen(false);
    toast.success(`مرحباً ${userData.username}!`);
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('taskManager_user');
    toast.success('تم تسجيل الخروج بنجاح');
  }, []);

  const addTask = useCallback((newTask: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    const task: Task = {
      ...newTask,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [task, ...prev]);
    toast.success('تم إضافة المهمة بنجاح');
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
    toast.success('تم تحديث المهمة');
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    toast.success('تم حذف المهمة');
  }, []);

  const toggleComplete = useCallback((id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const newCompleted = !task.completed;
        if (newCompleted) {
          toast.success('تم إكمال المهمة! 🎉');
        }
        return { ...task, completed: newCompleted };
      }
      return task;
    }));
  }, []);

  const handleExport = useCallback(() => {
    try {
      exportTasks(tasks);
      toast.success('تم تصدير المهام بنجاح');
    } catch (error) {
      toast.error('فشل في تصدير المهام');
    }
  }, [tasks]);

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importTasks(file, (importedTasks) => {
        setTasks(prev => [...importedTasks, ...prev]);
        toast.success(`تم استيراد ${importedTasks.length} مهمة`);
      }, (error) => {
        toast.error('فشل في استيراد المهام');
      });
    }
  }, []);

  // Memoized filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    switch (filter) {
      case 'pending':
        filtered = filtered.filter(task => !task.completed);
        break;
      case 'completed':
        filtered = filtered.filter(task => task.completed);
        break;
      default:
        break;
    }

    // Apply sorting
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
  }, [tasks, filter, sortBy, searchQuery]);

  // Motivational quotes
  const motivationalQuotes = [
    "النجاح هو نتيجة التحضير والعمل الجاد والتعلم من الفشل",
    "لا تؤجل عمل اليوم إلى الغد",
    "البداية هي أهم جزء في العمل",
    "الطريق إلى النجاح يبدأ بخطوة واحدة",
    "اجعل كل يوم تحفة فنية من الإنجازات",
    "الإنجاز الصغير أفضل من الأحلام الكبيرة",
    "كل خطوة تقربك من هدفك تستحق الاحتفال"
  ];

  const todayQuote = motivationalQuotes[new Date().getDay() % motivationalQuotes.length];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative">
        <BackgroundEffects />
        <div className="bg-gradient-to-br from-slate-800/90 to-purple-800/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-700/50 max-w-md w-full text-center relative z-10">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Plus className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
              مدير المهام اليومية
            </h1>
            <p className="text-slate-300 mb-2">سجل دخولك لإدارة مهامك بكفاءة</p>
            <p className="text-purple-300 text-sm italic">"{todayQuote}"</p>
          </div>
          <Button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      <BackgroundEffects />
      <div className="container mx-auto px-4 py-6 max-w-5xl relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-800/90 to-purple-800/90 backdrop-blur-xl rounded-3xl p-6 mb-6 shadow-xl border border-slate-700/50">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
                مدير المهام اليومية
              </h1>
              <p className="text-slate-300 mb-2">مرحباً {user.username}</p>
              <p className="text-purple-300 text-sm italic">"{todayQuote}"</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="border-slate-600 hover:bg-slate-700/50 text-slate-300 hover:text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                تصدير
              </Button>
              <label className="cursor-pointer">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-600 hover:bg-slate-700/50 text-slate-300 hover:text-white"
                  asChild
                >
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    استيراد
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-slate-600 hover:bg-slate-700/50 text-slate-300 hover:text-white"
              >
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <TaskStats tasks={tasks} />
        </div>

        {/* Search and Controls */}
        <div className="bg-gradient-to-br from-slate-800/90 to-purple-800/90 backdrop-blur-xl rounded-3xl p-4 mb-6 shadow-xl border border-slate-700/50">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="البحث في المهام..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 py-3 border-slate-600 bg-slate-700/50 text-slate-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                size="sm"
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'all' 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg' 
                    : 'border-slate-600 hover:bg-slate-700/50 text-slate-300 hover:text-white'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                الكل ({tasks.length})
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilter('pending')}
                size="sm"
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'pending' 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg' 
                    : 'border-slate-600 hover:bg-slate-700/50 text-slate-300 hover:text-white'
                }`}
              >
                المعلقة ({tasks.filter(t => !t.completed).length})
              </Button>
              <Button
                variant={filter === 'completed' ? 'default' : 'outline'}
                onClick={() => setFilter('completed')}
                size="sm"
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'completed' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg' 
                    : 'border-slate-600 hover:bg-slate-700/50 text-slate-300 hover:text-white'
                }`}
              >
                المكتملة ({tasks.filter(t => t.completed).length})
              </Button>
            </div>

            {/* Sort and Add */}
            <div className="flex gap-3 items-center">
              <div className="flex items-center gap-2">
                <SortAsc className="w-4 h-4 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-slate-600 rounded-lg bg-slate-800/90 text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                >
                  <option value="priority">ترتيب حسب الأولوية</option>
                  <option value="dueDate">ترتيب حسب التاريخ</option>
                  <option value="created">ترتيب حسب الإنشاء</option>
                </select>
              </div>

              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-medium shadow-lg"
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
              <div className="bg-gradient-to-br from-slate-800/90 to-purple-800/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-slate-700/50">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-purple-500/30">
                  <Plus className="w-12 h-12 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-300 mb-2">
                  {searchQuery ? 'لا توجد نتائج للبحث' :
                   filter === 'completed' ? 'لا توجد مهام مكتملة بعد' : 
                   filter === 'pending' ? 'لا توجد مهام معلقة' : 'لا توجد مهام بعد'}
                </h3>
                <p className="text-slate-400 mb-4">
                  {searchQuery ? `جرب البحث عن شيء آخر` :
                   filter === 'all' ? 'أنشئ مهمتك الأولى للبدء!' : 
                   filter === 'pending' ? 'جميع المهام مكتملة! عمل رائع!' : 
                   'أكمل بعض المهام لرؤيتها هنا.'}
                </p>
                {(filter === 'all' || !searchQuery) && (
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-medium shadow-lg"
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
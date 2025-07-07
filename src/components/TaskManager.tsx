import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Filter, SortAsc, Search, Download, Upload, Calendar, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import TaskCard from "./TaskCard";
import AddTaskModal from "./AddTaskModal";
import TaskStats from "./TaskStats";
import AuthModal from "./AuthModal";
import ThemeToggle from "./ThemeToggle";
import { Task, TaskPriority } from "@/types/Task";
import { loadTasks, saveTasks, exportTasks, importTasks } from "@/utils/taskStorage";
import { toast } from "@/components/ui/sonner";

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'today' | 'overdue'>('all');
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

  // Auto-save with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveTasks(tasks);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [tasks]);

  // Check for overdue tasks and show notifications
  useEffect(() => {
    if (tasks.length > 0) {
      const overdueTasks = tasks.filter(task => 
        task.dueDate && 
        new Date(task.dueDate) < new Date() && 
        !task.completed
      );
      
      if (overdueTasks.length > 0) {
        toast.warning(`لديك ${overdueTasks.length} مهمة متأخرة!`, {
          duration: 5000,
        });
      }
    }
  }, [tasks]);

  const handleLogin = useCallback((userData: {username: string, email: string}) => {
    setUser(userData);
    localStorage.setItem('taskManager_user', JSON.stringify(userData));
    setIsAuthModalOpen(false);
    toast.success(`مرحباً ${userData.username}! 🎉`);
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
    toast.success('تم إضافة المهمة بنجاح ✅');
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
    toast.success('تم تحديث المهمة 📝');
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    toast.success('تم حذف المهمة 🗑️');
  }, []);

  const toggleComplete = useCallback((id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const newCompleted = !task.completed;
        if (newCompleted) {
          toast.success('تم إكمال المهمة! 🎉', {
            description: 'أحسنت! استمر في العمل الرائع',
          });
        }
        return { ...task, completed: newCompleted };
      }
      return task;
    }));
  }, []);

  const handleExport = useCallback(() => {
    try {
      exportTasks(tasks);
      toast.success('تم تصدير المهام بنجاح 📤');
    } catch (error) {
      toast.error('فشل في تصدير المهام ❌');
    }
  }, [tasks]);

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importTasks(file, (importedTasks) => {
        setTasks(prev => [...importedTasks, ...prev]);
        toast.success(`تم استيراد ${importedTasks.length} مهمة بنجاح 📥`);
      }, (error) => {
        toast.error('فشل في استيراد المهام ❌');
      });
    }
    // Reset file input
    event.target.value = '';
  }, []);

  // Enhanced filtering with new options
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
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    switch (filter) {
      case 'pending':
        filtered = filtered.filter(task => !task.completed);
        break;
      case 'completed':
        filtered = filtered.filter(task => task.completed);
        break;
      case 'today':
        filtered = filtered.filter(task => 
          task.dueDate && 
          new Date(task.dueDate) >= todayStart && 
          new Date(task.dueDate) <= today &&
          !task.completed
        );
        break;
      case 'overdue':
        filtered = filtered.filter(task => 
          task.dueDate && 
          new Date(task.dueDate) < todayStart && 
          !task.completed
        );
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

  // Calculate filter counts
  const filterCounts = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    return {
      all: tasks.length,
      pending: tasks.filter(t => !t.completed).length,
      completed: tasks.filter(t => t.completed).length,
      today: tasks.filter(t => 
        t.dueDate && 
        new Date(t.dueDate) >= todayStart && 
        new Date(t.dueDate) <= today &&
        !t.completed
      ).length,
      overdue: tasks.filter(t => 
        t.dueDate && 
        new Date(t.dueDate) < todayStart && 
        !t.completed
      ).length,
    };
  }, [tasks]);

  // Motivational quotes with more variety
  const motivationalQuotes = [
    "النجاح هو نتيجة التحضير والعمل الجاد والتعلم من الفشل",
    "لا تؤجل عمل اليوم إلى الغد",
    "البداية هي أهم جزء في العمل",
    "الطريق إلى النجاح يبدأ بخطوة واحدة",
    "اجعل كل يوم تحفة فنية من الإنجازات",
    "الإنجاز الصغير أفضل من الأحلام الكبيرة",
    "كل خطوة تقربك من هدفك تستحق الاحتفال",
    "التنظيم هو مفتاح الإنتاجية",
    "اليوم هو أول يوم من باقي حياتك",
    "الثبات على الهدف يحقق المعجزات"
  ];

  const todayQuote = motivationalQuotes[new Date().getDay() % motivationalQuotes.length];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-2xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              مدير المهام اليومية
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-2">سجل دخولك لإدارة مهامك بكفاءة</p>
            <p className="text-blue-600 dark:text-blue-400 text-sm italic bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              "{todayQuote}"
            </p>
          </div>
          <Button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 dark:from-blue-600 dark:to-purple-700 dark:hover:from-blue-700 dark:hover:to-purple-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                مدير المهام اليومية
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-2">مرحباً {user.username} 👋</p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-blue-600 dark:text-blue-400 text-sm italic">"{todayQuote}"</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={tasks.length === 0}
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <Download className="w-4 h-4 mr-2" />
                تصدير
              </Button>
              <label className="cursor-pointer">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
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
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <Input
                placeholder="البحث في المهام..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 py-3 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
              />
            </div>

            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                  size="sm"
                  className={`px-4 py-2 rounded-lg font-medium ${
                    filter === 'all' 
                      ? 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white' 
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  الكل
                  <Badge variant="secondary" className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {filterCounts.all}
                  </Badge>
                </Button>
                
                <Button
                  variant={filter === 'today' ? 'default' : 'outline'}
                  onClick={() => setFilter('today')}
                  size="sm"
                  className={`px-4 py-2 rounded-lg font-medium ${
                    filter === 'today' 
                      ? 'bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white' 
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  اليوم
                  <Badge variant="secondary" className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {filterCounts.today}
                  </Badge>
                </Button>

                <Button
                  variant={filter === 'pending' ? 'default' : 'outline'}
                  onClick={() => setFilter('pending')}
                  size="sm"
                  className={`px-4 py-2 rounded-lg font-medium ${
                    filter === 'pending' 
                      ? 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white' 
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  المعلقة
                  <Badge variant="secondary" className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {filterCounts.pending}
                  </Badge>
                </Button>

                <Button
                  variant={filter === 'overdue' ? 'default' : 'outline'}
                  onClick={() => setFilter('overdue')}
                  size="sm"
                  className={`px-4 py-2 rounded-lg font-medium ${
                    filter === 'overdue' 
                      ? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white' 
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  متأخرة
                  <Badge variant="secondary" className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {filterCounts.overdue}
                  </Badge>
                </Button>

                <Button
                  variant={filter === 'completed' ? 'default' : 'outline'}
                  onClick={() => setFilter('completed')}
                  size="sm"
                  className={`px-4 py-2 rounded-lg font-medium ${
                    filter === 'completed' 
                      ? 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white' 
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  المكتملة
                  <Badge variant="secondary" className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {filterCounts.completed}
                  </Badge>
                </Button>
              </div>

              {/* Sort and Add */}
              <div className="flex gap-3 items-center">
                <div className="flex items-center gap-2">
                  <SortAsc className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-sm"
                  >
                    <option value="priority">ترتيب حسب الأولوية</option>
                    <option value="dueDate">ترتيب حسب التاريخ</option>
                    <option value="created">ترتيب حسب الإنشاء</option>
                  </select>
                </div>

                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 dark:from-blue-600 dark:to-purple-700 dark:hover:from-blue-700 dark:hover:to-purple-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة مهمة
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                  <Plus className="w-12 h-12 text-blue-500 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {searchQuery ? 'لا توجد نتائج للبحث' :
                   filter === 'completed' ? 'لا توجد مهام مكتملة بعد' : 
                   filter === 'pending' ? 'لا توجد مهام معلقة' : 
                   filter === 'today' ? 'لا توجد مهام لليوم' :
                   filter === 'overdue' ? 'لا توجد مهام متأخرة' :
                   'لا توجد مهام بعد'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchQuery ? `جرب البحث عن شيء آخر` :
                   filter === 'all' ? 'أنشئ مهمتك الأولى للبدء!' : 
                   filter === 'pending' ? 'جميع المهام مكتملة! عمل رائع!' : 
                   filter === 'today' ? 'لا توجد مهام مجدولة لليوم' :
                   filter === 'overdue' ? 'رائع! لا توجد مهام متأخرة' :
                   'أكمل بعض المهام لرؤيتها هنا.'}
                </p>
                {(filter === 'all' && !searchQuery) && (
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 dark:from-blue-600 dark:to-purple-700 dark:hover:from-blue-700 dark:hover:to-purple-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    أضف مهمتك الأولى
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={toggleComplete}
                  onUpdate={updateTask}
                  onDelete={deleteTask}
                />
              ))}
            </div>
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
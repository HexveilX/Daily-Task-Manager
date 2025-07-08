import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Filter, SortAsc, Search, Download, Upload, Calendar, BarChart3, Menu, X, Settings, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import TaskCard from "./TaskCard";
import AddTaskModal from "./AddTaskModal";
import TaskStats from "./TaskStats";
import AuthModal from "./AuthModal";
import ThemeToggle from "./ThemeToggle";
import { Task, TaskPriority } from "@/types/Task";
import { exportTasks, importTasks } from "@/utils/taskStorage";
import { toast } from "@/components/ui/sonner";
import { useSupabase } from "@/hooks/useSupabase";

const TaskManager = () => {
  const { user, loading, signIn, signUp, signOut, loadTasks, saveTask, deleteTask, updateTask } = useSupabase();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'today' | 'overdue'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'created'>('priority');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load tasks when user changes
  useEffect(() => {
    if (user) {
      loadUserTasks();
    } else {
      setTasks([]);
    }
  }, [user]);

  const loadUserTasks = async () => {
    const userTasks = await loadTasks();
    setTasks(userTasks);
  };

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

  const handleLogin = useCallback(async (userData: {username: string, email: string, password?: string}) => {
    if (userData.password) {
      // This is a sign in
      await signIn(userData.email, userData.password);
    } else {
      // This is a sign up - we need to handle this differently
      // For now, we'll just close the modal since the auth is handled in AuthModal
      setIsAuthModalOpen(false);
    }
  }, [signIn]);

  const handleLogout = useCallback(async () => {
    await signOut();
    setTasks([]);
  }, [signOut]);

  const addTask = useCallback(async (newTask: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    const savedTask = await saveTask({
      ...newTask,
      completed: false
    });
    
    if (savedTask) {
      const task: Task = {
        id: savedTask.id,
        title: savedTask.title,
        description: savedTask.description || '',
        priority: savedTask.priority as TaskPriority,
        dueDate: savedTask.deadline || undefined,
        completed: savedTask.completed || false,
        createdAt: savedTask.created_at
      };
      setTasks(prev => [task, ...prev]);
      toast.success('تم إضافة المهمة بنجاح ✅');
    }
  }, [saveTask]);

  const updateTaskHandler = useCallback(async (id: string, updates: Partial<Task>) => {
    const updatedTask = await updateTask(id, updates);
    if (updatedTask) {
      setTasks(prev => prev.map(task => 
        task.id === id ? {
          ...task,
          title: updatedTask.title,
          description: updatedTask.description || '',
          priority: updatedTask.priority as TaskPriority,
          dueDate: updatedTask.deadline || undefined,
          completed: updatedTask.completed || false
        } : task
      ));
      toast.success('تم تحديث المهمة 📝');
    }
  }, [updateTask]);

  const deleteTaskHandler = useCallback(async (id: string) => {
    const success = await deleteTask(id);
    if (success) {
      setTasks(prev => prev.filter(task => task.id !== id));
      toast.success('تم حذف المهمة 🗑️');
    }
  }, [deleteTask]);

  const toggleComplete = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const newCompleted = !task.completed;
      await updateTaskHandler(id, { completed: newCompleted });
      
      if (newCompleted) {
        toast.success('تم إكمال المهمة! 🎉', {
          description: 'أحسنت! استمر في العمل الرائع',
        });
      }
    }
  }, [tasks, updateTaskHandler]);

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
      importTasks(file, async (importedTasks) => {
        // Save imported tasks to Supabase
        for (const task of importedTasks) {
          await saveTask({
            title: task.title,
            description: task.description,
            priority: task.priority,
            dueDate: task.dueDate,
            completed: task.completed
          });
        }
        // Reload tasks from database
        await loadUserTasks();
        toast.success(`تم استيراد ${importedTasks.length} مهمة بنجاح 📥`);
      }, (error) => {
        toast.error('فشل في استيراد المهام ❌');
      });
    }
    // Reset file input
    event.target.value = '';
  }, [saveTask, loadUserTasks]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-gray-700 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-2xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              مدير المهام اليومية
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-2 text-sm sm:text-base">سجل دخولك لإدارة مهامك بكفاءة</p>
            <p className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm italic bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
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
          onSignUp={signUp}
          onSignIn={signIn}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Top Navigation Bar */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">مدير المهام</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">مرحباً {user.username} 👋</p>
              </div>
            </div>

            {/* Desktop Controls */}
            <div className="hidden sm:flex items-center gap-3">
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
                <LogOut className="w-4 h-4 mr-2" />
                تسجيل الخروج
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="sm:hidden flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="border-gray-300 dark:border-gray-600 h-10 w-10 p-0 rounded-lg"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="sm:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  disabled={tasks.length === 0}
                  className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  تصدير المهام
                </Button>
                <label className="cursor-pointer">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 justify-start w-full"
                    asChild
                  >
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      استيراد المهام
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
                  className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 justify-start col-span-2"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  تسجيل الخروج
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-6xl">
        {/* Welcome Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center sm:text-right">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              مرحباً {user.username} 👋
            </h2>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
              <p className="text-blue-600 dark:text-blue-400 text-sm sm:text-base italic">"{todayQuote}"</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-4 sm:mb-6">
          <TaskStats tasks={tasks} />
        </div>

        {/* Search and Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 sm:mb-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative w-full">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <Input
                placeholder="البحث في المهام..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 py-3 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
              />
            </div>

            <div className="flex flex-col gap-4">
              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                  size="sm"
                  className={`px-3 py-2 rounded-lg font-medium text-xs sm:text-sm ${
                    filter === 'all' 
                      ? 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white' 
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  الكل
                  <Badge variant="secondary" className="mr-1 sm:mr-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs">
                    {filterCounts.all}
                  </Badge>
                </Button>
                
                <Button
                  variant={filter === 'today' ? 'default' : 'outline'}
                  onClick={() => setFilter('today')}
                  size="sm"
                  className={`px-3 py-2 rounded-lg font-medium text-xs sm:text-sm ${
                    filter === 'today' 
                      ? 'bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white' 
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  اليوم
                  <Badge variant="secondary" className="mr-1 sm:mr-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs">
                    {filterCounts.today}
                  </Badge>
                </Button>

                <Button
                  variant={filter === 'pending' ? 'default' : 'outline'}
                  onClick={() => setFilter('pending')}
                  size="sm"
                  className={`px-3 py-2 rounded-lg font-medium text-xs sm:text-sm ${
                    filter === 'pending' 
                      ? 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white' 
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  المعلقة
                  <Badge variant="secondary" className="mr-1 sm:mr-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs">
                    {filterCounts.pending}
                  </Badge>
                </Button>

                <Button
                  variant={filter === 'overdue' ? 'default' : 'outline'}
                  onClick={() => setFilter('overdue')}
                  size="sm"
                  className={`px-3 py-2 rounded-lg font-medium text-xs sm:text-sm ${
                    filter === 'overdue' 
                      ? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white' 
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  متأخرة
                  <Badge variant="secondary" className="mr-1 sm:mr-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs">
                    {filterCounts.overdue}
                  </Badge>
                </Button>

                <Button
                  variant={filter === 'completed' ? 'default' : 'outline'}
                  onClick={() => setFilter('completed')}
                  size="sm"
                  className={`px-3 py-2 rounded-lg font-medium text-xs sm:text-sm ${
                    filter === 'completed' 
                      ? 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white' 
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  المكتملة
                  <Badge variant="secondary" className="mr-1 sm:mr-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs">
                    {filterCounts.completed}
                  </Badge>
                </Button>
              </div>

              {/* Sort and Add */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <SortAsc className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-sm flex-1 sm:flex-none"
                  >
                    <option value="priority">ترتيب حسب الأولوية</option>
                    <option value="dueDate">ترتيب حسب التاريخ</option>
                    <option value="created">ترتيب حسب الإنشاء</option>
                  </select>
                </div>

                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 dark:from-blue-600 dark:to-purple-700 dark:hover:from-blue-700 dark:hover:to-purple-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
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
            <div className="text-center py-8 sm:py-12">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                  <Plus className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500 dark:text-blue-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {searchQuery ? 'لا توجد نتائج للبحث' :
                   filter === 'completed' ? 'لا توجد مهام مكتملة بعد' : 
                   filter === 'pending' ? 'لا توجد مهام معلقة' : 
                   filter === 'today' ? 'لا توجد مهام لليوم' :
                   filter === 'overdue' ? 'لا توجد مهام متأخرة' :
                   'لا توجد مهام بعد'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm sm:text-base">
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
                  onUpdate={updateTaskHandler}
                  onDelete={deleteTaskHandler}
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
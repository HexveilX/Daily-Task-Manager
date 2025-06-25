
import { useState, useEffect } from "react";
import { Plus, Filter, SortAsc } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              مدير المهام اليومية
            </h1>
            <p className="text-xl text-gray-600 font-medium">
              نظم مهامك وارفع إنتاجيتك
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <TaskStats tasks={tasks} />
        </div>

        {/* Controls */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 mb-8 shadow-xl border border-white/30">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  filter === 'all' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg' 
                    : 'border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                جميع المهام
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilter('pending')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  filter === 'pending' 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg' 
                    : 'border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                }`}
              >
                المهام المعلقة
              </Button>
              <Button
                variant={filter === 'completed' ? 'default' : 'outline'}
                onClick={() => setFilter('completed')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  filter === 'completed' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg' 
                    : 'border-2 border-gray-200 hover:border-green-300 hover:bg-green-50'
                }`}
              >
                المهام المكتملة
              </Button>
            </div>

            {/* Sort and Add */}
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <SortAsc className="w-5 h-5 text-gray-600" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                >
                  <option value="priority">ترتيب حسب الأولوية</option>
                  <option value="dueDate">ترتيب حسب التاريخ</option>
                  <option value="created">ترتيب حسب الإنشاء</option>
                </select>
              </div>

              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                إضافة مهمة
              </Button>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="grid gap-6">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-xl border border-white/30">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <Plus className="w-16 h-16 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-4">
                  {filter === 'completed' ? 'لا توجد مهام مكتملة بعد' : 
                   filter === 'pending' ? 'لا توجد مهام معلقة' : 'لا توجد مهام بعد'}
                </h3>
                <p className="text-gray-500 mb-6 text-lg">
                  {filter === 'all' ? 'أنشئ مهمتك الأولى للبدء!' : 
                   filter === 'pending' ? 'جميع المهام مكتملة! عمل رائع!' : 
                   'أكمل بعض المهام لرؤيتها هنا.'}
                </p>
                {filter === 'all' && (
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Plus className="w-5 h-5 mr-2" />
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

        {/* Add Task Modal */}
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

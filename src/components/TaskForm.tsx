import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DatePicker from "./DatePicker";
import { Task, TaskPriority } from "@/types/Task";

interface TaskFormProps {
  initialData?: {
    title: string;
    description: string;
    priority: TaskPriority;
    dueDate: string;
  };
  onSubmit: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
  onCancel: () => void;
  submitLabel: string;
}

const TaskForm = ({ initialData, onSubmit, onCancel, submitLabel }: TaskFormProps) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'medium' as TaskPriority,
    dueDate: initialData?.dueDate || '',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'عنوان المهمة مطلوب';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'عنوان المهمة يجب أن يكون 3 أحرف على الأقل';
    }
    
    if (formData.dueDate && formData.dueDate.trim()) {
      try {
        const selectedDate = new Date(formData.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (isNaN(selectedDate.getTime())) {
          newErrors.dueDate = 'تاريخ غير صحيح';
        } else if (selectedDate < today) {
          newErrors.dueDate = 'تاريخ الانتهاء يجب أن يكون اليوم أو في المستقبل';
        }
      } catch {
        newErrors.dueDate = 'تاريخ غير صحيح';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Simulate a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        dueDate: formData.dueDate && formData.dueDate.trim() ? formData.dueDate : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, title: value }));
    
    // Clear title error when user starts typing
    if (errors.title && value.trim().length >= 3) {
      setErrors(prev => ({ ...prev, title: '' }));
    }
  };

  const handleDateChange = (date: string) => {
    setFormData(prev => ({ ...prev, dueDate: date }));
    
    // Clear date error when user selects a valid date
    if (errors.dueDate && date && date.trim()) {
      try {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (!isNaN(selectedDate.getTime()) && selectedDate >= today) {
          setErrors(prev => ({ ...prev, dueDate: '' }));
        }
      } catch {
        // Keep the error if date parsing fails
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6">
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <div>
          <Label htmlFor="title" className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            عنوان المهمة *
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="أدخل عنوان المهمة..."
            className={`py-3 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-colors ${
              errors.title ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20' : ''
            }`}
            required
            maxLength={100}
          />
          {errors.title && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1 flex items-center gap-1">
              <span>⚠️</span>
              {errors.title}
            </p>
          )}
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
            {formData.title.length}/100 حرف
          </p>
        </div>

        <div>
          <Label htmlFor="description" className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            الوصف
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="أضف تفاصيل المهمة (اختياري)..."
            className="py-3 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 resize-none transition-colors"
            rows={3}
            maxLength={500}
          />
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
            {formData.description.length}/500 حرف
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <Label htmlFor="priority" className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-3 block">
              الأولوية
            </Label>
            <Select
              value={formData.priority}
              onValueChange={(value: TaskPriority) => 
                setFormData(prev => ({ ...prev, priority: value }))
              }
            >
              <SelectTrigger className="py-4 px-4 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 shadow-sm hover:shadow-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-xl">
                <SelectItem value="low" className="hover:bg-green-50 dark:hover:bg-green-900/30 text-gray-800 dark:text-gray-200 py-3">
                  🟢 منخفضة
                </SelectItem>
                <SelectItem value="medium" className="hover:bg-yellow-50 dark:hover:bg-yellow-900/30 text-gray-800 dark:text-gray-200 py-3">
                  🟡 متوسطة
                </SelectItem>
                <SelectItem value="high" className="hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-800 dark:text-gray-200 py-3">
                  🔴 عالية
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
              حدد مستوى أولوية المهمة
            </p>
          </div>

          <div>
            <Label htmlFor="dueDate" className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-3 block">
              تاريخ الانتهاء
            </Label>
            <DatePicker
              value={formData.dueDate}
              onChange={handleDateChange}
              placeholder="اختر تاريخ الانتهاء"
            />
            {errors.dueDate && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                <span>⚠️</span>
                {errors.dueDate}
              </p>
            )}
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
              اختر تاريخ انتهاء المهمة (اختياري)
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="submit"
            disabled={!formData.title.trim() || isSubmitting}
            className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 dark:from-blue-600 dark:to-purple-700 dark:hover:from-blue-700 dark:hover:to-purple-800 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري الحفظ...
              </div>
            ) : (
              submitLabel
            )}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            disabled={isSubmitting}
            className="flex-1 py-3 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
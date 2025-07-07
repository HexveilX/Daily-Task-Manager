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

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'عنوان المهمة مطلوب';
    }
    
    if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
      newErrors.dueDate = 'تاريخ الانتهاء يجب أن يكون في المستقبل';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      dueDate: formData.dueDate || undefined,
    });
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="title" className="text-base font-medium text-slate-300 mb-2 block">
            عنوان المهمة *
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="أدخل عنوان المهمة..."
            className={`py-3 border-slate-600 bg-slate-700/50 text-slate-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 ${
              errors.title ? 'border-red-500' : ''
            }`}
            required
          />
          {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
        </div>

        <div>
          <Label htmlFor="description" className="text-base font-medium text-slate-300 mb-2 block">
            الوصف
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="أضف تفاصيل المهمة (اختياري)..."
            className="py-3 border-slate-600 bg-slate-700/50 text-slate-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label htmlFor="priority" className="text-base font-medium text-slate-300 mb-2 block">
              الأولوية
            </Label>
            <Select
              value={formData.priority}
              onValueChange={(value: TaskPriority) => 
                setFormData(prev => ({ ...prev, priority: value }))
              }
            >
              <SelectTrigger className="py-3 border-slate-600 bg-slate-700/50 text-slate-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border border-slate-600 rounded-lg">
                <SelectItem value="low" className="hover:bg-green-500/20 text-slate-200">منخفضة</SelectItem>
                <SelectItem value="medium" className="hover:bg-yellow-500/20 text-slate-200">متوسطة</SelectItem>
                <SelectItem value="high" className="hover:bg-red-500/20 text-slate-200">عالية</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dueDate" className="text-base font-medium text-slate-300 mb-2 block">
              تاريخ الانتهاء
            </Label>
            <DatePicker
              value={formData.dueDate}
              onChange={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
              placeholder="اختر تاريخ الانتهاء"
            />
            {errors.dueDate && <p className="text-red-400 text-sm mt-1">{errors.dueDate}</p>}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={!formData.title.trim()}
            className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitLabel}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            className="flex-1 py-3 border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700/50"
          >
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
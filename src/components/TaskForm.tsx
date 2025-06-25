
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      dueDate: formData.dueDate || undefined,
    });
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="title" className="text-lg font-semibold text-gray-700 mb-2 block">
            عنوان المهمة *
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="أدخل عنوان المهمة..."
            className="text-lg p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            required
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-lg font-semibold text-gray-700 mb-2 block">
            الوصف
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="أضف تفاصيل المهمة (اختياري)..."
            className="text-base p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="priority" className="text-lg font-semibold text-gray-700 mb-2 block">
              الأولوية
            </Label>
            <Select
              value={formData.priority}
              onValueChange={(value: TaskPriority) => 
                setFormData(prev => ({ ...prev, priority: value }))
              }
            >
              <SelectTrigger className="text-lg p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-xl border-2 border-gray-200 rounded-xl">
                <SelectItem value="low" className="text-base p-3 hover:bg-green-50">منخفضة</SelectItem>
                <SelectItem value="medium" className="text-base p-3 hover:bg-yellow-50">متوسطة</SelectItem>
                <SelectItem value="high" className="text-base p-3 hover:bg-red-50">عالية</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dueDate" className="text-lg font-semibold text-gray-700 mb-2 block">
              تاريخ الانتهاء
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="text-lg p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="flex gap-4 pt-6">
          <Button
            type="submit"
            disabled={!formData.title.trim()}
            className="flex-1 py-4 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {submitLabel}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            className="flex-1 py-4 text-lg font-semibold border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
          >
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;


import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TaskForm from "./TaskForm";
import { Task } from "@/types/Task";

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onUpdateTask: (updates: Partial<Task>) => void;
}

const EditTaskModal = ({ isOpen, onClose, task, onUpdateTask }: EditTaskModalProps) => {
  const handleSubmit = (taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    onUpdateTask(taskData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-800">
            تعديل المهمة
          </DialogTitle>
        </DialogHeader>
        
        <TaskForm
          initialData={{
            title: task.title,
            description: task.description || '',
            priority: task.priority,
            dueDate: task.dueDate || '',
          }}
          onSubmit={handleSubmit}
          onCancel={onClose}
          submitLabel="حفظ التغييرات"
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskModal;

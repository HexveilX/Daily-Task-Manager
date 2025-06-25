
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
      <DialogContent className="sm:max-w-2xl bg-white/95 backdrop-blur-xl border-2 border-white/30 rounded-2xl shadow-2xl">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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

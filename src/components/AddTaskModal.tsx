
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TaskForm from "./TaskForm";
import { Task } from "@/types/Task";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
}

const AddTaskModal = ({ isOpen, onClose, onAddTask }: AddTaskModalProps) => {
  const handleSubmit = (taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    onAddTask(taskData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-slate-800/95 to-purple-800/95 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            إضافة مهمة جديدة
          </DialogTitle>
        </DialogHeader>
        
        <TaskForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          submitLabel="إضافة المهمة"
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskModal;

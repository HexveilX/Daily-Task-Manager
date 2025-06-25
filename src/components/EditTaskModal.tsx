
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Edit Task
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
          submitLabel="Update Task"
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskModal;

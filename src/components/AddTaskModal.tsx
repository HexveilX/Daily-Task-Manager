
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TaskForm from "./TaskForm";
import { Task, TaskPriority } from "@/types/Task";

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Add New Task
          </DialogTitle>
        </DialogHeader>
        
        <TaskForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          submitLabel="Add Task"
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskModal;

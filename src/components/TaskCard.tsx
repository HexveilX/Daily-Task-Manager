
import { useState } from "react";
import { Check, Clock, Edit2, Trash2, AlertCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/types/Task";
import EditTaskModal from "./EditTaskModal";

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

const TaskCard = ({ task, onToggleComplete, onUpdate, onDelete }: TaskCardProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-4 h-4" />;
      case 'medium':
        return <Clock className="w-4 h-4" />;
      case 'low':
        return <Check className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
  const isDueSoon = task.dueDate && new Date(task.dueDate).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000 && !task.completed;

  return (
    <>
      <Card className={`p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-l-4 ${
        task.completed 
          ? 'bg-gray-50/70 border-l-gray-400 opacity-70' 
          : `bg-white/70 backdrop-blur-sm ${getPriorityColor(task.priority)} border-opacity-100`
      } ${isOverdue ? 'ring-2 ring-red-200' : ''}`}>
        <div className="flex items-start gap-4">
          <button
            onClick={() => onToggleComplete(task.id)}
            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
              task.completed
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
            }`}
          >
            {task.completed && <Check className="w-4 h-4" />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className={`font-semibold text-lg mb-2 ${
                  task.completed ? 'line-through text-gray-500' : 'text-gray-800'
                }`}>
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className={`text-sm mb-3 ${
                    task.completed ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {task.description}
                  </p>
                )}

                <div className="flex items-center gap-3 flex-wrap">
                  <Badge 
                    variant="secondary" 
                    className={`${getPriorityColor(task.priority)} text-white gap-1`}
                  >
                    {getPriorityIcon(task.priority)}
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </Badge>

                  {task.dueDate && (
                    <Badge 
                      variant="outline" 
                      className={`gap-1 ${
                        isOverdue ? 'border-red-500 text-red-600 bg-red-50' :
                        isDueSoon ? 'border-yellow-500 text-yellow-600 bg-yellow-50' :
                        'border-gray-300 text-gray-600'
                      }`}
                    >
                      <Calendar className="w-3 h-3" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </Badge>
                  )}

                  {isOverdue && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Overdue
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditModalOpen(true)}
                  className="hover:bg-blue-50 text-blue-600"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(task.id)}
                  className="hover:bg-red-50 text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={task}
        onUpdateTask={(updates) => onUpdate(task.id, updates)}
      />
    </>
  );
};

export default TaskCard;

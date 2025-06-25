
import { useState } from "react";
import { Check, Clock, Edit2, Trash2, AlertCircle, Calendar, Flag } from "lucide-react";
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

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          color: 'from-red-400 to-red-500',
          bg: 'bg-red-500',
          text: 'text-red-600',
          bgLight: 'bg-red-50',
          borderLight: 'border-red-200',
          icon: AlertCircle
        };
      case 'medium':
        return {
          color: 'from-yellow-400 to-yellow-500',
          bg: 'bg-yellow-500',
          text: 'text-yellow-600',
          bgLight: 'bg-yellow-50',
          borderLight: 'border-yellow-200',
          icon: Clock
        };
      case 'low':
        return {
          color: 'from-green-400 to-green-500',
          bg: 'bg-green-500',
          text: 'text-green-600',
          bgLight: 'bg-green-50',
          borderLight: 'border-green-200',
          icon: Flag
        };
      default:
        return {
          color: 'from-gray-400 to-gray-500',
          bg: 'bg-gray-500',
          text: 'text-gray-600',
          bgLight: 'bg-gray-50',
          borderLight: 'border-gray-200',
          icon: Clock
        };
    }
  };

  const priorityConfig = getPriorityConfig(task.priority);
  const PriorityIcon = priorityConfig.icon;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
  const isDueSoon = task.dueDate && new Date(task.dueDate).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000 && !task.completed;

  return (
    <>
      <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-md ${
        task.completed 
          ? 'bg-gray-50/80 backdrop-blur-sm border-gray-200 opacity-75' 
          : 'bg-white/90 backdrop-blur-sm border-gray-100 shadow-sm'
      } ${isOverdue ? 'ring-1 ring-red-300' : ''}`}>
        
        {/* Priority Indicator */}
        <div className={`absolute top-0 right-0 w-1 h-full bg-gradient-to-b ${priorityConfig.color}`} />
        
        <div className="p-5">
          <div className="flex items-start gap-4">
            {/* Completion Button */}
            <button
              onClick={() => onToggleComplete(task.id)}
              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                task.completed
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
              }`}
            >
              {task.completed && <Check className="w-3 h-3" />}
            </button>

            {/* Task Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className={`font-semibold text-lg mb-2 leading-tight ${
                    task.completed ? 'line-through text-gray-500' : 'text-gray-800'
                  }`}>
                    {task.title}
                  </h3>
                  
                  {task.description && (
                    <p className={`text-sm mb-3 leading-relaxed ${
                      task.completed ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {task.description}
                    </p>
                  )}

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge 
                      className={`px-2 py-1 text-xs rounded-full bg-gradient-to-r ${priorityConfig.color} text-white font-medium shadow-sm flex items-center gap-1`}
                    >
                      <PriorityIcon className="w-3 h-3" />
                      {task.priority === 'high' ? 'عالية' : task.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                    </Badge>

                    {task.dueDate && (
                      <Badge 
                        className={`px-2 py-1 text-xs rounded-full font-medium flex items-center gap-1 ${
                          isOverdue ? 'bg-red-100 text-red-700 border border-red-200' :
                          isDueSoon ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                          'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}
                      >
                        <Calendar className="w-3 h-3" />
                        {formatDate(task.dueDate)}
                      </Badge>
                    )}

                    {isOverdue && (
                      <Badge className="px-2 py-1 text-xs rounded-full bg-red-500 text-white font-medium shadow-sm flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        متأخرة
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditModalOpen(true)}
                    className="hover:bg-blue-100 text-blue-600 rounded-lg p-2 h-8 w-8"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(task.id)}
                    className="hover:bg-red-100 text-red-600 rounded-lg p-2 h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
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

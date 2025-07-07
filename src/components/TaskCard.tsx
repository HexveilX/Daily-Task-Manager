import { useState, memo } from "react";
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

const TaskCard = memo(({ task, onToggleComplete, onUpdate, onDelete }: TaskCardProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          color: 'from-red-500 to-pink-500',
          bg: 'bg-red-500',
          text: 'text-red-400',
          bgLight: 'bg-red-500/10',
          borderLight: 'border-red-500/30',
          icon: AlertCircle
        };
      case 'medium':
        return {
          color: 'from-yellow-500 to-orange-500',
          bg: 'bg-yellow-500',
          text: 'text-yellow-400',
          bgLight: 'bg-yellow-500/10',
          borderLight: 'border-yellow-500/30',
          icon: Clock
        };
      case 'low':
        return {
          color: 'from-green-500 to-emerald-500',
          bg: 'bg-green-500',
          text: 'text-green-400',
          bgLight: 'bg-green-500/10',
          borderLight: 'border-green-500/30',
          icon: Flag
        };
      default:
        return {
          color: 'from-slate-500 to-gray-500',
          bg: 'bg-slate-500',
          text: 'text-slate-400',
          bgLight: 'bg-slate-500/10',
          borderLight: 'border-slate-500/30',
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
      <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] ${
        task.completed 
          ? 'bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-xl border-slate-600/50 opacity-75' 
          : 'bg-gradient-to-br from-slate-800/90 to-purple-800/90 backdrop-blur-xl border-slate-700/50 shadow-lg hover:shadow-purple-500/20'
      } ${isOverdue ? 'ring-1 ring-red-400/50' : ''}`}>
        
        {/* Priority Indicator */}
        <div className={`absolute top-0 right-0 w-1 h-full bg-gradient-to-b ${priorityConfig.color}`} />
        
        <div className="p-5">
          <div className="flex items-start gap-4">
            {/* Completion Button */}
            <button
              onClick={() => onToggleComplete(task.id)}
              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                task.completed
                  ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30'
                  : 'border-slate-500 hover:border-green-400 hover:bg-green-500/10 hover:shadow-lg hover:shadow-green-500/20'
              }`}
            >
              {task.completed && <Check className="w-3 h-3" />}
            </button>

            {/* Task Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className={`font-semibold text-lg mb-2 leading-tight ${
                    task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                  }`}>
                    {task.title}
                  </h3>
                  
                  {task.description && (
                    <p className={`text-sm mb-3 leading-relaxed ${
                      task.completed ? 'text-slate-600' : 'text-slate-300'
                    }`}>
                      {task.description}
                    </p>
                  )}

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge 
                      className={`px-2 py-1 text-xs rounded-full bg-gradient-to-r ${priorityConfig.color} text-white font-medium shadow-lg flex items-center gap-1`}
                    >
                      <PriorityIcon className="w-3 h-3" />
                      {task.priority === 'high' ? 'عالية' : task.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                    </Badge>

                    {task.dueDate && (
                      <Badge 
                        className={`px-2 py-1 text-xs rounded-full font-medium flex items-center gap-1 ${
                          isOverdue ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                          isDueSoon ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                          'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        <Calendar className="w-3 h-3" />
                        {formatDate(task.dueDate)}
                      </Badge>
                    )}

                    {isOverdue && (
                      <Badge className="px-2 py-1 text-xs rounded-full bg-red-500 text-white font-medium shadow-lg flex items-center gap-1 animate-pulse">
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
                    className="hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 rounded-lg p-2 h-8 w-8 transition-all duration-200"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(task.id)}
                    className="hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg p-2 h-8 w-8 transition-all duration-200"
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
});

TaskCard.displayName = 'TaskCard';

export default TaskCard;
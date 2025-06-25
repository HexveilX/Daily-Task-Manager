
import { BarChart3, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Task } from "@/types/Task";

interface TaskStatsProps {
  tasks: Task[];
}

const TaskStats = ({ tasks }: TaskStatsProps) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = tasks.filter(task => !task.completed).length;
  const overdueTasks = tasks.filter(task => 
    task.dueDate && 
    new Date(task.dueDate) < new Date() && 
    !task.completed
  ).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats = [
    {
      label: "Total Tasks",
      value: totalTasks,
      icon: BarChart3,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Completed",
      value: completedTasks,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Pending",
      value: pendingTasks,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      label: "Overdue",
      value: overdueTasks,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="p-4 bg-white/70 backdrop-blur-sm border-white/20">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default TaskStats;

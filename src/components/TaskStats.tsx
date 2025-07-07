import { useMemo } from "react";
import { BarChart3, CheckCircle2, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Task } from "@/types/Task";

interface TaskStatsProps {
  tasks: Task[];
}

const TaskStats = ({ tasks }: TaskStatsProps) => {
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = tasks.filter(task => !task.completed).length;
    const overdueTasks = tasks.filter(task => 
      task.dueDate && 
      new Date(task.dueDate) < new Date() && 
      !task.completed
    ).length;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      completionRate
    };
  }, [tasks]);

  const statItems = [
    {
      label: "إجمالي المهام",
      value: stats.totalTasks,
      icon: BarChart3,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
    },
    {
      label: "مكتملة",
      value: stats.completedTasks,
      icon: CheckCircle2,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
    },
    {
      label: "معلقة",
      value: stats.pendingTasks,
      icon: Clock,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/30",
    },
    {
      label: "متأخرة",
      value: stats.overdueTasks,
      icon: AlertTriangle,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
    },
    {
      label: "معدل الإنجاز",
      value: `${stats.completionRate}%`,
      icon: TrendingUp,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {statItems.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={stat.label} 
            className={`p-4 bg-gradient-to-br from-slate-800/90 to-purple-800/90 backdrop-blur-xl border border-slate-700/50 hover:shadow-lg transition-all duration-300 ${stat.borderColor}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor} border ${stat.borderColor}`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-200">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default TaskStats;
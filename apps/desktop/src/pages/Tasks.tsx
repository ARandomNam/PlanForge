import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Filter,
  Search,
  CheckCircle,
  Circle,
  PlayCircle,
  PauseCircle,
  Calendar,
  User,
  MoreHorizontal,
  Target,
  FolderOpen,
} from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { db, type Plan, type Task, type Milestone } from "../lib/database-api";
import TaskDetailModal from "../components/TaskDetailModal";

// Droppable Column Component
const DroppableColumn: React.FC<{
  id: string;
  title: string;
  tasks: (Task & { planTitle?: string; planId?: string })[];
  onTaskClick: (task: Task) => void;
  onTaskStatusChange: (taskId: string, newStatus: string) => void;
}> = ({ id, title, tasks, onTaskClick, onTaskStatusChange }) => {
  const { setNodeRef, isOver } = useSortable({
    id,
    data: {
      type: "column",
      status: id,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-h-[400px] p-4 rounded-lg border-2 transition-colors ${
        isOver ? "border-primary bg-primary/5" : "border-border bg-card"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded">
          {tasks.length}
        </span>
      </div>
      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {tasks.map((task) => (
            <DraggableTaskCard
              key={task.id}
              task={task}
              onTaskClick={onTaskClick}
              onTaskStatusChange={onTaskStatusChange}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

// Draggable Task Card Component
const DraggableTaskCard: React.FC<{
  task: Task & { planTitle?: string; planId?: string };
  onTaskClick: (task: Task) => void;
  onTaskStatusChange: (taskId: string, newStatus: string) => void;
}> = ({ task, onTaskClick, onTaskStatusChange }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "IN_PROGRESS":
        return <PlayCircle className="h-4 w-4 text-blue-600" />;
      case "PAUSED":
        return <PauseCircle className="h-4 w-4 text-yellow-600" />;
      case "TODO":
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 task-card-completed";
      case "IN_PROGRESS":
        return "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 task-card-in-progress";
      case "PAUSED":
        return "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 task-card-paused";
      case "TODO":
      default:
        return "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 task-card-todo";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 priority-high";
      case "MEDIUM":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900 priority-medium";
      case "LOW":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 priority-low";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 rounded-lg border-2 ${getStatusColor(
        task.status
      )} hover:shadow-md transition-shadow cursor-pointer ${
        isDragging ? "opacity-50" : ""
      }`}
      onClick={() => onTaskClick(task)}
    >
      {/* Plan Title - More Prominent */}
      {task.planTitle && (
        <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-border/50">
          <FolderOpen className="h-3 w-3 text-primary" />
          <Link
            to={`/plan/${task.planId}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {task.planTitle}
          </Link>
        </div>
      )}

      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-foreground text-sm flex-1 pr-2">
          {task.title}
        </h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            const newStatus =
              task.status === "COMPLETED"
                ? "TODO"
                : task.status === "TODO"
                ? "IN_PROGRESS"
                : task.status === "IN_PROGRESS"
                ? "COMPLETED"
                : "TODO";
            onTaskStatusChange(task.id, newStatus);
          }}
          className="p-1 hover:bg-white/50 dark:hover:bg-black/20 rounded transition-colors"
        >
          {getStatusIcon(task.status)}
        </button>
      </div>

      {task.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {task.priority && (
            <span
              className={`px-1.5 py-0.5 rounded text-xs font-medium ${getPriorityColor(
                task.priority
              )}`}
            >
              {task.priority}
            </span>
          )}
          {task.dueDate && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Tasks: React.FC = () => {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("plan");

  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [tasks, setTasks] = useState<
    (Task & { planTitle?: string; planId?: string })[]
  >([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadData();
  }, [planId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const plansData = await db.getPlans();
      setPlans(plansData);

      if (planId) {
        const plan = plansData.find((p) => p.id === planId);
        if (plan) {
          setSelectedPlan(plan);
          setTasks(
            (plan.tasks || []).map((task) => ({
              ...task,
              planTitle: plan.title,
              planId: plan.id,
            }))
          );
          setMilestones(plan.milestones || []);
        }
      } else {
        // Show all tasks from all plans
        const allTasks = plansData.flatMap((plan) =>
          (plan.tasks || []).map((task) => ({
            ...task,
            planTitle: plan.title,
            planId: plan.id,
          }))
        );
        setTasks(allTasks);
        // Get all milestones from all plans
        const allMilestones = plansData.flatMap(
          (plan) => plan.milestones || []
        );
        setMilestones(allMilestones);
      }
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await db.updateTask(taskId, { status: newStatus });
      await loadData(); // Reload data
    } catch (err) {
      console.error("Failed to update task status:", err);
      setError("Failed to update task status");
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;

    // Only update if the status actually changed
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== newStatus) {
      handleTaskStatusChange(taskId, newStatus);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.planTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === "all" || task.planId === filterPlan;
    return matchesSearch && matchesPlan;
  });

  const tasksByStatus = {
    TODO: filteredTasks.filter((task) => task.status === "TODO"),
    IN_PROGRESS: filteredTasks.filter((task) => task.status === "IN_PROGRESS"),
    PAUSED: filteredTasks.filter((task) => task.status === "PAUSED"),
    COMPLETED: filteredTasks.filter((task) => task.status === "COMPLETED"),
  };

  // Get unique plans for filter dropdown
  const uniquePlans = Array.from(
    new Set(tasks.map((task) => task.planId).filter(Boolean))
  ).map((planId) => {
    const plan = plans.find((p) => p.id === planId);
    return { id: planId, title: plan?.title || "Unknown Plan" };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between theme-transition-top">
        <div className="flex items-center space-x-4">
          {planId && (
            <Link
              to="/tasks"
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              All Tasks
            </Link>
          )}
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {selectedPlan ? selectedPlan.title : "All Tasks"}
            </h1>
            <p className="text-muted-foreground">
              {selectedPlan
                ? "Manage tasks for this plan"
                : `Kanban board for all your tasks across ${uniquePlans.length} plans`}
            </p>
          </div>
        </div>

        {/* Quick Plan Navigation */}
        {!planId && uniquePlans.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Quick access:</span>
            <div className="flex items-center space-x-1">
              {uniquePlans.slice(0, 3).map((plan) => (
                <Link
                  key={plan.id}
                  to={`/tasks?plan=${plan.id}`}
                  className="px-2 py-1 text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded transition-colors"
                >
                  {plan.title}
                </Link>
              ))}
              {uniquePlans.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{uniquePlans.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 theme-transition-middle">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search tasks or plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Plan Filter - Primary filter */}
        <div className="flex items-center space-x-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="px-4 py-2 border-2 border-primary/20 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary min-w-[160px] font-medium"
          >
            <option value="all">All Plans</option>
            {uniquePlans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4 theme-transition-bottom">
          <DroppableColumn
            id="TODO"
            title="To Do"
            tasks={tasksByStatus.TODO}
            onTaskClick={handleTaskClick}
            onTaskStatusChange={handleTaskStatusChange}
          />
          <DroppableColumn
            id="IN_PROGRESS"
            title="In Progress"
            tasks={tasksByStatus.IN_PROGRESS}
            onTaskClick={handleTaskClick}
            onTaskStatusChange={handleTaskStatusChange}
          />
          <DroppableColumn
            id="PAUSED"
            title="Paused"
            tasks={tasksByStatus.PAUSED}
            onTaskClick={handleTaskClick}
            onTaskStatusChange={handleTaskStatusChange}
          />
          <DroppableColumn
            id="COMPLETED"
            title="Completed"
            tasks={tasksByStatus.COMPLETED}
            onTaskClick={handleTaskClick}
            onTaskStatusChange={handleTaskStatusChange}
          />
        </div>

        <DragOverlay>
          {activeTask ? (
            <DraggableTaskCard
              task={activeTask}
              onTaskClick={() => {}}
              onTaskStatusChange={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          milestones={milestones}
          isOpen={showTaskModal}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
          onUpdate={handleTaskUpdate}
          onDelete={handleTaskDelete}
        />
      )}
    </div>
  );
};

export default Tasks;

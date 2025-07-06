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
  tasks: (Task & { planTitle?: string })[];
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
  task: Task & { planTitle?: string };
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
        return "bg-green-50 border-green-200 task-card-completed";
      case "IN_PROGRESS":
        return "bg-blue-50 border-blue-200 task-card-in-progress";
      case "PAUSED":
        return "bg-yellow-50 border-yellow-200 task-card-paused";
      case "TODO":
      default:
        return "bg-gray-50 border-gray-200 task-card-todo";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "text-red-600 bg-red-100 priority-high";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-100 priority-medium";
      case "LOW":
        return "text-green-600 bg-green-100 priority-low";
      default:
        return "text-gray-600 bg-gray-100";
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
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-foreground text-sm">{task.title}</h4>
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
          className="p-1 hover:bg-white rounded"
        >
          {getStatusIcon(task.status)}
        </button>
      </div>

      {task.description && (
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {task.priority && (
            <span
              className={`px-1 py-0.5 rounded text-xs ${getPriorityColor(
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

        {task.planTitle && (
          <span className="text-xs text-muted-foreground">
            {task.planTitle}
          </span>
        )}
      </div>
    </div>
  );
};

const Tasks: React.FC = () => {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("plan");

  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
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
          setTasks(plan.tasks || []);
          setMilestones(plan.milestones || []);
        }
      } else {
        // Show all tasks from all plans
        const allTasks = plansData.flatMap((plan) =>
          (plan.tasks || []).map((task) => ({ ...task, planTitle: plan.title }))
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
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const tasksByStatus = {
    TODO: filteredTasks.filter((task) => task.status === "TODO"),
    IN_PROGRESS: filteredTasks.filter((task) => task.status === "IN_PROGRESS"),
    PAUSED: filteredTasks.filter((task) => task.status === "PAUSED"),
    COMPLETED: filteredTasks.filter((task) => task.status === "COMPLETED"),
  };

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
                : "Kanban board for all your tasks"}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 theme-transition-middle">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="PAUSED">Paused</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
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

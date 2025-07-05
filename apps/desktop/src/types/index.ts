// Database types (matching Prisma schema)
export type PlanStatus = "ACTIVE" | "COMPLETED" | "PAUSED" | "CANCELLED";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type ResourceType =
  | "ARTICLE"
  | "VIDEO"
  | "BOOK"
  | "COURSE"
  | "TOOL"
  | "OTHER";
export type Theme = "LIGHT" | "DARK" | "SYSTEM";

// Plan types
export interface Plan {
  id: string;
  title: string;
  description?: string | null;
  goal: string;
  timeframe?: string | null;
  status: PlanStatus;
  createdAt: Date;
  updatedAt: Date;
  milestones?: Milestone[];
  tasks?: Task[];
  resources?: Resource[];
}

export interface Milestone {
  id: string;
  title: string;
  description?: string | null;
  targetDate?: Date | null;
  status: TaskStatus;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  planId: string;
  plan?: Plan;
  tasks?: Task[];
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  estimatedHours?: number | null;
  actualHours?: number | null;
  dueDate?: Date | null;
  completedAt?: Date | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  planId: string;
  plan?: Plan;
  milestoneId?: string | null;
  milestone?: Milestone | null;
  dependsOn?: TaskDependency[];
  dependencies?: TaskDependency[];
}

export interface TaskDependency {
  id: string;
  dependentId: string;
  dependent?: Task;
  prerequisiteId: string;
  prerequisite?: Task;
}

export interface Resource {
  id: string;
  title: string;
  description?: string | null;
  url?: string | null;
  type: ResourceType;
  createdAt: Date;
  planId: string;
  plan?: Plan;
}

export interface Settings {
  id: string;
  openaiApiKey?: string | null;
  theme: Theme;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

// UI types
export interface CreatePlanRequest {
  goal: string;
  timeframe?: string;
}

export interface AIGeneratedPlan {
  title: string;
  description?: string;
  milestones: {
    title: string;
    description?: string;
    targetDate?: string;
    tasks: {
      title: string;
      description?: string;
      priority: Priority;
      estimatedHours?: number;
      dueDate?: string;
    }[];
  }[];
  resources?: {
    title: string;
    description?: string;
    url?: string;
    type: ResourceType;
  }[];
}

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

// Component props
export interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

// API types
export interface OpenAIConfig {
  apiKey: string;
  model?: string;
}

export interface APIError {
  message: string;
  code?: string;
}

// Database API for renderer process
// This module provides a clean interface for database operations through IPC

export interface Plan {
  id: string;
  title: string;
  description?: string;
  goal: string;
  timeframe?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  milestones?: Milestone[];
  tasks?: Task[];
  resources?: Resource[];
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  targetDate?: Date;
  status: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  planId: string;
  tasks?: Task[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: Date;
  completedAt?: Date;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  planId: string;
  milestoneId?: string;
  dependsOn?: TaskDependency[];
  dependencies?: TaskDependency[];
}

export interface TaskDependency {
  id: string;
  dependentId: string;
  prerequisiteId: string;
  dependent?: Task;
  prerequisite?: Task;
}

export interface Resource {
  id: string;
  title: string;
  description?: string;
  url?: string;
  type: string;
  createdAt: Date;
  planId: string;
}

export interface Settings {
  id: string;
  openaiApiKey?: string;
  theme: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanStats {
  totalTasks: number;
  completedTasks: number;
  taskProgress: number;
  totalMilestones: number;
  completedMilestones: number;
  milestoneProgress: number;
  totalEstimatedHours: number;
  totalActualHours: number;
  overallProgress: number;
}

export interface DashboardStats {
  totalPlans: number;
  activePlans: number;
  completedPlans: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  taskCompletionRate: number;
}

class DatabaseAPI {
  // Plan operations
  async createPlan(data: {
    title: string;
    description?: string;
    goal: string;
    timeframe?: string;
  }): Promise<Plan> {
    return await window.ipcRenderer.invoke("db:create-plan", data);
  }

  async getPlans(): Promise<Plan[]> {
    return await window.ipcRenderer.invoke("db:get-plans");
  }

  async getPlan(id: string): Promise<Plan | null> {
    return await window.ipcRenderer.invoke("db:get-plan", id);
  }

  async updatePlan(
    id: string,
    data: {
      title?: string;
      description?: string;
      goal?: string;
      timeframe?: string;
      status?: string;
    }
  ): Promise<Plan> {
    return await window.ipcRenderer.invoke("db:update-plan", id, data);
  }

  async deletePlan(id: string): Promise<Plan> {
    return await window.ipcRenderer.invoke("db:delete-plan", id);
  }

  // Milestone operations
  async createMilestone(data: {
    title: string;
    description?: string;
    targetDate?: Date;
    planId: string;
    order: number;
  }): Promise<Milestone> {
    return await window.ipcRenderer.invoke("db:create-milestone", data);
  }

  async updateMilestone(
    id: string,
    data: {
      title?: string;
      description?: string;
      targetDate?: Date;
      status?: string;
      order?: number;
    }
  ): Promise<Milestone> {
    return await window.ipcRenderer.invoke("db:update-milestone", id, data);
  }

  async deleteMilestone(id: string): Promise<Milestone> {
    return await window.ipcRenderer.invoke("db:delete-milestone", id);
  }

  // Task operations
  async createTask(data: {
    title: string;
    description?: string;
    planId: string;
    milestoneId?: string;
    priority?: string;
    estimatedHours?: number;
    dueDate?: Date;
    order: number;
  }): Promise<Task> {
    return await window.ipcRenderer.invoke("db:create-task", data);
  }

  async updateTask(
    id: string,
    data: {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
      estimatedHours?: number;
      actualHours?: number;
      dueDate?: Date;
      completedAt?: Date;
      order?: number;
      milestoneId?: string;
    }
  ): Promise<Task> {
    return await window.ipcRenderer.invoke("db:update-task", id, data);
  }

  async deleteTask(id: string): Promise<Task> {
    return await window.ipcRenderer.invoke("db:delete-task", id);
  }

  // Task dependency operations
  async createTaskDependency(
    dependentId: string,
    prerequisiteId: string
  ): Promise<TaskDependency> {
    return await window.ipcRenderer.invoke(
      "db:create-task-dependency",
      dependentId,
      prerequisiteId
    );
  }

  async deleteTaskDependency(
    dependentId: string,
    prerequisiteId: string
  ): Promise<TaskDependency> {
    return await window.ipcRenderer.invoke(
      "db:delete-task-dependency",
      dependentId,
      prerequisiteId
    );
  }

  // Resource operations
  async createResource(data: {
    title: string;
    description?: string;
    url?: string;
    type: string;
    planId: string;
  }): Promise<Resource> {
    return await window.ipcRenderer.invoke("db:create-resource", data);
  }

  async updateResource(
    id: string,
    data: {
      title?: string;
      description?: string;
      url?: string;
      type?: string;
    }
  ): Promise<Resource> {
    return await window.ipcRenderer.invoke("db:update-resource", id, data);
  }

  async deleteResource(id: string): Promise<Resource> {
    return await window.ipcRenderer.invoke("db:delete-resource", id);
  }

  // Settings operations
  async getSettings(): Promise<Settings> {
    return await window.ipcRenderer.invoke("db:get-settings");
  }

  async updateSettings(data: {
    openaiApiKey?: string;
    theme?: string;
    language?: string;
  }): Promise<Settings> {
    return await window.ipcRenderer.invoke("db:update-settings", data);
  }

  // Statistics operations
  async getPlanStats(planId: string): Promise<PlanStats | null> {
    return await window.ipcRenderer.invoke("db:get-plan-stats", planId);
  }

  async getDashboardStats(): Promise<DashboardStats> {
    return await window.ipcRenderer.invoke("db:get-dashboard-stats");
  }
}

// Export singleton instance
export const db = new DatabaseAPI();

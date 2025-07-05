import { PrismaClient } from "@prisma/client";
import path from "path";
import { app } from "electron";

export class DatabaseService {
  private prisma: PrismaClient;

  constructor() {
    // Initialize Prisma client with database path
    // In development, use the project directory; in production, use app data directory
    const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
    const dbPath = isDev
      ? path.join(process.cwd(), "prisma", "planforge.db")
      : path.join(app.getPath("userData"), "planforge.db");

    console.log("Database path:", dbPath);

    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: `file:${dbPath}`,
        },
      },
    });
  }

  async initialize() {
    try {
      // Test database connection
      await this.prisma.$connect();
      console.log("Database connected successfully");

      // Run migrations if needed
      // Note: In production, you might want to handle migrations differently
      return true;
    } catch (error) {
      console.error("Database initialization failed:", error);
      throw error;
    }
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }

  // Plan operations
  async createPlan(data: {
    title: string;
    description?: string;
    goal: string;
    timeframe?: string;
  }) {
    return await this.prisma.plan.create({
      data,
      include: {
        milestones: true,
        tasks: true,
        resources: true,
      },
    });
  }

  async getPlans() {
    return await this.prisma.plan.findMany({
      include: {
        milestones: {
          include: {
            tasks: true,
          },
        },
        tasks: true,
        resources: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  async getPlan(id: string) {
    return await this.prisma.plan.findUnique({
      where: { id },
      include: {
        milestones: {
          include: {
            tasks: {
              include: {
                dependsOn: {
                  include: {
                    prerequisite: true,
                  },
                },
                dependencies: {
                  include: {
                    dependent: true,
                  },
                },
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
        tasks: {
          include: {
            dependsOn: {
              include: {
                prerequisite: true,
              },
            },
            dependencies: {
              include: {
                dependent: true,
              },
            },
          },
        },
        resources: true,
      },
    });
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
  ) {
    return await this.prisma.plan.update({
      where: { id },
      data,
      include: {
        milestones: true,
        tasks: true,
        resources: true,
      },
    });
  }

  async deletePlan(id: string) {
    return await this.prisma.plan.delete({
      where: { id },
    });
  }

  // Milestone operations
  async createMilestone(data: {
    title: string;
    description?: string;
    targetDate?: Date;
    planId: string;
    order: number;
  }) {
    return await this.prisma.milestone.create({
      data,
      include: {
        tasks: true,
      },
    });
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
  ) {
    return await this.prisma.milestone.update({
      where: { id },
      data,
      include: {
        tasks: true,
      },
    });
  }

  async deleteMilestone(id: string) {
    return await this.prisma.milestone.delete({
      where: { id },
    });
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
  }) {
    return await this.prisma.task.create({
      data,
      include: {
        dependsOn: {
          include: {
            prerequisite: true,
          },
        },
        dependencies: {
          include: {
            dependent: true,
          },
        },
      },
    });
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
  ) {
    return await this.prisma.task.update({
      where: { id },
      data,
      include: {
        dependsOn: {
          include: {
            prerequisite: true,
          },
        },
        dependencies: {
          include: {
            dependent: true,
          },
        },
      },
    });
  }

  async deleteTask(id: string) {
    return await this.prisma.task.delete({
      where: { id },
    });
  }

  // Task dependency operations
  async createTaskDependency(dependentId: string, prerequisiteId: string) {
    return await this.prisma.taskDependency.create({
      data: {
        dependentId,
        prerequisiteId,
      },
    });
  }

  async deleteTaskDependency(dependentId: string, prerequisiteId: string) {
    return await this.prisma.taskDependency.delete({
      where: {
        dependentId_prerequisiteId: {
          dependentId,
          prerequisiteId,
        },
      },
    });
  }

  // Resource operations
  async createResource(data: {
    title: string;
    description?: string;
    url?: string;
    type: string;
    planId: string;
  }) {
    return await this.prisma.resource.create({
      data,
    });
  }

  async updateResource(
    id: string,
    data: {
      title?: string;
      description?: string;
      url?: string;
      type?: string;
    }
  ) {
    return await this.prisma.resource.update({
      where: { id },
      data,
    });
  }

  async deleteResource(id: string) {
    return await this.prisma.resource.delete({
      where: { id },
    });
  }

  // Settings operations
  async getSettings() {
    let settings = await this.prisma.settings.findUnique({
      where: { id: "settings" },
    });

    if (!settings) {
      settings = await this.prisma.settings.create({
        data: { id: "settings" },
      });
    }

    return settings;
  }

  async updateSettings(data: {
    openaiApiKey?: string;
    theme?: string;
    language?: string;
  }) {
    return await this.prisma.settings.upsert({
      where: { id: "settings" },
      update: data,
      create: { id: "settings", ...data },
    });
  }

  // Statistics and analytics
  async getPlanStats(planId: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
      include: {
        milestones: true,
        tasks: true,
      },
    });

    if (!plan) return null;

    const totalTasks = plan.tasks.length;
    const completedTasks = plan.tasks.filter(
      (task) => task.status === "COMPLETED"
    ).length;
    const totalMilestones = plan.milestones.length;
    const completedMilestones = plan.milestones.filter(
      (milestone) => milestone.status === "COMPLETED"
    ).length;

    const totalEstimatedHours = plan.tasks.reduce(
      (sum, task) => sum + (task.estimatedHours || 0),
      0
    );
    const totalActualHours = plan.tasks.reduce(
      (sum, task) => sum + (task.actualHours || 0),
      0
    );

    return {
      totalTasks,
      completedTasks,
      taskProgress: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      totalMilestones,
      completedMilestones,
      milestoneProgress:
        totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0,
      totalEstimatedHours,
      totalActualHours,
      overallProgress: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    };
  }

  async getDashboardStats() {
    const plans = await this.prisma.plan.findMany({
      include: {
        tasks: true,
        milestones: true,
      },
    });

    const totalPlans = plans.length;
    const activePlans = plans.filter((plan) => plan.status === "ACTIVE").length;
    const completedPlans = plans.filter(
      (plan) => plan.status === "COMPLETED"
    ).length;

    const allTasks = plans.flatMap((plan) => plan.tasks);
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(
      (task) => task.status === "COMPLETED"
    ).length;

    const overdueTasks = allTasks.filter(
      (task) =>
        task.dueDate &&
        task.status !== "COMPLETED" &&
        new Date(task.dueDate) < new Date()
    ).length;

    return {
      totalPlans,
      activePlans,
      completedPlans,
      totalTasks,
      completedTasks,
      overdueTasks,
      taskCompletionRate:
        totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    };
  }
}

import path from "path";
import { app } from "electron";
import fs from "fs";

// Custom Prisma client import for production
function createPrismaClient() {
  const isDev =
    process.env.NODE_ENV === "development" ||
    (typeof app !== "undefined" && !app.isPackaged);

  console.log("Creating Prisma client...");
  console.log("isDev:", isDev);
  console.log("process.resourcesPath:", process.resourcesPath);

  if (isDev) {
    // In development, use normal import
    console.log("Using development Prisma client");
    const { PrismaClient } = require("@prisma/client");
    return PrismaClient;
  } else {
    // In production, try to load from unpacked directory
    console.log("Loading production Prisma client...");

    try {
      const unpackedPath = path.join(
        process.resourcesPath,
        "app.asar.unpacked"
      );
      console.log("Unpacked path:", unpackedPath);
      console.log("Unpacked path exists:", fs.existsSync(unpackedPath));

      const prismaClientPath = path.join(
        unpackedPath,
        "node_modules",
        "@prisma",
        "client"
      );
      console.log("Prisma client path:", prismaClientPath);
      console.log(
        "Prisma client path exists:",
        fs.existsSync(prismaClientPath)
      );

      // Check if the unpacked Prisma client exists
      const prismaGeneratedPath = path.join(
        unpackedPath,
        "dist-electron",
        ".prisma",
        "client"
      );

      console.log(
        "Checking for generated Prisma client at:",
        prismaGeneratedPath
      );
      console.log(
        "Generated Prisma client exists:",
        fs.existsSync(prismaGeneratedPath)
      );

      if (fs.existsSync(prismaGeneratedPath)) {
        console.log("Loading Prisma client from generated directory");

        // Set environment variables for Prisma
        const queryEnginePath = path.join(
          prismaGeneratedPath,
          "libquery_engine-darwin-arm64.dylib.node"
        );
        console.log("Setting PRISMA_QUERY_ENGINE_LIBRARY to:", queryEnginePath);
        process.env.PRISMA_QUERY_ENGINE_LIBRARY = queryEnginePath;

        // Load directly from the generated client
        const { PrismaClient } = require(prismaGeneratedPath);
        return PrismaClient;
      } else if (fs.existsSync(prismaClientPath)) {
        console.log("Loading Prisma client from unpacked @prisma/client");
        const { PrismaClient } = require(prismaClientPath);
        return PrismaClient;
      } else {
        console.log("No unpacked Prisma client found, using fallback");
        // Fallback to regular import
        const { PrismaClient } = require("@prisma/client");
        return PrismaClient;
      }
    } catch (error) {
      console.error(
        "Failed to load Prisma client from unpacked directory:",
        error
      );
      console.log("Using fallback Prisma client");
      // Fallback to regular import
      const { PrismaClient } = require("@prisma/client");
      return PrismaClient;
    }
  }
}

export class DatabaseService {
  private prisma: any;

  constructor() {
    // Initialize Prisma client with database path
    const isDev =
      process.env.NODE_ENV === "development" ||
      (typeof app !== "undefined" && !app.isPackaged);

    let dbPath: string;

    if (isDev) {
      // In development, use the project root directory
      const projectRoot = path.join(__dirname, "..");
      dbPath = path.join(projectRoot, "prisma", "planforge.db");
    } else {
      // In production, use user data directory
      const userDataPath = app.getPath("userData");
      dbPath = path.join(userDataPath, "planforge.db");

      // Copy database from resources if it doesn't exist
      if (!fs.existsSync(dbPath)) {
        const resourcesPath = process.resourcesPath;
        const sourcePath = path.join(resourcesPath, "prisma", "planforge.db");

        console.log("Copying database from:", sourcePath);
        console.log("To:", dbPath);

        try {
          fs.mkdirSync(path.dirname(dbPath), { recursive: true });
          fs.copyFileSync(sourcePath, dbPath);
          console.log("Database copied successfully");
        } catch (copyError) {
          console.error("Failed to copy database:", copyError);
          console.log("Creating new database...");
        }
      }
    }

    console.log("Database path:", dbPath);
    console.log("Database path exists:", fs.existsSync(dbPath));

    try {
      console.log("Initializing Prisma client...");
      const PrismaClient = createPrismaClient();
      console.log("PrismaClient constructor obtained:", !!PrismaClient);

      this.prisma = new PrismaClient({
        datasources: {
          db: {
            url: `file:${dbPath}`,
          },
        },
      });
      console.log("Prisma client instance created successfully");
    } catch (error) {
      console.error("Failed to initialize Prisma client:", error);
      console.error(
        "Error details:",
        error instanceof Error ? error.message : String(error)
      );
      console.error(
        "Error stack:",
        error instanceof Error ? error.stack : "No stack trace"
      );
      throw new Error(
        "Database initialization failed. Please ensure Prisma client is properly installed."
      );
    }
  }

  async initialize() {
    try {
      // Test database connection
      await this.prisma.$connect();
      console.log("Database connected successfully");
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
      (task: any) => task.status === "COMPLETED"
    ).length;
    const totalMilestones = plan.milestones.length;
    const completedMilestones = plan.milestones.filter(
      (milestone: any) => milestone.status === "COMPLETED"
    ).length;

    const totalEstimatedHours = plan.tasks.reduce(
      (sum: number, task: any) => sum + (task.estimatedHours || 0),
      0
    );
    const totalActualHours = plan.tasks.reduce(
      (sum: number, task: any) => sum + (task.actualHours || 0),
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
    const activePlans = plans.filter(
      (plan: any) => plan.status === "ACTIVE"
    ).length;
    const completedPlans = plans.filter(
      (plan: any) => plan.status === "COMPLETED"
    ).length;

    const allTasks = plans.flatMap((plan: any) => plan.tasks);
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(
      (task: any) => task.status === "COMPLETED"
    ).length;

    const overdueTasks = allTasks.filter(
      (task: any) =>
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

// Global database instance
let databaseInstance: DatabaseService | null = null;

export async function initDatabase(): Promise<DatabaseService> {
  if (!databaseInstance) {
    databaseInstance = new DatabaseService();
    await databaseInstance.initialize();
  }
  return databaseInstance;
}

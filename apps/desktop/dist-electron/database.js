"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const path = require("path");
const electron = require("electron");
const fs = require("fs");
function createPrismaClient() {
  const isDev = process.env.NODE_ENV === "development" || typeof electron.app !== "undefined" && !electron.app.isPackaged;
  console.log("Creating Prisma client...");
  console.log("isDev:", isDev);
  console.log("process.resourcesPath:", process.resourcesPath);
  if (isDev) {
    console.log("Using development Prisma client");
    const { PrismaClient } = require("@prisma/client");
    return PrismaClient;
  } else {
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
        const queryEnginePath = path.join(
          prismaGeneratedPath,
          "libquery_engine-darwin-arm64.dylib.node"
        );
        console.log("Setting PRISMA_QUERY_ENGINE_LIBRARY to:", queryEnginePath);
        process.env.PRISMA_QUERY_ENGINE_LIBRARY = queryEnginePath;
        const { PrismaClient } = require(prismaGeneratedPath);
        return PrismaClient;
      } else if (fs.existsSync(prismaClientPath)) {
        console.log("Loading Prisma client from unpacked @prisma/client");
        const { PrismaClient } = require(prismaClientPath);
        return PrismaClient;
      } else {
        console.log("No unpacked Prisma client found, using fallback");
        const { PrismaClient } = require("@prisma/client");
        return PrismaClient;
      }
    } catch (error) {
      console.error(
        "Failed to load Prisma client from unpacked directory:",
        error
      );
      console.log("Using fallback Prisma client");
      const { PrismaClient } = require("@prisma/client");
      return PrismaClient;
    }
  }
}
class DatabaseService {
  constructor() {
    __publicField(this, "prisma");
    const isDev = process.env.NODE_ENV === "development" || typeof electron.app !== "undefined" && !electron.app.isPackaged;
    let dbPath;
    if (isDev) {
      const projectRoot = path.join(__dirname, "..");
      dbPath = path.join(projectRoot, "prisma", "planforge.db");
    } else {
      const userDataPath = electron.app.getPath("userData");
      dbPath = path.join(userDataPath, "planforge.db");
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
            url: `file:${dbPath}`
          }
        }
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
  async createPlan(data) {
    return await this.prisma.plan.create({
      data,
      include: {
        milestones: true,
        tasks: true,
        resources: true
      }
    });
  }
  async getPlans() {
    return await this.prisma.plan.findMany({
      include: {
        milestones: {
          include: {
            tasks: true
          }
        },
        tasks: true,
        resources: true
      },
      orderBy: {
        updatedAt: "desc"
      }
    });
  }
  async getPlan(id) {
    return await this.prisma.plan.findUnique({
      where: { id },
      include: {
        milestones: {
          include: {
            tasks: {
              include: {
                dependsOn: {
                  include: {
                    prerequisite: true
                  }
                },
                dependencies: {
                  include: {
                    dependent: true
                  }
                }
              }
            }
          },
          orderBy: {
            order: "asc"
          }
        },
        tasks: {
          include: {
            dependsOn: {
              include: {
                prerequisite: true
              }
            },
            dependencies: {
              include: {
                dependent: true
              }
            }
          }
        },
        resources: true
      }
    });
  }
  async updatePlan(id, data) {
    return await this.prisma.plan.update({
      where: { id },
      data,
      include: {
        milestones: true,
        tasks: true,
        resources: true
      }
    });
  }
  async deletePlan(id) {
    return await this.prisma.plan.delete({
      where: { id }
    });
  }
  // Milestone operations
  async createMilestone(data) {
    return await this.prisma.milestone.create({
      data,
      include: {
        tasks: true
      }
    });
  }
  async updateMilestone(id, data) {
    return await this.prisma.milestone.update({
      where: { id },
      data,
      include: {
        tasks: true
      }
    });
  }
  async deleteMilestone(id) {
    return await this.prisma.milestone.delete({
      where: { id }
    });
  }
  // Task operations
  async createTask(data) {
    return await this.prisma.task.create({
      data,
      include: {
        dependsOn: {
          include: {
            prerequisite: true
          }
        },
        dependencies: {
          include: {
            dependent: true
          }
        }
      }
    });
  }
  async updateTask(id, data) {
    return await this.prisma.task.update({
      where: { id },
      data,
      include: {
        dependsOn: {
          include: {
            prerequisite: true
          }
        },
        dependencies: {
          include: {
            dependent: true
          }
        }
      }
    });
  }
  async deleteTask(id) {
    return await this.prisma.task.delete({
      where: { id }
    });
  }
  // Task dependency operations
  async createTaskDependency(dependentId, prerequisiteId) {
    return await this.prisma.taskDependency.create({
      data: {
        dependentId,
        prerequisiteId
      }
    });
  }
  async deleteTaskDependency(dependentId, prerequisiteId) {
    return await this.prisma.taskDependency.delete({
      where: {
        dependentId_prerequisiteId: {
          dependentId,
          prerequisiteId
        }
      }
    });
  }
  // Resource operations
  async createResource(data) {
    return await this.prisma.resource.create({
      data
    });
  }
  async updateResource(id, data) {
    return await this.prisma.resource.update({
      where: { id },
      data
    });
  }
  async deleteResource(id) {
    return await this.prisma.resource.delete({
      where: { id }
    });
  }
  // Settings operations
  async getSettings() {
    let settings = await this.prisma.settings.findUnique({
      where: { id: "settings" }
    });
    if (!settings) {
      settings = await this.prisma.settings.create({
        data: { id: "settings" }
      });
    }
    return settings;
  }
  async updateSettings(data) {
    return await this.prisma.settings.upsert({
      where: { id: "settings" },
      update: data,
      create: { id: "settings", ...data }
    });
  }
  // Statistics and analytics
  async getPlanStats(planId) {
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
      include: {
        milestones: true,
        tasks: true
      }
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
      taskProgress: totalTasks > 0 ? completedTasks / totalTasks * 100 : 0,
      totalMilestones,
      completedMilestones,
      milestoneProgress: totalMilestones > 0 ? completedMilestones / totalMilestones * 100 : 0,
      totalEstimatedHours,
      totalActualHours,
      overallProgress: totalTasks > 0 ? completedTasks / totalTasks * 100 : 0
    };
  }
  async getDashboardStats() {
    const plans = await this.prisma.plan.findMany({
      include: {
        tasks: true,
        milestones: true
      }
    });
    const totalPlans = plans.length;
    const activePlans = plans.filter(
      (plan) => plan.status === "ACTIVE"
    ).length;
    const completedPlans = plans.filter(
      (plan) => plan.status === "COMPLETED"
    ).length;
    const allTasks = plans.flatMap((plan) => plan.tasks);
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(
      (task) => task.status === "COMPLETED"
    ).length;
    const overdueTasks = allTasks.filter(
      (task) => task.dueDate && task.status !== "COMPLETED" && new Date(task.dueDate) < /* @__PURE__ */ new Date()
    ).length;
    return {
      totalPlans,
      activePlans,
      completedPlans,
      totalTasks,
      completedTasks,
      overdueTasks,
      taskCompletionRate: totalTasks > 0 ? completedTasks / totalTasks * 100 : 0
    };
  }
}
let databaseInstance = null;
async function initDatabase() {
  if (!databaseInstance) {
    databaseInstance = new DatabaseService();
    await databaseInstance.initialize();
  }
  return databaseInstance;
}
exports.DatabaseService = DatabaseService;
exports.initDatabase = initDatabase;
//# sourceMappingURL=database.js.map

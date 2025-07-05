"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const node_url = require("node:url");
const path$1 = require("node:path");
const os = require("node:os");
const require$$0 = require(".prisma/client/default");
const path = require("path");
var _documentCurrentScript = typeof document !== "undefined" ? document.currentScript : null;
var _default = {
  ...require$$0
};
class DatabaseService {
  constructor() {
    __publicField(this, "prisma");
    const isDev = process.env.NODE_ENV === "development" || !electron.app.isPackaged;
    const dbPath = isDev ? path.join(process.cwd(), "prisma", "planforge.db") : path.join(electron.app.getPath("userData"), "planforge.db");
    console.log("Database path:", dbPath);
    this.prisma = new _default.PrismaClient({
      datasources: {
        db: {
          url: `file:${dbPath}`
        }
      }
    });
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
const __dirname$1 = path$1.dirname(node_url.fileURLToPath(typeof document === "undefined" ? require("url").pathToFileURL(__filename).href : _documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === "SCRIPT" && _documentCurrentScript.src || new URL("main.js", document.baseURI).href));
process.env.APP_ROOT = path$1.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path$1.join(__dirname$1, "..");
const RENDERER_DIST = path$1.join(__dirname$1, "..", "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path$1.join(__dirname$1, "..", "public") : RENDERER_DIST;
if (os.release().startsWith("6.1")) electron.app.disableHardwareAcceleration();
if (process.platform === "win32") electron.app.setAppUserModelId(electron.app.getName());
if (!electron.app.requestSingleInstanceLock()) {
  electron.app.quit();
  process.exit(0);
}
let win = null;
let db;
const preload = path$1.join(__dirname$1, "preload.js");
const url = process.env.VITE_DEV_SERVER_URL;
async function createWindow() {
  win = new electron.BrowserWindow({
    title: "PlanForge",
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: false,
      contextIsolation: true
    },
    titleBarStyle: "default",
    show: false
    // Don't show until ready
  });
  win.once("ready-to-show", () => {
    win == null ? void 0 : win.show();
    if (VITE_DEV_SERVER_URL) {
      win == null ? void 0 : win.webContents.openDevTools();
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path$1.join(RENDERER_DIST, "index.html"));
  }
  win.webContents.setWindowOpenHandler(({ url: url2 }) => {
    if (url2.startsWith("https:")) electron.shell.openExternal(url2);
    return { action: "deny" };
  });
}
electron.app.whenReady().then(async () => {
  try {
    db = new DatabaseService();
    await db.initialize();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
  createWindow();
});
electron.app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") electron.app.quit();
});
electron.app.on("second-instance", () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});
electron.app.on("activate", () => {
  const allWindows = electron.BrowserWindow.getAllWindows();
  if (allWindows.length === 0) {
    createWindow();
  } else {
    allWindows[0].focus();
  }
});
electron.ipcMain.handle("open-win", (_, arg) => {
  const childWindow = new electron.BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`);
  } else {
    childWindow.loadFile(path$1.join(RENDERER_DIST, "index.html"), { hash: arg });
  }
});
electron.app.on("before-quit", async () => {
  console.log("App is quitting");
  if (db) {
    await db.disconnect();
  }
});
electron.ipcMain.handle("get-app-version", () => {
  return electron.app.getVersion();
});
electron.ipcMain.handle("get-platform", () => {
  return process.platform;
});
electron.ipcMain.handle("db:create-plan", async (_, data) => {
  try {
    return await db.createPlan(data);
  } catch (error) {
    console.error("Error creating plan:", error);
    throw error;
  }
});
electron.ipcMain.handle("db:get-plans", async () => {
  try {
    return await db.getPlans();
  } catch (error) {
    console.error("Error getting plans:", error);
    throw error;
  }
});
electron.ipcMain.handle("db:get-plan", async (_, id) => {
  try {
    return await db.getPlan(id);
  } catch (error) {
    console.error("Error getting plan:", error);
    throw error;
  }
});
electron.ipcMain.handle("db:update-plan", async (_, id, data) => {
  try {
    return await db.updatePlan(id, data);
  } catch (error) {
    console.error("Error updating plan:", error);
    throw error;
  }
});
electron.ipcMain.handle("db:delete-plan", async (_, id) => {
  try {
    return await db.deletePlan(id);
  } catch (error) {
    console.error("Error deleting plan:", error);
    throw error;
  }
});
electron.ipcMain.handle("db:create-milestone", async (_, data) => {
  try {
    return await db.createMilestone(data);
  } catch (error) {
    console.error("Error creating milestone:", error);
    throw error;
  }
});
electron.ipcMain.handle("db:update-milestone", async (_, id, data) => {
  try {
    return await db.updateMilestone(id, data);
  } catch (error) {
    console.error("Error updating milestone:", error);
    throw error;
  }
});
electron.ipcMain.handle("db:delete-milestone", async (_, id) => {
  try {
    return await db.deleteMilestone(id);
  } catch (error) {
    console.error("Error deleting milestone:", error);
    throw error;
  }
});
electron.ipcMain.handle("db:create-task", async (_, data) => {
  try {
    return await db.createTask(data);
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
});
electron.ipcMain.handle("db:update-task", async (_, id, data) => {
  try {
    return await db.updateTask(id, data);
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
});
electron.ipcMain.handle("db:delete-task", async (_, id) => {
  try {
    return await db.deleteTask(id);
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
});
electron.ipcMain.handle(
  "db:create-task-dependency",
  async (_, dependentId, prerequisiteId) => {
    try {
      return await db.createTaskDependency(dependentId, prerequisiteId);
    } catch (error) {
      console.error("Error creating task dependency:", error);
      throw error;
    }
  }
);
electron.ipcMain.handle(
  "db:delete-task-dependency",
  async (_, dependentId, prerequisiteId) => {
    try {
      return await db.deleteTaskDependency(dependentId, prerequisiteId);
    } catch (error) {
      console.error("Error deleting task dependency:", error);
      throw error;
    }
  }
);
electron.ipcMain.handle("db:create-resource", async (_, data) => {
  try {
    return await db.createResource(data);
  } catch (error) {
    console.error("Error creating resource:", error);
    throw error;
  }
});
electron.ipcMain.handle("db:update-resource", async (_, id, data) => {
  try {
    return await db.updateResource(id, data);
  } catch (error) {
    console.error("Error updating resource:", error);
    throw error;
  }
});
electron.ipcMain.handle("db:delete-resource", async (_, id) => {
  try {
    return await db.deleteResource(id);
  } catch (error) {
    console.error("Error deleting resource:", error);
    throw error;
  }
});
electron.ipcMain.handle("db:get-settings", async () => {
  try {
    return await db.getSettings();
  } catch (error) {
    console.error("Error getting settings:", error);
    throw error;
  }
});
electron.ipcMain.handle("db:update-settings", async (_, data) => {
  try {
    return await db.updateSettings(data);
  } catch (error) {
    console.error("Error updating settings:", error);
    throw error;
  }
});
electron.ipcMain.handle("db:get-plan-stats", async (_, planId) => {
  try {
    return await db.getPlanStats(planId);
  } catch (error) {
    console.error("Error getting plan stats:", error);
    throw error;
  }
});
electron.ipcMain.handle("db:get-dashboard-stats", async () => {
  try {
    return await db.getDashboardStats();
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    throw error;
  }
});
exports.MAIN_DIST = MAIN_DIST;
exports.RENDERER_DIST = RENDERER_DIST;
exports.VITE_DEV_SERVER_URL = VITE_DEV_SERVER_URL;
//# sourceMappingURL=main.js.map

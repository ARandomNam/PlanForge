import { app, BrowserWindow, shell, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import { DatabaseService } from "./database.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main.js    > Electron main
// │ └─┬ preload.js > Preload scripts
// ├─┬ dist
// │ └── index.html  > Electron renderer
//
process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(__dirname, "..");
export const RENDERER_DIST = path.join(__dirname, "..", "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(__dirname, "..", "public")
  : RENDERER_DIST;

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

// Install "react-devtools"
// app.whenReady().then(() => import('electron-devtools-installer')).then(({default: installExtension, REACT_DEVELOPER_TOOLS}) => installExtension(REACT_DEVELOPER_TOOLS, {
//   loadExtensionOptions: {
//     allowFileAccess: true,
//   },
// }))

let win: BrowserWindow | null = null;
let db: DatabaseService;
// Here, you can also use other preload
const preload = path.join(__dirname, "preload.js");
const url = process.env.VITE_DEV_SERVER_URL;
async function createWindow() {
  win = new BrowserWindow({
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
      contextIsolation: true,
    },
    titleBarStyle: "default",
    show: false, // Don't show until ready
  });

  // Show window when ready to prevent visual flash
  win.once("ready-to-show", () => {
    win?.show();

    // Open DevTools in development
    if (VITE_DEV_SERVER_URL) {
      win?.webContents.openDevTools();
    }
  });

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });
  // win.webContents.on('will-navigate', (event, navigationUrl) => { ... })
}

// Initialize app
app.whenReady().then(async () => {
  // Initialize database
  try {
    db = new DatabaseService();
    await db.initialize();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    // You might want to show an error dialog here
  }

  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length === 0) {
    createWindow();
  } else {
    allWindows[0].focus();
  }
});

// New window example arg: new windows url
ipcMain.handle("open-win", (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`);
  } else {
    childWindow.loadFile(path.join(RENDERER_DIST, "index.html"), { hash: arg });
  }
});

// Handle app quit
app.on("before-quit", async () => {
  console.log("App is quitting");
  if (db) {
    await db.disconnect();
  }
});

// IPC handlers
ipcMain.handle("get-app-version", () => {
  return app.getVersion();
});

ipcMain.handle("get-platform", () => {
  return process.platform;
});

// Database IPC handlers
// Plan operations
ipcMain.handle("db:create-plan", async (_, data) => {
  try {
    return await db.createPlan(data);
  } catch (error) {
    console.error("Error creating plan:", error);
    throw error;
  }
});

ipcMain.handle("db:get-plans", async () => {
  try {
    return await db.getPlans();
  } catch (error) {
    console.error("Error getting plans:", error);
    throw error;
  }
});

ipcMain.handle("db:get-plan", async (_, id) => {
  try {
    return await db.getPlan(id);
  } catch (error) {
    console.error("Error getting plan:", error);
    throw error;
  }
});

ipcMain.handle("db:update-plan", async (_, id, data) => {
  try {
    return await db.updatePlan(id, data);
  } catch (error) {
    console.error("Error updating plan:", error);
    throw error;
  }
});

ipcMain.handle("db:delete-plan", async (_, id) => {
  try {
    return await db.deletePlan(id);
  } catch (error) {
    console.error("Error deleting plan:", error);
    throw error;
  }
});

// Milestone operations
ipcMain.handle("db:create-milestone", async (_, data) => {
  try {
    return await db.createMilestone(data);
  } catch (error) {
    console.error("Error creating milestone:", error);
    throw error;
  }
});

ipcMain.handle("db:update-milestone", async (_, id, data) => {
  try {
    return await db.updateMilestone(id, data);
  } catch (error) {
    console.error("Error updating milestone:", error);
    throw error;
  }
});

ipcMain.handle("db:delete-milestone", async (_, id) => {
  try {
    return await db.deleteMilestone(id);
  } catch (error) {
    console.error("Error deleting milestone:", error);
    throw error;
  }
});

// Task operations
ipcMain.handle("db:create-task", async (_, data) => {
  try {
    return await db.createTask(data);
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
});

ipcMain.handle("db:update-task", async (_, id, data) => {
  try {
    return await db.updateTask(id, data);
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
});

ipcMain.handle("db:delete-task", async (_, id) => {
  try {
    return await db.deleteTask(id);
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
});

// Task dependency operations
ipcMain.handle(
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

ipcMain.handle(
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

// Resource operations
ipcMain.handle("db:create-resource", async (_, data) => {
  try {
    return await db.createResource(data);
  } catch (error) {
    console.error("Error creating resource:", error);
    throw error;
  }
});

ipcMain.handle("db:update-resource", async (_, id, data) => {
  try {
    return await db.updateResource(id, data);
  } catch (error) {
    console.error("Error updating resource:", error);
    throw error;
  }
});

ipcMain.handle("db:delete-resource", async (_, id) => {
  try {
    return await db.deleteResource(id);
  } catch (error) {
    console.error("Error deleting resource:", error);
    throw error;
  }
});

// Settings operations
ipcMain.handle("db:get-settings", async () => {
  try {
    return await db.getSettings();
  } catch (error) {
    console.error("Error getting settings:", error);
    throw error;
  }
});

ipcMain.handle("db:update-settings", async (_, data) => {
  try {
    return await db.updateSettings(data);
  } catch (error) {
    console.error("Error updating settings:", error);
    throw error;
  }
});

// Statistics operations
ipcMain.handle("db:get-plan-stats", async (_, planId) => {
  try {
    return await db.getPlanStats(planId);
  } catch (error) {
    console.error("Error getting plan stats:", error);
    throw error;
  }
});

ipcMain.handle("db:get-dashboard-stats", async () => {
  try {
    return await db.getDashboardStats();
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    throw error;
  }
});

import { db, type Task, type Plan } from "./database-api";

export interface NotificationConfig {
  enableDueDateReminders: boolean;
  enableProgressNotifications: boolean;
  reminderDaysBefore: number;
  dailyReminderTime: string; // HH:MM format
}

export interface Notification {
  id: string;
  type: "due_date" | "overdue" | "progress" | "milestone";
  title: string;
  message: string;
  taskId?: string;
  planId?: string;
  dueDate?: Date;
  createdAt: Date;
  isRead: boolean;
  priority: "low" | "medium" | "high";
}

class NotificationService {
  private notifications: Notification[] = [];
  private config: NotificationConfig = {
    enableDueDateReminders: true,
    enableProgressNotifications: true,
    reminderDaysBefore: 1,
    dailyReminderTime: "09:00",
  };

  // Initialize the notification service
  async initialize() {
    try {
      // Load configuration from settings or use defaults
      const settings = await db.getSettings();
      // In a real implementation, you would store notification settings in the database
      this.loadNotifications();
      this.scheduleNotificationCheck();
    } catch (error) {
      console.error("Failed to initialize notification service:", error);
    }
  }

  // Load existing notifications (in a real app, these would be stored in database)
  private loadNotifications() {
    const stored = localStorage.getItem("planforge-notifications");
    if (stored) {
      try {
        this.notifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
          dueDate: n.dueDate ? new Date(n.dueDate) : undefined,
        }));
      } catch (error) {
        console.error("Failed to load notifications:", error);
        this.notifications = [];
      }
    }
  }

  // Save notifications to local storage
  private saveNotifications() {
    try {
      localStorage.setItem(
        "planforge-notifications",
        JSON.stringify(this.notifications)
      );
    } catch (error) {
      console.error("Failed to save notifications:", error);
    }
  }

  // Schedule periodic notification checks
  private scheduleNotificationCheck() {
    // Check for new notifications every hour
    setInterval(() => {
      this.checkForNewNotifications();
    }, 60 * 60 * 1000);

    // Initial check
    this.checkForNewNotifications();
  }

  // Check for tasks that need notifications
  async checkForNewNotifications() {
    if (!this.config.enableDueDateReminders) return;

    try {
      const plans = await db.getPlans();
      const now = new Date();
      const reminderThreshold = new Date();
      reminderThreshold.setDate(now.getDate() + this.config.reminderDaysBefore);

      for (const plan of plans) {
        if (!plan.tasks) continue;

        for (const task of plan.tasks) {
          if (!task.dueDate || task.status === "COMPLETED") continue;

          const dueDate = new Date(task.dueDate);
          const taskId = task.id;

          // Check if we already have a notification for this task
          const existingNotification = this.notifications.find(
            (n) =>
              n.taskId === taskId &&
              (n.type === "due_date" || n.type === "overdue")
          );

          if (existingNotification) continue;

          // Check if task is overdue
          if (dueDate < now) {
            this.addNotification({
              type: "overdue",
              title: "Task Overdue",
              message: `"${
                task.title
              }" was due on ${dueDate.toLocaleDateString()}`,
              taskId,
              planId: plan.id,
              dueDate,
              priority: "high",
            });
          }
          // Check if task is due soon
          else if (dueDate <= reminderThreshold) {
            const daysUntilDue = Math.ceil(
              (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );
            this.addNotification({
              type: "due_date",
              title: "Task Due Soon",
              message: `"${task.title}" is due ${
                daysUntilDue === 0
                  ? "today"
                  : `in ${daysUntilDue} day${daysUntilDue > 1 ? "s" : ""}`
              }`,
              taskId,
              planId: plan.id,
              dueDate,
              priority: daysUntilDue === 0 ? "high" : "medium",
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to check for notifications:", error);
    }
  }

  // Add a new notification
  private addNotification(
    notification: Omit<Notification, "id" | "createdAt" | "isRead">
  ) {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      createdAt: new Date(),
      isRead: false,
    };

    this.notifications.unshift(newNotification);
    this.saveNotifications();

    // Show browser notification if permission is granted
    this.showBrowserNotification(newNotification);
  }

  // Show browser notification
  private showBrowserNotification(notification: Notification) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico", // You would use your app icon here
        tag: notification.id,
      });
    }
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  // Get all notifications
  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  // Get unread notifications
  getUnreadNotifications(): Notification[] {
    return this.notifications.filter((n) => !n.isRead);
  }

  // Mark notification as read
  markAsRead(notificationId: string) {
    const notification = this.notifications.find(
      (n) => n.id === notificationId
    );
    if (notification) {
      notification.isRead = true;
      this.saveNotifications();
    }
  }

  // Mark all notifications as read
  markAllAsRead() {
    this.notifications.forEach((n) => (n.isRead = true));
    this.saveNotifications();
  }

  // Delete a notification
  deleteNotification(notificationId: string) {
    this.notifications = this.notifications.filter(
      (n) => n.id !== notificationId
    );
    this.saveNotifications();
  }

  // Clear all notifications
  clearAllNotifications() {
    this.notifications = [];
    this.saveNotifications();
  }

  // Update configuration
  updateConfig(newConfig: Partial<NotificationConfig>) {
    this.config = { ...this.config, ...newConfig };
    // In a real implementation, save to database
  }

  // Get configuration
  getConfig(): NotificationConfig {
    return { ...this.config };
  }

  // Check for milestone completions and send progress notifications
  async checkMilestoneProgress(planId: string) {
    if (!this.config.enableProgressNotifications) return;

    try {
      const plan = await db.getPlan(planId);
      if (!plan || !plan.milestones) return;

      for (const milestone of plan.milestones) {
        if (milestone.status !== "COMPLETED") continue;

        // Check if we already notified about this milestone
        const existingNotification = this.notifications.find(
          (n) =>
            n.type === "milestone" &&
            n.planId === planId &&
            n.message.includes(milestone.title)
        );

        if (!existingNotification) {
          this.addNotification({
            type: "milestone",
            title: "Milestone Completed! 🎉",
            message: `You've completed the milestone "${milestone.title}" in ${plan.title}`,
            planId: plan.id,
            priority: "medium",
          });
        }
      }
    } catch (error) {
      console.error("Failed to check milestone progress:", error);
    }
  }

  // Send progress notification when plan is completed
  async notifyPlanCompletion(planId: string) {
    if (!this.config.enableProgressNotifications) return;

    try {
      const plan = await db.getPlan(planId);
      if (!plan || plan.status !== "COMPLETED") return;

      // Check if we already notified about this plan completion
      const existingNotification = this.notifications.find(
        (n) =>
          n.type === "progress" &&
          n.planId === planId &&
          n.message.includes("completed")
      );

      if (!existingNotification) {
        this.addNotification({
          type: "progress",
          title: "Plan Completed! 🎊",
          message: `Congratulations! You've completed "${plan.title}". Time to celebrate your achievement!`,
          planId: plan.id,
          priority: "high",
        });
      }
    } catch (error) {
      console.error("Failed to send plan completion notification:", error);
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;

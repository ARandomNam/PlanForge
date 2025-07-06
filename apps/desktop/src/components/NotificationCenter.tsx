import React, { useState, useEffect } from "react";
import {
  Bell,
  X,
  Check,
  Clock,
  AlertTriangle,
  Trophy,
  CheckCircle,
  Trash2,
} from "lucide-react";
import {
  notificationService,
  type Notification,
} from "../lib/notification-service";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = () => {
    const allNotifications = notificationService.getNotifications();
    setNotifications(allNotifications);
  };

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const handleMarkAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
    loadNotifications();
  };

  const handleDeleteNotification = (notificationId: string) => {
    notificationService.deleteNotification(notificationId);
    loadNotifications();
  };

  const handleClearAll = () => {
    notificationService.clearAllNotifications();
    loadNotifications();
  };

  const getNotificationIcon = (type: string, priority: string) => {
    switch (type) {
      case "overdue":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case "due_date":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "milestone":
        return <Trophy className="h-5 w-5 text-blue-600" />;
      case "progress":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationBgColor = (type: string, isRead: boolean) => {
    const opacity = isRead ? "50" : "100";
    switch (type) {
      case "overdue":
        return `bg-red-${opacity} border-red-200`;
      case "due_date":
        return `bg-yellow-${opacity} border-yellow-200`;
      case "milestone":
        return `bg-blue-${opacity} border-blue-200`;
      case "progress":
        return `bg-green-${opacity} border-green-200`;
      default:
        return `bg-gray-${opacity} border-gray-200`;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-end p-4 z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Notifications
              </h2>
              {notifications.filter((n) => !n.isRead).length > 0 && (
                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                  {notifications.filter((n) => !n.isRead).length}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Filter and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  filter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  filter === "unread"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                Unread
              </button>
            </div>

            <div className="flex space-x-1">
              {notifications.filter((n) => !n.isRead).length > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  title="Mark all as read"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  title="Clear all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-96">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                {filter === "unread"
                  ? "No unread notifications"
                  : "No notifications yet"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {filter === "unread"
                  ? "All caught up! 🎉"
                  : "You'll see task reminders and progress updates here"}
              </p>
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-all ${getNotificationBgColor(
                    notification.type,
                    notification.isRead
                  )} ${notification.isRead ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(
                        notification.type,
                        notification.priority
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-foreground">
                            {notification.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            {notification.priority === "high" && (
                              <span className="bg-red-100 text-red-700 text-xs px-1 py-0.5 rounded">
                                High
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                              title="Mark as read"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          )}
                          <button
                            onClick={() =>
                              handleDeleteNotification(notification.id)
                            }
                            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                            title="Delete"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-border bg-card">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                {notifications.length} total notification
                {notifications.length !== 1 ? "s" : ""}
                {notifications.filter((n) => !n.isRead).length > 0 && (
                  <span>
                    {" "}
                    • {notifications.filter((n) => !n.isRead).length} unread
                  </span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;

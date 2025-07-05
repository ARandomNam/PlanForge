import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Plus,
  Settings,
  ChevronLeft,
  ChevronRight,
  Target,
  CheckSquare,
  Calendar,
} from "lucide-react";
import { SidebarProps } from "../types";

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();

  const navigationItems = [
    {
      path: "/",
      icon: Home,
      label: "Dashboard",
      description: "View all plans",
    },
    {
      path: "/new-plan",
      icon: Plus,
      label: "New Plan",
      description: "Create a new goal",
    },
    {
      path: "/tasks",
      icon: CheckSquare,
      label: "Tasks",
      description: "Manage tasks",
    },
    {
      path: "/calendar",
      icon: Calendar,
      label: "Calendar",
      description: "View timeline",
    },
    {
      path: "/settings",
      icon: Settings,
      label: "Settings",
      description: "App preferences",
    },
  ];

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-card border-r border-border transition-all duration-300 z-50 ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div
          className={`flex items-center space-x-3 ${
            isOpen ? "opacity-100" : "opacity-0"
          } transition-opacity duration-300`}
        >
          <Target className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold text-foreground">PlanForge</h1>
        </div>
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors group ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <div
                className={`${
                  isOpen ? "opacity-100" : "opacity-0"
                } transition-opacity duration-300 overflow-hidden`}
              >
                <div className="font-medium">{item.label}</div>
                {isOpen && (
                  <div className="text-xs opacity-70">{item.description}</div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-4 left-4 right-4">
        <div
          className={`text-xs text-muted-foreground ${
            isOpen ? "opacity-100" : "opacity-0"
          } transition-opacity duration-300`}
        >
          <div className="font-medium">PlanForge v1.0.0</div>
          <div>AI-powered planning</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

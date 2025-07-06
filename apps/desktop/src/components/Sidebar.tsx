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
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { SidebarProps } from "../types";
import { useTheme } from "../contexts/ThemeContext";

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { theme, setTheme, actualTheme } = useTheme();

  const navigationItems = [
    {
      path: "/",
      icon: Home,
      label: "Dashboard",
      description: "Overview & stats",
    },
    {
      path: "/plans",
      icon: Target,
      label: "Plans",
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
      className={`fixed left-0 top-0 h-full bg-card border-r border-border sidebar-bg transition-all duration-300 ease-in-out z-50 ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border theme-transition-top">
        <div
          className={`flex items-center space-x-3 ${
            isOpen ? "opacity-100" : "opacity-0"
          } transition-opacity duration-300 ease-in-out`}
        >
          <Target className="h-8 w-8 text-primary sidebar-icon" />
          <h1 className="text-xl font-bold text-foreground sidebar-text">
            PlanForge
          </h1>
        </div>
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-accent hover:text-accent-foreground sidebar-button"
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? (
            <ChevronLeft className="h-4 w-4 sidebar-icon" />
          ) : (
            <ChevronRight className="h-4 w-4 sidebar-icon" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 theme-transition-middle">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 p-3 rounded-lg sidebar-button group ${
                isActive
                  ? "sidebar-nav-active"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0 sidebar-icon" />
              <div
                className={`${
                  isOpen ? "opacity-100" : "opacity-0"
                } transition-opacity duration-300 ease-in-out overflow-hidden`}
              >
                <div className="font-medium sidebar-text">{item.label}</div>
                {isOpen && (
                  <div className="text-xs opacity-70 sidebar-text">
                    {item.description}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-4 left-4 right-4 space-y-4 theme-transition-bottom">
        {/* Theme Toggle */}
        <button
          onClick={() => {
            const nextTheme =
              theme === "light"
                ? "dark"
                : theme === "dark"
                ? "system"
                : "light";
            setTheme(nextTheme);
          }}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-accent hover:text-accent-foreground sidebar-button"
          title={`Current theme: ${theme}`}
        >
          {actualTheme === "dark" ? (
            <Moon className="h-4 w-4 sidebar-icon" />
          ) : (
            <Sun className="h-4 w-4 sidebar-icon" />
          )}
          {isOpen && (
            <span className="ml-2 text-sm capitalize sidebar-text">
              {theme}
            </span>
          )}
        </button>

        <div
          className={`text-xs text-muted-foreground ${
            isOpen ? "opacity-100" : "opacity-0"
          } transition-opacity duration-300 ease-in-out`}
        >
          <div className="font-medium sidebar-text">PlanForge v1.0.0</div>
          <div className="sidebar-text">AI-powered planning</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

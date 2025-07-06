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
      <div className="h-16 flex items-center border-b border-border theme-transition-top px-2">
        {isOpen ? (
          <>
            {/* Logo - When expanded */}
            <div className="flex items-center justify-center w-10 h-10 flex-shrink-0">
              <Target className="h-6 w-6 text-primary sidebar-icon" />
            </div>

            {/* Title */}
            <h1 className="ml-3 text-xl font-bold text-foreground sidebar-text truncate flex-1">
              PlanForge
            </h1>

            {/* Toggle Button */}
            <button
              onClick={onToggle}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent hover:text-accent-foreground sidebar-button flex-shrink-0"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4 sidebar-icon" />
            </button>
          </>
        ) : (
          /* Collapsed state - Center everything */
          <div className="w-full flex flex-col items-center justify-center space-y-1">
            {/* Logo centered */}
            <div className="flex items-center justify-center w-8 h-8">
              <Target className="h-5 w-5 text-primary sidebar-icon" />
            </div>

            {/* Toggle Button below logo */}
            <button
              onClick={onToggle}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-accent hover:text-accent-foreground sidebar-button"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-3 w-3 sidebar-icon" />
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1 theme-transition-middle">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center rounded-lg transition-all duration-200 ${
                isOpen ? "h-14 px-3" : "h-12 px-2"
              } ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {/* Icon Container - Fixed width */}
              <div
                className={`flex items-center justify-center flex-shrink-0 ${
                  isOpen ? "w-8 h-8" : "w-6 h-6"
                }`}
              >
                <Icon
                  className={`${isOpen ? "h-5 w-5" : "h-4 w-4"} ${
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                />
              </div>

              {/* Text Content - Only show when expanded */}
              {isOpen && (
                <div className="ml-3 flex-1 min-w-0">
                  <div
                    className={`font-medium text-sm truncate ${
                      isActive ? "text-primary-foreground" : "text-foreground"
                    }`}
                  >
                    {item.label}
                  </div>
                  <div
                    className={`text-xs truncate ${
                      isActive
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-3 space-y-3 theme-transition-bottom">
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
          className={`w-full flex items-center rounded-lg hover:bg-accent hover:text-accent-foreground sidebar-button transition-colors ${
            isOpen ? "h-12 px-3" : "h-10 px-2"
          }`}
          title={`Current theme: ${theme}`}
        >
          {/* Icon Container */}
          <div
            className={`flex items-center justify-center flex-shrink-0 ${
              isOpen ? "w-8 h-8" : "w-6 h-6"
            }`}
          >
            {actualTheme === "dark" ? (
              <Moon
                className={`text-muted-foreground ${
                  isOpen ? "h-4 w-4" : "h-4 w-4"
                }`}
              />
            ) : (
              <Sun
                className={`text-muted-foreground ${
                  isOpen ? "h-4 w-4" : "h-4 w-4"
                }`}
              />
            )}
          </div>

          {/* Text */}
          {isOpen && (
            <span className="ml-3 text-sm text-foreground capitalize">
              {theme}
            </span>
          )}
        </button>

        {/* Version Info - Only show when expanded */}
        {isOpen && (
          <div className="text-xs text-muted-foreground space-y-1 px-3">
            <div className="font-medium">PlanForge v1.0.0</div>
            <div>AI-powered planning</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

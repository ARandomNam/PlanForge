import React, { createContext, useContext, useReducer, useEffect } from "react";
import { Plan, Task, Milestone, Settings, db } from "../lib/database-api";

interface PlanState {
  plans: Plan[];
  currentPlan: Plan | null;
  tasks: Task[];
  milestones: Milestone[];
  settings: Settings | null;
  loading: boolean;
  error: string | null;
}

type PlanAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_PLANS"; payload: Plan[] }
  | { type: "SET_CURRENT_PLAN"; payload: Plan | null }
  | { type: "SET_TASKS"; payload: Task[] }
  | { type: "SET_MILESTONES"; payload: Milestone[] }
  | { type: "SET_SETTINGS"; payload: Settings | null }
  | { type: "ADD_PLAN"; payload: Plan }
  | { type: "UPDATE_PLAN"; payload: Plan }
  | { type: "DELETE_PLAN"; payload: string }
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: Task }
  | { type: "DELETE_TASK"; payload: string };

const initialState: PlanState = {
  plans: [],
  currentPlan: null,
  tasks: [],
  milestones: [],
  settings: null,
  loading: false,
  error: null,
};

const planReducer = (state: PlanState, action: PlanAction): PlanState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_PLANS":
      return { ...state, plans: action.payload };
    case "SET_CURRENT_PLAN":
      return { ...state, currentPlan: action.payload };
    case "SET_TASKS":
      return { ...state, tasks: action.payload };
    case "SET_MILESTONES":
      return { ...state, milestones: action.payload };
    case "SET_SETTINGS":
      return { ...state, settings: action.payload };
    case "ADD_PLAN":
      return { ...state, plans: [...state.plans, action.payload] };
    case "UPDATE_PLAN":
      return {
        ...state,
        plans: state.plans.map((plan) =>
          plan.id === action.payload.id ? action.payload : plan
        ),
        currentPlan:
          state.currentPlan?.id === action.payload.id
            ? action.payload
            : state.currentPlan,
      };
    case "DELETE_PLAN":
      return {
        ...state,
        plans: state.plans.filter((plan) => plan.id !== action.payload),
        currentPlan:
          state.currentPlan?.id === action.payload ? null : state.currentPlan,
      };
    case "ADD_TASK":
      return { ...state, tasks: [...state.tasks, action.payload] };
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? action.payload : task
        ),
      };
    case "DELETE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };
    default:
      return state;
  }
};

interface PlanContextValue extends PlanState {
  dispatch: React.Dispatch<PlanAction>;
  loadPlans: () => Promise<void>;
  loadTasks: (planId?: string) => Promise<void>;
  loadMilestones: (planId?: string) => Promise<void>;
  loadSettings: () => Promise<void>;
  createPlan: (
    plan: Omit<Plan, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateTaskStatus: (taskId: string, status: string) => Promise<void>;
}

const PlanContext = createContext<PlanContextValue | undefined>(undefined);

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error("usePlan must be used within a PlanProvider");
  }
  return context;
};

interface PlanProviderProps {
  children: React.ReactNode;
}

export const PlanProvider: React.FC<PlanProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(planReducer, initialState);

  const loadPlans = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const plans = await db.getPlans();
      dispatch({ type: "SET_PLANS", payload: plans });
    } catch (error) {
      console.error("Failed to load plans:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to load plans" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const loadTasks = async (planId?: string) => {
    try {
      if (planId) {
        const plan = await db.getPlan(planId);
        dispatch({ type: "SET_TASKS", payload: plan?.tasks || [] });
      } else {
        // Load all tasks across all plans
        const plans = await db.getPlans();
        const allTasks = plans.flatMap((plan) => plan.tasks || []);
        dispatch({ type: "SET_TASKS", payload: allTasks });
      }
    } catch (error) {
      console.error("Failed to load tasks:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to load tasks" });
    }
  };

  const loadMilestones = async (planId?: string) => {
    try {
      if (planId) {
        const plan = await db.getPlan(planId);
        dispatch({ type: "SET_MILESTONES", payload: plan?.milestones || [] });
      } else {
        // Load all milestones across all plans
        const plans = await db.getPlans();
        const allMilestones = plans.flatMap((plan) => plan.milestones || []);
        dispatch({ type: "SET_MILESTONES", payload: allMilestones });
      }
    } catch (error) {
      console.error("Failed to load milestones:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to load milestones" });
    }
  };

  const loadSettings = async () => {
    try {
      const settings = await db.getSettings();
      dispatch({ type: "SET_SETTINGS", payload: settings });
    } catch (error) {
      console.error("Failed to load settings:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to load settings" });
    }
  };

  const createPlan = async (
    planData: Omit<Plan, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const newPlan = await db.createPlan({
        title: planData.title,
        description: planData.description,
        goal: planData.goal,
        timeframe: planData.timeframe,
      });
      dispatch({ type: "ADD_PLAN", payload: newPlan });
    } catch (error) {
      console.error("Failed to create plan:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to create plan" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const updatedTask = await db.updateTask(taskId, {
        status,
        completedAt: status === "COMPLETED" ? new Date() : undefined,
      });
      dispatch({ type: "UPDATE_TASK", payload: updatedTask });
    } catch (error) {
      console.error("Failed to update task status:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to update task status" });
    }
  };

  // Load initial data
  useEffect(() => {
    loadPlans();
    loadSettings();
  }, []);

  const value: PlanContextValue = {
    ...state,
    dispatch,
    loadPlans,
    loadTasks,
    loadMilestones,
    loadSettings,
    createPlan,
    updateTaskStatus,
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
};

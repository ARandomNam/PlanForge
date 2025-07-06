import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Calendar,
  Target,
  CheckCircle2,
  Clock,
  Pause,
  X,
} from "lucide-react";
import { db, type Plan } from "../lib/database-api";

const Plans: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const plansData = await db.getPlans();
      setPlans(plansData);
    } catch (error) {
      console.error("Failed to load plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "ACTIVE":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "PAUSED":
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case "CANCELLED":
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "text-green-600 bg-green-100";
      case "ACTIVE":
        return "text-blue-600 bg-blue-100";
      case "PAUSED":
        return "text-yellow-600 bg-yellow-100";
      case "CANCELLED":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const calculateProgress = (plan: Plan) => {
    if (!plan.tasks || plan.tasks.length === 0) {
      return plan.status === "COMPLETED" ? 100 : 0;
    }
    const completedTasks = plan.tasks.filter(
      (task) => task.status === "COMPLETED"
    ).length;
    return Math.round((completedTasks / plan.tasks.length) * 100);
  };

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.goal.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || plan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between theme-transition-top">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Plans</h1>
          <p className="text-muted-foreground">
            Manage and track all your plans in one place
          </p>
        </div>
        <button
          onClick={() => navigate("/new-plan")}
          className="inline-flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Plan</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 theme-transition-middle">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="PAUSED">Paused</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Plans Grid */}
      {filteredPlans.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            No plans found
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filter criteria."
              : "Get started by creating your first plan."}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <button
              onClick={() => navigate("/new-plan")}
              className="inline-flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Your First Plan</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 theme-transition-bottom">
          {filteredPlans.map((plan) => {
            const progress = calculateProgress(plan);
            return (
              <div
                key={plan.id}
                className="bg-card p-6 rounded-lg border border-border cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/plan/${plan.id}`)}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <h3 className="text-lg font-semibold text-foreground leading-6">
                        {plan.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(plan.status)}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            plan.status
                          )}`}
                        >
                          {plan.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {plan.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {plan.description}
                    </p>
                  )}

                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Target className="h-4 w-4" />
                      Goal
                    </div>
                    <p className="text-sm text-foreground line-clamp-2">
                      {plan.goal}
                    </p>
                  </div>

                  {plan.timeframe && (
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Calendar className="h-4 w-4" />
                        Timeframe
                      </div>
                      <p className="text-sm text-foreground">
                        {plan.timeframe}
                      </p>
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">
                        Progress
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{plan.tasks?.length || 0} tasks</span>
                    <span>{plan.milestones?.length || 0} milestones</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Plans;

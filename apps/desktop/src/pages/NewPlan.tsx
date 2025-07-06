import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Target,
  Wand2,
  Clock,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Check,
} from "lucide-react";
import { db } from "../lib/database-api";
import { aiService, type AIGeneratedPlan } from "../lib/ai-service";

const NewPlan: React.FC = () => {
  const navigate = useNavigate();
  const [goal, setGoal] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useAI, setUseAI] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<AIGeneratedPlan | null>(
    null
  );
  const [showPreview, setShowPreview] = useState(false);

  const timeframeOptions = [
    { value: "", label: "No specific timeframe" },
    { value: "1 week", label: "1 Week" },
    { value: "2 weeks", label: "2 Weeks" },
    { value: "1 month", label: "1 Month" },
    { value: "2 months", label: "2 Months" },
    { value: "3 months", label: "3 Months" },
    { value: "6 months", label: "6 Months" },
    { value: "1 year", label: "1 Year" },
  ];

  const exampleGoals = [
    "Learn React and build a portfolio website",
    "Get in shape and run a 5K marathon",
    "Learn Spanish to conversational level",
    "Start a side business selling handmade crafts",
    "Read 24 books this year",
    "Learn to play guitar and perform a song",
  ];

  useEffect(() => {
    checkAIAvailability();
  }, []);

  const checkAIAvailability = async () => {
    try {
      const settings = await db.getSettings();
      if (settings.openaiApiKey) {
        await aiService.initialize(settings.openaiApiKey);
        setAiAvailable(true);
        setUseAI(true); // Default to AI if available
      }
    } catch (error) {
      console.log("AI not available:", error);
      setAiAvailable(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!goal.trim()) {
      setError("Please enter your goal");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      if (useAI && aiAvailable) {
        // Generate plan with AI
        const aiPlan = await aiService.generatePlan(
          goal.trim(),
          timeframe || undefined
        );
        setGeneratedPlan(aiPlan);
        setShowPreview(true);
      } else {
        // Create basic plan without AI
        await createBasicPlan();
      }
    } catch (err) {
      console.error("Failed to generate/create plan:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create plan. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const createBasicPlan = async () => {
    const plan = await db.createPlan({
      title: goal.length > 50 ? goal.substring(0, 50) + "..." : goal,
      description: `Plan to achieve: ${goal}`,
      goal: goal.trim(),
      timeframe: timeframe || undefined,
    });

    console.log("Basic plan created:", plan);
    navigate("/");
  };

  const handleConfirmAIPlan = async () => {
    if (!generatedPlan) return;

    setIsGenerating(true);
    setError(null);

    try {
      // Create the plan
      const plan = await db.createPlan({
        title: generatedPlan.title,
        description: generatedPlan.description,
        goal: goal.trim(),
        timeframe: generatedPlan.estimatedTimeframe,
      });

      // Create milestones
      const createdMilestones = await Promise.all(
        generatedPlan.milestones.map((milestone) =>
          db.createMilestone({
            title: milestone.title,
            description: milestone.description,
            planId: plan.id,
            order: milestone.order,
          })
        )
      );

      // Create tasks
      await Promise.all(
        generatedPlan.tasks.map((task) => {
          const milestoneId =
            task.milestoneIndex !== undefined
              ? createdMilestones[task.milestoneIndex]?.id
              : undefined;

          return db.createTask({
            title: task.title,
            description: task.description,
            priority: task.priority,
            estimatedHours: task.estimatedHours,
            planId: plan.id,
            milestoneId,
            order: task.order,
          });
        })
      );

      console.log("AI-generated plan created successfully:", plan);
      navigate("/");
    } catch (err) {
      console.error("Failed to create AI plan:", err);
      setError("Failed to create plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExampleClick = (exampleGoal: string) => {
    setGoal(exampleGoal);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <Target className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Create New Plan
        </h1>
        <p className="text-muted-foreground text-lg">
          Tell us your goal and let AI create a detailed action plan for you
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Goal Input */}
            <div>
              <label
                htmlFor="goal"
                className="block text-sm font-medium text-foreground mb-2"
              >
                What do you want to achieve? *
              </label>
              <textarea
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Describe your goal in detail. Be specific about what you want to accomplish..."
                className="w-full p-4 border border-border rounded-lg resize-none h-32 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isGenerating}
              />
            </div>

            {/* Timeframe */}
            <div>
              <label
                htmlFor="timeframe"
                className="block text-sm font-medium text-foreground mb-2"
              >
                <Clock className="inline h-4 w-4 mr-1" />
                Timeframe (Optional)
              </label>
              <select
                id="timeframe"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isGenerating}
              >
                {timeframeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* AI Configuration */}
            <div className="bg-card p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="font-medium text-foreground">
                    AI-Powered Planning
                  </span>
                </div>
                {aiAvailable && (
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useAI}
                      onChange={(e) => setUseAI(e.target.checked)}
                      className="sr-only peer"
                      disabled={isGenerating}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                )}
              </div>

              {aiAvailable ? (
                <div className="text-sm text-muted-foreground">
                  {useAI ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <Sparkles className="h-4 w-4" />
                      <span>
                        AI will generate detailed milestones and tasks for your
                        plan
                      </span>
                    </div>
                  ) : (
                    <span>Create a basic plan structure manually</span>
                  )}
                </div>
              ) : (
                <div className="text-sm text-amber-600">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>AI features require OpenAI API key</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/settings")}
                    className="text-primary hover:text-primary/80 underline"
                  >
                    Configure in Settings →
                  </button>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isGenerating || !goal.trim()}
              className="w-full bg-primary text-primary-foreground p-4 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <Wand2 className="h-5 w-5 animate-spin" />
                  <span>
                    {useAI && aiAvailable
                      ? "Generating with AI..."
                      : "Creating plan..."}
                  </span>
                </>
              ) : (
                <>
                  {useAI && aiAvailable ? (
                    <Sparkles className="h-5 w-5" />
                  ) : (
                    <Target className="h-5 w-5" />
                  )}
                  <span>
                    {useAI && aiAvailable
                      ? "Generate Plan with AI"
                      : "Create Basic Plan"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Tips */}
          <div className="bg-card p-4 rounded-lg border border-border">
            <h3 className="font-medium text-foreground mb-2">
              💡 Tips for better results:
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Be specific about what you want to achieve</li>
              <li>• Include any constraints or preferences</li>
              <li>• Mention your current skill level if relevant</li>
              <li>• Add context about why this goal matters to you</li>
            </ul>
          </div>
        </div>

        {/* Examples */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Example Goals
            </h3>
            <div className="space-y-3">
              {exampleGoals.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="w-full p-4 text-left bg-card border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                  disabled={isGenerating}
                >
                  <div className="flex items-start space-x-3">
                    <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{example}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Process Preview */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="font-semibold text-foreground mb-4">
              What happens next?
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div>
                  <div className="font-medium text-foreground">AI Analysis</div>
                  <div className="text-sm text-muted-foreground">
                    Our AI analyzes your goal and creates a structured plan
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div>
                  <div className="font-medium text-foreground">
                    Milestone Creation
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Break down into achievable milestones with timelines
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div>
                  <div className="font-medium text-foreground">
                    Task Generation
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Generate specific, actionable tasks for each milestone
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  4
                </div>
                <div>
                  <div className="font-medium text-foreground">
                    Resource Suggestions
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Recommend helpful resources, tools, and learning materials
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Plan Preview Modal */}
      {showPreview && generatedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto w-full">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">
                    AI Generated Plan Preview
                  </h2>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Plan Overview */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {generatedPlan.title}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {generatedPlan.description}
                </p>
                <div className="bg-card p-4 rounded-lg border border-border">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-foreground">
                        Estimated Timeframe:
                      </span>
                      <div className="text-muted-foreground">
                        {generatedPlan.estimatedTimeframe}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">
                        Total Tasks:
                      </span>
                      <div className="text-muted-foreground">
                        {generatedPlan.tasks.length} tasks
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Milestones */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-foreground mb-4">
                  Milestones ({generatedPlan.milestones.length})
                </h4>
                <div className="space-y-3">
                  {generatedPlan.milestones.map((milestone, index) => (
                    <div
                      key={index}
                      className="bg-card p-4 rounded-lg border border-border"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                          {milestone.order}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-foreground">
                            {milestone.title}
                          </h5>
                          <p className="text-sm text-muted-foreground mt-1">
                            {milestone.description}
                          </p>
                          <span className="text-xs text-primary mt-2 inline-block">
                            Duration: {milestone.estimatedDuration}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks Preview */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-foreground mb-4">
                  Tasks Preview ({generatedPlan.tasks.length})
                </h4>
                <div className="grid gap-3 max-h-60 overflow-y-auto">
                  {generatedPlan.tasks.slice(0, 8).map((task, index) => (
                    <div
                      key={index}
                      className="bg-card p-3 rounded-lg border border-border"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h6 className="font-medium text-foreground text-sm">
                            {task.title}
                          </h6>
                          <p className="text-xs text-muted-foreground mt-1">
                            {task.description}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              task.priority === "HIGH"
                                ? "bg-red-100 text-red-700"
                                : task.priority === "MEDIUM"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {task.priority}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {task.estimatedHours}h
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {generatedPlan.tasks.length > 8 && (
                    <div className="text-center text-sm text-muted-foreground">
                      ... and {generatedPlan.tasks.length - 8} more tasks
                    </div>
                  )}
                </div>
              </div>

              {/* Tips */}
              {generatedPlan.tips && generatedPlan.tips.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-foreground mb-4">
                    Success Tips
                  </h4>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <ul className="space-y-2">
                      {generatedPlan.tips.map((tip, index) => (
                        <li
                          key={index}
                          className="text-sm text-blue-700 flex items-start space-x-2"
                        >
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-6 py-2 border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
                  disabled={isGenerating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAIPlan}
                  disabled={isGenerating}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <Wand2 className="h-4 w-4 animate-spin" />
                      <span>Creating Plan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Create This Plan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewPlan;

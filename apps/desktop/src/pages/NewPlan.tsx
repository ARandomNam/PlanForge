import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Target, Wand2, Clock, ArrowRight, AlertCircle } from "lucide-react";
import { db } from "../lib/database-api";

const NewPlan: React.FC = () => {
  const navigate = useNavigate();
  const [goal, setGoal] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!goal.trim()) {
      setError("Please enter your goal");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Create basic plan first
      const plan = await db.createPlan({
        title: goal.length > 50 ? goal.substring(0, 50) + "..." : goal,
        description: `Plan to achieve: ${goal}`,
        goal: goal.trim(),
        timeframe: timeframe || undefined,
      });

      console.log("Plan created:", plan);

      // TODO: Implement AI plan generation to add milestones and tasks
      // For now, just create the basic plan structure

      // Navigate to dashboard after successful creation
      navigate("/");
    } catch (err) {
      console.error("Failed to create plan:", err);
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
                  <span>Generating your plan...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-5 w-5" />
                  <span>Generate Plan with AI</span>
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
    </div>
  );
};

export default NewPlan;

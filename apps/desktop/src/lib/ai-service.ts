import OpenAI from "openai";

export interface AIGeneratedPlan {
  title: string;
  description: string;
  milestones: AIGeneratedMilestone[];
  tasks: AIGeneratedTask[];
  estimatedTimeframe: string;
  tips: string[];
}

export interface AIGeneratedMilestone {
  title: string;
  description: string;
  order: number;
  estimatedDuration: string;
}

export interface AIGeneratedTask {
  title: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  estimatedHours: number;
  milestoneIndex?: number;
  order: number;
  prerequisites?: string[];
}

export interface AISettings {
  apiKey: string;
  model: string;
  temperature: number;
}

class AIService {
  private openai: OpenAI | null = null;
  private settings: AISettings | null = null;

  async initialize(apiKey: string) {
    if (!apiKey) {
      throw new Error("OpenAI API key is required");
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true, // Note: In production, API calls should go through your backend
    });

    this.settings = {
      apiKey,
      model: "gpt-4",
      temperature: 0.7,
    };

    // Test the API key
    try {
      await this.openai.models.list();
      return true;
    } catch (error) {
      console.error("Failed to initialize OpenAI:", error);
      throw new Error("Invalid OpenAI API key or connection failed");
    }
  }

  async generatePlan(
    goal: string,
    timeframe?: string
  ): Promise<AIGeneratedPlan> {
    if (!this.openai) {
      throw new Error(
        "AI service not initialized. Please set up your OpenAI API key first."
      );
    }

    const timeframeText = timeframe
      ? `within ${timeframe}`
      : "with no specific timeframe";

    const prompt = `You are an expert project manager and goal-setting coach. Create a detailed, actionable plan for the following goal: "${goal}" ${timeframeText}.

Please provide a comprehensive plan in the following JSON format:

{
  "title": "A concise, actionable title for the plan (max 60 characters)",
  "description": "A brief description of what this plan will accomplish (2-3 sentences)",
  "milestones": [
    {
      "title": "Milestone title",
      "description": "What this milestone achieves",
      "order": 1,
      "estimatedDuration": "e.g., 2 weeks, 1 month"
    }
  ],
  "tasks": [
    {
      "title": "Specific, actionable task title",
      "description": "Detailed description of what needs to be done",
      "priority": "HIGH|MEDIUM|LOW",
      "estimatedHours": 8,
      "milestoneIndex": 0,
      "order": 1,
      "prerequisites": ["Optional array of prerequisite task titles"]
    }
  ],
  "estimatedTimeframe": "Overall estimated timeframe",
  "tips": ["Helpful tips and advice for success"]
}

Guidelines:
- Create 3-5 logical milestones that build upon each other
- Generate 8-15 specific, actionable tasks
- Distribute tasks across milestones logically
- Use realistic time estimates
- Include both high-level strategy and specific actions
- Consider dependencies between tasks
- Provide practical, actionable advice in tips
- Make sure the plan is achievable and well-structured

Focus on creating a plan that is specific, measurable, achievable, relevant, and time-bound (SMART).`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.settings!.model,
        messages: [
          {
            role: "system",
            content:
              "You are an expert project manager and goal-setting coach. Always respond with valid JSON only, no additional text or explanations.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: this.settings!.temperature,
        max_tokens: 3000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response from OpenAI");
      }

      // Clean the response to ensure it's valid JSON
      const cleanedResponse = response
        .trim()
        .replace(/^```json\n?/, "")
        .replace(/\n?```$/, "");

      try {
        const plan: AIGeneratedPlan = JSON.parse(cleanedResponse);

        // Validate the response structure
        if (!plan.title || !plan.milestones || !plan.tasks) {
          throw new Error("Invalid plan structure from AI");
        }

        return plan;
      } catch (parseError) {
        console.error("Failed to parse AI response:", response);
        throw new Error("Failed to parse AI response as JSON");
      }
    } catch (error) {
      console.error("OpenAI API error:", error);
      if (error instanceof Error) {
        throw new Error(`AI generation failed: ${error.message}`);
      }
      throw new Error("AI generation failed with unknown error");
    }
  }

  async enhanceTask(
    taskTitle: string,
    context: string
  ): Promise<{
    description: string;
    estimatedHours: number;
    tips: string[];
  }> {
    if (!this.openai) {
      throw new Error("AI service not initialized");
    }

    const prompt = `Enhance this task with more details:

Task: "${taskTitle}"
Context: "${context}"

Provide a JSON response with:
{
  "description": "Detailed description of what needs to be done (2-3 sentences)",
  "estimatedHours": 8,
  "tips": ["Practical tips for completing this task effectively"]
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.settings!.model,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant. Respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 500,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response from OpenAI");
      }

      const cleanedResponse = response
        .trim()
        .replace(/^```json\n?/, "")
        .replace(/\n?```$/, "");
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error("Task enhancement error:", error);
      throw new Error("Failed to enhance task with AI");
    }
  }

  async suggestNextSteps(
    planTitle: string,
    completedTasks: string[],
    remainingTasks: string[]
  ): Promise<string[]> {
    if (!this.openai) {
      throw new Error("AI service not initialized");
    }

    const prompt = `Given the following plan progress, suggest 3-5 next steps or recommendations:

Plan: "${planTitle}"
Completed Tasks: ${completedTasks.join(", ")}
Remaining Tasks: ${remainingTasks.join(", ")}

Provide a JSON array of actionable suggestions:
["Suggestion 1", "Suggestion 2", "Suggestion 3"]`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.settings!.model,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful project advisor. Respond with a JSON array only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response from OpenAI");
      }

      const cleanedResponse = response
        .trim()
        .replace(/^```json\n?/, "")
        .replace(/\n?```$/, "");
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error("Next steps suggestion error:", error);
      throw new Error("Failed to get AI suggestions");
    }
  }

  isInitialized(): boolean {
    return this.openai !== null;
  }

  getSettings(): AISettings | null {
    return this.settings;
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;

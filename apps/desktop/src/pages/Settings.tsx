import React, { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Key,
  Palette,
  Globe,
  Download,
  Upload,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
} from "lucide-react";
import { db } from "../lib/database-api";

const Settings: React.FC = () => {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [theme, setTheme] = useState("LIGHT");
  const [language, setLanguage] = useState("en");
  const [isTestingApiKey, setIsTestingApiKey] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settings = await db.getSettings();
      setApiKey(settings.openaiApiKey || "");
      setTheme(settings.theme);
      setLanguage(settings.language);
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const themeOptions = [
    { value: "LIGHT", label: "Light" },
    { value: "DARK", label: "Dark" },
    { value: "SYSTEM", label: "Follow System" },
  ];

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "zh", label: "中文" },
    { value: "es", label: "Español" },
    { value: "fr", label: "Français" },
  ];

  const handleTestApiKey = async () => {
    if (!apiKey.trim()) {
      setApiKeyStatus("error");
      return;
    }

    setIsTestingApiKey(true);
    setApiKeyStatus("idle");

    try {
      // TODO: Implement actual API key testing
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setApiKeyStatus("success");
    } catch (error) {
      setApiKeyStatus("error");
    } finally {
      setIsTestingApiKey(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await db.updateSettings({
        openaiApiKey: apiKey.trim() || undefined,
        theme,
        language,
      });
      console.log("Settings saved successfully");
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    // TODO: Implement data export
    console.log("Exporting data...");
  };

  const handleImportData = () => {
    // TODO: Implement data import
    console.log("Importing data...");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Configure your PlanForge experience
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* API Configuration */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center space-x-3 mb-4">
            <Key className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              AI Configuration
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="apiKey"
                className="block text-sm font-medium text-foreground mb-2"
              >
                OpenAI API Key *
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full p-3 pr-20 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="p-1 hover:bg-accent rounded transition-colors"
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* API Key Status */}
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {apiKeyStatus === "success" && (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">
                        API key is valid
                      </span>
                    </>
                  )}
                  {apiKeyStatus === "error" && (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-600">
                        Invalid API key
                      </span>
                    </>
                  )}
                </div>
                <button
                  onClick={handleTestApiKey}
                  disabled={isTestingApiKey || !apiKey.trim()}
                  className="text-sm text-primary hover:text-primary/80 disabled:opacity-50 transition-colors"
                >
                  {isTestingApiKey ? "Testing..." : "Test Connection"}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-blue-900 mb-1">
                    Your API key is stored securely
                  </div>
                  <div className="text-blue-700">
                    Your OpenAI API key is encrypted and stored locally on your
                    device. It's never sent to our servers. You can get your API
                    key from{" "}
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:no-underline"
                    >
                      OpenAI's platform
                    </a>
                    .
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center space-x-3 mb-4">
            <Palette className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              Appearance
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="theme"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Theme
              </label>
              <select
                id="theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {themeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="language"
                className="block text-sm font-medium text-foreground mb-2"
              >
                <Globe className="inline h-4 w-4 mr-1" />
                Language
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center space-x-3 mb-4">
            <Download className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              Data Management
            </h2>
          </div>

          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <button
                onClick={handleExportData}
                className="flex items-center justify-center space-x-2 p-3 border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export Data</span>
              </button>

              <button
                onClick={handleImportData}
                className="flex items-center justify-center space-x-2 p-3 border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span>Import Data</span>
              </button>
            </div>

            <div className="text-sm text-muted-foreground">
              Export your plans and tasks as JSON for backup or transfer to
              another device. Import previously exported data to restore your
              plans.
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

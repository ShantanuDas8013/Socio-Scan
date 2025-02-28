import React, { useState, useEffect } from "react";
import { useUser } from "../hooks/useUser";
import ResumeAnalysisDialog from "../components/ResumeAnalysisDialog";
import PaymentPage from "../components/PaymentPage";

const SettingsPage = () => {
  const { userData, loading } = useUser();
  const [activeTab, setActiveTab] = useState("subscription");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  // Initialize account settings with empty values
  const [accountSettings, setAccountSettings] = useState({
    profile: {
      name: "",
      email: "",
      phone: "",
      photo: null,
      username: "",
    },
    security: {
      twoFactorEnabled: false,
      authMethod: "sms",
      recentLogins: [],
    },
    preferences: {
      language: "en",
      timezone: "America/New_York",
      theme: "light",
      notifications: {
        product_updates: false,
        security_alerts: true,
        newsletters: false,
      },
    },
  });

  // Update profile information when user data is available
  useEffect(() => {
    if (userData) {
      setAccountSettings((prev) => ({
        ...prev,
        profile: {
          name: userData.fullName || userData.displayName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          photo: userData.photoURL || null,
          username: userData.email?.split("@")[0] || "",
        },
        // Only update security and preferences if they exist in userData
        ...(userData.security && { security: userData.security }),
        ...(userData.preferences && { preferences: userData.preferences }),
      }));
    }
  }, [userData]);

  // Add scan preferences state
  const [scanPreferences, setScanPreferences] = useState({
    frequency: {
      type: "daily",
      customSchedule: null,
      isEnabled: true,
    },
    keywords: {
      included: [],
      excluded: [],
      searchMode: "exact",
    },
    exclusionRules: {
      timeLimit: "1_month",
      contentTypes: [],
      sources: [],
      sentiment: [],
    },
    advancedFilters: {
      languages: ["en"],
      postLength: { min: 0, max: null },
      engagementMetrics: { enabled: false, threshold: 0 },
    },
  });

  // Add privacy preferences state
  const [privacySettings, setPrivacySettings] = useState({
    dataAccess: {
      scanPublicPosts: true,
      scanPrivatePosts: false,
      scanProfileInfo: true,
      scanConnections: false,
      platforms: {
        linkedin: true,
        twitter: true,
        facebook: false,
      },
    },
    dataSharing: {
      visibility: "restricted",
      thirdPartySharing: false,
      activityLogging: true,
    },
    storage: {
      retentionPeriod: "6_months",
      autoDelete: true,
      encryption: true,
    },
    accountPrivacy: {
      accountVisibility: "private",
      profileSharing: "limited",
      hideActivities: [],
    },
    notifications: {
      dataAccessAlerts: true,
      unauthorizedAccessAlerts: true,
    },
  });

  // Update the plans array to mark Basic as default
  const plans = [
    {
      name: "Basic",
      price: "$9.99",
      isDefault: true,
      features: [
        "Basic scan features",
        "Weekly reports",
        "Limited integrations",
      ],
    },
    {
      name: "Pro",
      price: "$29.99",
      isDefault: false,
      features: [
        "Advanced scanning",
        "Daily reports",
        "Full integrations",
        "Priority support",
      ],
    },
    {
      name: "Enterprise",
      price: "Custom",
      isDefault: false,
      features: [
        "Custom solutions",
        "24/7 support",
        "Dedicated manager",
        "Custom integrations",
      ],
    },
  ];

  const handlePlanSwitch = (plan) => {
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  // State for resume analysis
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Extract resume file name at the top level
  const resumeFileName = userData?.resumeURL
    ? userData.resumeURL.split("/").pop()
    : null;

  const handleScanResume = async () => {
    if (!resumeFileName || !userData?.resumeURL) return;
    setIsAnalyzing(true);

    try {
      const requestData = {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          resumeUrl: userData.resumeURL.trim(),
        }),
      };

      console.log("Sending resume URL:", userData.resumeURL.trim());
      const response = await fetch(
        "http://localhost:8000/scan_resume",
        requestData
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || `HTTP error! status: ${response.status}`
        );
      }

      if (
        typeof result.overallScore === "undefined" ||
        !result.categoryScores
      ) {
        throw new Error("Invalid response format from server");
      }

      setResumeAnalysis({
        professionalismScore: Math.round(result.overallScore),
        education: result.categoryScores["Education"] > 50,
        projects: result.categoryScores["Projects"] > 50,
        workExperience: result.categoryScores["Work Experience"] > 50,
        skills: result.categoryScores["Technical Skills"] > 50,
        achievements: result.categoryScores["Achievements"] > 50,
      });

      setIsResumeDialogOpen(true);
    } catch (error) {
      console.error("Error scanning resume:", error);
      alert(
        `Failed to analyze resume: ${
          error.message || "Unknown error"
        }\nPlease ensure your resume URL is valid and accessible.`
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderSubscriptionContent = () => (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl ${
              plan.isDefault
                ? "border-2 border-orange-500 bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-neutral-900"
                : "border border-neutral-200 dark:border-neutral-700 hover:border-orange-500 dark:hover:border-orange-500"
            }`}
          >
            {plan.isDefault && (
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 text-xs font-medium text-white bg-orange-500 rounded-full">
                  Current Plan
                </span>
              </div>
            )}
            <div className="p-6">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                {plan.name}
              </h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-bold text-orange-500">
                  {plan.price}
                </span>
                <span className="ml-1 text-neutral-600 dark:text-neutral-400">
                  /mo
                </span>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center text-neutral-600 dark:text-neutral-400"
                  >
                    <svg
                      className="w-5 h-5 text-orange-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`mt-8 w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                  plan.isDefault
                    ? "bg-neutral-200 text-neutral-600 cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-orange-500/25"
                }`}
                onClick={() => !plan.isDefault && handlePlanSwitch(plan)}
                disabled={plan.isDefault}
              >
                {plan.isDefault ? "Current Plan" : `Upgrade to ${plan.name}`}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderScanSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700 transition-all duration-300 hover:shadow-lg">
        <h2 className="text-xl font-bold mb-6 text-neutral-900 dark:text-white flex items-center">
          <svg
            className="w-6 h-6 mr-2 text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Resume Scan
        </h2>
        <div className="mb-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <p className="text-neutral-600 dark:text-neutral-400">
            {resumeFileName ? resumeFileName : "No resume uploaded"}
          </p>
        </div>
        <button
          className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center ${
            !resumeFileName
              ? "bg-neutral-200 text-neutral-600 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-orange-500/25"
          }`}
          disabled={!resumeFileName || isAnalyzing}
          onClick={handleScanResume}
        >
          {isAnalyzing ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Scanning...
            </>
          ) : (
            "Scan Resume"
          )}
        </button>
      </div>

      {/* Scan Preferences Section */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700 transition-all duration-300 hover:shadow-lg">
        <h3 className="text-lg font-bold mb-6 text-neutral-900 dark:text-white">
          Scan Preferences
        </h3>
        <div className="space-y-4">
          <div className="group">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Scan Frequency
            </label>
            <select
              className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
              value={scanPreferences.frequency.type}
              onChange={(e) =>
                setScanPreferences({
                  ...scanPreferences,
                  frequency: {
                    ...scanPreferences.frequency,
                    type: e.target.value,
                  },
                })
              }
            >
              <option value="realtime">Real-time Scans</option>
              <option value="daily">Daily Scans</option>
              <option value="weekly">Weekly Scans</option>
              <option value="monthly">Monthly Scans</option>
              <option value="manual">Manual Scan</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-white">
        Privacy Options
      </h2>

      {/* Data Access Control */}
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4 text-neutral-900 dark:text-white">
          Data Access Control
        </h3>
        <div className="space-y-3">
          {[
            { key: "scanPublicPosts", label: "Scan Public Posts" },
            { key: "scanPrivatePosts", label: "Scan Private Posts" },
            { key: "scanProfileInfo", label: "Scan Profile Information" },
            { key: "scanConnections", label: "Scan Connections/Followers" },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center">
              <input
                type="checkbox"
                id={key}
                checked={privacySettings.dataAccess[key]}
                onChange={(e) =>
                  setPrivacySettings({
                    ...privacySettings,
                    dataAccess: {
                      ...privacySettings.dataAccess,
                      [key]: e.target.checked,
                    },
                  })
                }
                className="mr-3 h-4 w-4 text-orange-500"
              />
              <label htmlFor={key} className="text-neutral-900 dark:text-white">
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Data Sharing Settings */}
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4 text-neutral-900 dark:text-white">
          Data Sharing Settings
        </h3>
        <select
          className="w-full p-2 mb-4 border border-neutral-200 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800"
          value={privacySettings.dataSharing.visibility}
          onChange={(e) =>
            setPrivacySettings({
              ...privacySettings,
              dataSharing: {
                ...privacySettings.dataSharing,
                visibility: e.target.value,
              },
            })
          }
        >
          <option value="public">Public</option>
          <option value="restricted">Restricted</option>
          <option value="private">Private</option>
        </select>
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="thirdPartySharing"
            checked={privacySettings.dataSharing.thirdPartySharing}
            onChange={(e) =>
              setPrivacySettings({
                ...privacySettings,
                dataSharing: {
                  ...privacySettings.dataSharing,
                  thirdPartySharing: e.target.checked,
                },
              })
            }
            className="mr-3 h-4 w-4 text-orange-500"
          />
          <label
            htmlFor="thirdPartySharing"
            className="text-neutral-900 dark:text-white"
          >
            Allow Third-Party Sharing
          </label>
        </div>
      </div>

      {/* Storage Preferences */}
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4 text-neutral-900 dark:text-white">
          Storage Preferences
        </h3>
        <select
          className="w-full p-2 mb-4 border border-neutral-200 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800"
          value={privacySettings.storage.retentionPeriod}
          onChange={(e) =>
            setPrivacySettings({
              ...privacySettings,
              storage: {
                ...privacySettings.storage,
                retentionPeriod: e.target.value,
              },
            })
          }
        >
          <option value="1_month">1 Month</option>
          <option value="6_months">6 Months</option>
          <option value="1_year">1 Year</option>
          <option value="custom">Custom</option>
        </select>

        <button className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md transition-colors mb-4">
          Delete All My Data
        </button>
      </div>

      {/* Save Settings Button */}
      <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-md transition-colors">
        Save Privacy Settings
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg shadow-lg">
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-neutral-900 dark:text-white">
              Settings
            </h1>
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Settings Navigation - Updated with modern styling */}
              <div className="w-full lg:w-64 flex-shrink-0">
                <nav className="sticky top-8 bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-700 shadow-sm">
                  <nav className="space-y-2">
                    {[
                      "subscription",
                      "scan",
                      "privacy",
                      "integration",
                      "support",
                    ].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`w-full text-left px-4 py-2 rounded text-neutral-900 dark:text-white ${
                          activeTab === tab
                            ? "bg-orange-500 text-white"
                            : "hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </nav>
                </nav>
              </div>

              {/* Settings Content */}
              <div className="flex-1">
                <div className="bg-transparent">
                  {activeTab === "subscription" && renderSubscriptionContent()}

                  {activeTab === "scan" && renderScanSettings()}

                  {activeTab === "privacy" && renderPrivacySettings()}

                  {/* Placeholder for other tabs */}
                  {activeTab !== "subscription" &&
                    activeTab !== "scan" &&
                    activeTab !== "privacy" && (
                      <div className="text-center text-neutral-600 dark:text-gray-400 py-8">
                        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
                        settings coming soon...
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}
        <ResumeAnalysisDialog
          isOpen={isResumeDialogOpen}
          onClose={() => setIsResumeDialogOpen(false)}
          result={resumeAnalysis}
          loading={isAnalyzing}
        />
        {/* New Resume Analysis Report */}
        {resumeAnalysis && (
          <div className="border border-gray-300 p-4 rounded-md mt-4">
            <h2 className="text-xl font-semibold">Resume Analysis Report</h2>
            <p>
              Professionalism Score:{" "}
              <strong>{resumeAnalysis.professionalismScore}%</strong>
            </p>
            {resumeAnalysis.professionalismScore < 20 ? (
              <p className="text-red-500">
                This file does not appear to be a resume. Please upload a valid
                resume document.
              </p>
            ) : (
              <>
                <p>
                  <strong>Education:</strong>{" "}
                  {resumeAnalysis.education ? "✔️ Present" : "❌ Missing"}
                </p>
                <p>
                  <strong>Projects:</strong>{" "}
                  {resumeAnalysis.projects ? "✔️ Present" : "❌ Missing"}
                </p>
                <p>
                  <strong>Work Experience:</strong>{" "}
                  {resumeAnalysis.workExperience ? "✔️ Present" : "❌ Missing"}
                </p>
                <p>
                  <strong>Skills:</strong>{" "}
                  {resumeAnalysis.skills ? "✔️ Present" : "❌ Missing"}
                </p>
                <p>
                  <strong>Achievements:</strong>{" "}
                  {resumeAnalysis.achievements ? "✔️ Present" : "❌ Missing"}
                </p>
              </>
            )}
          </div>
        )}
      </div>
      <PaymentPage
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        selectedPlan={selectedPlan}
      />
    </div>
  );
};

export default SettingsPage;

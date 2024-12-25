import React, { useState, useEffect } from "react";
import { useUser } from "../hooks/useUser";

const SettingsPage = () => {
  const { userData, loading } = useUser();
  const [activeTab, setActiveTab] = useState("subscription");

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

  const plans = [
    {
      name: "Basic",
      price: "$9.99/mo",
      features: [
        "Basic scan features",
        "Weekly reports",
        "Limited integrations",
      ],
    },
    {
      name: "Pro",
      price: "$29.99/mo",
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
      features: [
        "Custom solutions",
        "24/7 support",
        "Dedicated manager",
        "Custom integrations",
      ],
    },
  ];

  // Render loading state while fetching user data
  if (loading) {
    return (
      <div className="container mx-auto p-4">
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
      </div>
    );
  }

  const renderScanSettings = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-white">
        Scan Preferences
      </h2>

      {/* Scan Frequency Section */}
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4 text-neutral-900 dark:text-white">
          Profile Scan Frequency
        </h3>
        <select
          className="w-full p-2 border border-neutral-200 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800"
          value={scanPreferences.frequency.type}
          onChange={(e) =>
            setScanPreferences({
              ...scanPreferences,
              frequency: { ...scanPreferences.frequency, type: e.target.value },
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

      {/* Keywords Section */}
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4 text-neutral-900 dark:text-white">
          Keywords & Filters
        </h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Add keywords (comma separated)"
            className="w-full p-2 border border-neutral-200 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const newKeywords = e.target.value
                  .split(",")
                  .map((k) => k.trim());
                setScanPreferences({
                  ...scanPreferences,
                  keywords: {
                    ...scanPreferences.keywords,
                    included: [
                      ...scanPreferences.keywords.included,
                      ...newKeywords,
                    ],
                  },
                });
                e.target.value = "";
              }
            }}
          />
          <div className="flex flex-wrap gap-2">
            {scanPreferences.keywords.included.map((keyword, index) => (
              <span
                key={index}
                className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100 px-3 py-1 rounded-full text-sm"
              >
                {keyword}
                <button
                  onClick={() => {
                    setScanPreferences({
                      ...scanPreferences,
                      keywords: {
                        ...scanPreferences.keywords,
                        included: scanPreferences.keywords.included.filter(
                          (_, i) => i !== index
                        ),
                      },
                    });
                  }}
                  className="ml-2 text-orange-600 dark:text-orange-300"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Exclusion Rules Section */}
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4 text-neutral-900 dark:text-white">
          Exclusion Rules
        </h3>
        <select
          className="w-full p-2 border border-neutral-200 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800"
          value={scanPreferences.exclusionRules.timeLimit}
          onChange={(e) =>
            setScanPreferences({
              ...scanPreferences,
              exclusionRules: {
                ...scanPreferences.exclusionRules,
                timeLimit: e.target.value,
              },
            })
          }
        >
          <option value="1_week">Ignore posts older than 1 week</option>
          <option value="1_month">Ignore posts older than 1 month</option>
          <option value="6_months">Ignore posts older than 6 months</option>
          <option value="custom">Custom range</option>
        </select>
      </div>

      {/* Save Preferences Button */}
      <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-md transition-colors">
        Save Scan Preferences
      </button>
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white">
        Settings
      </h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
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
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
            {activeTab === "subscription" && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-white">
                  Subscription Plans
                </h2>

                {/* Current Plan */}
                <div className="mb-6 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                  <h3 className="text-lg font-medium mb-2 text-neutral-900 dark:text-white">
                    Current Plan: Pro
                  </h3>
                  <p className="text-neutral-600 dark:text-gray-400">
                    Next billing date: January 1, 2024
                  </p>
                </div>

                {/* Available Plans */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {plans.map((plan) => (
                    <div
                      key={plan.name}
                      className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 bg-neutral-50 dark:bg-neutral-800"
                    >
                      <h3 className="text-lg font-medium mb-2 text-neutral-900 dark:text-white">
                        {plan.name}
                      </h3>
                      <p className="text-xl text-orange-500 mb-4">
                        {plan.price}
                      </p>
                      <ul className="text-neutral-600 dark:text-gray-400 space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index}>• {feature}</li>
                        ))}
                      </ul>
                      <button className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-md transition-colors">
                        {plan.name === "Pro"
                          ? "Current Plan"
                          : `Switch to ${plan.name}`}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Payment Methods */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4 text-neutral-900 dark:text-white">
                    Payment Methods
                  </h3>
                  <button className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 px-4 py-2 rounded-md transition-colors">
                    Add Payment Method
                  </button>
                </div>

                {/* Billing History */}
                <div>
                  <h3 className="text-lg font-medium mb-4 text-neutral-900 dark:text-white">
                    Billing History
                  </h3>
                  <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                      <p className="font-medium text-neutral-900 dark:text-white">
                        December 2023
                      </p>
                      <p className="text-neutral-600 dark:text-gray-400">
                        Pro Plan - $29.99
                      </p>
                    </div>
                    <div className="p-4">
                      <p className="font-medium text-neutral-900 dark:text-white">
                        November 2023
                      </p>
                      <p className="text-neutral-600 dark:text-gray-400">
                        Pro Plan - $29.99
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
  );
};

export default SettingsPage;

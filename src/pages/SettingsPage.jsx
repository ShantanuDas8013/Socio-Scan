import React, { useState, useEffect } from "react";
import { useUser } from "../hooks/useUser";
import ResumeAnalysisDialog from "../components/ResumeAnalysisDialog";
import PaymentPage from "../components/PaymentPage";
import emailjs from "@emailjs/browser";

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
  /*const [scanPreferences, setScanPreferences] = useState({
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
  });*/

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
            className={`relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-102 hover:shadow-xl ${
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
      <div
        className={`bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700 transition-all duration-300 transform hover:scale-101 hover:shadow-lg`}
      >
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

      {/* Scan Preferences Section - Commented out */}
      {/*<div
        className={`bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700 transition-all duration-300 transform hover:scale-101 hover:shadow-lg`}
      >
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
      </div>*/}
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

  // Add supportSettings state
  const [supportSettings, setSupportSettings] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
    category: "account",
  });

  // Add sending state for email
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Add useEffect to update email from userData when available
  useEffect(() => {
    if (userData && userData.email) {
      setSupportSettings((prevSettings) => ({
        ...prevSettings,
        email: userData.email,
      }));
    }
  }, [userData]);

  // Add FAQ state
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Add success dialog state
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // FAQ data
  const faqData = [
    {
      id: 1,
      question: "How does the social media scanner work?",
      answer:
        "Our advanced AI analyzes your social media presence across platforms to identify potential red flags for employers, inappropriate content, and privacy concerns. It provides actionable recommendations to improve your online presence.",
    },
    {
      id: 2,
      question: "How do I connect my social media accounts?",
      answer:
        "Navigate to the Integration section in Settings, select the platforms you want to connect, and follow the authentication prompts. We use secure OAuth protocols to ensure your data remains protected.",
    },
    {
      id: 3,
      question: "What's included in the different subscription plans?",
      answer:
        "Our Basic plan includes weekly scans and basic reports. Pro plan offers daily scans, comprehensive reports, and priority support. Enterprise plans include custom solutions, dedicated account managers, and 24/7 support.",
    },
    {
      id: 4,
      question: "Can I delete my scan history?",
      answer:
        "Yes, you can delete all scan history in the Privacy section of your Settings. You can also set automatic deletion periods to manage your data retention preferences.",
    },
    {
      id: 5,
      question: "How secure is my data with Socio-Scan?",
      answer:
        "We implement industry-standard encryption for all data in transit and at rest. We never share your personal information with third parties without explicit consent, and you maintain full control over your data through privacy settings.",
    },
  ];

  // System status mock data
  const systemStatus = {
    api: { status: "operational", latency: "23ms" },
    database: { status: "operational", latency: "45ms" },
    scanEngine: { status: "operational", latency: "120ms" },
    analytics: { status: "degraded", latency: "250ms" },
    notifications: { status: "operational", latency: "30ms" },
  };

  const handleSupportFormChange = (e) => {
    const { name, value } = e.target;
    setSupportSettings({
      ...supportSettings,
      [name]: value,
    });
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    setIsSendingEmail(true);

    try {
      // Initialize EmailJS with your user ID
      emailjs.init(import.meta.env.VITE_EMAILJS_USER_ID);

      const templateParams = {
        // This is the support email where messages will be received
        to_email: "socioscan33@gmail.com",
        // User's information as sender
        from_name: supportSettings.fullName,
        from_email: supportSettings.email,
        // Reply-to will be set to user's email automatically
        reply_to: supportSettings.email,
        subject: `[${supportSettings.category}] ${supportSettings.subject}`,
        message: supportSettings.message,
        category: supportSettings.category,
        // Add user's display name to make it clear in the email
        user_display_name: userData?.displayName || supportSettings.fullName,
      };

      const response = await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams
      );

      if (response.status === 200) {
        // Show success dialog instead of alert
        setShowSuccessDialog(true);
        setSupportSettings({
          fullName: "",
          email: userData?.email || "",
          subject: "",
          message: "",
          category: "account",
        });
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send your support request. Please try again later.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Add function to check if all required fields are filled
  const isFormValid = () => {
    return (
      supportSettings.fullName.trim() !== "" &&
      supportSettings.email.trim() !== "" &&
      supportSettings.subject.trim() !== "" &&
      supportSettings.message.trim() !== ""
    );
  };

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const renderSupportContent = () => (
    <div className="space-y-8">
      {/* Help Center Section */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700 shadow-sm">
        <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white flex items-center">
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
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqData.map((faq) => (
            <div
              key={faq.id}
              className={`border border-neutral-200 dark:border-neutral-700 rounded-xl transition-all duration-300 ${
                expandedFaq === faq.id
                  ? "bg-orange-50 dark:bg-orange-900/10"
                  : "bg-white dark:bg-neutral-800"
              }`}
            >
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                onClick={() => toggleFaq(faq.id)}
              >
                <span className="font-medium text-neutral-900 dark:text-white">
                  {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 text-orange-500 transition-transform duration-300 ${
                    expandedFaq === faq.id ? "transform rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {expandedFaq === faq.id && (
                <div className="px-6 pb-4 text-neutral-600 dark:text-neutral-300 text-sm">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support Form */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700 shadow-sm">
        <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white flex items-center">
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
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          Contact Support
        </h2>

        <form onSubmit={handleSupportSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={supportSettings.fullName}
                onChange={handleSupportFormChange}
                className="w-full p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={supportSettings.email}
                readOnly
                className="w-full p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 cursor-not-allowed"
                required
              />
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
                Using email associated with your account
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
              Category
            </label>
            <select
              name="category"
              value={supportSettings.category}
              onChange={handleSupportFormChange}
              className="w-full p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
            >
              <option value="account">Account Issues</option>
              <option value="billing">Billing & Subscription</option>
              <option value="technical">Technical Support</option>
              <option value="feature">Feature Request</option>
              <option value="privacy">Privacy Concern</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={supportSettings.subject}
              onChange={handleSupportFormChange}
              className="w-full p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
              Message
            </label>
            <textarea
              name="message"
              value={supportSettings.message}
              onChange={handleSupportFormChange}
              rows="4"
              className="w-full p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={!isFormValid() || isSendingEmail}
            className={`w-full py-3 px-4 rounded-lg transition-all duration-300 transform ${
              isFormValid() && !isSendingEmail
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:scale-[1.02] shadow-lg hover:shadow-orange-500/25 font-medium"
                : "bg-neutral-300 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
            }`}
          >
            {isSendingEmail ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
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
                Sending...
              </div>
            ) : (
              "Send Message"
            )}
          </button>
        </form>
      </div>

      {/* System Status */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700 shadow-sm">
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
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          System Status
        </h2>

        <div className="space-y-3">
          {Object.entries(systemStatus).map(
            ([service, { status, latency }]) => (
              <div
                key={service}
                className="flex items-center justify-between p-3 border border-neutral-100 dark:border-neutral-800 rounded-lg"
              >
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full mr-3 ${
                      status === "operational"
                        ? "bg-green-500"
                        : status === "degraded"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                  <span className="font-medium capitalize text-neutral-800 dark:text-neutral-200">
                    {service.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </div>
                <div className="flex items-center">
                  <span
                    className={`text-sm ${
                      status === "operational"
                        ? "text-green-600 dark:text-green-400"
                        : status === "degraded"
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {status}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-2">
                    ({latency})
                  </span>
                </div>
              </div>
            )
          )}
        </div>

        <div className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Documentation and Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700 shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-neutral-900 dark:text-white flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            Documentation
          </h2>

          <ul className="space-y-3">
            <li>
              <a
                href="#"
                className="flex items-center text-orange-500 hover:text-orange-600 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Getting Started Guide
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center text-orange-500 hover:text-orange-600 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
                API Documentation
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center text-orange-500 hover:text-orange-600 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Best Practices
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center text-orange-500 hover:text-orange-600 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                  />
                </svg>
                Integration Tutorials
              </a>
            </li>
          </ul>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700 shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-neutral-900 dark:text-white flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Community
          </h2>

          <ul className="space-y-3">
            <li>
              <a
                href="#"
                className="flex items-center text-orange-500 hover:text-orange-600 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
                Community Forums
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center text-orange-500 hover:text-orange-600 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Upcoming Events
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center text-orange-500 hover:text-orange-600 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Video Tutorials
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center text-orange-500 hover:text-orange-600 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                Feature Requests
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  const navigationItems = [
    {
      id: "subscription",
      label: "Subscription",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
    },
    {
      id: "scan",
      label: "Scan Settings",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
    },
    {
      id: "privacy",
      label: "Privacy",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
    },
    {
      id: "integration",
      label: "Integration",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
    {
      id: "support",
      label: "Support",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
  ];

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
                    {navigationItems.map(({ id, label, icon }) => (
                      <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center space-x-3 transition-all duration-200 transform hover:scale-102 ${
                          activeTab === id
                            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                            : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white hover:shadow-md"
                        }`}
                      >
                        <span
                          className={`transition-transform duration-200 ${
                            activeTab === id
                              ? "scale-110"
                              : "group-hover:scale-110"
                          }`}
                        >
                          {icon}
                        </span>
                        <span className="font-medium">{label}</span>
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

                  {activeTab === "support" && renderSupportContent()}

                  {/* Placeholder for other tabs */}
                  {activeTab !== "subscription" &&
                    activeTab !== "scan" &&
                    activeTab !== "privacy" &&
                    activeTab !== "support" && (
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
        {/* New Modern Resume Analysis Report */}
        {resumeAnalysis && (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700 shadow-lg mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                Resume Analysis Report
              </h2>
              <div className="relative w-20 h-20">
                <svg className="transform -rotate-90 w-20 h-20">
                  <circle
                    className="text-neutral-200 dark:text-neutral-800"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="32"
                    cx="40"
                    cy="40"
                  />
                  <circle
                    className="text-orange-500"
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 32}`}
                    strokeDashoffset={`${
                      2 *
                      Math.PI *
                      32 *
                      (1 - resumeAnalysis.professionalismScore / 100)
                    }`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="32"
                    cx="40"
                    cy="40"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-neutral-900 dark:text-white">
                  {resumeAnalysis.professionalismScore}%
                </span>
              </div>
            </div>

            {resumeAnalysis.professionalismScore < 20 ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <p className="text-red-600 dark:text-red-400 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  This file does not appear to be a resume. Please upload a
                  valid resume document.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: "Education", value: resumeAnalysis.education },
                  { label: "Projects", value: resumeAnalysis.projects },
                  {
                    label: "Work Experience",
                    value: resumeAnalysis.workExperience,
                  },
                  { label: "Skills", value: resumeAnalysis.skills },
                  { label: "Achievements", value: resumeAnalysis.achievements },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`p-4 rounded-xl border transition-all duration-300 transform hover:scale-105 ${
                      item.value
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                        : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">
                        {item.label}
                      </span>
                      {item.value ? (
                        <span className="flex items-center text-green-600 dark:text-green-400">
                          <svg
                            className="w-5 h-5 mr-1"
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
                          Present
                        </span>
                      ) : (
                        <span className="flex items-center text-yellow-600 dark:text-yellow-400">
                          <svg
                            className="w-5 h-5 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                          Missing
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                Quick Tips
              </h3>
              <ul className="space-y-2 text-neutral-600 dark:text-neutral-400">
                {!resumeAnalysis.education && (
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Add your educational background to strengthen your profile
                  </li>
                )}
                {!resumeAnalysis.skills && (
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    List your technical and soft skills to showcase your
                    capabilities
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
      <PaymentPage
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        selectedPlan={selectedPlan}
      />

      {/* Email Success Dialog */}
      {showSuccessDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-xl max-w-md w-full mx-4 animate-fadeIn">
            <div className="text-center mb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-10 h-10 text-green-500"
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
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                Message Sent!
              </h3>
              <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                Your support request has been successfully submitted. We'll get
                back to you as soon as possible.
              </p>
            </div>
            <div className="mt-6">
              <button
                onClick={() => setShowSuccessDialog(false)}
                className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;

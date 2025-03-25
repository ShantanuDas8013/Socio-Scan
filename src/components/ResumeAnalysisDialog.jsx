import React, { useState } from "react";
import Modal from "react-modal";

// Optional: Set the app element for accessibility (only once in your app)
Modal.setAppElement("#root");

const ResumeAnalysisDialog = ({ isOpen, onClose, result, loading }) => {
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate number of passes and total categories
  const totalCategories = result
    ? Object.keys(result).filter((key) => key !== "professionalismScore").length
    : 0;
  const passedCategories = result
    ? Object.keys(result).filter(
        (key) => key !== "professionalismScore" && result[key]
      ).length
    : 0;

  // Helper function for score color
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  // Helper for category status text
  const getCategoryStatus = (present) => {
    return present ? "Complete" : "Missing";
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Resume Analysis"
      className="m-0 p-0"
      overlayClassName="fixed inset-0 bg-gray-900/75 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      style={{
        content: {
          position: "relative",
          border: "none",
          background: "none",
          overflow: "visible",
          WebkitOverflowScrolling: "touch",
          borderRadius: "0",
          outline: "none",
          padding: "0",
          margin: "0 auto",
          maxWidth: "800px", // Increased max-width
          width: "100%",
        },
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full transform transition-all duration-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-purple-800 to-pink-800 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Resume Analysis
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          {/* Tabs */}
          {!loading && result && (
            <div className="flex space-x-6">
              {["overview", "details", "recommendations"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 text-base ${
                    activeTab === tab
                      ? "bg-white text-indigo-600 shadow-lg transform scale-105"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-gray-200 rounded-full"></div>
                  <div className="w-20 h-20 border-4 border-orange-500 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
                </div>
                <p className="mt-6 text-gray-600 font-medium">
                  Analyzing your resume...
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  This may take a few moments
                </p>
              </div>
            ) : (
              result && (
                <>
                  {/* Overview Tab */}
                  {activeTab === "overview" && (
                    <div className="space-y-8">
                      {/* Score Card */}
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-10 shadow-lg border border-gray-100">
                        <div className="max-w-lg mx-auto text-center">
                          <h3 className="text-xl font-semibold text-gray-800 mb-6">
                            Overall Resume Score
                          </h3>
                          <div className="relative inline-block">
                            <svg className="w-48 h-48" viewBox="0 0 100 100">
                              {/* Background circle */}
                              <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="8"
                              />
                              {/* Progress circle */}
                              <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#F97316" // Update to orange-500
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${
                                  (2 *
                                    Math.PI *
                                    45 *
                                    result.professionalismScore) /
                                  100
                                } ${2 * Math.PI * 45}`}
                                transform="rotate(-90 50 50)"
                              />
                              {/* Text in the center */}
                              <text
                                x="50"
                                y="50"
                                dominantBaseline="middle"
                                textAnchor="middle"
                                className={`text-3xl font-bold ${getScoreColor(
                                  result.professionalismScore
                                )}`}
                                fill="currentColor"
                              >
                                {result.professionalismScore}%
                              </text>
                            </svg>
                          </div>

                          {/* Completion Status */}
                          <p className="text-lg mt-2">
                            <span className="font-semibold">
                              {passedCategories}/{totalCategories}
                            </span>{" "}
                            components complete
                          </p>
                        </div>
                      </div>

                      {/* Summary Cards */}
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-gradient-to-br from-emerald-50 to-white p-8 rounded-2xl border border-emerald-100 shadow-lg">
                          <h4 className="font-semibold text-emerald-700 text-lg mb-4">
                            Strengths
                          </h4>
                          <ul className="mt-2 space-y-2">
                            {Object.keys(result)
                              .filter(
                                (key) =>
                                  key !== "professionalismScore" && result[key]
                              )
                              .map((key) => (
                                <li
                                  key={key}
                                  className="flex items-center text-emerald-600"
                                >
                                  <svg
                                    className="w-5 h-5 mr-2 text-emerald-500"
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
                                  <span className="text-gray-700 font-medium">
                                    {key
                                      .replace(/([A-Z])/g, " $1")
                                      .replace(/^./, (str) =>
                                        str.toUpperCase()
                                      )}
                                  </span>
                                </li>
                              ))}
                          </ul>
                        </div>

                        <div className="bg-gradient-to-br from-rose-50 to-white p-8 rounded-2xl border border-rose-100 shadow-lg">
                          <h4 className="font-semibold text-rose-700 text-lg mb-4">
                            Areas to Improve
                          </h4>
                          <ul className="mt-2 space-y-1">
                            {Object.keys(result)
                              .filter(
                                (key) =>
                                  key !== "professionalismScore" && !result[key]
                              )
                              .map((key) => (
                                <li
                                  key={key}
                                  className="text-orange-500 flex items-center"
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
                                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                  </svg>
                                  {key
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str) => str.toUpperCase())}
                                </li>
                              ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Details Tab */}
                  {activeTab === "details" && (
                    <div className="space-y-6">
                      {Object.entries(result)
                        .filter(([key]) => key !== "professionalismScore")
                        .map(([key, value]) => {
                          const formattedKey = key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase());
                          return (
                            <div
                              key={key}
                              className={`p-8 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                                value
                                  ? "bg-gradient-to-r from-emerald-50 to-white border-emerald-200"
                                  : "bg-gradient-to-r from-rose-50 to-white border-rose-200"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                      value ? "bg-green-100" : "bg-red-100"
                                    }`}
                                  >
                                    {value ? (
                                      <svg
                                        className="w-6 h-6 text-green-600"
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
                                    ) : (
                                      <svg
                                        className="w-6 h-6 text-red-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M6 18L18 6M6 6l12 12"
                                        />
                                      </svg>
                                    )}
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-gray-800">
                                      {formattedKey}
                                    </h3>
                                    <p
                                      className={`text-sm ${
                                        value
                                          ? "text-green-600"
                                          : "text-red-600"
                                      }`}
                                    >
                                      {getCategoryStatus(value)}
                                    </p>
                                  </div>
                                </div>

                                <div
                                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    value
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {value ? "✓ Present" : "✗ Missing"}
                                </div>
                              </div>

                              <div className="mt-3 text-sm text-gray-600">
                                {value ? (
                                  <p>
                                    This section is well-represented in your
                                    resume.
                                  </p>
                                ) : (
                                  <p>
                                    Consider adding this section to improve your
                                    resume.
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}

                  {/* Recommendations Tab */}
                  {activeTab === "recommendations" && (
                    <div className="space-y-8">
                      <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-2xl border border-indigo-100 shadow-lg">
                        <h3 className="text-xl font-bold text-indigo-800 mb-4">
                          How to improve your score
                        </h3>
                        <p className="text-gray-700 mb-4">
                          Based on our analysis, here are some specific
                          recommendations to enhance your resume:
                        </p>

                        <ul className="space-y-3">
                          {!result.education && (
                            <li className="flex">
                              <span className="text-red-500 mr-2">•</span>
                              <span>
                                <strong className="text-gray-800">
                                  Add Education Section:
                                </strong>{" "}
                                Include your degrees, certifications, relevant
                                coursework, and academic achievements.
                              </span>
                            </li>
                          )}

                          {!result.workExperience && (
                            <li className="flex">
                              <span className="text-red-500 mr-2">•</span>
                              <span>
                                <strong className="text-gray-800">
                                  Add Work Experience:
                                </strong>{" "}
                                Detail your professional history with specific
                                responsibilities and accomplishments.
                              </span>
                            </li>
                          )}

                          {!result.projects && (
                            <li className="flex">
                              <span className="text-red-500 mr-2">•</span>
                              <span>
                                <strong className="text-gray-800">
                                  Showcase Projects:
                                </strong>{" "}
                                Highlight relevant projects with technologies
                                used and outcomes achieved.
                              </span>
                            </li>
                          )}

                          {!result.skills && (
                            <li className="flex">
                              <span className="text-red-500 mr-2">•</span>
                              <span>
                                <strong className="text-gray-800">
                                  List Key Skills:
                                </strong>{" "}
                                Include a dedicated skills section with relevant
                                technical and soft skills.
                              </span>
                            </li>
                          )}

                          {!result.achievements && (
                            <li className="flex">
                              <span className="text-red-500 mr-2">•</span>
                              <span>
                                <strong className="text-gray-800">
                                  Highlight Achievements:
                                </strong>{" "}
                                <span className="text-gray-700">
                                  Quantify your accomplishments with specific
                                  metrics and outcomes.
                                </span>
                              </span>
                            </li>
                          )}

                          {Object.values(result)
                            .filter((val) => typeof val === "boolean")
                            .every((val) => val) && (
                            <li className="flex">
                              <span className="text-green-500 mr-2">•</span>
                              <span>
                                <strong className="text-gray-800">
                                  Great job!
                                </strong>{" "}
                                Your resume includes all the essential sections.
                                Consider enhancing each section with more
                                specific achievements and metrics.
                              </span>
                            </li>
                          )}
                        </ul>
                      </div>

                      <div className="bg-gradient-to-br from-gray-900 to-indigo-900 text-white p-10 rounded-2xl shadow-xl">
                        <h3 className="text-xl font-bold mb-3">
                          Need more help?
                        </h3>
                        <p className="mb-6 text-gray-300">
                          Get professional advice on improving your resume's
                          impact and effectiveness.
                        </p>
                        <button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                          Get Expert Review
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-6 flex justify-end border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ResumeAnalysisDialog;

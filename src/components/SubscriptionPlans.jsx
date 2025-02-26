import React, { useState } from "react";
import PaymentPage from "./PaymentPage";
// ...existing imports...

const SubscriptionPlans = ({ userId, currentMode }) => {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentUserMode, setCurrentUserMode] = useState(currentMode);

  const handleUpgrade = (plan) => {
    setSelectedPlan(plan);
    setIsPaymentOpen(true);
  };

  const handleModeUpdate = (newMode) => {
    setCurrentUserMode(newMode);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ...existing plan cards code... */}
      {plans.map((plan) => (
        <div key={plan.name} className="plan-card">
          {/* ...existing plan card content... */}
          <button
            onClick={() => handleUpgrade(plan)}
            className="upgrade-button"
          >
            {currentUserMode === plan.name ? "Current Plan" : "Upgrade Now"}
          </button>
        </div>
      ))}

      <PaymentPage
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        selectedPlan={selectedPlan}
        userId={userId}
        onModeUpdate={handleModeUpdate}
      />
    </div>
  );
};

export default SubscriptionPlans;

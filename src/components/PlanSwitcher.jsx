import React, { useState, useRef, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { toast } from "react-hot-toast";

const PlanSwitcher = ({
  availablePlans,
  currentPlan,
  purchasedPlans,
  onPlanSwitch,
  isLoading,
}) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const cancelButtonRef = useRef(null);

  const isPlanPurchased = (planName) => {
    return purchasedPlans.some(
      (plan) => plan.plan === planName && new Date(plan.endDate) > new Date()
    );
  };

  const getButtonText = (planName) => {
    if (currentPlan === planName) {
      return "Current Plan";
    }

    if (isPlanPurchased(planName)) {
      return `Switch to ${planName}`;
    }

    return `Upgrade to ${planName}`;
  };

  const handlePlanSwitch = (plan) => {
    if (plan.name === currentPlan) {
      toast.info("You're already using this plan");
      return;
    }

    if (isPlanPurchased(plan.name)) {
      onPlanSwitch(plan);
    } else {
      setSelectedPlan(plan);
      setIsConfirmOpen(true);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {availablePlans.map((plan) => {
          const hasPlan = isPlanPurchased(plan.name);
          const isCurrentPlan = currentPlan === plan.name;
          const purchasedPlan = purchasedPlans.find(
            (p) => p.plan === plan.name
          );

          return (
            <div
              key={plan.name}
              className={`p-4 rounded-lg border ${
                isCurrentPlan
                  ? "border-orange-500 bg-orange-50 dark:bg-orange-900/10"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {plan.description}
              </p>
              <p className="text-lg font-bold mb-2">{plan.price}</p>
              {hasPlan && purchasedPlan && (
                <p className="text-sm text-green-600 mb-2">
                  Valid until:{" "}
                  {new Date(purchasedPlan.endDate).toLocaleDateString()}
                </p>
              )}
              <ul className="text-sm mb-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span>✓</span> {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handlePlanSwitch(plan)}
                disabled={isLoading}
                className={`mt-auto px-4 py-2 rounded-md w-full transition-colors
                  ${
                    isCurrentPlan
                      ? "bg-orange-500 text-white"
                      : hasPlan
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-gray-200 hover:bg-orange-500 hover:text-white dark:bg-gray-700"
                  }
                  ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                {getButtonText(plan.name)}
              </button>
            </div>
          );
        })}
      </div>

      <Dialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        initialFocus={cancelButtonRef}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white dark:bg-neutral-800 rounded-lg p-6 max-w-sm w-full">
            <Dialog.Title
              as="h3"
              className="text-lg font-medium mb-4"
              tabIndex={0}
            >
              Switch to {selectedPlan?.name}?
            </Dialog.Title>
            <Dialog.Description
              className="text-gray-600 dark:text-gray-300 mb-4"
              tabIndex={0}
            >
              Are you sure you want to switch to the {selectedPlan?.name} plan?
            </Dialog.Description>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                ref={cancelButtonRef}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-neutral-700"
                onClick={() => setIsConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-orange-500 text-white"
                onClick={confirmSwitch}
              >
                Confirm
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default PlanSwitcher;

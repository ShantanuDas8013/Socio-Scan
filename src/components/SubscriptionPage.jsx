import React, { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import PlanSwitcher from "./PlanSwitcher";
import PaymentPage from "./PaymentPage";

const SubscriptionPage = () => {
  const { user } = useAuth();
  const [purchasedPlans, setPurchasedPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Define available plans
  const availablePlans = [
    {
      name: "Basic",
      description: "Basic features",
      price: "$9.99",
      features: ["Basic scanning", "Weekly reports"],
    },
    {
      name: "Pro",
      description: "Premium features",
      price: "$29.99",
      features: [
        "Advanced scanning",
        "Daily reports",
        "Full integrations",
        "Priority support",
      ],
    },
    {
      name: "Enterprise",
      description: "Enterprise features",
      price: "$99.99",
      features: [
        "Custom scanning",
        "Real-time reports",
        "API access",
        "24/7 support",
      ],
    },
  ];

  const fetchUserSubscriptions = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.subscriptions) {
          // Filter active subscriptions and check expiry dates
          const activePlans = userData.subscriptions
            .filter(
              (sub) =>
                sub.status === "active" && new Date(sub.endDate) > new Date()
            )
            .map((sub) => ({
              plan: sub.plan,
              endDate: sub.endDate,
              features: sub.features,
              price: sub.price,
              subscriptionId: sub.subscriptionId,
            }));

          setPurchasedPlans(activePlans);

          // Set current plan only if it's still active
          if (
            userData.currentPlan &&
            activePlans.some((plan) => plan.plan === userData.currentPlan)
          ) {
            setCurrentPlan(userData.currentPlan);
          } else {
            setCurrentPlan(null);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserSubscriptions();
  }, [user, showPayment]);

  const handlePlanSwitch = async (plan) => {
    const isPlanPurchased = purchasedPlans.some((p) => p.plan === plan.name);

    if (plan.name === currentPlan) {
      toast.info("You're already using this plan");
      return;
    }

    if (isPlanPurchased) {
      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          currentPlan: plan.name,
        });
        setCurrentPlan(plan.name);
        toast.success(`Switched to ${plan.name} plan`);
        await fetchUserSubscriptions();
      } catch (error) {
        console.error("Error switching plan:", error);
        toast.error("Failed to switch plan");
      }
    } else {
      setSelectedPlan(plan);
      setShowPayment(true);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Your Subscriptions</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        <PlanSwitcher
          availablePlans={availablePlans}
          currentPlan={currentPlan}
          purchasedPlans={purchasedPlans}
          onPlanSwitch={handlePlanSwitch}
          isLoading={isLoading}
        />
      </div>

      <PaymentPage
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        selectedPlan={selectedPlan}
        onSuccess={async (plan) => {
          setShowPayment(false);
          await fetchUserSubscriptions(); // Verify and update subscription status
        }}
      />
    </div>
  );
};

export default SubscriptionPage;

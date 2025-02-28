import React, { useState, useEffect } from "react";
import { Dialog as HeadlessDialog } from "@headlessui/react";
import { useUser } from "../hooks/useUser";
import {
  updateUserSubscription,
  createSubscriptionNode,
} from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { PaymentIcons } from "./PaymentIcons";
import {
  doc,
  query,
  collection,
  where,
  getDocs,
  setDoc,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import PaymentStatus from "./PaymentStatus";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

const PaymentPage = ({ isOpen, onClose, selectedPlan, onSuccess }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const auth = useAuth(); // Store the whole auth context
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    name: "",
    upiId: "",
    bankAccount: "",
    ifscCode: "",
    selectedBank: "",
  });
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [showStatus, setShowStatus] = useState(false);

  // Validation functions for different payment methods
  const validateCardPayment = () => {
    const { cardNumber, expiryDate, cvv, name } = formData;
    return (
      cardNumber.replace(/\s/g, "").length === 16 &&
      /^\d{2}\/\d{2}$/.test(expiryDate) &&
      cvv.length === 3 &&
      name.trim().length > 0
    );
  };

  const validateUPIPayment = () => {
    return /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(formData.upiId);
  };

  const validateNetBanking = () => {
    return formData.selectedBank !== "";
  };

  const isFormValid = () => {
    switch (paymentMethod) {
      case "card":
        return validateCardPayment();
      case "upi":
        return validateUPIPayment();
      case "netbanking":
        return validateNetBanking();
      case "paypal":
      case "googlepay":
      case "applepay":
        return true; // These will be handled by external providers
      default:
        return false;
    }
  };

  const findUserByName = async (fullName) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("fullName", "==", fullName.trim()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("No user found with this name");
    }

    return querySnapshot.docs[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth.user) {
      toast.error("Please login to continue");
      return;
    }

    setProcessing(true);

    try {
      const userRef = doc(db, "users", auth.user.uid);
      const subscriptionData = {
        plan: selectedPlan.name,
        price: selectedPlan.price,
        startDate: new Date().toISOString(),
        status: "active",
        paymentMethod: paymentMethod,
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        features: selectedPlan.features,
        autoRenew: true,
        subscriberName: auth.user.displayName || auth.user.email,
        userId: auth.user.uid,
      };

      // Create subscription first
      const subscriptionId = await createSubscriptionNode(
        auth.user.uid,
        subscriptionData
      );

      if (subscriptionId) {
        // Update user document with multiple subscriptions
        await updateDoc(userRef, {
          [`subscriptions.${selectedPlan.name}`]: {
            ...subscriptionData,
            subscriptionId,
          },
          currentPlan: selectedPlan.name,
          updatedAt: serverTimestamp(),
        });

        setPaymentStatus("success");
        setShowStatus(true);
        toast.success("Subscription activated successfully!");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error(error.message || "Failed to process subscription");
      setPaymentStatus("failed");
      setShowStatus(true);
    } finally {
      setProcessing(false);
    }
  };

  const handleStatusClose = () => {
    setShowStatus(false);
    if (paymentStatus === "success") {
      onSuccess(selectedPlan);
      onClose(); // Only close the payment modal after user acknowledges
      navigate("/subscription");
    } else {
      // For failed payments, close the status modal but keep payment modal open
      setPaymentStatus(null);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      // Create new subscription object
      const newSubscription = {
        plan: selectedPlan.name,
        price: selectedPlan.price,
        features: selectedPlan.features,
        status: "active",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        subscriptionId: `sub_${Date.now()}`, // Generate unique subscription ID
        purchasedAt: new Date().toISOString(),
      };

      // If subscriptions array doesn't exist, create it
      if (!userDoc.data().subscriptions) {
        await updateDoc(userRef, {
          subscriptions: [newSubscription],
          currentPlan: selectedPlan.name, // Set as current plan
        });
      } else {
        // Add new subscription to existing array
        await updateDoc(userRef, {
          subscriptions: arrayUnion(newSubscription),
          currentPlan: selectedPlan.name,
        });
      }

      onSuccess(selectedPlan);
      toast.success("Subscription purchased successfully!");
    } catch (error) {
      console.error("Error storing subscription:", error);
      toast.error("Failed to store subscription details");
    }
  };

  // Reset form when payment method changes
  useEffect(() => {
    setFormData({
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      name: "",
      upiId: "",
      bankAccount: "",
      ifscCode: "",
      selectedBank: "",
    });
  }, [paymentMethod]);

  useEffect(() => {
    // Redirect if no auth context is available
    if (!auth || !auth.user) {
      toast.error("Please login to continue");
      navigate("/login");
    }
  }, [auth, navigate]);

  const paymentMethods = [
    { id: "card", name: "Credit/Debit Card", icon: PaymentIcons.card },
    { id: "paypal", name: "PayPal", icon: PaymentIcons.paypal },
    { id: "upi", name: "UPI", icon: PaymentIcons.upi },
    { id: "netbanking", name: "Net Banking", icon: PaymentIcons.netbanking },
    { id: "googlepay", name: "Google Pay", icon: PaymentIcons.googlepay },
    { id: "applepay", name: "Apple Pay", icon: PaymentIcons.applepay },
  ];

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, "");
    const groups = digits.match(/(\d{1,4})/g);
    return groups ? groups.join(" ").substr(0, 19) : ""; // 19 chars = 16 digits + 3 spaces
  };

  const formatExpiryDate = (value) => {
    // Remove any non-digit characters
    const digits = value.replace(/\D/g, "");

    // Don't allow more than 4 digits
    if (digits.length > 4) return formData.expiryDate;

    // Add slash after month if 2 digits are entered
    if (digits.length >= 2) {
      const month = parseInt(digits.substring(0, 2));
      // Validate month (01-12)
      if (month < 1 || month > 12) {
        return digits.substring(0, 1);
      }
      return `${digits.substring(0, 2)}/${digits.substring(2)}`;
    }

    return digits;
  };

  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case "card":
        return (
          <div className="space-y-5">
            <div className="relative">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Card Number
              </label>
              <input
                type="text"
                inputMode="numeric"
                className="w-full p-3 pl-12 border border-gray-200 dark:border-neutral-600 rounded-lg bg-gray-50 dark:bg-neutral-700 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                value={formData.cardNumber}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value);
                  setFormData({
                    ...formData,
                    cardNumber: formatted,
                  });
                }}
                placeholder="1234 5678 9012 3456"
              />
              <span className="absolute left-3 top-[38px] text-gray-400">
                💳
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Expiry Date
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-full p-3 border border-gray-200 dark:border-neutral-600 rounded-lg bg-gray-50 dark:bg-neutral-700 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expiryDate: formatExpiryDate(e.target.value),
                    })
                  }
                  placeholder="MM/YY"
                  maxLength="5"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  CVV
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-200 dark:border-neutral-600 rounded-lg bg-gray-50 dark:bg-neutral-700 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                  value={formData.cvv}
                  onChange={(e) =>
                    setFormData({ ...formData, cvv: e.target.value })
                  }
                  placeholder="123"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Name on Card
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-200 dark:border-neutral-600 rounded-lg bg-gray-50 dark:bg-neutral-700 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="John Doe"
              />
            </div>
          </div>
        );

      case "upi":
        return (
          <div className="space-y-5">
            <div className="relative">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                UPI ID
              </label>
              <input
                type="text"
                pattern="[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}"
                className="w-full p-3 pl-12 border border-gray-200 dark:border-neutral-600 rounded-lg bg-gray-50 dark:bg-neutral-700 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                value={formData.upiId}
                onChange={(e) =>
                  setFormData({ ...formData, upiId: e.target.value })
                }
                placeholder="username@upi"
              />
              <span className="absolute left-3 top-[38px] text-gray-400">
                📱
              </span>
            </div>
          </div>
        );

      case "netbanking":
        return (
          <div className="space-y-5">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Bank
              </label>
              <select
                className="w-full p-3 border border-gray-200 dark:border-neutral-600 rounded-lg bg-gray-50 dark:bg-neutral-700 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                value={formData.selectedBank}
                onChange={(e) =>
                  setFormData({ ...formData, selectedBank: e.target.value })
                }
              >
                <option value="">Choose your bank</option>
                <option value="sbi">State Bank of India</option>
                <option value="hdfc">HDFC Bank</option>
                <option value="icici">ICICI Bank</option>
                <option value="axis">Axis Bank</option>
              </select>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-300">
              You will be redirected to {paymentMethod} to complete your
              payment.
            </p>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <HeadlessDialog open={isOpen} onClose={onClose} className="relative z-50">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          aria-hidden="true"
        />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <HeadlessDialog.Panel className="relative bg-white dark:bg-neutral-800 p-8 rounded-2xl max-w-md w-full mx-4 shadow-2xl transform transition-all">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-t-2xl" />
            <HeadlessDialog.Title className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
              Subscribe to{" "}
              <span className="text-orange-500">{selectedPlan?.name}</span>
            </HeadlessDialog.Title>

            <div className="mb-8">
              <p className="text-lg mb-4 text-gray-600 dark:text-gray-300">
                Price:{" "}
                <span className="font-semibold text-orange-500">
                  {selectedPlan?.price}/month
                </span>
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    className={`p-4 rounded-lg transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                      paymentMethod === method.id
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                        : "bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600"
                    }`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <span className="text-2xl">{method.icon}</span>
                    <span className="text-sm font-medium">{method.name}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {renderPaymentForm()}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                  disabled={processing || !isFormValid()}
                >
                  {processing ? (
                    <span className="flex items-center justify-center">
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
                      Processing...
                    </span>
                  ) : (
                    `Pay ${selectedPlan?.price}`
                  )}
                </button>
              </form>
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 transition-all duration-200"
            >
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </HeadlessDialog.Panel>
        </div>
      </HeadlessDialog>

      <PaymentStatus
        isOpen={showStatus}
        onClose={handleStatusClose}
        status={paymentStatus}
        planDetails={selectedPlan}
      />
    </>
  );
};

export default PaymentPage;

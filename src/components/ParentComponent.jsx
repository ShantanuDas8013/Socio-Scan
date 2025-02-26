const ParentComponent = () => {
  const [userMode, setUserMode] = useState("free"); // or wherever you store the user's mode

  return (
    <PaymentPage
      isOpen={isPaymentModalOpen}
      onClose={() => setPaymentModalOpen(false)}
      selectedPlan={selectedPlan}
      userId={currentUser.uid} // Pass the current user's ID
      onModeUpdate={(newMode) => setUserMode(newMode)} // Handle mode updates
    />
  );
};

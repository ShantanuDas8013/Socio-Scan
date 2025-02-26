import React from "react";

const Dialog = ({
  isOpen,
  onClose,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  type = "default",
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: "⚠️",
          buttonClass: "bg-red-600 hover:bg-red-700",
          containerClass: "border-red-200 dark:border-red-800",
        };
      default:
        return {
          icon: "ℹ️",
          buttonClass: "bg-orange-500 hover:bg-orange-600",
          containerClass: "border-orange-200 dark:border-orange-800",
        };
    }
  };

  const { icon, buttonClass, containerClass } = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={`bg-white dark:bg-neutral-800 rounded-xl shadow-2xl w-full max-w-md transform transition-all border ${containerClass}`}
      >
        <div className="p-6 space-y-4">
          <div className="text-center">
            <span className="text-4xl mb-4 block">{icon}</span>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
              {title}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">{message}</p>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            >
              {cancelLabel || "Cancel"}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${buttonClass}`}
            >
              {confirmLabel || "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dialog;

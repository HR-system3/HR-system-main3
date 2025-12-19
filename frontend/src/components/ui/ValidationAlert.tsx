"use client";

interface ValidationAlertProps {
  type: "error" | "warning" | "info";
  message: string;
  onClose?: () => void;
}

export default function ValidationAlert({
  type,
  message,
  onClose,
}: ValidationAlertProps) {
  const styles = {
    error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
    warning: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
    info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
  };

  const icons = {
    error: "⚠️",
    warning: "⚠️",
    info: "ℹ️",
  };

  return (
    <div className={`border rounded-lg p-4 ${styles[type]} flex items-start justify-between`}>
      <div className="flex items-start">
        <span className="mr-2">{icons[type]}</span>
        <p className="text-sm">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-current opacity-70 hover:opacity-100"
        >
          ×
        </button>
      )}
    </div>
  );
}


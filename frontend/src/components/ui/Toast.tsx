"use client";
import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let toastListeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

function addToast(message: string, type: ToastType = "info") {
  const id = Math.random().toString(36).substring(7);
  const newToast = { id, message, type };
  toasts = [...toasts, newToast];
  toastListeners.forEach((listener) => listener(toasts));
  
  setTimeout(() => {
    removeToast(id);
  }, 5000);
}

function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  toastListeners.forEach((listener) => listener(toasts));
}

export function useToast() {
  const [toastList, setToastList] = useState<Toast[]>(toasts);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => setToastList(newToasts);
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  return {
    toasts: toastList,
    showToast: addToast,
    removeToast,
  };
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case "success":
        return "bg-green-500 text-white";
      case "error":
        return "bg-red-500 text-white";
      case "warning":
        return "bg-yellow-500 text-black";
      case "info":
        return "bg-blue-500 text-white";
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${getToastStyles(toast.type)} px-4 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-[300px] max-w-md`}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-4 text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// Export convenience functions
export const toast = {
  success: (message: string) => addToast(message, "success"),
  error: (message: string) => addToast(message, "error"),
  warning: (message: string) => addToast(message, "warning"),
  info: (message: string) => addToast(message, "info"),
};


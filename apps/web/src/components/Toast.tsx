import React, { useEffect, useState } from "react";
import { X, CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";
import {
  useNotificationStore,
  type NotificationType,
  type Notification,
} from "../stores/notification-store";

const ICONS: Record<NotificationType, React.ReactNode> = {
  success: <CheckCircle2 size={20} />,
  error: <XCircle size={20} />,
  warning: <AlertTriangle size={20} />,
  info: <Info size={20} />,
};

const THEME_CONFIG: Record<
  NotificationType,
  {
    light: { bg: string; border: string; icon: string; progress: string };
    dark: { bg: string; border: string; icon: string; progress: string };
  }
> = {
  success: {
    light: {
      bg: "bg-white",
      border: "border-emerald-200",
      icon: "text-emerald-600",
      progress: "bg-emerald-500",
    },
    dark: {
      bg: "bg-zinc-900/95",
      border: "border-emerald-500/30",
      icon: "text-emerald-400",
      progress: "bg-emerald-500",
    },
  },
  error: {
    light: {
      bg: "bg-white",
      border: "border-red-200",
      icon: "text-red-600",
      progress: "bg-red-500",
    },
    dark: {
      bg: "bg-zinc-900/95",
      border: "border-red-500/30",
      icon: "text-red-400",
      progress: "bg-red-500",
    },
  },
  warning: {
    light: {
      bg: "bg-white",
      border: "border-amber-200",
      icon: "text-amber-600",
      progress: "bg-amber-500",
    },
    dark: {
      bg: "bg-zinc-900/95",
      border: "border-amber-500/30",
      icon: "text-amber-400",
      progress: "bg-amber-500",
    },
  },
  info: {
    light: {
      bg: "bg-white",
      border: "border-blue-200",
      icon: "text-blue-600",
      progress: "bg-blue-500",
    },
    dark: {
      bg: "bg-zinc-900/95",
      border: "border-blue-500/30",
      icon: "text-blue-400",
      progress: "bg-blue-500",
    },
  },
};

interface ToastItemProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ notification, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");
  const theme = isDark ? "dark" : "light";
  const config = THEME_CONFIG[notification.type][theme];
  const duration = notification.duration || 4000;

  useEffect(() => {
    if (duration <= 0) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(notification.id), 200);
  };

  return (
    <div
      className={`
 relative overflow-hidden
 min-w-[320px] max-w-[420px]
 rounded-xl border shadow-lg
 ${config.bg} ${config.border}
 backdrop-blur-xl
 transform transition-all duration-200 ease-out
 ${isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"}
 animate-in slide-in-from-right-full
 `}
    >
      <div className="flex items-start gap-3 p-4">
        <div className={`flex-shrink-0 mt-0.5 ${config.icon}`}>
          {ICONS[notification.type]}
        </div>

        <div className="flex-1 min-w-0 pr-2">
          <p
            className={`text-sm font-semibold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}
          >
            {notification.title}
          </p>
          {notification.message && (
            <p
              className={`text-xs mt-1 leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}
            >
              {notification.message}
            </p>
          )}
        </div>

        {notification.dismissible && (
          <button
            onClick={handleClose}
            className={`
 flex-shrink-0 p-1.5 rounded-lg
 transition-colors duration-150
 ${
   isDark
     ? "hover:bg-white/10 text-zinc-500 hover:text-zinc-300"
     : "hover:bg-black/5 text-zinc-400 hover:text-zinc-600"
 }
 `}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/5">
          <div
            className={`h-full ${config.progress} transition-all duration-50 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  if (notifications.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-3"
      role="region"
      aria-label="Notifications"
    >
      {notifications.map((notification) => (
        <ToastItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
};

export default ToastContainer;

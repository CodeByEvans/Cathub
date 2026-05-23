import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { CircleCheckIcon, InfoIcon, OctagonXIcon, TriangleAlertIcon, Loader2Icon, X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning" | "loading";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (message: string, opts?: { type?: ToastType; description?: string; duration?: number; id?: string }) => void;
  success: (message: string, opts?: { description?: string; duration?: number }) => void;
  error: (message: string, opts?: { description?: string; duration?: number }) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastId = 0;

const icons: Record<ToastType, ReactNode> = {
  success: <CircleCheckIcon className="w-4 h-4 text-green-500" />,
  error: <OctagonXIcon className="w-4 h-4 text-red-500" />,
  info: <InfoIcon className="w-4 h-4 text-blue-500" />,
  warning: <TriangleAlertIcon className="w-4 h-4 text-amber-500" />,
  loading: <Loader2Icon className="w-4 h-4 text-primary animate-spin" />,
};

const bgColors: Record<ToastType, string> = {
  success: "border-green-500/30",
  error: "border-red-500/30",
  info: "border-blue-500/30",
  warning: "border-amber-500/30",
  loading: "border-primary/30",
};

function ToastMessage({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`flex items-start gap-2.5 px-3 py-2 rounded-xl border bg-popover/95 backdrop-blur-md shadow-lg min-w-[240px] max-w-[320px] ${bgColors[item.type]}`}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[item.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground leading-snug">{item.message}</p>
        {item.description && (
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{item.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(item.id)}
        className="flex-shrink-0 p-0.5 rounded hover:bg-muted/50 transition-colors"
      >
        <X className="w-3 h-3 text-muted-foreground" />
      </button>
    </motion.div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

let globalToast: ToastContextValue | null = null;

type ToastFn = {
  (message: string, opts?: { type?: ToastType; description?: string; duration?: number; id?: string }): void;
  success: (message: string, opts?: { description?: string; duration?: number }) => void;
  error: (message: string, opts?: { description?: string; duration?: number }) => void;
  dismiss: (id: string) => void;
};

export const toast: ToastFn = Object.assign(
  (message: string, opts?: { type?: ToastType; description?: string; duration?: number; id?: string }) => {
    return globalToast?.toast(message, opts);
  },
  {
    success: (message: string, opts?: { description?: string; duration?: number }) => {
      globalToast?.success(message, opts);
    },
    error: (message: string, opts?: { description?: string; duration?: number }) => {
      globalToast?.error(message, opts);
    },
    dismiss: (id: string) => {
      globalToast?.dismiss(id);
    },
  },
);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, opts?: { type?: ToastType; description?: string; duration?: number; id?: string }) => {
      const id = opts?.id || String(++toastId);
      const duration = opts?.duration ?? 3000;

      setToasts((prev) => {
        const existing = prev.find((t) => t.id === id);
        if (existing) {
          return prev.map((t) =>
            t.id === id ? { ...t, message, description: opts?.description, type: opts?.type || t.type } : t,
          );
        }
        return [...prev, { id, type: opts?.type || "info", message, description: opts?.description }];
      });

      if (duration > 0 && opts?.type !== "loading") {
        setTimeout(() => dismiss(id), duration);
      }

      return id;
    },
    [dismiss],
  );

  const success = useCallback(
    (message: string, opts?: { description?: string; duration?: number }) =>
      addToast(message, { ...opts, type: "success" }),
    [addToast],
  );

  const error = useCallback(
    (message: string, opts?: { description?: string; duration?: number }) =>
      addToast(message, { ...opts, type: "error" }),
    [addToast],
  );

  const ctxValue: ToastContextValue = { toast: addToast, success, error, dismiss };

  useEffect(() => {
    globalToast = ctxValue;
    return () => {
      globalToast = null;
    };
  }, [ctxValue]);

  return (
    <ToastContext.Provider value={ctxValue}>
      {children}
      {typeof window !== "undefined" &&
        createPortal(
          <div className="fixed top-3 right-3 z-[9999] flex flex-col gap-1.5 pointer-events-none">
            <AnimatePresence>
              {toasts.map((item) => (
                <div key={item.id} className="pointer-events-auto">
                  <ToastMessage item={item} onDismiss={dismiss} />
                </div>
              ))}
            </AnimatePresence>
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

export const Toaster = ToastProvider;

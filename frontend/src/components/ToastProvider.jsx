import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showToast = useCallback((message, type = "info") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  }, [removeToast]);

  const value = useMemo(() => ({ showToast, clearToasts, removeToast }), [clearToasts, removeToast, showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toastContainer">
        {toasts.length > 0 && (
          <button type="button" className="toastClearButton" onClick={clearToasts}>
            Очистить
          </button>
        )}
        {toasts.map((toast) => (
          <div key={toast.id} className={`toastItem ${toast.type}`}>
            <span>{toast.message}</span>
            <button type="button" className="toastCloseButton" onClick={() => removeToast(toast.id)}>
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return ctx;
};

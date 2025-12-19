import { createContext, useContext, useState, useCallback } from "react";
import ToastContainer from "./ToastContainer";

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
 const [toasts, setToasts] = useState([]);

 const removeToast = useCallback((id) => {
  setToasts((prev) => prev.filter((t) => t.id !== id));
 }, []);

 const showToast = useCallback(
  (message, type = "info", duration = 3000) => {
   const id = toastId++;

   setToasts((prev) => [...prev, { id, message, type }]);

   setTimeout(() => removeToast(id), duration);
  },
  [removeToast]
 );

 return (
  <ToastContext.Provider value={{ showToast }}>
   {children}
   <ToastContainer toasts={toasts} />
  </ToastContext.Provider>
 );
}

export function useToast() {
 const ctx = useContext(ToastContext);
 if (!ctx) {
  throw new Error("useToast must be used inside ToastProvider");
 }
 return ctx;
}

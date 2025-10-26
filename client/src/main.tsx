import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";

import { ToastProvider } from "./hooks/use-toast"; // تأكد المسار
import { queryClient } from "./lib/queryClient"; // تأكد المسار

// Targeted error suppression for React Query AbortErrors only
// ضع هذا المستمع قبل أي رندر
window.addEventListener("unhandledrejection", (event) => {
  const reason = (event as PromiseRejectionEvent).reason;

  // In development, suppress only React Query related AbortErrors
  // These are harmless errors that occur during normal component cleanup
  if (import.meta.env.DEV) {
    // Broadened detection: اسم AbortError أو نمط في الرسالة/stack
    const isAbort =
      reason?.name === "AbortError" ||
      (typeof reason?.message === "string" &&
        /abort(error|ed)?|query cancelled|signal is aborted/i.test(reason.message));

    const looksLikeReactQueryAbort =
      isAbort &&
      (typeof reason?.stack === "string") &&
      (reason.stack.includes("tanstack_react-query") ||
        reason.stack.includes("@tanstack_react-query") ||
        reason.stack.includes("react-query"));

    if (looksLikeReactQueryAbort) {
      // منع السلوك الافتراضي حتى لا يظهر في الـ console أثناء التطوير
      console.debug("Suppressed React Query AbortError during development cleanup");
      event.preventDefault();
      return;
    }
  }

  // Let all other errors propagate normally for proper debugging
});

// Render app with providers
const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element with id 'root' not found");
}

createRoot(container).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

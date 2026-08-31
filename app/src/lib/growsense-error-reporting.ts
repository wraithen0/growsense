type GrowSenseErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

type GrowSenseEvents = {
  captureException?: (
    error: unknown,
    context?: Record<string, unknown>,
    options?: GrowSenseErrorOptions,
  ) => void;
};

declare global {
  interface Window {
    __growsenseEvents?: GrowSenseEvents;
  }
}

export function reportGrowSenseError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.__growsenseEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context,
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error",
    },
  );
}

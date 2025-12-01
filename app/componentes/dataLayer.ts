// lib/dataLayer.ts

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

export function dlPush(event: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(event);
    console.log("[GTM]", event); // útil para debug
  }
}
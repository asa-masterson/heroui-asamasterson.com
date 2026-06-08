import { ViteReactSSG } from "vite-react-ssg";
import * as Swetrix from "swetrix";

import { routes } from "./App.tsx";
import "@/styles/globals.css";

export const createRoot = ViteReactSSG(
  {
    routes,
    basename: import.meta.env.BASE_URL,
  },
  async ({ isClient }) => {
    if (!isClient) return;

    try {
      const Sentry = await import("@sentry/browser");
      Sentry.init({ dsn: import.meta.env.VITE_GLITCHTIP_DSN });
    } catch (err) {
      console.error("[init] Failed to load Sentry:", err);
    }

    try {
      Swetrix.init("sjFU3ryURYdB", {
        apiURL: "https://swetrix.bigfluffy.monster/backend/v1/log",
      });
      Swetrix.trackViews();
    } catch (err) {
      console.warn("[swetrix] Failed to initialize analytics:", err);
    }
  },
);

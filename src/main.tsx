import { ViteReactSSG } from "vite-react-ssg";

import { routes } from "./App.tsx";
import "@/styles/globals.css";

export const createRoot = ViteReactSSG(
  {
    routes,
    basename: import.meta.env.BASE_URL,
  },
  async ({ isClient }) => {
    if (!isClient) return;

    const [Sentry, Swetrix] = await Promise.all([
      import("@sentry/browser"),
      import("swetrix"),
    ]);

    Sentry.init({
      dsn: import.meta.env.VITE_GLITCHTIP_DSN,
    });

    Swetrix.init("sjFU3ryURYdB", {
      apiURL: "https://swetrix.bigfluffy.monster/backend/v1/log",
    });
    Swetrix.trackViews();
  },
);

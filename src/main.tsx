import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import * as Sentry from "@sentry/browser";
import * as Swetrix from "swetrix";

import App from "./App.tsx";
import { Provider } from "./provider.tsx";
import "@/styles/globals.css";

// Initialize Sentry as early as possible
Sentry.init({ 
  dsn: import.meta.env.VITE_GLITCHTIP_DSN
});

Swetrix.init("sjFU3ryURYdB", {
  apiURL: "https://swetrix.bigfluffy.monster/backend/v1/log",
});
Swetrix.trackViews();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider>
        <App />
      </Provider>
    </BrowserRouter>
  </React.StrictMode>,
);

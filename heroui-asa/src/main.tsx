import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import * as Sentry from "@sentry/browser";

import App from "./App.tsx";
import { Provider } from "./provider.tsx";
import "@/styles/globals.css";

// Initialize Sentry as early as possible
Sentry.init({ 
  dsn: import.meta.env.VITE_GLITCHTIP_DSN || "https://b66682d72de64d18bec41ac0dcf04c5f@glitchtip-g4ckg4ks488csk4ssw4kw8wc.bigfluffy.monster/2" 
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider>
        <App />
      </Provider>
    </BrowserRouter>
  </React.StrictMode>,
);

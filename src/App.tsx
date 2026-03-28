import { Navigate, Route, Routes } from "react-router-dom";
import { ViteSSG } from "vite-plugin-ssg";

import IndexPage from "@/pages/index";
import AboutPage from "@/pages/about";

// Default export used by vite-plugin-ssg for pre-rendering.
// In SPA mode this file is not used for routing — main.tsx handles that.
export const createApp = ViteSSG(
  // Root component — equivalent to <App />
  <Routes>
    <Route element={<IndexPage />} path="/" />
    <Route element={<AboutPage />} path="/about" />
    <Route element={<Navigate replace to="/" />} path="*" />
  </Routes>,
);

// Keep the default function export for vite dev server / SPA fallback
function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<AboutPage />} path="/about" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}

export default App;

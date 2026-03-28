import { Navigate, Route, Routes } from "react-router-dom";
import { ViteSSG } from "vite-plugin-ssg";
import { HelmetProvider } from "react-helmet-async";

import IndexPage from "@/pages/index";
import AboutPage from "@/pages/about";

// HelmetProvider must wrap the tree inside createApp so vite-plugin-ssg
// can extract Helmet tags into each page's static HTML at build time.
export const createApp = ViteSSG(
  <HelmetProvider>
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<AboutPage />} path="/about" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  </HelmetProvider>,
);

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
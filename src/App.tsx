import type { RouteRecord } from "vite-react-ssg";
import { useEffect } from "react";
import { Navigate, Outlet, useLocation, useRoutes } from "react-router-dom";

import IndexPage from "@/pages/index";
import AboutPage from "@/pages/about";
import { Provider } from "@/provider";

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

function AppShell() {
  return (
    <Provider>
      <ScrollToTop />
      <Outlet />
    </Provider>
  );
}

export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <IndexPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "*", element: <Navigate replace to="/" /> },
    ],
  },
];

function App() {
  return useRoutes(routes);
}

export default App;
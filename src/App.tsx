import type { RouteRecord } from "vite-react-ssg";
import { Navigate, Outlet, useRoutes } from "react-router-dom";

import IndexPage from "@/pages/index";
import AboutPage from "@/pages/about";
import { Provider } from "@/provider";

function AppShell() {
  return (
    <Provider>
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
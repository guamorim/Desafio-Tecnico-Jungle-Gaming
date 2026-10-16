import {
  Outlet,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";

import { SiteFooter } from "@/components/layout/site-footer";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const isHomePage = useRouterState({
    select: (state) => state.location.pathname === "/",
  });

  return (
    <>
      <Outlet />
      <div className={isHomePage ? "pb-24 md:pb-0" : undefined}>
        <SiteFooter />
      </div>
    </>
  );
}

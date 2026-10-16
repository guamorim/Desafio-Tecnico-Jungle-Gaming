import {
  Outlet,
  createRootRoute,
} from "@tanstack/react-router";

import { SiteFooter } from "@/components/layout/site-footer";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <Outlet />
      <SiteFooter />
    </>
  );
}

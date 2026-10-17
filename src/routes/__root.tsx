import {
  Outlet,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";

import { SiteFooter } from "@/components/layout/site-footer";
import { AuthProvider } from "@/features/auth/auth-provider";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isHomePage = pathname === "/";
  const hidesFooter = pathname.startsWith("/orders/");

  return (
    <AuthProvider>
      <Outlet />
      {!hidesFooter && (
        <div className={isHomePage ? "pb-24 md:pb-0" : undefined}>
          <SiteFooter />
        </div>
      )}
    </AuthProvider>
  );
}

import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { AdminAuthProvider } from "./hooks/useAdminPasswordAuth";
import AdminLogin from "./pages/AdminLogin";
import AdminSetup from "./pages/AdminSetup";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import ProductsPage from "./pages/ProductsPage";
import Register from "./pages/Register";
import AdminAffiliates from "./pages/admin/AdminAffiliates";
import AdminCombos from "./pages/admin/AdminCombos";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminFiles from "./pages/admin/AdminFiles";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminPromotions from "./pages/admin/AdminPromotions";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminWallets from "./pages/admin/AdminWallets";
import BrandAssets from "./pages/admin/BrandAssets";
import Billing from "./pages/user/Billing";
import Dashboard from "./pages/user/Dashboard";
import Downloads from "./pages/user/Downloads";
import Licenses from "./pages/user/Licenses";
import Overview from "./pages/user/Overview";
import Referral from "./pages/user/Referral";
import Support from "./pages/user/Support";

const rootRoute = createRootRoute({
  component: () => (
    <AdminAuthProvider>
      <Outlet />
      <Toaster theme="dark" richColors />
    </AdminAuthProvider>
  ),
});

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Landing,
});
const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/products",
  component: ProductsPage,
});
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
});
const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: Register,
});
const adminSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-setup",
  component: AdminSetup,
});
const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-login",
  component: AdminLogin,
});

// User Dashboard Layout
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: Dashboard,
});
const dashboardIndexRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/",
  component: Overview,
});
const downloadsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/downloads",
  component: Downloads,
});
const licensesRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/licenses",
  component: Licenses,
});
const billingRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/billing",
  component: Billing,
});
const supportRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/support",
  component: Support,
});
const referralRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/referral",
  component: Referral,
});

// Admin Dashboard Layout
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminDashboard,
});
const adminIndexRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/",
  component: AdminOverview,
});
const adminOrdersRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/orders",
  component: AdminOrders,
});
const adminProductsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/products",
  component: AdminProducts,
});
const adminPromotionsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/promotions",
  component: AdminPromotions,
});
const adminCouponsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/coupons",
  component: AdminCoupons,
});
const adminCombosRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/combos",
  component: AdminCombos,
});
const adminWalletsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/wallets",
  component: AdminWallets,
});
const adminAffiliatesRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/affiliates",
  component: AdminAffiliates,
});
const adminSupportRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/support",
  component: AdminSupport,
});
const adminSettingsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/settings",
  component: AdminSettings,
});
const adminFilesRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/files",
  component: AdminFiles,
});
const adminBrandAssetsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/brand-assets",
  component: BrandAssets,
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  productsRoute,
  loginRoute,
  registerRoute,
  adminSetupRoute,
  adminLoginRoute,
  dashboardRoute.addChildren([
    dashboardIndexRoute,
    downloadsRoute,
    licensesRoute,
    billingRoute,
    supportRoute,
    referralRoute,
  ]),
  adminRoute.addChildren([
    adminIndexRoute,
    adminOrdersRoute,
    adminProductsRoute,
    adminPromotionsRoute,
    adminCouponsRoute,
    adminCombosRoute,
    adminWalletsRoute,
    adminAffiliatesRoute,
    adminSupportRoute,
    adminSettingsRoute,
    adminFilesRoute,
    adminBrandAssetsRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}

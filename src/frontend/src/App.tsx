import { createRouter, RouterProvider, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Layout from './components/Layout';
import AuthGuard from './components/AuthGuard';
import DashboardPage from './pages/DashboardPage';
import ActivationPage from './pages/ActivationPage';
import ReferralPage from './pages/ReferralPage';
import SpinPage from './pages/SpinPage';
import VideosPage from './pages/VideosPage';
import AdminActivationsPage from './pages/AdminActivationsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import WithdrawPage from './pages/WithdrawPage';
import RamadanPage from './pages/RamadanPage';
import LudoPage from './pages/LudoPage';
import NoticeBoardPage from './pages/NoticeBoardPage';
import RechargePage from './pages/RechargePage';

const rootRoute = createRootRoute({
  component: () => (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AuthGuard>
        <Layout>
          <Outlet />
        </Layout>
      </AuthGuard>
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

const activationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/activation',
  component: ActivationPage,
});

const referralRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/referral',
  component: ReferralPage,
});

const spinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/spin',
  component: SpinPage,
});

const videosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/videos',
  component: VideosPage,
});

const withdrawRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/withdraw',
  component: WithdrawPage,
});

const ramadanRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ramadan',
  component: RamadanPage,
});

const ludoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ludo',
  component: LudoPage,
});

const noticeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notice',
  component: NoticeBoardPage,
});

const rechargeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recharge',
  component: RechargePage,
});

const adminActivationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/activations',
  component: AdminActivationsPage,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboardPage,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  activationRoute,
  referralRoute,
  spinRoute,
  videosRoute,
  withdrawRoute,
  ramadanRoute,
  ludoRoute,
  noticeRoute,
  rechargeRoute,
  adminActivationsRoute,
  adminDashboardRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}

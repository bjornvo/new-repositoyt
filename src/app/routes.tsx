import { createBrowserRouter, Navigate } from 'react-router';
import { Root } from './Root';
import { LandingPage } from './components/landing/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { GetStartedPage } from './components/auth/GetStartedPage';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { Portfolio } from './components/dashboard/Portfolio';
import { Wallet } from './components/dashboard/Wallet';
import { Exchange } from './components/dashboard/Exchange';
import { Transactions } from './components/dashboard/Transactions';
import { Staking } from './components/dashboard/Staking';
import { Cards } from './components/dashboard/Cards';
import { SettingsPanel } from './components/dashboard/SettingsPanel';
import { AdminPage } from './components/admin/AdminPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: LandingPage },
      { path: 'login', Component: LoginPage },
      { path: 'get-started', Component: GetStartedPage },
      {
        path: 'dashboard',
        Component: DashboardLayout,
        children: [
          { index: true, element: <Navigate to="portfolio" replace /> },
          { path: 'portfolio', Component: Portfolio },
          { path: 'wallet', Component: Wallet },
          { path: 'exchange', Component: Exchange },
          { path: 'transactions', Component: Transactions },
          { path: 'staking', Component: Staking },
          { path: 'cards', Component: Cards },
          { path: 'settings', Component: SettingsPanel },
        ],
      },
      { path: 'admin', Component: AdminPage },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

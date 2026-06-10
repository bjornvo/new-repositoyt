import { Outlet } from 'react-router';
import { LangProvider } from './i18n/LangContext';
import { AuthProvider } from './context/AuthContext';

export function Root() {
  return (
    <LangProvider>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </LangProvider>
  );
}

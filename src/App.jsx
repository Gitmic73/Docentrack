import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import { Navigate } from 'react-router-dom';
import { Ban } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Home from '@/pages/Home';
import Admin from '@/pages/Admin';
import { applyTheme, getStoredTheme } from '@/lib/theme';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    } else if (authError.type === 'account_disabled') {
      return (
        <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center font-body p-4">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-rosso-light flex items-center justify-center mx-auto mb-4">
              <Ban size={28} className="text-rosso" />
            </div>
            <h1 className="font-display text-xl font-bold text-foreground mb-2">Account disabilitato</h1>
            <p className="text-sm text-grigio mb-6">{authError.message}</p>
            <button onClick={() => navigateToLogin()} className="bg-blu text-white px-5 py-2 rounded text-sm font-semibold">
              Torna al login
            </button>
          </div>
        </div>
      );
    }
  }

  // Render the main app
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Routes location={location}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </motion.div>
  );
};


function App() {
  useEffect(() => {
    applyTheme(getStoredTheme());
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme(getStoredTheme());
    mql.addEventListener('change', handler);
    window.addEventListener('themechange', handler);
    return () => {
      mql.removeEventListener('change', handler);
      window.removeEventListener('themechange', handler);
    };
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
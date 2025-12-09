import { lazy, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// project-imports
import GuestGuard from 'utils/route-guard/GuestGuard';
import CommonLayout from 'layout/CommonLayout';
import Loadable from 'components/Loadable';
import GosafeLanding from 'pages/gosafe';

// render - login
const AuthLogin = Loadable(lazy(() => import('pages/auth/auth1/login')));
const AuthRegister = Loadable(lazy(() => import('pages/auth/auth1/register')));
const AuthForgotPassword = Loadable(lazy(() => import('pages/auth/auth1/forgot-password')));
const AuthCheckMail = Loadable(lazy(() => import('pages/auth/auth1/check-mail')));
const AuthResetPassword = Loadable(lazy(() => import('pages/auth/auth1/reset-password')));
const AuthCodeVerification = Loadable(lazy(() => import('pages/auth/auth1/code-verification')));

const Map = Loadable(lazy(() => import('pages/auth/map')));

// ==============================|| AUTH ROUTES ||============================== //

// Wrapper component to handle conditional rendering
const RootPage = () => {
  const navigate = useNavigate();
  const env = import.meta.env.VITE_APP_ENV;
  const isLandingEnabled = env === 'production' || env === 'development';

  // console.log('🔍 RootPage render - REACT_APP_ENV:', env);
  // console.log('🔍 RootPage render - Landing enabled:', isLandingEnabled);

  useEffect(() => {
    if (!isLandingEnabled) {
      // console.log('🔄 RootPage useEffect - Navigating to /login');
      navigate('/login', { replace: true });
    }
  }, [isLandingEnabled, navigate]);

  if (!isLandingEnabled) {
    // console.log('⏳ RootPage - Will redirect to /login, showing nothing for now');
    return null;
  }

  // console.log('✅ RootPage - Returning LandingPage component');
  return <GosafeLanding />;
};

const LoginRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: (
        <GuestGuard>
          <RootPage />
        </GuestGuard>
      )
    },
    {
      path: '/',
      element: (
        <GuestGuard>
          <CommonLayout />
        </GuestGuard>
      ),
      children: [
        {
          path: 'login',
          element: <AuthLogin />
        },
        {
          path: 'map',
          element: <Map />
        },
        {
          path: 'register',
          element: <AuthRegister />
        },
        {
          path: 'forgot-password',
          element: <AuthForgotPassword />
        },
        {
          path: 'check-mail/:email',
          element: <AuthCheckMail />
        },
        {
          path: 'forgot-password/:email',
          element: <AuthResetPassword />
        },
        {
          path: 'code-verification',
          element: <AuthCodeVerification />
        }
      ]
    }
  ]
};

export default LoginRoutes;

// src/router/RouteGuard.tsx
import { useEffect, ReactNode, FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { PATHS } from './paths';

interface RouteGuardProps {
  children: ReactNode;
}

const RouteGuard: FC<RouteGuardProps> = ({ children }) => {
  const { token } = useUserStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Public paths (accessible without login)
    const publicPaths: string[] = [PATHS.login];

    const isPublic = publicPaths.includes(location.pathname);

    // Redirect to login if not public and not authenticated
    if (!isPublic && !token) {
      const from = encodeURIComponent(location.pathname + location.search);
      navigate(`${PATHS.login}?from=${from}`, { replace: true });
    }
  }, [location.pathname, location.search, token, navigate]);

  return <>{children}</>;
};

export default RouteGuard;

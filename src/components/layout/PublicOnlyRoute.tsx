import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { redirectPathFrom } from '../../utils/redirect';

export const PublicOnlyRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  return isAuthenticated ? <Navigate to={redirectPathFrom(location.state)} replace /> : <Outlet />;
};

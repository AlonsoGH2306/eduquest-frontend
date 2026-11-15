import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface PrivateRouteProps {
  requireUserManagement?: boolean;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ requireUserManagement = false }) => {
  const { isAuthenticated, canManageUsers } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireUserManagement && !canManageUsers) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

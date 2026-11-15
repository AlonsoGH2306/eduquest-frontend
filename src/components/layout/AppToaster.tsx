import React from 'react';
import { Toaster } from 'react-hot-toast';
import { useTheme } from '../../hooks/useTheme';

export const AppToaster: React.FC = () => {
  const { theme } = useTheme();
  const style =
    theme === 'dark' ? { background: '#1c2740', color: '#e2e8f0', border: '1px solid #24304a' } : undefined;
  return <Toaster position="top-right" toastOptions={{ duration: 3500, style }} />;
};

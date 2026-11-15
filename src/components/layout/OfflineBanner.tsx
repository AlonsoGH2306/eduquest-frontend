import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div role="status" className="flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-xs font-semibold text-white">
      <WifiOff size={14} /> Sin conexión a internet. Mostramos lo último que cargaste y reintentaremos al volver.
    </div>
  );
};

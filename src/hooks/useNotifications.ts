import { useContext } from 'react';
import { NotificationsContext } from '../contexts/NotificationsContext';

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications debe usarse dentro de un NotificationsProvider');
  }
  return context;
};

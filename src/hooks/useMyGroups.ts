import { useContext } from 'react';
import { MyGroupsContext } from '../contexts/MyGroupsContext';

export const useMyGroups = () => {
  const context = useContext(MyGroupsContext);
  if (!context) {
    throw new Error('useMyGroups debe usarse dentro de un MyGroupsProvider');
  }
  return context;
};

import { useContext } from 'react';
import { SavedDocumentsContext } from '../contexts/SavedDocumentsContext';

export const useSavedDocuments = () => {
  const context = useContext(SavedDocumentsContext);
  if (!context) {
    throw new Error('useSavedDocuments debe usarse dentro de un SavedDocumentsProvider');
  }
  return context;
};

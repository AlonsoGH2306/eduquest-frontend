import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { documentService } from '../services/documentService';
import { isCanceledError } from '../utils/errors';

interface SavedDocumentsContextType {
  isSaved: (documentId: number) => boolean;
  toggleSaved: (documentId: number) => Promise<boolean>;
  savedCount: number;
}

export const SavedDocumentsContext = createContext<SavedDocumentsContextType | undefined>(undefined);

export const SavedDocumentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const controller = new AbortController();
    documentService
      .getSavedIds(controller.signal)
      .then((ids) => setSavedIds(new Set(ids)))
      .catch((err) => {
        if (!isCanceledError(err)) setSavedIds(new Set());
      });
    return () => controller.abort();
  }, []);

  const update = (documentId: number, saved: boolean) =>
    setSavedIds((current) => {
      const next = new Set(current);
      if (saved) next.add(documentId);
      else next.delete(documentId);
      return next;
    });

  const isSaved = useCallback((documentId: number) => savedIds.has(documentId), [savedIds]);

  const toggleSaved = useCallback(
    async (documentId: number) => {
      const saved = !savedIds.has(documentId);
      update(documentId, saved);
      try {
        await documentService.setSaved(documentId, saved);
        return saved;
      } catch (error) {
        update(documentId, !saved);
        throw error;
      }
    },
    [savedIds]
  );

  const value = useMemo(
    () => ({ isSaved, toggleSaved, savedCount: savedIds.size }),
    [isSaved, toggleSaved, savedIds]
  );

  return <SavedDocumentsContext.Provider value={value}>{children}</SavedDocumentsContext.Provider>;
};

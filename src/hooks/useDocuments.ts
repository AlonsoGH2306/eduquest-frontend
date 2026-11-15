import { useCallback } from 'react';
import { DocumentSort, documentService } from '../services/documentService';
import { DocumentRequest } from '../types';
import { usePaginatedFetch } from './usePaginatedFetch';

interface DocumentFilters {
  page: number;
  size: number;
  search: string;
  tag: string;
  course: string;
  university: string;
  sort: DocumentSort;
  enabled?: boolean;
}

export function useDocuments({ page, size, search, tag, course, university, sort, enabled = true }: DocumentFilters) {
  const fetchPage = useCallback(
    (pageNumber: number, pageSize: number, signal: AbortSignal) =>
      documentService.getPublicDocuments(
        { page: pageNumber, size: pageSize, search, tag, course, university, sort },
        signal
      ),
    [search, tag, course, university, sort]
  );
  const list = usePaginatedFetch(fetchPage, page, size, enabled);
  const { reload } = list;

  const uploadDocument = useCallback(
    async (payload: DocumentRequest) => {
      const created = await documentService.uploadPublicDocument(payload);
      reload();
      return created;
    },
    [reload]
  );

  return { ...list, documents: list.items, uploadDocument };
}

export function useSavedDocumentsPage(page: number, size: number, enabled: boolean) {
  const fetchPage = useCallback(
    (pageNumber: number, pageSize: number, signal: AbortSignal) =>
      documentService.getSavedDocuments(pageNumber, pageSize, signal),
    []
  );
  return usePaginatedFetch(fetchPage, page, size, enabled);
}

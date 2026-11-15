import { useCallback } from 'react';
import { documentService } from '../services/documentService';
import { ReviewUpdateRequest } from '../types';
import { usePaginatedFetch } from './usePaginatedFetch';

const REVIEWS_PAGE_SIZE = 50;

export function useReviews(documentId: number | null) {
  const fetchPage = useCallback(
    (page: number, size: number, signal: AbortSignal) =>
      documentService.getReviewsByDocument(documentId ?? 0, page, size, signal),
    [documentId]
  );
  const list = usePaginatedFetch(fetchPage, 0, REVIEWS_PAGE_SIZE, documentId !== null);
  const { setItems } = list;

  const addReview = useCallback(
    async (rating: number, comment: string) => {
      if (documentId === null) return;
      const created = await documentService.createReview({ documentId, rating, comment });
      setItems((items) => [created, ...items]);
    },
    [documentId, setItems]
  );

  const editReview = useCallback(
    async (id: number, payload: ReviewUpdateRequest) => {
      const updated = await documentService.updateReview(id, payload);
      setItems((items) => items.map((review) => (review.id === id ? updated : review)));
    },
    [setItems]
  );

  const removeReview = useCallback(
    async (id: number) => {
      await documentService.deleteReview(id);
      setItems((items) => items.filter((review) => review.id !== id));
    },
    [setItems]
  );

  const reviews = list.items;
  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : null;

  return { ...list, reviews, averageRating, addReview, editReview, removeReview };
}

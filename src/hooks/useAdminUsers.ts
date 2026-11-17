import { useCallback } from 'react';
import { adminService } from '../services/adminService';
import { UserResponse } from '../types';
import { usePaginatedFetch } from './usePaginatedFetch';

export function useAdminUsers(page: number, size: number) {
  const fetchPage = useCallback(
    (pageNumber: number, pageSize: number, signal: AbortSignal) => adminService.getUsers(pageNumber, pageSize, signal),
    []
  );
  const list = usePaginatedFetch(fetchPage, page, size);
  const { setItems } = list;

  const replaceUser = useCallback(
    (updated: UserResponse) => {
      setItems((items) => items.map((user) => (user.id === updated.id ? updated : user)));
      return updated;
    },
    [setItems]
  );

  const changeRole = useCallback(
    async (userId: number, role: string) => replaceUser(await adminService.updateUserRole(userId, role)),
    [replaceUser]
  );
  const banUser = useCallback(
    async (userId: number, reason: string, days: number | null) =>
      replaceUser(await adminService.banUser(userId, reason, days)),
    [replaceUser]
  );
  const unbanUser = useCallback(
    async (userId: number) => replaceUser(await adminService.unbanUser(userId)),
    [replaceUser]
  );

  return { ...list, users: list.items, changeRole, banUser, unbanUser };
}

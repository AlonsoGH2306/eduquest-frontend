import { useCallback, useState } from 'react';
import { userService } from '../services/userService';
import { useAuth } from './useAuth';
import { useFetch } from './useFetch';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function useProfile() {
  const { user, updateSession } = useAuth();
  const [savingName, setSavingName] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [savingAdvisor, setSavingAdvisor] = useState(false);
  const fetchMe = useCallback((signal: AbortSignal) => userService.getMe(signal), []);
  const { data: profile, setData: setProfile } = useFetch(fetchMe);

  const saveProfile = useCallback(
    async (username: string, advisor?: boolean) => {
      const session = await userService.updateProfile(username, advisor);
      updateSession({ ...session, avatarUrl: session.avatarUrl ?? user?.avatarUrl ?? null });
    },
    [updateSession, user]
  );

  const changeUsername = useCallback(
    async (username: string) => {
      setSavingName(true);
      try {
        await saveProfile(username);
      } finally {
        setSavingName(false);
      }
    },
    [saveProfile]
  );

  const changeAdvisor = useCallback(
    async (advisor: boolean) => {
      if (!user) return;
      setSavingAdvisor(true);
      try {
        await saveProfile(user.username, advisor);
        setProfile((previous) => (previous ? { ...previous, advisor } : previous));
      } finally {
        setSavingAdvisor(false);
      }
    },
    [saveProfile, setProfile, user]
  );

  const validateAvatar = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) return 'Usa una imagen JPG, PNG o WEBP.';
    if (file.size > MAX_AVATAR_BYTES) return 'La imagen no puede pesar más de 2 MB.';
    return null;
  };

  const changeAvatar = useCallback(
    async (file: File) => {
      if (!user) return;
      setSavingAvatar(true);
      try {
        const updated = await userService.uploadAvatar(file);
        updateSession({ ...user, avatarUrl: updated.avatarUrl ?? null });
      } finally {
        setSavingAvatar(false);
      }
    },
    [updateSession, user]
  );

  const removeAvatar = useCallback(async () => {
    if (!user) return;
    setSavingAvatar(true);
    try {
      await userService.deleteAvatar();
      updateSession({ ...user, avatarUrl: null });
    } finally {
      setSavingAvatar(false);
    }
  }, [updateSession, user]);

  return {
    user,
    advisor: Boolean(profile?.advisor),
    savingName,
    savingAvatar,
    savingAdvisor,
    changeUsername,
    changeAdvisor,
    validateAvatar,
    changeAvatar,
    removeAvatar,
  };
}

import React, { useState } from 'react';
import { API_ORIGIN } from '../../services/axiosInstance';

const COLORS = ['bg-indigo-600', 'bg-teal-600', 'bg-orange-600', 'bg-violet-600', 'bg-sky-700', 'bg-pink-700'];

const colorFor = (name: string) => {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return COLORS[hash % COLORS.length];
};

interface UserAvatarProps {
  username: string;
  avatarUrl?: string | null;
  size?: number;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ username, avatarUrl, size = 40 }) => {
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: size };

  if (avatarUrl && !failed) {
    return (
      <img
        src={`${API_ORIGIN}${avatarUrl}`}
        alt={`Foto de perfil de ${username}`}
        style={style}
        onError={() => setFailed(true)}
        className="shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <span
      style={style}
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${colorFor(username)}`}
    >
      {username.slice(0, 1).toUpperCase()}
    </span>
  );
};

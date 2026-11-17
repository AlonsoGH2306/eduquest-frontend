import React, { useState } from 'react';
import { GroupResponse } from '../../types';
import { assetUrl, groupColor, groupInitials } from '../../utils/groupAvatar';

type GroupLike = Pick<GroupResponse, 'name'> & Partial<Pick<GroupResponse, 'color' | 'iconUrl' | 'bannerUrl'>>;

interface GroupAvatarProps {
  group: GroupLike;
  size?: number;
  radius?: number;
  className?: string;
}

export const GroupAvatar: React.FC<GroupAvatarProps> = ({ group, size = 48, radius, className = '' }) => {
  const [failed, setFailed] = useState(false);
  const shape = { width: size, height: size, borderRadius: radius ?? Math.round(size / 3) };

  if (group.iconUrl && !failed) {
    return (
      <img
        src={assetUrl(group.iconUrl)}
        alt=""
        style={shape}
        onError={() => setFailed(true)}
        className={`shrink-0 object-cover ${className}`}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      style={{ ...shape, backgroundColor: groupColor(group), fontSize: Math.max(11, Math.round(size * 0.26)) }}
      className={`flex shrink-0 items-center justify-center font-display font-extrabold text-noche ${className}`}
    >
      {groupInitials(group.name)}
    </span>
  );
};

interface GroupBannerProps {
  group: GroupLike;
  className?: string;
  children?: React.ReactNode;
}

export const GroupBanner: React.FC<GroupBannerProps> = ({ group, className = '', children }) => {
  const [failed, setFailed] = useState(false);
  const color = groupColor(group);
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ backgroundColor: color }}>
      {group.bannerUrl && !failed ? (
        <img
          src={assetUrl(group.bannerUrl)}
          alt=""
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden="true">
          <span className="absolute -top-16 -right-10 h-48 w-48 rounded-full bg-white/25" />
          <span className="absolute -bottom-16 left-1/4 h-32 w-32 rounded-full bg-black/10" />
          <span className="absolute top-5 right-1/3 h-2.5 w-2.5 rounded-full bg-white/70" />
          <span className="absolute top-12 right-[20%] h-1.5 w-1.5 rounded-full bg-white/60" />
        </span>
      )}
      {children}
    </div>
  );
};

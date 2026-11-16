import { GroupResponse } from '../types';
import { API_ORIGIN } from '../services/axiosInstance';

export const assetUrl = (url: string) => (/^https?:\/\//.test(url) ? url : `${API_ORIGIN}${url}`);

export const GROUP_COLORS = ['#ffd25e', '#3ee6a8', '#ff6fb5', '#59c3ff', '#a597ff', '#ff8a5c'];

const fallbackColor = (name: string) => {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return GROUP_COLORS[hash % GROUP_COLORS.length];
};

type GroupLike = Pick<GroupResponse, 'name'> & Partial<Pick<GroupResponse, 'color'>>;

export const groupColor = (group: GroupLike | string) =>
  typeof group === 'string' ? fallbackColor(group) : (group.color ?? fallbackColor(group.name));

export const groupInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

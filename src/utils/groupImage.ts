const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
export const MAX_GROUP_IMAGE_MB = 25;
export const GROUP_IMAGE_ACCEPT = IMAGE_TYPES.join(',');

export const groupImageError = (file: File): string | null => {
  if (!IMAGE_TYPES.includes(file.type)) return 'Usa una imagen PNG, JPG, WebP o GIF';
  if (file.size > MAX_GROUP_IMAGE_MB * 1024 * 1024) return `La imagen no debe superar los ${MAX_GROUP_IMAGE_MB} MB`;
  return null;
};

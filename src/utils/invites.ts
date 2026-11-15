export const buildInviteLink = (code: string, token: string) =>
  `${window.location.origin}/invite/${encodeURIComponent(code)}?token=${encodeURIComponent(token)}`;

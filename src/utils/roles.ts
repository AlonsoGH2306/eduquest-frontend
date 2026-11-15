export const ROLE_LABELS: Record<string, string> = {
  ROLE_ADMIN: 'Administrador',
  ROLE_MANAGER: 'Gestor',
  ROLE_USER: 'Estudiante',
};

export const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }));

export const primaryRole = (roles: string[] = []) =>
  roles.includes('ROLE_ADMIN') ? 'ROLE_ADMIN' : roles.includes('ROLE_MANAGER') ? 'ROLE_MANAGER' : 'ROLE_USER';

export const roleLabel = (roles: string[] = []) => ROLE_LABELS[primaryRole(roles)];

import axios from 'axios';

interface ProblemDetail {
  message?: string;
  detail?: string;
  error?: string;
  errors?: Record<string, string>;
}

const STATUS_MESSAGES: Record<number, string> = {
  400: 'Revisa los datos del formulario e inténtalo otra vez.',
  401: 'Tu sesión expiró o las credenciales no coinciden.',
  403: 'No tienes permiso para esta acción.',
  404: 'No encontramos lo que buscabas. Puede que haya sido eliminado.',
  409: 'Ese registro ya existe.',
  413: 'El archivo es demasiado grande.',
  500: 'El servidor tuvo un problema. Inténtalo en unos minutos.',
  502: 'El servidor no responde. Inténtalo en unos minutos.',
  503: 'Un servicio externo no está disponible ahora. Inténtalo en unos minutos.',
  504: 'El servidor tardó demasiado en responder.',
};

const GENERIC_BACKEND_MESSAGES = ['Errores de validación', 'Error interno del servidor'];

export const isCanceledError = (error: unknown) => axios.isCancel(error);

export const getErrorStatus = (error: unknown): number | null =>
  axios.isAxiosError(error) ? (error.response?.status ?? null) : null;

export const extractFieldErrors = (error: unknown): Record<string, string> => {
  if (!axios.isAxiosError<ProblemDetail>(error)) return {};
  return error.response?.data?.errors ?? {};
};

export const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<ProblemDetail>(error)) {
    if (!error.response) {
      return error.code === 'ECONNABORTED'
        ? 'La conexión tardó demasiado. Revisa tu internet e inténtalo otra vez.'
        : 'No hay conexión con el servidor. Revisa tu internet.';
    }
    const { status, data } = error.response;
    const fieldErrors = data?.errors ? Object.values(data.errors) : [];
    if (fieldErrors.length > 0) return fieldErrors[0];

    const backendMessage = data?.message || data?.detail;
    if (backendMessage && status < 500 && !GENERIC_BACKEND_MESSAGES.includes(backendMessage)) {
      return backendMessage;
    }
    return STATUS_MESSAGES[status] ?? 'Algo salió mal. Inténtalo otra vez.';
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Algo salió mal. Inténtalo otra vez.';
};

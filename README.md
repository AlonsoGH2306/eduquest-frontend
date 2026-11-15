# EduQuest Web

Frontend web de **EduQuest** (CS2031 Desarrollo Basado en Plataformas, Proyecto 2), hecho con **React + TypeScript + Vite + Tailwind CSS**. Consume exclusivamente la API REST de `eduquest-backend`.

**Integrantes:** Juan Pablo Saavedra Ruiz, Piero Alejandro Ortega Capacute, Omar Alonzo Guzmán Harvey y Edson Yenen Falcon Jimenez

## Vistas

| Ruta | Vista | Endpoints |
|---|---|---|
| `/login`, `/register` | Inicio de sesión y registro (botón para ver la contraseña, confirmación y opción de ser asesor) con validación en tiempo real | `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh` |
| `/dashboard` | Resumen con totales, lo último subido y el top de la semana | `GET /documents`, `GET /groups`, `GET /study-plans`, `GET /gamification/leaderboard` |
| `/documents?view&page&size&search&tag&course&university&sort` | Biblioteca pública: búsqueda con debounce, filtros por etiqueta, curso y universidad, orden y paginación; vista previa del material (PDF, Office, Drive, YouTube, imágenes); **Mis guardados**; reseñas; reportar material | `GET /documents`, `POST /documents`, `GET /documents/saved`, `GET /documents/saved/ids`, `POST|DELETE /documents/{id}/saved`, `GET /documents/{id}/reviews`, `POST|PUT|DELETE /reviews`, `POST /reports` |
| `/groups?view&search&page&size` | **Mis grupos** ordenados por última actividad con contador de novedades; **Explorar** con búsqueda por nombre (públicos) o por código (privados), crear grupo y unirse | `GET /groups/mine`, `GET /groups?search`, `GET /groups/code/{code}`, `POST /groups`, `POST /groups/{id}/join` |
| `/groups/:groupId?tab&page&size` | Detalle: documentos, sesiones (agendar, editar, eliminar, Google Calendar, confirmar asistencia, calificar la asesoría y ver su grabación de YouTube), **chat** e integrantes (con insignia de asesor y opción de reportar); al entrar marca las novedades como vistas | `GET /groups/{id}`, `GET|POST /groups/{id}/documents`, `GET|POST /groups/{id}/sessions`, `PUT|DELETE /groups/{id}/sessions/{sessionId}`, `POST|DELETE …/attendance`, `GET|POST …/reviews`, `PUT …/recording`, `GET|POST /groups/{id}/messages`, `GET /groups/{id}/members`, `POST /groups/{id}/seen`, `POST /groups/{id}/messages/seen` |
| `/messages`, `/messages/:userId` | Mensajes directos: conversaciones con contador de no leídos, búsqueda de personas por usuario y chat privado (también se abre desde los integrantes de un grupo) | `GET /conversations`, `GET /conversations/contacts`, `GET|POST /conversations/{userId}/messages`, `POST /conversations/{userId}/read` |
| Campana (Navbar) | Notificaciones de nuevos integrantes, material y asesorías en tus grupos, mensajes directos, insignias y avisos del administrador; abre el destino y marca como leído | `GET /notifications`, `GET /notifications/unread-count`, `PATCH /notifications/{id}/read`, `PATCH /notifications/read-all`, `GET /conversations/unread-count` |
| `/invite/:code?token` | Invitación a un grupo: muestra el grupo y lo une con el enlace del creador (sin contraseña si trae `token`) | `GET /groups/code/{code}`, `POST /groups/{id}/join` |
| `/study-planner` | Planes con IA para uno o todos los cursos del ciclo; checklist de actividades con barra de progreso | `POST /study-plans/generate`, `GET /study-plans`, `PUT /study-plans/{id}/progress` |
| `/achievements` | Puntos, insignias y ranking semanal o histórico | `GET /gamification/me`, `GET /gamification/leaderboard` |
| `/profile` | Nombre de usuario, foto de perfil, cambiar contraseña, perfil de asesor y tema | `PATCH /users/me`, `PATCH /users/me/password`, `PUT|DELETE /users/me/avatar` |
| `/admin/users?page&size` | ADMIN: roles y vetos. MANAGER: solo lectura | `GET /admin/users`, `PATCH /admin/users/{id}/role`, `PATCH /admin/users/{id}/ban`, `PATCH /admin/users/{id}/unban` |
| `/admin/reports?status&page&size` | Bandeja de reportes: descartar o resolver (ADMIN/MANAGER); vetar al usuario o eliminar el material (ADMIN) | `GET /admin/reports`, `GET /admin/reports/open-count`, `PATCH /admin/reports/{id}`, `DELETE /admin/documents/{id}` |
| `/admin/announcements` | ADMIN: enviar un aviso a toda la comunidad o a un usuario | `POST /admin/notifications` |
| `/forgot-password`, `/reset-password?email&code` | Recuperar la contraseña con el código de 6 dígitos que llega al correo | `POST /auth/forgot-password`, `POST /auth/reset-password` |
| `/banned` | Aviso para cuentas vetadas, con el motivo | — |
| `*` | Página 404 | — |

## Arquitectura

```
src/
├── services/        Cliente axios (axiosInstance.ts) y un servicio por recurso del backend
├── hooks/           Custom hooks: useFetch, usePaginatedFetch, usePageParams, useDocuments, useGroups,
│                    useGroupDetail, useGroupChat, useDirectChat, useConversations, useReviews, useStudyPlans, useAchievements, useAdminUsers,
│                    useAdminReports, useDashboardStats, useProfile, useAuth, useTheme, useOnlineStatus, useDebounce
├── contexts/        AuthContext (sesión y roles), ThemeContext (modo claro/oscuro), MyGroupsContext (mis grupos y novedades)
│                    y SavedDocumentsContext (materiales guardados)
├── routes/          AppRoutes: rutas centralizadas, lazy loading, rutas protegidas y 404
├── pages/           Vistas (contenedores que usan los hooks)
├── components/      Componentes presentacionales: common, layout, documents, groups, admin, dashboard, plans,
│                    achievements, reports
├── types/           Interfaces de los DTOs del backend
└── utils/           Errores, formularios, roles, fechas, Google Calendar, vista previa de documentos y almacenamiento del token
```

- **Cliente HTTP:** `axios.create` con `baseURL`, cabeceras por defecto e interceptores. Agrega el JWT, renueva el token con el refresh token (con cola de peticiones), reintenta las lecturas ante fallos de red o 502/503/504, y redirige si la cuenta fue vetada. Todas las vistas cancelan sus peticiones con `AbortController` al desmontarse.
- **Sesión:** el token vive en memoria y en `sessionStorage` (no en `localStorage`), así se borra al cerrar el navegador.
- **Errores:** `utils/errors.ts` traduce los códigos 400, 401, 403, 404, 409, 413 y 5xx a mensajes claros. Los errores de validación del backend se muestran junto a cada campo del formulario. Hay `ErrorBoundary`, estados de error con botón de reintento, aviso sin conexión, skeletons de carga, toasts de éxito, confirmación antes de borrar y botones bloqueados mientras se envía.
- **Paginación:** documentos, grupos, documentos de grupo y usuarios usan los endpoints paginados del backend. Se puede elegir entre 10, 25, 50 o 100 por página, y la página queda guardada en la URL para compartirla.

## Cómo correrlo

Requisitos: Node 20+ y el backend corriendo.

```bash
npm install
copy .env.example .env      # en Mac/Linux: cp .env.example .env
npm run dev                 # http://localhost:5173
```

`VITE_API_BASE_URL` indica la URL de la API, por ejemplo `http://localhost:8080/api/v1`.

## Despliegue (Vercel)

1. Importa el repositorio en Vercel (framework: Vite, build `npm run build`, salida `dist`).
2. En *Environment Variables* agrega `VITE_API_BASE_URL=https://<tu-backend>/api/v1`.
3. En el backend agrega el dominio de Vercel a `CORS_ALLOWED_ORIGINS`.

`vercel.json` redirige todas las rutas a `index.html` para que funcionen al recargar.

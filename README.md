# EduQuest Web

Frontend web de **EduQuest** (CS2031 Desarrollo Basado en Plataformas, Proyecto 2), hecho con **React + TypeScript + Vite + Tailwind CSS**. Consume exclusivamente la API REST de `eduquest-backend`.

**Integrantes:** Juan Pablo Saavedra Ruiz, Piero Alejandro Ortega Capacute, Omar Alonzo Guzmán Harvey y Edson Yenen Falcon Jimenez

## Vistas

| Ruta | Vista | Endpoints |
|---|---|---|
| `/` | Página de inicio pública: qué es EduQuest, sus funciones principales con maquetas y botones para crear cuenta o iniciar sesión. Si ya hay sesión, lleva al dashboard | — |
| `/login`, `/register` | Inicio de sesión y registro (botón para ver la contraseña, confirmación y opción de ser asesor) con validación en tiempo real | `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh` |
| `/dashboard` | Resumen con totales, lo último subido y el top de la semana | `GET /documents`, `GET /groups`, `GET /study-plans`, `GET /gamification/leaderboard` |
| `/documents?view&page&size&search&tag&course&university&sort` | Biblioteca pública: búsqueda con debounce, filtros por etiqueta, curso y universidad, orden y paginación; vista previa del material (PDF, Office, Drive, YouTube, imágenes); subir el archivo desde el equipo o pegar un enlace; editar o eliminar tu material; **Mis guardados**; reseñas; reportar material; **Estudiar**: quiz o flashcards generados con IA desde el material | `GET /documents`, `POST /documents`, `POST /documents/{id}/study-set`, `GET /documents/saved`, `GET /documents/saved/ids`, `POST|DELETE /documents/{id}/saved`, `GET /documents/{id}/reviews`, `POST|PUT|DELETE /reviews`, `POST /reports` |
| `/groups?view&search&page&size` | **Mis grupos** ordenados por última actividad con contador de novedades; **Explorar** con búsqueda por nombre (públicos) o por código (privados), crear grupo y unirse | `GET /groups/mine`, `GET /groups?search`, `GET /groups/code/{code}`, `POST /groups`, `POST /groups/{id}/join` |
| `/groups/:groupId?tab&page&size` | Detalle: documentos, sesiones con hora de inicio y fin (agendar, editar, eliminar, Google Calendar, confirmar asistencia antes de empezar, «Unirme ahora» durante la sesión, calificar la asesoría y ver su grabación de YouTube), **chat** con imágenes (botón o arrastrar) e integrantes (con insignia de asesor, mensaje directo y opción de reportar); el creador edita, elimina el grupo o quita integrantes y los demás pueden salir; al entrar marca las novedades como vistas | `GET /groups/{id}`, `GET|POST /groups/{id}/documents`, `GET|POST /groups/{id}/sessions`, `PUT|DELETE /groups/{id}/sessions/{sessionId}`, `POST|DELETE …/attendance`, `POST …/check-in`, `GET|POST …/reviews`, `PUT …/recording`, `GET|POST /groups/{id}/messages`, `GET /groups/{id}/members`, `POST /groups/{id}/seen`, `POST /groups/{id}/messages/seen` |
| `/groups/:groupId?tab=chat&channel` | Chat tipo Discord: canales (el creador y los moderadores crean, editan y borran), menciones con autocompletado, formato (**negrita**, *cursiva*, `código`, listas y enlaces), reacciones, responder, hilos, fijar mensajes, buscar en el historial, adjuntar imágenes, videos (con reproductor en el chat) o documentos, encuestas y stickers animados (paquete propio y colección personal con GIF); en el encabezado del grupo, **Sala de voz** y silenciar; en integrantes, quién está en línea y nombrar moderadores | `/groups/{id}/channels/**`, `/groups/{id}/messages/**`, `/groups/{id}/polls/**`, `/groups/{id}/members/{memberId}/moderator`, `/groups/{id}/mute`, `/groups/{id}/voice-room`, `/groups/{id}/online`, `/users/me/stickers` |
| `/messages`, `/messages/:userId` | Mensajes directos: conversaciones con contador de no leídos, búsqueda de personas por usuario y chat privado (también se abre desde los integrantes de un grupo) | `GET /conversations`, `GET /conversations/contacts`, `GET|POST /conversations/{userId}/messages`, `POST /conversations/{userId}/read` |
| `/groups/:groupId?tab=chat&channel&message` | Más funciones del chat: doble clic para reaccionar 👍, contadores de no leídos y de «@» por canal, saltar al mensaje exacto desde una notificación, la búsqueda o los guardados, spoilers con `\|\|texto\|\|`, canales de anuncios de solo lectura, modo lento, palabras prohibidas, guardar mensajes, resumen con IA de lo que te perdiste, quién está en la sala de voz y sala de estudio compartida con Pomodoro sincronizado | `POST /groups/{id}/channels/{c}/read`, `GET|PUT /groups/{id}/moderation`, `GET /groups/{id}/voice`, `POST /groups/{id}/voice/join|leave`, `GET /groups/{id}/messages/summary`, `PUT /groups/{id}/messages/{m}/saved`, `GET /groups/{id}/messages?around`, `/groups/{id}/study-room/**` |
| `/messages/rooms/:roomId` | Chats grupales fuera de un grupo (3 a 10 personas): crear, renombrar, añadir gente, salir; conversaciones y grupos fijados arriba | `/rooms/**`, `GET|PUT /users/me/pinned-chats` |
| Personalizar grupo | Foto, portada y color del grupo desde el menú del grupo, con vista previa (también se elige el color y la foto al crear el grupo) | `POST /files`, `PUT /groups/{id}/appearance` |
| `/saved` | Mensajes guardados de todos tus grupos, con salto al mensaje | `GET /users/me/saved-messages` |
| Búsqueda global (Ctrl+K) | Materiales, grupos, preguntas del foro y personas en un solo buscador | `GET /search?q` |
| Estado (panel de usuario) | Disponible, ocupado, ausente o invisible, con emoji y texto; se ve en integrantes y mensajes directos | `PUT /users/me/status`, `GET /users/statuses?ids` |
| Campana (panel de usuario) | Notificaciones de nuevos integrantes, material y asesorías en tus grupos, mensajes directos, insignias y avisos del administrador; abre el destino y marca como leído | `GET /notifications`, `GET /notifications/unread-count`, `PATCH /notifications/{id}/read`, `PATCH /notifications/read-all`, `GET /conversations/unread-count` |
| `/invite/:code?token` | Invitación a un grupo: muestra el grupo y lo une con el enlace del creador (sin contraseña si trae `token`) | `GET /groups/code/{code}`, `POST /groups/{id}/join` |
| `/study-planner` | Planes con IA para uno o todos los cursos del ciclo; checklist de actividades con barra de progreso; eliminar un plan | `POST /study-plans/generate`, `GET /study-plans`, `PUT /study-plans/{id}/progress` |
| `/achievements` | Puntos, insignias y ranking semanal o histórico | `GET /gamification/me`, `GET /gamification/leaderboard` |
| `/profile` | Nombre de usuario, foto de perfil, cambiar contraseña, perfil de asesor y tema | `PATCH /users/me`, `PATCH /users/me/password`, `PUT|DELETE /users/me/avatar` |
| `/admin/overview` | ADMIN/MANAGER: resumen de usuarios, materiales, grupos, asesorías y reportes | `GET /admin/stats` |
| `/users/:id` | Perfil público: puntos, ranking, insignias, materiales y botón seguir | `GET /users/{id}/profile`, `GET /users/{id}/documents`, `POST\|DELETE /users/{id}/follow` |
| `/calendar` | Mi calendario con las asesorías de todos mis grupos; **Exportar a Google Calendar** descarga un `.ics` y abre la importación de Google | `GET /sessions/mine`, `GET /sessions/mine/calendar.ics` |
| `/forum`, `/forum/:id` | Foro de preguntas por curso: buscar, preguntar, responder, votar y elegir la mejor respuesta; las respuestas, votos y contadores se actualizan en tiempo real | `/forum/**` |
| `/admin/appeals` | Apelaciones de usuarios suspendidos (ADMIN/MANAGER) | `GET /admin/appeals`, `PATCH /admin/appeals/{id}` |
| `/admin/users?page&size` | ADMIN: roles, vetos y suspensiones. MANAGER: advierte y suspende estudiantes por 1, 3 o 7 días | `GET /admin/users`, `PATCH /admin/users/{id}/role`, `PATCH /admin/users/{id}/ban`, `PATCH /admin/users/{id}/unban`, `POST /admin/users/{id}/warning` |
| `/admin/reports?status&page&size` | Bandeja de reportes: descartar, resolver, suspender al usuario o eliminar el material (ADMIN/MANAGER) | `GET /admin/reports`, `GET /admin/reports/open-count`, `PATCH /admin/reports/{id}`, `DELETE /admin/documents/{id}` |
| `/admin/announcements` | ADMIN: enviar un aviso a toda la comunidad o a un usuario | `POST /admin/notifications` |
| `/forgot-password`, `/reset-password?email&code` | Recuperar la contraseña con el código de 6 dígitos que llega al correo | `POST /auth/forgot-password`, `POST /auth/reset-password` |
| `/banned` | Aviso para cuentas vetadas o suspendidas, con el motivo y la fecha de fin | — |
| `*` | Página 404 | — |

El chat (grupo y directos) y el foro funcionan en tiempo real con WebSocket (`/ws`); el chat muestra «escribiendo…» y permite responder, editar y eliminar mensajes. Si la conexión cae, vuelve a consultar cada 4 segundos. Después de registrarte aparece un aviso para ingresar el código que llega al correo; mientras no lo verifiques la cuenta es de solo lectura. Desde la pantalla de cuenta suspendida se puede enviar una apelación.

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
├── components/      Componentes presentacionales: common, layout, brand (Lumi), landing, documents, groups, chat,
│                    messages, forum, admin, dashboard, plans, achievements, profile, reports
├── types/           Interfaces de los DTOs del backend
└── utils/           Errores, formularios, roles, fechas, Google Calendar, vista previa de documentos y almacenamiento del token
```

- **Cliente HTTP:** `axios.create` con `baseURL`, cabeceras por defecto e interceptores. Agrega el JWT, renueva el token con el refresh token (con cola de peticiones), reintenta las lecturas ante fallos de red o 502/503/504, y redirige si la cuenta fue vetada. Todas las vistas cancelan sus peticiones con `AbortController` al desmontarse.
- **Sesión:** el token vive en memoria y en `sessionStorage` (no en `localStorage`), así se borra al cerrar el navegador.
- **Errores:** `utils/errors.ts` traduce los códigos 400, 401, 403, 404, 409, 413 y 5xx a mensajes claros. Los errores de validación del backend se muestran junto a cada campo del formulario. Hay un `ErrorBoundary` general y otro por pantalla (si una vista falla, el menú sigue funcionando y se reinicia al cambiar de ruta), estados de error con botón de reintento, aviso sin conexión, skeletons de carga, toasts de éxito, confirmación antes de borrar y botones bloqueados mientras se envía.
- **Paginación:** documentos, grupos, documentos de grupo, foro, usuarios, reportes y apelaciones usan los endpoints paginados del backend. Se puede elegir entre 10, 25, 50 o 100 por página, y la página queda guardada en la URL para compartirla.

## Cómo correrlo

Requisitos: Node 20+ y el backend corriendo.

```bash
npm install
copy .env.example .env      # en Mac/Linux: cp .env.example .env
npm run dev                 # http://localhost:5173
```

`VITE_API_BASE_URL` indica la URL de la API, por ejemplo `http://localhost:8080/api/v1`.

## Despliegue (AWS Amplify)

1. En Amplify, *Create new app* → conecta el repositorio de GitHub y la rama `main`. Amplify detecta `amplify.yml`, que usa Node 22, instala con `npm ci`, compila con `npm run build` y publica la carpeta `dist`.
2. En *Environment variables* agrega `VITE_API_BASE_URL=https://<dominio-del-backend>/api/v1`. Vite la lee al compilar, así que después de cambiarla hay que volver a desplegar. El WebSocket usa la misma dirección con `wss://`.
3. En *Rewrites and redirects* agrega una regla para que las rutas del SPA funcionen al recargar:
   - Origen: `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>`
   - Destino: `/index.html` · Tipo: `200 (Rewrite)`
4. En el backend, la URL que asigna Amplify (por ejemplo `https://main.d1a2b3c4.amplifyapp.com`, sin barra final) va en `CORS_ALLOWED_ORIGINS` y en `FRONTEND_URL`.

El backend debe estar en HTTPS: el navegador bloquea las llamadas desde una página `https://` a una API `http://`.

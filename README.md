# EduQuest Web

Frontend web de **EduQuest**, una plataforma colaborativa para estudiantes universitarios que reúne una biblioteca de apuntes por curso, grupos de estudio con chat y sala de voz, asesorías entre compañeros, un foro de preguntas y un planificador de estudio. Consume exclusivamente la API REST de [eduquest-backend](https://github.com/Juan-Hello-World/eduquest-backend).

**Curso:** CS2031 Desarrollo Basado en Plataformas · Proyecto 2

| Integrante | Código |
|---|---|
| Juan Pablo Saavedra Ruiz | 202510537 |
| Piero Alejandro Ortega Capacute | 202510580 |
| Omar Alonzo Guzmán Harvey | 202510519 |
| Edson Yenen Falcon Jimenez | 202510492 |

| Entorno | URL |
|---|---|
| Web (AWS Amplify) | https://main.d2uujuj0mby859.amplifyapp.com |
| API (AWS EC2 + RDS + S3) | https://3-222-104-57.sslip.io/api/v1 |

---

## Índice

1. [Tecnologías](#tecnologías)
2. [Estructura del proyecto](#estructura-del-proyecto)
3. [Páginas](#páginas)
4. [Roles y permisos](#roles-y-permisos)
5. [Arquitectura](#arquitectura)
6. [Instalación y ejecución local](#instalación-y-ejecución-local)
7. [Deployment](#deployment)

---

## Tecnologías

| Área | Tecnología |
|---|---|
| Lenguaje | TypeScript |
| Framework | React 19 con Vite 8 |
| Estilos | Tailwind CSS 4 (`@tailwindcss/vite`), tema nocturno y modo claro |
| Ruteo | React Router 7 (rutas anidadas, protegidas y con carga diferida) |
| Cliente HTTP | Axios con instancia centralizada e interceptores |
| Tiempo real | WebSocket nativo contra `/ws` del backend |
| Formularios | React Hook Form con validación en tiempo real |
| Notificaciones en pantalla | React Hot Toast |
| Iconos | Lucide React |
| Calidad de código | Oxlint y TypeScript en modo estricto |
| Deployment | AWS Amplify (`amplify.yml`) |

## Estructura del proyecto

```
eduquest-frontend/
├── amplify.yml                Compilación en AWS Amplify
├── .env.example               Variables de entorno de ejemplo
└── src/
    ├── main.tsx               Punto de entrada
    ├── App.tsx                Providers globales y enrutador
    ├── index.css              Tailwind, tokens del tema y animaciones
    ├── routes/                AppRoutes: rutas centralizadas, lazy loading, rutas privadas y 404
    ├── pages/                 Vistas (contenedores que obtienen datos con hooks)
    ├── components/            Componentes de presentación, agrupados por dominio
    │   ├── common/            Modal, ConfirmModal, PaginationBar, Breadcrumbs, ErrorBoundary,
    │   │                      Skeleton, EmptyState, StarRating, UserAvatar…
    │   ├── layout/            AppShell, SideNav, ServerRail, PrivateRoute, PublicOnlyRoute,
    │   │                      NotificationBell, GlobalSearch, ThemeToggle, OfflineBanner…
    │   ├── auth/              Verificación de correo y apelaciones
    │   ├── brand/             Lumi, la mascota de EduQuest
    │   ├── landing/           Maquetas de la página de inicio
    │   ├── documents/         Biblioteca, vista previa y material de estudio
    │   ├── groups/            Detalle, sesiones, integrantes y apariencia del grupo
    │   ├── chat/              Canales, mensajes, encuestas, stickers y sala de estudio
    │   ├── messages/          Mensajes directos y chats grupales
    │   ├── forum/             Preguntas y respuestas
    │   ├── plans/             Planificador de estudio
    │   ├── achievements/      Puntos, insignias y ranking
    │   ├── profile/           Perfil y foto de perfil
    │   ├── dashboard/         Resumen del inicio
    │   ├── admin/             Moderación y administración
    │   └── reports/           Reporte de materiales y usuarios
    ├── contexts/              AuthContext, ThemeContext, MyGroupsContext,
    │                          SavedDocumentsContext y NotificationsContext
    ├── hooks/                 Custom hooks de datos y UI (useFetch, usePaginatedFetch, usePageParams,
    │                          useDocuments, useGroups, useGroupChat, useRealtime, useDebounce…)
    ├── services/              axiosInstance.ts, realtime.ts y un servicio por recurso de la API
    ├── types/                 Interfaces de los DTOs del backend
    └── utils/                 Errores, formularios, roles, fechas, calendario, vista previa de
                               archivos, fórmulas, texto enriquecido y almacenamiento del token
```

## Páginas

### Públicas

| Ruta | Página |
|---|---|
| `/` | Página de inicio: presenta la plataforma con maquetas de sus funciones y accesos para crear cuenta o iniciar sesión. Si ya hay sesión, redirige al dashboard |
| `/login` | Inicio de sesión |
| `/register` | Registro, con opción de marcarse como asesor |
| `/forgot-password`, `/reset-password` | Recuperación de contraseña con el código de 6 dígitos enviado al correo |
| `/banned` | Aviso para cuentas vetadas o suspendidas, con el motivo, la fecha de fin y el formulario de apelación |
| `*` | Página 404 |

### Usuario autenticado

| Ruta | Página |
|---|---|
| `/dashboard` | Inicio personal: actividad en vivo de tus grupos (salas de voz, salas de estudio y asesorías en curso), materiales destacados, lo recién subido y el top de la semana |
| `/documents` | Biblioteca: búsqueda, filtros por etiqueta, curso y universidad, orden y paginación; vista previa de PDF, Office, Drive, YouTube e imágenes; subir archivos o enlaces; reseñas; guardados; quiz y flashcards del material |
| `/groups` | Mis grupos ordenados por actividad y explorador de grupos públicos o por código |
| `/groups/:groupId` | Espacio del grupo: canales de texto, sala de voz, sala de estudio con Pomodoro compartido, materiales, asesorías e integrantes |
| `/invite/:code` | Invitación a un grupo |
| `/messages`, `/messages/:userId` | Mensajes directos |
| `/messages/rooms/:roomId` | Chats grupales de 3 a 10 personas |
| `/saved` | Mensajes guardados, con salto al mensaje original |
| `/forum`, `/forum/:questionId` | Foro por curso: preguntas, respuestas, votos y mejor respuesta, actualizado en tiempo real |
| `/study-planner` | Planes de estudio por curso o por ciclo, con checklist y barra de progreso |
| `/calendar` | Calendario con las asesorías de todos los grupos y exportación a Google Calendar (`.ics`) |
| `/achievements` | Puntos, insignias, ranking semanal e histórico y tabla de puntos |
| `/profile` | Nombre de usuario, foto, contraseña, perfil de asesor y tema |
| `/users/:userId` | Perfil público: puntos, insignias, materiales y botón para seguir |

Desde cualquier página autenticada están disponibles la búsqueda global (`Ctrl+K`), la campana de notificaciones, el estado personal y el cambio de tema.

### Administración

| Ruta | Página | Acceso |
|---|---|---|
| `/admin/overview` | Estadísticas de usuarios, materiales, grupos, asesorías y reportes | Administrador y gestor |
| `/admin/users` | Gestión de usuarios: advertencias, suspensiones, vetos y roles | Administrador y gestor |
| `/admin/reports` | Bandeja de reportes de materiales y usuarios | Administrador y gestor |
| `/admin/appeals` | Apelaciones de cuentas suspendidas | Administrador y gestor |
| `/admin/announcements` | Avisos a toda la comunidad o a un usuario | Administrador |

## Roles y permisos

### Roles de la plataforma

| Acción | Estudiante | Gestor | Administrador |
|---|:---:|:---:|:---:|
| Biblioteca, grupos, chat, foro, planes y perfil | ✓ | ✓ | ✓ |
| Reportar materiales y usuarios | ✓ | ✓ | ✓ |
| Ver estadísticas, reportes y apelaciones | | ✓ | ✓ |
| Advertir y suspender estudiantes (1, 3 o 7 días) | | ✓ | ✓ |
| Eliminar materiales reportados | | ✓ | ✓ |
| Suspender gestores y vetar de forma permanente | | | ✓ |
| Cambiar roles | | | ✓ |
| Enviar avisos a la comunidad | | | ✓ |

El rol llega en el JWT y se guarda en `AuthContext`. `PrivateRoute` bloquea las rutas sin sesión y, con `requireUserManagement`, las de administración. El menú solo muestra las secciones permitidas, y el backend vuelve a validar cada permiso.

### Roles dentro de un grupo

| Acción | Integrante | Moderador | Creador |
|---|:---:|:---:|:---:|
| Escribir, subir material, agendar y asistir a asesorías | ✓ | ✓ | ✓ |
| Crear, editar y borrar canales; fijar mensajes | | ✓ | ✓ |
| Configurar canales de anuncios, modo lento y palabras prohibidas | | ✓ | ✓ |
| Editar la foto, la portada y el color del grupo | | ✓ | ✓ |
| Quitar integrantes (los moderadores no pueden quitar al creador ni a otros moderadores) | | ✓ | ✓ |
| Nombrar moderadores, editar los datos y eliminar el grupo | | | ✓ |

## Arquitectura

```
Página (pages/)  ──▶  Custom hook (hooks/)  ──▶  Servicio (services/)  ──▶  axiosInstance  ──▶  API REST
      │                      │                                                   │
      ▼                      ▼                                                   ▼
Componentes            Context (sesión, tema,                          Interceptores: JWT, refresh,
(components/)          grupos, guardados)                              reintentos y cuenta vetada
```

- **Cliente HTTP:** `axios.create` con `baseURL` y cabeceras por defecto. Los interceptores agregan el JWT, renuevan el token con el refresh token (con una cola para las peticiones que esperan), reintentan las lecturas ante fallos de red o respuestas 502, 503 y 504, y redirigen a `/banned` si la cuenta fue vetada.
- **Cancelación:** las vistas cancelan sus peticiones con `AbortController` al desmontarse.
- **Sesión:** el token vive en memoria y en `sessionStorage`, por lo que se borra al cerrar el navegador.
- **Tiempo real:** `services/realtime.ts` mantiene una conexión WebSocket con el backend para el chat, los mensajes directos, la presencia y el foro. Si la conexión cae, los hooks vuelven a consultar cada 4 segundos hasta reconectar.
- **Manejo de errores:** `utils/errors.ts` traduce 400, 401, 403, 404, 409, 413 y 5xx a mensajes claros, y los errores de validación del backend se muestran junto a cada campo. Hay un `ErrorBoundary` general y otro por página que se reinicia al cambiar de ruta, estados de error con reintento, aviso sin conexión, skeletons de carga y toasts de éxito.
- **Formularios:** validación en tiempo real con React Hook Form, botones deshabilitados mientras se envía y confirmación antes de cualquier acción destructiva.
- **Paginación:** biblioteca, grupos, foro, usuarios, reportes y apelaciones usan los endpoints paginados del backend, con 10, 25, 50 o 100 elementos por página; la página y el tamaño quedan en la URL.
- **Búsqueda:** debounce en la biblioteca, los grupos y el foro.
- **Archivos:** los archivos subidos se sirven desde S3 a través del backend. La vista previa los descarga con `fetch` y los muestra desde una copia local (`blob:`).
- **Rendimiento:** cada página se carga bajo demanda con `React.lazy` y `Suspense`.
- **Diseño responsivo:** la interfaz se adapta a celular, tablet y escritorio; en pantallas de 1536 px o más la página de inicio se escala en proporción.

## Instalación y ejecución local

Requisitos: Node.js 20 o superior y el backend en ejecución.

```bash
git clone https://github.com/Juan-Hello-World/eduquest-frontend.git
cd eduquest-frontend
npm install
cp .env.example .env        # en Windows: copy .env.example .env
npm run dev                 # http://localhost:5173
```

### Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_BASE_URL` | URL base de la API; el WebSocket usa la misma dirección | `http://localhost:8080/api/v1` |

### Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Revisión de tipos y compilación de producción en `dist/` |
| `npm run preview` | Sirve la compilación de producción en local |
| `npm run lint` | Análisis estático con Oxlint |

## Deployment

La web está publicada en **AWS Amplify**: https://main.d2uujuj0mby859.amplifyapp.com

```
GitHub (rama main) ──push──▶ AWS Amplify ──build──▶ CDN con HTTPS
                                                      │
                                                      ▼ HTTPS / WSS
                                     API en EC2 (Docker + Caddy) ──▶ RDS PostgreSQL
                                                                 └─▶ S3 (archivos)
```

| Configuración | Valor |
|---|---|
| Repositorio conectado | Fork `AlonsoGH2306/eduquest-frontend`, rama `main`, sincronizado con este repositorio; cada push dispara una compilación |
| Compilación | `amplify.yml`: Node 22, `npm ci`, `npm run build`, publica `dist/` |
| Variable de entorno | `VITE_API_BASE_URL=https://3-222-104-57.sslip.io/api/v1` |
| Reescritura para la SPA | Origen `</^[^.]+$\|\.(?!(css\|gif\|ico\|jpg\|js\|png\|txt\|svg\|woff\|woff2\|ttf\|map\|json\|webp)$)([^.]+$)/>` → destino `/index.html`, tipo `200 (Rewrite)` |
| CORS en el backend | `CORS_ALLOWED_ORIGINS` y `FRONTEND_URL` con la URL de Amplify |

### Desplegar en otra cuenta

1. En AWS Amplify, crear una aplicación nueva y conectar el repositorio de GitHub con la rama `main`. Amplify detecta `amplify.yml`.
2. Agregar la variable `VITE_API_BASE_URL` con la URL HTTPS de la API. Vite la incluye al compilar, por lo que cualquier cambio requiere un nuevo despliegue.
3. Agregar la regla de reescritura de la tabla para que las rutas funcionen al recargar la página.
4. Registrar la URL asignada por Amplify, sin barra final, en `CORS_ALLOWED_ORIGINS` y `FRONTEND_URL` del backend.

La API debe servirse por HTTPS: el navegador bloquea las llamadas de una página `https://` a una API `http://`.

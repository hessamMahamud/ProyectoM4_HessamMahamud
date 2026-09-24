# TaskCoach — Gestor Estratégico de Tareas

SPA de gestión de tareas y hábitos con autenticación de usuarios, persistencia en tiempo real en la nube y envío de resúmenes por email.

- **Demo en producción:** https://proyecto-m4-hessam-mahamud.vercel.app

![task](src/assets/img/Screenshot%20From%202026-09-24%2010-21-30.png)

![habits](src/assets/img/Screenshot%20From%202026-09-24%2010-21-38.png)

![stats](src/assets/img/Screenshot%20From%202026-09-24%2010-21-42.png)

![profile](src/assets/img/Screenshot%20From%202026-09-24%2010-21-46.png)

## Tecnologías

- **React** + **TypeScript** + **Vite**
- **React Router** para navegación con rutas protegidas
- **Firebase** (Authentication + Firestore) como backend
- **AWS SES** para envío de emails, vía Vercel Serverless Function
- **Vitest** + **React Testing Library** para pruebas
- CSS modular por componente, mobile-first, con variables centralizadas
- Desplegado en **Vercel**

## Funcionalidades

- Registro y login con email/contraseña o con Google (Firebase Auth)
- Navegación por URL (`/task`, `/habits`, `/stats`, `/profile`) con rutas protegidas (`SecureRoute`) que redirigen a login si no hay sesión
- CRUD completo de tareas: crear, listar, editar, eliminar, marcar como completada
- CRUD completo de hábitos, separados en "para construir" y "para dejar"
- Persistencia en Firestore filtrada por `userId` en ambas colecciones (`tasks`, `habits`) — cada usuario ve únicamente sus propios datos
- Sincronización en tiempo real de la UI (`onSnapshot`)
- Reglas de seguridad de Firestore que deniegan todo por defecto y solo permiten acceso al dueño de cada documento
- Envío de resumen de tareas por email (AWS SES) desde una función serverless; las credenciales de AWS nunca llegan al frontend
- Diseño responsive mobile-first, con layout de escritorio (sidebar + grid de 2 columnas) a partir de 768px y breakpoint intermedio para tablets

## Arquitectura

```
src/
├── components/
│   ├── icons/          # Íconos que no existen en lucide-react
│   ├── shell/          # Header, DesktopSidebar, BottomNav, Modal
│   ├── LoginForm.tsx / TaskForm.tsx / TaskList.tsx
├── features/
│   ├── auth/            # Context de autenticación (Authenticator + useAuth)
│   ├── today/            # Vista principal de tareas del día
│   ├── stats/            # Vista de progreso
│   ├── habits/            # Vista de hábitos
│   └── profile/           # Vista de perfil
├── hooks/
│   ├── useTasks.ts       # Lógica de Firestore para tareas (CRUD + suscripción)
│   ├── useHabits.ts      # Lógica de Firestore para hábitos (CRUD + suscripción)
│   └── useFirestoreCollection.ts   # Lógica compartida entre ambos hooks
├── routes/
│   ├── AppRoutes.tsx     # Definición de rutas
│   └── SecureRoute.tsx   # Wrapper que protege rutas según el estado de auth
├── services/
│   └── firebase.ts      # Inicialización única de Firebase
└── App.tsx              # Orquesta auth, rutas y layout general

api/
└── send-task-summary.ts   # Función serverless: valida payload y envía email vía AWS SES
```

- **Context API para autenticación**: cualquier componente puede consultar el estado de sesión sin acoplarse a `App`.
- **`useFirestoreCollection`**: lógica de suscripción/CRUD común extraída de `useTasks` y `useHabits`, que comparten el mismo patrón (colección propia filtrada por `userId`).
- **`SecureRoute`**: centraliza la protección de rutas en un solo componente en vez de repetir el chequeo de sesión en cada página.
- **Estado de auth como unión (`mode: 'login' | 'register'`)** en vez de dos booleanos independientes, para evitar estados inconsistentes.
- **Credenciales de AWS solo en el backend** (variables de entorno de Vercel sin prefijo `VITE_`), a diferencia de las de Firebase, que sí viajan al navegador por diseño y se protegen con Firestore Security Rules.

## Variables de entorno

Ver `.env.example`.

| Variable | Descripción |
|---|---|
| `VITE_FIREBASE_*` (7 variables) | Configuración pública de Firebase, expuesta al navegador por diseño |
| `AWS_ACCESS_KEY_ID` | Credencial de AWS, solo en backend |
| `AWS_SECRET_ACCESS_KEY` | Credencial de AWS, solo en backend |
| `AWS_REGION` | Región de AWS SES |
| `AWS_SES_FROM_EMAIL` | Email verificado remitente en SES |

## Firestore Security Rules

`firestore.rules` deniega todo por defecto y solo permite leer/crear/editar/borrar un documento en `tasks` o `habits` si `resource.data.userId == request.auth.uid`.

```bash
firebase deploy --only firestore:rules
```

## Instalación y uso local

```bash
git clone https://github.com/hessamMahamud/ProyectoM4_HessamMahamud.git
cd taskcoach
npm install
cp .env.example .env   # completar variables de Firebase y AWS
npm run dev
```

## Scripts npm

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Levanta el servidor de desarrollo (Vite) |
| `npm run build` | Genera el build de producción |
| `npm run test` | Ejecuta los tests con Vitest |

## Testing

20 tests con Vitest + React Testing Library en 5 archivos, cubriendo formularios, listas, el hook de hábitos y la función serverless:

- **`TaskForm.test.tsx`** (4) — validación de título vacío, envío correcto con trim, manejo de error si `addDoc` rechaza.
- **`TaskList.test.tsx`** (5) — render por props, checkbox, eliminación, filtros y estado vacío.
- **`LoginForm.test.tsx`** (4) — alternancia login/registro, error de `signIn`, `signUp` en modo registro, login con Google.
- **`HabitsPage.test.tsx`** — CRUD de hábitos.
- **`send-task-summary.test.ts`** (4) — rechazo de métodos y payloads inválidos, envío correcto (200), error 500 ante fallo de SES.

```bash
npm run test
```

## Despliegue

Desplegado en [Vercel](https://vercel.com). La función serverless (`api/send-task-summary.ts`) corre como Vercel Function; las variables de entorno de Firebase y AWS se configuran en el panel del proyecto.

## Uso de Inteligencia Artificial

- **Agente de Antigravity IDE** (requisito del módulo): generó el Context de autenticación, componentes de formularios y listas, hooks de Firestore, la función serverless de AWS SES, las reglas de Firestore, la migración a React Router y los estilos, a partir de prompts específicos.
- **Claude**: apoyo conceptual antes de escribir código, redacción de los prompts dirigidos al agente, y auditoría de cada entrega antes de aceptarla en el proyecto.

Detalle completo de los prompts usados, en orden y con el contexto de qué resolvía cada uno, en [`prompts-used.md`](src/assets/docs/prompts-used.md).

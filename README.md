# TaskCoach — Gestor Estratégico de Tareas

SPA de gestión de tareas con autenticación de usuarios, persistencia en la nube y envío de resúmenes por email. Proyecto Integrador Módulo 4 — Henry (Full Stack Web Development).

**Demo en producción:** https://proyecto-m4-hessam-mahamud.vercel.app

---

## Stack tecnológico

- **Frontend:** React + TypeScript + Vite
- **Navegación:** React Router (`/task`, `/habits`, `/stats` y `/profile`), con rutas protegidas
- **Backend as a Service:** Firebase (Authentication + Firestore)
- **Notificaciones:** AWS SES, vía Vercel Serverless Function
- **Deploy:** Vercel
- **Estilos:** CSS modular por componente, mobile-first, con variables CSS centralizadas (sistema de diseño propio)

## Funcionalidades

- Registro y login con email/contraseña y con Google (Firebase Auth)
- Logout
- Navegación por URL con React Router (`/task`, `/habits`, `/stats`, `/profile`), con rutas protegidas (`SecureRoute`) que redirigen a login si no hay sesión
- CRUD completo de tareas (crear, listar, editar, eliminar, marcar como completada)
- CRUD completo de hábitos (crear, marcar cumplido, editar, eliminar), separados en "para construir" y "para dejar"
- Persistencia en Firestore, filtrada por `userId` en ambas colecciones (`tasks` y `habits`) — cada usuario solo ve sus propios datos
- Sincronización en tiempo real de la UI (`onSnapshot`)
- Reglas de seguridad de Firestore (`firestore.rules`) que bloquean por defecto y solo permiten acceso al dueño de cada documento, en ambas colecciones
- Envío de resumen de tareas por email (AWS SES), disparado desde una función serverless de Vercel — las credenciales de AWS nunca tocan el frontend
- Diseño responsive mobile-first, con layout adaptado a escritorio (sidebar + grid de 2 columnas) a partir de 768px, con un breakpoint intermedio para tablets

## Arquitectura

```
src/
├── components/
│   ├── icons/          # Íconos que no existen en lucide-react (ej: GoogleIcon, logo de marca)
│   ├── shell/          # Header, DesktopSidebar, BottomNav, Modal — el "cascarón" de la app
│   ├── LoginForm.tsx / TaskForm.tsx / TaskList.tsx   # Componentes de presentación
├── features/
│   ├── auth/            # Context de autenticación (Authenticator + hook useAuth)
│   ├── today/            # Vista principal de tareas del día
│   ├── stats/            # Vista de progreso
│   ├── habits/            # Vista de hábitos
│   └── profile/           # Vista de perfil
├── hooks/
│   ├── useTasks.ts       # Lógica de Firestore para tareas (CRUD + suscripción)
│   ├── useHabits.ts      # Lógica de Firestore para hábitos (CRUD + suscripción)
│   └── useFirestoreCollection.ts   # Lógica compartida entre ambos hooks
├── routes/
│   ├── AppRoutes.tsx     # Definición de rutas con React Router
│   └── SecureRoute.tsx   # Wrapper que protege rutas según el estado de auth
├── services/
│   └── firebase.ts      # Inicialización única de Firebase (single source of truth)
└── App.tsx              # Orquesta auth, rutas y layout general

api/
└── send-task-summary.ts   # Función serverless: valida payload y envía email vía AWS SES
```

### Decisiones de arquitectura y por qué

- **Context API para autenticación** (`Authenticator` + `useAuth`) en vez de pasar `user` por props manualmente por todo el árbol — cualquier componente puede preguntar "¿quién está logueado?" sin acoplarse a `App`.
- **Hooks `useTasks`/`useHabits` centralizados**: la suscripción a Firestore vivía originalmente dentro de `TaskList`, pero al necesitar el array completo de tareas también en `App` (para el resumen por email), se extrajo a un hook para evitar tener el mismo dato duplicado en dos componentes. Al agregar hábitos con el mismo patrón exacto (colección propia, filtrada por `userId`, mismas operaciones CRUD), se extrajo la lógica común a `useFirestoreCollection` en vez de duplicarla entre los dos hooks.
- **Migración de protección condicional a React Router**: la primera versión protegía la única vista existente con un simple `if (!user) return <LoginForm />` dentro de `App`, sin URLs distintas por pestaña. Funcionaba, pero no era coherente con dos cosas explícitas de este proyecto: la consigna pide como objetivo *"implementar navegación en aplicaciones SPA"*, y la prioridad fijada desde el inicio era prolijidad ante todo. Se migró a `react-router` con rutas reales (`/task`, `/habits`, `/stats`, `/profile`) y un componente `SecureRoute` que centraliza la lógica de redirección, en vez de repetir el chequeo de `user` en cada página.
- **Un solo `AuthForm`/`LoginForm` con estado `mode: 'login' | 'register'`**, no dos componentes separados ni dos booleanos independientes — un solo valor de tipo unión hace imposible representar un estado inconsistente ("login y registro a la vez").
- **CSS modular por componente con variables en `:root`**, no estilos inline — los estilos inline no soportan media queries, lo cual habría roto el enfoque mobile-first en los componentes de tareas.
- **`AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` solo en el backend** (variables de entorno de Vercel, nunca con prefijo `VITE_`) — a diferencia de las credenciales de Firebase (que sí viajan al navegador por diseño, protegidas por Firestore Security Rules en vez de por secreto).

## Variables de entorno

Ver `.env.example`. Se requieren 7 variables `VITE_FIREBASE_*` (públicas, expuestas al navegador por diseño de Firebase) y 4 variables de AWS (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_SES_FROM_EMAIL`), estas últimas privadas y usadas solo por la función serverless.

## Firestore Security Rules

Las reglas en `firestore.rules` deniegan todo por defecto y solo permiten leer/crear/editar/borrar un documento (en las colecciones `tasks` y `habits`) si `resource.data.userId == request.auth.uid`. Se despliegan con:

```
firebase deploy --only firestore:rules
```

## Testing

20 tests con Vitest + React Testing Library, en 5 archivos, cubriendo formularios, listas, el hook de hábitos y la función serverless:

- **`TaskForm.test.tsx`** (4 tests) — no envía el formulario con título vacío/solo espacios, envía los datos correctos (con trim) cuando el título es válido, y muestra el mensaje de error si `addDoc` rechaza la promesa. Mockea `firebase/firestore` y `useAuth`.
- **`TaskList.test.tsx`** (5 tests) — renderiza tareas recibidas por props, notifica la tarea correcta al marcar el checkbox, elimina con el id correcto, filtra pendientes/completadas, y muestra el estado vacío cuando el filtro no tiene resultados. Al ser un componente presentacional, no requiere mocks de Firestore.
- **`LoginForm.test.tsx`** (4 tests) — alterna entre modo login/registro, muestra error si `signIn` rechaza la promesa, llama a `signUp` (no a `signIn`) en modo registro, y llama a `signInWithGoogle` al continuar con Google. Mockea el hook `useAuth`.
- **`HabitsPage.test.tsx`** — cobertura del CRUD de hábitos (crear, marcar cumplido, eliminar), mockeando Firestore igual que en `TaskForm`/`TaskList`.
- **`send-task-summary.test.ts`** (4 tests) — rechaza métodos distintos a POST (405), rechaza payloads inválidos (400, incluyendo email mal formado y `tasks` que no es un array), envía el email correctamente con payload válido (200), y devuelve 500 cuando AWS SES rechaza el envío (simulando el error real de producción encontrado durante el desarrollo). Mockea `@aws-sdk/client-ses`.

```
npm run test
```

Ver [prompts-used.md](src/assets/docs/prompts-used.md) para los prompts usados en la configuración y escritura de estos tests.

## Uso de IA en el desarrollo

Este proyecto se construyó con dos asistentes de IA cumpliendo roles distintos y complementarios, no intercambiables:

**El agente de Antigravity IDE** (requisito de este módulo) generó la mayoría del código fuente: el Context de autenticación, los componentes de formularios y listas, los hooks de Firestore, la función serverless de AWS SES, las reglas de Firestore, la migración a React Router y los estilos. Trabajó a partir de prompts específicos, no de instrucciones vagas tipo "hazme un login".

**Claude** funcionó como mi asistente de código de cabecera durante todo el proyecto: el que explicaba primero el *qué* y el *por qué* de cada concepto (hooks, Context API, verbatimModuleSyntax, arquitectura mobile-first) antes de tocar código. Redacté (con apoyo de Claude para afinar la redacción técnica) cada prompt que dirigí al agente de Antigravity, y revisé con Claude cada entrega antes de aceptarla en el proyecto — el listado completo de esos prompts, en orden y con el contexto de qué resolvía cada uno, está en [prompts-used.md](src/assets/docs/prompts-used.md).

Ejemplos concretos de bugs reales que esa revisión detectó antes de que llegaran a producción:

- Imports mezclando tipos y valores sin marcar `import type`, que rompían la compilación bajo `verbatimModuleSyntax`.
- Una regla de `update` en `firestore.rules` que validaba el dueño de la tarea pero no el tipo de los campos editados (hueco de integridad de datos).
- Un primer diseño de estado con varios `useState` booleanos independientes (`login`/`register`) que permitía representar un estado imposible ("los dos modos activos a la vez"); se corrigió a un solo estado de tipo unión.
- Estilos inline que, aunque visualmente correctos, no podían responder a media queries — hubieran roto el diseño mobile-first en escritorio silenciosamente.
- Dos botones de logout duplicados que, de eliminarse mal, habrían dejado a los usuarios de mobile sin forma de cerrar sesión.
- Un bug de consistencia visual donde el color de una tarjeta de tarea dependía de su posición en la lista en vez de una propiedad estable de la tarea, causando que el color de una tarea cambiara al crear tareas nuevas sin razón.
- Un bug real en un breakpoint de tablet donde `font-size: 0` en un contenedor padre no ocultaba el texto de los `<span>` hijos (que tenían su propio `font-size` explícito), causando superposición visual — corregido con `display: none` explícito por elemento.
- Dos bugs de producción reales con AWS SES, diagnosticados leyendo logs del servidor en vivo: un `SignatureDoesNotMatch` (credenciales mal pegadas en las variables de entorno de Vercel) y un `MessageRejected` (email destinatario no verificado en modo sandbox de SES).
- Una decisión de arquitectura corregida a mitad de proyecto: se identificó que proteger la app con un `if (!user)` condicional en vez de rutas reales de React Router no era coherente con el objetivo explícito de la consigna de implementar navegación SPA, y se migró antes de la entrega.

En ningún caso acepté código del agente sin entender qué hacía cada parte — cuando algo no me quedaba claro (por ejemplo, el operador `!` de TypeScript, el patrón `onAuthStateChanged` frente a una función síncrona, o por qué separar estado en el componente más bajo posible), pedí la explicación conceptual antes de seguir escribiendo o aceptando código nuevo.

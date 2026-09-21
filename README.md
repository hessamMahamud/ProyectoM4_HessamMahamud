# TaskCoach — Gestor Estratégico de Tareas

SPA de gestión de tareas con autenticación de usuarios, persistencia en la nube y envío de resúmenes por email. Proyecto Integrador Módulo 4 — Henry (Full Stack Web Development).

**Demo en producción:** https://proyecto-m4-hessam-mahamud.vercel.app

---

## Stack tecnológico

- **Frontend:** React + TypeScript + Vite
- **Backend as a Service:** Firebase (Authentication + Firestore)
- **Notificaciones:** AWS SES, vía Vercel Serverless Function
- **Deploy:** Vercel
- **Estilos:** CSS modular por componente, mobile-first, con variables CSS centralizadas (sistema de diseño propio)

## Funcionalidades

- Registro y login con email/contraseña y con Google (Firebase Auth)
- Logout
- CRUD completo de tareas (crear, listar, editar, eliminar, marcar como completada)
- Persistencia en Firestore, filtrada por `userId` — cada usuario solo ve sus propias tareas
- Sincronización en tiempo real de la UI (`onSnapshot`)
- Reglas de seguridad de Firestore (`firestore.rules`) que bloquean por defecto y solo permiten acceso al dueño de cada tarea
- Envío de resumen de tareas por email (AWS SES), disparado desde una función serverless de Vercel — las credenciales de AWS nunca tocan el frontend
- Diseño responsive mobile-first, con layout adaptado a escritorio (sidebar + grid de 2 columnas) a partir de 768px

## Arquitectura

```
src/
├── components/       # Componentes de presentación (LoginForm, TaskForm, TaskList)
├── features/
│   ├── auth/          # Context de autenticación (Authenticator + hook useAuth)
│   ├── today/          # Vista principal de tareas del día
│   ├── stats/          # Vista de progreso
│   ├── habits/          # Vista de hábitos
│   └── profile/         # Vista de perfil
├── hooks/
│   └── useTasks.ts    # Toda la lógica de Firestore para tareas (CRUD + suscripción)
├── services/
│   └── firebase.ts    # Inicialización única de Firebase (single source of truth)
└── App.tsx            # Orquesta auth, tabs y layout general

api/
└── send-task-summary.ts   # Función serverless: valida payload y envía email vía AWS SES
```

### Decisiones de arquitectura y por qué

- **Context API para autenticación** (`Authenticator` + `useAuth`) en vez de pasar `user` por props manualmente por todo el árbol — cualquier componente puede preguntar "¿quién está logueado?" sin acoplarse a `App`.
- **Hook `useTasks` centralizado**: la suscripción a Firestore vivía originalmente dentro de `TaskList`, pero al necesitar el array completo de tareas también en `App` (para el resumen por email), se extrajo a un hook para evitar tener el mismo dato duplicado en dos componentes. `TaskList` quedó puramente presentacional (recibe todo por props).
- **Un solo `AuthForm`/`LoginForm` con estado `mode: 'login' | 'register'`**, no dos componentes separados ni dos booleanos independientes — un solo valor de tipo unión hace imposible representar un estado inconsistente ("login y registro a la vez").
- **CSS modular por componente con variables en `:root`**, no estilos inline — los estilos inline no soportan media queries, lo cual habría roto el enfoque mobile-first en los componentes de tareas.
- **`AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` solo en el backend** (variables de entorno de Vercel, nunca con prefijo `VITE_`) — a diferencia de las credenciales de Firebase (que sí viajan al navegador por diseño, protegidas por Firestore Security Rules en vez de por secreto).

## Variables de entorno

Ver `.env.example`. Se requieren 7 variables `VITE_FIREBASE_*` (públicas, expuestas al navegador por diseño de Firebase) y 4 variables de AWS (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_SES_FROM_EMAIL`), estas últimas privadas y usadas solo por la función serverless.

## Firestore Security Rules

Las reglas en `firestore.rules` deniegan todo por defecto y solo permiten leer/crear/editar/borrar una tarea si `resource.data.userId == request.auth.uid`. Se despliegan con:

```
firebase deploy --only firestore:rules
```

## Testing

*(Sección en progreso — pendiente al momento de este README)*

## Uso de IA en el desarrollo

Este proyecto se construyó con dos asistentes de IA cumpliendo roles distintos y complementarios, no intercambiables:

**El agente de Antigravity IDE** (requisito de este módulo) generó la mayoría del código fuente: el Context de autenticación, los componentes de formularios y listas, el hook `useTasks`, la función serverless de AWS SES, las reglas de Firestore y los estilos. Trabajó a partir de prompts específicos, no de instrucciones vagas tipo "hazme un login".

**Claude** funcionó como mi asistente de código de cabecera durante todo el proyecto: el que explicaba primero el *qué* y el *por qué* de cada concepto (hooks, Context API, verbatimModuleSyntax, arquitectura mobile-first) antes de tocar código. Redacté (con apoyo de Claude para afinar la redacción técnica) cada prompt que dirigí al agente de Antigravity, y revisé con Claude cada entrega antes de aceptarla en el proyecto — el listado completo de esos prompts, en orden y con el contexto de qué resolvía cada uno, está en [Prompts used](./src/assets/docs/prompts-used.md)

Ejemplos concretos de bugs reales que esa revisión detectó antes de que llegaran a producción:

- Imports mezclando tipos y valores sin marcar `import type`, que rompían la compilación bajo `verbatimModuleSyntax`.
- Una regla de `update` en `firestore.rules` que validaba el dueño de la tarea pero no el tipo de los campos editados (hueco de integridad de datos).
- Un primer diseño de estado con varios `useState` booleanos independientes (`login`/`register`) que permitía representar un estado imposible ("los dos modos activos a la vez"); se corrigió a un solo estado de tipo unión.
- Estilos inline que, aunque visualmente correctos, no podían responder a media queries — hubieran roto el diseño mobile-first en escritorio silenciosamente.
- Dos botones de logout duplicados que, de eliminarse mal, habrían dejado a los usuarios de mobile sin forma de cerrar sesión.
- Dos bugs de producción reales con AWS SES, diagnosticados leyendo logs del servidor en vivo: un `SignatureDoesNotMatch` (credenciales mal pegadas en las variables de entorno de Vercel) y un `MessageRejected` (email destinatario no verificado en modo sandbox de SES).

En ningún caso acepté código del agente sin entender qué hacía cada parte — cuando algo no me quedaba claro (por ejemplo, el operador `!` de TypeScript, el patrón `onAuthStateChanged` frente a una función síncrona, o por qué separar estado en el componente más bajo posible), pedí la explicación conceptual antes de seguir escribiendo o aceptando código nuevo.

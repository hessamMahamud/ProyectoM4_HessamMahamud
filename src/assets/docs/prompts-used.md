# Prompts usados con el agente de Antigravity IDE

Este documento recoge, en orden cronológico, los prompts que dirigí al agente de código de Antigravity IDE durante el desarrollo de TaskCoach (Proyecto Integrador M4). Cada uno se acompaña de un breve contexto de qué resolvía. El código generado a partir de cada prompt fue revisado antes de integrarse al proyecto (ver sección "Uso de IA" del README).

---

## 1. Corrección e integración del Context de autenticación

**Contexto:** el agente había generado `Authenticator.tsx` con un patrón de Context API para auth (más completo que la implementación manual inicial), pero con un bug de tipado y sin conectar al resto de la app.

```
Tengo un archivo src/features/auth/Authenticator.tsx que implementa un Context de autenticación con Firebase (signUp, signIn, signInWithGoogle, logout, user, loading). Necesito:

1. Corregir los imports para que cumplan con verbatimModuleSyntax: true (marcar ReactNode, User, UserCredential como `import type`).
2. Envolver el componente <App /> con <Authenticator> en src/main.tsx.
3. Refactorizar src/App.tsx para que use el hook useAuth() del Authenticator en vez de su propia lógica de onAuthStateChanged, mostrando <LoginForm /> si no hay user, o la vista de tareas si lo hay.
4. Refactorizar src/components/LoginForm.tsx para que llame a signIn/signUp/signInWithGoogle desde useAuth() en vez de llamar directo a Firebase.

No agregues librerías nuevas ni cambies la estructura de carpetas existente (components/, services/, features/auth/). Mantén todo en TypeScript estricto.
```

## 2. CRUD de tareas en Firestore

**Contexto:** arrancar la persistencia real de tareas, filtrada por usuario.

```
Necesito crear el CRUD de tareas en Firestore para un usuario autenticado, usando el hook useAuth() ya existente (expone `user`). Requisitos:

1. Colección "tasks" en Firestore, cada documento con: title, description, completed (boolean), userId, createdAt.
2. src/components/TaskForm.tsx: formulario para crear una tarea (title + description), asociada al userId del usuario actual.
3. src/components/TaskList.tsx: lista en tiempo real (onSnapshot) de las tareas del usuario actual (filtradas por userId), cada una con botón de editar, eliminar y marcar como completada.
4. No expongas tareas de otros usuarios: toda query debe filtrar por userId == user.uid.
5. TypeScript estricto, siguiendo la convención de imports type-only que ya usamos (verbatimModuleSyntax).

Muéstrame los archivos completos.
```

## 3. Limpieza de estructura de carpetas

**Contexto:** después de reorganizar `firebase.ts` a `services/`, quedaron archivos y carpetas huérfanas.

```
Necesito limpiar el proyecto antes de seguir. Hazme estos cambios:

1. Elimina la carpeta src/config/ (está vacía, quedó huérfana después de mover firebase.ts a src/services/).
2. Elimina src/assets/react.svg, src/assets/vite.svg y src/assets/hero.png (no se usan en ningún import del proyecto).
3. En src/App.tsx: elimina por completo el estado `count` (useState) y el botón "Count is {count}" — es un resabio del template de Vite que no forma parte de la app real.
4. Verifica que después de estos cambios el proyecto siga compilando sin errores (npm run build) y sin imports rotos.

No cambies ninguna otra lógica del archivo ni de la estructura existente.
```

## 4. Sistema de diseño (mobile-first, inspirado en referencia visual)

**Contexto:** aplicar una identidad visual concreta (paleta, tipografía, formas) extraída de una referencia de diseño, con enfoque mobile-first real.

```
Necesito rediseñar la UI del task manager con un sistema de diseño mobile-first inspirado en apps de productividad tipo "wellness/coach", con esta identidad visual:

PALETA:
- Fondo general: crema claro (#F2ECE4)
- Superficie oscura (tarjetas destacadas): azul petróleo oscuro (#1B3C4A)
- Acento principal: naranja ámbar (#F5A623)
- Tarjetas claras: blanco (#FFFFFF) con sombra suave (box-shadow difusa, sin bordes duros)
- Texto sobre fondo oscuro: blanco / crema
- Texto sobre fondo claro: azul petróleo oscuro

FORMA:
- border-radius grande y consistente (20-24px) en tarjetas, botones e inputs
- Sombras suaves (box-shadow: 0 8px 24px rgba(0,0,0,0.08) aprox.)
- Botones de acción principal en naranja, con texto blanco, forma de píldora (border-radius completo)

TIPOGRAFÍA:
- Usa 'Poppins' o 'Quicksand' desde Google Fonts (import en index.css, no CDN externo si el proyecto no lo permite)
- Títulos: bold, tamaño grande
- Resalta palabras clave dentro de un título con el color de acento naranja (ej. un <span> con ese color)

LAYOUT MOBILE-FIRST (aplica esto a App.tsx / la vista principal de tareas):
- Header: saludo o título de la app + ícono de notificación/perfil a la derecha
- Tarjeta destacada oscura arriba, mostrando progreso del día (ej. "X de Y tareas completadas hoy") con un indicador circular de progreso (puedes usar un <svg> simple con stroke-dasharray, sin librerías nuevas)
- Debajo, la lista/grid de tareas (TaskList ya existente) en formato de tarjetas blancas con sombra
- Barra de navegación inferior fija (position: fixed, bottom: 0) con 3-4 íconos (usa lucide-react si ya está disponible, si no, emojis simples) y un botón central circular naranja elevado (position relative, transform: translateY(-20%) o similar) que abre el TaskForm para crear una tarea nueva

RESPONSIVE:
- Todo el CSS base (sin media query) debe ser el diseño mobile que acabo de describir
- Agrega un @media (min-width: 768px) que convierta el layout en algo tipo dashboard de escritorio: sidebar de navegación en vez de barra inferior, tarjeta de progreso y lista de tareas lado a lado en vez de apiladas

No cambies la lógica de Firebase/Firestore ni las props de TaskForm/TaskList, solo el diseño visual y la estructura de layout. Crea variables CSS en :root (index.css) para los colores, así se reutilizan en todos los componentes.
```

## 5. Modularización de estilos inline a CSS por componente

**Contexto:** `TaskForm.tsx` y `TaskList.tsx` tenían casi todo su estilo como `style={{}}` inline, lo cual impedía usar media queries — un problema real para el enfoque mobile-first, no solo estético.

```
Necesito refactorizar src/components/TaskForm.tsx y src/components/TaskList.tsx para eliminar los estilos inline (style={{...}}) y moverlos a archivos CSS por componente, siguiendo el mismo patrón que ya usa App.tsx con App.css (clases + variables CSS definidas en src/index.css).

1. Crea src/components/TaskForm.css y src/components/TaskList.css.
2. Mueve todos los estilos estáticos actuales de style={{}} a clases en esos archivos (usa las mismas variables CSS de :root que ya existen: --accent, --radius-card, --shadow-soft, etc, no inventes valores nuevos).
3. Deja SOLO como inline lo que depende de un valor calculado en tiempo real (ej: strokeDasharray/strokeDashoffset del SVG si aplica, o alguna medida dinámica). Todo lo demás debe ser className.
4. Para estilos condicionales (ej: el checkbox de una tarea completada vs pendiente, o el estado activo de un botón), usa clases condicionales (className={condicion ? 'clase-a' : 'clase-b'} o template strings), no ternarios dentro de style={{}}.
5. Agrega los @media (min-width: 768px) necesarios en estos nuevos CSS para que TaskForm y TaskList también se adapten correctamente en desktop, coherente con el resto del layout de App.css (columna derecha, tarjetas más anchas, etc).
6. No cambies ninguna lógica de Firebase/Firestore, ni las props, ni la estructura de estado — solo el CSS y los className.

Muéstrame los 4 archivos resultantes: TaskForm.tsx, TaskForm.css, TaskList.tsx, TaskList.css.
```

## 6. Refactor a hook centralizado (`useTasks`) + botón de resumen por email

**Contexto:** evitar tener el array de tareas duplicado entre `TaskList` y `App` una vez que `App` también necesitaba el array completo para armar el email; y agregar la funcionalidad de envío de resumen por email conectada al endpoint de AWS SES ya existente.

```
Necesito refactorizar la gestión de tareas para centralizar el estado y evitar duplicación, y además agregar la funcionalidad de "enviar resumen por email".

1. Crea un hook personalizado src/hooks/useTasks.ts que:
   - Reciba un userId (string | undefined) como argumento.
   - Encapsule toda la lógica de Firestore que hoy vive en TaskList.tsx: la suscripción onSnapshot filtrada por userId, y las funciones toggleCompleted, deleteTask, startEdit/saveEdit/cancelEdit (o su equivalente).
   - Retorne { tasks, loading, error, toggleCompleted, deleteTask, saveEdit, ... } (todo lo que TaskList necesita para funcionar).
   - Tipa todo con la interfaz Task ya existente.

2. Refactoriza src/components/TaskList.tsx para que:
   - YA NO tenga su propia suscripción a Firestore.
   - Reciba tasks, loading, error y las funciones de acción como props (viniendo del hook usado en App).
   - Mantenga toda su lógica de filtro (all/pending/completed) y edición en línea, pero usando lo que recibe por props en vez de estado propio para las tareas.

3. En src/App.tsx:
   - Usa el hook useTasks(user?.uid) directamente.
   - Pasa tasks/loading/error/acciones como props a <TaskList />.
   - Calcula taskStats (total/completadas) a partir de ese mismo `tasks` del hook, sin necesitar ya el callback onTasksChange (elimínalo).
   - Agrega un botón "Enviar resumen por email" (cerca de la tarjeta de progreso, en mobile y en el sidebar de desktop, usando las clases/variables CSS existentes en App.css, sin estilos inline nuevos) que:
     - Al hacer click, haga POST a /api/send-task-summary con { recipient: user.email, tasks: tasks.map(t => ({ title: t.title, description: t.description, completed: t.completed })) }.
     - Maneje estados loading ("Enviando..."), éxito ("Resumen enviado ✓" por 3 segundos) y error (mensaje breve, permite reintentar).
     - Si user.email es null/undefined, muestra un error claro en vez de fallar en silencio.

4. TypeScript estricto, imports type-only según verbatimModuleSyntax, sin romper ninguna funcionalidad existente (login, CRUD, filtros).

Muéstrame los archivos completos: useTasks.ts, TaskList.tsx, App.tsx, y App.css si agregaste clases nuevas.
```

## 7. Limpieza de botones de logout duplicados

**Contexto:** el diseño final tenía logout repetido en 3 lugares (header móvil, sidebar de escritorio, pestaña de perfil); había que evitar dejar mobile sin forma de cerrar sesión al limpiar los duplicados.

```
Necesito limpiar los botones de logout duplicados en la app.

1. En src/App.tsx, el botón de logout dentro del <header className="app-header"> (arriba a la derecha, className="logout-icon-btn") debe quedar visible SOLO en mobile — agrega en App.css una regla dentro del @media (min-width: 768px) que le ponga display: none a .logout-icon-btn, ya que en desktop el logout ya vive en el sidebar (.sidebar-logout-btn).

2. En src/features/profile/ProfilePage.tsx, elimina por completo el botón de logout que tiene esa página (y la prop onLogout si ya no se usa para nada más ahí) — es un duplicado innecesario, ya que el logout se maneja desde el header (mobile) o el sidebar (desktop).

3. No toques el botón sidebar-logout-btn del sidebar de escritorio — ese se queda exactamente como está.

4. Verifica que el proyecto siga compilando sin imports rotos ni props sin usar (npm run build).

Muéstrame los archivos modificados.
```

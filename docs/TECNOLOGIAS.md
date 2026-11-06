# Focus Mind: tecnologías y decisiones de diseño

Explicación de las librerías y tecnologías usadas en el proyecto. Para instalación y uso, ver el [README principal](../README.md).

## 1. Librerías y Tecnologías Clave

### Frontend y Framework
- **Next.js (con React)**: Es el corazón de la aplicación. Se utiliza por su renderizado híbrido (SSR y SSG), enrutamiento basado en el sistema de archivos (App Router) y optimizaciones de rendimiento automáticas. Permite crear una experiencia de usuario rápida y fluida.
- **React**: Biblioteca fundamental para construir interfaces de usuario interactivas y reutilizables a través de un sistema de componentes.
- **TypeScript**: Añade tipado estático a JavaScript, lo que mejora la calidad del código, reduce errores en tiempo de ejecución y facilita el mantenimiento a largo plazo.

### Interfaz de Usuario y Estilos
- **ShadCN UI**: Colección de componentes de UI reutilizables, construidos sobre Radix UI y Tailwind CSS. No es una biblioteca de componentes tradicional, sino un conjunto de "recetas" que se copian directamente en el proyecto, lo que permite una personalización total.
- **Tailwind CSS**: Framework de CSS "utility-first" que permite estilizar componentes directamente en el HTML, agilizando el desarrollo y manteniendo la coherencia visual. Aquí es donde se define el **diseño responsive** utilizando prefijos como `md:`, `lg:`, etc.
- **Lucide React**: Biblioteca de iconos SVG, ligera y personalizable, utilizada para toda la iconografía de la aplicación.

### Gestión de Estado y Formularios
- **React Context API (`auth-context.tsx`)**: Se utiliza para la gestión del estado de autenticación global, proveyendo información del usuario, su rol y el estado de carga a toda la aplicación.
- **React Hook Form**: Gestiona los formularios (login, registro, etc.) de manera eficiente, optimizando el rendimiento al minimizar los re-renderizados.
- **Zod**: Se usa en conjunto con React Hook Form para definir esquemas de validación de datos, asegurando que la información introducida por el usuario sea correcta antes de ser procesada.

### Backend y Base de Datos
- **Firebase**: Es la plataforma de backend como servicio (BaaS) principal.
  - **Firebase Authentication**: Gestiona el registro, inicio de sesión y la seguridad de las sesiones de los usuarios.
  - **Cloud Firestore**: Base de datos NoSQL en tiempo real donde se almacenan todos los datos de la aplicación (usuarios, eventos, tareas, etc.).

### Funcionalidades de IA (Inteligencia Artificial)
- **Genkit**: Es el framework de código abierto de Google para construir aplicaciones con IA.
  - **`@genkit-ai/google-genai`**: Plugin que conecta Genkit con los modelos de IA de Google (Gemini, Imagen) para generar texto, imágenes y audio.
  - **`@genkit-ai/next`**: Integra Genkit de forma nativa en Next.js, facilitando la creación de "flujos" de IA que se ejecutan en el servidor.

### Otras Librerías
- **`date-fns`**: Biblioteca moderna para la manipulación de fechas y horas.
- **`recharts`**: Utilizada para crear los gráficos y visualizaciones en el panel de análisis de datos.
- **`xlsx` (SheetJS)**: Permite la funcionalidad de "Exportar a Excel" en el panel de análisis. Transforma un array de objetos JavaScript (JSON) en un archivo `.xlsx` que el usuario puede descargar directamente desde el navegador. El proceso se puede ver en `src/components/export-button.tsx`.
- **`wav`**: Utilizada en los flujos de IA para procesar el audio PCM generado por el modelo de texto a voz y convertirlo a formato WAV.

## 2. Estructura del Código

El proyecto sigue una organización modular y basada en funcionalidades, aprovechando el App Router de Next.js.

- **`src/app/`**: Directorio principal de la aplicación.
  - **`layout.tsx`**: El layout raíz que envuelve toda la aplicación, donde se proveen contextos globales como la autenticación y el tema.
  - **`(rutas)`**: Cada carpeta dentro de `app` define una ruta. Por ejemplo, `src/app/dashboard/page.tsx` corresponde a la URL `/dashboard`.
    - Las carpetas como `admin`, `supervisor`, `data-analyst` definen rutas protegidas por roles.
- **`src/components/`**: Contiene todos los componentes de React reutilizables.
  - **`ui/`**: Componentes base de ShadCN UI (botones, cards, etc.).
  - **Componentes de funcionalidad**: `user-calendar.tsx`, `focus-list.tsx`, `guided-meditation.tsx`, etc. Cada uno encapsula una funcionalidad específica.
- **`src/contexts/`**: Ubicación para los contextos de React, como `auth-context.tsx`, que maneja el estado global de la autenticación.
- **`src/ai/`**: Centro neurálgico de la IA.
  - **`genkit.ts`**: Archivo de configuración inicial de Genkit.
  - **`flows/`**: Cada archivo define un "flujo" de IA, que es una acción específica como `generateStory` o `guessTheImage`. Estos flujos son Server Actions de Next.js, lo que significa que el código se ejecuta de forma segura en el servidor.
- **`src/lib/`**: Contiene lógica de soporte y utilidades.
  - **`firebase.ts`**: Configuración e inicialización de Firebase.
  - **`crypto.ts`**: Funciones de encriptación (AES-GCM) y desencriptación para proteger los datos del usuario en Firestore.
  - **`errors.ts` y `error-emitter.ts`**: Un sistema para capturar errores de permisos de Firebase y mostrarlos claramente durante el desarrollo.

## 3. APIs y Flujos de IA

La aplicación no expone una API REST tradicional. En su lugar, utiliza dos patrones modernos:

1.  **Comunicación con Firebase**: Los componentes del cliente se comunican directamente con Firestore para leer y escribir datos en tiempo real (por ejemplo, al añadir una tarea o un evento). Las reglas de seguridad de Firebase garantizan que estas operaciones sean seguras.

2.  **Genkit Flows (Server Actions)**: Para las operaciones que requieren lógica de servidor o el uso de IA (como generar un cuento o una meditación), se utilizan **Genkit Flows**. Estos son esencialmente **Server Actions** de Next.js. El cliente llama a una función asíncrona (ej: `generateStory(prompt)`), y Next.js se encarga de ejecutar esa función de forma segura en el servidor, devolviendo el resultado al cliente. Esto elimina la necesidad de crear endpoints de API manualmente.

## 4. Uso de Node.js y Módulos

Aunque estás desarrollando una aplicación web, **Node.js** es el entorno de ejecución que hace posible todo el ecosistema de desarrollo moderno de JavaScript.

- **Entorno de Desarrollo**: Herramientas como Next.js, el servidor de desarrollo (`next dev`) y el gestor de pruebas (Vitest) se ejecutan sobre Node.js.
- **Gestión de Paquetes (NPM)**: Node.js viene con `npm` (Node Package Manager), que se utiliza para instalar y gestionar todas las librerías del proyecto listadas en `package.json`. Los scripts como `npm run dev` o `npm test` son comandos de npm.
- **Ejecución en el Servidor**: La parte del servidor de Next.js (renderizado de páginas, Server Actions, flujos de Genkit) se ejecuta en un entorno de Node.js. Esto permite que tu código JavaScript pueda realizar tareas de backend, como interactuar con APIs de IA o procesar archivos, algo que no es posible en el navegador.

## 5. Firebase Rules (`firestore.rules`)

Este es el archivo de configuración de seguridad más importante de la base de datos. Define quién puede leer, escribir, editar y eliminar datos en Cloud Firestore. Las reglas se escriben en un lenguaje propio de Firebase.

### Principios Clave de las Reglas Implementadas:

1.  **Seguridad por Defecto (Deny-by-default)**: Nadie tiene acceso a nada, a menos que una regla lo permita explícitamente.
2.  **Propiedad de Datos**: La regla `isOwner(userId)` es fundamental. Asegura que un usuario solo pueda acceder y modificar sus propios documentos.
3.  **Acceso Basado en Roles (RBAC)**: Se utilizan funciones como `isAdmin()`, `isAnalyst()`, y `isSupervisor()` para conceder permisos especiales. Estas funciones leen el "rol" del usuario, que se almacena en su token de autenticación.
    -   **`read`, `write`, `delete`**: Permisos para operaciones en documentos individuales.
    -   **`list`**: Permiso para realizar consultas que leen múltiples documentos en una colección. Es crucial para los paneles de administración y análisis, ya que permite, por ejemplo, contar el número total de usuarios.
4.  **Reglas de Grupo de Colección (`Collection Group`)**: Se usan para permitir consultas en todas las subcolecciones con el mismo nombre (ej: todos los `calendarEvents` de todos los usuarios). Esto es vital para que roles como `Supervisor` o `Data Analyst` puedan tener una vista global de los datos para supervisión o estadísticas.

## 6. Animaciones y Diseño Responsive

### Diseño Responsive con Tailwind CSS
En este proyecto, el diseño adaptable (responsive) se gestiona principalmente con **Tailwind CSS**. No encontrarás un archivo CSS separado para cada "breakpoint" (como `mobile.css` o `desktop.css`). En su lugar, Tailwind permite aplicar estilos responsivos directamente en el código de los componentes `.tsx` usando prefijos como `md:`, `lg:`, etc. Por ejemplo, `md:grid-cols-2` aplica un grid de dos columnas solo en pantallas medianas en adelante.

### Animaciones en JavaScript
Las animaciones se logran combinando JavaScript (a través de React) con las utilidades de Tailwind CSS.
- **Animaciones Basadas en CSS**: Son la forma más común. Se definen en las clases de los componentes con utilidades como `transition-all`, `duration-300`, `hover:scale-110`, `animate-spin`, etc. El archivo `src/app/activities/page.tsx` es un buen ejemplo, donde el `animationDelay` se calcula con JavaScript para crear un efecto escalonado.
- **Animaciones Controladas por Estado**: Para interacciones más complejas, se usa el estado de React (`useState` y `useEffect`) para cambiar dinámicamente las clases de CSS. El mejor ejemplo es `src/components/breathing-exercise.tsx`, donde la variable de estado `isAnimating` controla si el círculo se expande o se contrae, cambiando sus clases de Tailwind.

## 7. Encriptación de Datos del Usuario

Para proteger la privacidad, los datos sensibles del usuario (tareas, eventos, entradas de diario) se encriptan en el dispositivo del cliente **antes** de ser enviados a Firestore, usando el estándar **AES-GCM**.
- **Generación de Clave**: La clave de encriptación se deriva de la contraseña y el correo del usuario en el momento del login (usando `PBKDF2`) y se almacena de forma segura en el `sessionStorage` del navegador, lo que significa que se elimina al cerrar la sesión.
- **Lógica Principal**: Todo el código de encriptación, desencriptación y gestión de claves se encuentra en `src/lib/crypto.ts`. Los componentes como `focus-list.tsx` o `user-calendar.tsx` usan esta lógica para proteger y mostrar los datos.
- **Verificación Visual**: En algunas tablas (como la de eventos del administrador), puedes pasar el ratón sobre un título para ver un `Tooltip` que muestra el dato encriptado original, permitiéndote verificar el proceso.

## 8. Pruebas (Testing)

Para garantizar la calidad y la fiabilidad del código, el proyecto utiliza **Vitest** como framework de pruebas. Las pruebas se centran en los módulos de backend que se ejecutan en Node.js, especialmente los flujos de Genkit (IA).

### Configuración

-   **Framework**: [Vitest](https://vitest.dev/) - Un framework de pruebas unitarias moderno y rápido.
-   **Dependencias**: `vitest`, `@vitejs/plugin-react` (para compatibilidad con JSX), `jsdom` (para simular un entorno de navegador si es necesario).
-   **Configuración**: El archivo `vitest.config.ts` en la raíz del proyecto configura el entorno de pruebas, incluyendo los alias de ruta para que coincidan con los de la aplicación.

### ¿Qué se prueba?

Las pruebas se encuentran en archivos con la terminación `.test.ts` junto a los archivos de código que prueban (por ejemplo, `story-flow.test.ts` para `story-flow.ts`).

El enfoque principal es probar los **flujos de Genkit** en `src/ai/flows/`. Dado que estos flujos se conectan a APIs externas de IA, las pruebas utilizan **mocks** para:
1.  **Aislar el código**: Las pruebas se ejecutan sin hacer llamadas reales a las APIs de Google, lo que las hace rápidas y gratuitas.
2.  **Simular respuestas**: Se simula el comportamiento de la IA, devolviendo respuestas predecibles y permitiendo probar tanto los casos de éxito como los de error.

### ¿Cómo ejecutar las pruebas?

Puedes ejecutar todas las pruebas del proyecto con el siguiente comando en tu terminal:

```bash
npm test
```

Esto iniciará Vitest, que buscará y ejecutará todos los archivos de prueba en el proyecto, mostrando los resultados en la consola.

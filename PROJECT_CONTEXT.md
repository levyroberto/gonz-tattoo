# PROJECT_CONTEXT.md

> **Documento de contexto técnico para futuras sesiones de IA.**
> Leer este archivo completo antes de modificar cualquier parte del proyecto.
> Última actualización: 2026-06-02

---

## Resumen ejecutivo

**Gonz Tattoo** es un sitio web de estudio de tatuajes (tatuador individual: Gonzalo Regueira, old school / tradicional). El proyecto es un **MVP en Next.js 15+ / React 19** con backend en **Supabase**. Tiene dos grandes superficies:

1. **Sitio público**: home dinámica por secciones, galería de tatuajes (`/trabajos`), galería de diseños flash (`/disenos`), página de contacto (`/contact`).
2. **Panel de administración** (`/admin`): permite al tatuador gestionar contenido sin tocar código — secciones de la home, tatuajes del portfolio, diseños flash y configuración del sitio.

El sistema de contenido es **schema-driven**: los tipos de secciones, sus campos y su comportamiento están definidos en código TypeScript (`src/data/`), y los valores editables viven en Supabase. Si Supabase no está disponible, el sitio cae a valores fallback hardcodeados.

---

## 1. Estructura general

```
tattoo-mvp/
├── src/
│   ├── app/                  # Rutas Next.js (App Router)
│   │   ├── admin/            # Panel de administración (protegido)
│   │   ├── contact/          # /contact
│   │   ├── disenos/          # /disenos (galería flash — URL canónica)
│   │   ├── flash/            # /flash → redirect a /disenos
│   │   ├── portfolio/        # /portfolio → redirect a /trabajos
│   │   ├── porfolio/         # /porfolio (typo) → redirect a /trabajos
│   │   ├── trabajos/         # /trabajos (galería portfolio — URL canónica)
│   │   ├── layout.tsx        # Root layout, fuentes, metadata global
│   │   ├── page.tsx          # Home
│   │   └── globals.css       # Variables CSS globales, tokens de diseño
│   ├── components/
│   │   ├── admin/            # Componentes del panel admin
│   │   ├── contact/          # Componentes de la página de contacto
│   │   ├── flash/            # Componentes de la galería flash
│   │   ├── home/             # Secciones de la home y layout compartido
│   │   ├── portfolio/        # Componentes de la galería de trabajos
│   │   ├── ui/               # Primitivas UI (shadcn/ui)
│   │   └── tattoo-image-lightbox.tsx  # Lightbox global compartido
│   ├── data/                 # Schemas de tipos, fallbacks, definiciones de secciones
│   │   ├── flash-designs.ts         # Tipo FlashDesign
│   │   ├── global-sections.ts       # Tipo y fallback del footer global
│   │   ├── home-section-schema.ts   # Schema de campos + parsers de formulario (ARCHIVO CENTRAL)
│   │   ├── home-sections.ts         # Tipos TypeScript de secciones home + fallbacks
│   │   ├── page-sections.ts         # Tipos TypeScript de secciones de páginas internas + fallbacks
│   │   ├── site-content.ts          # Constantes de navegación (navLinks)
│   │   └── tattoos.ts               # Tipo Tattoo
│   ├── hooks/
│   │   ├── use-is-mobile.ts         # Detección de viewport mobile
│   │   └── use-lightbox-open-guard.ts # Guard para abrir lightbox
│   ├── lib/
│   │   ├── admin-auth.ts            # Helpers de autenticación admin
│   │   ├── format-price.ts          # Formateo de precios en pesos ARS
│   │   ├── home-section-filters.ts  # Lógica de filtrado de items por sección
│   │   ├── internal-links.ts        # Normalización de links internos (aliases de rutas)
│   │   └── supabase/
│   │       ├── content.ts           # Todas las queries a Supabase (ARCHIVO CENTRAL)
│   │       ├── database.types.ts    # Tipos generados por Supabase CLI
│   │       └── server.ts            # Factories de clientes Supabase
├── supabase/
│   ├── migrations/           # Migraciones SQL ordenadas por timestamp
│   └── schema.sql            # Schema completo acumulado
├── public/images/            # Assets estáticos de imágenes
│   ├── artist/               # Fotos del artista
│   ├── flash/                # Imágenes de diseños (si no vienen de Supabase Storage)
│   ├── hero/                 # Imágenes de hero
│   ├── placeholders/         # Placeholders
│   ├── tattoos/              # Fotos de trabajos (si no vienen de Supabase Storage)
│   └── textures/             # Texturas CSS
├── docs/
│   └── supabase.md           # Documentación de la integración con Supabase
├── .env.local                # Variables de entorno locales (no commitear)
├── next.config.ts            # Config Next.js
├── components.json           # Config shadcn/ui
└── package.json
```

### Convenciones de nombres

- Archivos de componentes: `kebab-case.tsx`
- Tipos de datos: `PascalCase` con `interface` o `type`
- Funciones helper: `camelCase`
- Rutas URL canónicas en español: `/trabajos`, `/disenos`, `/contact`
- Rutas en inglés (`/portfolio`, `/flash`) existen solo como redirects
- El alias `@/` apunta a `src/`

---

## 2. Arquitectura

### Patrón general

**Next.js App Router** con Server Components por defecto. La separación es:

- **Server Components** (páginas en `app/`): obtienen datos de Supabase, los pasan a componentes hijos como props.
- **Client Components** (`"use client"`): componentes interactivos del admin, header, hero animado, lightbox.
- **Server Actions** (`app/admin/actions.ts`): mutaciones desde el admin (crear, editar, borrar, reordenar items, guardar secciones).

### Capas

```
Supabase (DB + Storage + Auth)
       ↓
lib/supabase/content.ts       ← queries de lectura (server-only)
lib/supabase/server.ts        ← factories de clientes
       ↓
app/*/page.tsx                ← Server Components, orquestan fetches
       ↓
components/*/                 ← UI, reciben datos como props
       ↓
app/admin/actions.ts          ← Server Actions para mutaciones
```

### Sistema de secciones (núcleo del proyecto)

El sistema más complejo y central del proyecto. Funciona así:

1. **`src/data/home-sections.ts`** define los tipos TypeScript de cada sección (`HeroHomeSection`, `FeaturedPortfolioHomeSection`, etc.) y sus valores fallback.
2. **`src/data/page-sections.ts`** hace lo mismo para páginas internas (`portfolioPage`, `flashPage`, `aboutPage`, `contactPage`).
3. **`src/data/global-sections.ts`** define el footer global.
4. **`src/data/home-section-schema.ts`** es el archivo más importante del admin: contiene el objeto `SECTION_DEFINITIONS` que describe cada tipo de sección con sus campos, labels, tipos de input, opciones, targets (`content`/`layout`/`style`) y parsers. También contiene `parseSectionContentFromForm` y `parseSectionLayoutFromForm`.
5. **`src/lib/supabase/content.ts`** tiene las funciones `getHomeSections()`, `getPageSection()`, `getGlobalFooterSection()`, etc. que leen de la tabla `site_sections` de Supabase y fusionan los datos del DB con los fallbacks de `src/data/`.
6. **`src/components/home/home-section-renderer.tsx`** recibe un array de `HomeSection` y hace un switch por tipo para renderizar el componente correcto.

### Dependencias críticas entre partes

- `home-section-schema.ts` depende de `home-sections.ts` y `page-sections.ts` para los tipos.
- `content.ts` depende de todos los archivos de `src/data/` para fallbacks y tipos.
- `app/admin/actions.ts` depende de `home-section-schema.ts` para parsear forms y de `server.ts` para el cliente autenticado.
- Los componentes de la home reciben datos ya procesados por las funciones de `content.ts` — no hacen fetches propios.

### Partes que no se deben tocar sin entender bien

- `src/data/home-section-schema.ts`: tocar `SECTION_DEFINITIONS` afecta el render del admin Y el parseo de formularios.
- `src/lib/supabase/content.ts`: las funciones de visibilidad (`getPortfolioItemsByVisibility`, `getFlashDesignsByVisibility`) tienen lógica de fallback multi-capa para compatibilidad con esquemas de DB más viejos. Modificarlas puede romper la compatibilidad con producción.
- `supabase/schema.sql`: es el schema acumulado de referencia, no se ejecuta directamente en producción (se usan las migraciones individuales).

---

## 3. Flujo principal de la aplicación

### Inicio del proyecto (local)

```bash
pnpm dev     # Next.js con Webpack (--webpack flag en el script)
pnpm build   # Build de producción
pnpm start   # Servidor de producción
```

### Orden de ejecución al cargar la home

1. `src/app/layout.tsx` — aplica fuentes Google (Bebas Neue, Playfair Display), metadata SEO.
2. `src/app/page.tsx` — Server Component. Ejecuta en paralelo (Promise.all):
   - `getPortfolioItems()` → portfolio activo de Supabase
   - `getFlashDesigns()` → diseños flash activos de Supabase
   - `getSiteSettings()` → configuración del estudio (nombre, redes, horarios)
   - `getHomeSections()` → secciones de la home ordenadas y habilitadas
   - `getGlobalFooterSection()` → footer
   - `getPageSection("contact")` → imagen del about (viene de la sección contacto)
3. Renderiza `<SiteHeader />`, luego mapea las secciones con `<HomeSectionRenderer />`, luego `<SiteFooter />`.
4. `HomeSectionRenderer` hace un switch por `section.type` y renderiza el componente correspondiente.

### Flujo del admin

1. Cualquier ruta de `/admin/*` llama `requireAdmin()` que verifica la sesión de Supabase Auth.
2. Si no hay sesión, redirige a `/admin/login`.
3. El login usa `loginAdmin` (Server Action en `actions.ts`) que llama `supabase.auth.signInWithPassword`.
4. El panel principal (`/admin`) carga todo el contenido editable de una vez con `getAdminDashboardContent()`.
5. Las ediciones usan Server Actions que: validan, uben imagen a Supabase Storage si hay archivo, hacen upsert en Supabase DB, y llaman `revalidatePath` para invalidar caché de las páginas públicas.

### Flujo de un usuario visitante típico

```
/ (home) → ve hero, galería de tatuajes destacados, preview de flash, about, contacto
/trabajos → galería completa de tatuajes con filtros
/disenos  → galería de diseños flash con filtros por estado, estilo, etc.
/contact  → datos de contacto, botones WhatsApp e Instagram
```

---

## 4. Estado, datos y lógica de negocio

### Dónde vive el estado

- **Estado del servidor**: Supabase (DB + Storage). Todo el contenido editable vive ahí.
- **Estado de UI local** (solo admin): `useState` en componentes client (`admin-content-sections.tsx`, `sortable-admin-lists.tsx`, `home-sections-manager.tsx`). El admin tiene optimistic updates locales para listas editables.
- **Estado de sesión**: Supabase Auth, persistido en cookies HTTP-only.
- **Estado mínimo en localStorage**: contador de visitas al hero (para alternar posición de imagen en mobile).

### Dónde está la lógica de negocio

- **Filtrado de items**: `src/lib/home-section-filters.ts` — filtra portfolio y flash por estilo, tags, fechas, limite, orden personalizado.
- **Normalización de datos**: `src/lib/supabase/content.ts` — convierte rows de Supabase a tipos TypeScript limpios. Incluye normalización de status de flash, fusión con fallbacks.
- **Parseo de formularios**: `src/data/home-section-schema.ts` — `parseSectionContentFromForm`, `parseSectionLayoutFromForm`.
- **Formateo de precios**: `src/lib/format-price.ts` — formato ARS con `Intl.NumberFormat`.
- **Normalización de URLs**: `src/lib/internal-links.ts` — convierte rutas alias a canónicas.

### Servicios y accesos a datos

| Función | Archivo | Propósito |
|---|---|---|
| `getPortfolioItems()` | `content.ts` | Portfolio activo (público) |
| `getAdminPortfolioItems()` | `content.ts` | Portfolio completo (admin) |
| `getFeaturedPortfolioItems()` | `content.ts` | Solo destacados, para secciones home |
| `getFlashDesigns()` | `content.ts` | Flash activos (público) |
| `getAdminFlashDesigns()` | `content.ts` | Flash completo (admin) |
| `getHomeSections()` | `content.ts` | Secciones home habilitadas |
| `getAdminHomeSections()` | `content.ts` | Todas las secciones home (admin) |
| `getPageSection(key)` | `content.ts` | Sección de una página interna |
| `getGlobalFooterSection()` | `content.ts` | Footer global |
| `getSiteSettings()` | `content.ts` | Configuración del estudio |
| `getAdminDashboardContent()` | `content.ts` | Todo el contenido admin de una vez |
| `getTattooStyles()` | `content.ts` | Estilos de tatuaje activos |

---

## 5. Configuración e infraestructura

### Variables de entorno

| Variable | Requerida | Propósito |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Sí | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Sí (o ANON_KEY) | Key pública para lectura y auth |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Alternativa | Fallback de la publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Opcional | Para queries sin RLS (lectura admin) |

El cliente de **lectura pública** (`createSupabaseServerClient`) usa `SERVICE_ROLE_KEY` si está disponible, si no la publishable/anon key. El cliente de **autenticación** (`createSupabaseAuthServerClient`) usa siempre la publishable/anon key con cookies.

### Configuración importante

- `next.config.ts`: permite imágenes de `*.supabase.co`, configura body size limit de Server Actions a 10mb (para uploads de imágenes), permite dev origins de `*.trycloudflare.com`.
- `components.json`: configuración de shadcn/ui (path de componentes UI en `src/components/ui`).
- `pnpm-workspace.yaml`: proyecto usa pnpm.
- `eslint.config.mjs`: ESLint con config de Next.js.
- `postcss.config.mjs`: PostCSS con Tailwind v4.

### Dependencias principales

| Paquete | Versión | Uso |
|---|---|---|
| `next` | 16.2.6 | Framework |
| `react` / `react-dom` | 19.2.4 | UI |
| `@supabase/supabase-js` | 2.x | Cliente Supabase |
| `@supabase/ssr` | 0.10.x | Supabase con cookies para SSR |
| `tailwindcss` | 4.x | Estilos |
| `framer-motion` | 12.x | Animaciones |
| `@dnd-kit/core` + `sortable` | 6.x / 10.x | Drag & drop en admin |
| `radix-ui` | 1.x | Primitivas UI (via shadcn) |
| `lucide-react` | 1.x | Iconos |
| `class-variance-authority` + `clsx` + `tailwind-merge` | - | Utilidades de clases CSS |

### Cómo correr el proyecto localmente

```bash
pnpm install
# Crear .env.local con las variables de Supabase
pnpm dev
```

El proyecto usa `--webpack` en el script dev (no Turbopack en dev, aunque `turbopack` está configurado en next.config.ts para el root). Requiere las variables de Supabase para funcionar. Sin ellas, el sitio muestra los fallbacks hardcodeados.

### Deploy

No hay configuración explícita de deploy en el repo, pero la estructura indica **Vercel** (uso de `next/font`, `force-dynamic` en páginas, Server Actions, patrones de Next.js estándar). El dominio de Supabase de producción ya está en `.env.local`.

---

## 6. Features y módulos principales

### Home dinámica por secciones

**Qué hace**: La home se construye iterando un array de secciones. Cada sección es un tipo bien definido con sus campos `content`, `layout` y `style`. El admin puede habilitar/deshabilitar secciones, cambiar su orden, y editar su contenido.

**Archivos principales**: `src/app/page.tsx`, `src/components/home/home-section-renderer.tsx`, `src/data/home-sections.ts`, `src/data/home-section-schema.ts`.

**Tipos de secciones home**:
- `hero`: hero con imagen de fondo, título, subtítulo y botones CTA.
- `featuredPortfolio`: galería filtrable de tatuajes (carrusel o grilla). Puede filtrar por estilo, tags, fechas, limit, destacados.
- `flashPreview`: preview filtrable de diseños flash.
- `about`: presentación del artista con imagen, párrafos y quote.
- `contactCta`: bloque de contacto con botones WhatsApp/Instagram y horarios.

**Riesgo**: agregar un nuevo tipo de sección requiere: (1) tipo en `home-sections.ts`, (2) fallback en el array `homeSections`, (3) entrada en `SECTION_DEFINITIONS`, (4) case en `HomeSectionRenderer`, (5) componente de presentación.

### Panel de administración

**Qué hace**: Interfaz web protegida por autenticación para que el tatuador gestione todo el contenido sin tocar código.

**Archivos principales**: `src/app/admin/`, `src/components/admin/`, `src/app/admin/actions.ts`.

**Sub-secciones del admin**:
- `/admin` (home): estadísticas, configuración del sitio, manager de secciones home, manager del footer.
- `/admin/tatuajes`: CRUD de portfolio con drag & drop para reordenar.
- `/admin/disenos`: CRUD de diseños flash con drag & drop.
- `/admin/pantallas`: editor de secciones de páginas internas (Trabajos, Diseños, Sobre mí, Contacto).
- `/admin/login`: formulario de login.

**Riesgo**: `src/app/admin/actions.ts` es el archivo más largo del proyecto. Contiene todas las Server Actions del admin. Tiene lógica de normalización de URLs de Instagram/WhatsApp, manejo de uploads a Supabase Storage, fallbacks para esquemas de DB legacy, y revalidación de paths.

### Galería de trabajos (`/trabajos`)

**Archivos principales**: `src/app/trabajos/page.tsx`, `src/components/portfolio/portfolio-gallery.tsx`, `src/components/portfolio/portfolio-card.tsx`.

**Datos usados**: `getPortfolioItems()`, `getPageSection("portfolio")`, `getSiteSettings()`, `getGlobalFooterSection()`.

### Galería de diseños flash (`/disenos`)

**Archivos principales**: `src/app/disenos/page.tsx`, `src/components/flash/flash-gallery.tsx`, `src/components/flash/flash-design-card.tsx`.

**Datos usados**: `getFlashDesigns()`, `getPageSection("flash")`, `getSiteSettings()`.

**Detalle**: los diseños tienen estado (`Disponible`, `Reservado`, `Reclamado`). La galería tiene filtros de estado en cliente.

### Redirects de URLs legacy

- `/portfolio` → `/trabajos`
- `/porfolio` (typo histórico) → `/trabajos`
- `/flash` → `/disenos` (preserva query params)

Están implementados como páginas Next.js con `redirect()` server-side, excepto `/flash` que es más complejo porque preserva query params.

### Lightbox de imágenes

**Archivo**: `src/components/tattoo-image-lightbox.tsx`. Componente compartido usado en la galería de trabajos y posiblemente en la home. Es un componente client.

---

## 7. Decisiones técnicas detectadas

### Intencionales

- **Fallback-first**: Si Supabase no responde, el sitio funciona con datos hardcodeados en `src/data/`. Esto permite desarrollo offline y resiliencia en producción.
- **Schema-driven admin**: Los formularios del admin se generan a partir de `SECTION_DEFINITIONS`, no son formularios hardcodeados. Esto permite agregar nuevos tipos de sección con relativamente poco código.
- **`force-dynamic` en todas las páginas públicas**: Garantiza que el contenido esté siempre fresco (no se usa caché de Next.js). Tiene implicancias de performance: cada request hace queries a Supabase.
- **Dos clientes Supabase distintos**: uno con service role (lectura sin RLS para el sitio público), otro con cookies (para auth en el admin). Esto es deliberado.
- **Precio de flash como `integer` en centavos/pesos enteros**: la migración `flash_price_to_integer.sql` convirtió el precio de texto a entero.
- **URLs en español**: `/trabajos`, `/disenos` son las URLs canónicas. Las versiones en inglés son redirects.
- **Tailwind v4**: usa la versión mayor de Tailwind con PostCSS, sin archivo de configuración `tailwind.config.js` (la config está en CSS o en `postcss.config.mjs`).

### Convenciones a respetar

- No hacer queries a Supabase desde Client Components. Solo desde Server Components o Server Actions.
- No crear páginas sin `export const dynamic = "force-dynamic"` (salvo que la página sea estática por diseño).
- Al agregar un campo a una sección existente, agregar también: el tipo TypeScript, el campo en `SECTION_DEFINITIONS`, la migración SQL, y el fallback en `src/data/`.
- Las Server Actions siempre llaman `revalidatePath` al terminar para invalidar el caché.
- Los helpers de formato/normalización van en `src/lib/`, no en los componentes.

### Partes legacy / experimentales / pendientes

- `src/data/site-content.ts`: solo tiene `navLinks`. Es un archivo muy pequeño que podría fusionarse con otro o crecer como repositorio de constantes globales del sitio.
- Comentario de código en `sortable-admin-lists.tsx`: hay una función `moveItem` comentada (código muerto).
- Compatibilidad multi-schema en `content.ts`: las funciones de visibilidad tienen 3 niveles de fallback por columnas de DB que no existían en versiones anteriores. Esto es deuda técnica que debería limpiarse cuando se estabilice el schema.
- `src/app/admin/actions.ts`: archivo con muchas responsabilidades mezcladas. Candidato a refactor cuando crezca.
- La sección `about` de la home y la sección `aboutPage` son similares pero separadas. La imagen del about en la home viene de `contactSection.style.image` (requiere revisión si esto es intencional o un workaround).

---

## 8. Guidelines para futuras IAs

### Antes de tocar cualquier cosa

1. **Leer este documento completo** antes de modificar código.
2. Identificar qué tipo de cambio es: ¿UI pura? ¿Nuevo campo en una sección? ¿Nueva sección? ¿Lógica de filtrado? Cada uno tiene su ruta de archivos.
3. Verificar si el cambio requiere también una **migración SQL** (`supabase/migrations/`).

### Reglas operativas

- **No mover archivos** sin revisar todos los imports que los referencian. El alias `@/` facilita búsquedas con `grep -r "@/lib/supabase/content"`.
- **No hacer refactors grandes** sin explicar el impacto en este documento y sin una tarea explícita del usuario.
- **Mantener cambios pequeños y acotados**. Preferir un cambio que toca 2-3 archivos sobre uno que toca 10.
- **No duplicar lógica** que ya existe en `src/lib/` o `src/data/`.
- **Buscar primero** antes de crear: helpers, hooks, componentes UI, tipos.
- **Si algo no está claro**, marcarlo como "requiere revisión" y preguntar antes de asumir.
- **No mezclar** lógica de negocio en componentes de presentación. La lógica va en `src/lib/`, los datos los orquestan las páginas (Server Components).
- **Respetar la arquitectura de capas**: las queries van en `content.ts`, las mutaciones en `actions.ts`, la UI en `components/`.
- **Al agregar un campo nuevo a una sección**: actualizar el tipo TypeScript + el fallback en `src/data/` + la entrada en `SECTION_DEFINITIONS` + la migración SQL. Los cuatro pasos son necesarios.

### Lo que NO hacer

- No hacer queries a Supabase desde Client Components.
- No hardcodear texto que debería ser editable desde el admin.
- No ignorar los fallbacks: si se agrega un campo, debe tener un valor por defecto sensato en el fallback de `src/data/`.
- No eliminar las rutas de redirect legacy (`/portfolio`, `/porfolio`, `/flash`) — pueden estar siendo usadas desde redes sociales o links externos.
- No cambiar la estructura de `SECTION_DEFINITIONS` sin entender cómo afecta el parseo de formularios en `actions.ts`.

---

## 9. Pendientes y deuda técnica

### Revisión recomendada

- **`src/app/admin/actions.ts`**: archivo demasiado largo con múltiples responsabilidades. Tiene lógica de upload de imágenes, normalización de URLs, parseo de precios, CRUD de portfolio y flash, guardado de secciones, manejo de settings, y login. Candidato a dividirse en módulos más pequeños.
- **Compatibilidad multi-schema en `content.ts`**: las funciones `getPortfolioItemsByVisibility` y `getFlashDesignsByVisibility` tienen 3 niveles de fallback de queries para manejar columnas que no existían en el schema original. Si el schema de producción está estabilizado, este código se puede simplificar.
- **Función `moveItem` comentada** en `sortable-admin-lists.tsx`: código muerto, debería eliminarse.
- **`src/data/site-content.ts`**: solo tiene `navLinks`. Si no va a crecer, considerar fusionarlo con otro archivo de constantes o documentar su propósito.

### Posibles riesgos de arquitectura

- **`force-dynamic` en todo**: cada visita al sitio hace múltiples queries a Supabase en paralelo. Si el tráfico escala, considerar estrategias de caché (ISR, cache tags de Next.js) o CDN.
- **Sin tests**: no hay tests unitarios ni de integración. Los cambios en `home-section-schema.ts` o `content.ts` son riesgosos sin cobertura.
- **`getAdminDashboardContent()` carga todo**: el dashboard admin carga portfolio completo + flash completo + todas las secciones en una sola request. Si el catálogo crece mucho, puede volverse lento.
- **Imagen del about en home viene de `contactSection`**: en `src/app/page.tsx`, la imagen del about se obtiene de `getPageSection("contact")`. Esto acopla dos secciones conceptualmente distintas.

### Mejoras sugeridas para futuras iteraciones

- Dividir `actions.ts` en módulos por dominio (`portfolio-actions.ts`, `flash-actions.ts`, `section-actions.ts`, `settings-actions.ts`).
- Agregar al menos tests de unidad para `home-section-filters.ts` y `parseSectionContentFromForm`.
- Considerar caché con `unstable_cache` o ISR para páginas públicas de alta frecuencia.
- Extraer la lógica de upload de imagen de `actions.ts` a un helper reutilizable en `src/lib/`.
- Desacoplar la imagen del about del `contactSection`.
- Agregar metadata SEO dinámica por página (actualmente solo hay metadata global en `layout.tsx`).

---

## Resumen de lectura prioritaria para futuras IAs

**Antes de cualquier cambio, leer en este orden:**

1. **Este documento** (`PROJECT_CONTEXT.md`) — contexto general.
2. **`src/data/home-sections.ts`** + **`src/data/page-sections.ts`** — entender los tipos de secciones y sus fallbacks.
3. **`src/data/home-section-schema.ts`** — entender `SECTION_DEFINITIONS` y cómo se parsean los formularios del admin.
4. **`src/lib/supabase/content.ts`** — entender cómo se leen los datos de Supabase y cómo funcionan los fallbacks.
5. **`src/app/admin/actions.ts`** (si el cambio involucra mutaciones del admin) — entender cómo se guardan datos y se suben imágenes.
6. **El componente específico** que se va a modificar.

Con eso, cualquier IA debería tener suficiente contexto para hacer cambios seguros y coherentes con la arquitectura existente.

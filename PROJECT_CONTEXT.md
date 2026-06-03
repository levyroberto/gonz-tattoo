# PROJECT_CONTEXT.md

> **Documento de contexto técnico para futuras sesiones de IA.**
> Leer este archivo completo antes de modificar cualquier parte del proyecto.
> Última actualización: 2026-06-02 (post-sesión de refactors)

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
│   ├── app/                        # Rutas Next.js (App Router)
│   │   ├── admin/
│   │   │   ├── actions/            # Server Actions divididas por dominio
│   │   │   │   ├── auth.ts         # loginAdmin, logoutAdmin
│   │   │   │   ├── flash.ts        # CRUD + reorder flash designs
│   │   │   │   ├── image-upload.ts # Re-export de lib/supabase/storage
│   │   │   │   ├── index.ts        # Barrel (sin "use server") — punto de entrada público
│   │   │   │   ├── portfolio.ts    # CRUD + reorder portfolio
│   │   │   │   ├── sections.ts     # Home sections, page sections, footer
│   │   │   │   └── settings.ts     # updateSiteSettings
│   │   │   ├── disenos/page.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── page.tsx            # Dashboard admin principal
│   │   │   ├── pantallas/page.tsx
│   │   │   └── tatuajes/page.tsx
│   │   ├── contact/page.tsx        # Metadata SEO propia
│   │   ├── disenos/page.tsx        # Metadata SEO propia
│   │   ├── flash/page.tsx          # Redirect a /disenos
│   │   ├── portfolio/page.tsx      # Redirect a /trabajos
│   │   ├── porfolio/page.tsx       # Redirect a /trabajos (typo histórico)
│   │   ├── trabajos/page.tsx       # Metadata SEO propia
│   │   ├── layout.tsx              # Root layout, fuentes, metadata global
│   │   ├── page.tsx                # Home
│   │   └── globals.css
│   ├── components/
│   │   ├── admin/                  # Componentes del panel admin
│   │   │   ├── admin-field-styles.ts  # Constantes CSS compartidas (fieldClass, etc.)
│   │   │   └── ...
│   │   ├── contact/
│   │   ├── flash/
│   │   ├── home/                   # Secciones de la home (NO incluye header/footer)
│   │   ├── layout/                 # Componentes de layout global
│   │   │   ├── site-header.tsx     # Header fijo con nav y CTA
│   │   │   └── site-footer.tsx     # Footer global
│   │   ├── portfolio/
│   │   └── ui/
│   │       ├── tattoo-image-lightbox.tsx  # Lightbox compartido
│   │       └── ...                 # Primitivas shadcn/ui
│   ├── data/                       # Schemas, tipos y fallbacks
│   ├── hooks/
│   ├── lib/
│   │   ├── __tests__/              # Tests unitarios (Vitest)
│   │   │   ├── format-price.test.ts
│   │   │   ├── home-section-filters.test.ts
│   │   │   ├── internal-links.test.ts
│   │   │   └── section-parsers.test.ts
│   │   ├── admin-auth.ts
│   │   ├── format-price.ts
│   │   ├── home-section-filters.ts
│   │   ├── internal-links.ts
│   │   └── supabase/
│   │       ├── content.ts          # Queries de lectura (ARCHIVO CENTRAL)
│   │       ├── database.types.ts
│   │       ├── server.ts           # Factories de clientes Supabase
│   │       └── storage.ts          # Upload de imágenes a Supabase Storage
├── supabase/
│   ├── migrations/
│   └── schema.sql
├── vitest.config.ts                # Configuración de tests
├── .env.local
├── next.config.ts
├── package.json
└── PROJECT_CONTEXT.md
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
- **Server Actions** (`app/admin/actions/`): mutaciones desde el admin, divididas por dominio.

### Capas

```
Supabase (DB + Storage + Auth)
       ↓
lib/supabase/content.ts        ← queries de lectura (server-only)
lib/supabase/storage.ts        ← upload de imágenes (helper puro, sin "use server")
lib/supabase/server.ts         ← factories de clientes
       ↓
app/*/page.tsx                 ← Server Components, orquestan fetches
       ↓
components/*/                  ← UI, reciben datos como props
       ↓
app/admin/actions/             ← Server Actions para mutaciones (divididas por dominio)
  ├── index.ts                 ← Barrel sin "use server" — re-exporta todo
  ├── auth.ts                  ← "use server"
  ├── portfolio.ts             ← "use server"
  ├── flash.ts                 ← "use server"
  ├── sections.ts              ← "use server"
  ├── settings.ts              ← "use server"
  └── image-upload.ts          ← "use server" — re-export de storage.ts
```

### Regla crítica sobre "use server" en barrels

**`index.ts` NO tiene `"use server"`**. Next.js exige que un archivo con `"use server"` solo exporte funciones async propias, no re-exports. El barrel es un módulo normal que re-exporta desde los módulos con `"use server"`.

### Sistema de secciones (núcleo del proyecto)

El sistema más complejo y central. Ver sección 6 para detalles. Los archivos clave son:

1. `src/data/home-sections.ts` — tipos TypeScript + fallbacks de secciones home
2. `src/data/page-sections.ts` — tipos + fallbacks de páginas internas
3. `src/data/global-sections.ts` — tipo + fallback del footer
4. `src/data/home-section-schema.ts` — **ARCHIVO MÁS IMPORTANTE DEL ADMIN**: `SECTION_DEFINITIONS`, parsers de formularios
5. `src/lib/supabase/content.ts` — queries que fusionan DB con fallbacks
6. `src/components/home/home-section-renderer.tsx` — switch por tipo para renderizar

---

## 3. Flujo principal de la aplicación

### Inicio del proyecto (local)

```bash
pnpm install
pnpm approve-builds   # necesario para esbuild (dependencia de vitest)
pnpm dev              # Next.js con Webpack
pnpm test             # tests unitarios con Vitest
```

### Orden de ejecución al cargar la home

1. `src/app/layout.tsx` — fuentes Google (Bebas Neue, Playfair Display), metadata SEO global.
2. `src/app/page.tsx` — Server Component. Ejecuta en paralelo (Promise.all):
   - `getPortfolioItems()` → portfolio activo
   - `getFlashDesigns()` → flash activos
   - `getSiteSettings()` → configuración del estudio
   - `getHomeSections()` → secciones home ordenadas y habilitadas
   - `getGlobalFooterSection()` → footer
   - `getAboutImage()` → imagen del about (lee de contact section internamente)
3. Renderiza `<SiteHeader />`, mapea secciones con `<HomeSectionRenderer />`, luego `<SiteFooter />`.

### CTA link centralizado

El botón "CONSULTAR" del header usa `ctaLink` de `src/data/site-content.ts`. **No** está hardcodeado en el componente. Si cambia la URL de contacto, solo hay que tocar `site-content.ts`.

---

## 4. Estado, datos y lógica de negocio

### Dónde vive el estado

- **Estado del servidor**: Supabase (DB + Storage). Todo el contenido editable vive ahí.
- **Estado de UI local** (solo admin): `useState` en componentes client.
- **Estado de sesión**: Supabase Auth, persistido en cookies HTTP-only.
- **Estado mínimo en localStorage**: contador de visitas al hero (alterna posición de imagen en mobile).

### Acoplamiento conocido: imagen del about

`getAboutImage()` en `content.ts` lee la imagen de la sección `contactPage` de la DB. Esto significa que la imagen del about en la home y la imagen en la página de contacto son **la misma**. Está documentado con un comentario en la función. Si se quiere desacoplar, habría que:
1. Agregar un campo `image` al tipo `AboutHomeSection`
2. Agregar el campo en `SECTION_DEFINITIONS.about`
3. Migrar el dato en la DB
4. Actualizar `getAboutImage()` para leer del `about` home section

### Servicios y accesos a datos

| Función | Archivo | Propósito |
|---|---|---|
| `getPortfolioItems()` | `content.ts` | Portfolio activo (público) |
| `getAdminPortfolioItems()` | `content.ts` | Portfolio completo (admin) |
| `getFlashDesigns()` | `content.ts` | Flash activos (público) |
| `getAdminFlashDesigns()` | `content.ts` | Flash completo (admin) |
| `getHomeSections()` | `content.ts` | Secciones home habilitadas |
| `getAdminHomeSections()` | `content.ts` | Todas las secciones home (admin) |
| `getPageSection(key)` | `content.ts` | Sección de una página interna |
| `getGlobalFooterSection()` | `content.ts` | Footer global |
| `getSiteSettings()` | `content.ts` | Configuración del estudio |
| `getAboutImage()` | `content.ts` | Imagen del about (lee de contactPage) |
| `getAdminDashboardContent()` | `content.ts` | Todo el contenido admin de una vez |
| `resolveImageUrl()` | `lib/supabase/storage.ts` | Upload a Supabase Storage |

---

## 5. Configuración e infraestructura

### Variables de entorno

| Variable | Requerida | Propósito |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Sí | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Sí (o ANON_KEY) | Key pública para lectura y auth |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Alternativa | Fallback de la publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Opcional | Para queries sin RLS |

### Scripts disponibles

```bash
pnpm dev              # desarrollo local (Webpack)
pnpm build            # build de producción
pnpm start            # servidor de producción
pnpm lint             # ESLint
pnpm test             # Vitest (requiere pnpm approve-builds esbuild primero)
pnpm test:watch       # Vitest en modo watch
pnpm test:coverage    # Vitest con reporte de cobertura
```

### Tests

Configurados con **Vitest** en `vitest.config.ts`. Los archivos de test viven en `src/lib/__tests__/`. El `tsconfig.json` excluye los archivos de test y `vitest.config.ts` para que el compilador de Next.js no los procese.

Cobertura actual:
- `home-section-filters.test.ts` — 20 tests (matchesTags, filterPortfolioItems, filterFlashDesigns)
- `format-price.test.ts` — 5 tests (formatPrice)
- `internal-links.test.ts` — 7 tests (normalizeInternalLink)
- `section-parsers.test.ts` — 19 tests (parseSectionContentFromForm para hero, featuredPortfolio, flashPreview, about)

### Dependencias principales

| Paquete | Uso |
|---|---|
| `next` 16.2.6 | Framework |
| `react` / `react-dom` 19.2.4 | UI |
| `@supabase/supabase-js` + `@supabase/ssr` | Supabase |
| `tailwindcss` 4.x | Estilos |
| `framer-motion` 12.x | Animaciones |
| `@dnd-kit/*` | Drag & drop en admin |
| `vitest` + `@vitest/coverage-v8` | Tests |

---

## 6. Features y módulos principales

### Home dinámica por secciones

Tipos de secciones home: `hero`, `featuredPortfolio`, `flashPreview`, `about`, `contactCta`. El admin puede habilitar/deshabilitar, reordenar y editar el contenido de cada una. También puede crear secciones adicionales de tipo `featuredPortfolio` y `flashPreview`.

**Riesgo**: agregar un nuevo tipo de sección requiere cinco pasos coordinados: tipo TypeScript, fallback en `home-sections.ts`, entrada en `SECTION_DEFINITIONS`, case en `HomeSectionRenderer`, y componente de presentación.

### Panel de administración

Server Actions organizadas por dominio en `src/app/admin/actions/`:

- `auth.ts` — login/logout con Supabase Auth
- `portfolio.ts` — CRUD portfolio con fallback legacy para columnas viejas del schema
- `flash.ts` — CRUD flash designs
- `sections.ts` — gestión de home sections, page sections y footer
- `settings.ts` — configuración del estudio (Instagram, WhatsApp, dirección, horarios)
- `image-upload.ts` — re-export de `lib/supabase/storage.ts` (compatibilidad)
- `index.ts` — barrel **sin `"use server"`** que re-exporta todo

**Importar siempre desde `@/app/admin/actions`** (el barrel), no desde los módulos individuales.

### Componentes de layout

`SiteHeader` y `SiteFooter` viven en `src/components/layout/`, no en `home/`. Son compartidos por todas las páginas públicas.

### Lightbox

`TattooImageLightbox` vive en `src/components/ui/tattoo-image-lightbox.tsx`.

### Upload de imágenes

`resolveImageUrl` vive en `src/lib/supabase/storage.ts`. No tiene `"use server"` — es un helper puro que recibe el cliente Supabase como parámetro. Se puede importar desde cualquier contexto.

---

## 7. Decisiones técnicas detectadas

### Intencionales

- **Fallback-first**: Si Supabase no responde, el sitio funciona con datos hardcodeados en `src/data/`.
- **Schema-driven admin**: Los formularios del admin se generan desde `SECTION_DEFINITIONS`.
- **`force-dynamic` en todas las páginas públicas**: Garantiza contenido fresco en cada request.
- **Dos clientes Supabase distintos**: service role para lectura pública, cookie-based para auth admin.
- **Barrel sin `"use server"`**: `index.ts` de actions es un re-export puro. Esta es la forma correcta de exponer múltiples Server Actions desde un directorio.
- **URLs en español como canónicas**: `/trabajos`, `/disenos`. Las versiones en inglés son redirects.

### Convenciones a respetar

- No hacer queries a Supabase desde Client Components.
- Al agregar un campo a una sección: actualizar tipo TypeScript + fallback + `SECTION_DEFINITIONS` + migración SQL.
- Las Server Actions siempre llaman `revalidatePath` al terminar.
- Los helpers de formato/normalización van en `src/lib/`, no en los componentes.
- `SiteHeader` y `SiteFooter` se importan desde `@/components/layout/`, no desde `home/`.
- El lightbox se importa desde `@/components/ui/tattoo-image-lightbox`.
- `resolveImageUrl` se importa desde `@/lib/supabase/storage`.

---

## 8. Guidelines para futuras IAs

### Antes de tocar cualquier cosa

1. **Leer este documento completo**.
2. Identificar qué tipo de cambio es: ¿UI pura? ¿Nuevo campo? ¿Nueva sección? ¿Lógica de filtrado?
3. Verificar si el cambio requiere también una **migración SQL**.

### Reglas operativas

- **No mover archivos** sin revisar todos los imports. Usar `grep -r "@/components/layout/site-header"` para rastrear dependencias.
- **No hacer refactors grandes** sin explicar impacto.
- **Mantener cambios pequeños y acotados**.
- **No duplicar lógica** que ya existe en `src/lib/` o `src/data/`.
- **Buscar primero** antes de crear: helpers, hooks, componentes, tipos.
- **No usar `tr -d '\0'` para limpiar archivos** — trunca el contenido. Si hay null bytes, usar `cat >` con heredoc para reescribir.
- **No agregar `"use server"` a barrels de re-export** — Next.js lo rechaza.
- **No mezclar** lógica de negocio en componentes de presentación.

### Lo que NO hacer

- No hacer queries a Supabase desde Client Components.
- No hardcodear texto que debería ser editable desde el admin.
- No ignorar los fallbacks al agregar campos nuevos.
- No eliminar las rutas de redirect legacy (`/portfolio`, `/porfolio`, `/flash`).
- No cambiar `SECTION_DEFINITIONS` sin entender cómo afecta el parseo de forms en `sections.ts`.

---

## 9. Pendientes y deuda técnica

### Revisión recomendada

- **Componentes de card potencialmente duplicados**: `flash-card.tsx` (home) vs `flash-design-card.tsx` (flash), y `tattoo-card.tsx` (home) vs `portfolio-card.tsx` (portfolio). Revisar si se pueden unificar o si las diferencias de contexto lo justifican.
- **Fallbacks multi-capa en `content.ts`**: `getPortfolioItemsByVisibility` y `getFlashDesignsByVisibility` tienen 3 niveles de fallback de queries para columnas legacy (`published_date`, `tags`, `is_active`). Si el schema de producción ya tiene todas esas columnas, se puede simplificar significativamente.
- **`updatePageSectionContent` en `sections.ts`**: función agregada durante el refactor. Verificar que funciona correctamente con `/admin/pantallas`.

### ISR / Caché — para cuando escale el tráfico

<!-- FUTURO: ISR con cache tags -->
<!-- Problema que resuelve: hoy todas las páginas públicas tienen force-dynamic,
     lo que significa que cada visita hace queries a Supabase en tiempo real.
     Si el tráfico crece, esto puede ser un cuello de botella.

     Solución propuesta: migrar a ISR con cache tags de Next.js 15.
     
     Pasos necesarios:
     1. Reemplazar "export const dynamic = 'force-dynamic'" por "export const revalidate = X"
        en las páginas públicas (trabajos, disenos, contact, home).
     2. En content.ts, envolver las queries con unstable_cache() y asignar tags:
        - tag "portfolio" para getPortfolioItems / getFeaturedPortfolioItems
        - tag "flash" para getFlashDesigns / getFeaturedFlashDesigns
        - tag "sections" para getHomeSections / getPageSection
        - tag "settings" para getSiteSettings
     3. En las Server Actions de mutación, reemplazar revalidatePath() por revalidateTag():
        - portfolio.ts: revalidateTag("portfolio") en lugar de revalidatePath("/trabajos")
        - flash.ts: revalidateTag("flash")
        - sections.ts: revalidateTag("sections")
        - settings.ts: revalidateTag("settings")
     4. El admin sigue viendo cambios instantáneos porque /admin sigue con force-dynamic.
     
     Riesgo: si se olvida algún revalidateTag en alguna action, el sitio puede
     quedar sirviendo contenido desactualizado sin que sea obvio.
     
     Momento recomendado para implementar: cuando haya tráfico medible o cuando
     el tiempo de carga se vuelva un problema. No antes. -->

### Desacoplamiento de imagen del about

<!-- FUTURO: imagen del about desacoplada de contactPage -->
<!-- Hoy getAboutImage() lee de contactPage.style.image.
     Para desacoplar:
     1. Agregar campo "image" a AboutHomeSectionStyle en home-sections.ts
     2. Agregar field de imagen en SECTION_DEFINITIONS.about (home-section-schema.ts)
     3. Migración SQL: copiar el valor de contact_main.style->image al about section
     4. Actualizar getAboutImage() en content.ts para leer del about home section
     Requiere migración de datos en producción. -->

### Posibles mejoras futuras

- Metadata SEO dinámica por página leyendo de Supabase (hoy es estática).
- Tests de integración para las Server Actions.
- Expandir cobertura de tests a `home-section-schema.ts` (normalización de sections).

---

## Resumen de lectura prioritaria para futuras IAs

**Antes de cualquier cambio, leer en este orden:**

1. **Este documento** (`PROJECT_CONTEXT.md`) — contexto general y cambios recientes.
2. **`src/data/home-sections.ts`** + **`src/data/page-sections.ts`** — tipos y fallbacks.
3. **`src/data/home-section-schema.ts`** — `SECTION_DEFINITIONS` y parseo de formularios.
4. **`src/lib/supabase/content.ts`** — queries y fallbacks de Supabase.
5. **`src/app/admin/actions/index.ts`** — barrel de Server Actions (punto de entrada).
6. El módulo específico de actions relevante al cambio (`portfolio.ts`, `flash.ts`, `sections.ts`, etc.).
7. El componente específico a modificar.

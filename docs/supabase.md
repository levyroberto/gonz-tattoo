# Supabase setup

Proyecto: `gonz-tattoo-db`

## Variables de entorno

Crear un archivo `.env.local` con:

```txt
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=TU_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY
```

`SUPABASE_SERVICE_ROLE_KEY` queda solo del lado servidor. No la publiques ni la uses en componentes client.

## Crear tablas

1. Entrar al dashboard de Supabase.
2. Ir a SQL Editor.
3. Pegar y ejecutar el contenido de `supabase/schema.sql`.

El script crea estructura y políticas. No inserta contenido de ejemplo.

## Aplicar migraciones

Si la base ya existe y solo querés aplicar cambios nuevos, ejecutá el SQL correspondiente dentro de `supabase/migrations/`.

Para que los estilos de tatuaje se administren desde Supabase, ejecutá:

```txt
supabase/migrations/20260530110800_add_tattoo_styles.sql
```

Después podés editar opciones desde la tabla `tattoo_styles`. El dropdown del admin muestra las filas con `is_active = true`.

Para crear o actualizar la fila inicial de configuración del sitio, ejecutá:

```txt
supabase/migrations/20260530112500_seed_site_settings.sql
```

Para convertir los precios de flash de texto a enteros, ejecutá:

```txt
supabase/migrations/20260530113500_flash_price_to_integer.sql
```

## Configuración del sitio

Crear una fila en `site_settings` con `id = 1`. Esa fila alimenta marca, redes, dirección, horarios y datos básicos del artista.

## Crear usuario admin real

1. Ir a Authentication.
2. Abrir Users.
3. Crear un usuario con email y contraseña.
4. Usar ese email y contraseña en `/admin/login`.

Las políticas actuales permiten que cualquier usuario autenticado administre portfolio, flash y consultas. Para el MVP conviene tener un solo usuario admin creado a mano.

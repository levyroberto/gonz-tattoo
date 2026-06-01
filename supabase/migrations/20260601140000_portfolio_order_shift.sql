-- Normaliza el orden actual de portfolio_items a 1..N (positivo y contiguo),
-- respetando el orden existente (display_order, luego id como desempate).
with ordered as (
  select id, row_number() over (order by display_order asc, id asc) as rn
  from public.portfolio_items
)
update public.portfolio_items as p
set display_order = o.rn
from ordered as o
where p.id = o.id;

-- Corre todos los display_order +1 en una sola sentencia atómica.
-- Se usa al crear un tatuaje para dejar libre el puesto 1 (nuevo primero),
-- manteniendo display_order siempre positivo sin reescribir filas desde la app.
create or replace function public.shift_portfolio_display_order()
returns void
language sql
as $$
  update public.portfolio_items set display_order = display_order + 1;
$$;

grant execute on function public.shift_portfolio_display_order() to authenticated;

-- Normaliza el orden actual de flash_designs a 1..N (positivo y contiguo),
-- respetando el orden existente (display_order, luego id como desempate).
with ordered as (
  select id, row_number() over (order by display_order asc, id asc) as rn
  from public.flash_designs
)
update public.flash_designs as f
set display_order = o.rn
from ordered as o
where f.id = o.id;

-- Corre todos los display_order +1 en una sola sentencia atomica.
-- Se usa al crear un diseno para dejar libre el puesto 1 (nuevo primero).
create or replace function public.shift_flash_display_order()
returns void
language sql
as $$
  update public.flash_designs set display_order = display_order + 1;
$$;

grant execute on function public.shift_flash_display_order() to authenticated;

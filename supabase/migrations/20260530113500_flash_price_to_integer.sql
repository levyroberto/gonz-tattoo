alter table public.flash_designs
alter column price type integer
using coalesce(nullif(regexp_replace(price::text, '[^0-9]', '', 'g'), '')::integer, 0);

alter table public.flash_designs
alter column price set default 0;

alter table public.flash_designs
alter column price set not null;

alter table public.flash_designs
drop constraint if exists flash_designs_price_check;

alter table public.flash_designs
add constraint flash_designs_price_check check (price >= 0);

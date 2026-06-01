alter table public.portfolio_items
add column if not exists published_date date;

update public.portfolio_items
set published_date = created_at::date
where published_date is null;

alter table public.portfolio_items
alter column published_date set default current_date;

alter table public.portfolio_items
alter column published_date set not null;

alter table public.portfolio_items
add column if not exists tags text[] not null default '{}'::text[];

alter table public.flash_designs
add column if not exists tags text[] not null default '{}'::text[];

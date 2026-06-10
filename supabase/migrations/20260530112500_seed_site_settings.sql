insert into public.site_settings (
  id,
  brand_name,
  instagram_url,
  whatsapp_url,
  artist_name,
  updated_at
)
values (
  1,
  'GONZ TATTOO',
  'https://www.instagram.com/gonztattoo',
  'https://wa.link/eodxzz',
  'Gonzalo Regueira',
  now()
)
on conflict (id) do update
set
  brand_name = excluded.brand_name,
  instagram_url = excluded.instagram_url,
  whatsapp_url = excluded.whatsapp_url,
  artist_name = excluded.artist_name,
  updated_at = now();

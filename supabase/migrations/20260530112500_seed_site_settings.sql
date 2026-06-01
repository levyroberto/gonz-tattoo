insert into public.site_settings (
  id,
  brand_name,
  footer_tagline,
  instagram_url,
  whatsapp_url,
  artist_name,
  updated_at
)
values (
  1,
  'GONZ TATTOO',
  'Tatuajes old school, diseños tradicionales y tinta con carácter.',
  'https://www.instagram.com/gonztattoo',
  'https://wa.link/eodxzz',
  'Gonzalo Regueira',
  now()
)
on conflict (id) do update
set
  brand_name = excluded.brand_name,
  footer_tagline = excluded.footer_tagline,
  instagram_url = excluded.instagram_url,
  whatsapp_url = excluded.whatsapp_url,
  artist_name = excluded.artist_name,
  updated_at = now();

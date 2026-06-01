insert into public.site_sections (
  page_key,
  section_key,
  type,
  enabled,
  display_order,
  content,
  layout,
  style,
  updated_at
)
values (
  'global',
  'site-footer',
  'footer',
  true,
  10,
  '{
    "tagline": "",
    "legalText": ""
  }'::jsonb,
  '{"variant": "default"}'::jsonb,
  '{"background": "card"}'::jsonb,
  now()
)
on conflict (page_key, section_key) do nothing;

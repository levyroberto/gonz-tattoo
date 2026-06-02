update public.site_sections
set
  content = '{
    "title": "SOBRE MI",
    "paragraphs": [
      "Soy Gonzalo Regueira, tatuador enfocado en piezas old school, diseños tradicionales y trabajos con linea clara.",
      "Cada tatuaje se piensa para que funcione en el cuerpo: contraste, lectura a distancia y una presencia que envejezca bien."
    ],
    "quote": "La idea es que cada pieza tenga caracter, oficio y algo propio de quien la lleva.",
    "stats": [
      { "value": "Old", "label": "school", "tone": "primary" },
      { "value": "Flash", "label": "y personalizados", "tone": "secondary" },
      { "value": "CABA", "label": "Parque Chacabuco", "tone": "accent" }
    ]
  }'::jsonb,
  style = jsonb_set(
    coalesce(style, '{}'::jsonb),
    '{image}',
    '"/images/artist/artist-portrait-01.jpg"'::jsonb,
    true
  ),
  updated_at = now()
where page_key = 'about'
  and section_key = 'about-main'
  and type = 'aboutPage'
  and (
    coalesce(nullif(trim(content->>'title'), ''), '') = ''
    or coalesce(jsonb_array_length(content->'paragraphs'), 0) = 0
  );

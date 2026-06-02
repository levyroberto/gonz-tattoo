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
values
  (
    'portfolio',
    'portfolio-main',
    'portfolioPage',
    true,
    10,
    '{
      "eyebrow": "Mis trabajos",
      "title": "TRABAJOS",
      "highlightedTitle": "REALIZADOS",
      "description": "Algunos trabajos realizados, con linea, contraste y presencia."
    }'::jsonb,
    '{"columnsDesktop": 4, "columnsTablet": 2, "layoutStyle": "default-grid"}'::jsonb,
    '{"background": "default"}'::jsonb,
    now()
  ),
  (
    'flash',
    'flash-main',
    'flashPage',
    true,
    10,
    '{
      "eyebrow": "Listos para tatuar",
      "title": "",
      "highlightedTitle": "DISEÑOS",
      "description": "Diseños tradicionales listos para elegir, ubicar y tatuar con lineas claras.",
      "emptyState": "No hay diseños con este estado por ahora.",
      "missingDesignState": "No encontramos ese diseño por ahora."
    }'::jsonb,
    '{"columnsDesktop": 3, "columnsTablet": 2, "layoutStyle": "default-grid"}'::jsonb,
    '{"background": "default"}'::jsonb,
    now()
  ),
  (
    'about',
    'about-main',
    'aboutPage',
    true,
    10,
    '{
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
    '{"imageSide": "left", "layoutStyle": "image-left"}'::jsonb,
    '{"background": "card", "image": "/images/artist/artist-portrait-01.jpg"}'::jsonb,
    now()
  ),
  (
    'contact',
    'contact-main',
    'contactPage',
    true,
    10,
    '{
      "eyebrow": ".",
      "title": "CONTACT",
      "highlightedTitle": "AME",
      "description": "Las consultas por diseños personalizados se coordinan directo con el artista. Manda tu idea, ubicacion, tamaño aproximado y referencias.",
      "cardEyebrow": "Consulta por tatuaje personalizado",
      "cardTitle": "CONTACTO",
      "cardHighlightedTitle": "DIRECTO",
      "cardDescription": "La reserva online todavia no esta disponible. Por ahora, escribi directo con tu idea, ubicacion preferida, tamaño aproximado, presupuesto estimado y disponibilidad.",
      "whatsappLabel": "WhatsApp",
      "instagramLabel": "Instagram",
      "yearsLabel": "Años",
      "addressValue": "6969",
      "scheduleValue": "Mar-Sab",
      "directValue": "Diseños",
      "directLabel": "Consultas directas"
    }'::jsonb,
    '{"layoutStyle": "image-left-card"}'::jsonb,
    '{"background": "default", "image": "/images/artist/artist-portrait-01.jpg"}'::jsonb,
    now()
  )
on conflict (page_key, section_key) do nothing;

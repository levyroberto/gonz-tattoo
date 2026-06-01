import type { HomeSection, HomeSectionType } from "@/data/home-sections"

export type SectionFieldType =
  | "text"
  | "textarea"
  | "number"
  | "checkbox"
  | "internalLink"
  | "styleFilter"
  | "image"
  | "paragraphs"
  | "stats"

export type SectionFieldWidth = "full" | "half" | "third"

/** Variante visual para previsualizar un input de etiqueta como el botón real del sitio. */
export type ButtonPreviewVariant = "primaryFilled" | "primaryOutline" | "secondaryFilled" | "secondaryOutline"

export type SectionFieldDefinition = {
  /** Clave dentro de `content` (o `style` cuando target = "style"). */
  key: string
  /** Nombre del campo en el formulario (snake_case). */
  formName: string
  label: string
  type: SectionFieldType
  required?: boolean
  width?: SectionFieldWidth
  /** Renderiza el campo dentro de la caja de "filtros" con el badge de tipo de contenido. */
  inFilterBox?: boolean
  /** Valor por defecto al crear una sección nueva. */
  defaultValue?: string | number | boolean
  /** Fallback al parsear números vacíos/ inválidos. */
  numberFallback?: number
  /** Origen de opciones para los selects de estilo. */
  styleOptions?: "tattoo" | "flash"
  /** Dónde vive el valor: por defecto en `content`. */
  target?: "content" | "style"
  /** Carpeta del storage para campos de imagen. */
  imageFolder?: "flash" | "hero" | "portfolio"
  /** Renderiza el input como una preview del botón real del sitio. */
  buttonPreview?: ButtonPreviewVariant
}

export type SectionContentTypeBadge = {
  label: string
  description: string
  className: string
}

export type SectionDefinition = {
  type: HomeSectionType
  /** Nombre por defecto cuando no hay título dinámico. */
  label: string
  description: string
  source: string
  badge: SectionContentTypeBadge
  contents: string[]
  /** Aparece en el selector "Agregar sección". */
  creatable: boolean
  createLabel?: string
  /** Muestra el botón de borrar dentro del panel. */
  deletable: boolean
  /** Claves de `content` (en orden) de las que se deriva el nombre mostrado. */
  titleFields: string[]
  fields: SectionFieldDefinition[]
  defaults: {
    content: Record<string, unknown>
    layout: Record<string, unknown>
    style: Record<string, unknown>
  }
}

const mutedBadgeClassName = "border-border bg-muted text-muted-foreground"

export const SECTION_DEFINITIONS: Record<HomeSectionType, SectionDefinition> = {
  hero: {
    type: "hero",
    label: "Portada",
    description: "Primera pantalla de la web. Muestra imagen de fondo, título principal, texto corto y botones.",
    source: "Contenido de Portada",
    badge: {
      label: "Portada",
      description: "Esta sección muestra contenido editorial de la home.",
      className: mutedBadgeClassName,
    },
    contents: ["Imagen de fondo", "Título principal", "Texto corto", "Botones"],
    creatable: false,
    deletable: false,
    titleFields: ["brandPrimary", "brandAccent"],
    fields: [
      { key: "backgroundImage", formName: "image_url", label: "Imagen de fondo", type: "image", target: "style", imageFolder: "hero", width: "full" },
      { key: "eyebrow", formName: "eyebrow", label: "Eyebrow", type: "text", required: true, width: "full" },
      { key: "brandPrimary", formName: "brand_primary", label: "Marca principal", type: "text", required: true, width: "half" },
      { key: "brandAccent", formName: "brand_accent", label: "Marca destacada", type: "text", required: true, width: "half" },
      { key: "description", formName: "description", label: "Descripción", type: "textarea", required: true, width: "full" },
      { key: "primaryButtonLabel", formName: "primary_button_label", label: "Botón principal", type: "text", required: true, width: "half", buttonPreview: "primaryFilled" },
      { key: "primaryButtonHref", formName: "primary_button_href", label: "Link principal", type: "internalLink", required: true, width: "half" },
      { key: "secondaryButtonLabel", formName: "secondary_button_label", label: "Botón secundario", type: "text", required: true, width: "half", buttonPreview: "secondaryOutline" },
      { key: "secondaryButtonHref", formName: "secondary_button_href", label: "Link secundario", type: "internalLink", required: true, width: "half" },
    ],
    defaults: {
      content: {
        eyebrow: "",
        brandPrimary: "",
        brandAccent: "",
        description: "",
        primaryButtonLabel: "",
        primaryButtonHref: "",
        secondaryButtonLabel: "",
        secondaryButtonHref: "",
      },
      layout: { imagePositionMode: "rotating-mobile" },
      style: { backgroundImage: "", overlay: "dark" },
    },
  },
  featuredPortfolio: {
    type: "featuredPortfolio",
    label: "Galería destacada",
    description: "Muestra los tatuajes marcados como destacados en Portfolio.",
    source: "Portfolio > destacados",
    badge: {
      label: "Tatuajes",
      description: "Esta sección muestra trabajos cargados en Portfolio.",
      className: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    },
    contents: ["Título", "Carrusel", "Tatuajes", "Botón"],
    creatable: true,
    createLabel: "Tatuajes - nueva galería filtrable",
    deletable: true,
    titleFields: ["title", "highlightedTitle"],
    fields: [
      { key: "eyebrow", formName: "eyebrow", label: "Eyebrow", type: "text", required: true, width: "full" },
      { key: "title", formName: "title", label: "Título", type: "text", required: true, width: "half" },
      { key: "highlightedTitle", formName: "highlighted_title", label: "Título destacado", type: "text", required: true, width: "half" },
      { key: "buttonLabel", formName: "button_label", label: "Botón", type: "text", required: true, width: "half", buttonPreview: "primaryOutline" },
      { key: "buttonHref", formName: "button_href", label: "Link del botón", type: "internalLink", required: true, width: "half" },
      { key: "filterTags", formName: "filter_tags", label: "Tags a mostrar", type: "text", required: false, width: "half", inFilterBox: true },
      { key: "filterStyle", formName: "filter_style", label: "Estilo a mostrar", type: "styleFilter", styleOptions: "tattoo", width: "half", inFilterBox: true },
      { key: "dateFrom", formName: "date_from", label: "Desde fecha", type: "text", required: false, width: "half", inFilterBox: true },
      { key: "dateTo", formName: "date_to", label: "Hasta fecha", type: "text", required: false, width: "half", inFilterBox: true },
      { key: "limit", formName: "limit", label: "Cantidad máxima", type: "number", numberFallback: 4, width: "half", inFilterBox: true },
      { key: "featuredOnly", formName: "featured_only", label: "Solo destacados", type: "checkbox", width: "half", inFilterBox: true },
    ],
    defaults: {
      content: {
        eyebrow: "",
        title: "",
        highlightedTitle: "",
        buttonLabel: "",
        buttonHref: "",
        dateFrom: "",
        dateTo: "",
        featuredOnly: false,
        filterStyle: "",
        filterTags: "",
        limit: 6,
      },
      layout: { variant: "carousel" },
      style: { background: "card" },
    },
  },
  flashPreview: {
    type: "flashPreview",
    label: "Diseños listos",
    description: "Muestra los primeros diseños flash activos.",
    source: "Diseños flash activos",
    badge: {
      label: "Diseños",
      description: "Esta sección muestra diseños flash cargados en Diseños.",
      className: "border-cyan-500/35 bg-cyan-500/10 text-cyan-300",
    },
    contents: ["Título", "Descripción", "Grilla de diseños", "Botón"],
    creatable: true,
    createLabel: "Diseños - nueva sección filtrable",
    deletable: true,
    titleFields: ["highlightedTitle"],
    fields: [
      { key: "eyebrow", formName: "eyebrow", label: "Eyebrow", type: "text", required: true, width: "full" },
      { key: "highlightedTitle", formName: "highlighted_title", label: "Título destacado", type: "text", required: true, width: "full" },
      { key: "description", formName: "description", label: "Descripción", type: "textarea", required: true, width: "full" },
      { key: "buttonLabel", formName: "button_label", label: "Botón", type: "text", required: true, width: "half", buttonPreview: "secondaryFilled" },
      { key: "buttonHref", formName: "button_href", label: "Link del botón", type: "internalLink", required: true, width: "half" },
      { key: "filterTags", formName: "filter_tags", label: "Tags a mostrar", type: "text", required: false, width: "half", inFilterBox: true },
      { key: "filterStyle", formName: "filter_style", label: "Estilo a mostrar", type: "styleFilter", styleOptions: "flash", width: "half", inFilterBox: true },
      { key: "limit", formName: "limit", label: "Cantidad máxima", type: "number", numberFallback: 6, width: "half", inFilterBox: true },
    ],
    defaults: {
      content: {
        eyebrow: "",
        highlightedTitle: "",
        description: "",
        buttonLabel: "",
        buttonHref: "",
        filterStyle: "",
        filterTags: "",
        limit: 6,
      },
      layout: { columnsDesktop: 3, columnsMobile: 2 },
      style: { background: "default", frame: "paper" },
    },
  },
  about: {
    type: "about",
    label: "Sobre mí",
    description: "Muestra foto del artista, presentación, frase destacada y métricas.",
    source: "Contenido de Sobre mí",
    badge: {
      label: "Sobre mí",
      description: "Esta sección muestra la presentación del artista.",
      className: mutedBadgeClassName,
    },
    contents: ["Imagen", "Presentación", "Frase destacada", "Métricas"],
    creatable: false,
    deletable: false,
    titleFields: ["title"],
    fields: [
      { key: "title", formName: "title", label: "Título", type: "text", required: false, width: "full" },
      { key: "paragraphs", formName: "paragraphs", label: "Párrafos", type: "paragraphs", required: true, width: "full" },
      { key: "quote", formName: "quote", label: "Quote", type: "textarea", required: true, width: "full" },
      { key: "stats", formName: "stats", label: "Métricas", type: "stats", width: "full" },
    ],
    defaults: {
      content: {
        title: "",
        paragraphs: [],
        quote: "",
        stats: [
          { value: "", label: "", tone: "primary" },
          { value: "", label: "", tone: "secondary" },
          { value: "", label: "", tone: "accent" },
        ],
      },
      layout: { imageSide: "left" },
      style: { background: "card", image: "" },
    },
  },
  contactCta: {
    type: "contactCta",
    label: "Bloque de contacto",
    description: "Muestra texto de consulta, botones de WhatsApp/Instagram, dirección y horarios.",
    source: "Datos del estudio + Bloque de contacto",
    badge: {
      label: "Contacto",
      description: "Esta sección muestra datos de contacto y llamados a consulta.",
      className: mutedBadgeClassName,
    },
    contents: ["Texto de consulta", "WhatsApp", "Instagram", "Dirección y horarios"],
    creatable: false,
    deletable: false,
    titleFields: [],
    fields: [
      { key: "eyebrow", formName: "eyebrow", label: "Eyebrow", type: "text", required: true, width: "full" },
      { key: "title", formName: "title", label: "Título", type: "text", required: true, width: "half" },
      { key: "highlightedTitle", formName: "highlighted_title", label: "Título destacado", type: "text", required: true, width: "half" },
      { key: "description", formName: "description", label: "Descripción", type: "textarea", required: true, width: "full" },
      { key: "whatsappLabel", formName: "whatsapp_label", label: "Botón 1", type: "text", required: true, width: "third", buttonPreview: "primaryFilled" },
      { key: "instagramLabel", formName: "instagram_label", label: "Botón 2", type: "text", required: true, width: "third", buttonPreview: "secondaryOutline" },
      { key: "hoursLabel", formName: "hours_label", label: "Label horario", type: "text", required: true, width: "third" },
    ],
    defaults: {
      content: {
        eyebrow: "",
        title: "",
        highlightedTitle: "",
        description: "",
        whatsappLabel: "",
        instagramLabel: "",
        hoursLabel: "",
      },
      layout: { alignment: "center" },
      style: { background: "default", divider: "glow" },
    },
  },
}

function getTrimmedString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim()
}

function getPositiveInteger(value: FormDataEntryValue | null, fallback: number) {
  const parsedValue = Number(String(value ?? "").trim())

  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : fallback
}

function getParagraphs(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split("\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

/**
 * Parsea los valores de `content` de una sección a partir del FormData del
 * formulario, usando el schema. Es puro y sirve tanto en server (al guardar)
 * como en cliente (para la vista previa en tiempo real).
 */
export function parseSectionContentFromForm(formData: FormData, definition: SectionDefinition): Record<string, unknown> {
  const content: Record<string, unknown> = {}

  for (const field of definition.fields) {
    if (field.type === "image" || field.target === "style") {
      continue
    }

    switch (field.type) {
      case "number":
        content[field.key] = getPositiveInteger(formData.get(field.formName), field.numberFallback ?? 0)
        break
      case "checkbox":
        content[field.key] = formData.get(field.formName) === "on"
        break
      case "paragraphs":
        content[field.key] = getParagraphs(formData.get(field.formName))
        break
      case "stats":
        content[field.key] = [0, 1, 2].map((index) => ({
          value: getTrimmedString(formData, `stat_value_${index}`),
          label: getTrimmedString(formData, `stat_label_${index}`),
          tone: getTrimmedString(formData, `stat_tone_${index}`),
        }))
        break
      default:
        content[field.key] = getTrimmedString(formData, field.formName)
    }
  }

  return content
}

export function getSectionDefinition(type: string): SectionDefinition | undefined {
  return SECTION_DEFINITIONS[type as HomeSectionType]
}

export function getCreatableSectionDefinitions(): SectionDefinition[] {
  return Object.values(SECTION_DEFINITIONS).filter((definition) => definition.creatable)
}

export function getSectionImageField(definition: SectionDefinition): SectionFieldDefinition | undefined {
  return definition.fields.find((field) => field.type === "image")
}

export function getSectionDisplayTitle(section: Pick<HomeSection, "type" | "content">): string {
  const definition = getSectionDefinition(section.type)

  if (!definition) {
    return section.type
  }

  const content = section.content as Record<string, unknown>

  const composedTitle = definition.titleFields
    .map((fieldKey) => content[fieldKey])
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .map((value) => value.trim())
    .join(" ")

  return composedTitle || definition.label
}

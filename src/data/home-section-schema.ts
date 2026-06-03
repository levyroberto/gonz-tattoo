import type { HomeSection, HomeSectionType } from "@/data/home-sections"
import type { PageSection, PageSectionType } from "@/data/page-sections"
import { pageSections } from "@/data/page-sections"

export type EditableSiteSection = HomeSection | PageSection
export type EditableSiteSectionType = HomeSectionType | PageSectionType

export type SectionFieldType =
  | "text"
  | "textarea"
  | "select"
  | "number"
  | "checkbox"
  | "internalLink"
  | "styleFilter"
  | "image"
  | "paragraphs"
  | "stats"

export type SectionFieldWidth = "full" | "half" | "third"

/** Variante visual para previsualizar un input de etiqueta como el botón real del sitio. */
export type ButtonPreviewVariant = "primaryFilled" | "primaryOutline" | "secondaryFilled" | "secondaryOutline" | "doubleBorder"

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
  /** Límite inferior opcional para campos numéricos. */
  min?: number
  /** Límite superior opcional para campos numéricos. */
  max?: number
  /** Origen de opciones para los selects de estilo. */
  styleOptions?: "tattoo" | "flash"
  /** Dónde vive el valor: por defecto en `content`. */
  target?: "content" | "layout" | "style"
  /** Opciones fijas para campos select. */
  options?: Array<{ label: string; value: string }>
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
  type: EditableSiteSectionType
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
const galleryLayoutStyleOptions = [
  { label: "Carrusel", value: "carousel" },
  { label: "Grilla", value: "grid" },
  { label: "Grilla enmarcada", value: "framed-grid" },
  { label: "Grilla bento", value: "bento-grid" },
]

export const SECTION_DEFINITIONS: Record<EditableSiteSectionType, SectionDefinition> = {
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
      { key: "layoutStyle", formName: "layout_style", label: "Layout style", type: "select", target: "layout", width: "half", options: [{ label: "Portada centrada", value: "centered-overlay" }] },
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
      layout: { imagePositionMode: "rotating-mobile", layoutStyle: "centered-overlay" },
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
      { key: "title", formName: "title", label: "Título", type: "text", required: true, width: "half" },
      { key: "highlightedTitle", formName: "highlighted_title", label: "Título destacado", type: "text", required: true, width: "half" },
      { key: "eyebrow", formName: "eyebrow", label: "Eyebrow", type: "text", required: true, width: "full" },
      { key: "layoutStyle", formName: "layout_style", label: "Layout style", type: "select", target: "layout", width: "half", options: galleryLayoutStyleOptions },
      { key: "columnsDesktop", formName: "columns_desktop", label: "Columnas a mostrar", type: "number", target: "layout", numberFallback: 3, min: 2, max: 8, width: "half" },
      { key: "buttonLabel", formName: "button_label", label: "Botón", type: "text", required: true, width: "half", buttonPreview: "primaryOutline" },
      { key: "buttonHref", formName: "button_href", label: "Link del botón", type: "internalLink", required: true, width: "half" },
      { key: "filterTags", formName: "filter_tags", label: "Filtrar por: Tags", type: "text", required: false, width: "half", inFilterBox: true },
      { key: "filterStyle", formName: "filter_style", label: "Filtrar por: Estilo", type: "styleFilter", styleOptions: "tattoo", width: "half", inFilterBox: true },
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
        itemOrder: [],
        limit: 6,
      },
      layout: { columnsDesktop: 3, variant: "carousel", layoutStyle: "carousel" },
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
      { key: "highlightedTitle", formName: "highlighted_title", label: "Título destacado", type: "text", required: true, width: "full" },
      { key: "eyebrow", formName: "eyebrow", label: "Eyebrow", type: "text", required: true, width: "full" },
      { key: "layoutStyle", formName: "layout_style", label: "Layout style", type: "select", target: "layout", width: "half", options: galleryLayoutStyleOptions },
      { key: "columnsDesktop", formName: "columns_desktop", label: "Columnas a mostrar", type: "number", target: "layout", numberFallback: 3, min: 2, max: 8, width: "half" },
      { key: "description", formName: "description", label: "Descripción", type: "textarea", required: true, width: "full" },
      { key: "buttonLabel", formName: "button_label", label: "Botón", type: "text", required: true, width: "half", buttonPreview: "secondaryFilled" },
      { key: "buttonHref", formName: "button_href", label: "Link del botón", type: "internalLink", required: true, width: "half" },
      { key: "filterTags", formName: "filter_tags", label: "Filtrar por: Tags", type: "text", required: false, width: "half", inFilterBox: true },
      { key: "filterStyle", formName: "filter_style", label: "Filtrar por: Estilo", type: "styleFilter", styleOptions: "flash", width: "half", inFilterBox: true },
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
        itemOrder: [],
        limit: 6,
      },
      layout: { columnsDesktop: 3, columnsMobile: 2, layoutStyle: "framed-grid" },
      style: { background: "default", frame: "paper" },
    },
  },
  about: {
    type: "about",
    label: "Sobre mí",
    description: "Muestra foto del artista, presentación y frase destacada.",
    source: "Contenido de Sobre mí",
    badge: {
      label: "Sobre mí",
      description: "Esta sección muestra la presentación del artista.",
      className: mutedBadgeClassName,
    },
    contents: ["Imagen", "Presentación", "Frase destacada"],
    creatable: false,
    deletable: false,
    titleFields: ["title"],
    fields: [
      { key: "title", formName: "title", label: "Título", type: "text", required: false, width: "full" },
      { key: "layoutStyle", formName: "layout_style", label: "Layout style", type: "select", target: "layout", width: "half", options: [{ label: "Imagen izquierda", value: "image-left" }] },
      { key: "paragraphs", formName: "paragraphs", label: "Párrafos", type: "paragraphs", required: true, width: "full" },
      { key: "quote", formName: "quote", label: "Quote", type: "textarea", required: true, width: "full" },
    ],
    defaults: {
      content: {
        title: "",
        paragraphs: [],
        quote: "",
      },
      layout: { imageSide: "left", layoutStyle: "image-left" },
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
      { key: "title", formName: "title", label: "Título", type: "text", required: true, width: "half" },
      { key: "highlightedTitle", formName: "highlighted_title", label: "Título destacado", type: "text", required: true, width: "half" },
      { key: "eyebrow", formName: "eyebrow", label: "Eyebrow", type: "text", required: true, width: "full" },
      { key: "layoutStyle", formName: "layout_style", label: "Layout style", type: "select", target: "layout", width: "half", options: [{ label: "Centrado", value: "centered" }] },
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
      layout: { alignment: "center", layoutStyle: "centered" },
      style: { background: "default", divider: "glow" },
    },
  },
  portfolioPage: {
    type: "portfolioPage",
    label: "Pantalla de tatuajes",
    description: "Configura el encabezado y la grilla principal de la pantalla Trabajos.",
    source: "Pantalla Trabajos",
    badge: {
      label: "Tatuajes",
      description: "Esta seccion configura la pantalla de tatuajes.",
      className: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    },
    contents: ["Encabezado", "Filtros", "Grilla"],
    creatable: false,
    deletable: false,
    titleFields: ["title", "highlightedTitle"],
    fields: [
      { key: "title", formName: "title", label: "Titulo", type: "text", required: true, width: "half" },
      { key: "highlightedTitle", formName: "highlighted_title", label: "Titulo destacado", type: "text", required: true, width: "half" },
      { key: "layoutStyle", formName: "layout_style", label: "Layout style", type: "select", target: "layout", width: "half", options: [{ label: "Grilla default", value: "default-grid" }] },
      { key: "eyebrow", formName: "eyebrow", label: "Eyebrow", type: "text", required: true, width: "half" },
      { key: "description", formName: "description", label: "Descripcion", type: "textarea", required: true, width: "full" },
    ],
    defaults: pageSections.portfolio,
  },
  flashPage: {
    type: "flashPage",
    label: "Pantalla de disenos",
    description: "Configura el encabezado, mensajes vacios y grilla principal de la pantalla Disenos.",
    source: "Pantalla Disenos",
    badge: {
      label: "Disenos",
      description: "Esta seccion configura la pantalla de disenos.",
      className: "border-cyan-500/35 bg-cyan-500/10 text-cyan-300",
    },
    contents: ["Encabezado", "Filtros", "Grilla", "Mensajes"],
    creatable: false,
    deletable: false,
    titleFields: ["highlightedTitle"],
    fields: [
      { key: "title", formName: "title", label: "Titulo", type: "text", required: false, width: "half" },
      { key: "highlightedTitle", formName: "highlighted_title", label: "Titulo destacado", type: "text", required: true, width: "half" },
      { key: "layoutStyle", formName: "layout_style", label: "Layout style", type: "select", target: "layout", width: "half", options: [{ label: "Grilla default", value: "default-grid" }] },
      { key: "eyebrow", formName: "eyebrow", label: "Eyebrow", type: "text", required: true, width: "half" },
      { key: "description", formName: "description", label: "Descripcion", type: "textarea", required: true, width: "full" },
      { key: "emptyState", formName: "empty_state", label: "Mensaje sin resultados", type: "text", required: true, width: "half" },
      { key: "missingDesignState", formName: "missing_design_state", label: "Mensaje diseno no encontrado", type: "text", required: true, width: "half" },
    ],
    defaults: pageSections.flash,
  },
  aboutPage: {
    type: "aboutPage",
    label: "Pantalla Sobre mi",
    description: "Configura el contenido principal de la pantalla Sobre mi.",
    source: "Pantalla Sobre mi",
    badge: {
      label: "Sobre mi",
      description: "Esta seccion configura la pantalla Sobre mi.",
      className: mutedBadgeClassName,
    },
    contents: ["Presentacion", "Frase"],
    creatable: false,
    deletable: false,
    titleFields: ["title"],
    fields: [
      { key: "layoutStyle", formName: "layout_style", label: "Layout style", type: "select", target: "layout", width: "half", options: [{ label: "Imagen izquierda", value: "image-left" }] },
      { key: "title", formName: "title", label: "Titulo", type: "text", required: false, width: "half" },
      { key: "paragraphs", formName: "paragraphs", label: "Parrafos", type: "paragraphs", required: true, width: "full" },
      { key: "quote", formName: "quote", label: "Quote", type: "textarea", required: false, width: "full" },
    ],
    defaults: pageSections.about,
  },
  contactPage: {
    type: "contactPage",
    label: "Pantalla Contacto",
    description: "Configura el encabezado, tarjeta de contacto e imagen de la pantalla Contacto.",
    source: "Pantalla Contacto",
    badge: {
      label: "Contacto",
      description: "Esta seccion configura la pantalla Contacto.",
      className: mutedBadgeClassName,
    },
    contents: ["Imagen", "Encabezado", "Tarjeta", "Datos"],
    creatable: false,
    deletable: false,
    titleFields: ["title", "highlightedTitle"],
    fields: [
      { key: "cardTitle", formName: "card_title", label: "Titulo pantalla", type: "text", required: true, width: "half" },
      { key: "cardHighlightedTitle", formName: "card_highlighted_title", label: "Titulo pantalla destacado", type: "text", required: true, width: "half" },
      { key: "image", formName: "image_url", label: "Imagen", type: "image", target: "style", imageFolder: "portfolio", required: false, width: "full" },
      { key: "title", formName: "title", label: "Titulo tarjeta", type: "text", required: true, width: "half" },
      { key: "highlightedTitle", formName: "highlighted_title", label: "Titulo tarjeta destacado", type: "text", required: true, width: "half" },
      { key: "layoutStyle", formName: "layout_style", label: "Layout style", type: "select", target: "layout", width: "half", options: [{ label: "Imagen izquierda + tarjeta", value: "image-left-card" }] },
      { key: "eyebrow", formName: "eyebrow", label: "Eyebrow", type: "text", required: true, width: "half" },
      { key: "description", formName: "description", label: "Descripcion", type: "textarea", required: true, width: "full" },
      { key: "cardEyebrow", formName: "card_eyebrow", label: "Eyebrow tarjeta", type: "text", required: true, width: "half" },
      { key: "cardDescription", formName: "card_description", label: "Descripcion tarjeta", type: "textarea", required: true, width: "full" },
      { key: "whatsappLabel", formName: "whatsapp_label", label: "Boton WhatsApp", type: "text", required: true, width: "half", buttonPreview: "primaryFilled" },
      { key: "instagramLabel", formName: "instagram_label", label: "Boton Instagram", type: "text", required: true, width: "half", buttonPreview: "secondaryOutline" },
      { key: "yearsLabel", formName: "years_label", label: "Label de foto", type: "text", required: true, width: "half" },
    ],
    defaults: pageSections.contact,
  },
}

function getTrimmedString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim()
}

function getPositiveInteger(value: FormDataEntryValue | null, fallback: number, min = 1, max = Number.MAX_SAFE_INTEGER) {
  const parsedValue = Number(String(value ?? "").trim())

  return Number.isInteger(parsedValue) && parsedValue >= min && parsedValue <= max ? parsedValue : fallback
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
    if (field.type === "image" || field.target === "layout" || field.target === "style") {
      continue
    }

    switch (field.type) {
      case "number":
        content[field.key] = getPositiveInteger(formData.get(field.formName), field.numberFallback ?? 0, field.min, field.max)
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

  if (definition.type === "featuredPortfolio" || definition.type === "flashPreview") {
    content.itemOrder = String(formData.get("item_order") ?? "")
      .split(",")
      .map((id) => Number(id.trim()))
      .filter((id) => Number.isInteger(id) && id > 0)
  }

  return content
}

export function parseSectionLayoutFromForm(formData: FormData, definition: SectionDefinition): Record<string, unknown> {
  const layout = { ...definition.defaults.layout }
  const layoutFields = definition.fields.filter((field) => field.target === "layout")

  for (const field of layoutFields) {
    if (field.type === "number") {
      layout[field.key] = getPositiveInteger(
        formData.get(field.formName),
        Number(definition.defaults.layout[field.key] ?? field.numberFallback ?? 0),
        field.min,
        field.max
      )
      continue
    }

    const value = getTrimmedString(formData, field.formName)
    const hasKnownOption = field.options?.some((option) => option.value === value) ?? true

    layout[field.key] = hasKnownOption ? value : definition.defaults.layout[field.key]
  }

  if (layout.layoutStyle === "bento-grid" || layout.layoutStyle === "carousel") {
    layout.columnsDesktop = 3
  }

  if (layout.layoutStyle === "framed-grid") {
    const columnsDesktop = Number(layout.columnsDesktop)

    layout.columnsDesktop = Number.isInteger(columnsDesktop) && columnsDesktop >= 2 && columnsDesktop <= 3 ? columnsDesktop : 3
  }

  return layout
}

export function getSectionDefinition(type: string): SectionDefinition | undefined {
  return SECTION_DEFINITIONS[type as EditableSiteSectionType]
}

export function getCreatableSectionDefinitions(): SectionDefinition[] {
  return Object.values(SECTION_DEFINITIONS).filter((definition) => definition.creatable)
}

export function getSectionImageField(definition: SectionDefinition): SectionFieldDefinition | undefined {
  return definition.fields.find((field) => field.type === "image")
}

export function getSectionDisplayTitle(section: Pick<EditableSiteSection, "type" | "content">): string {
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

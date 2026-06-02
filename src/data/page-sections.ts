type SectionBase<Type extends string, Content, Layout, Style> = {
  id: string
  type: Type
  enabled: boolean
  order: number
  content: Content
  layout: Layout
  style: Style
}

export type PortfolioPageSectionContent = {
  eyebrow: string
  title: string
  highlightedTitle: string
  description: string
}

export type PortfolioPageSectionLayout = {
  columnsDesktop: 4
  columnsTablet: 2
  layoutStyle: "default-grid"
}

export type PortfolioPageSectionStyle = {
  background: "default"
}

export type FlashPageSectionContent = {
  eyebrow: string
  title: string
  highlightedTitle: string
  description: string
  emptyState: string
  missingDesignState: string
}

export type FlashPageSectionLayout = {
  columnsDesktop: 3
  columnsTablet: 2
  layoutStyle: "default-grid"
}

export type FlashPageSectionStyle = {
  background: "default"
}

export type AboutPageSectionContent = {
  title: string
  paragraphs: string[]
  quote: string
  stats: Array<{
    value: string
    label: string
    tone: "primary" | "secondary" | "accent"
  }>
}

export type AboutPageSectionLayout = {
  imageSide: "left"
  layoutStyle: "image-left"
}

export type AboutPageSectionStyle = {
  background: "card"
  image: string
}

export type ContactPageSectionContent = {
  eyebrow: string
  title: string
  highlightedTitle: string
  description: string
  cardEyebrow: string
  cardTitle: string
  cardHighlightedTitle: string
  cardDescription: string
  whatsappLabel: string
  instagramLabel: string
  yearsLabel: string
  addressValue: string
  scheduleValue: string
  directValue: string
  directLabel: string
}

export type ContactPageSectionLayout = {
  layoutStyle: "image-left-card"
}

export type ContactPageSectionStyle = {
  background: "default"
  image: string
}

export type PortfolioPageSection = SectionBase<"portfolioPage", PortfolioPageSectionContent, PortfolioPageSectionLayout, PortfolioPageSectionStyle>
export type FlashPageSection = SectionBase<"flashPage", FlashPageSectionContent, FlashPageSectionLayout, FlashPageSectionStyle>
export type AboutPageSection = SectionBase<"aboutPage", AboutPageSectionContent, AboutPageSectionLayout, AboutPageSectionStyle>
export type ContactPageSection = SectionBase<"contactPage", ContactPageSectionContent, ContactPageSectionLayout, ContactPageSectionStyle>

export type PageSection = PortfolioPageSection | FlashPageSection | AboutPageSection | ContactPageSection
export type PageSectionType = PageSection["type"]
export type EditablePageKey = "portfolio" | "flash" | "about" | "contact"

export const pageSections: Record<EditablePageKey, PageSection> = {
  portfolio: {
    id: "portfolio-main",
    type: "portfolioPage",
    enabled: true,
    order: 10,
    content: {
      eyebrow: "Mis trabajos",
      title: "TRABAJOS",
      highlightedTitle: "REALIZADOS",
      description: "Algunos trabajos realizados, con linea, contraste y presencia.",
    },
    layout: {
      columnsDesktop: 4,
      columnsTablet: 2,
      layoutStyle: "default-grid",
    },
    style: {
      background: "default",
    },
  },
  flash: {
    id: "flash-main",
    type: "flashPage",
    enabled: true,
    order: 10,
    content: {
      eyebrow: "Listos para tatuar",
      title: "",
      highlightedTitle: "DISEÑOS",
      description: "Diseños tradicionales listos para elegir, ubicar y tatuar con lineas claras.",
      emptyState: "No hay diseños con este estado por ahora.",
      missingDesignState: "No encontramos ese diseño por ahora.",
    },
    layout: {
      columnsDesktop: 3,
      columnsTablet: 2,
      layoutStyle: "default-grid",
    },
    style: {
      background: "default",
    },
  },
  about: {
    id: "about-main",
    type: "aboutPage",
    enabled: true,
    order: 10,
    content: {
      title: "SOBRE MI",
      paragraphs: [
        "Soy Gonzalo Regueira, tatuador enfocado en piezas old school, diseños tradicionales y trabajos con linea clara.",
        "Cada tatuaje se piensa para que funcione en el cuerpo: contraste, lectura a distancia y una presencia que envejezca bien.",
      ],
      quote: "La idea es que cada pieza tenga caracter, oficio y algo propio de quien la lleva.",
      stats: [
        { value: "Old", label: "school", tone: "primary" },
        { value: "Flash", label: "y personalizados", tone: "secondary" },
        { value: "CABA", label: "Parque Chacabuco", tone: "accent" },
      ],
    },
    layout: {
      imageSide: "left",
      layoutStyle: "image-left",
    },
    style: {
      background: "card",
      image: "/images/artist/artist-portrait-01.jpg",
    },
  },
  contact: {
    id: "contact-main",
    type: "contactPage",
    enabled: true,
    order: 10,
    content: {
      eyebrow: ".",
      title: "CONTACT",
      highlightedTitle: "AME",
      description: "Las consultas por diseños personalizados se coordinan directo con el artista. Manda tu idea, ubicacion, tamaño aproximado y referencias.",
      cardEyebrow: "Consulta por tatuaje personalizado",
      cardTitle: "CONTACTO",
      cardHighlightedTitle: "DIRECTO",
      cardDescription: "La reserva online todavia no esta disponible. Por ahora, escribi directo con tu idea, ubicacion preferida, tamaño aproximado, presupuesto estimado y disponibilidad.",
      whatsappLabel: "WhatsApp",
      instagramLabel: "Instagram",
      yearsLabel: "Años",
      addressValue: "6969",
      scheduleValue: "Mar-Sab",
      directValue: "Diseños",
      directLabel: "Consultas directas",
    },
    layout: {
      layoutStyle: "image-left-card",
    },
    style: {
      background: "default",
      image: "/images/artist/artist-portrait-01.jpg",
    },
  },
}

export function getPageSectionFallback(pageKey: EditablePageKey) {
  return pageSections[pageKey]
}

export function getPageSectionsFallback() {
  return Object.entries(pageSections).map(([pageKey, section]) => ({ pageKey: pageKey as EditablePageKey, section }))
}

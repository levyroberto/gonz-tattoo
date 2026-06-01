type SectionBase<Type extends string, Content, Layout, Style> = {
  id: string
  type: Type
  enabled: boolean
  order: number
  content: Content
  layout: Layout
  style: Style
}

export type HeroSectionContent = {
  eyebrow: string
  brandPrimary: string
  brandAccent: string
  description: string
  primaryButtonLabel: string
  primaryButtonHref: string
  secondaryButtonLabel: string
  secondaryButtonHref: string
}

export type HeroSectionLayout = {
  imagePositionMode: "rotating-mobile"
}

export type HeroSectionStyle = {
  backgroundImage: string
  overlay: "dark"
}

export type FeaturedPortfolioSectionContent = {
  eyebrow: string
  title: string
  highlightedTitle: string
  buttonLabel: string
  buttonHref: string
}

export type FeaturedPortfolioSectionLayout = {
  variant: "carousel"
}

export type FeaturedPortfolioSectionStyle = {
  background: "card"
}

export type FlashPreviewSectionContent = {
  eyebrow: string
  highlightedTitle: string
  description: string
  buttonLabel: string
  buttonHref: string
}

export type FlashPreviewSectionLayout = {
  columnsDesktop: 3
  columnsMobile: 2
}

export type FlashPreviewSectionStyle = {
  background: "default"
  frame: "paper"
}

export type AboutSectionContent = {
  title: string
  paragraphs: string[]
  quote: string
  stats: Array<{
    value: string
    label: string
    tone: "primary" | "secondary" | "accent"
  }>
}

export type AboutSectionLayout = {
  imageSide: "left"
}

export type AboutSectionStyle = {
  background: "card"
  image: string
}

export type ContactCtaSectionContent = {
  eyebrow: string
  title: string
  highlightedTitle: string
  description: string
  whatsappLabel: string
  instagramLabel: string
  hoursLabel: string
}

export type ContactCtaSectionLayout = {
  alignment: "center"
}

export type ContactCtaSectionStyle = {
  background: "default"
  divider: "glow"
}

export type HeroHomeSection = SectionBase<"hero", HeroSectionContent, HeroSectionLayout, HeroSectionStyle>
export type FeaturedPortfolioHomeSection = SectionBase<
  "featuredPortfolio",
  FeaturedPortfolioSectionContent,
  FeaturedPortfolioSectionLayout,
  FeaturedPortfolioSectionStyle
>
export type FlashPreviewHomeSection = SectionBase<"flashPreview", FlashPreviewSectionContent, FlashPreviewSectionLayout, FlashPreviewSectionStyle>
export type AboutHomeSection = SectionBase<"about", AboutSectionContent, AboutSectionLayout, AboutSectionStyle>
export type ContactCtaHomeSection = SectionBase<"contactCta", ContactCtaSectionContent, ContactCtaSectionLayout, ContactCtaSectionStyle>

export type HomeSection =
  | HeroHomeSection
  | FeaturedPortfolioHomeSection
  | FlashPreviewHomeSection
  | AboutHomeSection
  | ContactCtaHomeSection

export const aboutSectionDefaults: Pick<AboutHomeSection, "content" | "layout" | "style"> = {
  content: {
    title: "",
    paragraphs: [
      "Trabaja la tradición del tatuaje con líneas firmes, contraste sólido y una mirada personal sobre cada pieza.",
      "Su base está en el old school y el tradicional: diseños claros, colores con presencia y tatuajes pensados para durar.",
    ],
    quote: "La idea es que cada tatuaje tenga fuerza, lectura y carácter propio.",
    stats: [
      { value: "+10", label: "Años de experiencia", tone: "primary" },
      { value: "500+", label: "Diseños personalizados", tone: "secondary" },
      { value: "15+", label: "Reconocimientos", tone: "accent" },
    ],
  },
  layout: {
    imageSide: "left",
  },
  style: {
    background: "card",
    image: "/images/artist/artist-portrait-01.jpg",
  },
}

export const homeSections: HomeSection[] = [
  {
    id: "home-hero",
    type: "hero",
    enabled: true,
    order: 10,
    content: {
      eyebrow: "Desde 1993 • Almagro",
      brandPrimary: "GONZ",
      brandAccent: " TATTOO",
      description: "◾Pro Team support @octopustattoocoloursink",
      primaryButtonLabel: "Ver mis trabajos",
      primaryButtonHref: "/trabajos",
      secondaryButtonLabel: "Diseños",
      secondaryButtonHref: "/disenos",
    },
    layout: {
      imagePositionMode: "rotating-mobile",
    },
    style: {
      backgroundImage: "/images/hero/hero-card.png",
      overlay: "dark",
    },
  },
  {
    id: "home-featured-portfolio",
    type: "featuredPortfolio",
    enabled: true,
    order: 20,
    content: {
      eyebrow: "Trabajos recientes",
      title: "PIEZAS",
      highlightedTitle: "DESTACADAS",
      buttonLabel: "Ver mis trabajos",
      buttonHref: "/trabajos",
    },
    layout: {
      variant: "carousel",
    },
    style: {
      background: "card",
    },
  },
  {
    id: "home-flash-preview",
    type: "flashPreview",
    enabled: true,
    order: 30,
    content: {
      eyebrow: "Listos para tatuar",
      highlightedTitle: "DISEÑOS",
      description: "Diseños clásicos listos para salir. Elegí tu pieza y llevátela en la piel.",
      buttonLabel: "Ver todos los diseños",
      buttonHref: "/disenos",
    },
    layout: {
      columnsDesktop: 3,
      columnsMobile: 2,
    },
    style: {
      background: "default",
      frame: "paper",
    },
  },
  {
    id: "home-about",
    type: "about",
    enabled: true,
    order: 40,
    ...aboutSectionDefaults,
  },
  {
    id: "home-contact-cta",
    type: "contactCta",
    enabled: true,
    order: 50,
    content: {
      eyebrow: "¿Listo para tatuarte?",
      title: "CONSULTÁ TU",
      highlightedTitle: "IDEA",
      description: "Los diseños se pueden consultar directo. Los trabajos personalizados se coordinan por mensaje.",
      whatsappLabel: "WhatsApp",
      instagramLabel: "Instagram",
      hoursLabel: "Horario:",
    },
    layout: {
      alignment: "center",
    },
    style: {
      background: "default",
      divider: "glow",
    },
  },
]

export function getEnabledHomeSections() {
  return homeSections
    .filter((section) => section.enabled)
    .toSorted((firstSection, secondSection) => firstSection.order - secondSection.order)
}

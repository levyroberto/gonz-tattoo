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
  layoutStyle: "centered-overlay"
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
  dateFrom: string
  dateTo: string
  featuredOnly: boolean
  filterStyle: string
  filterTags: string
  itemOrder: number[]
  limit: number
}

export type FeaturedPortfolioSectionLayout = {
  columnsDesktop: number
  variant: "carousel"
  layoutStyle: "carousel" | "grid" | "framed-grid" | "bento-grid" | "wide-grid" | "grunge-gallery"
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
  filterTypes: string
  filterTags: string
  itemOrder: number[]
  limit: number
}

export type FlashPreviewSectionLayout = {
  columnsDesktop: number
  columnsMobile: 2
  layoutStyle: "carousel" | "grid" | "framed-grid" | "bento-grid" | "wide-grid" | "grunge-gallery"
}

export type FlashPreviewSectionStyle = {
  background: "default"
  frame: "paper"
}

export type AboutSectionContent = {
  title: string
  paragraphs: string[]
  quote: string
}

export type AboutSectionLayout = {
  imageSide: "left"
  layoutStyle: "image-left"
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
  layoutStyle: "centered"
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

export type HomeSectionType = HomeSection["type"]

export const aboutSectionDefaults: Pick<AboutHomeSection, "content" | "layout" | "style"> = {
  content: {
    title: "",
    paragraphs: [],
    quote: "",
  },
  layout: {
    imageSide: "left",
    layoutStyle: "image-left",
  },
  style: {
    background: "card",
    image: "",
  },
}

export const homeSections: HomeSection[] = [
  {
    id: "home-hero",
    type: "hero",
    enabled: true,
    order: 10,
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
    layout: {
      imagePositionMode: "rotating-mobile",
      layoutStyle: "centered-overlay",
    },
    style: {
      backgroundImage: "",
      overlay: "dark",
    },
  },
  {
    id: "home-featured-portfolio",
    type: "featuredPortfolio",
    enabled: true,
    order: 20,
    content: {
      eyebrow: "",
      title: "",
      highlightedTitle: "",
      buttonLabel: "",
      buttonHref: "",
      dateFrom: "",
      dateTo: "",
      featuredOnly: true,
      filterStyle: "",
      filterTags: "",
      itemOrder: [],
      limit: 4,
    },
    layout: {
      columnsDesktop: 3,
      variant: "carousel",
      layoutStyle: "carousel",
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
      eyebrow: "",
      highlightedTitle: "",
      description: "",
      buttonLabel: "",
      buttonHref: "",
      filterTypes: "",
      filterTags: "",
      itemOrder: [],
      limit: 6,
    },
    layout: {
      columnsDesktop: 3,
      columnsMobile: 2,
      layoutStyle: "framed-grid",
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
      eyebrow: "",
      title: "",
      highlightedTitle: "",
      description: "",
      whatsappLabel: "",
      instagramLabel: "",
      hoursLabel: "",
    },
    layout: {
      alignment: "center",
      layoutStyle: "centered",
    },
    style: {
      background: "default",
      divider: "glow",
    },
  },
]

export function getHomeSectionsFallback() {
  return [...homeSections].toSorted((firstSection, secondSection) => firstSection.order - secondSection.order)
}

export function getHomeSectionFallback(sectionId: string) {
  return homeSections.find((section) => section.id === sectionId)
}

export function getHomeSectionTemplate(sectionType: HomeSectionType) {
  return homeSections.find((section) => section.type === sectionType)
}

export function getEnabledHomeSections(sections: HomeSection[] = homeSections) {
  return sections
    .filter((section) => section.enabled)
    .toSorted((firstSection, secondSection) => firstSection.order - secondSection.order)
}

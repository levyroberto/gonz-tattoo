export type HomeSectionType =
  | "hero"
  | "featuredPortfolio"
  | "flashPreview"
  | "about"
  | "contactCta"

export type HomeSection = {
  id: string
  type: HomeSectionType
  enabled: boolean
  order: number
  content: Record<string, unknown>
  layout: Record<string, unknown>
  style: Record<string, unknown>
}

export const homeSections: HomeSection[] = [
  {
    id: "home-hero",
    type: "hero",
    enabled: true,
    order: 10,
    content: {},
    layout: {},
    style: {},
  },
  {
    id: "home-featured-portfolio",
    type: "featuredPortfolio",
    enabled: true,
    order: 20,
    content: {},
    layout: {},
    style: {},
  },
  {
    id: "home-flash-preview",
    type: "flashPreview",
    enabled: true,
    order: 30,
    content: {},
    layout: {},
    style: {},
  },
  {
    id: "home-about",
    type: "about",
    enabled: true,
    order: 40,
    content: {},
    layout: {},
    style: {},
  },
  {
    id: "home-contact-cta",
    type: "contactCta",
    enabled: true,
    order: 50,
    content: {},
    layout: {},
    style: {},
  },
]

export function getEnabledHomeSections() {
  return homeSections
    .filter((section) => section.enabled)
    .toSorted((firstSection, secondSection) => firstSection.order - secondSection.order)
}
